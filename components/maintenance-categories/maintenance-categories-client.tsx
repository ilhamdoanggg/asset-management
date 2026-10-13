"use client";

import * as React from "react";
import { Pencil, Trash2, Wrench, Eye, Timer, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { BlockingDialog } from "@/components/ui/blocking-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import { saveMaintenanceCategoryAction, deleteMaintenanceCategoryAction } from "@/app/actions/maintenance-categories";
import type { MaintenanceCategory } from "@/lib/maintenance-categories";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["maintenanceCategories"];

export function MaintenanceCategoriesClient({ items, dict }: { items: MaintenanceCategory[]; dict: Dict }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MaintenanceCategory | null>(null);
  const [detail, setDetail] = React.useState<MaintenanceCategory | null>(null);
  const [deleting, setDeleting] = React.useState<MaintenanceCategory | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const filtered = items.filter((c) => {
    const q = query.toLowerCase();
    return !q || [c.name, c.code, c.description].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const fmtInterval = (days: number | null) =>
    days === null || days === undefined ? dict.unassigned : dict.intervalDays.replace("{n}", String(days));

  const columns: DataTableColumn<MaintenanceCategory>[] = [
    {
      header: dict.tableCategory,
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-medium">{c.name}</span>
          {c.description && <span className="max-w-55 truncate text-xs text-muted-foreground">{c.description}</span>}
        </div>
      ),
    },
    {
      header: dict.tableCode,
      cellClassName: "font-mono text-xs",
      render: (c) => c.code,
    },
    {
      header: dict.tableInterval,
      cellClassName: "text-xs tabular-nums",
      render: (c) => fmtInterval(c.interval_days),
    },
    {
      header: dict.tableCapitalized,
      render: (c) => (
        <Badge variant={c.is_capitalized ? "default" : "outline"} className="text-[11px]">
          {c.is_capitalized ? dict.yesLabel : dict.noLabel}
        </Badge>
      ),
    },
    {
      header: dict.tableUsage,
      render: (c) => (
        <Badge variant={c.usage_count > 0 ? "default" : "outline"} className="text-[11px] tabular-nums">
          {c.usage_count}
        </Badge>
      ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-24 text-center",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDetail(c)} aria-label={dict.viewDetail}>
            <Eye />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(c)} aria-label={dict.editCategory}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(c)} aria-label={dict.delete} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const capitalized = items.filter((c) => c.is_capitalized).length;
  const totalUsage = items.reduce((n, c) => n + c.usage_count, 0);

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(c: MaintenanceCategory) {
    setEditing(c);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveMaintenanceCategoryAction(null, formData);
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

  function onDelete(c: MaintenanceCategory) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteMaintenanceCategoryAction(c.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: c.name },
      error: (err: unknown) => ({ title: dict.delete, description: err instanceof Error ? err.message : "" }),
    });
  }

  return (
        <>

    <MasterLayout
      icon={Wrench}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.addCategory}
      onAdd={onAdd}
      stats={[
          { label: dict.totalCategories, value: String(items.length), icon: Wrench, tile: "bg-primary/10 text-primary" },
          { label: dict.capitalized, value: String(capitalized), icon: Coins, tile: "bg-chart-2/15 text-chart-2" },
          { label: dict.totalUsage, value: String(totalUsage), icon: Timer, tile: "bg-chart-3/15 text-chart-3" },
      ]}
    >

          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(c) => c.id}
            resetKey={query}
            totalCount={items.length}
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
              <dt className="text-xs font-medium text-muted-foreground">{dict.codeLabel}</dt>
              <dd className="break-words font-mono text-[13px]">{detail?.code}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableInterval}</dt>
              <dd className="break-words tabular-nums">{detail ? fmtInterval(detail.interval_days) : ""}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableCapitalized}</dt>
              <dd className="break-words">{detail ? (detail.is_capitalized ? dict.yesLabel : dict.noLabel) : ""}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableUsage}</dt>
              <dd className="break-words tabular-nums">{detail?.usage_count}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">{dict.descriptionLabel}</dt>
              <dd className="break-words whitespace-pre-line">{detail?.description || dict.unassigned}</dd>
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
                {dict.editCategory}
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
        title={editing ? dict.editCategory : dict.addCategory}
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
              <Input id="code" name="code" required defaultValue={editing?.code ?? ""} placeholder={dict.codePlaceholder} className="font-mono" />
            </Field>
            <Field>
              <FieldLabel htmlFor="name">{dict.nameLabel} *</FieldLabel>
              <Input id="name" name="name" required defaultValue={editing?.name ?? ""} placeholder={dict.namePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="interval_days">{dict.intervalLabel}</FieldLabel>
              <Input id="interval_days" name="interval_days" type="number" min={0} defaultValue={editing?.interval_days ?? ""} placeholder={dict.intervalPlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="is_capitalized">{dict.capitalizedLabel}</FieldLabel>
              <Field orientation="horizontal">
                <Checkbox
                  id="is_capitalized"
                  name="is_capitalized"
                  defaultChecked={editing?.is_capitalized ?? false}
                />
                <FieldLabel htmlFor="is_capitalized">{dict.yesLabel}</FieldLabel>
              </Field>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="description">{dict.descriptionLabel}</FieldLabel>
              <Input id="description" name="description" defaultValue={editing?.description ?? ""} placeholder={dict.descriptionPlaceholder} />
            </Field>
          </FieldGroup>
        </form>
      </BlockingDialog>
    </>
  );
}
