"use client";

import Link from "next/link";
import { useState } from "react";
import { RatingForm } from "@/components/RatingForm";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { Detail } from "@/components/ui/Detail";
import { Dialog } from "@/components/ui/Dialog";
import { Mascot } from "@/components/ui/Mascot";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { replyToOffer } from "@/lib/rules";
import { setState, useData } from "@/lib/store";
import type { Interview } from "@/lib/types";

const label: Record<Interview["status"], string> = {
  scheduled: "Interview scheduled",
  offered: "Offer received",
  accepted: "Internship started",
  declined: "You declined",
  "not-selected": "Not selected this time",
};

export default function Internships() {
  const { s, me } = useData();
  const [confirming, setConfirming] = useState<string | null>(null);
  const mine = s.interviews.filter((i) => i.learnerId === me.id);
  const pending = confirming ? mine.find((i) => i.id === confirming) : undefined;
  const pendingCompany = pending ? s.companies.find((c) => c.id === pending.companyId) : undefined;

  return (
    <>
      <PageHeader title="Internships" intro="Interviews and offers from companies whose challenge you passed. Applying and interviewing are always free." pose="journey" />
      {!mine.length && <Empty pose="sleep">No interviews yet. Pass a company challenge and take the next step toward your interview.</Empty>}
      <div className="flex max-w-3xl flex-col gap-4">
        {mine.map((i) => {
          const company = s.companies.find((c) => c.id === i.companyId)!;
          const companyUser = s.users.find((u) => u.companyId === company.id);
          const challenge = s.challenges.find((c) => c.id === i.challengeId);
          return (
            <Card key={i.id} className="flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex flex-wrap items-center gap-2 text-h4">
                    {company.terms.role || "Internship"} at{" "}
                    {companyUser ? (
                      <Link href={`/profile/${companyUser.id}`} className="hover:text-burgundy">
                        {company.name}
                      </Link>
                    ) : (
                      company.name
                    )}{" "}
                    <VerifiedBadge company={company} />
                  </h2>
                  <p className="mt-2 text-muted">
                    From the challenge “{challenge?.title}”{i.when && ` · Interview ${i.when.replace("T", " at ")}`}
                  </p>
                </div>
                <Badge tone={i.status === "accepted" ? "success" : i.status === "offered" ? "highlight" : "neutral"}>{label[i.status]}</Badge>
              </div>
              <dl className="grid gap-4 text-body-sm sm:grid-cols-3">
                <Detail kind="duration" label="Duration">
                  {company.terms.duration}
                </Detail>
                <Detail kind="location" label="Location">
                  {company.terms.location}
                </Detail>
                <Detail kind="stipend" label="Stipend">
                  {company.terms.stipend}
                </Detail>
              </dl>
              {i.status === "offered" && (
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={() => setConfirming(i.id)}>Accept offer</Button>
                  <Button variant="secondary" onClick={() => setState((st) => replyToOffer(st, i.id, false))}>
                    Decline
                  </Button>
                </div>
              )}
              {i.status === "accepted" && (
                <div className="flex flex-wrap items-start gap-6 border-t border-line pt-4">
                  <Mascot pose="excited" size={104} />
                  <div className="min-w-60 flex-1">
                    <p className="mb-3 font-medium">Congratulations, your internship has started!</p>
                    <RatingForm interviewId={i.id} toId={company.id} toName={company.name} />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {pending && pendingCompany && (
        <Dialog open onClose={() => setConfirming(null)} title={`Accept the offer from ${pendingCompany.name}?`}>
          <p className="mb-4 text-muted">
            You accept the {pendingCompany.terms.role || "internship"} ({pendingCompany.terms.duration}, {pendingCompany.terms.stipend}). You can rate the company after it starts.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setState((st) => replyToOffer(st, pending.id, true));
                setConfirming(null);
              }}
            >
              Yes, accept offer
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
