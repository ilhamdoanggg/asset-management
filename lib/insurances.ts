import { sql } from "@/lib/db";

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

export async function getInsurancePolicies(): Promise<InsurancePolicy[]> {
  const rows = await sql<
    Array<{
      id: string;
      policy_number: string;
      provider: string;
      start_date: string;
      end_date: string;
      notes: string | null;
      premium: string;
      asset_count: number;
      is_active: boolean;
      is_expired: boolean;
    }>
  >`
    SELECT
      ip.id::text AS id,
      ip.policy_number,
      ip.provider_name AS provider,
      ip.start_date::text AS start_date,
      ip.end_date::text AS end_date,
      ip.coverage_details AS notes,
      ip.premium_amount::text AS premium,
      COUNT(ai.id)::int AS asset_count,
      (CURRENT_DATE BETWEEN ip.start_date AND ip.end_date) AS is_active,
      (ip.end_date < CURRENT_DATE) AS is_expired
    FROM insurance_policies ip
    LEFT JOIN asset_insurances ai ON ai.policy_id = ip.id
    GROUP BY ip.id, ip.policy_number, ip.provider_name, ip.start_date, ip.end_date, ip.coverage_details, ip.premium_amount
    ORDER BY ip.end_date DESC;
  `;
  return rows.map((r) => ({
    ...r,
    premium: Number(r.premium),
    asset_count: Number(r.asset_count),
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const data = await getInsurancePolicies();
    console.log(JSON.stringify(data, null, 2));
  })();
}
