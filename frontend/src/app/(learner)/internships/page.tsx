"use client";

import { RatingForm } from "@/components/RatingForm";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { setState, useData } from "@/lib/store";
import type { Interview } from "@/lib/types";

const label: Record<Interview["status"], string> = {
  scheduled: "Interview scheduled",
  offered: "Offer received",
  accepted: "Internship started",
  declined: "You declined",
  "not-selected": "Not selected this time",
};

const setStatus = (id: string, status: Interview["status"]) =>
  setState((st) => ({ ...st, interviews: st.interviews.map((i) => (i.id === id ? { ...i, status } : i)) }));

export default function Internships() {
  const { s, me } = useData();
  const mine = s.interviews.filter((i) => i.learnerId === me.id);

  return (
    <>
      <PageHeader title="Internships" intro="Interviews and offers from companies whose challenge you passed. Applying and interviewing are always free." pose="journey" />
      {!mine.length && <Empty pose="sleep">No interviews yet. Pass a company challenge and take the next step toward your interview.</Empty>}
      <div className="flex flex-col gap-4">
        {mine.map((i) => {
          const company = s.companies.find((c) => c.id === i.companyId)!;
          const challenge = s.challenges.find((c) => c.id === i.challengeId);
          return (
            <Card key={i.id} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex flex-wrap items-center gap-2 text-h4">
                    {company.terms.role || "Internship"} at {company.name} <VerifiedBadge company={company} />
                  </h2>
                  <p className="text-muted">
                    From the challenge “{challenge?.title}” · Interview {i.when.replace("T", " at ")}
                  </p>
                </div>
                <Badge tone={i.status === "accepted" ? "success" : i.status === "offered" ? "highlight" : "neutral"}>{label[i.status]}</Badge>
              </div>
              <dl className="grid gap-x-6 gap-y-1 text-body-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted">Duration</dt>
                  <dd>{company.terms.duration}</dd>
                </div>
                <div>
                  <dt className="text-muted">Location</dt>
                  <dd>{company.terms.location}</dd>
                </div>
                <div>
                  <dt className="text-muted">Stipend</dt>
                  <dd>{company.terms.stipend}</dd>
                </div>
              </dl>
              {i.status === "offered" && (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setStatus(i.id, "accepted")}>Accept offer</Button>
                  <Button variant="secondary" onClick={() => setStatus(i.id, "declined")}>
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
    </>
  );
}
