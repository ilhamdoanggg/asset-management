import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { House, LayoutDashboard } from "lucide-react";
import { COOKIES } from "@/lib/constants";
import { getDictionarySync, DEFAULT_LOCALE, type Locale } from "@/locales";
import { buttonVariants } from "@/components/ui/button";
import { NotFoundArt } from "@/components/not-found/not-found-art";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export const instant = false;

async function NotFoundContent() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale: Locale = cookieLocale === "en" ? "en" : DEFAULT_LOCALE;
  const dict = getDictionarySync(locale);

  return (
    <Card
      role="alert"
      aria-live="assertive"
      className="relative z-10 w-full max-w-md overflow-hidden text-center shadow-xl border-border/60 bg-card/80 backdrop-blur-xl"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />

      <CardHeader className="space-y-5 pt-8 pb-4">
        <NotFoundArt />

        <div className="space-y-2">
          <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-widest">
            Error 404
          </Badge>
          <CardTitle className="text-2xl font-bold tracking-tight text-balance md:text-3xl">
            {dict.notFound.title}
          </CardTitle>
          <CardDescription className="px-4 text-sm leading-relaxed">
            {dict.notFound.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="flex flex-col justify-center gap-2 pb-8 pt-2 sm:flex-row">
        <Link
          href={`/${locale}`}
          className={buttonVariants({ variant: "default", size: "lg", className: "gap-2" })}
        >
          <House data-icon="inline-start" />
          {dict.notFound.backHome}
        </Link>
        <Link
          href={`/${locale}/dashboard`}
          className={buttonVariants({ variant: "outline", size: "lg", className: "gap-2" })}
        >
          <LayoutDashboard data-icon="inline-start" />
          {dict.sidebar.dashboard}
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 bg-gradient-to-b from-background via-muted/40 to-background">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" aria-hidden />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none select-none" aria-hidden>
        <Image src="/logo.png" alt="" width={420} height={420} className="size-[26rem] object-contain" priority={false} />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <div className="rounded-full bg-background/60 p-1 backdrop-blur-md border shadow-xs">
          <ThemeToggle />
        </div>
      </div>

      <Suspense
        fallback={
          <Skeleton className="h-72 w-full max-w-md rounded-2xl bg-muted/50 backdrop-blur-md border" />
        }
      >
        <NotFoundContent />
      </Suspense>
    </div>
  );
}
