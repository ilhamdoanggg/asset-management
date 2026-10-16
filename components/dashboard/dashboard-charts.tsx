"use client";

import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { TranslationSchema } from "@/locales";
import type { StatusSlice } from "@/types";
import { formatCompactIDR } from "@/lib/format";

interface DashboardChartsProps {
  dict: TranslationSchema;
  categoryData?: Array<{ category: string; count: number }>;
  trendData?: Array<{ month: string; acquisition: number; maintenance: number }>;
  statusData?: StatusSlice[];
  costData?: Array<{ month: string; cost: number }>;
}

export function DashboardCharts({
  dict,
  categoryData: propCategoryData,
  trendData: propTrendData,
  statusData: propStatusData,
  costData: propCostData,
}: DashboardChartsProps) {
  const categoryData = propCategoryData && propCategoryData.length > 0 ? propCategoryData : [
    { category: "Laptop & PC", count: 640 },
    { category: "Server & Net", count: 280 },
    { category: "Kendaraan", count: 195 },
    { category: "Mesin Pabrik", count: 185 },
    { category: "Furnitur", count: 128 },
  ];

  const categoryConfig = {
    count: {
      label: dict.dashboard.totalAssets,
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  const trendData = propTrendData && propTrendData.length > 0 ? propTrendData : [
    { month: "Jan", acquisition: 42, maintenance: 6 },
    { month: "Feb", acquisition: 28, maintenance: 8 },
    { month: "Mar", acquisition: 65, maintenance: 12 },
    { month: "Apr", acquisition: 51, maintenance: 7 },
    { month: "May", acquisition: 82, maintenance: 15 },
    { month: "Jun", acquisition: 74, maintenance: 9 },
  ];

  const trendConfig = {
    acquisition: {
      label: dict.dashboard.acquisitionCost,
      color: "var(--primary)",
    },
    maintenance: {
      label: dict.dashboard.maintenanceCost,
      color: "var(--destructive)",
    },
  } satisfies ChartConfig;

  const statusData = propStatusData ?? [];
  const statusConfig = Object.fromEntries(
    statusData.map((s) => [s.name, { label: s.name, color: s.fill }]),
  ) satisfies ChartConfig;

  const costData = propCostData && propCostData.length > 0 ? propCostData : [
    { month: "Jan", cost: 0 },
    { month: "Feb", cost: 0 },
    { month: "Mar", cost: 0 },
    { month: "Apr", cost: 0 },
    { month: "May", cost: 0 },
    { month: "Jun", cost: 0 },
  ];

  const costConfig = {
    cost: {
      label: dict.dashboard.maintenanceCost,
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Category Distribution Bar Chart */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {dict.dashboard.categoryDistribution}
          </CardTitle>
          <CardDescription>
            {dict.dashboard.categoryDistributionDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={categoryConfig} className="h-64 w-full">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count, var(--primary))"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Trend Area Chart */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {dict.dashboard.monthlyTrend}
          </CardTitle>
          <CardDescription>
            {dict.dashboard.monthlyTrendDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendConfig} className="h-64 w-full">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillAcquisition" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillMaintenance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                type="monotone"
                dataKey="acquisition"
                stroke="var(--primary)"
                fill="url(#fillAcquisition)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="maintenance"
                stroke="var(--destructive)"
                fill="url(#fillMaintenance)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status Mix Donut */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {dict.dashboard.statusDistribution}
          </CardTitle>
          <CardDescription>
            {dict.dashboard.statusDistributionDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            <Empty className="h-64">
              <EmptyHeader>
                <EmptyTitle>{dict.dashboard.emptyAssets}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <ChartContainer config={statusConfig} className="h-64 w-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {statusData.map((s) => (
                    <Cell key={s.name} fill={s.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  verticalAlign="bottom"
                />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Monthly Maintenance Spend Bar Chart */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {dict.dashboard.maintenanceCostTrend}
          </CardTitle>
          <CardDescription>
            {dict.dashboard.maintenanceCostTrendDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={costConfig} className="h-64 w-full">
            <BarChart data={costData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={(v: number) => formatCompactIDR(v)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dashed"
                    formatter={(value) => formatCompactIDR(Number(value))}
                  />
                }
              />
              <Bar
                dataKey="cost"
                fill="var(--color-cost, var(--primary))"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
