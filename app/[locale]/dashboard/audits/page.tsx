import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getAudits } from "@/lib/audits";
import { getEmployees } from "@/lib/employees";
import { getLocations } from "@/lib/locations";
import { AuditsClient } from "@/components/audits/audits-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function AuditsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const [audits, employees, locations] = await Promise.all([
    getAudits(),
    getEmployees(),
    getLocations(),
  ]);

  return (
    <AuditsClient
      audits={audits}
      auditors={employees
        .filter((e) => e.status === "active")
        .map((e) => ({ id: e.id, name: e.full_name, nip: e.nip }))}
      locations={locations.map((l) => ({
        id: l.id,
        room_name: l.room,
        building_name: l.building,
      }))}
      dict={dict.audits}
    />
  );
}
