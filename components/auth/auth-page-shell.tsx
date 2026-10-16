import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { LanguageToggle } from "@/components/language-toggle";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary, Locale } from "@/lib/i18n";

interface AuthPageShellProps {
  dict: Dictionary;
  locale: Locale;
  children: React.ReactNode;
}

export function AuthPageShell({ dict, locale, children }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Ambient background: dual glow + dot grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_40%,black,transparent)]" />
        <div className="absolute top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 opacity-70 blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-chart-2/10 blur-[100px]" />
      </div>

      <div className="absolute top-4 left-4">
        <Link
          href={`/${locale}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeft className="mr-1 size-4" />
          <span className="text-xs font-medium">{dict.common.appName}</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeCustomizer dict={dict.theme} />
        <ThemeToggle />
        <LanguageToggle currentLocale={locale} />
      </div>

      <Suspense
        fallback={
          <div className="h-[36rem] w-full max-w-4xl animate-pulse rounded-2xl bg-muted/40" />
        }
      >
        <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl shadow-primary/5 lg:grid-cols-[1fr_1.05fr]">
          <AuthBrandPanel dict={dict.auth} appName={dict.common.appName} />
          <div className="flex items-center justify-center p-4 sm:p-8">
            {children}
          </div>
        </div>
      </Suspense>
    </div>
  );
}
