import { sql } from "@/lib/db";

export interface DashboardMetricSummary {
  totalAssets: number;
  totalAssetValue: number;
  assignedAssets: number;
  assignedPercentage: number;
  activeAssets: number;
  activePercentage: number;
  damagedAssets: number;
  damagedPercentage: number;
  backupAssets: number;
  backupPercentage: number;
  maintenancePending: number;
  maintenanceCritical: number;
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
}

export interface MonthlyTrendItem {
  month: string;
  acquisition: number;
  maintenance: number;
}

export interface MonthlyCostItem {
  month: string;
  cost: number;
}

export interface RecentAssetItem {
  id: string;
  code: string;
  name: string;
  specs: string;
  category: string;
  categoryCode: string;
  assignee: string;
  department: string;
  status: string;
  cost: number;
}

export interface DashboardData {
  metrics: DashboardMetricSummary;
  categoryDistribution: CategoryDistributionItem[];
  monthlyTrends: MonthlyTrendItem[];
  maintenanceCosts: MonthlyCostItem[];
  recentAssets: RecentAssetItem[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    metricsResult,
    maintenanceResult,
    categoryResult,
    trendsResult,
    costResult,
    recentAssetsResult,
  ] = await Promise.all([
    // 1. Core Asset Metrics
    sql<
      Array<{
        total_count: number;
        total_value: string;
        assigned_count: number;
        active_count: number;
        damaged_count: number;
        backup_count: number;
      }>
    >`
      SELECT 
        COUNT(*)::int AS total_count,
        COALESCE(SUM(purchase_cost), 0)::text AS total_value,
        COUNT(*) FILTER (WHERE assigned_to IS NOT NULL OR status IN ('in_use', 'active'))::int AS assigned_count,
        COUNT(*) FILTER (WHERE status IN ('in_use', 'active'))::int AS active_count,
        COUNT(*) FILTER (WHERE status IN ('maintenance', 'damaged', 'broken', 'repair'))::int AS damaged_count,
        COUNT(*) FILTER (WHERE status IN ('available', 'backup', 'spare', 'standby'))::int AS backup_count
      FROM assets;
    `,

    // 2. Pending Maintenances
    sql<
      Array<{
        pending_count: number;
        critical_count: number;
      }>
    >`
      SELECT 
        COUNT(*)::int AS pending_count,
        COUNT(*) FILTER (WHERE cost >= 15000000)::int AS critical_count
      FROM asset_maintenances
      WHERE completed_date IS NULL;
    `,

    // 3. Category Distribution
    sql<
      Array<{
        category: string;
        count: number;
      }>
    >`
      SELECT 
        ac.name AS category,
        COUNT(a.id)::int AS count
      FROM asset_categories ac
      LEFT JOIN assets a ON a.category_id = ac.id
      GROUP BY ac.id, ac.name
      ORDER BY count DESC, ac.name ASC
      LIMIT 5;
    `,

    // 4. Last 6 Months Acquisition & Maintenance Trends
    sql<
      Array<{
        month: string;
        acquisition: number;
        maintenance: number;
      }>
    >`
      WITH months AS (
        SELECT generate_series(
          DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months'),
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        )::date AS m_start
      ),
      acq AS (
        SELECT DATE_TRUNC('month', purchase_date)::date AS m_start, COUNT(*)::int AS cnt
        FROM assets
        WHERE purchase_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY 1
      ),
      mnt AS (
        SELECT DATE_TRUNC('month', scheduled_date)::date AS m_start, COUNT(*)::int AS cnt
        FROM asset_maintenances
        WHERE scheduled_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY 1
      )
      SELECT 
        TO_CHAR(m.m_start, 'Mon') AS month,
        COALESCE(acq.cnt, 0)::int AS acquisition,
        COALESCE(mnt.cnt, 0)::int AS maintenance
      FROM months m
      LEFT JOIN acq ON acq.m_start = m.m_start
      LEFT JOIN mnt ON mnt.m_start = m.m_start
      ORDER BY m.m_start ASC;
    `,

    // 5. Last 6 Months Maintenance Cost (real spend per month)
    sql<
      Array<{
        month: string;
        cost: string;
      }>
    >`
      WITH months AS (
        SELECT generate_series(
          DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months'),
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        )::date AS m_start
      ),
      spend AS (
        SELECT DATE_TRUNC('month', scheduled_date)::date AS m_start, COALESCE(SUM(cost), 0)::text AS total
        FROM asset_maintenances
        WHERE scheduled_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY 1
      )
      SELECT
        TO_CHAR(m.m_start, 'Mon') AS month,
        COALESCE(spend.total, '0') AS cost
      FROM months m
      LEFT JOIN spend ON spend.m_start = m.m_start
      ORDER BY m.m_start ASC;
    `,

    // 6. Recent 5 Assets with Joins
    sql<
      Array<{
        id: number;
        asset_code: string;
        name: string;
        purchase_cost: string;
        status: string;
        category_name: string;
        category_code: string;
        assignee_name: string | null;
        department_name: string | null;
        processor_detail: string | null;
        ram_capacity_gb: number | null;
        storage_detail: string | null;
        specifications: Record<string, unknown> | null;
      }>
    >`
      SELECT 
        a.id,
        a.asset_code,
        a.name,
        a.purchase_cost::text AS purchase_cost,
        a.status,
        ac.name AS category_name,
        ac.code AS category_code,
        e.full_name AS assignee_name,
        d.name AS department_name,
        cs.processor_detail,
        cs.ram_capacity_gb,
        cs.storage_detail,
        a.specifications
      FROM assets a
      JOIN asset_categories ac ON a.category_id = ac.id
      LEFT JOIN employees e ON a.assigned_to = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN computer_specifications cs ON a.id = cs.asset_id
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT 5;
    `,
  ]);

  const totalAssets = Number(metricsResult[0]?.total_count ?? 0);
  const totalAssetValue = Number(metricsResult[0]?.total_value ?? 0);
  const assignedAssets = Number(metricsResult[0]?.assigned_count ?? 0);
  const assignedPercentage =
    totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;

  const activeAssets = Number(metricsResult[0]?.active_count ?? 0);
  const activePercentage =
    totalAssets > 0 ? Math.round((activeAssets / totalAssets) * 100) : 0;

  const damagedAssets = Number(metricsResult[0]?.damaged_count ?? 0);
  const damagedPercentage =
    totalAssets > 0 ? Math.round((damagedAssets / totalAssets) * 100) : 0;

  const backupAssets = Number(metricsResult[0]?.backup_count ?? 0);
  const backupPercentage =
    totalAssets > 0 ? Math.round((backupAssets / totalAssets) * 100) : 0;

  const maintenancePending = Number(maintenanceResult[0]?.pending_count ?? 0);
  const maintenanceCritical = Number(maintenanceResult[0]?.critical_count ?? 0);

  const recentAssets: RecentAssetItem[] = recentAssetsResult.map((row) => {
    let specs = "";
    if (row.processor_detail) {
      specs = [
        row.processor_detail,
        row.ram_capacity_gb ? `${row.ram_capacity_gb}GB RAM` : null,
        row.storage_detail,
      ]
        .filter(Boolean)
        .join(" / ");
    } else if (row.specifications && typeof row.specifications === "object") {
      specs = Object.entries(row.specifications)
        .slice(0, 3)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");
    }

    return {
      id: String(row.id),
      code: row.asset_code,
      name: row.name,
      specs: specs || "-",
      category: row.category_name,
      categoryCode: row.category_code,
      assignee: row.assignee_name || "-",
      department: row.department_name || "-",
      status: row.status,
      cost: Number(row.purchase_cost),
    };
  });

  return {
    metrics: {
      totalAssets,
      totalAssetValue,
      assignedAssets,
      assignedPercentage,
      activeAssets,
      activePercentage,
      damagedAssets,
      damagedPercentage,
      backupAssets,
      backupPercentage,
      maintenancePending,
      maintenanceCritical,
    },
    categoryDistribution: categoryResult.map((c) => ({
      category: c.category,
      count: Number(c.count),
    })),
    monthlyTrends: trendsResult.map((t) => ({
      month: t.month,
      acquisition: Number(t.acquisition),
      maintenance: Number(t.maintenance),
    })),
    maintenanceCosts: costResult.map((t) => ({
      month: t.month,
      cost: Number(t.cost),
    })),
    recentAssets,
  };
}
