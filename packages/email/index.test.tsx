import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendViaNodemailer: vi.fn(),
  sendViaResend: vi.fn(),
}));

vi.mock("./providers/nodemailer", () => ({
  sendViaNodemailer: mocks.sendViaNodemailer,
}));

vi.mock("./providers/resend", () => ({
  sendViaResend: mocks.sendViaResend,
}));

import { sendEmail } from "./index";

const validEmail = {
  react: createElement("p", null, "Hello"),
  to: "person@example.com",
  subject: "Welcome",
};

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses Resend when an API key is configured", async () => {
    vi.stubEnv("EMAIL_API_KEY", "re_test");
    mocks.sendViaResend.mockResolvedValue({
      success: true,
      messageId: "resend-id",
    });

    await expect(sendEmail(validEmail)).resolves.toEqual({
      success: true,
      messageId: "resend-id",
    });
    expect(mocks.sendViaResend).toHaveBeenCalledOnce();
    expect(mocks.sendViaNodemailer).not.toHaveBeenCalled();
  });

  it("falls back to Nodemailer when no API key is configured", async () => {
    vi.stubEnv("EMAIL_API_KEY", "");
    mocks.sendViaNodemailer.mockResolvedValue({
      success: true,
      messageId: "smtp-id",
    });

    await expect(sendEmail(validEmail)).resolves.toEqual({
      success: true,
      messageId: "smtp-id",
    });
    expect(mocks.sendViaNodemailer).toHaveBeenCalledOnce();
    expect(mocks.sendViaResend).not.toHaveBeenCalled();
  });

  it("returns a failure result for invalid input", async () => {
    await expect(
      sendEmail({ ...validEmail, to: "not-an-email" })
    ).resolves.toMatchObject({
      success: false,
      message: expect.stringContaining("Failed to send email"),
    });
    expect(mocks.sendViaNodemailer).not.toHaveBeenCalled();
    expect(mocks.sendViaResend).not.toHaveBeenCalled();
  });

  it("converts provider rejections into a failure result", async () => {
    vi.stubEnv("EMAIL_API_KEY", "re_test");
    mocks.sendViaResend.mockRejectedValue(new Error("provider unavailable"));

    await expect(sendEmail(validEmail)).resolves.toEqual({
      success: false,
      message: "Failed to send email: provider unavailable",
    });
  });
});
