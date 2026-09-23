import { createFileRoute } from "@tanstack/react-router";

import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getAvailableSocialProviders } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  loader: () => getAvailableSocialProviders(),
  component: LoginPage,
});

function LoginPage() {
  const socialProviders = Route.useLoaderData();

  return (
    <AuthShell>
      <LoginForm socialProviders={socialProviders} />
    </AuthShell>
  );
}
