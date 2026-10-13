"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  AlertCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { loginAction, AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { Dictionary, Locale } from "@/lib/i18n";

const initialState: AuthState = {};

export function LoginForm({
  dict,
  locale = "id",
}: {
  dict: Dictionary["auth"];
  locale?: Locale;
}) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <Card className="w-full border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur-sm sm:rounded-2xl">
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
              {dict.loginTitle}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-muted-foreground">
              {dict.loginDesc}
            </CardDescription>
          </div>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="flex flex-col gap-4">
            {state?.error && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs font-medium">{state.error}</AlertDescription>
              </Alert>
            )}

            <FieldGroup className="space-y-3.5">
              <Field>
                <FieldLabel htmlFor="identifier" className="text-xs font-medium text-foreground/90">
                  {dict.identifierLabel}
                </FieldLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="size-4" />
                  </div>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder={dict.identifierPlaceholder}
                    disabled={isPending}
                    className="pl-9.5 text-sm h-10 border-border/80 focus-visible:ring-primary/20"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-xs font-medium text-foreground/90">
                  {dict.passwordLabel}
                </FieldLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="size-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder={dict.passwordPlaceholder}
                    disabled={isPending}
                    className="pl-9.5 pr-10 text-sm h-10 border-border/80 focus-visible:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <motion.div
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.985 }}
              className="w-full"
            >
              <Button
                type="submit"
                className="w-full h-10 font-medium text-sm cursor-pointer shadow-sm transition-all"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Spinner data-icon="inline-start" className="size-4" />
                    <span>{dict.submittingLogin}</span>
                  </>
                ) : (
                  <>
                    <span>{dict.submitLogin}</span>
                    <ArrowRight className="ml-1 size-4" />
                  </>
                )}
              </Button>
            </motion.div>

            <div className="flex flex-col items-center gap-2 pt-1 text-center">
              <p className="text-xs text-muted-foreground">
                {dict.noAccount}{" "}
                <Link
                  href={`/${locale}/register`}
                  className="font-semibold text-primary hover:underline underline-offset-4"
                >
                  {dict.registerNow}
                </Link>
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/75 pt-2 border-t border-border/40 w-full justify-center">
                <ShieldCheck className="size-3.5 text-primary/80" />
                <span>Protected with enterprise role-based security</span>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
