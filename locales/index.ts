import { id } from "./id";
import { en } from "./en";
import type { TranslationSchema } from "./types";

export type Locale = "id" | "en";
export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";

export const DICTIONARIES: Record<Locale, TranslationSchema> = {
  id,
  en,
};

export function getDictionarySync(locale: Locale = DEFAULT_LOCALE): TranslationSchema {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export type { TranslationSchema };
