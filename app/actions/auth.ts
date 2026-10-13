"use server";

import sql from "@/lib/db";
import { hashPassword, verifyPassword, setSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { cookies } from "next/headers";
import { COOKIES, ROUTES, USER_ROLES, USER_STATUS, LOCALES, DEFAULT_LOCALE } from "@/lib/constants";
import {
  isThemeColor,
  isThemeRadius,
  isThemeMode,
  DEFAULT_THEME_COLOR,
  DEFAULT_THEME_RADIUS,
  DEFAULT_THEME_MODE,
} from "@/lib/themes";

export interface AuthState {
  error?: string;
  success?: boolean;
}

export async function registerAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const dict = await getDictionary();
  const username = formData.get("username")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!username || !email || !password) {
    return { error: dict.auth.errorAllRequired };
  }

  if (username.length < 3) {
    return { error: dict.auth.errorUsernameMin };
  }

  if (password.length < 6) {
    return { error: dict.auth.errorPasswordMin };
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

  try {
    const existing = await sql`
      SELECT id FROM users
      WHERE username = ${username} OR email = ${email}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return { error: dict.auth.errorUserExists };
    }

    const cookieColor = cookieStore.get(COOKIES.THEME_COLOR)?.value;
    const cookieRadius = cookieStore.get(COOKIES.THEME_RADIUS)?.value;
    const cookieMode = cookieStore.get(COOKIES.THEME_MODE)?.value;

    const initialColor = cookieColor && isThemeColor(cookieColor) ? cookieColor : DEFAULT_THEME_COLOR;
    const initialRadius = cookieRadius && isThemeRadius(cookieRadius) ? cookieRadius : DEFAULT_THEME_RADIUS;
    const initialMode = cookieMode && isThemeMode(cookieMode) ? cookieMode : DEFAULT_THEME_MODE;

    const passwordHash = hashPassword(password);
    const [newUser] = await sql`
      INSERT INTO users (
        username, email, password_hash, role, status,
        theme_color, theme_radius, theme_mode, last_login_at
      )
      VALUES (
        ${username}, ${email}, ${passwordHash}, ${USER_ROLES.USER}, ${USER_STATUS.ACTIVE},
        ${initialColor}, ${initialRadius}, ${initialMode}, CURRENT_TIMESTAMP
      )
      RETURNING id, username, email, role
    `;

    await setSession({
      id: String(newUser.id),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Register error:", err);
    return { error: dict.auth.errorSystem };
  }

  redirect(`/${locale}${ROUTES.DASHBOARD}`);
}

export async function loginAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const dict = await getDictionary();
  const identifier = formData.get("identifier")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!identifier || !password) {
    return { error: dict.auth.errorAllRequired };
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

  try {
    const [user] = await sql`
      SELECT id, username, email, password_hash, role, status, theme_color, theme_radius, theme_mode
      FROM users
      WHERE (username = ${identifier} OR email = ${identifier})
        AND is_deleted = FALSE
      LIMIT 1
    `;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return { error: dict.auth.errorInvalidCredentials };
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return { error: dict.auth.errorInactiveAccount };
    }

    await sql`
      UPDATE users
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    await setSession({
      id: String(user.id),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Apply last used theme config from database to session cookies
    const userThemeColor = user.theme_color && isThemeColor(user.theme_color) ? user.theme_color : DEFAULT_THEME_COLOR;
    const userThemeRadius = user.theme_radius && isThemeRadius(user.theme_radius) ? user.theme_radius : DEFAULT_THEME_RADIUS;
    const userThemeMode = user.theme_mode && isThemeMode(user.theme_mode) ? user.theme_mode : DEFAULT_THEME_MODE;

    cookieStore.set(COOKIES.THEME_COLOR, userThemeColor, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    cookieStore.set(COOKIES.THEME_RADIUS, userThemeRadius, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    cookieStore.set(COOKIES.THEME_MODE, userThemeMode, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Login error:", err);
    return { error: dict.auth.errorSystem };
  }

  redirect(`/${locale}${ROUTES.DASHBOARD}`);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;
  await clearSession();
  redirect(`/${locale}${ROUTES.LOGIN}`);
}
