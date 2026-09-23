import nodemailer from "nodemailer";
import { describe, expect, it } from "vitest";
import { sendEmail } from "./index";
import { sendViaNodemailer } from "./providers/nodemailer";
import { ResetPasswordEmail } from "./templates/reset-password";
import { VerifyEmail } from "./templates/verify-email";

const transporter = nodemailer.createTransport({ jsonTransport: true });

describe("email templates", () => {
  it.each([
    {
      subject: "Verify your email address",
      template: (
        <VerifyEmail
          name="Test Person"
          verificationUrl="https://example.com/verify"
        />
      ),
    },
    {
      subject: "Reset your password",
      template: (
        <ResetPasswordEmail
          name="Test Person"
          resetUrl="https://example.com/reset"
        />
      ),
    },
  ])("renders and sends $subject", async ({ subject, template }) => {
    const result = await sendViaNodemailer(
      {
        from: "noreply@example.com",
        subject,
        template,
        to: "person@example.com",
      },
      transporter
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBeTypeOf("string");
  });

  it("returns a failure result for invalid email options", async () => {
    const result = await sendEmail({
      react: (
        <ResetPasswordEmail name="Test Person" resetUrl="https://example.com" />
      ),
      subject: "Reset your password",
      to: "not-an-email",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Failed to send email");
  });
});
