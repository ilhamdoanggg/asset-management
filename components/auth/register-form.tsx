"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { registerAction, AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AuthCard } from "@/components/auth/auth-card";
import type { Dictionary, Locale } from "@/lib/i18n";

const initialState: AuthState = {};

const formVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function RegisterForm({
  dict,
  locale = "id",
}: {
  dict: Dictionary["auth"];
  locale?: Locale;
}) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <AuthCard
        title={dict.registerTitle}
        description={dict.registerDesc}
        switchText={dict.hasAccount}
        switchLabel={dict.loginNow}
        switchHref={`/${locale}/login`}
        note={dict.defaultRoleNote}
        bare
      >
        <form action={formAction}>
          <CardContent className="flex flex-col gap-4">
            {state?.error && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 text-destructive">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs font-medium">{state.error}</AlertDescription>
              </Alert>
            )}

            <motion.div variants={formVariants} initial="hidden" animate="show">
              <FieldGroup className="flex flex-col gap-3.5">
                <motion.div variants={fieldVariants}>
                  <Field>
                    <FieldLabel htmlFor="username" className="text-xs font-medium text-foreground/90">
                      {dict.usernameLabel}
                    </FieldLabel>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <User className="size-4" />
                      </div>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        autoComplete="username"
                        placeholder={dict.usernamePlaceholder}
                        disabled={isPending}
                        className="h-10 border-border/80 pl-9.5 text-sm focus-visible:ring-primary/20"
                      />
                    </div>
                  </Field>
                </motion.div>

                <motion.div variants={fieldVariants}>
                  <Field>
                    <FieldLabel htmlFor="email" className="text-xs font-medium text-foreground/90">
                      {dict.emailLabel}
                    </FieldLabel>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <Mail className="size-4" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder={dict.emailPlaceholder}
                        disabled={isPending}
                        className="h-10 border-border/80 pl-9.5 text-sm focus-visible:ring-primary/20"
                      />
                    </div>
                  </Field>
                </motion.div>

                <motion.div variants={fieldVariants}>
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
                        autoComplete="new-password"
                        placeholder={dict.passwordPlaceholder}
                        disabled={isPending}
                        className="h-10 border-border/80 pr-10 pl-9.5 text-sm focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>
                </motion.div>

                <motion.div variants={fieldVariants}>
                  <motion.div
                    whileHover={{ scale: 1.008 }}
                    whileTap={{ scale: 0.985 }}
                    className="pt-1"
                  >
                    <Button
                      type="submit"
                      className="h-10 w-full cursor-pointer text-sm font-medium shadow-sm transition-all"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Spinner data-icon="inline-start" className="size-4" />
                          <span>{dict.submittingRegister}</span>
                        </>
                      ) : (
                        <>
                          <span>{dict.submitRegister}</span>
                          <ArrowRight className="ml-1 size-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </FieldGroup>
            </motion.div>
          </CardContent>
        </form>
      </AuthCard>
    </motion.div>
  );
}
