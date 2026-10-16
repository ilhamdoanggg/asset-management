import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

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
    <AuthPageShell dict={dict} locale={locale}>
      <RegisterForm dict={dict.auth} locale={locale} />
    </AuthPageShell>
  );
}
