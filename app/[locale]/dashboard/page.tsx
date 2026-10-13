import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatAssetValue } from "@/lib/format";
import { getDictionarySync, LOCALES, DEFAULT_LOCALE, type Locale } from "@/locales";
import { getDashboardData } from "@/lib/dashboard";
import {
  AnimatedMetricGrid,
  AnimatedSection,
} from "@/components/dashboard/dashboard-animated";
import { DashboardCharts, type StatusSlice } from "@/components/dashboard/dashboard-charts";
import { RecentAssetsTable } from "@/components/dashboard/recent-assets-table";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
  const dict = getDictionarySync(currentLocale);

  const {
    metrics: dbMetrics,
    categoryDistribution,
    monthlyTrends,
    maintenanceCosts,
    recentAssets,
  } = await getDashboardData();

  const pct = (n: number) =>
    dbMetrics.totalAssets > 0 ? Math.round((n / dbMetrics.totalAssets) * 100) : 0;
  const statusData: StatusSlice[] = [
    { name: `${dict.dashboard.statusActive} · ${pct(dbMetrics.activeAssets)}%`, value: dbMetrics.activeAssets, fill: "var(--primary)" },
    { name: `${dict.dashboard.statusBackup} · ${pct(dbMetrics.backupAssets)}%`, value: dbMetrics.backupAssets, fill: "var(--chart-2)" },
    { name: `${dict.dashboard.statusDamaged} · ${pct(dbMetrics.damagedAssets)}%`, value: dbMetrics.damagedAssets, fill: "var(--destructive)" },
    {
      name: `${dict.dashboard.statusOther} · ${pct(dbMetrics.totalAssets - dbMetrics.activeAssets - dbMetrics.backupAssets - dbMetrics.damagedAssets)}%`,
      value: Math.max(0, dbMetrics.totalAssets - dbMetrics.activeAssets - dbMetrics.backupAssets - dbMetrics.damagedAssets),
      fill: "var(--chart-3)",
    },
  ].filter((s) => s.value > 0);

  const fill = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), template);
  const newThisMonth = monthlyTrends.length > 0 ? monthlyTrends[monthlyTrends.length - 1].acquisition : 0;

  const metrics = [
    {
      title: dict.dashboard.totalAssets,
      value: dbMetrics.totalAssets.toLocaleString("id-ID"),
      description: fill(dict.dashboard.newUnits, { n: newThisMonth }),
      icon: "package",
      badge: `${dbMetrics.totalAssets} Unit`,
      badgeVariant: "secondary" as const,
    },
    {
      title: dict.dashboard.activeAssets,
      value: dbMetrics.activeAssets.toLocaleString("id-ID"),
      description: dict.dashboard.activeAssetsDesc,
      icon: "active",
      badge: `${dbMetrics.activePercentage}%`,
      badgeVariant: "default" as const,
    },
    {
      title: dict.dashboard.backupAssets,
      value: dbMetrics.backupAssets.toLocaleString("id-ID"),
      description: dict.dashboard.backupAssetsDesc,
      icon: "backup",
      badge: `${dbMetrics.backupPercentage}%`,
      badgeVariant: "outline" as const,
    },
    {
      title: dict.dashboard.damagedAssets,
      value: dbMetrics.damagedAssets.toLocaleString("id-ID"),
      description: fill(dict.dashboard.openTickets, { n: dbMetrics.maintenancePending }),
      icon: "damaged",
      badge: `${dbMetrics.damagedPercentage}%`,
      badgeVariant: "destructive" as const,
    },
    {
      title: dict.dashboard.maintenancePending,
      value: dbMetrics.maintenancePending.toLocaleString("id-ID"),
      description: fill(dict.dashboard.needImmediate, { n: dbMetrics.maintenanceCritical }),
      icon: "maintenance",
      badge: dbMetrics.maintenanceCritical > 0 ? `${dbMetrics.maintenanceCritical} ${dict.dashboard.critical}` : dict.dashboard.normal,
      badgeVariant: dbMetrics.maintenanceCritical > 0 ? ("destructive" as const) : ("outline" as const),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">{dict.dashboard.title}</h1>
      {/* Focal hero: portfolio valuation */}
      <AnimatedSection delay={0}>
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground shadow-md">
          <CardContent className="p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-70">
                {dict.dashboard.assetValue}
              </p>
              <p className="mt-1 font-heading text-3xl font-bold tabular-nums tracking-tight md:text-4xl">
                {formatAssetValue(dbMetrics.totalAssetValue)}
              </p>
              <p className="mt-1 text-sm opacity-80">
                {fill(dict.dashboard.headerMeta, {
                  t: dbMetrics.totalAssets,
                  u: dbMetrics.assignedPercentage,
                  n: newThisMonth,
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Metric Cards Grid */}
      <AnimatedMetricGrid metrics={metrics} />

      {/* Charts Section */}
      <AnimatedSection delay={0.15}>
        <DashboardCharts
          dict={dict}
          categoryData={categoryDistribution}
          trendData={monthlyTrends}
          statusData={statusData}
          costData={maintenanceCosts}
        />
      </AnimatedSection>

      {/* Recent Assets Activity Table */}
      <AnimatedSection delay={0.25}>
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {dict.dashboard.recentAssets}
            </CardTitle>
            <CardDescription>
              {dict.dashboard.recentAssetsDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            <RecentAssetsTable assets={recentAssets} dict={dict.dashboard} />
          </CardContent>
      </Card>
      </AnimatedSection>
    </div>
  );
}
