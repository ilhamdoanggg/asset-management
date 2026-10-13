"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setLocaleAction } from "@/app/actions/locale";
import type { Locale } from "@/locales";

export function LanguageToggle({ currentLocale }: { currentLocale: Locale }) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const toggle = () => {
    const nextLocale: Locale = currentLocale === "id" ? "en" : "id";
    startTransition(async () => {
      await setLocaleAction(nextLocale);
      if (pathname) {
        const segments = pathname.split("/");
        if (segments[1] === "id" || segments[1] === "en") {
          segments[1] = nextLocale;
          router.push(segments.join("/") || `/${nextLocale}`);
        } else {
          router.push(`/${nextLocale}${pathname}`);
        }
      } else {
        router.refresh();
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={isPending}
      className="font-mono text-xs uppercase cursor-pointer"
      title="Switch Language / Ganti Bahasa"
    >
      {isPending ? "..." : currentLocale === "id" ? "EN" : "ID"}
    </Button>
  );
}
