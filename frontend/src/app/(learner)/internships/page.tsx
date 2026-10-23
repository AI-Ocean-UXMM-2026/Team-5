"use client";

import Link from "next/link";
import { useState } from "react";
import { RatingForm } from "@/components/RatingForm";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Detail } from "@/components/ui/Detail";
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
  const mine = s.interviews.filter((i) => i.learnerId === me.id);
  const [ask, setAsk] = useState<{ id: string; status: "accepted" | "declined" } | null>(null);
  const asked = mine.find((i) => i.id === ask?.id);
  const askedCompany = s.companies.find((c) => c.id === asked?.companyId);

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
                  <Button onClick={() => setAsk({ id: i.id, status: "accepted" })}>Accept offer</Button>
                  <Button variant="secondary" onClick={() => setAsk({ id: i.id, status: "declined" })}>
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
      <ConfirmDialog
        open={!!ask}
        onClose={() => setAsk(null)}
        onConfirm={() => ask && setState((st) => replyToOffer(st, ask.id, ask.status === "accepted"))}
        title={ask?.status === "accepted" ? `Accept the offer from ${askedCompany?.name}?` : `Decline the offer from ${askedCompany?.name}?`}
        confirmLabel={ask?.status === "accepted" ? "Accept offer" : "Decline offer"}
        danger={ask?.status === "declined"}
      >
        {ask?.status === "accepted" ? (
          <>
            <p>
              {askedCompany?.terms.role || "Internship"} · {askedCompany?.terms.duration} · {askedCompany?.terms.location} · {askedCompany?.terms.stipend}
            </p>
            <p>Your internship starts, and {askedCompany?.name} is told right away. You can rate the company after it starts. You never pay anything to accept.</p>
          </>
        ) : (
          <p>{askedCompany?.name} will move on to other candidates. You can&apos;t take this offer back after declining.</p>
        )}
      </ConfirmDialog>
    </>
  );
}
