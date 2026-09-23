import { signOut } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@repo/ui/components/card";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/login" });
    }

    return {
      user: session.user,
    };
  },
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            void navigate({ to: "/login" });
          },
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardDescription>
            <img
              className="w-full"
              src="/cat.gif"
              alt="tanstack-starter"
              width={100}
              height={100}
            />
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex-col gap-2">
          <Button
            onClick={handleLogout}
            className="w-full"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
