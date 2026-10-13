"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check, Sun, Moon, Monitor, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  THEME_COLORS,
  THEME_RADII,
  type ThemeColor,
  type ThemeRadius,
} from "@/lib/themes";
import { useThemeColor } from "@/components/theme-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import type { TranslationSchema, Locale } from "@/locales";
import { LanguageToggle } from "@/components/language-toggle";

interface SettingsAppearanceProps {
  dict: TranslationSchema["settings"];
  themeDict: TranslationSchema["theme"];
  currentLocale: Locale;
}

export function SettingsAppearance({
  dict,
  themeDict,
  currentLocale,
}: SettingsAppearanceProps) {
  const {
    themeColor,
    setThemeColor,
    themeRadius,
    setThemeRadius,
    themeMode,
    setThemeMode,
    resetTheme,
  } = useThemeColor();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dict.appearance.title}</CardTitle>
          <CardDescription>{dict.appearance.desc}</CardDescription>
        </CardHeader>
        <CardContent className="h-64 animate-pulse rounded bg-muted/30" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{dict.appearance.title}</CardTitle>
          <CardDescription>{dict.appearance.desc}</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetTheme();
            toast.success(dict.appearance.title, themeDict.reset);
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          {themeDict.reset}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accent Color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{dict.appearance.themeColor}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {THEME_COLORS.map((c) => {
              const active = themeColor === c.name;
              const colorLabel =
                themeDict.colors?.[c.name as keyof typeof themeDict.colors] ??
                c.label;
              return (
                <motion.button
                  key={c.name}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setThemeColor(c.name as ThemeColor);
                    toast.success(dict.appearance.title, `${dict.appearance.themeColor}: ${colorLabel}`);
                  }}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-colors hover:bg-muted/50 cursor-pointer ${
                    active
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border"
                  }`}
                >
                  <span
                    className="flex size-4 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: c.swatch }}
                  >
                    {active && <Check className="size-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="truncate">{colorLabel}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Radius */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{dict.appearance.themeRadius}</Label>
          <div className="flex flex-wrap gap-2">
            {THEME_RADII.map((r) => {
              const active = themeRadius === r.value;
              return (
                <motion.button
                  key={r.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setThemeRadius(r.value as ThemeRadius);
                    toast.success(dict.appearance.title, `${dict.appearance.themeRadius}: ${r.label}`);
                  }}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/50 cursor-pointer ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {r.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Theme Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{dict.appearance.themeMode}</Label>
          <div className="grid grid-cols-3 gap-2 sm:w-80">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setThemeMode("light");
                toast.success(dict.appearance.title, `${dict.appearance.themeMode}: ${themeDict.light}`);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-medium transition-colors cursor-pointer ${
                themeMode === "light"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Sun className="size-3.5" />
              {themeDict.light}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setThemeMode("dark");
                toast.success(dict.appearance.title, `${dict.appearance.themeMode}: ${themeDict.dark}`);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-medium transition-colors cursor-pointer ${
                themeMode === "dark"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Moon className="size-3.5" />
              {themeDict.dark}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setThemeMode("system");
                toast.success(dict.appearance.title, `${dict.appearance.themeMode}: ${themeDict.system}`);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-medium transition-colors cursor-pointer ${
                themeMode === "system"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Monitor className="size-3.5" />
              {themeDict.system}
            </motion.button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm font-medium">{dict.appearance.language}</Label>
          <div>
            <LanguageToggle currentLocale={currentLocale} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
