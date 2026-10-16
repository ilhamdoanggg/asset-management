"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { toast } from "@/components/ui/toast";
import { saveAssetAction } from "@/app/actions/assets";
import type { Asset } from "@/types";
import type { AssetOption, LocationOption } from "@/types";
import {
  CONDITION_OPTIONS,
  STATUS_OPTIONS,
  selectClass,
  statusLabel,
  type AssetDict,
} from "@/components/assets/asset-utils";

interface AssetFormProps {
  mode: "create" | "edit";
  asset?: Asset | null;
  categories: AssetOption[];
  vendors: AssetOption[];
  locations: LocationOption[];
  dict: AssetDict;
  locale: string;
  onSuccess?: () => void;
}

/** Full-page create/edit form for an asset. */
export function AssetForm({
  mode,
  asset,
  categories,
  vendors,
  locations,
  dict,
  locale,
  onSuccess,
}: AssetFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [dirty, setDirty] = React.useState(false);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const listHref = `/${locale}/dashboard/assets`;
  const isEdit = mode === "edit";

  // Track whether to show computer specs based on category
  const [showComputerSpecs, setShowComputerSpecs] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

  function goBack() {
    if (dirty) setConfirmDiscard(true);
    else router.push(listHref);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = new Promise((resolve, reject) => {
      startTransition(async () => {
        const res = await saveAssetAction(null, formData);
        if (res.error) reject(new Error(res.error));
        else resolve(res);
      });
    });
    toast.promise(promise, {
      loading: { title: dict.save + "..." },
      success: { title: dict.save, description: asset?.asset_code ?? "" },
      error: (err: unknown) => ({
        title: dict.save,
        description: err instanceof Error ? err.message : dict.errorNameRequired,
      }),
    });
    promise.then(() => {
      router.push(listHref);
      onSuccess?.();
      toast.success(dict.bastGenerated, `BAST ID: bast-${asset?.asset_code?.slice(0, 4)}-${Date.now().toString().slice(-4).toUpperCase()}`);
    }).catch(() => {});
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goBack}
          aria-label={dict.backToAssets}
          className="mt-0.5 shrink-0"
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {isEdit ? dict.editAsset : dict.addAsset}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? dict.editSubtitle : dict.newSubtitle}
          </p>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        onChange={() => setDirty(true)}
        className="flex flex-col gap-6"
      >
        <input type="hidden" name="id" value={asset?.id ?? ""} />

        <Card>
          <CardHeader>
            <CardTitle>{dict.basicSection}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="asset_code">{dict.codeLabel} *</FieldLabel>
                <Input id="asset_code" name="asset_code" required defaultValue={asset?.asset_code ?? ""} placeholder={dict.codePlaceholder} />
              </Field>
              <Field>
                <FieldLabel htmlFor="name">{dict.nameLabel} *</FieldLabel>
                <Input id="name" name="name" required defaultValue={asset?.name ?? ""} placeholder={dict.namePlaceholder} />
              </Field>
              <Field>
                <FieldLabel htmlFor="category_id">{dict.categoryLabel} *</FieldLabel>
                <NativeSelect
                  id="category_id"
                  name="category_id"
                  required
                  className={selectClass}
                  defaultValue={asset?.category_id ?? ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setSelectedCategoryId(selectedId);
                    // Show computer specs only for PC/Laptop categories
                    const categoryName = categories.find((c) => c.id === selectedId)?.name ?? "";
                    const lowerName = categoryName.toLowerCase();
                    setShowComputerSpecs(
                      lowerName.includes("pc") || lowerName.includes("laptop") || lowerName.includes("computer")
                    );
                  }}
                >
                  <NativeSelectOption value="">-</NativeSelectOption>
                  {categories.map((c) => (
                    <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="status">{dict.statusLabel}</FieldLabel>
                <NativeSelect id="status" name="status" className={selectClass} defaultValue={asset?.status ?? "available"}>
                  {STATUS_OPTIONS.map((s) => (
                    <NativeSelectOption key={s} value={s}>{statusLabel(s, dict)}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="brand">{dict.brandLabel}</FieldLabel>
                <Input id="brand" name="brand" defaultValue={asset?.brand ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="model">{dict.modelLabel}</FieldLabel>
                <Input id="model" name="model" defaultValue={asset?.model ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="barcode">{dict.barcodeLabel}</FieldLabel>
                <Input id="barcode" name="barcode" defaultValue={asset?.barcode ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="serial_number">{dict.serialLabel}</FieldLabel>
                <Input id="serial_number" name="serial_number" defaultValue={asset?.serial_number ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="vendor_id">{dict.vendorLabel}</FieldLabel>
                <NativeSelect id="vendor_id" name="vendor_id" className={selectClass} defaultValue={asset?.vendor_id ?? ""}>
                  <NativeSelectOption value="">{dict.vendorNone}</NativeSelectOption>
                  {vendors.map((v) => (
                    <NativeSelectOption key={v.id} value={v.id}>{v.name}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="location_id">{dict.locationLabel}</FieldLabel>
                <NativeSelect id="location_id" name="location_id" className={selectClass} defaultValue={asset?.location_id ?? ""}>
                  <NativeSelectOption value="">{dict.locationNone}</NativeSelectOption>
                  {locations.map((l) => (
                    <NativeSelectOption key={l.id} value={l.id}>{l.building} - {l.room}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor="condition">{dict.conditionLabel}</FieldLabel>
                <NativeSelect id="condition" name="condition" className={selectClass} defaultValue={asset?.condition ?? "good"}>
                  {CONDITION_OPTIONS.map((c) => (
                    <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="notes">{dict.notesLabel}</FieldLabel>
                <Input id="notes" name="notes" defaultValue={asset?.notes ?? ""} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dict.purchaseSection}</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="purchase_date">{dict.purchaseDateLabel} *</FieldLabel>
                <Input id="purchase_date" name="purchase_date" type="date" required defaultValue={asset?.purchase_date?.slice(0, 10) ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="purchase_cost">{dict.purchaseCostLabel} *</FieldLabel>
                <Input id="purchase_cost" name="purchase_cost" type="number" min="0" step="0.01" required defaultValue={asset?.purchase_cost ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="warranty_expiry">{dict.warrantyLabel}</FieldLabel>
                <Input id="warranty_expiry" name="warranty_expiry" type="date" defaultValue={asset?.warranty_expiry?.slice(0, 10) ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="useful_life_years">{dict.usefulLifeLabel}</FieldLabel>
                <Input id="useful_life_years" name="useful_life_years" type="number" min="1" defaultValue={asset?.useful_life_years ?? 5} />
              </Field>
              <Field>
                <FieldLabel htmlFor="salvage_value">{dict.salvageLabel}</FieldLabel>
                <Input id="salvage_value" name="salvage_value" type="number" min="0" step="0.01" defaultValue={asset?.salvage_value ?? 0} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {showComputerSpecs && (
          <Card>
            <CardHeader>
              <CardTitle>{dict.specsTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="computer_name">{dict.computerNameLabel}</FieldLabel>
                  <Input id="computer_name" name="computer_name" defaultValue={asset?.computer_name ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ip_address">{dict.ipLabel}</FieldLabel>
                  <Input id="ip_address" name="ip_address" defaultValue={asset?.ip_address ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="os_name">{dict.osLabel}</FieldLabel>
                  <Input id="os_name" name="os_name" defaultValue={asset?.os_name ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="processor_detail">{dict.processorLabel}</FieldLabel>
                  <Input id="processor_detail" name="processor_detail" defaultValue={asset?.processor_detail ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ram_capacity_gb">{dict.ramLabel}</FieldLabel>
                  <Input id="ram_capacity_gb" name="ram_capacity_gb" type="number" min="0" defaultValue={asset?.ram_capacity_gb ?? ""} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="storage_detail">{dict.storageLabel}</FieldLabel>
                  <Input id="storage_detail" name="storage_detail" defaultValue={asset?.storage_detail ?? ""} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        )}

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 rounded-xl border bg-background/95 px-4 py-3 shadow-sm backdrop-blur-md">
          <Button type="button" variant="outline" onClick={goBack} disabled={pending}>
            {dict.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
            {dict.save}
          </Button>
        </div>
      </form>

      <BlockingAlertDialog
        open={confirmDiscard}
        onOpenChange={(o) => !o && setConfirmDiscard(false)}
        title={dict.discardTitle}
        description={dict.discardDesc}
        media={<AlertTriangle />}
        cancelLabel={dict.cancel}
        confirmLabel={dict.discardConfirm}
        confirmClassName="bg-destructive/10 text-destructive hover:bg-destructive/20"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          router.push(listHref);
        }}
      />
    </div>
  );
}
