"use client";

import * as React from "react";
import { Pencil, Trash2, MapPin, Building2, Package, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { BlockingDialog } from "@/components/ui/blocking-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import { saveLocationAction, deleteLocationAction } from "@/app/actions/locations";
import type { Location } from "@/lib/locations";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["locations"];

export function LocationsClient({ locations, dict }: { locations: Location[]; dict: Dict }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Location | null>(null);
  const [detail, setDetail] = React.useState<Location | null>(null);
  const [deleting, setDeleting] = React.useState<Location | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const filtered = locations.filter((l) => {
    const q = query.toLowerCase();
    return !q || [l.code, l.building, l.floor, l.room].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const columns: DataTableColumn<Location>[] = [
    {
      header: dict.tableLocation,
      render: (l) => (
        <div className="flex flex-col">
          <span className="font-medium">{l.room}</span>
          <span className="max-w-55 truncate font-mono text-xs text-muted-foreground">{l.code}</span>
        </div>
      ),
    },
    {
      header: dict.tableBuilding,
      cellClassName: "text-sm",
      render: (l) => l.building,
    },
    {
      header: dict.tableFloor,
      cellClassName: "text-sm",
      render: (l) => l.floor ?? dict.unassigned,
    },
    {
      header: dict.tableAssets,
      render: (l) => (
        <Badge variant={l.asset_count > 0 ? "default" : "outline"} className="text-[11px]">
          {l.asset_count}
        </Badge>
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
          <Button variant="ghost" size="icon" onClick={() => onEdit(l)} aria-label={dict.editLocation}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(l)} aria-label={dict.delete} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const totalBuildings = new Set(locations.map((l) => l.building)).size;
  const totalAssets = locations.reduce((n, l) => n + l.asset_count, 0);

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(l: Location) {
    setEditing(l);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveLocationAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpen(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.save, description: editing ? editing.code : "" },
      error: (err: unknown) => ({ title: dict.save, description: err instanceof Error ? err.message : dict.errorCodeRequired }),
    });
  }

  function onDelete(l: Location) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteLocationAction(l.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: l.code },
      error: (err: unknown) => ({ title: dict.delete, description: err instanceof Error ? err.message : "" }),
    });
  }

  return (
        <>

    <MasterLayout
      icon={MapPin}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.addLocation}
      onAdd={onAdd}
      stats={[
          { label: dict.totalLocations, value: locations.length, icon: MapPin, tile: "bg-primary/10 text-primary" },
          { label: dict.totalBuildings, value: totalBuildings, icon: Building2, tile: "bg-chart-2/15 text-chart-2" },
          { label: dict.totalAssets, value: totalAssets, icon: Package, tile: "bg-chart-3/15 text-chart-3" },
      ]}
    >

          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(l) => l.id}
            resetKey={query}
            totalCount={locations.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.empty}
            emptyIcon={<MapPin className="size-5" />}
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
        title={`${dict.delete}: ${deleting?.code ?? ""}`}
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
            <DialogTitle>{detail?.room}</DialogTitle>
            <DialogDescription>{dict.viewDetail}</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 py-2 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.codeLabel}</dt>
              <dd className="break-words font-mono text-[13px]">{detail?.code || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.buildingLabel}</dt>
              <dd className="break-words">{detail?.building || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.floorLabel}</dt>
              <dd className="break-words">{detail?.floor || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableAssets}</dt>
              <dd className="break-words">{detail?.asset_count ?? 0}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">{dict.addressLabel}</dt>
              <dd className="break-words whitespace-pre-line">{detail?.address || dict.unassigned}</dd>
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
                {dict.editLocation}
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
        title={editing ? dict.editLocation : dict.addLocation}
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
            <Field>
              <FieldLabel htmlFor="code">{dict.codeLabel} *</FieldLabel>
              <Input id="code" name="code" required defaultValue={editing?.code ?? ""} placeholder={dict.codePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="building">{dict.buildingLabel} *</FieldLabel>
              <Input id="building" name="building" required defaultValue={editing?.building ?? ""} placeholder={dict.buildingPlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="floor">{dict.floorLabel}</FieldLabel>
              <Input id="floor" name="floor" defaultValue={editing?.floor ?? ""} placeholder={dict.floorPlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="room">{dict.roomLabel} *</FieldLabel>
              <Input id="room" name="room" required defaultValue={editing?.room ?? ""} placeholder={dict.roomPlaceholder} />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="address">{dict.addressLabel}</FieldLabel>
              <Input id="address" name="address" defaultValue={editing?.address ?? ""} placeholder={dict.addressPlaceholder} />
            </Field>
          </FieldGroup>
        </form>
      </BlockingDialog>
    </>
  );
}
