import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getDepreciationData } from "@/lib/depreciation";
import { getAssets } from "@/lib/assets";
import { getEmployees } from "@/lib/employees";
import { DepreciationClient } from "@/components/depreciation/depreciation-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function DepreciationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const [{ entries, disposals, summary }, assets, employees] = await Promise.all([
    getDepreciationData(),
    getAssets(),
    getEmployees(),
  ]);

  return (
    <DepreciationClient
      entries={entries}
      disposals={disposals}
      summary={summary}
      assets={assets
        .filter((a) => a.status !== "disposed")
        .map((a) => ({ id: a.id, name: a.name, code: a.asset_code }))}
      employees={employees
        .filter((e) => e.status === "active")
        .map((e) => ({ id: e.id, full_name: e.full_name, nip: e.nip }))}
      dict={dict.depreciation}
    />
  );
}
