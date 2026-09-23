import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@repo/auth/client";
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
import { Link } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = ({ email }: ForgotPasswordFormData) => {
    startTransition(async () => {
      try {
        const { error } = await requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          toast.error("Unable to request a password reset", {
            description: error.message || "Please try again.",
          });
          return;
        }

        setSubmittedEmail(email);
      } catch {
        toast.error("Unable to request a password reset", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  };

  return (
    <Card className="gap-8 rounded-3xl py-10 shadow-lg [--card-spacing:--spacing(6)] sm:py-12">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot password</CardTitle>
        <CardDescription>
          {submittedEmail
            ? `If an account exists for ${submittedEmail}, a reset link is on its way.`
            : "Enter your email address and we’ll send you a reset link."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submittedEmail ? (
          <Link
            to="/login"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Back to login
          </Link>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Sending reset link..." : "Send reset link"}
              </Button>
              <Link to="/login" className={buttonVariants({ variant: "link" })}>
                Back to login
              </Link>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
