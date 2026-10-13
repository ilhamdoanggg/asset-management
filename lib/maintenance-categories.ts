import { sql } from "@/lib/db";

export interface MaintenanceCategory {
  id: string;
  code: string;
  name: string;
  interval_days: number | null;
  is_capitalized: boolean;
  description: string | null;
  usage_count: number;
}

export async function getMaintenanceCategories(): Promise<MaintenanceCategory[]> {
  const rows = await sql<
    Array<{
      id: string;
      code: string;
      name: string;
      interval_days: number | null;
      is_capitalized: boolean;
      description: string | null;
      usage_count: number;
    }>
  >`
    SELECT
      mc.id::text AS id,
      mc.code,
      mc.name,
      mc.default_interval_days AS interval_days,
      mc.is_capitalized,
      mc.description,
      COUNT(am.id)::int AS usage_count
    FROM maintenance_categories mc
    LEFT JOIN asset_maintenances am ON am.category_id = mc.id
    WHERE mc.is_deleted = FALSE
    GROUP BY mc.id, mc.code, mc.name, mc.default_interval_days, mc.is_capitalized, mc.description
    ORDER BY mc.name ASC;
  `;
  return rows.map((r) => ({ ...r, usage_count: Number(r.usage_count) }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const data = await getMaintenanceCategories();
    console.log(JSON.stringify(data, null, 2));
  })();
}
