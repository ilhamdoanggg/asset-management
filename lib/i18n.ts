import { cookies } from "next/headers";
import { COOKIES } from "./constants";
import {
  DICTIONARIES,
  DEFAULT_LOCALE,
  getDictionarySync,
  type Locale,
  type TranslationSchema,
} from "@/locales";

export type { Locale, TranslationSchema };
export type Dictionary = TranslationSchema;
export { DICTIONARIES, DEFAULT_LOCALE, getDictionarySync };

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const val = cookieStore.get(COOKIES.LOCALE)?.value as Locale;
  return val === "en" ? "en" : "id";
}

export async function getDictionary(lang?: Locale): Promise<Dictionary> {
  const locale = lang || (await getLocale());
  return getDictionarySync(locale);
}
