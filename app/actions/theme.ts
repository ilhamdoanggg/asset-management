"use server";

import sql from "@/lib/db";
import { getSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { COOKIES } from "@/lib/constants";
import {
  isThemeColor,
  isThemeRadius,
  isThemeMode,
  type ThemeColor,
  type ThemeRadius,
  type ThemeMode,
} from "@/lib/themes";

export interface SaveThemeInput {
  themeColor?: ThemeColor;
  themeRadius?: ThemeRadius;
  themeMode?: ThemeMode;
}

export async function saveThemeAction(data: SaveThemeInput) {
  const cookieStore = await cookies();
  const validColor = data.themeColor && isThemeColor(data.themeColor) ? data.themeColor : undefined;
  const validRadius = data.themeRadius && isThemeRadius(data.themeRadius) ? data.themeRadius : undefined;
  const validMode = data.themeMode && isThemeMode(data.themeMode) ? data.themeMode : undefined;

  if (validColor) {
    cookieStore.set(COOKIES.THEME_COLOR, validColor, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  if (validRadius) {
    cookieStore.set(COOKIES.THEME_RADIUS, validRadius, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  if (validMode) {
    cookieStore.set(COOKIES.THEME_MODE, validMode, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  try {
    const session = await getSession();
    if (session?.id) {
      await sql`
        UPDATE users
        SET
          theme_color = COALESCE(${validColor || null}, theme_color),
          theme_radius = COALESCE(${validRadius || null}, theme_radius),
          theme_mode = COALESCE(${validMode || null}, theme_mode),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${session.id}
      `;
    }
  } catch (err) {
    console.error("Failed to persist theme preference to user profile:", err);
  }

  return { success: true };
}
