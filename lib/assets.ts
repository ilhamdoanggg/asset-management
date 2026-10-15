import { sql } from "@/lib/db";

export type AssetStatus =
  | "available"
  | "in_use"
  | "maintenance"
  | "damaged"
  | "disposed"
  | "backup"
  | "reserved";

export interface Asset {
  id: string;
  asset_code: string;
  barcode: string | null;
  serial_number: string | null;
  name: string;
  brand: string | null;
  model: string | null;
  category_id: string;
  category_name: string;
  category_code: string;
  vendor_id: string | null;
  vendor_name: string | null;
  location_id: string | null;
  location_label: string | null;
  assigned_to: string | null;
  assignee_name: string | null;
  department_name: string | null;
  status: string;
  condition: string;
  purchase_date: string;
  purchase_cost: number;
  warranty_expiry: string | null;
  depreciation_method: string | null;
  useful_life_years: number | null;
  salvage_value: number | null;
  notes: string | null;
  specifications: Record<string, unknown> | null;
  computer_name: string | null;
  ip_address: string | null;
  os_name: string | null;
  processor_detail: string | null;
  ram_capacity_gb: number | null;
  storage_detail: string | null;
  created_at: string;
}

export interface AssetHistoryItem {
  history_id: string;
  event_timestamp: string;
  action_type: string;
  old_status: string | null;
  new_status: string | null;
  old_employee_name: string | null;
  new_employee_name: string | null;
  old_location_full: string | null;
  new_location_full: string | null;
  actor_name: string | null;
  notes: string | null;
  activity_summary: string | null;
}

export async function getAssets(): Promise<Asset[]> {
  const rows = await sql<Array<Omit<Asset, "purchase_cost" | "salvage_value"> & { purchase_cost: string; salvage_value: string | null }>>`
    SELECT a.id::text, a.asset_code, a.barcode, a.serial_number, a.name,
           a.brand, a.model,
           a.category_id::text, ac.name AS category_name, ac.code AS category_code,
           a.vendor_id::text, v.name AS vendor_name,
           a.location_id::text,
           CASE WHEN l.id IS NOT NULL
             THEN CONCAT_WS(' - ', l.building, NULLIF(l.floor, ''), l.room)
             ELSE NULL END AS location_label,
           a.assigned_to::text, e.full_name AS assignee_name, d.name AS department_name,
           a.status, a.condition,
           a.purchase_date::text, a.purchase_cost::text,
           a.warranty_expiry::text,
           a.depreciation_method, a.useful_life_years, a.salvage_value::text,
           a.notes, a.specifications,
           cs.computer_name, cs.ip_address::text, cs.os_name,
           cs.processor_detail, cs.ram_capacity_gb, cs.storage_detail,
           a.created_at::text
    FROM assets a
    JOIN asset_categories ac ON ac.id = a.category_id
    LEFT JOIN vendors v ON v.id = a.vendor_id
    LEFT JOIN locations l ON l.id = a.location_id
    LEFT JOIN employees e ON e.id = a.assigned_to
    LEFT JOIN departments d ON d.id = e.department_id
    LEFT JOIN computer_specifications cs ON cs.asset_id = a.id
    WHERE a.is_deleted = FALSE
    ORDER BY a.created_at DESC, a.asset_code ASC;
  `;
  return rows.map((r) => ({
    ...r,
    purchase_cost: Number(r.purchase_cost ?? 0),
    salvage_value: r.salvage_value == null ? null : Number(r.salvage_value),
  }));
}

export async function getAsset(id: string): Promise<Asset | null> {
  const rows = await sql<Array<Omit<Asset, "purchase_cost" | "salvage_value"> & { purchase_cost: string; salvage_value: string | null }>>`
    SELECT a.id::text, a.asset_code, a.barcode, a.serial_number, a.name,
           a.brand, a.model,
           a.category_id::text, ac.name AS category_name, ac.code AS category_code,
           a.vendor_id::text, v.name AS vendor_name,
           a.location_id::text,
           CASE WHEN l.id IS NOT NULL
             THEN CONCAT_WS(' - ', l.building, NULLIF(l.floor, ''), l.room)
             ELSE NULL END AS location_label,
           a.assigned_to::text, e.full_name AS assignee_name, d.name AS department_name,
           a.status, a.condition,
           a.purchase_date::text, a.purchase_cost::text,
           a.warranty_expiry::text,
           a.depreciation_method, a.useful_life_years, a.salvage_value::text,
           a.notes, a.specifications,
           cs.computer_name, cs.ip_address::text, cs.os_name,
           cs.processor_detail, cs.ram_capacity_gb, cs.storage_detail,
           a.created_at::text
    FROM assets a
    JOIN asset_categories ac ON ac.id = a.category_id
    LEFT JOIN vendors v ON v.id = a.vendor_id
    LEFT JOIN locations l ON l.id = a.location_id
    LEFT JOIN employees e ON e.id = a.assigned_to
    LEFT JOIN departments d ON d.id = e.department_id
    LEFT JOIN computer_specifications cs ON cs.asset_id = a.id
    WHERE a.id = ${id} AND a.is_deleted = FALSE
    LIMIT 1;
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    purchase_cost: Number(row.purchase_cost ?? 0),
    salvage_value: row.salvage_value == null ? null : Number(row.salvage_value),
  };
}

export async function getAssetHistory(assetId: string): Promise<AssetHistoryItem[]> {
  const rows = await sql<Array<AssetHistoryItem>>`
    SELECT h.id::text AS history_id, h.created_at::text AS event_timestamp,
           h.action_type,
           h.old_status, h.new_status,
           emp_old.full_name AS old_employee_name,
           emp_new.full_name AS new_employee_name,
           CASE WHEN loc_old.id IS NOT NULL
             THEN CONCAT_WS(' - ', loc_old.building, NULLIF(loc_old.floor, ''), loc_old.room)
             ELSE NULL END AS old_location_full,
           CASE WHEN loc_new.id IS NOT NULL
             THEN CONCAT_WS(' - ', loc_new.building, NULLIF(loc_new.floor, ''), loc_new.room)
             ELSE NULL END AS new_location_full,
           COALESCE(u_actor.username, actor.full_name) AS actor_name,
           h.notes,
           CASE h.action_type
             WHEN 'CREATED' THEN 'Aset pertama kali didaftarkan ke sistem'
             WHEN 'ASSIGNED' THEN CONCAT('Aset diserahkan kepada ', COALESCE(emp_new.full_name, 'karyawan'))
             WHEN 'RETURNED' THEN CONCAT('Aset dikembalikan oleh ', COALESCE(emp_old.full_name, 'karyawan'))
             WHEN 'RELOCATED' THEN 'Aset dipindahkan lokasi'
             WHEN 'STATUS_CHANGED' THEN CONCAT('Status diubah dari ', COALESCE(h.old_status, '-'), ' ke ', COALESCE(h.new_status, '-'))
             WHEN 'DELETED' THEN 'Aset dihapus (soft delete)'
             ELSE CONCAT('Aktivitas: ', h.action_type)
           END AS activity_summary
    FROM asset_histories h
    LEFT JOIN employees emp_old ON emp_old.id = h.old_assigned_to
    LEFT JOIN employees emp_new ON emp_new.id = h.new_assigned_to
    LEFT JOIN locations loc_old ON loc_old.id = h.old_location_id
    LEFT JOIN locations loc_new ON loc_new.id = h.new_location_id
    LEFT JOIN employees actor ON actor.id = h.performed_by
    LEFT JOIN users u_actor ON u_actor.id = h.performed_by_user_id
    WHERE h.asset_id = ${assetId}
    ORDER BY h.created_at DESC
    LIMIT 50;
  `;
  return rows;
}

// ponytail: single-query list, paginate if assets exceed ~500 rows
if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getAssets === "function", "getAssets missing");
  console.assert(typeof getAssetHistory === "function", "getAssetHistory missing");
  console.log("assets lib self-check ok");
}
