"use client";

import { YouTubeFrame } from "@/components/YouTubeFrame";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, PageHeader } from "@/components/ui/Card";
import { latestCompanyPayment } from "@/lib/payments";
import { registrationView } from "@/lib/rules";
import { setState, useData } from "@/lib/store";
import type { Company } from "@/lib/types";
import { useEffect } from "react";

const steps = ["Business registration documents", "Office address, phone and domain email", "Website and LinkedIn or Facebook history", "Short call with a company representative", "Internship terms"];

const viewCopy = {
  waiting: { title: "We're checking your company", badge: "Waiting", tone: "highlight" as const, intro: "This usually takes 2–3 working days. You can't post challenges until you're verified." },
  "needs-info": { title: "We need a bit more information", badge: "More info needed", tone: "highlight" as const, intro: "Update your registration and send it again. You can't post challenges until you're verified." },
  pay: { title: "Your company is approved", badge: "Payment due", tone: "highlight" as const, intro: "Our team checked your company. Choose a partner plan and pay the fee to go live. Learners can't see your challenges until then." },
  rejected: { title: "This company was not verified", badge: "Rejected", tone: "danger" as const, intro: "You can't post challenges or internships. If this is a mistake, reply to the note from our team." },
  live: { title: "Your company is live", badge: "Live", tone: "success" as const, intro: "You're verified. Check your company page, then post your first challenge." },
};

export default function RegistrationStatus() {
  const { s, company } = useData();
  const view = registrationView(company);
  const payment = company ? latestCompanyPayment(s, company.id) : undefined;
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
                We&apos;ll email <span className="font-medium text-ink">{company.email}</span> and send you a notification when the review is done. You can also check this page any time.
              </p>
            </>
          )}
          {view === "pay" && (
            <div className="flex flex-col items-start gap-3">
              <h2 className="text-h4">{payment?.status === "pending" ? "We're checking your payment" : "Last step: the partner fee"}</h2>
              <p className="text-muted">
                {payment?.status === "pending"
                  ? "We'll send you a notification as soon as your payment is confirmed and your company is live."
                  : "Pay monthly or yearly by mobile wallet and send us the receipt. Your Verified badge turns on when we confirm it."}
              </p>
              <LinkButton href="/company/registration/pay">{payment?.status === "pending" ? "See your payment" : "Choose a plan and pay"}</LinkButton>
            </div>
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
      </div>
    </>
  );
}
