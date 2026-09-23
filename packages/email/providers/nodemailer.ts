import nodemailer from "nodemailer";
import { render } from "react-email";
import type { EmailOptions, EmailResult } from "../types";

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

export type EmailTransporter = Pick<
  ReturnType<typeof nodemailer.createTransport>,
  "sendMail"
>;

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    secure:
      process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  });

  return transporter;
}

export async function sendViaNodemailer(
  options: EmailOptions,
  emailTransporter?: EmailTransporter
): Promise<EmailResult> {
  const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (!emailTransporter && missing.length > 0) {
    return {
      success: false,
      message: `Missing required environment variables: ${missing.join(", ")}`,
    };
  }

  try {
    const html = await render(options.template);
    const result = await (emailTransporter ?? getTransporter()).sendMail({
      from: options.from || process.env.EMAIL_FROM || "noreply@example.com",
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html,
      attachments: options.attachments,
    });

    if (process.env.NODE_ENV === "development") {
      const previewUrl = nodemailer.getTestMessageUrl(result);
      if (previewUrl) {
        console.info(`📧 Email preview: ${previewUrl}`);
      }
    }

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
