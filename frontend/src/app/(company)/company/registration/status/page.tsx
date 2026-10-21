"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, Card, PageHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { setState, today, useData } from "@/lib/store";
import type { Company } from "@/lib/types";

const steps = ["Business registration documents", "Office address, phone and domain email", "Website and LinkedIn or Facebook history", "Short call with a company representative", "Internship terms"];

export default function RegistrationStatus() {
  const { company } = useData();
  const [note, setNote] = useState("Please upload a clearer copy of your registration document.");
  const update = (patch: Partial<Company>) => setState((st) => ({ ...st, companies: st.companies.map((c) => (c.id === company!.id ? { ...c, ...patch } : c)) }));

  if (company?.status !== "pending")
    return (
      <Card className="max-w-xl">
        <p className="mb-4">You haven&apos;t submitted your registration yet.</p>
        <LinkButton href="/company/registration">Go to registration</LinkButton>
      </Card>
    );

  return (
    <>
      <PageHeader title="We're checking your company" intro="This usually takes 2–3 working days. You can't post challenges until you're verified." pose="search">
        <Badge tone="highlight">Pending review</Badge>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-h4">What our team checks</h2>
          <ol className="flex flex-col gap-2">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="font-heading font-semibold text-burgundy">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <LinkButton href="/company/registration" variant="secondary" className="mt-6">
            Edit registration
          </LinkButton>
        </Card>
        <Card tone="dashed">
          <h2 className="mb-1 text-h4">Demo controls</h2>
          <p className="mb-4 text-muted">In the real product our team does this. Use these to continue the demo.</p>
          <Button onClick={() => update({ status: "verified", verifiedAt: today() })}>Simulate team approval</Button>
          <div className="mt-6 flex flex-col gap-3">
            <Textarea label="Message to the company" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20" />
            <Button variant="secondary" className="self-start" onClick={() => update({ status: "draft", reviewNote: note })}>
              Ask for more information
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
