import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

const resetPasswordSearchSchema = z.object({
  error: z.string().optional(),
  token: z.string().optional(),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: resetPasswordSearchSchema,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { error, token } = Route.useSearch();

  return (
    <AuthShell>
      <ResetPasswordForm token={error ? undefined : token} />
    </AuthShell>
  );
}
