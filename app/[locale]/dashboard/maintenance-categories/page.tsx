import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getMaintenanceCategories } from "@/lib/maintenance-categories";
import { MaintenanceCategoriesClient } from "@/components/maintenance-categories/maintenance-categories-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function MaintenanceCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const categories = await getMaintenanceCategories();

  return <MaintenanceCategoriesClient items={categories} dict={dict.maintenanceCategories} />;
}
