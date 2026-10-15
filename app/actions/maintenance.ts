"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateMaintenance() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/maintenance`);
  revalidatePath(`/${locale}/dashboard`);
  revalidatePath(`/${locale}/dashboard/assets`);
}

export interface MaintenanceActionResult {
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

export async function saveMaintenanceAction(
  _prev: MaintenanceActionResult | null,
  formData: FormData
): Promise<MaintenanceActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = uuid(formData.get("id"));
  const asset_id = uuid(formData.get("asset_id"));
  if (!asset_id) return { error: "Aset wajib dipilih." };
  const description = str(formData.get("description"));
  if (!description) return { error: "Deskripsi pemeliharaan wajib diisi." };

  const category_id = uuid(formData.get("category_id"));
  const vendor_id = uuid(formData.get("vendor_id"));
  const status = str(formData.get("status")) ?? "scheduled";
  const scheduled_date = str(formData.get("scheduled_date"));
  const completed_date = str(formData.get("completed_date"));
  const cost = num(formData.get("cost")) ?? 0;
  const performed_by = str(formData.get("performed_by"));
  const invoice_number = str(formData.get("invoice_number"));

  try {
    if (id) {
      await sql`
        UPDATE asset_maintenances SET
          asset_id = ${asset_id},
          category_id = ${category_id},
          vendor_id = ${vendor_id},
          status = ${status},
          scheduled_date = ${scheduled_date},
          completed_date = ${completed_date},
          cost = ${cost},
          performed_by = ${performed_by},
          invoice_number = ${invoice_number},
          description = ${description},
          updated_at = NOW(),
          updated_by = ${session.id}
        WHERE id = ${id};
      `;
    } else {
      await sql`
        INSERT INTO asset_maintenances (
          asset_id, category_id, vendor_id, status, scheduled_date,
          completed_date, cost, performed_by, invoice_number, description,
          created_by
        ) VALUES (
          ${asset_id}, ${category_id}, ${vendor_id}, ${status}, ${scheduled_date},
          ${completed_date}, ${cost}, ${performed_by}, ${invoice_number}, ${description},
          ${session.id}
        );
      `;
    }

    // Sync asset status if maintenance is in_progress
    if (status === "in_progress") {
      await sql`
        UPDATE assets SET status = 'maintenance', updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${asset_id} AND status != 'maintenance';
      `;
    } else if (status === "completed") {
      await sql`
        UPDATE assets SET status = 'available', updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${asset_id} AND status = 'maintenance';
      `;
    }

    await revalidateMaintenance();
    return { success: true };
  } catch (e) {
    console.error("saveMaintenanceAction error:", e);
    return { error: "Gagal menyimpan data pemeliharaan." };
  }
}

export async function deleteMaintenanceAction(id: string): Promise<MaintenanceActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await sql`
      DELETE FROM asset_maintenances WHERE id = ${id};
    `;
    await revalidateMaintenance();
    return { success: true };
  } catch (e) {
    console.error("deleteMaintenanceAction error:", e);
    return { error: "Gagal menghapus data pemeliharaan." };
  }
}

export async function completeMaintenanceAction(
  id: string,
  cost: number,
  invoiceNumber?: string | null
): Promise<MaintenanceActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const row = await sql<Array<{ asset_id: string }>>`
      UPDATE asset_maintenances SET
        status = 'completed',
        completed_date = CURRENT_DATE,
        cost = ${cost},
        invoice_number = COALESCE(${invoiceNumber ?? null}, invoice_number),
        updated_at = NOW(),
        updated_by = ${session.id}
      WHERE id = ${id}
      RETURNING asset_id::text AS asset_id;
    `;

    if (row[0]?.asset_id) {
      await sql`
        UPDATE assets SET status = 'available', updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${row[0].asset_id} AND status = 'maintenance';
      `;
    }

    await revalidateMaintenance();
    return { success: true };
  } catch (e) {
    console.error("completeMaintenanceAction error:", e);
    return { error: "Gagal menyelesaikan pemeliharaan." };
  }
}
