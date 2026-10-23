"use client";

import Link from "next/link";
import { useState } from "react";
import { RatingForm } from "@/components/RatingForm";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  const mine = s.interviews.filter((i) => i.companyId === company?.id);
  const [ask, setAsk] = useState<{ id: string; status: "offered" | "not-selected" } | null>(null);
  const asked = mine.find((i) => i.id === ask?.id);
  const askedLearner = nameOf(s, asked?.learnerId ?? "");

  return (
    <>
      <PageHeader title="Interviews and hiring" intro="Meet the learners you invited, then decide. The internship starts when the learner accepts your offer." pose="wink" />
      {!mine.length && <Empty pose="sleep">No interviews yet. Invite learners from a challenge&apos;s submissions.</Empty>}
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
                  <Button onClick={() => setAsk({ id: i.id, status: "offered" })}>Make an offer</Button>
                  <Button variant="secondary" onClick={() => setAsk({ id: i.id, status: "not-selected" })}>
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
      <ConfirmDialog
        open={!!ask}
        onClose={() => setAsk(null)}
        onConfirm={() => {
          if (!ask || !asked) return;
          if (ask.status === "offered") setState((st) => applyOffer(st, asked.submissionId, newId("iv")));
          else setStatus(ask.id, ask.status);
        }}
        title={ask?.status === "offered" ? `Offer ${askedLearner} the internship?` : `Mark ${askedLearner} as not selected?`}
        confirmLabel={ask?.status === "offered" ? "Send offer" : "Not selected"}
        danger={ask?.status === "not-selected"}
      >
        {ask?.status === "offered" ? (
          <>
            <p>
              {company?.terms.role || "Internship"} · {company?.terms.duration} · {company?.terms.location} · {company?.terms.stipend}
            </p>
            <p>These are your approved terms. {askedLearner} can accept or decline the offer on their Internships page.</p>
          </>
        ) : (
          <p>{askedLearner} is told they weren&apos;t selected this time. You can&apos;t undo this, but you can review other candidates from the same challenge.</p>
        )}
      </ConfirmDialog>
    </>
  );
}
