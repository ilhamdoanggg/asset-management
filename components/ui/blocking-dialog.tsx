"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface BlockingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  cancelLabel?: React.ReactNode;
  saveLabel?: React.ReactNode;
  /** called on Cancel; defaults to closing the dialog */
  onCancel?: () => void;
  /** called on Save; dialog stays open until the caller closes it (e.g. after toast success) */
  onSave?: () => void;
  /** disables both buttons and shows a spinner on Save */
  saving?: boolean;
  contentClassName?: string;
}

/**
 * Modal dialog that cannot be dismissed by ESC, overlay click, or the X
 * button — only via the Cancel/Save footer actions.
 */
export function BlockingDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  cancelLabel = "Cancel",
  saveLabel = "Save",
  onCancel,
  onSave,
  saving = false,
  contentClassName,
}: BlockingDialogProps) {
  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={(o, details) => {
        if (!o && (details.reason === "escape-key" || details.reason === "outside-press")) return;
        onOpenChange(o);
      }}
    >
      <DialogContent showCloseButton={false} className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => (onCancel ? onCancel() : onOpenChange(false))}>
            {cancelLabel}
          </Button>
          <Button disabled={saving} onClick={onSave}>
            {saving && <Spinner data-icon="inline-start" />}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
