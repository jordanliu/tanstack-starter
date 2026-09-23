import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTransport: vi.fn(),
  getTestMessageUrl: vi.fn(),
  render: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mocks.createTransport,
    getTestMessageUrl: mocks.getTestMessageUrl,
  },
}));

vi.mock("react-email", () => ({
  render: mocks.render,
}));

import { sendViaNodemailer } from "./nodemailer";

const options = {
  to: ["one@example.com", "two@example.com"],
  subject: "Subject",
  template: createElement("p", null, "Hello"),
};

describe("sendViaNodemailer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_USER", "smtp-user");
    vi.stubEnv("SMTP_PASS", "smtp-pass");
    vi.stubEnv("SMTP_SECURE", "false");
    mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail });
    mocks.render.mockResolvedValue("<p>Hello</p>");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports every missing SMTP setting without creating a client", async () => {
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_PASS", "");

    await expect(sendViaNodemailer(options)).resolves.toEqual({
      success: false,
      message: "Missing required environment variables: SMTP_HOST, SMTP_PASS",
    });
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("renders and sends an email through the configured SMTP server", async () => {
    mocks.sendMail.mockResolvedValue({ messageId: "smtp-id" });

    await expect(sendViaNodemailer(options)).resolves.toEqual({
      success: true,
      messageId: "smtp-id",
    });
    expect(mocks.createTransport).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 587,
      auth: { user: "smtp-user", pass: "smtp-pass" },
      secure: false,
    });
    expect(mocks.sendMail).toHaveBeenCalledWith({
      from: "noreply@example.com",
      to: "one@example.com, two@example.com",
      subject: "Subject",
      html: "<p>Hello</p>",
      attachments: undefined,
    });
  });

  it("enables implicit TLS for port 465", async () => {
    vi.resetModules();
    vi.stubEnv("SMTP_PORT", "465");
    mocks.sendMail.mockResolvedValue({ messageId: "smtp-id" });

    const { sendViaNodemailer: sendWithTls } = await import("./nodemailer.js");
    await sendWithTls(options);

    expect(mocks.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: true })
    );
  });

  it("returns a failure result when the SMTP client rejects", async () => {
    mocks.sendMail.mockRejectedValue("SMTP unavailable");

    await expect(sendViaNodemailer(options)).resolves.toEqual({
      success: false,
      message: "Unknown email error",
    });
  });
});
