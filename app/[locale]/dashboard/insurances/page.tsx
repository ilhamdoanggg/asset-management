import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getInsurancePolicies } from "@/lib/insurances";
import { InsurancesClient } from "@/components/insurances/insurances-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function InsurancesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const policies = await getInsurancePolicies();

  return <InsurancesClient policies={policies} dict={dict.insurances} />;
}
