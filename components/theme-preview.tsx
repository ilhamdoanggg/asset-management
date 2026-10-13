"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { THEME_COLORS, type ThemeColor } from "@/lib/themes";
import { useThemeColor } from "@/components/theme-provider";
import type { TranslationSchema } from "@/locales";
import { Check, Sparkles } from "lucide-react";

interface ThemePreviewProps {
  dict?: TranslationSchema["theme"];
}

export function ThemePreview({ dict }: ThemePreviewProps) {
  const { themeColor, setThemeColor, themeRadius } = useThemeColor();

  return (
    <Card className="w-full shadow-sm border">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">
                {dict?.preview || "Theme & Color Showcase"}
              </CardTitle>
            </div>
            <CardDescription className="mt-1">
              Live preview of components with the active palette (
              <span className="font-semibold text-foreground capitalize">
                {themeColor}
              </span>
              ) and radius (
              <span className="font-semibold text-foreground">
                {themeRadius}rem
              </span>
              ).
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {THEME_COLORS.map((c) => {
              const isActive = themeColor === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setThemeColor(c.name)}
                  className={`h-6 w-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                    isActive ? "ring-2 ring-foreground ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c.swatch }}
                  title={c.label}
                  aria-label={c.label}
                >
                  {isActive && (
                    <Check className="h-3 w-3 text-white stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="buttons" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-sm">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="badges">Badges & Input</TabsTrigger>
            <TabsTrigger value="dialog">Dialog</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-4 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4 pt-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="max-w-xs">
              <Input placeholder="Interactive focused input..." />
            </div>
          </TabsContent>

          <TabsContent value="dialog" className="pt-4">
            <Dialog>
              <DialogTrigger render={<Button>Open Test Dialog</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Themed Dialog</DialogTitle>
                  <DialogDescription>
                    All components, overlays, and radius variables stay in sync with your chosen theme.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between border-t py-3">
        <span>CSS Variables: <code>--primary</code>, <code>--ring</code>, <code>--radius</code></span>
        <span className="capitalize">{themeColor} Palette</span>
      </CardFooter>
    </Card>
  );
}
