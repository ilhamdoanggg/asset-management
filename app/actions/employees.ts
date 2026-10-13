"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateEmployees() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/employees`);
}

export interface EmployeeActionResult {
  success?: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function saveEmployeeAction(
  _prev: EmployeeActionResult | null,
  formData: FormData
): Promise<EmployeeActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = str(formData.get("id"));
  const nip = str(formData.get("nip"));
  if (!nip) return { error: "NIP wajib diisi." };
  const full_name = str(formData.get("full_name"));
  if (!full_name) return { error: "Nama lengkap wajib diisi." };
  const email = str(formData.get("email"));
  if (!email) return { error: "Email wajib diisi." };
  const job_title = str(formData.get("job_title"));
  const phone = str(formData.get("phone"));
  const department_id = str(formData.get("department_id"));
  const status = str(formData.get("status")) ?? "active";

  try {
    if (id) {
      await sql`
        UPDATE employees SET nip = ${nip}, full_name = ${full_name}, email = ${email},
          job_title = ${job_title}, phone = ${phone}, department_id = ${department_id},
          status = ${status}, updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${id} AND is_deleted = FALSE;
      `;
    } else {
      await sql`
        INSERT INTO employees (nip, full_name, email, job_title, phone, department_id, status, created_by)
        VALUES (${nip}, ${full_name}, ${email}, ${job_title}, ${phone}, ${department_id}, ${status}, ${session.id});
      `;
    }
    await revalidateEmployees();
    return { success: true };
  } catch (e) {
    console.error("saveEmployeeAction error:", e);
    return { error: "Gagal menyimpan karyawan. NIP atau email mungkin sudah dipakai." };
  }
}

export async function deleteEmployeeAction(id: string): Promise<EmployeeActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ assets: number; assignments: number }>>`
      SELECT (SELECT COUNT(*)::int FROM assets WHERE assigned_to = ${id}) AS assets,
             (SELECT COUNT(*)::int FROM asset_assignments WHERE employee_id = ${id}) AS assignments;
    `;
    if ((guard[0]?.assets ?? 0) > 0) return { error: "Karyawan masih memegang aset. Lakukan serah terima pengembalian dulu." };
    if ((guard[0]?.assignments ?? 0) > 0) return { error: "Karyawan memiliki riwayat serah terima aset dan tidak bisa dihapus." };
    await sql`
      UPDATE employees SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${session.id}
      WHERE id = ${id};
    `;
    await revalidateEmployees();
    return { success: true };
  } catch (e) {
    console.error("deleteEmployeeAction error:", e);
    return { error: "Gagal menghapus karyawan." };
  }
}
