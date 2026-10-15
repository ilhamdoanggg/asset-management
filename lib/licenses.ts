import { sql } from "@/lib/db";

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

export async function getSoftwareLicenses(): Promise<SoftwareLicense[]> {
  const rows = await sql<
    Array<{
      id: string;
      name: string;
      license_key: string | null;
      seats_total: number;
      seats_used: number;
      vendor_id: string | null;
      vendor_name: string | null;
      expiry_date: string | null;
      is_expired: boolean;
    }>
  >`
    SELECT
      sl.id::text AS id,
      sl.name,
      sl.license_key,
      sl.seats_total,
      sl.seats_used,
      sl.vendor_id::text AS vendor_id,
      v.name AS vendor_name,
      sl.expiry_date::text AS expiry_date,
      (sl.expiry_date IS NOT NULL AND sl.expiry_date < CURRENT_DATE) AS is_expired
    FROM software_licenses sl
    LEFT JOIN vendors v ON v.id = sl.vendor_id
    ORDER BY sl.name ASC;
  `;
  return rows.map((r) => ({
    ...r,
    seats_total: Number(r.seats_total),
    seats_used: Number(r.seats_used),
  }));
}

export async function getLicenseAllocations(
  licenseId: string
): Promise<LicenseAllocation[]> {
  const rows = await sql<
    Array<{
      id: string;
      asset_id: string;
      asset_code: string;
      asset_name: string;
      allocated_at: string;
      user_name: string | null;
    }>
  >`
    SELECT
      asa.id::text,
      asa.asset_id::text,
      a.asset_code,
      a.name AS asset_name,
      asa.allocated_at::text,
      e.full_name AS user_name
    FROM asset_software_allocations asa
    JOIN assets a ON a.id = asa.asset_id
    LEFT JOIN employees e ON e.id = a.assigned_to
    WHERE asa.license_id = ${licenseId} AND a.is_deleted = FALSE
    ORDER BY asa.allocated_at DESC;
  `;
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getSoftwareLicenses === "function", "getSoftwareLicenses missing");
  console.assert(typeof getLicenseAllocations === "function", "getLicenseAllocations missing");
  console.log("licenses lib self-check ok");
}
