"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateMaintenanceCategories() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/maintenance-categories`);
}

export interface MaintenanceCategoryActionResult {
  success?: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function saveMaintenanceCategoryAction(
  _prev: MaintenanceCategoryActionResult | null,
  formData: FormData
): Promise<MaintenanceCategoryActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = str(formData.get("id"));
  const code = str(formData.get("code"));
  if (!code) return { error: "Kode kategori wajib diisi." };
  const name = str(formData.get("name"));
  if (!name) return { error: "Nama kategori wajib diisi." };
  const intervalRaw = str(formData.get("interval_days"));
  const default_interval_days = intervalRaw ? Number(intervalRaw) : null;
  if (intervalRaw && (isNaN(default_interval_days!) || default_interval_days! < 0))
    return { error: "Interval hari harus angka ≥ 0." };
  const is_capitalized = formData.get("is_capitalized") === "on";
  const description = str(formData.get("description"));

  try {
    if (id) {
      await sql`
        UPDATE maintenance_categories SET code = ${code}, name = ${name},
          default_interval_days = ${default_interval_days}, is_capitalized = ${is_capitalized},
          description = ${description}, updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${id} AND is_deleted = FALSE;
      `;
    } else {
      await sql`
        INSERT INTO maintenance_categories (code, name, default_interval_days, is_capitalized, description, created_by)
        VALUES (${code}, ${name}, ${default_interval_days}, ${is_capitalized}, ${description}, ${session.id});
      `;
    }
    await revalidateMaintenanceCategories();
    return { success: true };
  } catch (e) {
    console.error("saveMaintenanceCategoryAction error:", e);
    return { error: "Gagal menyimpan kategori. Kode mungkin sudah dipakai." };
  }
}

export async function deleteMaintenanceCategoryAction(id: string): Promise<MaintenanceCategoryActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ n: number }>>`
      SELECT (SELECT COUNT(*)::int FROM asset_maintenances WHERE category_id = ${id}) AS n;
    `;
    if ((guard[0]?.n ?? 0) > 0) return { error: "Kategori masih dipakai riwayat servis. Hapus/tukar dulu." };
    await sql`
      UPDATE maintenance_categories SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${session.id}
      WHERE id = ${id};
    `;
    await revalidateMaintenanceCategories();
    return { success: true };
  } catch (e) {
    console.error("deleteMaintenanceCategoryAction error:", e);
    return { error: "Gagal menghapus kategori." };
  }
}
