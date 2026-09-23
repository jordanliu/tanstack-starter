import "@fontsource/geist-mono/index.css";
import "@fontsource/geist-sans/index.css";

import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import appCss from "@repo/ui/globals.css?url";

import { ThemedToaster } from "@/components/themed-toaster";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "tanstack-starter" },
      {
        name: "description",
        content: "A TanStack Start starter with Better Auth and Turborepo.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <Outlet />
          <ThemedToaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
