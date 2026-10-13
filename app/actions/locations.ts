"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateLocations() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/locations`);
}

export interface LocationActionResult {
  success?: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function saveLocationAction(
  _prev: LocationActionResult | null,
  formData: FormData
): Promise<LocationActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = str(formData.get("id"));
  const code = str(formData.get("code"));
  if (!code) return { error: "Kode lokasi wajib diisi." };
  const building = str(formData.get("building"));
  if (!building) return { error: "Gedung wajib diisi." };
  const room = str(formData.get("room"));
  if (!room) return { error: "Ruangan wajib diisi." };
  const floor = str(formData.get("floor"));
  const address = str(formData.get("address"));

  try {
    if (id) {
      await sql`
        UPDATE locations SET code = ${code}, building = ${building}, floor = ${floor},
          room = ${room}, address = ${address},
          updated_at = NOW(), updated_by = ${session.id}
        WHERE id = ${id} AND is_deleted = FALSE;
      `;
    } else {
      await sql`
        INSERT INTO locations (code, building, floor, room, address, created_by)
        VALUES (${code}, ${building}, ${floor}, ${room}, ${address}, ${session.id});
      `;
    }
    await revalidateLocations();
    return { success: true };
  } catch (e) {
    console.error("saveLocationAction error:", e);
    return { error: "Gagal menyimpan lokasi. Kode atau kombinasi gedung-ruang mungkin sudah dipakai." };
  }
}

export async function deleteLocationAction(id: string): Promise<LocationActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ assets: number }>>`
      SELECT (SELECT COUNT(*)::int FROM assets WHERE location_id = ${id}) AS assets;
    `;
    if ((guard[0]?.assets ?? 0) > 0) return { error: "Lokasi masih memiliki aset terdaftar. Pindahkan asetnya dulu." };
    await sql`
      UPDATE locations SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ${session.id}
      WHERE id = ${id};
    `;
    await revalidateLocations();
    return { success: true };
  } catch (e) {
    console.error("deleteLocationAction error:", e);
    return { error: "Gagal menghapus lokasi." };
  }
}
