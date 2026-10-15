import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getCategories } from "@/lib/categories";
import { getVendors } from "@/lib/vendors";
import { getLocations } from "@/lib/locations";
import { AssetForm } from "@/components/assets/asset-form";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function NewAssetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const [categories, vendors, locations] = await Promise.all([
    getCategories(),
    getVendors(),
    getLocations(),
  ]);

  return (
    <AssetForm
      mode="create"
      categories={categories.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
      vendors={vendors.map((v) => ({ id: v.id, name: v.name }))}
      locations={locations.map((l) => ({ id: l.id, code: l.code, building: l.building, room: l.room }))}
      dict={dict.assets}
      locale={currentLocale}
    />
  );
}

