"use client";

import { useState } from "react";
import type { Company } from "@/lib/types";
import { Dialog } from "./Dialog";

const checks = [
  "Business registration documents",
  "Working office address, phone number and email on the company's own domain",
  "Website and history on LinkedIn or Facebook",
  "A short call between our team and a company representative",
  "Internship terms written up front: role, duration, location and stipend",
  "Never asks learners for money, a passport or an ID card",
];

export function VerifiedBadge({ company, label = "Verified" }: { company: Company; label?: string }) {
  const [open, setOpen] = useState(false);
  if (company.status !== "verified") return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg bg-burgundy-tint px-2 py-0.5 text-caption font-semibold text-burgundy hover:bg-burgundy hover:text-white"
      >
        <span aria-hidden>✓</span> {label}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`${company.name} is verified`}>
        <p className="mb-3 text-muted">Our team checked this company{company.verifiedAt ? ` on ${company.verifiedAt}` : ""}:</p>
        <ul className="flex flex-col gap-2">
          {checks.map((c) => (
            <li key={c} className="flex gap-2">
              <span aria-hidden className="text-success">✓</span>
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-body-sm text-muted">Companies are re-checked every year. Rule breakers are removed.</p>
      </Dialog>
    </>
  );
}
