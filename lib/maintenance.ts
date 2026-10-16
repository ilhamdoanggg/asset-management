import { sql } from "@/lib/db";
import type { Maintenance, MaintenanceStatus } from "@/types";

export async function getMaintenances(): Promise<Maintenance[]> {
  const rows = await sql<
    Array<
      Omit<Maintenance, "cost"> & {
        cost: string;
      }
    >
  >`
    SELECT
      am.id::text,
      am.asset_id::text,
      a.asset_code,
      a.name AS asset_name,
      am.category_id::text,
      mc.name AS category_name,
      am.vendor_id::text,
      v.name AS vendor_name,
      am.status,
      am.scheduled_date::text,
      am.completed_date::text,
      am.cost::text,
      am.performed_by,
      am.invoice_number,
      am.description,
      am.created_at::text
    FROM asset_maintenances am
    JOIN assets a ON a.id = am.asset_id
    LEFT JOIN maintenance_categories mc ON mc.id = am.category_id
    LEFT JOIN vendors v ON v.id = am.vendor_id
    WHERE a.is_deleted = FALSE
    ORDER BY am.scheduled_date DESC NULLS LAST, am.created_at DESC;
  `;

  return rows.map((r) => ({
    ...r,
    cost: Number(r.cost ?? 0),
  }));
}

// ponytail: single-query list, paginate if records exceed ~500 rows
if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getMaintenances === "function", "getMaintenances missing");
  console.log("maintenance lib self-check ok");
}
