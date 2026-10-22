"use client";

import Link from "next/link";
import { useState } from "react";
import { RatingForm } from "@/components/RatingForm";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { applyOffer } from "@/lib/rules";
import { nameOf, newId, setState, useData } from "@/lib/store";
import type { Interview } from "@/lib/types";

const label: Record<Interview["status"], string> = {
  scheduled: "Scheduled",
  offered: "Offer sent",
  accepted: "Offer accepted",
  declined: "Offer declined",
  "not-selected": "Not selected",
};

const setStatus = (id: string, status: Interview["status"]) =>
  setState((st) => ({ ...st, interviews: st.interviews.map((i) => (i.id === id ? { ...i, status } : i)) }));

export default function Interviews() {
  const { s, company } = useData();
  const [confirming, setConfirming] = useState<string | null>(null);
  const mine = s.interviews.filter((i) => i.companyId === company?.id);
  const offers = mine.filter((i) => i.status === "offered" || i.status === "accepted" || i.status === "declined");
  const pending = confirming ? mine.find((i) => i.id === confirming) : undefined;

  return (
    <>
      <PageHeader title="Interviews and hiring" intro="Meet the learners you invited, then decide. The internship starts when the learner accepts your offer." pose="wink" />
      {!mine.length && <Empty pose="sleep">No interviews yet. Invite learners from a challenge&apos;s submissions.</Empty>}
      {!!offers.length && (
        <Card className="mb-6">
          <h2 className="mb-2 text-h4">Sent offers</h2>
          <ul className="flex flex-col gap-2">
            {offers.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/profile/${i.learnerId}`} className="font-medium hover:text-burgundy">
                  {nameOf(s, i.learnerId)}
                </Link>
                <Badge tone={i.status === "accepted" ? "success" : i.status === "offered" ? "highlight" : "neutral"}>{label[i.status]}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <div className="flex flex-col gap-4">
        {mine.map((i) => {
          const learner = nameOf(s, i.learnerId);
          const challenge = s.challenges.find((c) => c.id === i.challengeId);
          return (
            <Card key={i.id} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-h4">
                    <Link href={`/profile/${i.learnerId}`} className="hover:text-burgundy">
                      {learner}
                    </Link>
                  </h2>
                  <p className="text-muted">
                    {challenge?.title}
                    {i.when && ` · ${i.when.replace("T", " at ")}`}
                  </p>
                </div>
                <Badge tone={i.status === "accepted" ? "success" : i.status === "declined" || i.status === "not-selected" ? "neutral" : "highlight"}>{label[i.status]}</Badge>
              </div>
              {i.status === "scheduled" && (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setConfirming(i.id)}>Make an offer</Button>
                  <Button variant="secondary" onClick={() => setStatus(i.id, "not-selected")}>
                    Not selected
                  </Button>
                </div>
              )}
              {i.status === "offered" && (
                <p role="status" className="font-medium text-success">
                  Offer sent. Waiting for {learner} to accept.
                </p>
              )}
              {(i.status === "declined" || i.status === "not-selected") && (
                <p className="text-muted">
                  <Link href={`/company/challenges/${i.challengeId}`} className="font-medium text-burgundy">
                    Review the next candidate
                  </Link>{" "}
                  from this challenge.
                </p>
              )}
              {i.status === "accepted" && <RatingForm interviewId={i.id} toId={i.learnerId} toName={learner} />}
            </Card>
          );
        })}
      </div>
      <Dialog open={!!pending} onClose={() => setConfirming(null)} title={`Send an offer to ${pending ? nameOf(s, pending.learnerId) : "this learner"}?`}>
        <p className="mb-4 text-muted">
          They get an offer for {company?.terms.role || "an internship"} ({company?.terms.duration}, {company?.terms.stipend}) and can accept or decline it on their Internships page.
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirming(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!pending) return;
              setState((st) => applyOffer(st, pending.submissionId, newId("iv")));
              setConfirming(null);
            }}
          >
            Yes, send offer
          </Button>
        </div>
      </Dialog>
    </>
  );
}
