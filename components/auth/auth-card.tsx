import Image from "next/image";
import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description: string;
  switchText: string;
  switchLabel: string;
  switchHref: string;
  note: string;
  children: React.ReactNode;
  /** render without Card chrome (for split-screen layouts) */
  bare?: boolean;
}

export function AuthCard({
  title,
  description,
  switchText,
  switchLabel,
  switchHref,
  note,
  children,
  bare = false,
}: AuthCardProps) {
  if (bare) {
    return (
      <div className="flex w-full flex-col">
        <CardHeader className="flex flex-col gap-2 px-1 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>

        {children}

        <div className="flex flex-col items-center gap-2 px-1 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {switchText}{" "}
            <Link
              href={switchHref}
              className="font-semibold text-primary hover:underline underline-offset-4"
            >
              {switchLabel}
            </Link>
          </p>

          <div className="flex w-full items-center justify-center gap-1.5 border-t border-border/40 pt-2 text-[11px] text-muted-foreground/75">
            <ShieldCheck className="size-3.5 text-primary/80" />
            <span>{note}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full overflow-hidden border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur-sm sm:rounded-2xl">
      <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
      <CardHeader className="flex flex-col gap-2 pb-6 text-center sm:text-left">
        <div className="flex items-center justify-between">
          <div className="flex size-11 items-center justify-center rounded-xl border border-border/70 bg-background/80 p-2 shadow-xs ring-1 ring-primary/10">
            <Image
              src="/logo.png"
              alt="Kenertec"
              width={36}
              height={36}
              className="size-full object-contain"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            <Sparkles className="size-3" />
            <span>Kenertec</span>
          </div>
        </div>

        <div className="pt-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      {children}

      <CardFooter className="flex flex-col items-center gap-2 pt-1 text-center">
        <p className="text-xs text-muted-foreground">
          {switchText}{" "}
          <Link
            href={switchHref}
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            {switchLabel}
          </Link>
        </p>

        <div className="flex w-full items-center justify-center gap-1.5 border-t border-border/40 pt-2 text-[11px] text-muted-foreground/75">
          <ShieldCheck className="size-3.5 text-primary/80" />
          <span>{note}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
