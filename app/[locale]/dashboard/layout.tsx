import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { ThemeCustomizer } from "@/components/theme-customizer";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);
  const session = await getSession();

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar locale={currentLocale} dict={dict} user={session} />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DashboardBreadcrumb
              locale={currentLocale}
              appName={dict.common.appName}
              fallback={dict.sidebar.dashboard}
              labels={{
                vendors: dict.sidebar.vendors,
                departments: dict.sidebar.departments,
                locations: dict.sidebar.locations,
                employees: dict.sidebar.employees,
                categories: dict.sidebar.categories,
                maintenanceCategories: dict.sidebar.maintenanceCategories,
                licenses: dict.sidebar.licenses,
                insurances: dict.sidebar.insurances,
                settings: dict.sidebar.settings,
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeCustomizer dict={dict.theme} />
            <ThemeToggle />
            <LanguageToggle currentLocale={currentLocale} />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
