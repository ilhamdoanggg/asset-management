"use client";

import * as React from "react";
import { Pencil, Trash2, Umbrella, Eye, ShieldCheck, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { BlockingDialog } from "@/components/ui/blocking-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { toast } from "@/components/ui/toast";
import { saveInsuranceAction, deleteInsuranceAction } from "@/app/actions/insurances";
import type { InsurancePolicy } from "@/lib/insurances";
import type { TranslationSchema } from "@/locales";
import { formatCompactIDR } from "@/lib/format";

type Dict = TranslationSchema["insurances"];

export function InsurancesClient({ policies, dict }: { policies: InsurancePolicy[]; dict: Dict }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<InsurancePolicy | null>(null);
  const [detail, setDetail] = React.useState<InsurancePolicy | null>(null);
  const [deleting, setDeleting] = React.useState<InsurancePolicy | null>(null);
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const filtered = policies.filter((p) => {
    const q = query.toLowerCase();
    return !q || [p.policy_number, p.provider, p.notes].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const columns: DataTableColumn<InsurancePolicy>[] = [
    {
      header: dict.tablePolicy,
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-medium">{p.policy_number}</span>
          {p.notes && <span className="max-w-55 truncate text-xs text-muted-foreground">{p.notes}</span>}
        </div>
      ),
    },
    {
      header: dict.tableProvider,
      cellClassName: "text-sm",
      render: (p) => p.provider,
    },
    {
      header: dict.tablePeriod,
      cellClassName: "text-xs tabular-nums",
      render: (p) => `${p.start_date} → ${p.end_date}`,
    },
    {
      header: dict.tablePremium,
      cellClassName: "text-xs tabular-nums",
      render: (p) => formatCompactIDR(Number(p.premium)),
    },
    {
      header: dict.tableStatus,
      render: (p) => (
        <Badge variant={p.is_active ? "default" : "destructive"} className="text-[11px]">
          {p.is_active ? dict.activeLabel : dict.expiredLabel}
        </Badge>
      ),
    },
    {
      header: dict.tableAssets,
      render: (p) => (
        <Badge variant={p.asset_count > 0 ? "default" : "outline"} className="text-[11px] tabular-nums">
          {p.asset_count}
        </Badge>
      ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-24 text-center",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDetail(p)} aria-label={dict.viewDetail}>
            <Eye />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(p)} aria-label={dict.editPolicy}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleting(p)} aria-label={dict.delete} className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const active = policies.filter((p) => p.is_active).length;
  const totalPremium = policies.reduce((n, p) => n + Number(p.premium), 0);

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(p: InsurancePolicy) {
    setEditing(p);
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveInsuranceAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpen(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.save, description: editing ? editing.policy_number : "" },
      error: (err: unknown) => ({ title: dict.save, description: err instanceof Error ? err.message : dict.errorRequired }),
    });
  }

  function onDelete(p: InsurancePolicy) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteInsuranceAction(p.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: p.policy_number },
      error: (err: unknown) => ({ title: dict.delete, description: err instanceof Error ? err.message : "" }),
    });
  }

  return (
    <>
    <MasterLayout
      icon={Umbrella}
      title={dict.title}
      subtitle={dict.subtitle}
      addLabel={dict.addPolicy}
      onAdd={onAdd}
      stats={[
        { label: dict.totalPolicies, value: policies.length, icon: Umbrella, tile: "bg-primary/10 text-primary" },
        { label: dict.activePolicies, value: active, icon: ShieldCheck, tile: "bg-chart-2/15 text-chart-2" },
        { label: dict.totalPremium, value: formatCompactIDR(totalPremium), icon: Banknote, tile: "bg-chart-3/15 text-chart-3" },
      ]}
    >
      <DataTable
            data={filtered}
            columns={columns}
            rowKey={(p) => p.id}
            resetKey={query}
            totalCount={policies.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.empty}
            emptyIcon={<Umbrella className="size-5" />}
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
        title={`${dict.delete}: ${deleting?.policy_number ?? ""}`}
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
            <DialogTitle>{detail?.policy_number}</DialogTitle>
            <DialogDescription>{dict.viewDetail}</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 py-2 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.providerLabel}</dt>
              <dd className="break-words">{detail?.provider}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableStatus}</dt>
              <dd className="break-words">{detail ? (detail.is_active ? dict.activeLabel : dict.expiredLabel) : ""}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.startLabel}</dt>
              <dd className="tabular-nums">{detail?.start_date}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.endLabel}</dt>
              <dd className="tabular-nums">{detail?.end_date}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tablePremium}</dt>
              <dd className="tabular-nums">{detail ? formatCompactIDR(Number(detail.premium)) : ""}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted-foreground">{dict.tableAssets}</dt>
              <dd className="tabular-nums">{detail?.asset_count}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">{dict.notesLabel}</dt>
              <dd className="break-words whitespace-pre-line">{detail?.notes || dict.unassigned}</dd>
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
                {dict.editPolicy}
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
        title={editing ? dict.editPolicy : dict.addPolicy}
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
              <FieldLabel htmlFor="policy_number">{dict.policyNumberLabel} *</FieldLabel>
              <Input id="policy_number" name="policy_number" required defaultValue={editing?.policy_number ?? ""} placeholder={dict.policyNumberPlaceholder} className="font-mono" />
            </Field>
            <Field>
              <FieldLabel htmlFor="provider">{dict.providerLabel} *</FieldLabel>
              <Input id="provider" name="provider" required defaultValue={editing?.provider ?? ""} placeholder={dict.providerPlaceholder} />
            </Field>
            <Field>
              <FieldLabel htmlFor="start_date">{dict.startLabel} *</FieldLabel>
              <Input id="start_date" name="start_date" type="date" required defaultValue={editing?.start_date ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="end_date">{dict.endLabel} *</FieldLabel>
              <Input id="end_date" name="end_date" type="date" required defaultValue={editing?.end_date ?? ""} />
            </Field>
            <Field>
              <FieldLabel htmlFor="premium">{dict.premiumLabel}</FieldLabel>
              <Input id="premium" name="premium" type="number" min={0} step="0.01" defaultValue={editing?.premium ?? "0"} />
            </Field>
            <Field>
              <FieldLabel htmlFor="notes">{dict.notesLabel}</FieldLabel>
              <Input id="notes" name="notes" defaultValue={editing?.notes ?? ""} />
            </Field>
          </FieldGroup>
        </form>
      </BlockingDialog>
    </>
  );
}
