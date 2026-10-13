import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getEmployees } from "@/lib/employees";
import { getDepartments } from "@/lib/departments";
import { EmployeesClient } from "@/components/employees/employees-client";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const [employees, departments] = await Promise.all([getEmployees(), getDepartments()]);

  return (
    <EmployeesClient
      employees={employees}
      departments={departments.map((d) => ({ id: d.id, name: d.name, code: d.code }))}
      dict={dict.employees}
    />
  );
}
