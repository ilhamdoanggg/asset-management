"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { TriangleAlertIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockingAlertDialog } from "@/components/ui/blocking-alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Locale-keyed copy for the unsaved-changes confirmation. Kept local to the
 * component so the shared primitive stays dependency-free and no dictionary
 * needs to be shipped to the client just for these few strings.
 */
const DISCARD_LABELS = {
  id: {
    title: "Buang perubahan?",
    description: "Perubahan yang belum disimpan akan hilang.",
    confirm: "Buang",
    cancel: "Lanjut mengedit",
  },
  en: {
    title: "Discard changes?",
    description: "Your unsaved changes will be lost.",
    confirm: "Discard",
    cancel: "Keep editing",
  },
} as const;

interface DismissibleDialogProps {
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
  /** render the corner X close button (default true) */
  showCloseButton?: boolean;
  /**
   * Ask for confirmation before discarding edits. Applies to the X button,
   * ESC, overlay click and Cancel. Defaults to true.
   */
  confirmDiscard?: boolean;
}

/**
 * Reusable modal form dialog that can be dismissed three ways:
 *  1. the footer actions (Cancel / Save buttons),
 *  2. the corner X close button,
 *  3. the usual ESC key or overlay click.
 *
 * When the user has touched the form and tries to dismiss it, a confirmation
 * is shown first so unsaved changes are not lost silently. While a save is in
 * flight (`saving`) dismissal is disabled to avoid interrupting the request.
 */
export function DismissibleDialog({
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
  showCloseButton = true,
  confirmDiscard = true,
}: DismissibleDialogProps) {
  const pathname = usePathname();
  const labels = pathname?.startsWith("/en")
    ? DISCARD_LABELS.en
    : DISCARD_LABELS.id;

  const editedRef = React.useRef(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // A freshly opened dialog has no unsaved edits yet.
  React.useEffect(() => {
    if (open) editedRef.current = false;
  }, [open]);

  const close = React.useCallback(() => {
    if (onCancel) onCancel();
    else onOpenChange(false);
  }, [onCancel, onOpenChange]);

  const requestClose = React.useCallback(() => {
    if (saving) return;
    if (confirmDiscard && editedRef.current) {
      setConfirmOpen(true);
      return;
    }
    close();
  }, [saving, confirmDiscard, close]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) {
            onOpenChange(true);
            return;
          }
          requestClose();
        }}
      >
        <DialogContent
          showCloseButton={showCloseButton}
          className={contentClassName}
          onInput={() => {
            editedRef.current = true;
          }}
          onChange={() => {
            editedRef.current = true;
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={requestClose}>
              {cancelLabel}
            </Button>
            <Button disabled={saving} onClick={onSave}>
              {saving && <Spinner data-icon="inline-start" />}
              {saveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BlockingAlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        media={<TriangleAlertIcon />}
        title={labels.title}
        description={labels.description}
        cancelLabel={labels.cancel}
        confirmLabel={labels.confirm}
        confirmClassName="bg-destructive/10 text-destructive hover:bg-destructive/20"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          close();
        }}
      />
    </>
  );
}
