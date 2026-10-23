"use client";

import { Button } from "./Button";
import { Dialog } from "./Dialog";

/** Asks before an action that can't be undone. Danger actions focus Cancel first, so Enter never confirms by accident. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-2 text-muted">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose} data-autofocus={danger || undefined}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          data-autofocus={!danger || undefined}
          onClick={() => {
            onClose();
            onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
