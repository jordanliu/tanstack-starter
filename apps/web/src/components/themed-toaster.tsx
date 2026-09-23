import { Toaster } from "@repo/ui/components/sonner";

import { useTheme } from "@/components/theme-provider";

export function ThemedToaster() {
  const { theme } = useTheme();

  return <Toaster theme={theme} />;
}
