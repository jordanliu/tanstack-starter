import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { DatabaseSync } from "node:sqlite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new DatabaseSync(":memory:");
let resetToken: string | undefined;

const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database,
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ token }) => {
      resetToken = token;
    },
  },
  logger: { disabled: true },
  secret: "test-secret-that-is-at-least-32-characters-long",
});

describe("password reset", () => {
  beforeAll(async () => {
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
  });

  afterAll(() => {
    database.close();
  });

  it("replaces the old password with the new password", async () => {
    const email = "person@example.com";
    const oldPassword = "old-password-123";
    const newPassword = "new-password-456";

    await auth.api.signUpEmail({
      body: { email, name: "Test Person", password: oldPassword },
    });

    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "http://localhost:3000/reset-password" },
    });

    expect(resetToken).toBeTypeOf("string");

    await auth.api.resetPassword({
      body: { newPassword, token: resetToken },
    });

    await expect(
      auth.api.signInEmail({ body: { email, password: oldPassword } })
    ).rejects.toThrow();

    const result = await auth.api.signInEmail({
      body: { email, password: newPassword },
    });

    expect(result.user.email).toBe(email);
  });
});
