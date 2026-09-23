import { getDatabase } from "@repo/database";
import * as schema from "@repo/database/schema";
import { sendEmail } from "@repo/email";
import ResetPasswordEmail from "@repo/email/templates/reset-password";
import VerifyEmail from "@repo/email/templates/verify-email";
import { betterAuth, type SocialProviders } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

type SocialProviderAvailability = {
  github: boolean;
  google: boolean;
};

async function sendAuthEmail(options: Parameters<typeof sendEmail>[0]) {
  const result = await sendEmail(options);

  if (!result.success) {
    throw new Error(result.message || "Failed to send authentication email");
  }
}

export function getSocialProviderAvailability(): SocialProviderAvailability {
  return {
    github: Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ),
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ),
  };
}

function getSocialProviders(): SocialProviders {
  const providers: SocialProviders = {};
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (githubClientId && githubClientSecret) {
    providers.github = {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    };
  }

  if (googleClientId && googleClientSecret) {
    providers.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    };
  }

  return providers;
}

function createAuth() {
  const sendEmailVerification =
    process.env.EMAIL_VERIFICATION_ENABLED !== "false";

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail({
          react: ResetPasswordEmail({
            name: user.name,
            resetUrl: url,
          }),
          to: user.email,
          subject: "Reset your password",
        });
      },
    },
    emailVerification: {
      sendOnSignUp: sendEmailVerification,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail({
          react: VerifyEmail({
            name: user.name,
            verificationUrl: url,
          }),
          to: user.email,
          subject: "Verify your email address",
        });
      },
    },
    database: drizzleAdapter(getDatabase(), {
      provider: "pg",
      schema,
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    socialProviders: getSocialProviders(),
    plugins: [tanstackStartCookies()],
  });
}

let auth: ReturnType<typeof createAuth> | undefined;

export function getAuth(): ReturnType<typeof createAuth> {
  auth ??= createAuth();
  return auth;
}
