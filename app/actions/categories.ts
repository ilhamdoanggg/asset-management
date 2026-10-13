"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateCategories() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/categories`);
}

export interface CategoryActionResult {
  success?: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function saveCategoryAction(
  _prev: CategoryActionResult | null,
  formData: FormData
): Promise<CategoryActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = str(formData.get("id"));
  const code = str(formData.get("code"));
  if (!code) return { error: "Kode kategori wajib diisi." };
  const name = str(formData.get("name"));
  if (!name) return { error: "Nama kategori wajib diisi." };
  const description = str(formData.get("description"));

  try {
    if (id) {
      await sql`
        UPDATE asset_categories SET code = ${code}, name = ${name}, description = ${description},
          updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${id} AND is_deleted = FALSE;
      `;
    } else {
      await sql`
        INSERT INTO asset_categories (code, name, description, created_by)
        VALUES (${code}, ${name}, ${description}, ${session.id});
      `;
    }
    await revalidateCategories();
    return { success: true };
  } catch (e) {
    console.error("saveCategoryAction error:", e);
    return { error: "Gagal menyimpan kategori. Kode mungkin sudah dipakai." };
  }
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ assets: number }>>`
      SELECT (SELECT COUNT(*)::int FROM assets WHERE category_id = ${id}) AS assets;
    `;
    if ((guard[0]?.assets ?? 0) > 0) return { error: "Kategori masih dipakai aset. Pindahkan asetnya dulu." };
    await sql`
      UPDATE asset_categories SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${session.id}
      WHERE id = ${id};
    `;
    await revalidateCategories();
    return { success: true };
  } catch (e) {
    console.error("deleteCategoryAction error:", e);
    return { error: "Gagal menghapus kategori." };
  }
}
