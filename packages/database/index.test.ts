import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPool: vi.fn(),
  drizzle: vi.fn((pool: unknown) => ({ pool })),
}));

vi.mock("pg", () => ({
  Pool: class Pool {
    constructor(options: unknown) {
      mocks.createPool(options);
    }
  },
}));

vi.mock("drizzle-orm/node-postgres", () => ({
  drizzle: mocks.drizzle,
}));

describe("getDatabase", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates one lazy database client with the configured URL", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/app");
    const { getDatabase } = await import("./index.js");

    const first = getDatabase();
    const second = getDatabase();

    expect(first).toBe(second);
    expect(mocks.createPool).toHaveBeenCalledOnce();
    expect(mocks.createPool).toHaveBeenCalledWith({
      connectionString: "postgres://user:pass@localhost:5432/app",
    });
    expect(mocks.drizzle).toHaveBeenCalledOnce();
  });

  it("fails clearly before creating a pool when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { getDatabase } = await import("./index.js");

    expect(() => getDatabase()).toThrow(
      "DATABASE_URL is required to connect to the database"
    );
    expect(mocks.createPool).not.toHaveBeenCalled();
    expect(mocks.drizzle).not.toHaveBeenCalled();
  });
});
