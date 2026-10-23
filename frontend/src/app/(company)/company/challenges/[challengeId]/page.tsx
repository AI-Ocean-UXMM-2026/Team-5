"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Textarea } from "@/components/ui/Field";
import { courseTitle } from "@/lib/i18n";
import { applyOffer, rubricMarks } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { nameOf, newId, setState, useData } from "@/lib/store";
import type { Interview, Submission } from "@/lib/types";

const offerLabel: Partial<Record<Interview["status"], string>> = { offered: "Waiting for reply", accepted: "Accepted", declined: "Declined" };

function Review({ sub }: { sub: Submission }) {
  const { s, company } = useData();
  const [feedback, setFeedback] = useState("");
  const [when, setWhen] = useState("");
  const [ask, setAsk] = useState<"" | "feedback" | "invite" | "offer">("");
  // Earliest interview slot is now, in the local time format datetime-local expects.
  const [minWhen] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  const learner = nameOf(s, sub.learnerId);
  const interview = s.interviews.find((i) => i.submissionId === sub.id);
  const rubric = s.challenges.find((c) => c.id === sub.challengeId)?.rubric ?? [];
  const marks = sub.aiRubric ?? rubricMarks(sub.answer, rubric);
  const update = (patch: Partial<Submission>) => setState((st) => ({ ...st, submissions: st.submissions.map((x) => (x.id === sub.id ? { ...x, ...patch } : x)) }));

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-h4">
            <Link href={`/profile/${sub.learnerId}`} className="hover:text-burgundy">
              {nameOf(s, sub.learnerId)}
            </Link>
          </h3>
          <p className="text-body-sm text-muted">Submitted {sub.submittedAt}</p>
        </div>
        {sub.status === "submitted" ? (
          <Badge tone="highlight">To review</Badge>
        ) : sub.status === "needs-work" ? (
          <Badge>Feedback sent</Badge>
        ) : (
          <Badge tone="success">{sub.status === "offered" ? "Offer sent" : "Interview"}</Badge>
        )}
      </div>

      <div className="flex gap-4 rounded-xl border border-ai-line bg-ai p-4">
        <div className="w-16 shrink-0 text-center">
          <p className="font-heading text-h3 font-semibold text-ai-ink">{sub.aiScore}</p>
          <p className="text-[11px] font-semibold whitespace-nowrap text-ai-ink">AI SCORE</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold text-ai-ink">AI summary</p>
          <p>{sub.aiSummary}</p>
          {!!marks.length && (
            <ul className="mt-3 flex flex-col gap-1 text-body-sm">
              {marks.map((m) => (
                <li key={m.point}>
                  <span className={m.met ? "font-medium text-success" : "font-medium text-muted"}>{m.met ? "Met" : "Not met"}</span>
                  {" · "}
                  {m.point}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-body-sm text-ai-ink">You still decide.</p>
        </div>
      </div>

      <details>
        <summary className="cursor-pointer font-medium">Full answer</summary>
        <p className="mt-2 whitespace-pre-wrap">{sub.answer}</p>
        {sub.link && (
          <a href={sub.link} target="_blank" rel="noreferrer" className="mt-2 text-burgundy underline">
            {sub.link}
          </a>
        )}
      </details>

      {sub.status === "submitted" && (
        <div className="grid gap-4 border-t border-line pt-4 md:grid-cols-2">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setAsk("feedback");
            }}
          >
            <p className="text-sm font-medium">Not ready yet?</p>
            <Textarea label="Feedback for the learner" required value={feedback} onChange={(e) => setFeedback(e.target.value)} className="min-h-20" />
            <Button type="submit" variant="secondary" className="self-start">
              Send feedback
            </Button>
          </form>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setAsk("invite");
            }}
          >
            <Input label="Good enough? Invite to interview" type="datetime-local" required min={minWhen} value={when} onChange={(e) => setWhen(e.target.value)} hint="Pick a time from now on." />
            <Button type="submit" className="self-start">
              Invite to interview
            </Button>
          </form>
          <ConfirmDialog
            open={ask === "feedback"}
            onClose={() => setAsk("")}
            onConfirm={() => update({ status: "needs-work", companyFeedback: feedback.trim() })}
            title={`Send feedback to ${learner}?`}
            confirmLabel="Send feedback"
          >
            <p>{learner} sees your note and can improve the answer and submit again. You can&apos;t edit the note after sending.</p>
            <p className="rounded-xl bg-surface p-3 text-ink">“{feedback.trim()}”</p>
          </ConfirmDialog>
          <ConfirmDialog
            open={ask === "invite"}
            onClose={() => setAsk("")}
            onConfirm={() => {
              const ch = s.challenges.find((c) => c.id === sub.challengeId)!;
              setState((st) => ({
                ...st,
                submissions: st.submissions.map((x) => (x.id === sub.id ? { ...x, status: "interview" } : x)),
                interviews: [...st.interviews, { id: newId("iv"), submissionId: sub.id, challengeId: ch.id, learnerId: sub.learnerId, companyId: ch.companyId, when, status: "scheduled" }],
              }));
            }}
            title={`Invite ${learner} to interview?`}
            confirmLabel="Send invite"
          >
            <p>Interview on {when.replace("T", " at ")}. {learner} is told right away, and you decide on the offer after you meet.</p>
          </ConfirmDialog>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 md:col-span-2">
            <p className="text-sm font-medium">Already sure? Skip the interview.</p>
            <Button onClick={() => setAsk("offer")}>Send offer</Button>
          </div>
        </div>
      )}
      {sub.status === "needs-work" && <p className="text-muted">Your feedback: “{sub.companyFeedback}”. The learner can submit again.</p>}
      {sub.status === "interview" && interview?.status === "scheduled" && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-sm font-medium">Ready to hire? Send an offer.</p>
          <Button onClick={() => setAsk("offer")}>Send offer</Button>
        </div>
      )}
      <ConfirmDialog
        open={ask === "offer"}
        onClose={() => setAsk("")}
        onConfirm={() => setState((st) => applyOffer(st, sub.id, newId("iv")))}
        title={`Send an offer to ${learner}?`}
        confirmLabel="Yes, send offer"
      >
        <p>
          They get an offer for {company?.terms.role || "an internship"} ({company?.terms.duration}, {company?.terms.stipend}) and can accept or decline it on their Internships page.
        </p>
      </ConfirmDialog>
      {sub.status === "offered" && (
        <p role="status" className="font-medium text-success">
          Offer sent to {nameOf(s, sub.learnerId)}. They can accept or decline it on their Internships page.
        </p>
      )}
      {interview?.when && (
        <p className="text-muted">
          Interview {interview.when.replace("T", " at ")} ·{" "}
          <Link href="/company/interviews" className="font-medium text-burgundy">
            manage interviews
          </Link>
        </p>
      )}
    </Card>
  );
}

export default function ReviewChallenge() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { s, company, lang } = useData();
  const courses = useCourses();
  const challenge = s.challenges.find((c) => c.id === challengeId && c.companyId === company?.id);
  const crumbs = [
    { label: "Challenges", href: "/company/challenges" },
    { label: challenge?.title ?? "Challenge" },
  ];
  if (!challenge)
    return (
      <>
        <Breadcrumb items={crumbs} />
        <Empty>Challenge not found.</Empty>
      </>
    );
  const subs = s.submissions.filter((x) => x.challengeId === challenge.id).sort((a, b) => b.aiScore - a.aiScore);
  const offers = s.interviews.filter((i) => i.challengeId === challenge.id && offerLabel[i.status]);

  return (
    <>
      <Breadcrumb items={crumbs} />
      <PageHeader title={challenge.title} intro={courseTitle(courses.find((c) => c.id === challenge.courseId), lang)} />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-h3">Submissions</h2>
          <p className="-mt-2 text-muted">Sorted by AI score. AI only helps you sort and read faster. You make every hiring decision.</p>
          {!subs.length && <Empty>No submissions yet.</Empty>}
          {subs.map((sub) => (
            <Review key={sub.id} sub={sub} />
          ))}
        </div>
        <div className="flex flex-col gap-6 self-start">
          <Card>
            <h2 className="mb-2 text-h4">Sent offers</h2>
            {!offers.length && <p className="text-muted">No offers sent yet.</p>}
            <ul className="flex flex-col gap-2">
              {offers.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/profile/${i.learnerId}`} className="font-medium hover:text-burgundy">
                    {nameOf(s, i.learnerId)}
                  </Link>
                  <Badge tone={i.status === "accepted" ? "success" : i.status === "offered" ? "highlight" : "neutral"}>{offerLabel[i.status]}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="mb-2 text-h4">The task</h2>
            <p>{challenge.task}</p>
            <h3 className="mt-4 mb-2 text-body-lg">Rubric</h3>
            <ul className="list-disc pl-5">
              {challenge.rubric.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
