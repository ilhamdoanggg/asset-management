import { sql } from "@/lib/db";
import type {Category} from '@/types'

export async function getCategories(): Promise<Category[]> {
  const rows = await sql<Array<Category>>`
    SELECT c.id::text, c.code, c.name, c.description,
           COUNT(a.id)::int AS asset_count,
           COALESCE(SUM(a.purchase_cost), 0)::float8 AS asset_value,
           c.created_at::text
    FROM asset_categories c
    LEFT JOIN assets a ON a.category_id = c.id
    WHERE c.is_deleted = FALSE
    GROUP BY c.id, c.code, c.name, c.description, c.created_at
    ORDER BY c.name ASC;
  `;
  return rows;
}

// ponytail: single-query list, paginate if categories exceed ~500 rows
if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getCategories === "function", "getCategories missing");
  console.log("categories lib self-check ok");
}
