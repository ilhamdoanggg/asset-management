"use client";

import * as React from "react";
import {
  ClipboardCheck,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  createAuditAction,
  updateAuditItemAction,
  completeAuditAction,
  deleteAuditAction,
  getAuditItemsAction,
} from "@/app/actions/audits";
import type { AssetAudit, AuditItem, AuditItemStatus, AuditLocationOption, AuditStatus, AuditorOption } from "@/types";
import type { TranslationSchema } from "@/locales";

type Dict = TranslationSchema["audits"];

function statusBadgeVariant(
  s: AuditStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    case "canceled":
      return "destructive";
    default:
      return "outline";
  }
}

function itemStatusBadgeVariant(
  s: AuditItemStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "match":
      return "default";
    case "misplaced":
      return "secondary";
    case "damaged":
      return "destructive";
    case "missing":
      return "destructive";
    default:
      return "outline";
  }
}

export function AuditsClient({
  audits,
  auditors,
  locations,
  dict,
}: {
  audits: AssetAudit[];
  auditors: AuditorOption[];
  locations: AuditLocationOption[];
  dict: Dict;
}) {
  const [query, setQuery] = React.useState("");
  const [openCreate, setOpenCreate] = React.useState(false);
  const [activeWorksheet, setActiveWorksheet] = React.useState<AssetAudit | null>(
    null
  );
  const [worksheetItems, setWorksheetItems] = React.useState<AuditItem[]>([]);
  const [itemFilter, setItemFilter] = React.useState<string>("all");
  const [itemQuery, setItemQuery] = React.useState("");
  const [editingItem, setEditingItem] = React.useState<AuditItem | null>(null);
  const [completing, setCompleting] = React.useState<AssetAudit | null>(null);
  const [deleting, setDeleting] = React.useState<AssetAudit | null>(null);
  const [pending, startTransition] = React.useTransition();

  const createFormRef = React.useRef<HTMLFormElement>(null);
  const editItemFormRef = React.useRef<HTMLFormElement>(null);

  // Load worksheet items when active audit changes
  React.useEffect(() => {
    if (!activeWorksheet) {
      setWorksheetItems([]);
      setItemQuery("");
      setItemFilter("all");
      return;
    }
    let active = true;
    getAuditItemsAction(activeWorksheet.id).then((res) => {
      if (active && res.items) {
        setWorksheetItems(res.items);
      }
    });
    return () => {
      active = false;
    };
  }, [activeWorksheet]);

  const filteredAudits = audits.filter((a) => {
    const q = query.toLowerCase();
    return (
      !q ||
      [a.audit_code, a.title, a.lead_auditor_name, a.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const columns: DataTableColumn<AssetAudit>[] = [
    {
      header: dict.tableAuditCode,
      cellClassName: "font-mono text-xs font-semibold",
      render: (a) => a.audit_code,
    },
    {
      header: dict.tableTitle,
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{a.title}</span>
          {a.lead_auditor_name && (
            <span className="text-xs text-muted-foreground">
              Auditor: {a.lead_auditor_name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: dict.tablePeriod,
      cellClassName: "text-xs font-mono",
      render: (a) => (
        <div className="flex flex-col">
          <span>{a.start_date}</span>
          {a.end_date && (
            <span className="text-[11px] text-muted-foreground">
              {dict.statusCompleted}: {a.end_date}
            </span>
          )}
        </div>
      ),
    },
    {
      header: dict.tableProgress,
      cellClassName: "text-xs tabular-nums",
      render: (a) => {
        const verified = a.matched_items + a.discrepancy_items;
        const pct = a.total_items > 0 ? Math.round((verified / a.total_items) * 100) : 0;
        return (
          <div className="flex flex-col gap-1 min-w-28">
            <div className="flex justify-between text-[11px] font-mono">
              <span>{verified} / {a.total_items}</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: dict.tableStatus,
      render: (a) => (
        <Badge variant={statusBadgeVariant(a.status)} className="text-[11px]">
          {a.status === "completed"
            ? dict.statusCompleted
            : a.status === "in_progress"
            ? dict.statusInProgress
            : dict.statusCanceled}
        </Badge>
      ),
    },
    {
      header: dict.tableActions,
      headerClassName: "w-36 text-center",
      render: (a) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveWorksheet(a)}
            aria-label={dict.auditDetail}
          >
            <Eye />
          </Button>
          {a.status !== "completed" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCompleting(a)}
              aria-label={dict.completeSession}
              className="text-primary hover:text-primary"
            >
              <CheckCircle2 />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleting(a)}
            aria-label={dict.delete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  function onCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await createAuditAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else {
          setOpenCreate(false);
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.createAudit + "..." },
      success: { title: dict.createAudit },
      error: (err: unknown) => ({
        title: dict.createAudit,
        description: err instanceof Error ? err.message : dict.errorCodeRequired,
      }),
    });
  }

  function onComplete(a: AssetAudit) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await completeAuditAction(a.id);
        if (res.error) reject(new Error(res.error));
        else {
          setCompleting(null);
          if (activeWorksheet?.id === a.id) {
            setActiveWorksheet(null);
          }
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.completeSession + "..." },
      success: { title: dict.completeSession, description: a.audit_code },
      error: (err: unknown) => ({
        title: dict.completeSession,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  function onDelete(a: AssetAudit) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await deleteAuditAction(a.id);
        if (res.error) reject(new Error(res.error));
        else {
          setDeleting(null);
          if (activeWorksheet?.id === a.id) {
            setActiveWorksheet(null);
          }
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.delete + "..." },
      success: { title: dict.delete, description: a.audit_code },
      error: (err: unknown) => ({
        title: dict.delete,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  function onQuickMatch(item: AuditItem) {
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await updateAuditItemAction(item.id, {
          status_found: "match",
          actual_location_id: item.expected_location_id,
          actual_employee_id: item.expected_employee_id,
        });
        if (res.error) reject(new Error(res.error));
        else {
          if (activeWorksheet) {
            const fresh = await getAuditItemsAction(activeWorksheet.id);
            if (fresh.items) setWorksheetItems(fresh.items);
          }
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.quickMatch + "..." },
      success: { title: dict.quickMatch, description: item.asset_code },
      error: (err: unknown) => ({
        title: dict.quickMatch,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  function onEditItemSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingItem) return;
    const formData = new FormData(e.currentTarget);
    const status_found = formData.get("status_found") as AuditItemStatus;
    const actual_location_id = (formData.get("actual_location_id") as string) || null;
    const actual_employee_id = (formData.get("actual_employee_id") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await updateAuditItemAction(editingItem.id, {
          status_found,
          actual_location_id,
          actual_employee_id,
          notes,
        });
        if (res.error) reject(new Error(res.error));
        else {
          setEditingItem(null);
          if (activeWorksheet) {
            const fresh = await getAuditItemsAction(activeWorksheet.id);
            if (fresh.items) setWorksheetItems(fresh.items);
          }
          resolve(res);
        }
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.save, description: editingItem.asset_code },
      error: (err: unknown) => ({
        title: dict.save,
        description: err instanceof Error ? err.message : "",
      }),
    });
  }

  const filteredWorksheetItems = worksheetItems.filter((item) => {
    if (itemFilter !== "all" && item.status_found !== itemFilter) return false;
    const q = itemQuery.toLowerCase();
    return (
      !q ||
      [
        item.asset_code,
        item.asset_name,
        item.expected_location_name,
        item.actual_location_name,
        item.expected_employee_name,
        item.actual_employee_name,
        item.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const inProgressCount = audits.filter((a) => a.status === "in_progress").length;
  const completedCount = audits.filter((a) => a.status === "completed").length;

  const selectClass = "w-full";

  return (
    <>
      <MasterLayout
        icon={ClipboardCheck}
        title={dict.title}
        subtitle={dict.subtitle}
        addLabel={dict.createAudit}
        onAdd={() => setOpenCreate(true)}
        stats={[
          {
            label: dict.totalAudits,
            value: audits.length,
            icon: ClipboardCheck,
            tile: "bg-primary/10 text-primary",
          },
          {
            label: dict.activeAudits,
            value: inProgressCount,
            icon: Clock,
            tile: "bg-chart-2/15 text-chart-2",
          },
          {
            label: dict.completedAudits,
            value: completedCount,
            icon: CheckCircle2,
            tile: "bg-chart-3/15 text-chart-3",
          },
        ]}
      >
        <DataTable
          data={filteredAudits}
          columns={columns}
          rowKey={(a) => a.id}
          resetKey={query}
          totalCount={audits.length}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={dict.searchPlaceholder}
          emptyText={dict.empty}
          emptyIcon={<ClipboardCheck className="size-5" />}
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

      {/* Create Audit Session Dialog */}
      <DismissibleDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title={dict.createAudit}
        description={dict.subtitle}
        cancelLabel={dict.cancel}
        saveLabel={dict.save}
        saving={pending}
        onSave={() => createFormRef.current?.requestSubmit()}
        contentClassName="sm:max-w-lg"
      >
        <form ref={createFormRef} onSubmit={onCreateSubmit}>
          <FieldGroup className="grid gap-4 py-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="audit_code">{dict.codeLabel} *</FieldLabel>
              <Input
                id="audit_code"
                name="audit_code"
                required
                placeholder={dict.codePlaceholder}
                className="font-mono"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="start_date">
                {dict.startDateLabel} *
              </FieldLabel>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="title">{dict.titleLabel} *</FieldLabel>
              <Input
                id="title"
                name="title"
                required
                placeholder={dict.titlePlaceholder}
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="lead_auditor_id">
                {dict.auditorLabel}
              </FieldLabel>
              <NativeSelect
                id="lead_auditor_id"
                name="lead_auditor_id"
                className={selectClass}
                defaultValue=""
              >
                <NativeSelectOption value="">
                  {dict.auditorNone}
                </NativeSelectOption>
                {auditors.map((emp) => (
                  <NativeSelectOption key={emp.id} value={emp.id}>
                    {emp.name} ({emp.nip})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notes">{dict.notesLabel}</FieldLabel>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Catatan ruang lingkup audit..."
              />
            </Field>
          </FieldGroup>
        </form>
      </DismissibleDialog>

      {/* Delete Confirmation */}
      <BlockingAlertDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`${dict.delete}: ${deleting?.audit_code ?? ""}`}
        description={dict.deleteConfirm}
        media={<Trash2 />}
        cancelLabel={dict.cancel}
        confirmLabel={dict.delete}
        confirming={pending}
        confirmClassName="bg-destructive/10 text-destructive hover:bg-destructive/20"
        onConfirm={() => deleting && onDelete(deleting)}
      />

      {/* Complete Confirmation */}
      <BlockingAlertDialog
        open={completing !== null}
        onOpenChange={(o) => !o && setCompleting(null)}
        title={dict.completeSession}
        description={dict.completeSessionConfirm}
        media={<CheckCircle2 />}
        cancelLabel={dict.cancel}
        confirmLabel={dict.completeSession}
        confirming={pending}
        onConfirm={() => completing && onComplete(completing)}
      />

      {/* Audit Worksheet Dialog */}
      <Dialog
        open={activeWorksheet !== null}
        onOpenChange={(o) => !o && setActiveWorksheet(null)}
      >
        <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
          <DialogHeader className="shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-lg">
                  {activeWorksheet?.title}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {activeWorksheet?.audit_code} · {activeWorksheet?.start_date}
                </DialogDescription>
              </div>
              <Badge
                variant={statusBadgeVariant(
                  activeWorksheet?.status ?? "in_progress"
                )}
              >
                {activeWorksheet?.status === "completed"
                  ? dict.statusCompleted
                  : dict.statusInProgress}
              </Badge>
            </div>
          </DialogHeader>

          {/* Worksheet Controls & Filter */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder="Cari aset di lembar audit..."
                value={itemQuery}
                onChange={(e) => setItemQuery(e.target.value)}
                className="h-8 text-xs max-w-xs"
              />
              <NativeSelect
                value={itemFilter}
                onChange={(e) => setItemFilter(e.target.value)}
                className="h-8 w-44 rounded-md border border-input bg-background px-2 text-xs outline-none"
              >
                <NativeSelectOption value="all">Semua Status</NativeSelectOption>
                <NativeSelectOption value="pending">
                  {dict.statusPending}
                </NativeSelectOption>
                <NativeSelectOption value="match">
                  {dict.statusMatch}
                </NativeSelectOption>
                <NativeSelectOption value="misplaced">
                  {dict.statusMisplaced}
                </NativeSelectOption>
                <NativeSelectOption value="missing">
                  {dict.statusMissing}
                </NativeSelectOption>
                <NativeSelectOption value="damaged">
                  {dict.statusDamaged}
                </NativeSelectOption>
              </NativeSelect>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {filteredWorksheetItems.length} aset
            </p>
          </div>

          {/* Worksheet Items Table */}
          <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-md divide-y">
            {filteredWorksheetItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground italic">
                {dict.emptyItems}
              </div>
            ) : (
              filteredWorksheetItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-[180px]">
                    <span className="font-medium text-sm">
                      {item.asset_name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.asset_code}
                    </span>
                  </div>

                  {/* Location comparison */}
                  <div className="flex flex-col text-xs text-muted-foreground min-w-[160px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground" />
                      Sistem: {item.expected_location_name || dict.unassigned}
                    </span>
                    {item.actual_location_name && (
                      <span className="font-medium text-foreground">
                        Fisik: {item.actual_location_name}
                      </span>
                    )}
                  </div>

                  {/* Custodian comparison */}
                  <div className="flex flex-col text-xs text-muted-foreground min-w-[160px]">
                    <span className="flex items-center gap-1">
                      <User className="size-3 text-muted-foreground" />
                      Sistem: {item.expected_employee_name || dict.unassigned}
                    </span>
                    {item.actual_employee_name && (
                      <span className="font-medium text-foreground">
                        Fisik: {item.actual_employee_name}
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="min-w-[90px]">
                    <Badge
                      variant={itemStatusBadgeVariant(item.status_found)}
                      className="text-[11px]"
                    >
                      {item.status_found === "match"
                        ? dict.statusMatch
                        : item.status_found === "misplaced"
                        ? dict.statusMisplaced
                        : item.status_found === "damaged"
                        ? dict.statusDamaged
                        : item.status_found === "missing"
                        ? dict.statusMissing
                        : dict.statusPending}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onQuickMatch(item)}
                      disabled={pending || item.status_found === "match"}
                      className="h-8 gap-1 text-xs text-primary hover:text-primary"
                    >
                      <Check className="size-3.5" />
                      {dict.quickMatch}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                      disabled={pending}
                      className="h-8 gap-1 text-xs"
                    >
                      <Pencil className="size-3.5" />
                      {dict.scanAsset}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveWorksheet(null)}
            >
              {dict.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify / Scan Asset Dialog */}
      <DismissibleDialog
        open={editingItem !== null}
        onOpenChange={(o) => !o && setEditingItem(null)}
        title={dict.scanAsset}
        description={
          editingItem
            ? `${editingItem.asset_code} · ${editingItem.asset_name}`
            : ""
        }
        cancelLabel={dict.cancel}
        saveLabel={dict.save}
        saving={pending}
        onSave={() => editItemFormRef.current?.requestSubmit()}
        contentClassName="sm:max-w-md"
      >
        <form ref={editItemFormRef} onSubmit={onEditItemSubmit}>
          <FieldGroup className="grid gap-3 py-3">
            <Field>
              <FieldLabel htmlFor="status_found">
                {dict.tableFoundStatus} *
              </FieldLabel>
              <NativeSelect
                id="status_found"
                name="status_found"
                className={selectClass}
                defaultValue={editingItem?.status_found ?? "match"}
              >
                <NativeSelectOption value="match">
                  {dict.statusMatch}
                </NativeSelectOption>
                <NativeSelectOption value="misplaced">
                  {dict.statusMisplaced}
                </NativeSelectOption>
                <NativeSelectOption value="damaged">
                  {dict.statusDamaged}
                </NativeSelectOption>
                <NativeSelectOption value="missing">
                  {dict.statusMissing}
                </NativeSelectOption>
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="actual_location_id">
                {dict.tableActualLoc}
              </FieldLabel>
              <NativeSelect
                id="actual_location_id"
                name="actual_location_id"
                className={selectClass}
                defaultValue={
                  editingItem?.actual_location_id ??
                  editingItem?.expected_location_id ??
                  ""
                }
              >
                <NativeSelectOption value="">
                  {dict.locationPlaceholder}
                </NativeSelectOption>
                {locations.map((loc) => (
                  <NativeSelectOption key={loc.id} value={loc.id}>
                    {loc.building_name} - {loc.room_name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="actual_employee_id">
                {dict.tableActualUser}
              </FieldLabel>
              <NativeSelect
                id="actual_employee_id"
                name="actual_employee_id"
                className={selectClass}
                defaultValue={
                  editingItem?.actual_employee_id ??
                  editingItem?.expected_employee_id ??
                  ""
                }
              >
                <NativeSelectOption value="">
                  {dict.userPlaceholder}
                </NativeSelectOption>
                {auditors.map((emp) => (
                  <NativeSelectOption key={emp.id} value={emp.id}>
                    {emp.name} ({emp.nip})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">{dict.notesLabel}</FieldLabel>
              <Input
                id="notes"
                name="notes"
                defaultValue={editingItem?.notes ?? ""}
                placeholder="Catatan temuan..."
              />
            </Field>
          </FieldGroup>
        </form>
      </DismissibleDialog>
    </>
  );
}
