import { sql } from "@/lib/db";

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

export async function getAudits(): Promise<AssetAudit[]> {
  const rows = await sql<
    Array<{
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
    }>
  >`
    SELECT
      aa.id::text,
      aa.audit_code,
      aa.title,
      aa.start_date::text,
      aa.end_date::text,
      aa.status,
      aa.lead_auditor_id::text,
      emp.full_name AS lead_auditor_name,
      aa.notes,
      COUNT(aai.id)::int AS total_items,
      COUNT(CASE WHEN aai.status_found = 'match' THEN 1 END)::int AS matched_items,
      COUNT(CASE WHEN aai.status_found IN ('misplaced', 'missing', 'damaged') THEN 1 END)::int AS discrepancy_items,
      COUNT(CASE WHEN aai.status_found = 'pending' THEN 1 END)::int AS pending_items,
      aa.created_at::text
    FROM asset_audits aa
    LEFT JOIN employees emp ON emp.id = aa.lead_auditor_id
    LEFT JOIN asset_audit_items aai ON aai.audit_id = aa.id
    GROUP BY aa.id, aa.audit_code, aa.title, aa.start_date, aa.end_date, aa.status, aa.lead_auditor_id, emp.full_name, aa.notes, aa.created_at
    ORDER BY aa.start_date DESC, aa.created_at DESC;
  `;

  return rows;
}

export async function getAuditItems(auditId: string): Promise<AuditItem[]> {
  const rows = await sql<
    Array<{
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
    }>
  >`
    SELECT
      aai.id::text,
      aai.audit_id::text,
      aai.asset_id::text,
      a.asset_code,
      a.name AS asset_name,
      aai.scanned_at::text,
      aai.scanned_by::text,
      scanner.full_name AS scanned_by_name,
      aai.expected_location_id::text,
      eloc.room_name AS expected_location_name,
      aai.actual_location_id::text,
      aloc.room_name AS actual_location_name,
      aai.expected_employee_id::text,
      eemp.full_name AS expected_employee_name,
      aai.actual_employee_id::text,
      aemp.full_name AS actual_employee_name,
      aai.status_found,
      aai.notes
    FROM asset_audit_items aai
    JOIN assets a ON a.id = aai.asset_id
    LEFT JOIN employees scanner ON scanner.id = aai.scanned_by
    LEFT JOIN locations eloc ON eloc.id = aai.expected_location_id
    LEFT JOIN locations aloc ON aloc.id = aai.actual_location_id
    LEFT JOIN employees eemp ON eemp.id = aai.expected_employee_id
    LEFT JOIN employees aemp ON aemp.id = aai.actual_employee_id
    WHERE aai.audit_id = ${auditId}
    ORDER BY a.asset_code ASC;
  `;

  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getAudits === "function", "getAudits missing");
  console.assert(typeof getAuditItems === "function", "getAuditItems missing");
  console.log("audits lib self-check ok");
}
