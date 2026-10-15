"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Package, Eye, ArrowRightLeft, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DismissibleDialog } from "@/components/ui/dismissible-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import {
  deleteAssetAction,
  checkoutAssetAction,
  returnAssetAction,
} from "@/app/actions/assets";
import type { Asset } from "@/lib/assets";
import {
  STATUS_OPTIONS,
  selectClass,
  statusLabel,
  statusVariant,
  type AssetDict,
  type LocationOption,
} from "@/components/assets/asset-utils";

export interface EmployeeOption {
  id: string;
  full_name: string;
  nip: string;
}

export function AssetsClient({
  assets,
  locations,
  employees,
  dict,
  locale,
}: {
  assets: Asset[];
  locations: LocationOption[];
  employees: EmployeeOption[];
  dict: AssetDict;
  locale: string;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [deleting, setDeleting] = React.useState<Asset | null>(null);
  const [checkout, setCheckout] = React.useState<Asset | null>(null);
  const [returning, setReturning] = React.useState<Asset | null>(null);
  const [pending, startTransition] = React.useTransition();
  const checkoutFormRef = React.useRef<HTMLFormElement>(null);

  const baseHref = `/${locale}/dashboard/assets`;

  const filtered = assets.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    const q = query.toLowerCase();
    return !q || [a.asset_code, a.name, a.brand, a.model, a.serial_number, a.assignee_name, a.category_name]
      .filter(Boolean).join(" ").toLowerCase().includes(q);
  });

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
          <Button variant="ghost" size="icon" aria-label={dict.viewDetail} render={<Link href={`${baseHref}/${a.id}`} />}>
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
          <Button variant="ghost" size="icon" aria-label={dict.editAsset} render={<Link href={`${baseHref}/${a.id}/edit`} />}>
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
    router.push(`${baseHref}/new`);
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
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>{dict.tableStatus}</span>
            <NativeSelect
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <NativeSelectOption value="">-</NativeSelectOption>
              {STATUS_OPTIONS.map((s) => (
                <NativeSelectOption key={s} value={s}>{statusLabel(s, dict)}</NativeSelectOption>
              ))}
            </NativeSelect>
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

      <DismissibleDialog
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
      </DismissibleDialog>
    </>
  );
}

