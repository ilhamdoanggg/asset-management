"use client";

import * as React from "react";
import { Pencil, Trash2, Tags, Eye, Package, Coins } from "lucide-react";
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
import { saveCategoryAction, deleteCategoryAction } from "@/app/actions/categories";
import type { Category } from "@/lib/categories";
import type { TranslationSchema } from "@/locales";
import { formatCompactIDR } from "@/lib/format";

type Dict = TranslationSchema["categories"];

export function CategoriesClient({ categories, dict }: { categories: Category[]; dict: Dict }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [detail, setDetail] = React.useState<Category | null>(null);
  const [deleting, setDeleting] = React.useState<Category | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const filtered = categories.filter((c) => {
    const q = query.toLowerCase();
    return !q || [c.name, c.code, c.description].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const columns: DataTableColumn<Category>[] = [
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
      header: dict.tableAssets,
      render: (c) => (
        <Badge variant={c.asset_count > 0 ? "default" : "outline"} className="text-[11px] tabular-nums">
          {c.asset_count}
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

  const totalAssets = categories.reduce((n, c) => n + c.asset_count, 0);
  const totalValue = categories.reduce((n, c) => n + Number(c.asset_value), 0);

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(c: Category) {
    setEditing(c);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveCategoryAction(null, formData);
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

  function onDelete(c: Category) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteCategoryAction(c.id);
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
      icon={Tags}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.addCategory}
      onAdd={onAdd}
      stats={[
          { label: dict.totalCategories, value: String(categories.length), icon: Tags, tile: "bg-primary/10 text-primary" },
          { label: dict.totalAssets, value: String(totalAssets), icon: Package, tile: "bg-chart-2/15 text-chart-2" },
          { label: dict.totalValue, value: formatCompactIDR(totalValue), icon: Coins, tile: "bg-chart-3/15 text-chart-3" },
      ]}
    >

          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(c) => c.id}
            resetKey={query}
            totalCount={categories.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.empty}
            emptyIcon={<Tags className="size-5" />}
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
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableAssets}</dt>
              <dd className="tabular-nums">{detail?.asset_count} · {detail ? formatCompactIDR(Number(detail.asset_value)) : ""}</dd>
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
