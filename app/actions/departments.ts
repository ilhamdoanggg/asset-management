"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateDepartments() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/departments`);
}

export interface DepartmentActionResult {
  success?: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function saveDepartmentAction(
  _prev: DepartmentActionResult | null,
  formData: FormData
): Promise<DepartmentActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  if (!name) return { error: "Nama departemen wajib diisi." };
  const code = str(formData.get("code"));
  if (!code) return { error: "Kode departemen wajib diisi." };
  const parent_id = str(formData.get("parent_id"));
  if (id && parent_id === id) return { error: "Departemen tidak bisa menjadi induk dirinya sendiri." };

  try {
    if (id) {
      await sql`
        UPDATE departments SET name = ${name}, code = ${code}, parent_id = ${parent_id},
          updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${id} AND is_deleted = FALSE;
      `;
    } else {
      await sql`
        INSERT INTO departments (name, code, parent_id, created_by)
        VALUES (${name}, ${code}, ${parent_id}, ${session.id});
      `;
    }
    await revalidateDepartments();
    return { success: true };
  } catch (e) {
    console.error("saveDepartmentAction error:", e);
    return { error: "Gagal menyimpan departemen. Kode mungkin sudah dipakai." };
  }
}

export async function deleteDepartmentAction(id: string): Promise<DepartmentActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ children: number; members: number }>>`
      SELECT
        (SELECT COUNT(*)::int FROM departments WHERE parent_id = ${id} AND is_deleted = FALSE) AS children,
        (SELECT COUNT(*)::int FROM employees WHERE department_id = ${id}) AS members;
    `;
    if ((guard[0]?.children ?? 0) > 0) return { error: "Departemen masih memiliki sub-departemen." };
    if ((guard[0]?.members ?? 0) > 0) return { error: "Departemen masih memiliki anggota karyawan." };
    await sql`
      UPDATE departments SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${session.id}
      WHERE id = ${id};
    `;
    await revalidateDepartments();
    return { success: true };
  } catch (e) {
    console.error("deleteDepartmentAction error:", e);
    return { error: "Gagal menghapus departemen." };
  }
}
