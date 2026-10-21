"use client";

import { useEffect, useId, useRef } from "react";

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className="m-auto w-[min(92vw,480px)] rounded-2xl border border-line bg-white p-6 text-ink"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-h4">
          {title}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close" className="-m-2 size-10 rounded-xl text-muted hover:bg-surface">
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}
