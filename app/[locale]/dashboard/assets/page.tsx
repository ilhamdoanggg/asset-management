import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getAssets } from "@/lib/assets";
import { getLocations } from "@/lib/locations";
import { getEmployees } from "@/lib/employees";
import { AssetsClient } from "@/components/assets/assets-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const [assets, locations, employees] = await Promise.all([
    getAssets(),
    getLocations(),
    getEmployees(),
  ]);

  return (
    <AssetsClient
      assets={assets}
      locations={locations.map((l) => ({ id: l.id, code: l.code, building: l.building, room: l.room }))}
      employees={employees
        .filter((e) => e.status === "active")
        .map((e) => ({ id: e.id, full_name: e.full_name, nip: e.nip }))}
      dict={dict.assets}
      locale={currentLocale}
    />
  );
}
