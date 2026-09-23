import { createAuthClient } from "better-auth/react";

export const {
  requestPasswordReset,
  resetPassword,
  signIn,
  signOut,
  signUp,
  useSession,
} = createAuthClient();
