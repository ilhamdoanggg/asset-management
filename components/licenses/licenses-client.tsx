"use client";

import * as React from "react";
import { Pencil, Trash2, KeyRound, Eye, Users, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { BlockingDialog } from "@/components/ui/blocking-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import { saveLicenseAction, deleteLicenseAction } from "@/app/actions/licenses";
import type { SoftwareLicense } from "@/lib/licenses";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["licenses"];

export function LicensesClient({
  licenses,
  vendors,
  dict,
}: {
  licenses: SoftwareLicense[];
  vendors: Array<{ id: string; name: string }>;
  dict: Dict;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SoftwareLicense | null>(null);
  const [detail, setDetail] = React.useState<SoftwareLicense | null>(null);
  const [deleting, setDeleting] = React.useState<SoftwareLicense | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const filtered = licenses.filter((l) => {
    const q = query.toLowerCase();
    return !q || [l.name, l.vendor_name, l.license_key].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const columns: DataTableColumn<SoftwareLicense>[] = [
    {
      header: dict.tableLicense,
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-medium">{l.name}</span>
          {l.vendor_name && <span className="max-w-55 truncate text-xs text-muted-foreground">{l.vendor_name}</span>}
        </div>
      ),
    },
    {
      header: dict.tableKey,
      cellClassName: "font-mono text-xs",
      render: (l) => (l.license_key ? `${l.license_key.slice(0, 18)}${l.license_key.length > 18 ? "…" : ""}` : dict.unassigned),
    },
    {
      header: dict.tableSeats,
      render: (l) => (
        <Badge variant={l.seats_used >= l.seats_total ? "destructive" : l.seats_used > 0 ? "default" : "outline"} className="text-[11px] tabular-nums">
          {dict.seatsUsage.replace("{u}", String(l.seats_used)).replace("{t}", String(l.seats_total))}
        </Badge>
      ),
    },
    {
      header: dict.tableExpiry,
      cellClassName: "text-xs tabular-nums",
      render: (l) =>
        l.is_expired ? (
          <Badge variant="destructive" className="text-[11px]">{dict.expiredLabel}</Badge>
        ) : (
          l.expiry_date ?? dict.unassigned
        ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-24 text-center",
      render: (l) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDetail(l)} aria-label={dict.viewDetail}>
            <Eye />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(l)} aria-label={dict.editLicense}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(l)} aria-label={dict.delete} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const seatsUsed = licenses.reduce((n, l) => n + l.seats_used, 0);
  const seatsTotal = licenses.reduce((n, l) => n + l.seats_total, 0);
  const expired = licenses.filter((l) => l.is_expired).length;

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(l: SoftwareLicense) {
    setEditing(l);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveLicenseAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpen(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.save, description: editing ? editing.name : "" },
      error: (err: unknown) => ({ title: dict.save, description: err instanceof Error ? err.message : dict.errorNameRequired }),
    });
  }

  function onDelete(l: SoftwareLicense) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteLicenseAction(l.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: l.name },
      error: (err: unknown) => ({ title: dict.delete, description: err instanceof Error ? err.message : "" }),
    });
  }

  return (
        <>

    <MasterLayout
      icon={KeyRound}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.addLicense}
      onAdd={onAdd}
      stats={[
          { label: dict.totalLicenses, value: String(licenses.length), icon: KeyRound, tile: "bg-primary/10 text-primary" },
          { label: dict.seatsInUse, value: `${seatsUsed}/${seatsTotal}`, icon: Users, tile: "bg-chart-2/15 text-chart-2" },
          { label: dict.expired, value: String(expired), icon: CalendarX, tile: "bg-chart-3/15 text-chart-3" },
      ]}
    >

          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(l) => l.id}
            resetKey={query}
            totalCount={licenses.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.empty}
            emptyIcon={<KeyRound className="size-5" />}
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
        title={`${dict.delete}: ${deleting?.name ?? ""}`}
        description={dict.deleteConfirm}
        media={<Trash2 />}
        cancelLabel={dict.cancel}
        confirmLabel={dict.delete}
        confirming={pending}
        confirmClassName="bg-destructive/10 text-destructive hover:bg-destructive/20"
        onConfirm={() => deleting && onDelete(deleting)}
      />

      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>{dict.viewDetail}</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 py-2 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.vendorLabel}</dt>
              <dd className="break-words">{detail?.vendor_name || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">{dict.keyLabel}</dt>
              <dd className="break-all font-mono text-xs">{detail?.license_key || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableSeats}</dt>
              <dd className="break-words tabular-nums">{detail ? `${detail.seats_used}/${detail.seats_total}` : ""}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.expiryLabel}</dt>
              <dd className="break-words tabular-nums">{detail?.expiry_date || dict.unassigned}</dd>
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
                {dict.editLicense}
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
        title={editing ? dict.editLicense : dict.addLicense}
        description={dict.subtitle}
        cancelLabel={dict.cancel}
        saveLabel={dict.save}
        saving={pending}
        onSave={() => formRef.current?.requestSubmit()}
        contentClassName="sm:max-w-lg"
      >
        <form ref={formRef} onSubmit={onSubmit}>
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <FieldGroup className="grid gap-4 py-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="name">{dict.nameLabel} *</FieldLabel>
              <Input id="name" name="name" required defaultValue={editing?.name ?? ""} placeholder={dict.namePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="seats_total">{dict.seatsLabel} *</FieldLabel>
              <Input id="seats_total" name="seats_total" type="number" min={1} required defaultValue={editing?.seats_total ?? 1} />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="license_key">{dict.keyLabel}</FieldLabel>
              <Input id="license_key" name="license_key" defaultValue={editing?.license_key ?? ""} placeholder="XXXX-XXXX-XXXX" className="font-mono" />
            </Field>
            <Field>
              <FieldLabel htmlFor="vendor_id">{dict.vendorLabel}</FieldLabel>
              <NativeSelect
                id="vendor_id"
                name="vendor_id"
                defaultValue={editing?.vendor_id ?? "none"}
                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <NativeSelectOption value="none">{dict.vendorNone}</NativeSelectOption>
                {vendors.map((v) => (
                  <NativeSelectOption key={v.id} value={v.id}>{v.name}</NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="expiry_date">{dict.expiryLabel}</FieldLabel>
              <Input id="expiry_date" name="expiry_date" type="date" defaultValue={editing?.expiry_date ?? ""} />
            </Field>
          </FieldGroup>
        </form>
      </BlockingDialog>
    </>
  );
}
