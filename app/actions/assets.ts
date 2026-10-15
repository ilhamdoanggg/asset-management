"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";
import { getAssetHistory } from "@/lib/assets";

async function revalidateAssets() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/assets`);
  revalidatePath(`/${locale}/dashboard`);
}

export interface AssetActionResult {
  success?: boolean;
  error?: string;
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

export async function saveAssetAction(
  _prev: AssetActionResult | null,
  formData: FormData
): Promise<AssetActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = uuid(formData.get("id"));
  const asset_code = str(formData.get("asset_code"));
  if (!asset_code) return { error: "Kode aset wajib diisi." };
  const name = str(formData.get("name"));
  if (!name) return { error: "Nama aset wajib diisi." };
  const category_id = uuid(formData.get("category_id"));
  if (!category_id) return { error: "Kategori wajib dipilih." };
  const purchase_date = str(formData.get("purchase_date"));
  if (!purchase_date) return { error: "Tanggal pembelian wajib diisi." };
  const purchase_cost = num(formData.get("purchase_cost"));
  if (purchase_cost == null) return { error: "Biaya perolehan wajib diisi." };

  const barcode = str(formData.get("barcode"));
  const serial_number = str(formData.get("serial_number"));
  const brand = str(formData.get("brand"));
  const model = str(formData.get("model"));
  const vendor_id = uuid(formData.get("vendor_id"));
  const location_id = uuid(formData.get("location_id"));
  const status = str(formData.get("status")) ?? "available";
  const condition = str(formData.get("condition")) ?? "good";
  const warranty_expiry = str(formData.get("warranty_expiry"));
  const depreciation_method = str(formData.get("depreciation_method")) ?? "straight_line";
  const useful_life_years = num(formData.get("useful_life_years")) ?? 5;
  const salvage_value = num(formData.get("salvage_value")) ?? 0;
  const notes = str(formData.get("notes"));

  const computer_name = str(formData.get("computer_name"));
  const ip_address = str(formData.get("ip_address"));
  const os_name = str(formData.get("os_name"));
  const processor_detail = str(formData.get("processor_detail"));
  const ram_capacity_gb = num(formData.get("ram_capacity_gb"));
  const storage_detail = str(formData.get("storage_detail"));
  const hasSpecs =
    computer_name || ip_address || os_name || processor_detail || ram_capacity_gb || storage_detail;

  try {
    let assetId = id;
    if (id) {
      await sql`
        UPDATE assets SET asset_code = ${asset_code}, name = ${name},
          barcode = ${barcode}, serial_number = ${serial_number},
          brand = ${brand}, model = ${model}, category_id = ${category_id},
          vendor_id = ${vendor_id}, location_id = ${location_id},
          status = ${status}, condition = ${condition},
          purchase_date = ${purchase_date}, purchase_cost = ${purchase_cost},
          warranty_expiry = ${warranty_expiry}, depreciation_method = ${depreciation_method},
          useful_life_years = ${useful_life_years}, salvage_value = ${salvage_value},
          notes = ${notes}, updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${id} AND is_deleted = FALSE;
      `;
    } else {
      const inserted = await sql<Array<{ id: string }>>`
        INSERT INTO assets (asset_code, name, barcode, serial_number, brand, model,
          category_id, vendor_id, location_id, status, condition,
          purchase_date, purchase_cost, warranty_expiry, depreciation_method,
          useful_life_years, salvage_value, notes, created_by)
        VALUES (${asset_code}, ${name}, ${barcode}, ${serial_number}, ${brand}, ${model},
          ${category_id}, ${vendor_id}, ${location_id}, ${status}, ${condition},
          ${purchase_date}, ${purchase_cost}, ${warranty_expiry}, ${depreciation_method},
          ${useful_life_years}, ${salvage_value}, ${notes}, ${session.id})
        RETURNING id::text AS id;
      `;
      assetId = inserted[0]?.id ?? null;
      if (!assetId) return { error: "Gagal menyimpan aset." };
    }

    if (hasSpecs && assetId) {
      await sql`
        INSERT INTO computer_specifications (asset_id, computer_name, ip_address, os_name,
          processor_detail, ram_capacity_gb, storage_detail, created_by)
        VALUES (${assetId}, ${computer_name}, ${ip_address}, ${os_name},
          ${processor_detail}, ${ram_capacity_gb}, ${storage_detail}, ${session.id})
        ON CONFLICT (asset_id) DO UPDATE SET
          computer_name = EXCLUDED.computer_name, ip_address = EXCLUDED.ip_address,
          os_name = EXCLUDED.os_name, processor_detail = EXCLUDED.processor_detail,
          ram_capacity_gb = EXCLUDED.ram_capacity_gb, storage_detail = EXCLUDED.storage_detail,
          updated_at = NOW(), updated_by = ${session.id};
      `;
    }

    await revalidateAssets();
    return { success: true };
  } catch (e) {
    console.error("saveAssetAction error:", e);
    return { error: "Gagal menyimpan aset. Kode/barcode/serial mungkin sudah dipakai." };
  }
}

export async function deleteAssetAction(id: string): Promise<AssetActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ active_assignment: number; open_maintenance: number }>>`
      SELECT (SELECT COUNT(*)::int FROM asset_assignments WHERE asset_id = ${id} AND returned_at IS NULL) AS active_assignment,
             (SELECT COUNT(*)::int FROM asset_maintenances WHERE asset_id = ${id} AND completed_date IS NULL) AS open_maintenance;
    `;
    if ((guard[0]?.active_assignment ?? 0) > 0)
      return { error: "Aset masih dipinjam. Kembalikan dulu sebelum menghapus." };
    if ((guard[0]?.open_maintenance ?? 0) > 0)
      return { error: "Aset memiliki jadwal servis terbuka. Selesaikan dulu." };
    await sql`
      UPDATE assets SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${session.id},
        updated_by = ${session.id}
      WHERE id = ${id};
    `;
    await revalidateAssets();
    return { success: true };
  } catch (e) {
    console.error("deleteAssetAction error:", e);
    return { error: "Gagal menghapus aset." };
  }
}

export async function checkoutAssetAction(
  _prev: AssetActionResult | null,
  formData: FormData
): Promise<AssetActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  const asset_id = uuid(formData.get("asset_id"));
  const employee_id = uuid(formData.get("employee_id"));
  if (!asset_id || !employee_id) return { error: "Aset dan karyawan wajib dipilih." };
  const location_id = uuid(formData.get("location_id"));
  const expected_return_date = str(formData.get("expected_return_date"));
  const condition_on_checkout = str(formData.get("condition_on_checkout"));
  const notes = str(formData.get("notes"));

  try {
    await sql`
      INSERT INTO asset_assignments (asset_id, employee_id, location_id,
        expected_return_date, condition_on_checkout, notes, created_by)
      VALUES (${asset_id}, ${employee_id}, ${location_id},
        ${expected_return_date}, ${condition_on_checkout}, ${notes}, ${session.id});
    `;
    await revalidateAssets();
    return { success: true };
  } catch (e) {
    console.error("checkoutAssetAction error:", e);
    return { error: "Gagal serah terima. Aset mungkin sedang dipinjam." };
  }
}

export async function returnAssetAction(assetId: string): Promise<AssetActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    await sql`
      UPDATE asset_assignments SET returned_at = NOW(), updated_at = NOW(), updated_by = ${session.id}
      WHERE asset_id = ${assetId} AND returned_at IS NULL;
    `;
    await revalidateAssets();
    return { success: true };
  } catch (e) {
    console.error("returnAssetAction error:", e);
    return { error: "Gagal mengembalikan aset." };
  }
}

export async function getAssetHistoryAction(assetId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" as const, history: [] as never[] };
  try {
    const history = await getAssetHistory(assetId);
    return { history };
  } catch (e) {
    console.error("getAssetHistoryAction error:", e);
    return { error: "Gagal memuat riwayat." as const, history: [] as never[] };
  }
}
