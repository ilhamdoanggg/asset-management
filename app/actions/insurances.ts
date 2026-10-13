"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

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
  const provider_name = str(formData.get("provider"));
  if (!provider_name) return { error: "Nama provider wajib diisi." };
  const start_date = str(formData.get("start_date"));
  if (!start_date) return { error: "Tanggal mulai wajib diisi." };
  const end_date = str(formData.get("end_date"));
  if (!end_date) return { error: "Tanggal berakhir wajib diisi." };
  if (end_date < start_date) return { error: "Tanggal berakhir sebelum tanggal mulai." };
  const coverage_details = str(formData.get("notes"));
  const premiumRaw = str(formData.get("premium"));
  const premium_amount = premiumRaw ? Number(premiumRaw) : null;
  if (premiumRaw && (isNaN(premium_amount!) || premium_amount! < 0))
    return { error: "Premi harus angka ≥ 0." };

  try {
    if (id) {
      await sql`
        UPDATE insurance_policies SET policy_number = ${policy_number}, provider_name = ${provider_name},
          start_date = ${start_date}, end_date = ${end_date},
          coverage_details = ${coverage_details}, premium_amount = ${premium_amount}
        WHERE id = ${id};
      `;
    } else {
      await sql`
        INSERT INTO insurance_policies (policy_number, provider_name, start_date, end_date, coverage_details, premium_amount)
        VALUES (${policy_number}, ${provider_name}, ${start_date}, ${end_date}, ${coverage_details}, ${premium_amount});
      `;
    }
    await revalidateInsurances();
    return { success: true };
  } catch (e) {
    console.error("saveInsuranceAction error:", e);
    return { error: "Gagal menyimpan polis. Nomor polis mungkin sudah dipakai." };
  }
}

export async function deleteInsuranceAction(id: string): Promise<InsuranceActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ n: number }>>`
      SELECT (SELECT COUNT(*)::int FROM asset_insurances WHERE policy_id = ${id}) AS n;
    `;
    if ((guard[0]?.n ?? 0) > 0) return { error: "Polis masih dipakai aset. Lepaskan dulu." };
    await sql`DELETE FROM insurance_policies WHERE id = ${id};`;
    await revalidateInsurances();
    return { success: true };
  } catch (e) {
    console.error("deleteInsuranceAction error:", e);
    return { error: "Gagal menghapus polis." };
  }
}
