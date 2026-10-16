import type * as React from "react";
import type { LucideIcon } from "lucide-react";

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

export interface Vendor {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parent_id: string | null;
  parent_name: string | null;
  member_count: number;
  created_at: string;
}

export interface Location {
  id: string;
  code: string;
  building: string;
  floor: string | null;
  room: string;
  address: string | null;
  asset_count: number;
  created_at: string;
}

export interface Employee {
  id: string;
  nip: string;
  full_name: string;
  job_title: string | null;
  email: string;
  phone: string | null;
  status: string;
  department_id: string | null;
  department_name: string | null;
  asset_count: number;
  created_at: string;
}

export interface SoftwareLicense {
  id: string;
  name: string;
  license_key: string | null;
  seats_total: number;
  seats_used: number;
  vendor_id: string | null;
  vendor_name: string | null;
  expiry_date: string | null;
  is_expired: boolean;
}

export interface LicenseAllocation {
  id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  allocated_at: string;
  user_name: string | null;
}

export interface InsurancePolicy {
  id: string;
  policy_number: string;
  provider: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  premium: number;
  asset_count: number;
  is_active: boolean;
  is_expired: boolean;
}

export interface InsuredAsset {
  id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  insured_value: number;
  created_at: string;
}

export interface MaintenanceCategory {
  id: string;
  code: string;
  name: string;
  interval_days: number | null;
  is_capitalized: boolean;
  description: string | null;
  usage_count: number;
}

export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Maintenance {
  id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  category_id: string | null;
  category_name: string | null;
  vendor_id: string | null;
  vendor_name: string | null;
  status: MaintenanceStatus;
  scheduled_date: string | null;
  completed_date: string | null;
  cost: number;
  performed_by: string | null;
  invoice_number: string | null;
  description: string;
  created_at: string;
}

export interface AssetOption {
  id: string;
  name: string;
  code?: string;
}

export interface LocationOption {
  id: string;
  code: string;
  building: string;
  room: string;
}

export interface AuditLocationOption {
  id: string;
  room_name: string;
  building_name: string;
}

export interface EmployeeOption {
  id: string;
  full_name: string;
  nip: string;
}

export interface AuditorOption {
  id: string;
  name: string;
  nip: string;
}

export interface OptionItem {
  id: string;
  name: string;
}

export interface StatusSlice {
  name: string;
  value: number;
  fill: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  description: string;
  icon: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

export interface MasterStat {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tile: string;
}

export interface ComputerInventoryReportItem {
  asset_id: string;
  department_name: string | null;
  ip_address: string | null;
  asset_code: string;
  computer_name: string | null;
  user_name: string | null;
  ms_office_version: string | null;
  os_name: string | null;
  processor_detail: string | null;
  ram_capacity_gb: number | null;
  storage_detail: string | null;
  asset_status: string;
  current_room: string | null;
}

export interface CategoryValuationReportItem {
  category_name: string;
  category_code: string;
  asset_count: number;
  total_purchase_cost: number;
}

export interface ActivityLogReportItem {
  id: string;
  action_type: string;
  asset_code: string;
  asset_name: string;
  actor_name: string | null;
  activity_summary: string | null;
  notes: string | null;
  event_timestamp: string;
}

export interface ReportsData {
  computers: ComputerInventoryReportItem[];
  categoryValuations: CategoryValuationReportItem[];
  recentHistory: ActivityLogReportItem[];
  metrics: {
    totalComputers: number;
    totalAssets: number;
    totalValuation: number;
  };
}

export interface DepreciationEntry {
  id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  category_name: string;
  period_date: string;
  depreciation_amount: number;
  book_value: number;
  created_at: string;
}

export interface DisposalEntry {
  id: string;
  asset_id: string;
  asset_code: string;
  asset_name: string;
  disposal_date: string;
  reason: string;
  sale_price: number;
  approved_by_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface DepreciationSummary {
  totalDepreciationValue: number;
  totalBookValue: number;
  totalEntries: number;
  totalDisposals: number;
}
