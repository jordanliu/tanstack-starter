import { getAuth, getSocialProviderAvailability } from "@repo/auth/server";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();

    return getAuth().api.getSession({
      headers,
    });
  }
);

export const getAvailableSocialProviders = createServerFn({
  method: "GET",
}).handler(() => getSocialProviderAvailability());
