import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { LanguageToggle } from "@/components/language-toggle";
import { RegisterForm } from "@/components/auth/register-form";
import { buttonVariants } from "@/components/ui/button";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocalizedRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : DEFAULT_LOCALE;
  const dict = getDictionarySync(locale);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[36rem] w-[36rem] rounded-full bg-primary/10 blur-[100px] opacity-70" />
      </div>

      <div className="absolute top-4 left-4">
        <Link
          href={`/${locale}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ChevronLeft className="size-4 mr-1" />
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
          <div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-muted/40" />
        }
      >
        <RegisterForm dict={dict.auth} locale={locale} />
      </Suspense>
    </div>
  );
}
