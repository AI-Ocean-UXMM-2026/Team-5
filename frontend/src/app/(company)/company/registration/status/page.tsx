"use client";

import { YouTubeFrame } from "@/components/YouTubeFrame";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, Card, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Field";
import { registrationView } from "@/lib/rules";
import { setState, today, useData } from "@/lib/store";
import type { Company } from "@/lib/types";
import { useEffect, useState } from "react";

const steps = ["Business registration documents", "Office address, phone and domain email", "Website and LinkedIn or Facebook history", "Short call with a company representative", "Internship terms"];

const viewCopy = {
  waiting: { title: "We're checking your company", badge: "Waiting", tone: "highlight" as const, intro: "This usually takes 2–3 working days. You can't post challenges until you're verified." },
  "needs-info": { title: "We need a bit more information", badge: "More info needed", tone: "highlight" as const, intro: "Update your registration and send it again. You can't post challenges until you're verified." },
  rejected: { title: "This company was not verified", badge: "Rejected", tone: "danger" as const, intro: "You can't post challenges or internships. If this is a mistake, reply to the note from our team." },
  live: { title: "Your company is live", badge: "Live", tone: "success" as const, intro: "You're verified. Check your company page, then post your first challenge." },
};

export default function RegistrationStatus() {
  const { company } = useData();
  const [note, setNote] = useState("Please upload a clearer copy of your registration document.");
  const [confirmReject, setConfirmReject] = useState(false);
  const view = registrationView(company);
  const update = (patch: Partial<Company>) => setState((st) => ({ ...st, companies: st.companies.map((c) => (c.id === company!.id ? { ...c, ...patch } : c)) }));
  const unseenApproval = view === "live" && !company?.approvalSeen;

  // Home stops pointing here once the company has seen its approval.
  useEffect(() => {
    if (unseenApproval) update({ approvalSeen: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unseenApproval]);

  if (view === "none" || !company)
    return (
      <Card className="max-w-xl">
        <p className="mb-4">You haven&apos;t submitted your registration yet.</p>
        <LinkButton href="/company/registration">Go to registration</LinkButton>
      </Card>
    );

  const copy = viewCopy[view];

  return (
    <>
      <Breadcrumb items={[{ label: "Registration", href: "/company/registration" }, { label: "Status" }]} />
      <PageHeader title={copy.title} intro={copy.intro} pose={view === "live" ? "excited" : "search"}>
        <Badge tone={copy.tone}>{copy.badge}</Badge>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          {company.videoId ? (
            <div className="mb-4">
              <YouTubeFrame videoId={company.videoId} title={`${company.name} video`} />
            </div>
          ) : null}
          {company.reviewNote && view !== "live" && (
            <p role="status" className="mb-4">
              {company.reviewNote}
            </p>
          )}
          {view === "waiting" && (
            <>
              <h2 className="mb-4 text-h4">What our team checks</h2>
              <ol className="flex flex-col gap-2">
                {steps.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-heading font-semibold text-burgundy">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-muted">
                We&apos;ll email <span className="font-medium text-ink">{company.email}</span> when the review is done. You can also check this page any time.
              </p>
            </>
          )}
          {view === "needs-info" && (
            <LinkButton href="/company/registration" variant="secondary">
              Edit registration
            </LinkButton>
          )}
          {view === "live" && (
            <>
              <h2 className="mb-4 text-h4">Next steps</h2>
              <ol className="flex flex-col gap-4">
                <li className="flex gap-3">
                  <span className="font-heading font-semibold text-burgundy">1</span>
                  <div className="flex flex-col items-start gap-2">
                    <p>Check your company page. Learners see it, with your Verified badge, next to every challenge you post.</p>
                    <LinkButton href="/company/account" variant="secondary">
                      View company page
                    </LinkButton>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-heading font-semibold text-burgundy">2</span>
                  <div className="flex flex-col items-start gap-2">
                    <p>Post your first challenge. AI drafts the task from the skill you need.</p>
                    <LinkButton href="/company/challenges/new">Post a challenge</LinkButton>
                  </div>
                </li>
              </ol>
            </>
          )}
        </Card>
        {view !== "live" && (
          <Card tone="dashed">
            <h2 className="mb-1 text-h4">Demo controls</h2>
            <p className="mb-4 text-muted">In the real product our team does this. Use these to continue the demo.</p>
            <Button onClick={() => update({ status: "verified", verifiedAt: today(), reviewNote: undefined })}>Simulate team approval</Button>
            <div className="mt-6 flex flex-col gap-3">
              <Textarea label="Message to the company" value={note} onChange={(e) => setNote(e.target.value)} className="min-h-20" />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => update({ status: "draft", reviewNote: note })}>
                  Ask for more information
                </Button>
                <Button variant="secondary" onClick={() => setConfirmReject(true)}>
                  Reject
                </Button>
                <ConfirmDialog
                  open={confirmReject}
                  onClose={() => setConfirmReject(false)}
                  onConfirm={() => update({ status: "rejected", reviewNote: note || "We could not confirm this company." })}
                  title={`Reject ${company.name}?`}
                  confirmLabel="Reject company"
                  danger
                >
                  <p>The company can&apos;t post challenges or internships, and sees your message as the reason. In this demo it can&apos;t resubmit after a rejection.</p>
                </ConfirmDialog>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
