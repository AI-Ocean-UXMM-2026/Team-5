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
      <button type="button" onClick={() => setOpen(true)} className="text-caption font-medium text-muted underline-offset-2 hover:text-danger hover:underline">
        Report
      </button>
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
