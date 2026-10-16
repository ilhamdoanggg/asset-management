"use client";

import * as React from "react";
import {
  Calculator,
  Play,
  Plus,
  Trash2,
  FileText,
  TrendingDown,
  Archive,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DismissibleDialog } from "@/components/ui/dismissible-dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { MasterLayout } from "@/components/master/master-layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import {
  runMonthlyDepreciationAction,
  addDepreciationEntryAction,
  addDisposalAction,
} from "@/app/actions/depreciation";

import type { TranslationSchema } from "@/locales";
import type { AssetOption, DepreciationEntry, DepreciationSummary, DisposalEntry, EmployeeOption } from "@/types";

type Dict = TranslationSchema["depreciation"];

export function DepreciationClient({
  entries,
  disposals,
  summary,
  assets,
  employees,
  dict,
}: {
  entries: DepreciationEntry[];
  disposals: DisposalEntry[];
  summary: DepreciationSummary;
  assets: AssetOption[];
  employees: EmployeeOption[];
  dict: Dict;
}) {
  const [activeTab, setActiveTab] = React.useState("ledger");
  const [query, setQuery] = React.useState("");
  const [openRunDialog, setOpenRunDialog] = React.useState(false);
  const [openManualDialog, setOpenManualDialog] = React.useState(false);
  const [openDisposalDialog, setOpenDisposalDialog] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const manualFormRef = React.useRef<HTMLFormElement>(null);
  const disposalFormRef = React.useRef<HTMLFormElement>(null);

  const filteredEntries = entries.filter((e) => {
    const q = query.toLowerCase();
    return (
      !q ||
      [e.asset_code, e.asset_name, e.category_name, e.period_date]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const filteredDisposals = disposals.filter((d) => {
    const q = query.toLowerCase();
    return (
      !q ||
      [d.asset_code, d.asset_name, d.reason, d.approved_by_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const ledgerColumns: DataTableColumn<DepreciationEntry>[] = [
    {
      header: dict.tableAsset,
      render: (e) => (
        <div className="flex flex-col">
          <span className="font-medium">{e.asset_name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {e.asset_code}
          </span>
        </div>
      ),
    },
    {
      header: dict.tableCategory,
      cellClassName: "text-sm",
      render: (e) => e.category_name,
    },
    {
      header: dict.tablePeriod,
      cellClassName: "font-mono text-xs",
      render: (e) => e.period_date,
    },
    {
      header: dict.tableDepreciation,
      cellClassName: "text-right font-mono text-xs tabular-nums text-destructive",
      render: (e) => `- ${formatCurrency(e.depreciation_amount)}`,
    },
    {
      header: dict.tableBookValue,
      cellClassName: "text-right font-mono text-xs tabular-nums font-semibold",
      render: (e) => formatCurrency(e.book_value),
    },
  ];

  const disposalColumns: DataTableColumn<DisposalEntry>[] = [
    {
      header: dict.tableAsset,
      render: (d) => (
        <div className="flex flex-col">
          <span className="font-medium">{d.asset_name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {d.asset_code}
          </span>
        </div>
      ),
    },
    {
      header: dict.tableDisposalDate,
      cellClassName: "font-mono text-xs",
      render: (d) => d.disposal_date,
    },
    {
      header: dict.tableReason,
      render: (d) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{d.reason}</span>
          {d.notes && (
            <span className="text-xs text-muted-foreground truncate max-w-xs">
              {d.notes}
            </span>
          )}
        </div>
      ),
    },
    {
      header: dict.tableSalePrice,
      cellClassName: "text-right font-mono text-xs tabular-nums",
      render: (d) => formatCurrency(d.sale_price),
    },
    {
      header: dict.tableApprovedBy,
      cellClassName: "text-sm",
      render: (d) => d.approved_by_name ?? dict.unassigned,
    },
  ];

  function onRunMonthly() {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await runMonthlyDepreciationAction();
        if (res.error) reject(new Error(res.error));
        else {
          setOpenRunDialog(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.runDepreciation + "..." },
      success: { title: dict.runDepreciation, description: "Proses selesai." },
      error: (err: unknown) => ({
        title: dict.runDepreciation,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  function onManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await addDepreciationEntryAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpenManualDialog(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.addEntry },
      error: (err: unknown) => ({
        title: dict.save,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  function onDisposalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await addDisposalAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpenDisposalDialog(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.addDisposal },
      error: (err: unknown) => ({
        title: dict.save,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  const selectClass = "w-full";

  return (
    <>
      <MasterLayout
        icon={Calculator}
        title={dict.title}
        subtitle={dict.subtitle}
        addLabel={dict.addEntry}
        onAdd={() => setOpenManualDialog(true)}
        stats={[
          {
            label: dict.totalDepreciation,
            value: formatCurrency(summary.totalDepreciationValue),
            icon: TrendingDown,
            tile: "bg-destructive/10 text-destructive",
          },
          {
            label: dict.totalEntries,
            value: summary.totalEntries,
            icon: FileText,
            tile: "bg-primary/10 text-primary",
          },
          {
            label: dict.totalDisposals,
            value: summary.totalDisposals,
            icon: Archive,
            tile: "bg-chart-2/15 text-chart-2",
          },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
            <TabsList>
              <TabsTrigger value="ledger">{dict.tabLedger}</TabsTrigger>
              <TabsTrigger value="disposals">{dict.tabDisposals}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenRunDialog(true)}
              className="gap-1.5"
            >
              <Play className="size-3.5" />
              {dict.runDepreciation}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpenDisposalDialog(true)}
              className="gap-1.5"
            >
              <Archive className="size-3.5" />
              {dict.addDisposal}
            </Button>
          </div>
        </div>

        {activeTab === "ledger" ? (
          <DataTable
            data={filteredEntries}
            columns={ledgerColumns}
            rowKey={(e) => e.id}
            resetKey={query + activeTab}
            totalCount={entries.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.empty}
            emptyIcon={<Calculator className="size-5" />}
            labels={{
              showing: dict.showing,
              of: dict.of,
              previous: dict.previous,
              next: dict.next,
              page: dict.page,
              show: dict.show,
            }}
          />
        ) : (
          <DataTable
            data={filteredDisposals}
            columns={disposalColumns}
            rowKey={(d) => d.id}
            resetKey={query + activeTab}
            totalCount={disposals.length}
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={dict.searchPlaceholder}
            emptyText={dict.emptyDisposal}
            emptyIcon={<Archive className="size-5" />}
            labels={{
              showing: dict.showing,
              of: dict.of,
              previous: dict.previous,
              next: dict.next,
              page: dict.page,
              show: dict.show,
            }}
          />
        )}
      </MasterLayout>

      {/* Confirmation to run monthly depreciation */}
      <BlockingAlertDialog
        open={openRunDialog}
        onOpenChange={setOpenRunDialog}
        title={dict.runDepreciation}
        description={dict.runConfirm}
        media={<Play />}
        cancelLabel={dict.cancel}
        confirmLabel={dict.runDepreciation}
        confirming={pending}
        onConfirm={onRunMonthly}
      />

      {/* Manual Depreciation Dialog */}
      <DismissibleDialog
        open={openManualDialog}
        onOpenChange={setOpenManualDialog}
        title={dict.addEntry}
        description={dict.subtitle}
        cancelLabel={dict.cancel}
        saveLabel={dict.save}
        saving={pending}
        onSave={() => manualFormRef.current?.requestSubmit()}
        contentClassName="sm:max-w-md"
      >
        <form ref={manualFormRef} onSubmit={onManualSubmit}>
          <FieldGroup className="grid gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="entry_asset_id">
                {dict.assetLabel} *
              </FieldLabel>
              <NativeSelect
                id="entry_asset_id"
                name="asset_id"
                required
                className={selectClass}
                defaultValue=""
              >
                <NativeSelectOption value="">
                  {dict.assetPlaceholder}
                </NativeSelectOption>
                {assets.map((a) => (
                  <NativeSelectOption key={a.id} value={a.id}>
                    {a.name} ({a.code})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="period_date">
                {dict.periodLabel} *
              </FieldLabel>
              <Input
                id="period_date"
                name="period_date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="depreciation_amount">
                {dict.amountLabel} *
              </FieldLabel>
              <Input
                id="depreciation_amount"
                name="depreciation_amount"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0"
              />
            </Field>
          </FieldGroup>
        </form>
      </DismissibleDialog>

      {/* Asset Disposal Dialog */}
      <DismissibleDialog
        open={openDisposalDialog}
        onOpenChange={setOpenDisposalDialog}
        title={dict.addDisposal}
        description={dict.subtitle}
        cancelLabel={dict.cancel}
        saveLabel={dict.save}
        saving={pending}
        onSave={() => disposalFormRef.current?.requestSubmit()}
        contentClassName="sm:max-w-lg"
      >
        <form ref={disposalFormRef} onSubmit={onDisposalSubmit}>
          <FieldGroup className="grid gap-4 py-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="disp_asset_id">
                {dict.assetLabel} *
              </FieldLabel>
              <NativeSelect
                id="disp_asset_id"
                name="asset_id"
                required
                className={selectClass}
                defaultValue=""
              >
                <NativeSelectOption value="">
                  {dict.assetPlaceholder}
                </NativeSelectOption>
                {assets.map((a) => (
                  <NativeSelectOption key={a.id} value={a.id}>
                    {a.name} ({a.code})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="disposal_date">
                {dict.disposalDateLabel} *
              </FieldLabel>
              <Input
                id="disposal_date"
                name="disposal_date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="sale_price">
                {dict.salePriceLabel}
              </FieldLabel>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={0}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="reason">{dict.reasonLabel} *</FieldLabel>
              <Input
                id="reason"
                name="reason"
                required
                placeholder={dict.reasonPlaceholder}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="approved_by">
                {dict.approverLabel}
              </FieldLabel>
              <NativeSelect
                id="approved_by"
                name="approved_by"
                className={selectClass}
                defaultValue=""
              >
                <NativeSelectOption value="">
                  {dict.approverNone}
                </NativeSelectOption>
                {employees.map((emp) => (
                  <NativeSelectOption key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.nip})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notes">{dict.notesLabel}</FieldLabel>
              <Input id="notes" name="notes" />
            </Field>
          </FieldGroup>
        </form>
      </DismissibleDialog>
    </>
  );
}
