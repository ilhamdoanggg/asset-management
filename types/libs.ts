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

export type AuditStatus = "in_progress" | "completed" | "canceled";
export type AuditItemStatus = "match" | "misplaced" | "missing" | "damaged" | "pending";

export interface AssetAudit {
  id: string;
  audit_code: string;
  title: string;
  start_date: string;
  end_date: string | null;
  status: AuditStatus;
  lead_auditor_id: string | null;
  lead_auditor_name: string | null;
  notes: string | null;
  total_items: number;
  matched_items: number;
  discrepancy_items: number;
  pending_items: number;
  created_at: string;
}

export interface AuditItem {
  id: string;
  audit_id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  scanned_at: string | null;
  scanned_by: string | null;
  scanned_by_name: string | null;
  expected_location_id: string | null;
  expected_location_name: string | null;
  actual_location_id: string | null;
  actual_location_name: string | null;
  expected_employee_id: string | null;
  expected_employee_name: string | null;
  actual_employee_id: string | null;
  actual_employee_name: string | null;
  status_found: AuditItemStatus;
  notes: string | null;
}


export interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  asset_count: number;
  asset_value: number;
  created_at: string;
}
