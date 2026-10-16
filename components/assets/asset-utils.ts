import type { TranslationSchema } from "@/locales";

export type AssetDict = TranslationSchema["assets"];

export const STATUS_OPTIONS = [
  "available",
  "in_use",
  "maintenance",
  "damaged",
  "disposed",
  "backup",
  "reserved",
] as const;

export const CONDITION_OPTIONS = ["new", "good", "fair", "poor", "damaged"] as const;

export function statusLabel(s: string, dict: AssetDict): string {
  switch (s) {
    case "available": return dict.statusAvailable;
    case "in_use": return dict.statusInUse;
    case "maintenance": return dict.statusMaintenance;
    case "damaged": return dict.statusDamaged;
    case "disposed": return dict.statusDisposed;
    case "backup": return dict.statusBackup;
    case "reserved": return dict.statusReserved;
    default: return s;
  }
}

export function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "in_use") return "default";
  if (s === "maintenance" || s === "damaged") return "destructive";
  if (s === "available") return "outline";
  return "secondary";
}

export const selectClass = "w-full";

