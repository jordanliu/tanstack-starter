import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@repo/auth/client";
import { Button, buttonVariants } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine(({ confirmPassword, password }) => password === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token?: string }) {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = ({ password }: ResetPasswordFormData) => {
    if (!token) {
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await resetPassword({
          newPassword: password,
          token,
        });

        if (error) {
          toast.error("Unable to reset password", {
            description: error.message || "The reset link may have expired.",
          });
          return;
        }

        toast.success("Password updated", {
          description: "You can now sign in with your new password.",
        });
        void navigate({ to: "/login", replace: true });
      } catch {
        toast.error("Unable to reset password", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  return (
    <Card className="gap-8 rounded-3xl py-10 shadow-lg [--card-spacing:--spacing(6)] sm:py-12">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset password</CardTitle>
        <CardDescription>
          {token
            ? "Choose a strong new password for your account."
            : "This password reset link is invalid or has expired."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirm-password">
                  Confirm password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </Field>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Updating password..." : "Update password"}
              </Button>
            </FieldGroup>
          </form>
        ) : (
          <Link
            to="/forgot-password"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Request a new reset link
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
