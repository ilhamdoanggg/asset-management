"use client";

import * as React from "react";
import { changePasswordAction, type SettingsActionResult } from "@/app/actions/settings";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { TranslationSchema } from "@/locales";

interface SettingsSecurityFormProps {
  dict: TranslationSchema["settings"]["security"];
}

export function SettingsSecurityForm({ dict }: SettingsSecurityFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, setState] = React.useState<SettingsActionResult | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const promise = new Promise<SettingsActionResult>((resolve, reject) => {
      startTransition(async () => {
        try {
          const res = await changePasswordAction(null, formData);
          setState(res);
          if (res.error) {
            reject(new Error(res.error));
          } else {
            formRef.current?.reset();
            resolve(res);
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Terjadi kesalahan sistem";
          setState({ error: message });
          reject(new Error(message));
        }
      });
    });

    toast.promise(promise, {
      loading: {
        title: dict.changingPasswordBtn || "Memperbarui...",
        description: "Memverifikasi dan memperbarui password...",
      },
      success: {
        title: "Password Diperbarui",
        description: dict.passwordSuccess,
      },
      error: (err: unknown) => ({
        title: "Gagal Memperbarui",
        description:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memperbarui password.",
      }),
    });
  };

  return (
    <Card>
      <form ref={formRef} onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{dict.title}</CardTitle>
          <CardDescription>{dict.desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          {state?.error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{state.error}</AlertDescription>
            </Alert>
          )}

          {state?.success && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 py-2.5">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-xs">{dict.passwordSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">{dict.currentPassword}</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{dict.newPassword}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{dict.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner className="mr-2 size-4" />}
            {isPending ? dict.changingPasswordBtn : dict.changePasswordBtn}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
