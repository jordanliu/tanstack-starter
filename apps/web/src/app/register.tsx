import { createFileRoute } from "@tanstack/react-router";

import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
