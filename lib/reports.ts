import { sql } from "@/lib/db";
import type {
  ActivityLogReportItem,
  CategoryValuationReportItem,
  ComputerInventoryReportItem,
  ReportsData,
} from "@/types";


export async function getReportsData(): Promise<ReportsData> {
  const [computersResult, categoriesResult, historyResult, totalsResult] =
    await Promise.all([
      sql<
        Array<
          Omit<ComputerInventoryReportItem, "ip_address"> & {
            ip_address: string | null;
          }
        >
      >`
        SELECT
          asset_id::text,
          department_name,
          ip_address::text,
          asset_code,
          computer_name,
          user_name,
          ms_office_version,
          os_name,
          processor_detail,
          ram_capacity_gb,
          storage_detail,
          asset_status,
          current_room
        FROM v_computer_inventory
        ORDER BY asset_code ASC;
      `,
      sql<
        Array<{
          name: string;
          code: string;
          asset_count: number;
          total_cost: string;
        }>
      >`
        SELECT
          ac.name,
          ac.code,
          COUNT(a.id)::int AS asset_count,
          COALESCE(SUM(a.purchase_cost), 0)::text AS total_cost
        FROM asset_categories ac
        LEFT JOIN assets a ON a.category_id = ac.id AND a.is_deleted = FALSE
        WHERE ac.is_deleted = FALSE
        GROUP BY ac.id, ac.name, ac.code
        ORDER BY total_cost DESC;
      `,
      sql<
        Array<{
          history_id: string;
          action_type: string;
          asset_code: string;
          asset_name: string;
          actor_name: string | null;
          activity_summary: string | null;
          notes: string | null;
          event_timestamp: string;
        }>
      >`
        SELECT
          history_id::text,
          action_type,
          asset_code,
          asset_name,
          actor_name,
          activity_summary,
          notes,
          event_timestamp::text
        FROM v_asset_history_timeline
        ORDER BY event_timestamp DESC
        LIMIT 100;
      `,
      sql<
        Array<{
          total_assets: number;
          total_valuation: string;
        }>
      >`
        SELECT
          COUNT(*)::int AS total_assets,
          COALESCE(SUM(purchase_cost), 0)::text AS total_valuation
        FROM assets
        WHERE is_deleted = FALSE;
      `,
    ]);

  const computers: ComputerInventoryReportItem[] = computersResult.map((c) => ({
    ...c,
    ip_address: c.ip_address ?? null,
  }));

  const categoryValuations: CategoryValuationReportItem[] =
    categoriesResult.map((cat) => ({
      category_name: cat.name,
      category_code: cat.code,
      asset_count: Number(cat.asset_count ?? 0),
      total_purchase_cost: Number(cat.total_cost ?? 0),
    }));

  const recentHistory: ActivityLogReportItem[] = historyResult.map((h) => ({
    id: h.history_id,
    action_type: h.action_type,
    asset_code: h.asset_code,
    asset_name: h.asset_name,
    actor_name: h.actor_name,
    activity_summary: h.activity_summary,
    notes: h.notes,
    event_timestamp: h.event_timestamp,
  }));

  const totalAssets = Number(totalsResult[0]?.total_assets ?? 0);
  const totalValuation = Number(totalsResult[0]?.total_valuation ?? 0);

  return {
    computers,
    categoryValuations,
    recentHistory,
    metrics: {
      totalComputers: computers.length,
      totalAssets,
      totalValuation,
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getReportsData === "function", "getReportsData missing");
  console.log("reports lib self-check ok");
}
