"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";
import { getAuditItems } from "@/lib/audits";

async function revalidateAudits() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/audits`);
  revalidatePath(`/${locale}/dashboard`);
}

export interface AuditActionResult {
  success?: boolean;
  error?: string;
  auditId?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

function uuid(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function createAuditAction(
  _prev: AuditActionResult | null,
  formData: FormData
): Promise<AuditActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const audit_code = str(formData.get("audit_code"));
  if (!audit_code) return { error: "Kode audit wajib diisi." };
  const title = str(formData.get("title"));
  if (!title) return { error: "Judul sesi audit wajib diisi." };
  const start_date = str(formData.get("start_date"));
  if (!start_date) return { error: "Tanggal mulai wajib diisi." };
  const lead_auditor_id = uuid(formData.get("lead_auditor_id"));
  const notes = str(formData.get("notes"));

  try {
    const existing = await sql<Array<{ id: string }>>`
      SELECT id::text FROM asset_audits WHERE audit_code = ${audit_code};
    `;
    if (existing.length > 0) {
      return { error: "Kode audit sudah digunakan." };
    }

    const inserted = await sql<Array<{ id: string }>>`
      INSERT INTO asset_audits (
        audit_code, title, start_date, status, lead_auditor_id, notes
      ) VALUES (
        ${audit_code}, ${title}, ${start_date}, 'in_progress', ${lead_auditor_id}, ${notes}
      )
      RETURNING id::text AS id;
    `;

    const auditId = inserted[0]?.id;
    if (auditId) {
      // Initialize audit items snapshot from currently active assets
      await sql`
        INSERT INTO asset_audit_items (
          audit_id, asset_id, expected_location_id, expected_employee_id, status_found
        )
        SELECT
          ${auditId}::uuid,
          a.id,
          a.location_id,
          a.assigned_to,
          'pending'
        FROM assets a
        WHERE a.is_deleted = FALSE AND a.status != 'disposed';
      `;
    }

    await revalidateAudits();
    return { success: true, auditId };
  } catch (e) {
    console.error("createAuditAction error:", e);
    return { error: "Gagal membuat sesi audit." };
  }
}

export async function updateAuditItemAction(
  itemId: string,
  data: {
    status_found: "match" | "misplaced" | "missing" | "damaged" | "pending";
    actual_location_id?: string | null;
    actual_employee_id?: string | null;
    notes?: string | null;
  }
): Promise<AuditActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await sql`
      UPDATE asset_audit_items SET
        status_found = ${data.status_found},
        actual_location_id = ${data.actual_location_id ?? null},
        actual_employee_id = ${data.actual_employee_id ?? null},
        notes = ${data.notes ?? null},
        scanned_at = NOW()
      WHERE id = ${itemId};
    `;
    await revalidateAudits();
    return { success: true };
  } catch (e) {
    console.error("updateAuditItemAction error:", e);
    return { error: "Gagal memperbarui status scan item audit." };
  }
}

export async function completeAuditAction(auditId: string): Promise<AuditActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await sql`
      UPDATE asset_audits SET
        status = 'completed',
        end_date = CURRENT_DATE
      WHERE id = ${auditId};
    `;
    await revalidateAudits();
    return { success: true };
  } catch (e) {
    console.error("completeAuditAction error:", e);
    return { error: "Gagal menyelesaikan sesi audit." };
  }
}

export async function deleteAuditAction(auditId: string): Promise<AuditActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await sql`
      DELETE FROM asset_audits WHERE id = ${auditId};
    `;
    await revalidateAudits();
    return { success: true };
  } catch (e) {
    console.error("deleteAuditAction error:", e);
    return { error: "Gagal menghapus sesi audit." };
  }
}

export async function getAuditItemsAction(auditId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" as const, items: [] as never[] };

  try {
    const items = await getAuditItems(auditId);
    return { items };
  } catch (e) {
    console.error("getAuditItemsAction error:", e);
    return { error: "Gagal memuat item audit." as const, items: [] as never[] };
  }
}
