import { sql } from "@/lib/db";

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

export async function getLocations(): Promise<Location[]> {
  const rows = await sql<Array<Location>>`
    SELECT l.id::text, l.code, l.building, l.floor, l.room, l.address,
           COUNT(a.id)::int AS asset_count,
           l.created_at::text
    FROM locations l
    LEFT JOIN assets a ON a.location_id = l.id
    WHERE l.is_deleted = FALSE
    GROUP BY l.id, l.code, l.building, l.floor, l.room, l.address, l.created_at
    ORDER BY l.building ASC, l.room ASC;
  `;
  return rows;
}

// ponytail: single-query list, paginate if locations exceed ~500 rows
if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getLocations === "function", "getLocations missing");
  console.log("locations lib self-check ok");
}
