"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateDepreciation() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/depreciation`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/dashboard/assets`);
}

export interface DepreciationActionResult {
  success?: boolean;
  error?: string;
  message?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

function num(v: FormDataEntryValue | null): number | null {
  const s = v?.toString().trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function uuid(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function runMonthlyDepreciationAction(
  periodDate?: string
): Promise<DepreciationActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const targetDate = periodDate ? new Date(periodDate) : new Date();
    const formatted = targetDate.toISOString().slice(0, 10);
    await sql`CALL sp_generate_monthly_depreciation(${formatted}::date);`;
    await revalidateDepreciation();
    return { success: true };
  } catch (e) {
    console.error("runMonthlyDepreciationAction error:", e);
    return { error: "Gagal memproses penyusutan bulanan." };
  }
}

export async function addDepreciationEntryAction(
  _prev: DepreciationActionResult | null,
  formData: FormData
): Promise<DepreciationActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const asset_id = uuid(formData.get("asset_id"));
  if (!asset_id) return { error: "Aset wajib dipilih." };
  const period_date = str(formData.get("period_date"));
  if (!period_date) return { error: "Periode tanggal wajib diisi." };
  const depreciation_amount = num(formData.get("depreciation_amount"));
  if (depreciation_amount == null || depreciation_amount < 0) {
    return { error: "Nilai penyusutan harus lebih besar atau sama dengan 0." };
  }

  try {
    // book_value calculated automatically by trigger trg_set_depreciation_book_value
    await sql`
      INSERT INTO asset_depreciations (
        asset_id, period_date, depreciation_amount, book_value, created_by
      ) VALUES (
        ${asset_id}, ${period_date}, ${depreciation_amount}, 0, ${session.id}
      );
    `;
    await revalidateDepreciation();
    return { success: true };
  } catch (e) {
    console.error("addDepreciationEntryAction error:", e);
    return { error: "Gagal mencatat penyusutan aset." };
  }
}

export async function addDisposalAction(
  _prev: DepreciationActionResult | null,
  formData: FormData
): Promise<DepreciationActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const asset_id = uuid(formData.get("asset_id"));
  if (!asset_id) return { error: "Aset wajib dipilih." };
  const disposal_date = str(formData.get("disposal_date"));
  if (!disposal_date) return { error: "Tanggal pelepasan wajib diisi." };
  const reason = str(formData.get("reason"));
  if (!reason) return { error: "Alasan pelepasan wajib diisi." };
  const sale_price = num(formData.get("sale_price")) ?? 0;
  const approved_by = uuid(formData.get("approved_by"));
  const notes = str(formData.get("notes"));

  try {
    await sql`
      INSERT INTO asset_disposals (
        asset_id, disposal_date, reason, sale_price, approved_by, notes, created_by
      ) VALUES (
        ${asset_id}, ${disposal_date}, ${reason}, ${sale_price}, ${approved_by}, ${notes}, ${session.id}
      );
    `;
    // trigger trg_on_asset_disposed sets asset status to 'disposed' automatically
    await revalidateDepreciation();
    return { success: true };
  } catch (e) {
    console.error("addDisposalAction error:", e);
    return { error: "Gagal mencatat pelepasan aset." };
  }
}
