"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useThemeColor } from "@/components/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme } = useTheme();
  const { setThemeMode } = useThemeColor();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setThemeMode(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
