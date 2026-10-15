import { notFound } from "next/navigation";
import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getAsset } from "@/lib/assets";
import { getCategories } from "@/lib/categories";
import { getVendors } from "@/lib/vendors";
import { getLocations } from "@/lib/locations";
import { AssetForm } from "@/components/assets/asset-form";

export const instant = false;

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const [asset, categories, vendors, locations] = await Promise.all([
    getAsset(id),
    getCategories(),
    getVendors(),
    getLocations(),
  ]);
  if (!asset) notFound();

  return (
    <AssetForm
      mode="edit"
      asset={asset}
      categories={categories.map((c) => ({ id: c.id, name: c.name, code: c.code }))}
      vendors={vendors.map((v) => ({ id: v.id, name: v.name }))}
      locations={locations.map((l) => ({ id: l.id, code: l.code, building: l.building, room: l.room }))}
      dict={dict.assets}
      locale={currentLocale}
    />
  );
}

