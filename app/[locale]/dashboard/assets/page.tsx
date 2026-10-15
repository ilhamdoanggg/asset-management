import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getAssets } from "@/lib/assets";
import { getCategories } from "@/lib/categories";
import { getVendors } from "@/lib/vendors";
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

  const [assets, categories, vendors, locations, employees] = await Promise.all([
    getAssets(),
    getCategories(),
    getVendors(),
    getLocations(),
    getEmployees(),
  ]);

  return (
    <AssetsClient
      assets={assets}
      categories={categories.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
      vendors={vendors.map((v) => ({ id: v.id, name: v.name }))}
      locations={locations.map((l) => ({ id: l.id, code: l.code, building: l.building, room: l.room }))}
      employees={employees
        .filter((e) => e.status === "active")
        .map((e) => ({ id: e.id, full_name: e.full_name, nip: e.nip }))}
      dict={dict.assets}
    />
  );
}
