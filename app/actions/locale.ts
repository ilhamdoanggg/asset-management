"use server";

import { cookies } from "next/headers";
import { COOKIES } from "@/lib/constants";
import { type Locale, DEFAULT_LOCALE } from "@/lib/i18n";
import { revalidatePath } from "next/cache";

export async function setLocaleAction(newLocale: Locale) {
  const cookieStore = await cookies();
  const target: Locale = newLocale === "en" ? "en" : DEFAULT_LOCALE;
  cookieStore.set(COOKIES.LOCALE, target, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
