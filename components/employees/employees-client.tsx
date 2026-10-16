"use client";

import * as React from "react";
import { Pencil, Trash2, Users, UserCheck, Package, Eye } from "lucide-react";
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
import { DismissibleDialog } from "@/components/ui/dismissible-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import { saveEmployeeAction, deleteEmployeeAction } from "@/app/actions/employees";
import type { Employee } from "@/types";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["employees"];

export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
}

export function EmployeesClient({
  employees,
  departments,
  dict,
}: {
  employees: Employee[];
  departments: DepartmentOption[];
  dict: Dict;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Employee | null>(null);
  const [detail, setDetail] = React.useState<Employee | null>(null);
  const [deleting, setDeleting] = React.useState<Employee | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const filtered = employees.filter((e) => {
    const q = query.toLowerCase();
    return !q || [e.nip, e.full_name, e.email, e.job_title, e.department_name].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const columns: DataTableColumn<Employee>[] = [
    {
      header: dict.tableEmployee,
      render: (e) => (
        <div className="flex flex-col">
          <span className="font-medium">{e.full_name}</span>
          <span className="font-mono text-xs text-muted-foreground">{e.nip}</span>
        </div>
      ),
    },
    {
      header: dict.tableDepartment,
      cellClassName: "text-sm",
      render: (e) => e.department_name ?? dict.unassigned,
    },
    {
      header: dict.tableStatus,
      render: (e) => (
        <Badge variant={e.status === "active" ? "default" : "secondary"} className="text-[11px]">
          {e.status === "active" ? dict.statusActive : dict.statusInactive}
        </Badge>
      ),
    },
    {
      header: dict.tableAssets,
      render: (e) => (
        <Badge variant={e.asset_count > 0 ? "default" : "outline"} className="text-[11px]">
          {e.asset_count}
        </Badge>
      ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-24 text-center",
      render: (e) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDetail(e)} aria-label={dict.viewDetail}>
            <Eye />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(e)} aria-label={dict.editEmployee}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(e)} aria-label={dict.delete} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const activeCount = employees.filter((e) => e.status === "active").length;
  const holdingAssets = employees.filter((e) => e.asset_count > 0).length;

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(e: Employee) {
    setEditing(e);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveEmployeeAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpen(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.save, description: editing ? editing.full_name : "" },
      error: (err: unknown) => ({ title: dict.save, description: err instanceof Error ? err.message : dict.errorNameRequired }),
    });
  }

  function onDelete(e: Employee) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteEmployeeAction(e.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: e.full_name },
      error: (err: unknown) => ({ title: dict.delete, description: err instanceof Error ? err.message : "" }),
    });
  }

  return (
        <>

    <MasterLayout
      icon={Users}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.addEmployee}
      onAdd={onAdd}
      stats={[
          { label: dict.totalEmployees, value: employees.length, icon: Users, tile: "bg-primary/10 text-primary" },
          { label: dict.activeEmployees, value: activeCount, icon: UserCheck, tile: "bg-chart-2/15 text-chart-2" },
          { label: dict.holdingAssets, value: holdingAssets, icon: Package, tile: "bg-chart-3/15 text-chart-3" },
      ]}
    >

          <DataTable
            data={filtered}
            columns={columns}
            rowKey={(e) => e.id}
            resetKey={query}
            totalCount={employees.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.empty}
            emptyIcon={<Users className="size-5" />}
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
        title={`${dict.delete}: ${deleting?.full_name ?? ""}`}
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
            <DialogTitle>{detail?.full_name}</DialogTitle>
            <DialogDescription>{dict.viewDetail}</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 py-2 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.nipLabel}</dt>
              <dd className="break-words font-mono text-[13px]">{detail?.nip || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.jobLabel}</dt>
              <dd className="break-words">{detail?.job_title || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.emailLabel}</dt>
              <dd className="break-words">{detail?.email || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.phoneLabel}</dt>
              <dd className="break-words">{detail?.phone || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.departmentLabel}</dt>
              <dd className="break-words">{detail?.department_name || dict.unassigned}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableAssets}</dt>
              <dd className="break-words">{detail?.asset_count ?? 0}</dd>
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
                {dict.editEmployee}
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
        title={editing ? dict.editEmployee : dict.addEmployee}
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
              <FieldLabel htmlFor="nip">{dict.nipLabel} *</FieldLabel>
              <Input id="nip" name="nip" required defaultValue={editing?.nip ?? ""} placeholder={dict.nipPlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="full_name">{dict.nameLabel} *</FieldLabel>
              <Input id="full_name" name="full_name" required defaultValue={editing?.full_name ?? ""} placeholder={dict.namePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="job_title">{dict.jobLabel}</FieldLabel>
              <Input id="job_title" name="job_title" defaultValue={editing?.job_title ?? ""} placeholder={dict.jobPlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">{dict.emailLabel} *</FieldLabel>
              <Input id="email" name="email" type="email" required defaultValue={editing?.email ?? ""} placeholder="nama@perusahaan.co.id" />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">{dict.phoneLabel}</FieldLabel>
              <Input id="phone" name="phone" defaultValue={editing?.phone ?? ""} placeholder={dict.phonePlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="department_id">{dict.departmentLabel}</FieldLabel>
              <NativeSelect
                id="department_id"
                name="department_id"
                defaultValue={editing?.department_id ?? ""}
                className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <NativeSelectOption value="">{dict.departmentNone}</NativeSelectOption>
                {departments.map((d) => (
                  <NativeSelectOption key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="status">{dict.statusLabel}</FieldLabel>
              <Input id="status" name="status" defaultValue={editing?.status ?? "active"} placeholder="active" />
            </Field>
          </FieldGroup>
        </form>
      </DismissibleDialog>
    </>
  );
}
