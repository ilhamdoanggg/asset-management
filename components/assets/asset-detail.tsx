import Link from "next/link";
import { ArrowLeft, History, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Asset, AssetHistoryItem } from "@/types";
import { statusLabel, statusVariant, type AssetDict } from "@/components/assets/asset-utils";

interface AssetDetailProps {
  asset: Asset;
  history: AssetHistoryItem[];
  dict: AssetDict;
  locale: string;
}

/** Full-page asset detail: overview fields, computer specs, and history. */
export function AssetDetail({ asset, history, dict, locale }: AssetDetailProps) {
  const listHref = `/${locale}/dashboard/assets`;

  const fields: Array<[string, string | null | undefined]> = [
    [dict.tableCategory, `${asset.category_name} (${asset.category_code})`],
    [dict.vendorLabel, asset.vendor_name],
    [dict.locationLabel, asset.location_label],
    [dict.tableAssignee, asset.assignee_name],
    [dict.tableStatus, statusLabel(asset.status, dict)],
    [dict.conditionLabel, asset.condition],
    [dict.purchaseDateLabel, asset.purchase_date],
    [dict.tableValue, formatCurrency(asset.purchase_cost)],
    [dict.warrantyLabel, asset.warranty_expiry],
    [dict.serialLabel, asset.serial_number],
    [dict.barcodeLabel, asset.barcode],
  ];

  const specs: Array<[string, string | null]> = [
    [dict.computerNameLabel, asset.computer_name],
    [dict.osLabel, asset.os_name],
    [dict.processorLabel, asset.processor_detail],
    [dict.ramLabel, asset.ram_capacity_gb ? `${asset.ram_capacity_gb} GB` : null],
    [dict.ipLabel, asset.ip_address],
    [dict.storageLabel, asset.storage_detail],
  ];
  const hasSpecs = specs.some(([, value]) => value);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href={listHref}
            aria-label={dict.backToAssets}
            className={buttonVariants({ variant: "outline", size: "icon", className: "mt-0.5" })}
          >
            <ArrowLeft />
          </Link>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{asset.name}</h1>
              <Badge variant={statusVariant(asset.status)}>{statusLabel(asset.status, dict)}</Badge>
            </div>
            <p className="font-mono text-sm text-muted-foreground">{asset.asset_code}</p>
          </div>
        </div>
        <Link href={`${listHref}/${asset.id}/edit`} className={buttonVariants()}>
          <Pencil data-icon="inline-start" />
          {dict.editAsset}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.basicSection}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="break-words">{value || dict.unassigned}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {hasSpecs && (
        <Card>
          <CardHeader>
            <CardTitle>{dict.specsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specs.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                  <dd className="break-words">{value || dict.unassigned}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{dict.history}</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">{dict.historyEmpty}</p>
          ) : (
            <ol className="space-y-3">
              {history.map((h) => (
                <li key={h.history_id} className="flex gap-3">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <History className="size-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{h.activity_summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(h.event_timestamp).toLocaleString(locale === "en" ? "en-US" : "id-ID")}
                      {" · "}
                      {h.actor_name ?? dict.unassigned}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
