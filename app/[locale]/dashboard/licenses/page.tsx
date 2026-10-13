import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getSoftwareLicenses } from "@/lib/licenses";
import { getVendors } from "@/lib/vendors";
import { LicensesClient } from "@/components/licenses/licenses-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LicensesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const [licenses, vendors] = await Promise.all([getSoftwareLicenses(), getVendors()]);

  return (
    <LicensesClient
      licenses={licenses}
      vendors={vendors.map((v) => ({ id: v.id, name: v.name }))}
      dict={dict.licenses}
    />
  );
}
