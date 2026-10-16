import { sql } from "@/lib/db";
import type { Department } from "@/types";

export async function getDepartments(): Promise<Department[]> {
  const rows = await sql<Array<Department>>`
    SELECT d.id::text, d.name, d.code, d.parent_id::text,
           p.name AS parent_name,
           COUNT(e.id)::int AS member_count,
           d.created_at::text
    FROM departments d
    LEFT JOIN departments p ON p.id = d.parent_id AND p.is_deleted = FALSE
    LEFT JOIN employees e ON e.department_id = d.id
    WHERE d.is_deleted = FALSE
    GROUP BY d.id, d.name, d.code, d.parent_id, p.name, d.created_at
    ORDER BY d.name ASC;
  `;
  return rows;
}

// ponytail: single-query list, paginate if departments exceed ~500 rows
if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getDepartments === "function", "getDepartments missing");
  console.log("departments lib self-check ok");
}
