"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { COOKIES, DEFAULT_LOCALE, LOCALES } from "@/lib/constants";

async function revalidateLicenses() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  revalidatePath(`/${locale}/dashboard/licenses`);
}

export interface LicenseActionResult {
  success?: boolean;
  error?: string;
}

function str(v: FormDataEntryValue | null): string | null {
  const s = v?.toString().trim();
  return s ? s : null;
}

export async function saveLicenseAction(
  _prev: LicenseActionResult | null,
  formData: FormData
): Promise<LicenseActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  if (!name) return { error: "Nama lisensi wajib diisi." };
  const license_key = str(formData.get("license_key"));
  const seatsRaw = str(formData.get("seats_total"));
  const seats_total = seatsRaw ? Number(seatsRaw) : 1;
  if (isNaN(seats_total) || seats_total < 1)
    return { error: "Total seats harus angka ≥ 1." };
  const vendorRaw = str(formData.get("vendor_id"));
  const vendor_id = vendorRaw && vendorRaw !== "none" ? vendorRaw : null;
  const expiryRaw = str(formData.get("expiry_date"));
  const expiry_date = expiryRaw ? expiryRaw : null;

  try {
    if (id) {
      const guard = await sql<Array<{ used: number }>>`
        SELECT seats_used AS used FROM software_licenses WHERE id = ${id};
      `;
      if ((guard[0]?.used ?? 0) > seats_total)
        return { error: `Total seats tidak boleh di bawah ${guard[0]?.used} yang terpakai.` };
      await sql`
        UPDATE software_licenses SET name = ${name}, license_key = ${license_key},
          seats_total = ${seats_total}, vendor_id = ${vendor_id}, expiry_date = ${expiry_date}
        WHERE id = ${id};
      `;
    } else {
      await sql`
        INSERT INTO software_licenses (name, license_key, seats_total, vendor_id, expiry_date)
        VALUES (${name}, ${license_key}, ${seats_total}, ${vendor_id}, ${expiry_date});
      `;
    }
    await revalidateLicenses();
    return { success: true };
  } catch (e) {
    console.error("saveLicenseAction error:", e);
    return { error: "Gagal menyimpan lisensi." };
  }
}

export async function deleteLicenseAction(id: string): Promise<LicenseActionResult> {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };
  try {
    const guard = await sql<Array<{ n: number }>>`
      SELECT (SELECT COUNT(*)::int FROM asset_software_allocations WHERE license_id = ${id}) AS n;
    `;
    if ((guard[0]?.n ?? 0) > 0) return { error: "Lisensi masih dialokasikan ke aset. Lepaskan dulu." };
    await sql`DELETE FROM software_licenses WHERE id = ${id};`;
    await revalidateLicenses();
    return { success: true };
  } catch (e) {
    console.error("deleteLicenseAction error:", e);
    return { error: "Gagal menghapus lisensi." };
  }
}
