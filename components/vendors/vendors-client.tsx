"use client";

import * as React from "react";
import { Pencil, Trash2, Store, Eye, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { DismissibleDialog } from "@/components/ui/dismissible-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { toast } from "@/components/ui/toast";
import { MasterLayout } from "@/components/master/master-layout";
import { saveVendorAction, deleteVendorAction } from "@/app/actions/vendors";
import type { Vendor } from "@/types";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["vendors"];

export function VendorsClient({ vendors, dict }: { vendors: Vendor[]; dict: Dict }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vendor | null>(null);
  const [detail, setDetail] = React.useState<Vendor | null>(null);
  const [deleting, setDeleting] = React.useState<Vendor | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const filtered = vendors.filter((v) => {
    const q = query.toLowerCase();
    return !q || [v.name, v.contact_name, v.email, v.phone].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const columns: DataTableColumn<Vendor>[] = [
    {
      header: dict.tableName,
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-medium">{v.name}</span>
          {v.address && <span className="max-w-55 truncate text-xs text-muted-foreground">{v.address}</span>}
        </div>
      ),
    },
    {
      header: dict.tableContact,
      cellClassName: "text-sm",
      render: (v) => v.contact_name ?? dict.unassigned,
    },
    {
      header: dict.tablePhone,
      cellClassName: "font-mono text-xs",
      render: (v) => v.phone ?? dict.unassigned,
    },
    {
      header: dict.tableEmail,
      cellClassName: "text-xs",
      render: (v) => v.email ?? dict.unassigned,
    },
    {
      header: dict.tableWebsite,
      render: (v) =>
        v.website ? (
          <a href={v.website.startsWith("http") ? v.website : `https://${v.website}`} target="_blank" rel="noreferrer">
            <Badge variant="outline" className="text-[11px]">{v.website.replace(/^https?:\/\//, "").slice(0, 24)}</Badge>
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">{dict.unassigned}</span>
        ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-24 text-center",
      render: (v) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDetail(v)} aria-label={dict.viewDetail}>
            <Eye />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(v)} aria-label={dict.editVendor}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(v)} aria-label={dict.delete} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const withWebsite = vendors.filter((v) => v.website).length;
  const withEmail = vendors.filter((v) => v.email).length;

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(v: Vendor) {
    setEditing(v);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveVendorAction(null, formData);
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

  function onDelete(v: Vendor) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteVendorAction(v.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: v.name },
      error: (err: unknown) => ({ title: dict.delete, description: err instanceof Error ? err.message : "" }),
    });
  }

  return (
    <>
    <MasterLayout
      icon={Store}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.addVendor}
      onAdd={onAdd}
      stats={[
        { label: dict.totalVendors, value: vendors.length, icon: Store, tile: "bg-primary/10 text-primary" },
        { label: dict.withWebsite, value: withWebsite, icon: Globe, tile: "bg-chart-2/15 text-chart-2" },
        { label: dict.withEmail, value: withEmail, icon: Mail, tile: "bg-chart-3/15 text-chart-3" },
      ]}
    >
      <DataTable
            data={filtered}
            columns={columns}
            rowKey={(v) => v.id}
            resetKey={query}
            totalCount={vendors.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.empty}
            emptyIcon={<Store className="size-5" />}
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
            {[
              [dict.contactLabel, detail?.contact_name],
              [dict.phoneLabel, detail?.phone],
              [dict.emailLabel, detail?.email],
              [dict.websiteLabel, detail?.website],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="break-words">{value || dict.unassigned}</dd>
              </div>
            ))}
            {[
              [dict.addressLabel, detail?.address],
              [dict.descriptionLabel, detail?.description],
              [dict.notesLabel, detail?.notes],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 sm:col-span-2">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="break-words whitespace-pre-line">{value || dict.unassigned}</dd>
              </div>
            ))}
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
                {dict.editVendor}
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
        title={editing ? dict.editVendor : dict.addVendor}
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
              <FieldLabel htmlFor="contact_name">{dict.contactLabel}</FieldLabel>
              <Input id="contact_name" name="contact_name" defaultValue={editing?.contact_name ?? ""} placeholder={dict.contactPlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">{dict.phoneLabel}</FieldLabel>
              <Input id="phone" name="phone" defaultValue={editing?.phone ?? ""} placeholder={dict.phonePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">{dict.emailLabel}</FieldLabel>
              <Input id="email" name="email" type="email" defaultValue={editing?.email ?? ""} placeholder="vendor@example.com" />
            </Field>
            <Field>
              <FieldLabel htmlFor="website">{dict.websiteLabel}</FieldLabel>
              <Input id="website" name="website" defaultValue={editing?.website ?? ""} placeholder={dict.websitePlaceholder} />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="address">{dict.addressLabel}</FieldLabel>
              <Input id="address" name="address" defaultValue={editing?.address ?? ""} placeholder={dict.addressPlaceholder} />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notes">{dict.notesLabel}</FieldLabel>
              <Input id="notes" name="notes" defaultValue={editing?.notes ?? editing?.description ?? ""} placeholder={dict.descriptionLabel} />
            </Field>
          </FieldGroup>
        </form>
      </DismissibleDialog>
    </>
  );
}
