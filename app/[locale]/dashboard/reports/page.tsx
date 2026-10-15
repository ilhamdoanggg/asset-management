import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getReportsData } from "@/lib/reports";
import { ReportsClient } from "@/components/reports/reports-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const data = await getReportsData();

  return <ReportsClient data={data} dict={dict.reports} />;
}
