import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getMaintenances } from "@/lib/maintenance";
import { getAssets } from "@/lib/assets";
import { getMaintenanceCategories } from "@/lib/maintenance-categories";
import { getVendors } from "@/lib/vendors";
import { MaintenanceClient } from "@/components/maintenance/maintenance-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const [maintenances, assets, categories, vendors] = await Promise.all([
    getMaintenances(),
    getAssets(),
    getMaintenanceCategories(),
    getVendors(),
  ]);

  return (
    <MaintenanceClient
      maintenances={maintenances}
      assets={assets.map((a) => ({ id: a.id, name: a.name, code: a.asset_code }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      vendors={vendors.map((v) => ({ id: v.id, name: v.name }))}
      dict={dict.maintenance}
    />
  );
}
