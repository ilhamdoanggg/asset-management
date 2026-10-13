import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { ThemePreview } from "@/components/theme-preview";
import { HomeHero } from "@/components/home/home-hero";
import { LanguageToggle } from "@/components/language-toggle";
import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

async function AuthHeader({ locale }: { locale: Locale }) {
  const session = await getSession();
  const dict = getDictionarySync(locale);

  return (
    <div className="flex items-center gap-2.5">
      <ThemeCustomizer dict={dict.theme} />
      <ThemeToggle />
      <LanguageToggle currentLocale={locale} />
      {session ? (
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/dashboard`}
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            {dict.sidebar.dashboard}
          </Link>
          <form action={logoutAction}>
            <Button variant="outline" size="sm" type="submit">
              {dict.common.logout}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/login`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {dict.common.login}
          </Link>
          <Link
            href={`/${locale}/register`}
            className={buttonVariants({ size: "sm" })}
          >
            {dict.common.register}
          </Link>
        </div>
      )}
    </div>
  );
}

async function MainContent({ locale }: { locale: Locale }) {
  const session = await getSession();
  const dict = getDictionarySync(locale);

  if (session) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {dict.home.greeting}, {session.username}!
              </CardTitle>
              <CardDescription>{session.email}</CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {session.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {dict.home.authenticatedDesc}
          </p>
          <div>
            <Link
              href={`/${locale}/dashboard`}
              className={buttonVariants({ variant: "default" })}
            >
              {dict.sidebar.dashboard}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <HomeHero dict={dict.home} locale={locale} />;
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = rawLocale === "en" ? "en" : DEFAULT_LOCALE;
  const dict = getDictionarySync(locale);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">
            Asset Management
          </span>
        </div>
        <Suspense fallback={<ThemeToggle />}>
          <AuthHeader locale={locale} />
        </Suspense>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col items-center justify-center gap-10">
        <Suspense
          fallback={
            <div className="h-48 w-full max-w-md animate-pulse rounded-lg bg-muted" />
          }
        >
          <MainContent locale={locale} />
        </Suspense>

        <ThemePreview dict={dict.theme} />
      </main>
    </div>
  );
}
