import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuth: vi.fn(),
  handler: vi.fn(),
}));

vi.mock("./server", () => ({
  getAuth: mocks.getAuth,
}));

import { GET, POST } from "./handlers";

describe("auth request handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuth.mockReturnValue({ handler: mocks.handler });
  });

  it.each([
    ["GET", GET],
    ["POST", POST],
  ])("forwards %s requests to Better Auth", async (method, routeHandler) => {
    const request = new Request("https://example.com/api/auth/session", {
      method,
    });
    const response = new Response(null, { status: 204 });
    mocks.handler.mockResolvedValue(response);

    await expect(routeHandler(request)).resolves.toBe(response);
    expect(mocks.getAuth).toHaveBeenCalledOnce();
    expect(mocks.handler).toHaveBeenCalledWith(request);
  });
});
