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

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const data = await getSoftwareLicenses();
    console.log(JSON.stringify(data, null, 2));
  })();
}
