"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";
import { getInsuredAssets } from "@/lib/insurances";

async function revalidateInsurances() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/insurances`);
}

export interface InsuranceActionResult {
  success?: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function saveInsuranceAction(
  _prev: InsuranceActionResult | null,
  formData: FormData
): Promise<InsuranceActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = str(formData.get("id"));
  const policy_number = str(formData.get("policy_number"));
  if (!policy_number) return { error: "Nomor polis wajib diisi." };
  const provider = str(formData.get("provider"));
  if (!provider) return { error: "Nama provider asuransi wajib diisi." };
  const start_date = str(formData.get("start_date"));
  if (!start_date) return { error: "Tanggal mulai polis wajib diisi." };
  const end_date = str(formData.get("end_date"));
  if (!end_date) return { error: "Tanggal akhir polis wajib diisi." };

  const premiumRaw = str(formData.get("premium"));
  const premium = premiumRaw ? Number(premiumRaw) : 0;
  if (isNaN(premium) || premium < 0) return { error: "Nilai premi tidak valid." };
  const notes = str(formData.get("notes"));

  try {
    if (id) {
      await sql`
        UPDATE insurance_policies SET
          policy_number = ${policy_number},
          provider_name = ${provider},
          start_date = ${start_date},
          end_date = ${end_date},
          coverage_details = ${notes},
          premium_amount = ${premium}
        WHERE id = ${id};
      `;
    } else {
      await sql`
        INSERT INTO insurance_policies (
          policy_number, provider_name, start_date, end_date, coverage_details, premium_amount
        ) VALUES (
          ${policy_number}, ${provider}, ${start_date}, ${end_date}, ${notes}, ${premium}
        );
      `;
    }
    await revalidateInsurances();
    return { success: true };
  } catch (e) {
    console.error("saveInsuranceAction error:", e);
    return { error: "Gagal menyimpan polis asuransi." };
  }
}

export async function deleteInsuranceAction(id: string): Promise<InsuranceActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ n: number }>>`
      SELECT (SELECT COUNT(*)::int FROM asset_insurances WHERE policy_id = ${id}) AS n;
    `;
    if ((guard[0]?.n ?? 0) > 0) {
      return { error: "Polis asuransi masih terikat ke aset. Lepaskan aset terlebih dahulu." };
    }
    await sql`DELETE FROM insurance_policies WHERE id = ${id};`;
    await revalidateInsurances();
    return { success: true };
  } catch (e) {
    console.error("deleteInsuranceAction error:", e);
    return { error: "Gagal menghapus polis asuransi." };
  }
}

export async function addAssetToPolicyAction(
  policyId: string,
  assetId: string,
  insuredValue: number
): Promise<InsuranceActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const existing = await sql<Array<{ id: string }>>`
      SELECT id::text FROM asset_insurances
      WHERE policy_id = ${policyId} AND asset_id = ${assetId};
    `;
    if (existing.length > 0) {
      return { error: "Aset sudah terdaftar pada polis ini." };
    }

    await sql`
      INSERT INTO asset_insurances (policy_id, asset_id, insured_value)
      VALUES (${policyId}, ${assetId}, ${insuredValue});
    `;
    await revalidateInsurances();
    return { success: true };
  } catch (e) {
    console.error("addAssetToPolicyAction error:", e);
    return { error: "Gagal mendaftarkan aset ke polis asuransi." };
  }
}

export async function removeAssetFromPolicyAction(
  assetInsuranceId: string
): Promise<InsuranceActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await sql`
      DELETE FROM asset_insurances WHERE id = ${assetInsuranceId};
    `;
    await revalidateInsurances();
    return { success: true };
  } catch (e) {
    console.error("removeAssetFromPolicyAction error:", e);
    return { error: "Gagal melepas aset dari polis asuransi." };
  }
}

export async function getInsuredAssetsAction(policyId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" as const, assets: [] as never[] };
  try {
    const assets = await getInsuredAssets(policyId);
    return { assets };
  } catch (e) {
    console.error("getInsuredAssetsAction error:", e);
    return { error: "Gagal memuat daftar aset polis." as const, assets: [] as never[] };
  }
}
