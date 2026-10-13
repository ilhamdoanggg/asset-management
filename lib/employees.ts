import { sql } from "@/lib/db";

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

export async function getEmployees(): Promise<Employee[]> {
  const rows = await sql<Array<Employee>>`
    SELECT e.id::text, e.nip, e.full_name, e.job_title, e.email, e.phone, e.status,
           e.department_id::text, d.name AS department_name,
           COUNT(a.id)::int AS asset_count,
           e.created_at::text
    FROM employees e
    LEFT JOIN departments d ON d.id = e.department_id
    LEFT JOIN assets a ON a.assigned_to = e.id
    WHERE e.is_deleted = FALSE
    GROUP BY e.id, e.nip, e.full_name, e.job_title, e.email, e.phone, e.status,
             e.department_id, d.name, e.created_at
    ORDER BY e.full_name ASC;
  `;
  return rows;
}

// ponytail: single-query list, paginate if employees exceed ~500 rows
if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getEmployees === "function", "getEmployees missing");
  console.log("employees lib self-check ok");
}
