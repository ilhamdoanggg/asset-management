"use server";

import { sql } from "@/lib/db";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";

export interface SettingsActionResult {
  success?: boolean;
  error?: string;
}

export async function changePasswordAction(
  prevState: SettingsActionResult | null,
  formData: FormData
): Promise<SettingsActionResult> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (newPassword.length < 6) {
    return { error: "Password baru minimal 6 karakter." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password baru tidak cocok." };
  }

  try {
    const users = await sql<Array<{ id: string; password_hash: string }>>`
      SELECT id, password_hash
      FROM users
      WHERE id = ${session.id}
      LIMIT 1;
    `;

    if (!users.length) {
      return { error: "User tidak ditemukan." };
    }

    const isValid = verifyPassword(currentPassword, users[0].password_hash);
    if (!isValid) {
      return { error: "Password saat ini tidak sesuai." };
    }

    const newHash = hashPassword(newPassword);
    await sql`
      UPDATE users
      SET password_hash = ${newHash},
          updated_at = NOW(),
          updated_by = ${session.id}
      WHERE id = ${session.id};
    `;

    return { success: true };
  } catch (error) {
    console.error("changePasswordAction error:", error);
    return { error: "Terjadi kesalahan sistem saat memperbarui password." };
  }
}
