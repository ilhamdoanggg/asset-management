"use client";

import * as React from "react";
import { Pencil, Trash2, Package, Eye, ArrowRightLeft, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { BlockingDialog } from "@/components/ui/blocking-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import {
  saveAssetAction,
  deleteAssetAction,
  checkoutAssetAction,
  returnAssetAction,
  getAssetHistoryAction,
} from "@/app/actions/assets";
import type { Asset, AssetHistoryItem } from "@/lib/assets";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["assets"];

export interface AssetOption {
  id: string;
  name: string;
  code?: string;
}

export interface LocationOption {
  id: string;
  code: string;
  building: string;
  room: string;
}

export interface EmployeeOption {
  id: string;
  full_name: string;
  nip: string;
}

const STATUS_OPTIONS = ["available", "in_use", "maintenance", "damaged", "disposed", "backup", "reserved"];
const CONDITION_OPTIONS = ["new", "good", "fair", "poor", "damaged"];

function statusLabel(s: string, dict: Dict): string {
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

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "in_use") return "default";
  if (s === "maintenance" || s === "damaged") return "destructive";
  if (s === "available") return "outline";
  return "secondary";
}

export function AssetsClient({
  assets,
  categories,
  vendors,
  locations,
  employees,
  dict,
}: {
  assets: Asset[];
  categories: AssetOption[];
  vendors: AssetOption[];
  locations: LocationOption[];
  employees: EmployeeOption[];
  dict: Dict;
}) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Asset | null>(null);
  const [detail, setDetail] = React.useState<Asset | null>(null);
  const [deleting, setDeleting] = React.useState<Asset | null>(null);
  const [checkout, setCheckout] = React.useState<Asset | null>(null);
  const [returning, setReturning] = React.useState<Asset | null>(null);
  const [history, setHistory] = React.useState<AssetHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);
  const checkoutFormRef = React.useRef<HTMLFormElement>(null);

  const filtered = assets.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    const q = query.toLowerCase();
    return !q || [a.asset_code, a.name, a.brand, a.model, a.serial_number, a.assignee_name, a.category_name]
      .filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  React.useEffect(() => {
    if (!detail) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    getAssetHistoryAction(detail.id).then((res) => {
      if ("history" in res) setHistory(res.history as AssetHistoryItem[]);
      setHistoryLoading(false);
    });
  }, [detail]);

  const columns: DataTableColumn<Asset>[] = [
    {
      header: dict.tableAsset,
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium">{a.name}</span>
          <span className="font-mono text-xs text-muted-foreground">{a.asset_code}</span>
          {(a.brand || a.model) && (
            <span className="text-xs text-muted-foreground">{[a.brand, a.model].filter(Boolean).join(" · ")}</span>
          )}
        </div>
      ),
    },
    {
      header: dict.tableCategory,
      cellClassName: "text-sm",
      render: (a) => (
        <div className="flex flex-col">
          <span>{a.category_name}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{a.category_code}</span>
        </div>
      ),
    },
    {
      header: dict.tableAssignee,
      cellClassName: "text-sm",
      render: (a) => a.assignee_name ?? dict.unassigned,
    },
    {
      header: dict.tableStatus,
      render: (a) => (
        <Badge variant={statusVariant(a.status)} className="text-[11px]">
          {statusLabel(a.status, dict)}
        </Badge>
      ),
    },
    {
      header: dict.tableValue,
      cellClassName: "text-right font-mono text-xs tabular-nums",
      render: (a) => formatCurrency(a.purchase_cost),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-40 text-center",
      render: (a) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDetail(a)} aria-label={dict.viewDetail}>
            <Eye />
          </Button>
          {a.assigned_to ? (
            <Button variant="ghost" size="icon" onClick={() => setReturning(a)} aria-label={dict.returnAsset}>
              <RotateCcw />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setCheckout(a)} aria-label={dict.checkout}>
              <ArrowRightLeft />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onEdit(a)} aria-label={dict.editAsset}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(a)} aria-label={dict.delete} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const inUse = assets.filter((a) => a.status === "in_use").length;
  const available = assets.filter((a) => a.status === "available").length;
  const needAttention = assets.filter((a) => a.status === "maintenance" || a.status === "damaged").length;

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(a: Asset) {
    setEditing(a);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveAssetAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpen(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.save, description: editing ? editing.asset_code : "" },
      error: (err: unknown) => ({ title: dict.save, description: err instanceof Error ? err.message : dict.errorNameRequired }),
    });
  }

  function onCheckoutSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await checkoutAssetAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setCheckout(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.checkout + "..." },
      success: { title: dict.checkout, description: checkout?.asset_code ?? "" },
      error: (err: unknown) => ({ title: dict.checkout, description: err instanceof Error ? err.message : "" }),
    });
  }

  function onDelete(a: Asset) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteAssetAction(a.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: a.asset_code },
      error: (err: unknown) => ({ title: dict.delete, description: err instanceof Error ? err.message : "" }),
    });
  }

  function onReturn(a: Asset) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await returnAssetAction(a.id);
        if (res.error) reject(new Error(res.error));
        else {
          setReturning(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.returnAsset + "..." },
      success: { title: dict.returnAsset, description: a.asset_code },
      error: (err: unknown) => ({ title: dict.returnAsset, description: err instanceof Error ? err.message : "" }),
    });
  }

  const selectClass =
    "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <>
      <MasterLayout
        icon={Package}
        title={dict.title}
        subtitle={dict.subtitle}
        addLabel={dict.addAsset}
        onAdd={onAdd}
        stats={[
          { label: dict.totalAssets, value: assets.length, icon: Package, tile: "bg-primary/10 text-primary" },
          { label: dict.inUse, value: inUse, icon: ArrowRightLeft, tile: "bg-chart-2/15 text-chart-2" },
          { label: dict.needAttention, value: needAttention, icon: History, tile: "bg-destructive/10 text-destructive" },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {dict.tableStatus}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-1.5 text-xs font-medium text-foreground outline-none">
              <option value="">-</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusLabel(s, dict)}</option>
              ))}
            </select>
          </label>
          <p className="text-xs text-muted-foreground tabular-nums">
            {dict.available}: {available} · {dict.inUse}: {inUse}
          </p>
        </div>
        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(a) => a.id}
          resetKey={query + statusFilter}
          totalCount={assets.length}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={dict.searchPlaceholder}
          emptyText={dict.empty}
          emptyIcon={<Package className="size-5" />}
          labels={{ showing: dict.showing, of: dict.of, previous: dict.previous, next: dict.next, page: dict.page, show: dict.show }}
        />
      </MasterLayout>

      <BlockingAlertDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`${dict.delete}: ${deleting?.asset_code ?? ""}`}
        description={dict.deleteConfirm}
        media={<Trash2 />}
        cancelLabel={dict.cancel}
        confirmLabel={dict.delete}
        confirming={pending}
        confirmClassName="bg-destructive/10 text-destructive hover:bg-destructive/20"
        onConfirm={() => deleting && onDelete(deleting)}
      />

      <BlockingAlertDialog
        open={returning !== null}
        onOpenChange={(o) => !o && setReturning(null)}
        title={`${dict.returnAsset}: ${returning?.asset_code ?? ""}`}
        description={dict.returnConfirm}
        media={<RotateCcw />}
        cancelLabel={dict.cancel}
        confirmLabel={dict.returnAsset}
        confirming={pending}
        onConfirm={() => returning && onReturn(returning)}
      />

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription className="font-mono">{detail?.asset_code}</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 py-2 text-sm sm:grid-cols-3">
            {[
              [dict.tableCategory, detail ? `${detail.category_name} (${detail.category_code})` : ""],
              [dict.vendorLabel, detail?.vendor_name],
              [dict.locationLabel, detail?.location_label],
              [dict.tableAssignee, detail?.assignee_name],
              [dict.tableStatus, detail ? statusLabel(detail.status, dict) : ""],
              [dict.conditionLabel, detail?.condition],
              [dict.purchaseDateLabel, detail?.purchase_date],
              [dict.tableValue, detail ? formatCurrency(detail.purchase_cost) : ""],
              [dict.warrantyLabel, detail?.warranty_expiry],
              [dict.serialLabel, detail?.serial_number],
              [dict.barcodeLabel, detail?.barcode],
              [dict.computerNameLabel, detail?.computer_name],
              [dict.osLabel, detail?.os_name],
              [dict.processorLabel, detail?.processor_detail],
              [dict.ramLabel, detail?.ram_capacity_gb ? `${detail.ram_capacity_gb} GB` : null],
            ].map(([label, value]) => (
              <div key={label as string} className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="break-words">{(value as string) || dict.unassigned}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">{dict.history}</h3>
            {historyLoading ? (
              <p className="text-sm text-muted-foreground">{dict.showing}...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">{dict.historyEmpty}</p>
            ) : (
              <ol className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {history.map((h) => (
                  <li key={h.history_id} className="rounded-md border p-2 text-xs">
                    <p className="font-medium">{h.activity_summary}</p>
                    <p className="text-muted-foreground">
                      {new Date(h.event_timestamp).toLocaleString("id-ID")} · {h.actor_name ?? dict.unassigned}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <DialogFooter>
            {detail && (
              <Button type="button" variant="outline" onClick={() => { setDetail(null); onEdit(detail); }}>
                <Pencil data-icon="inline-start" />
                {dict.editAsset}
              </Button>
            )}
            <Button type="button" onClick={() => setDetail(null)}>{dict.cancel}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BlockingDialog
        open={checkout !== null}
        onOpenChange={(o) => !o && setCheckout(null)}
        title={dict.checkoutTitle}
        description={checkout ? `${checkout.asset_code} · ${checkout.name}` : ""}
        cancelLabel={dict.cancel}
        saveLabel={dict.checkout}
        saving={pending}
        onSave={() => checkoutFormRef.current?.requestSubmit()}
      >
        <form ref={checkoutFormRef} onSubmit={onCheckoutSubmit}>
          <input type="hidden" name="asset_id" value={checkout?.id ?? ""} />
          <FieldGroup className="grid gap-4 py-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="employee_id">{dict.checkoutEmployee} *</FieldLabel>
              <NativeSelect id="employee_id" name="employee_id" required className={selectClass} defaultValue="">
                <NativeSelectOption value="">{dict.checkoutNone}</NativeSelectOption>
                {employees.map((e) => (
                  <NativeSelectOption key={e.id} value={e.id}>{e.full_name} ({e.nip})</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="location_id">{dict.locationLabel}</FieldLabel>
              <NativeSelect id="location_id" name="location_id" className={selectClass} defaultValue={checkout?.location_id ?? ""}>
                <NativeSelectOption value="">{dict.locationNone}</NativeSelectOption>
                {locations.map((l) => (
                  <NativeSelectOption key={l.id} value={l.id}>{l.building} - {l.room} ({l.code})</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="expected_return_date">{dict.checkoutReturnDate}</FieldLabel>
              <Input id="expected_return_date" name="expected_return_date" type="date" />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="condition_on_checkout">{dict.checkoutCondition}</FieldLabel>
              <Input id="condition_on_checkout" name="condition_on_checkout" placeholder="Baik, lengkap dengan charger" />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="checkout_notes">{dict.checkoutNotes}</FieldLabel>
              <Input id="checkout_notes" name="notes" />
            </Field>
          </FieldGroup>
        </form>
      </BlockingDialog>

      <BlockingDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? dict.editAsset : dict.addAsset}
        description={dict.subtitle}
        cancelLabel={dict.cancel}
        saveLabel={dict.save}
        saving={pending}
        onSave={() => formRef.current?.requestSubmit()}
        contentClassName="sm:max-w-2xl"
      >
        <form ref={formRef} onSubmit={onSubmit}>
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <FieldGroup className="grid gap-4 py-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="asset_code">{dict.codeLabel} *</FieldLabel>
              <Input id="asset_code" name="asset_code" required defaultValue={editing?.asset_code ?? ""} placeholder={dict.codePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">{dict.nameLabel} *</FieldLabel>
              <Input id="name" name="name" required defaultValue={editing?.name ?? ""} placeholder={dict.namePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="category_id">{dict.categoryLabel} *</FieldLabel>
              <NativeSelect id="category_id" name="category_id" required className={selectClass} defaultValue={editing?.category_id ?? ""}>
                <NativeSelectOption value="">-</NativeSelectOption>
                {categories.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="status">{dict.statusLabel}</FieldLabel>
              <NativeSelect id="status" name="status" className={selectClass} defaultValue={editing?.status ?? "available"}>
                {STATUS_OPTIONS.map((s) => (
                  <NativeSelectOption key={s} value={s}>{statusLabel(s, dict)}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="brand">{dict.brandLabel}</FieldLabel>
              <Input id="brand" name="brand" defaultValue={editing?.brand ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="model">{dict.modelLabel}</FieldLabel>
              <Input id="model" name="model" defaultValue={editing?.model ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="barcode">{dict.barcodeLabel}</FieldLabel>
              <Input id="barcode" name="barcode" defaultValue={editing?.barcode ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="serial_number">{dict.serialLabel}</FieldLabel>
              <Input id="serial_number" name="serial_number" defaultValue={editing?.serial_number ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="vendor_id">{dict.vendorLabel}</FieldLabel>
              <NativeSelect id="vendor_id" name="vendor_id" className={selectClass} defaultValue={editing?.vendor_id ?? ""}>
                <NativeSelectOption value="">{dict.vendorNone}</NativeSelectOption>
                {vendors.map((v) => (
                  <NativeSelectOption key={v.id} value={v.id}>{v.name}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="location_id">{dict.locationLabel}</FieldLabel>
              <NativeSelect id="location_id" name="location_id" className={selectClass} defaultValue={editing?.location_id ?? ""}>
                <NativeSelectOption value="">{dict.locationNone}</NativeSelectOption>
                {locations.map((l) => (
                  <NativeSelectOption key={l.id} value={l.id}>{l.building} - {l.room}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="condition">{dict.conditionLabel}</FieldLabel>
              <NativeSelect id="condition" name="condition" className={selectClass} defaultValue={editing?.condition ?? "good"}>
                {CONDITION_OPTIONS.map((c) => (
                  <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="purchase_date">{dict.purchaseDateLabel} *</FieldLabel>
              <Input id="purchase_date" name="purchase_date" type="date" required defaultValue={editing?.purchase_date?.slice(0, 10) ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="purchase_cost">{dict.purchaseCostLabel} *</FieldLabel>
              <Input id="purchase_cost" name="purchase_cost" type="number" min="0" step="0.01" required defaultValue={editing?.purchase_cost ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="warranty_expiry">{dict.warrantyLabel}</FieldLabel>
              <Input id="warranty_expiry" name="warranty_expiry" type="date" defaultValue={editing?.warranty_expiry?.slice(0, 10) ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="useful_life_years">{dict.usefulLifeLabel}</FieldLabel>
              <Input id="useful_life_years" name="useful_life_years" type="number" min="1" defaultValue={editing?.useful_life_years ?? 5} />
            </Field>
            <Field>
              <FieldLabel htmlFor="salvage_value">{dict.salvageLabel}</FieldLabel>
              <Input id="salvage_value" name="salvage_value" type="number" min="0" step="0.01" defaultValue={editing?.salvage_value ?? 0} />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notes">{dict.notesLabel}</FieldLabel>
              <Input id="notes" name="notes" defaultValue={editing?.notes ?? ""} />
            </Field>
            <div className="sm:col-span-2 border-t pt-4">
              <p className="mb-3 text-sm font-semibold">{dict.specsTitle}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="computer_name">{dict.computerNameLabel}</FieldLabel>
                  <Input id="computer_name" name="computer_name" defaultValue={editing?.computer_name ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ip_address">{dict.ipLabel}</FieldLabel>
                  <Input id="ip_address" name="ip_address" defaultValue={editing?.ip_address ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="os_name">{dict.osLabel}</FieldLabel>
                  <Input id="os_name" name="os_name" defaultValue={editing?.os_name ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="processor_detail">{dict.processorLabel}</FieldLabel>
                  <Input id="processor_detail" name="processor_detail" defaultValue={editing?.processor_detail ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ram_capacity_gb">{dict.ramLabel}</FieldLabel>
                  <Input id="ram_capacity_gb" name="ram_capacity_gb" type="number" min="0" defaultValue={editing?.ram_capacity_gb ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="storage_detail">{dict.storageLabel}</FieldLabel>
                  <Input id="storage_detail" name="storage_detail" defaultValue={editing?.storage_detail ?? ""} />
                </Field>
              </div>
            </div>
          </FieldGroup>
        </form>
      </BlockingDialog>
    </>
  );
}
