export type FieldKind = "website" | "social" | "email" | "phone" | "address" | "role" | "duration" | "location" | "stipend" | "headline" | "certificate";

export function FieldIcon({ kind, className = "size-4" }: { kind: FieldKind; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {kind === "website" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3.2 3.5 7 3.5 9s-1 5.8-3.5 9M12 3C9.5 6.2 8.5 10 8.5 12s1 5.8 3.5 9" />
        </>
      )}
      {kind === "social" && (
        <>
          <circle cx="7" cy="8" r="3" />
          <circle cx="17" cy="8" r="3" />
          <path d="M3 19c.5-3 2.5-4.5 4-4.5S11 16 11.5 19M12.5 19c.5-3 2.5-4.5 4-4.5S21 16 21.5 19" />
        </>
      )}
      {kind === "email" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M4 7l8 6 8-6" />
        </>
      )}
      {kind === "phone" && <path d="M7 3h4l1 4-3 2a12 12 0 006 6l2-3 4 1v4c0 1-1 2-2 2C10 19 5 14 5 5c0-1 1-2 2-2z" />}
      {kind === "address" && (
        <>
          <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      )}
      {kind === "role" && (
        <>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M8 8V6a4 4 0 018 0v2M3 13h18" />
        </>
      )}
      {kind === "duration" && (
        <>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2M10 3h4" />
        </>
      )}
      {kind === "location" && (
        <>
          <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </>
      )}
      {kind === "stipend" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M9.5 9.5c.6-1 1.6-1.5 2.5-1.5 2 0 3 1 3 2.2 0 3-6 1.5-6 4.3 0 1.2 1.2 2.5 3.5 2.5 1 0 2-.5 2.6-1.4" />
        </>
      )}
      {kind === "headline" && <path d="M5 5h6M8 5v14M5 19h6M13 9h6v10H13z" />}
      {kind === "certificate" && (
        <>
          <rect x="4" y="3" width="16" height="13" rx="2" />
          <path d="M9 21l3-3 3 3v-8H9v8z" />
        </>
      )}
    </svg>
  );
}

export function Detail({ kind, label, children }: { kind: FieldKind; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-burgundy">
        <FieldIcon kind={kind} />
      </span>
      <div className="min-w-0">
        <dt className="text-body-sm text-muted">{label}</dt>
        <dd className="break-words">{children}</dd>
      </div>
    </div>
  );
}
