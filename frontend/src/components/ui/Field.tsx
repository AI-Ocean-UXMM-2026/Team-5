"use client";

import { useId, type ComponentProps } from "react";

const control =
  "w-full rounded-xl border border-line bg-white px-3 text-sm text-ink transition-colors placeholder:text-subtle hover:border-subtle focus-visible:border-burgundy disabled:bg-disabled";

type Extra = { label: string; hint?: string; error?: string };

function Wrap({ id, label, hint, error, children }: Extra & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-body-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-body-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, { hint, error }: Extra) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function Input({ label, hint, error, className = "", ...props }: ComponentProps<"input"> & Extra) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <input id={id} aria-invalid={!!error} aria-describedby={describedBy(id, { label, hint, error })} className={`${control} h-10 pointer-coarse:h-11 ${className}`} {...props} />
    </Wrap>
  );
}

export function Textarea({ label, hint, error, className = "", ...props }: ComponentProps<"textarea"> & Extra) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <textarea id={id} aria-invalid={!!error} aria-describedby={describedBy(id, { label, hint, error })} className={`${control} min-h-28 py-2 ${className}`} {...props} />
    </Wrap>
  );
}

export function Select({ label, hint, error, className = "", ...props }: ComponentProps<"select"> & Extra) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, { label, hint, error })}
          className={`${control} h-10 appearance-none pr-12 pointer-coarse:h-11 ${className}`}
          {...props}
        />
        <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Wrap>
  );
}
