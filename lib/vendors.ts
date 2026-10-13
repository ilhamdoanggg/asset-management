import { sql } from "@/lib/db";

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

export async function getVendors(): Promise<Vendor[]> {
  const rows = await sql<Array<Vendor>>`
    SELECT id::text, name, contact_name, phone, email, address,
           description, website, notes, created_at::text
    FROM vendors
    WHERE is_deleted = FALSE
    ORDER BY name ASC;
  `;
  return rows;
}

// ponytail: single-query list, paginate if vendors exceed ~500 rows
if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getVendors === "function", "getVendors missing");
  console.log("vendors lib self-check ok");
}
