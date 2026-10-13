"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Paintbrush, RotateCcw, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  THEME_COLORS,
  THEME_RADII,
  type ThemeColor,
  type ThemeRadius,
} from "@/lib/themes";
import { useThemeColor } from "@/components/theme-provider";
import type { TranslationSchema } from "@/locales";

interface ThemeCustomizerProps {
  dict?: TranslationSchema["theme"];
}

const DEFAULT_LABELS = {
  customize: "Customize Theme",
  color: "Primary Color",
  radius: "Border Radius",
  mode: "Appearance Mode",
  light: "Light",
  dark: "Dark",
  system: "System",
  reset: "Reset",
  preview: "Theme Preview",
  colors: {
    zinc: "Zinc",
    blue: "Blue",
    emerald: "Emerald",
    violet: "Violet",
    rose: "Rose",
    amber: "Amber",
    cyan: "Cyan",
  },
};

export function ThemeCustomizer({ dict = DEFAULT_LABELS }: ThemeCustomizerProps) {
  const {
    themeColor,
    setThemeColor,
    themeRadius,
    setThemeRadius,
    themeMode,
    setThemeMode,
    resetTheme,
  } = useThemeColor();
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label={dict.customize}
            title={dict.customize}
          />
        }
      >
        <Paintbrush className="h-4 w-4" />
        <span className="sr-only">{dict.customize}</span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-4" align="end">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{dict.customize}</span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={resetTheme}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title={dict.reset}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            {dict.reset}
          </Button>
        </div>

        {/* Color Palette Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            {dict.color}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {THEME_COLORS.map((c) => {
              const isActive = themeColor === c.name;
              const colorLabel =
                dict.colors[c.name as keyof typeof dict.colors] || c.label;

              return (
                <button
                  key={c.name}
                  onClick={() => setThemeColor(c.name)}
                  className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: c.swatch }}
                  >
                    {isActive && (
                      <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                    )}
                  </span>
                  <span className="truncate">{colorLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Border Radius Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            {dict.radius}
          </label>
          <div className="grid grid-cols-6 gap-1">
            {THEME_RADII.map((r) => {
              const isActive = themeRadius === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => setThemeRadius(r.value)}
                  className={`rounded-md border py-1 text-center text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.value}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2 pt-1 border-t">
          <label className="text-xs font-medium text-muted-foreground">
            {dict.mode}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <Button
              variant={mounted && theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setThemeMode("light")}
              className="h-8 text-xs gap-1.5"
            >
              <Sun className="h-3.5 w-3.5" />
              {dict.light}
            </Button>
            <Button
              variant={mounted && theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setThemeMode("dark")}
              className="h-8 text-xs gap-1.5"
            >
              <Moon className="h-3.5 w-3.5" />
              {dict.dark}
            </Button>
            <Button
              variant={mounted && theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setThemeMode("system")}
              className="h-8 text-xs gap-1.5"
            >
              <Monitor className="h-3.5 w-3.5" />
              {dict.system}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
