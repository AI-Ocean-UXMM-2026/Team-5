"use client";

import { useState } from "react";
import { newId, setState, today, useData } from "@/lib/store";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

const reasons = ["Spam or off-topic", "Shares challenge answers", "Private contact details", "Fake offer or asks for money", "Rude or unsafe"];

export function ReportButton({ targetId, authorId, label = "post" }: { targetId: string; authorId: string; label?: string }) {
  const { s, me } = useData();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const reported = s.reports.some((r) => r.targetId === targetId && r.reporterId === me.id);

  if (authorId === me.id) return null;
  if (reported) return <span className="text-caption text-muted">Reported</span>;

  return (
    <>
      <span className="group relative inline-flex">
        <button
          type="button"
          aria-label="Report"
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-xl text-muted hover:bg-danger-tint hover:text-danger pointer-coarse:size-11"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 21V4m0 0h11l-2 4 2 4H5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-caption text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        >
          Report
        </span>
      </span>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Report this ${label}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setState((st) => ({ ...st, reports: [...st.reports, { id: newId("rep"), targetId, reporterId: me.id, reason, at: today() }] }));
            setOpen(false);
          }}
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-muted">Our team reviews every report.</legend>
            {reasons.map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-burgundy" />
                {r}
              </label>
            ))}
          </fieldset>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send report</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
