"use client";

import * as React from "react";
import { Pencil, Trash2, Building2, Network, Users, Eye } from "lucide-react";
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
import { saveDepartmentAction, deleteDepartmentAction } from "@/app/actions/departments";
import type { Department } from "@/lib/departments";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["departments"];

export function DepartmentsClient({ departments, dict }: { departments: Department[]; dict: Dict }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Department | null>(null);
  const [detail, setDetail] = React.useState<Department | null>(null);
  const [deleting, setDeleting] = React.useState<Department | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const filtered = departments.filter((d) => {
    const q = query.toLowerCase();
    return !q || [d.name, d.code, d.parent_name].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const columns: DataTableColumn<Department>[] = [
    {
      header: dict.tableName,
      render: (d) => (
        <div className="flex flex-col">
          <span className="font-medium">{d.name}</span>
          <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
        </div>
      ),
    },
    {
      header: dict.tableParent,
      cellClassName: "text-sm",
      render: (d) => d.parent_name ?? dict.unassigned,
    },
    {
      header: dict.tableMembers,
      render: (d) => (
        <Badge variant={d.member_count > 0 ? "default" : "outline"} className="text-[11px]">
          {d.member_count}
        </Badge>
      ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-24 text-center",
      render: (d) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDetail(d)} aria-label={dict.viewDetail}>
            <Eye />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(d)} aria-label={dict.editDepartment}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(d)} aria-label={dict.delete} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const topLevel = departments.filter((d) => !d.parent_id).length;
  const totalMembers = departments.reduce((n, d) => n + d.member_count, 0);

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(d: Department) {
    setEditing(d);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveDepartmentAction(null, formData);
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

  function onDelete(d: Department) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteDepartmentAction(d.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: d.name },
      error: (err: unknown) => ({ title: dict.delete, description: err instanceof Error ? err.message : "" }),
    });
  }

  return (
        <>

    <MasterLayout
      icon={Building2}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.addDepartment}
      onAdd={onAdd}
      stats={[
          { label: dict.totalDepartments, value: departments.length, icon: Building2, tile: "bg-primary/10 text-primary" },
          { label: dict.topLevel, value: topLevel, icon: Network, tile: "bg-chart-2/15 text-chart-2" },
          { label: dict.totalMembers, value: totalMembers, icon: Users, tile: "bg-chart-3/15 text-chart-3" },
      ]}
    >

          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(d) => d.id}
            resetKey={query}
            totalCount={departments.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.empty}
            emptyIcon={<Building2 className="size-5" />}
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
              <dd className="break-words font-mono text-[13px]">{detail?.code || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.parentLabel}</dt>
              <dd className="break-words">{detail?.parent_name || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableMembers}</dt>
              <dd className="break-words">{detail?.member_count ?? 0}</dd>
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
                {dict.editDepartment}
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
        title={editing ? dict.editDepartment : dict.addDepartment}
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
              <FieldLabel htmlFor="code">{dict.codeLabel} *</FieldLabel>
              <Input id="code" name="code" required defaultValue={editing?.code ?? ""} placeholder={dict.codePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="parent_id">{dict.parentLabel}</FieldLabel>
              <NativeSelect
                id="parent_id"
                name="parent_id"
                defaultValue={editing?.parent_id ?? ""}
                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <NativeSelectOption value="">{dict.parentNone}</NativeSelectOption>
                {departments
                  .filter((d) => d.id !== editing?.id)
                  .map((d) => (
                    <NativeSelectOption key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </NativeSelectOption>
                  ))}
              </NativeSelect>
            </Field>
          </FieldGroup>
        </form>
      </BlockingDialog>
    </>
  );
}
