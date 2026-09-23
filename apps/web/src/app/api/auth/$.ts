import { createFileRoute } from "@tanstack/react-router";

async function handleAuthRequest(request: Request) {
  const { getAuth } = await import("@repo/auth/server");

  return getAuth().handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleAuthRequest(request);
      },
      POST: async ({ request }) => {
        return handleAuthRequest(request);
      },
    },
  },
});
