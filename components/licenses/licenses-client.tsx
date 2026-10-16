"use client";

import * as React from "react";
import {
  Pencil,
  Trash2,
  KeyRound,
  Eye,
  Users,
  CalendarX,
  Laptop,
  Plus,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
import { DismissibleDialog } from "@/components/ui/dismissible-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import {
  saveLicenseAction,
  deleteLicenseAction,
  allocateLicenseAction,
  deallocateLicenseAction,
  getLicenseAllocationsAction,
} from "@/app/actions/licenses";
import type { SoftwareLicense, LicenseAllocation } from "@/types";
import type { TranslationSchema } from "@/locales";
import type { AssetOption } from "@/types";

type Dict = TranslationSchema["licenses"];

export function LicensesClient({
  licenses,
  vendors,
  assets,
  dict,
}: {
  licenses: SoftwareLicense[];
  vendors: Array<{ id: string; name: string }>;
  assets: AssetOption[];
  dict: Dict;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SoftwareLicense | null>(null);
  const [detail, setDetail] = React.useState<SoftwareLicense | null>(null);
  const [allocations, setAllocations] = React.useState<LicenseAllocation[]>([]);
  const [selectedAssetId, setSelectedAssetId] = React.useState("");
  const [deleting, setDeleting] = React.useState<SoftwareLicense | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!detail) {
      setAllocations([]);
      setSelectedAssetId("");
      return;
    }
    let active = true;
    getLicenseAllocationsAction(detail.id).then((res) => {
      if (active && res.allocations) {
        setAllocations(res.allocations);
      }
    });
    return () => {
      active = false;
    };
  }, [detail]);

  const filtered = licenses.filter((l) => {
    const q = query.toLowerCase();
    return (
      !q ||
      [l.name, l.vendor_name, l.license_key]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const columns: DataTableColumn<SoftwareLicense>[] = [
    {
      header: dict.tableLicense,
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-medium">{l.name}</span>
          {l.vendor_name && (
            <span className="max-w-55 truncate text-xs text-muted-foreground">
              {l.vendor_name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: dict.tableKey,
      render: (l) =>
        l.license_key ? (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {l.license_key.length > 16
              ? `${l.license_key.slice(0, 14)}…`
              : l.license_key}
          </code>
        ) : (
          <span className="text-xs text-muted-foreground">
            {dict.unassigned}
          </span>
        ),
    },
    {
      header: dict.tableSeats,
      cellClassName: "tabular-nums text-xs",
      render: (l) => {
        const full = l.seats_used >= l.seats_total;
        return (
          <div className="flex items-center gap-1.5">
            <Badge
              variant={full ? "destructive" : "secondary"}
              className="font-mono text-[11px]"
            >
              {l.seats_used} / {l.seats_total}
            </Badge>
          </div>
        );
      },
    },
    {
      header: dict.tableExpiry,
      cellClassName: "tabular-nums text-xs",
      render: (l) =>
        l.expiry_date ? (
          <span className={l.is_expired ? "font-medium text-destructive" : ""}>
            {l.expiry_date}
            {l.is_expired && ` (${dict.expiredLabel})`}
          </span>
        ) : (
          dict.unassigned
        ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-28 text-center",
      render: (l) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDetail(l)}
            aria-label={dict.viewDetail}
          >
            <Eye />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(l)}
            aria-label={dict.editLicense}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleting(l)}
            aria-label={dict.delete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const totalSeats = licenses.reduce((acc, l) => acc + l.seats_total, 0);
  const totalUsed = licenses.reduce((acc, l) => acc + l.seats_used, 0);
  const expiredCount = licenses.filter((l) => l.is_expired).length;

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
      error: (err: unknown) => ({
        title: dict.save,
        description: err instanceof Error ? err.message : dict.errorNameRequired,
      }),
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
      error: (err: unknown) => ({
        title: dict.delete,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  function onAllocate() {
    if (!detail || !selectedAssetId) return;
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await allocateLicenseAction(detail.id, selectedAssetId);
        if (res.error) reject(new Error(res.error));
        else {
          const fresh = await getLicenseAllocationsAction(detail.id);
          if (fresh.allocations) setAllocations(fresh.allocations);
          setSelectedAssetId("");
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.allocateAsset + "..." },
      success: { title: dict.allocateAsset },
      error: (err: unknown) => ({
        title: dict.allocateAsset,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  function onDeallocate(allocId: string) {
    if (!detail) return;
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deallocateLicenseAction(allocId);
        if (res.error) reject(new Error(res.error));
        else {
          const fresh = await getLicenseAllocationsAction(detail.id);
          if (fresh.allocations) setAllocations(fresh.allocations);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.releaseLicense + "..." },
      success: { title: dict.releaseLicense },
      error: (err: unknown) => ({
        title: dict.releaseLicense,
        description: err instanceof Error ? err.message : "",
      }),
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
          {
            label: dict.totalLicenses,
            value: licenses.length,
            icon: KeyRound,
            tile: "bg-primary/10 text-primary",
          },
          {
            label: dict.seatsInUse,
            value: `${totalUsed} / ${totalSeats}`,
            icon: Users,
            tile: "bg-chart-2/15 text-chart-2",
          },
          {
            label: dict.expired,
            value: expiredCount,
            icon: CalendarX,
            tile: "bg-destructive/10 text-destructive",
          },
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

      {/* Detail Dialog with Software Allocations */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>{dict.viewDetail}</DialogDescription>
          </DialogHeader>

          <dl className="grid gap-3 py-2 text-sm sm:grid-cols-2 border-b pb-4">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">
                {dict.vendorLabel}
              </dt>
              <dd className="break-words">
                {detail?.vendor_name || dict.unassigned}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">
                {dict.expiryLabel}
              </dt>
              <dd className="break-words tabular-nums">
                {detail?.expiry_date || dict.unassigned}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                {dict.keyLabel}
              </dt>
              <dd className="break-all font-mono text-xs bg-muted p-1.5 rounded">
                {detail?.license_key || dict.unassigned}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">
                {dict.tableSeats}
              </dt>
              <dd className="break-words tabular-nums font-semibold">
                {detail ? `${allocations.length} / ${detail.seats_total}` : ""}
              </dd>
            </div>
          </dl>

          {/* Allocation Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Laptop className="size-4 text-primary" />
              {dict.allocatedAssetsTitle} ({allocations.length})
            </h4>

            {/* Allocate form */}
            <div className="flex items-center gap-2">
              <NativeSelect
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none"
              >
                <NativeSelectOption value="">
                  {dict.selectAsset}
                </NativeSelectOption>
                {assets.map((a) => (
                  <NativeSelectOption key={a.id} value={a.id}>
                    {a.name} ({a.code})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button
                size="sm"
                variant="secondary"
                disabled={!selectedAssetId || pending}
                onClick={onAllocate}
                className="gap-1 h-8 text-xs"
              >
                <Plus className="size-3.5" />
                {dict.allocateAsset}
              </Button>
            </div>

            {/* Allocation list */}
            {allocations.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                {dict.emptyAllocations}
              </p>
            ) : (
              <div className="divide-y rounded-md border text-xs max-h-48 overflow-y-auto">
                {allocations.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 hover:bg-muted/50"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{a.asset_name}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {a.asset_code}{" "}
                        {a.user_name && `· User: ${a.user_name}`}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeallocate(a.id)}
                      disabled={pending}
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      {dict.releaseLicense}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            {detail && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const curr = detail;
                  setDetail(null);
                  onEdit(curr);
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

      <DismissibleDialog
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
              <Input
                id="name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                placeholder={dict.namePlaceholder}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="seats_total">{dict.seatsLabel} *</FieldLabel>
              <Input
                id="seats_total"
                name="seats_total"
                type="number"
                min={1}
                required
                defaultValue={editing?.seats_total ?? 1}
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="license_key">{dict.keyLabel}</FieldLabel>
              <Input
                id="license_key"
                name="license_key"
                defaultValue={editing?.license_key ?? ""}
                placeholder="XXXX-XXXX-XXXX"
                className="font-mono"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="vendor_id">{dict.vendorLabel}</FieldLabel>
              <NativeSelect
                id="vendor_id"
                name="vendor_id"
                defaultValue={editing?.vendor_id ?? "none"}
                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <NativeSelectOption value="none">
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
              <FieldLabel htmlFor="expiry_date">{dict.expiryLabel}</FieldLabel>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                defaultValue={editing?.expiry_date ?? ""}
              />
            </Field>
          </FieldGroup>
        </form>
      </DismissibleDialog>
    </>
  );
}
