"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Detail } from "@/components/ui/Detail";
import { Input, Textarea } from "@/components/ui/Field";
import { courseTitle, formatPlace, formatWhen } from "@/lib/i18n";
import { applyOffer, rubricMarks } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { nameOf, newId, setState, useData } from "@/lib/store";
import type { Interview, Submission } from "@/lib/types";

type Decision = "invite" | "feedback" | "offer";

/** One badge per submission that says where it stands, so nothing else on the card has to repeat it. */
function statusOf(sub: Submission, interview: Interview | undefined): { text: string; tone: "highlight" | "neutral" | "success" | "brand" } {
  if (sub.status === "submitted") return { text: "To review", tone: "highlight" };
  if (sub.status === "needs-work") return { text: "Feedback sent", tone: "neutral" };
  if (interview?.status === "accepted") return { text: "Offer accepted", tone: "success" };
  if (interview?.status === "declined") return { text: "Offer declined", tone: "neutral" };
  if (interview?.status === "not-selected") return { text: "Not selected", tone: "neutral" };
  if (sub.status === "offered" || interview?.status === "offered") return { text: "Offer sent · waiting for reply", tone: "success" };
  return { text: "Interview scheduled", tone: "brand" };
}

function Review({ sub }: { sub: Submission }) {
  const { s, company } = useData();
  const learner = nameOf(s, sub.learnerId);
  const first = learner.split(" ")[0];
  const interview = s.interviews.find((i) => i.submissionId === sub.id);
  const rubric = s.challenges.find((c) => c.id === sub.challengeId)?.rubric ?? [];
  const marks = sub.aiRubric ?? rubricMarks(sub.answer, rubric);
  const [decision, setDecision] = useState<Decision>("invite");
  const [feedback, setFeedback] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [format, setFormat] = useState<"video" | "office">("video");
  const [link, setLink] = useState("");
  const [address, setAddress] = useState(company?.address ?? "");
  const [ask, setAsk] = useState<"" | Decision>("");
  // The earliest interview day is today, in the yyyy-mm-dd format a date field expects.
  const [minDate] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10));
  const update = (patch: Partial<Submission>) => setState((st) => ({ ...st, submissions: st.submissions.map((x) => (x.id === sub.id ? { ...x, ...patch } : x)) }));
  const when = date && time ? `${date}T${time}` : "";
  const place = format === "video" ? link.trim() : address.trim();
  const status = statusOf(sub, interview);
  const canOffer = sub.status === "submitted" || (sub.status === "interview" && interview?.status === "scheduled");
  const terms = company?.terms;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-h4">
            <Link href={`/profile/${sub.learnerId}`} className="hover:text-burgundy">
              {learner}
            </Link>
          </h3>
          <p className="text-body-sm text-muted">Sent {sub.submittedAt}</p>
        </div>
        <Badge tone={status.tone}>{status.text}</Badge>
      </div>

      <div className="flex gap-4 rounded-xl border border-ai-line bg-ai p-4">
        <div className="w-14 shrink-0 text-center">
          <p className="font-heading text-h3 font-semibold text-ai-ink">{sub.aiScore}</p>
          <p className="text-[11px] font-semibold whitespace-nowrap text-ai-ink">AI SCORE</p>
        </div>
        <div className="min-w-0 flex-1">
          <p>{sub.aiSummary}</p>
          {!!marks.length && (
            <ul className="mt-3 flex flex-wrap gap-2 text-body-sm">
              {marks.map((m) => (
                <li key={m.point} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 ${m.met ? "bg-success-tint text-success" : "bg-white text-muted"}`}>
                  <span aria-hidden>{m.met ? "✓" : "–"}</span>
                  <span className="sr-only">{m.met ? "Met:" : "Not met:"}</span>
                  {m.point}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details>
        <summary className="cursor-pointer font-medium">Full answer</summary>
        <p className="mt-2 whitespace-pre-wrap">{sub.answer}</p>
        {sub.link && (
          <a href={sub.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-burgundy underline">
            {sub.link}
          </a>
        )}
      </details>

      {sub.status === "needs-work" && sub.companyFeedback && <p className="rounded-xl bg-surface p-3 text-body-sm text-muted">Your feedback: “{sub.companyFeedback}”. {first} can send a new answer.</p>}

      {/* A scheduled interview: its details, and the offer once you've met. */}
      {interview?.status === "scheduled" && interview.when && (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail kind="duration" label="Interview">
              {formatWhen(interview.when)}
            </Detail>
            {interview.format && (
              <Detail kind="location" label={interview.format === "video" ? "Video call" : "At the office"}>
                {interview.place ? (
                  /^https?:\/\//.test(interview.place) ? (
                    <a href={interview.place} target="_blank" rel="noreferrer" className="break-all text-burgundy hover:underline">
                      {interview.place}
                    </a>
                  ) : (
                    interview.place
                  )
                ) : (
                  "—"
                )}
              </Detail>
            )}
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/company/interviews" className="text-body-sm font-medium text-burgundy hover:underline">
              Manage interviews
            </Link>
            <Button onClick={() => setAsk("offer")}>Send offer</Button>
          </div>
        </div>
      )}

      {sub.status === "submitted" && (
        <div className="border-t border-line pt-4">
          <div role="tablist" aria-label={`Your decision for ${learner}`} className="mb-4 flex flex-wrap gap-1 rounded-xl bg-surface p-1">
            {(
              [
                ["invite", "Invite to interview"],
                ["feedback", "Ask for changes"],
                ["offer", "Send offer"],
              ] as const
            ).map(([id, text]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={decision === id}
                onClick={() => setDecision(id)}
                className={`min-h-9 flex-1 rounded-lg px-3 text-sm font-medium whitespace-nowrap ${decision === id ? "bg-white text-burgundy shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {text}
              </button>
            ))}
          </div>

          {decision === "invite" && (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setAsk("invite");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Date" type="date" required min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
                <Input label="Time" type="time" required step={900} value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">How you&apos;ll meet</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["video", "Video call"],
                      ["office", "At our office"],
                    ] as const
                  ).map(([id, text]) => (
                    <label
                      key={id}
                      className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm ${format === id ? "border-burgundy bg-burgundy-tint text-burgundy" : "border-line hover:bg-surface"}`}
                    >
                      <input type="radio" name={`format-${sub.id}`} checked={format === id} onChange={() => setFormat(id)} className="accent-burgundy" />
                      {text}
                    </label>
                  ))}
                </div>
              </fieldset>
              {format === "video" ? (
                <Input label="Meeting link" type="url" required placeholder="https://meet.google.com/…" value={link} onChange={(e) => setLink(e.target.value)} hint={`${first} sees this link on their Internships page.`} />
              ) : (
                <Input label="Office address" required value={address} onChange={(e) => setAddress(e.target.value)} hint="From your company page. Change it if the interview is somewhere else." />
              )}
              <Button type="submit" className="self-start">
                Send invite
              </Button>
            </form>
          )}

          {decision === "feedback" && (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setAsk("feedback");
              }}
            >
              <Textarea
                label={`What should ${first} improve?`}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                hint={`${first} sees your note and can send a new answer.`}
                className="min-h-28"
              />
              <Button type="submit" className="self-start">
                Send feedback
              </Button>
            </form>
          )}

          {decision === "offer" && (
            <div className="flex flex-col gap-4">
              <p className="text-muted">Skip the interview and offer {first} the internship on your approved terms.</p>
              <dl className="grid gap-4 rounded-xl bg-surface p-4 sm:grid-cols-2">
                <Detail kind="role" label="Role">
                  {terms?.role || "—"}
                </Detail>
                <Detail kind="duration" label="Duration">
                  {terms?.duration || "—"}
                </Detail>
                <Detail kind="location" label="Location">
                  {terms?.location || "—"}
                </Detail>
                <Detail kind="stipend" label="Stipend">
                  {terms?.stipend || "—"}
                </Detail>
              </dl>
              <Button className="self-start" onClick={() => setAsk("offer")}>
                Send offer
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={ask === "feedback"}
        onClose={() => setAsk("")}
        onConfirm={() => update({ status: "needs-work", companyFeedback: feedback.trim() })}
        title={`Send feedback to ${learner}?`}
        confirmLabel="Send feedback"
      >
        <p>{first} sees your note and can improve the answer and send it again. You can&apos;t edit the note after sending.</p>
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
            interviews: [...st.interviews, { id: newId("iv"), submissionId: sub.id, challengeId: ch.id, learnerId: sub.learnerId, companyId: ch.companyId, when, format, place, status: "scheduled" }],
          }));
        }}
        title={`Invite ${learner} to interview?`}
        confirmLabel="Send invite"
      >
        <p className="text-ink">
          {formatWhen(when)} · {formatPlace({ format, place })}
        </p>
        <p>{first} is told right away. You decide on the offer after you meet.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={ask === "offer"}
        onClose={() => setAsk("")}
        onConfirm={() => canOffer && setState((st) => applyOffer(st, sub.id, newId("iv")))}
        title={`Send an offer to ${learner}?`}
        confirmLabel="Yes, send offer"
      >
        <p>
          {terms?.role || "Internship"} · {terms?.duration} · {terms?.location} · {terms?.stipend}
        </p>
        <p>{first} can accept or decline it on their Internships page.</p>
      </ConfirmDialog>
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
  const toReview = subs.filter((x) => x.status === "submitted").length;

  return (
    <>
      <Breadcrumb items={crumbs} />
      <PageHeader title={challenge.title} intro={`${courseTitle(courses.find((c) => c.id === challenge.courseId), lang)} · posted ${challenge.createdAt}`}>
        {toReview > 0 && <Badge tone="highlight">{toReview} to review</Badge>}
      </PageHeader>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="subs-title" className="flex flex-col gap-4">
          <div>
            <h2 id="subs-title" className="text-h3">
              Submissions <span className="text-muted">({subs.length})</span>
            </h2>
            <p className="text-body-sm text-muted">Sorted by AI score. AI helps you read faster; you make every hiring decision.</p>
          </div>
          {!subs.length && <Empty>No submissions yet. Certified learners see your challenge on their Challenges page.</Empty>}
          {subs.map((sub) => (
            <Review key={sub.id} sub={sub} />
          ))}
        </section>
        <Card className="flex flex-col gap-3 lg:sticky lg:top-24">
          <h2 className="text-h4">The brief</h2>
          <p className="text-body-sm">{challenge.task}</p>
          <h3 className="mt-1 text-sm font-semibold">Rubric</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm">
            {challenge.rubric.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
