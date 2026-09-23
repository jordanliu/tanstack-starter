import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type AuthConfig = {
  baseURL?: string;
  secret?: string;
  emailAndPassword: {
    enabled: boolean;
    revokeSessionsOnPasswordReset: boolean;
    sendResetPassword(input: {
      user: { name: string; email: string };
      url: string;
    }): Promise<void>;
  };
  emailVerification: {
    sendOnSignUp: boolean;
    sendVerificationEmail(input: {
      user: { name: string; email: string };
      url: string;
    }): Promise<void>;
  };
  session: { cookieCache: { enabled: boolean; maxAge: number } };
  socialProviders: Record<string, unknown>;
  plugins: unknown[];
};

const mocks = vi.hoisted(() => ({
  betterAuth: vi.fn((config: AuthConfig) => ({ config, handler: vi.fn() })),
  database: { name: "database" },
  drizzleAdapter: vi.fn(() => ({ name: "adapter" })),
  getDatabase: vi.fn(),
  plugin: { name: "tanstack-cookies" },
  resetPassword: vi.fn((props: unknown) => ({ props })),
  sendEmail: vi.fn(),
  tanstackStartCookies: vi.fn(),
  verifyEmail: vi.fn((props: unknown) => ({ props })),
}));

vi.mock("@repo/database", () => ({
  getDatabase: mocks.getDatabase,
}));

vi.mock("@repo/database/schema", () => ({
  user: { name: "user-table" },
}));

vi.mock("@repo/email", () => ({
  sendEmail: mocks.sendEmail,
}));

vi.mock("@repo/email/templates/verify-email", () => ({
  default: mocks.verifyEmail,
}));

vi.mock("@repo/email/templates/reset-password", () => ({
  default: mocks.resetPassword,
}));

vi.mock("better-auth", () => ({
  betterAuth: mocks.betterAuth,
}));

vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: mocks.drizzleAdapter,
}));

vi.mock("better-auth/tanstack-start", () => ({
  tanstackStartCookies: mocks.tanstackStartCookies,
}));

async function loadConfig() {
  const { getAuth } = await import("./server.js");
  const auth = getAuth();
  const config = mocks.betterAuth.mock.calls[0]?.[0];

  if (!config) {
    throw new Error("Better Auth was not configured");
  }

  return { auth, config, getAuth };
}

describe("getAuth", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("BETTER_AUTH_SECRET", "test-secret");
    vi.stubEnv("BETTER_AUTH_URL", "https://example.com");
    mocks.getDatabase.mockReturnValue(mocks.database);
    mocks.tanstackStartCookies.mockReturnValue(mocks.plugin);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates and caches the production auth configuration", async () => {
    const { auth, config, getAuth } = await loadConfig();

    expect(getAuth()).toBe(auth);
    expect(mocks.betterAuth).toHaveBeenCalledOnce();
    expect(config.baseURL).toBe("https://example.com");
    expect(config.secret).toBe("test-secret");
    expect(config.emailAndPassword.enabled).toBe(true);
    expect(config.emailAndPassword.revokeSessionsOnPasswordReset).toBe(true);
    expect(config.emailVerification.sendOnSignUp).toBe(true);
    expect(config.session.cookieCache).toEqual({
      enabled: true,
      maxAge: 300,
    });
    expect(config.plugins).toEqual([mocks.plugin]);
    expect(config.socialProviders).toEqual({});
    expect(mocks.drizzleAdapter).toHaveBeenCalledWith(mocks.database, {
      provider: "pg",
      schema: expect.objectContaining({ user: { name: "user-table" } }),
    });
  });

  it("allows verification email delivery to be disabled explicitly", async () => {
    vi.stubEnv("EMAIL_VERIFICATION_ENABLED", "false");

    const { config } = await loadConfig();

    expect(config.emailVerification.sendOnSignUp).toBe(false);
  });

  it("renders and sends verification email", async () => {
    mocks.sendEmail.mockResolvedValue({
      success: true,
      messageId: "email-id",
    });
    const { config } = await loadConfig();

    await config.emailVerification.sendVerificationEmail({
      user: { name: "Jordan", email: "jordan@example.com" },
      url: "https://example.com/verify/token",
    });

    expect(mocks.verifyEmail).toHaveBeenCalledWith({
      name: "Jordan",
      verificationUrl: "https://example.com/verify/token",
    });
    expect(mocks.sendEmail).toHaveBeenCalledWith({
      react: {
        props: {
          name: "Jordan",
          verificationUrl: "https://example.com/verify/token",
        },
      },
      to: "jordan@example.com",
      subject: "Verify your email address",
    });
  });

  it("renders and sends password reset email", async () => {
    mocks.sendEmail.mockResolvedValue({
      success: true,
      messageId: "email-id",
    });
    const { config } = await loadConfig();

    await config.emailAndPassword.sendResetPassword({
      user: { name: "Jordan", email: "jordan@example.com" },
      url: "https://example.com/reset/token",
    });

    expect(mocks.resetPassword).toHaveBeenCalledWith({
      name: "Jordan",
      resetUrl: "https://example.com/reset/token",
    });
    expect(mocks.sendEmail).toHaveBeenCalledWith({
      react: {
        props: {
          name: "Jordan",
          resetUrl: "https://example.com/reset/token",
        },
      },
      to: "jordan@example.com",
      subject: "Reset your password",
    });
  });

  it("configures only complete social provider credentials", async () => {
    vi.stubEnv("GITHUB_CLIENT_ID", "github-id");
    vi.stubEnv("GITHUB_CLIENT_SECRET", "github-secret");
    vi.stubEnv("GOOGLE_CLIENT_ID", "google-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");

    const { config } = await loadConfig();

    expect(config.socialProviders).toEqual({
      github: {
        clientId: "github-id",
        clientSecret: "github-secret",
      },
    });
  });

  it("rejects signup when verification email delivery fails", async () => {
    mocks.sendEmail.mockResolvedValue({
      success: false,
      message: "Email provider unavailable",
    });
    const { config } = await loadConfig();

    await expect(
      config.emailVerification.sendVerificationEmail({
        user: { name: "Jordan", email: "jordan@example.com" },
        url: "https://example.com/verify/token",
      })
    ).rejects.toThrow("Email provider unavailable");
  });
});
