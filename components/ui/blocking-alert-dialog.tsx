"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface BlockingAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  media?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  /** called on Cancel; defaults to closing the dialog */
  onCancel?: () => void;
  /** called on Confirm; dialog stays open until the caller closes it */
  onConfirm?: () => void;
  /** disables both buttons and shows a spinner on Confirm */
  confirming?: boolean;
  confirmClassName?: string;
}

/**
 * Confirmation dialog that cannot be dismissed by ESC or overlay click —
 * only via the Cancel/Confirm footer actions.
 */
export function BlockingAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  media,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
  confirming = false,
  confirmClassName,
}: BlockingAlertDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o, details) => {
        if (!o && (details.reason === "escape-key" || details.reason === "outside-press")) return;
        onOpenChange(o);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {media && <AlertDialogMedia>{media}</AlertDialogMedia>}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" disabled={confirming} onClick={() => (onCancel ? onCancel() : onOpenChange(false))}>
            {cancelLabel}
          </Button>
          <Button disabled={confirming} onClick={onConfirm} className={confirmClassName}>
            {confirming && <Spinner data-icon="inline-start" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
