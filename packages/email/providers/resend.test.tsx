import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getResend: vi.fn(),
  render: vi.fn(),
  send: vi.fn(),
}));

vi.mock("./resend/client", () => ({
  getResend: mocks.getResend,
}));

vi.mock("react-email", () => ({
  render: mocks.render,
}));

import { sendViaResend } from "./resend";

const options = {
  to: "person@example.com",
  from: "sender@example.com",
  subject: "Subject",
  template: createElement("p", null, "Hello"),
};

describe("sendViaResend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.render.mockResolvedValue("<p>Hello</p>");
  });

  it("fails cleanly when the Resend client is unavailable", async () => {
    mocks.getResend.mockReturnValue(null);

    await expect(sendViaResend(options)).resolves.toEqual({
      success: false,
      message: "Resend client is not initialized",
    });
  });

  it("renders and sends an email through Resend", async () => {
    mocks.send.mockResolvedValue({ data: { id: "resend-id" } });
    mocks.getResend.mockReturnValue({ emails: { send: mocks.send } });

    await expect(sendViaResend(options)).resolves.toEqual({
      success: true,
      messageId: "resend-id",
    });
    expect(mocks.send).toHaveBeenCalledWith({
      from: "sender@example.com",
      to: ["person@example.com"],
      subject: "Subject",
      html: "<p>Hello</p>",
      attachments: undefined,
    });
  });

  it("returns a failure result when Resend rejects", async () => {
    mocks.send.mockRejectedValue(new Error("Resend unavailable"));
    mocks.getResend.mockReturnValue({ emails: { send: mocks.send } });

    await expect(sendViaResend(options)).resolves.toEqual({
      success: false,
      message: "Resend unavailable",
    });
  });
});
