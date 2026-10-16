import { sql } from "@/lib/db";
import type { InsurancePolicy, InsuredAsset } from "@/types";

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
    ORDER BY ip.start_date DESC;
  `;
  return rows.map((r) => ({
    ...r,
    premium: Number(r.premium),
  }));
}

export async function getInsuredAssets(policyId: string): Promise<InsuredAsset[]> {
  const rows = await sql<
    Array<{
      id: string;
      asset_id: string;
      asset_code: string;
      asset_name: string;
      insured_value: string;
      created_at: string;
    }>
  >`
    SELECT
      ai.id::text,
      ai.asset_id::text,
      a.asset_code,
      a.name AS asset_name,
      ai.insured_value::text,
      ai.created_at::text
    FROM asset_insurances ai
    JOIN assets a ON a.id = ai.asset_id
    WHERE ai.policy_id = ${policyId} AND a.is_deleted = FALSE
    ORDER BY ai.created_at DESC;
  `;
  return rows.map((r) => ({
    ...r,
    insured_value: Number(r.insured_value ?? 0),
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.assert(typeof getInsurancePolicies === "function", "getInsurancePolicies missing");
  console.assert(typeof getInsuredAssets === "function", "getInsuredAssets missing");
  console.log("insurances lib self-check ok");
}
