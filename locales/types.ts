import type { id } from "./id";

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type TranslationSchema = DeepString<typeof id>;
