"use client";

import * as React from "react";
import {
  Wrench,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BlockingDialog } from "@/components/ui/blocking-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import {
  saveMaintenanceAction,
  deleteMaintenanceAction,
  completeMaintenanceAction,
} from "@/app/actions/maintenance";
import type { Maintenance, MaintenanceStatus } from "@/lib/maintenance";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["maintenance"];

export interface AssetOption {
  id: string;
  name: string;
  code: string;
}

export interface OptionItem {
  id: string;
  name: string;
}

const STATUS_OPTIONS: MaintenanceStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

function statusLabel(s: string, dict: Dict): string {
  switch (s) {
    case "scheduled":
      return dict.statusScheduled;
    case "in_progress":
      return dict.statusInProgress;
    case "completed":
      return dict.statusCompleted;
    case "cancelled":
      return dict.statusCancelled;
    default:
      return s;
  }
}

function statusVariant(
  s: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    case "scheduled":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function MaintenanceClient({
  maintenances,
  assets,
  categories,
  vendors,
  dict,
}: {
  maintenances: Maintenance[];
  assets: AssetOption[];
  categories: OptionItem[];
  vendors: OptionItem[];
  dict: Dict;
}) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Maintenance | null>(null);
  const [detail, setDetail] = React.useState<Maintenance | null>(null);
  const [deleting, setDeleting] = React.useState<Maintenance | null>(null);
  const [completing, setCompleting] = React.useState<Maintenance | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);
  const completeCostRef = React.useRef<HTMLInputElement>(null);
  const completeInvoiceRef = React.useRef<HTMLInputElement>(null);

  const filtered = maintenances.filter((m) => {
    if (statusFilter && m.status !== statusFilter) return false;
    const q = query.toLowerCase();
    return (
      !q ||
      [
        m.asset_code,
        m.asset_name,
        m.category_name,
        m.vendor_name,
        m.performed_by,
        m.invoice_number,
        m.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const columns: DataTableColumn<Maintenance>[] = [
    {
      header: dict.tableAsset,
      render: (m) => (
        <div className="flex flex-col">
          <span className="font-medium">{m.asset_name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {m.asset_code}
          </span>
        </div>
      ),
    },
    {
      header: dict.tableCategory,
      cellClassName: "text-sm",
      render: (m) => m.category_name ?? dict.unassigned,
    },
    {
      header: dict.tableSchedule,
      cellClassName: "text-xs",
      render: (m) => (
        <div className="flex flex-col">
          <span>{m.scheduled_date ?? dict.unassigned}</span>
          {m.completed_date && (
            <span className="text-[11px] text-muted-foreground">
              {dict.statusCompleted}: {m.completed_date}
            </span>
          )}
        </div>
      ),
    },
    {
      header: dict.tableCost,
      cellClassName: "text-right font-mono text-xs tabular-nums",
      render: (m) => formatCurrency(m.cost),
    },
    {
      header: dict.tableStatus,
      render: (m) => (
        <Badge variant={statusVariant(m.status)} className="text-[11px]">
          {statusLabel(m.status, dict)}
        </Badge>
      ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-36 text-center",
      render: (m) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDetail(m)}
            aria-label={dict.viewDetail}
          >
            <Eye />
          </Button>
          {m.status !== "completed" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCompleting(m)}
              aria-label={dict.markCompleted}
              className="text-primary hover:text-primary"
            >
              <CheckCircle2 />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(m)}
            aria-label={dict.editMaintenance}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleting(m)}
            aria-label={dict.delete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const inProgressCount = maintenances.filter(
    (m) => m.status === "in_progress" || m.status === "scheduled"
  ).length;
  const completedCount = maintenances.filter(
    (m) => m.status === "completed"
  ).length;
  const totalCost = maintenances.reduce((acc, m) => acc + (m.cost || 0), 0);

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(m: Maintenance) {
    setEditing(m);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveMaintenanceAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpen(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: {
        title: dict.save,
        description: editing ? editing.asset_code : "",
      },
      error: (err: unknown) => ({
        title: dict.save,
        description:
          err instanceof Error ? err.message : dict.errorAssetRequired,
      }),
    });
  }

  function onDelete(m: Maintenance) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteMaintenanceAction(m.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: m.asset_code },
      error: (err: unknown) => ({
        title: dict.delete,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  function onComplete(m: Maintenance) {
    const cost = Number(completeCostRef.current?.value || m.cost || 0);
    const invoice = completeInvoiceRef.current?.value || m.invoice_number;

    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await completeMaintenanceAction(m.id, cost, invoice);
        if (res.error) reject(new Error(res.error));
        else {
          setCompleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.markCompleted + "..." },
      success: { title: dict.markCompleted, description: m.asset_code },
      error: (err: unknown) => ({
        title: dict.markCompleted,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  const selectClass =
    "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <>
      <MasterLayout
        icon={Wrench}
        title={dict.title}
        subtitle={dict.subtitle}
        addLabel={dict.addMaintenance}
        onAdd={onAdd}
        stats={[
          {
            label: dict.totalMaintenances,
            value: maintenances.length,
            icon: Wrench,
            tile: "bg-primary/10 text-primary",
          },
          {
            label: dict.activePending,
            value: inProgressCount,
            icon: Clock,
            tile: "bg-chart-2/15 text-chart-2",
          },
          {
            label: dict.totalSpend,
            value: formatCurrency(totalCost),
            icon: Coins,
            tile: "bg-chart-3/15 text-chart-3",
          },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {dict.tableStatus}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-1.5 text-xs font-medium text-foreground outline-none"
            >
              <option value="">-</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s, dict)}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-muted-foreground tabular-nums">
            {dict.activePending}: {inProgressCount} · {dict.completed}:{" "}
            {completedCount}
          </p>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(m) => m.id}
          resetKey={query + statusFilter}
          totalCount={maintenances.length}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={dict.searchPlaceholder}
          emptyText={dict.empty}
          emptyIcon={<Wrench className="size-5" />}
          labels={{
            showing: dict.showing,
            of: dict.of,
            previous: dict.previous,
            next: dict.next,
            page: dict.page,
            show: dict.show,
          }}
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

      <BlockingDialog
        open={completing !== null}
        onOpenChange={(o) => !o && setCompleting(null)}
        title={dict.markCompletedTitle}
        description={
          completing
            ? `${completing.asset_code} · ${completing.asset_name}`
            : ""
        }
        cancelLabel={dict.cancel}
        saveLabel={dict.markCompleted}
        saving={pending}
        onSave={() => completing && onComplete(completing)}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            {dict.markCompletedDesc}
          </p>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="complete_cost">{dict.costLabel}</FieldLabel>
              <Input
                ref={completeCostRef}
                id="complete_cost"
                type="number"
                min="0"
                step="0.01"
                defaultValue={completing?.cost ?? 0}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="complete_invoice">
                {dict.invoiceLabel}
              </FieldLabel>
              <Input
                ref={completeInvoiceRef}
                id="complete_invoice"
                defaultValue={completing?.invoice_number ?? ""}
                placeholder={dict.invoicePlaceholder}
              />
            </Field>
          </FieldGroup>
        </div>
      </BlockingDialog>

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.asset_name}</DialogTitle>
            <DialogDescription className="font-mono">
              {detail?.asset_code}
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 py-2 text-sm sm:grid-cols-2">
            {[
              [dict.tableCategory, detail?.category_name],
              [dict.vendorLabel, detail?.vendor_name],
              [
                dict.tableStatus,
                detail ? statusLabel(detail.status, dict) : "",
              ],
              [
                dict.tableCost,
                detail ? formatCurrency(detail.cost) : "",
              ],
              [dict.scheduledDateLabel, detail?.scheduled_date],
              [dict.completedDateLabel, detail?.completed_date],
              [dict.performedByLabel, detail?.performed_by],
              [dict.invoiceLabel, detail?.invoice_number],
            ].map(([label, value]) => (
              <div key={label as string} className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium text-muted-foreground">
                  {label}
                </dt>
                <dd className="break-words">
                  {(value as string) || dict.unassigned}
                </dd>
              </div>
            ))}
            <div className="flex flex-col gap-0.5 sm:col-span-2 border-t pt-3">
              <dt className="text-xs font-medium text-muted-foreground">
                {dict.descriptionLabel}
              </dt>
              <dd className="break-words whitespace-pre-line text-sm">
                {detail?.description}
              </dd>
            </div>
          </dl>
          <DialogFooter>
            {detail && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDetail(null);
                  onEdit(detail);
                }}
              >
                <Pencil data-icon="inline-start" />
                {dict.editMaintenance}
              </Button>
            )}
            <Button type="button" onClick={() => setDetail(null)}>
              {dict.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BlockingDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? dict.editMaintenance : dict.addMaintenance}
        description={dict.subtitle}
        cancelLabel={dict.cancel}
        saveLabel={dict.save}
        saving={pending}
        onSave={() => formRef.current?.requestSubmit()}
        contentClassName="sm:max-w-xl"
      >
        <form ref={formRef} onSubmit={onSubmit}>
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <FieldGroup className="grid gap-4 py-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="asset_id">{dict.assetLabel} *</FieldLabel>
              <NativeSelect
                id="asset_id"
                name="asset_id"
                required
                className={selectClass}
                defaultValue={editing?.asset_id ?? ""}
              >
                <NativeSelectOption value="">
                  {dict.assetPlaceholder}
                </NativeSelectOption>
                {assets.map((a) => (
                  <NativeSelectOption key={a.id} value={a.id}>
                    {a.name} ({a.code})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="category_id">
                {dict.categoryLabel}
              </FieldLabel>
              <NativeSelect
                id="category_id"
                name="category_id"
                className={selectClass}
                defaultValue={editing?.category_id ?? ""}
              >
                <NativeSelectOption value="">
                  {dict.categoryNone}
                </NativeSelectOption>
                {categories.map((c) => (
                  <NativeSelectOption key={c.id} value={c.id}>
                    {c.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="vendor_id">{dict.vendorLabel}</FieldLabel>
              <NativeSelect
                id="vendor_id"
                name="vendor_id"
                className={selectClass}
                defaultValue={editing?.vendor_id ?? ""}
              >
                <NativeSelectOption value="">
                  {dict.vendorNone}
                </NativeSelectOption>
                {vendors.map((v) => (
                  <NativeSelectOption key={v.id} value={v.id}>
                    {v.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="status">{dict.statusLabel}</FieldLabel>
              <NativeSelect
                id="status"
                name="status"
                className={selectClass}
                defaultValue={editing?.status ?? "scheduled"}
              >
                {STATUS_OPTIONS.map((s) => (
                  <NativeSelectOption key={s} value={s}>
                    {statusLabel(s, dict)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="scheduled_date">
                {dict.scheduledDateLabel}
              </FieldLabel>
              <Input
                id="scheduled_date"
                name="scheduled_date"
                type="date"
                defaultValue={editing?.scheduled_date?.slice(0, 10) ?? ""}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="cost">{dict.costLabel}</FieldLabel>
              <Input
                id="cost"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                defaultValue={editing?.cost ?? 0}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="performed_by">
                {dict.performedByLabel}
              </FieldLabel>
              <Input
                id="performed_by"
                name="performed_by"
                defaultValue={editing?.performed_by ?? ""}
                placeholder={dict.performedByPlaceholder}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="invoice_number">
                {dict.invoiceLabel}
              </FieldLabel>
              <Input
                id="invoice_number"
                name="invoice_number"
                defaultValue={editing?.invoice_number ?? ""}
                placeholder={dict.invoicePlaceholder}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="description">
                {dict.descriptionLabel} *
              </FieldLabel>
              <Textarea
                id="description"
                name="description"
                required
                rows={3}
                defaultValue={editing?.description ?? ""}
                placeholder={dict.descriptionPlaceholder}
              />
            </Field>
          </FieldGroup>
        </form>
      </BlockingDialog>
    </>
  );
}
