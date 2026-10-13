"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateVendors() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/vendors`);
}

export interface VendorActionResult {
  success?: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function saveVendorAction(
  _prev: VendorActionResult | null,
  formData: FormData
): Promise<VendorActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  if (!name) return { error: "Nama vendor wajib diisi." };

  const contact_name = str(formData.get("contact_name"));
  const phone = str(formData.get("phone"));
  const email = str(formData.get("email"));
  const address = str(formData.get("address"));
  const description = str(formData.get("description"));
  const website = str(formData.get("website"));
  const notes = str(formData.get("notes"));

  try {
    if (id) {
      await sql`
        UPDATE vendors SET name = ${name}, contact_name = ${contact_name},
          phone = ${phone}, email = ${email}, address = ${address},
          description = ${description}, website = ${website}, notes = ${notes},
          updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${id} AND is_deleted = FALSE;
      `;
    } else {
      await sql`
        INSERT INTO vendors (name, contact_name, phone, email, address, description, website, notes, created_by)
        VALUES (${name}, ${contact_name}, ${phone}, ${email}, ${address}, ${description}, ${website}, ${notes}, ${session.id});
      `;
    }
    await revalidateVendors();
    return { success: true };
  } catch (e) {
    console.error("saveVendorAction error:", e);
    return { error: "Gagal menyimpan vendor." };
  }
}

export async function deleteVendorAction(id: string): Promise<VendorActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    await sql`
      UPDATE vendors SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${session.id}
      WHERE id = ${id};
    `;
    await revalidateVendors();
    return { success: true };
  } catch (e) {
    console.error("deleteVendorAction error:", e);
    return { error: "Gagal menghapus vendor." };
  }
}
