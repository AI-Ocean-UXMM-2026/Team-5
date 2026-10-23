"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AiPanel } from "@/components/ui/AiPanel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, Empty, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Textarea } from "@/components/ui/Field";
import { Mascot } from "@/components/ui/Mascot";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { reviewChallenge } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { challengeUnlocked, rubricMarks } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { newId, setState, today, useData } from "@/lib/store";

export default function ChallengeDetail() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { s, me, lang } = useData();
  const courses = useCourses();
  const challenge = s.challenges.find((c) => c.id === challengeId);
  const sub = s.submissions.find((x) => x.challengeId === challengeId && x.learnerId === me.id);
  const [answer, setAnswer] = useState(sub?.answer ?? "");
  const [link, setLink] = useState(sub?.link ?? "");
  const [feedback, setFeedback] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<"" | "feedback" | "submit">("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const company = s.companies.find((c) => c.id === challenge?.companyId);
  const crumbs = [
    { label: "Challenges", href: "/challenges" },
    { label: challenge?.title ?? "Challenge" },
  ];
  if (!challenge || company?.status !== "verified")
    return (
      <>
        <Breadcrumb items={crumbs} />
        <Empty>Challenge not found.</Empty>
      </>
    );
  const companyUser = s.users.find((u) => u.companyId === company.id);
  const course = courses.find((c) => c.id === challenge.courseId);
  if (!challengeUnlocked(s.certificates, me.id, challenge.courseId))
    return (
      <>
        <Breadcrumb items={crumbs} />
        <Empty>
          This challenge unlocks after you get certified in{" "}
          <Link href={`/courses/${challenge.courseId}`} className="font-medium text-burgundy">
            {courseTitle(course, lang)}
          </Link>
          .
        </Empty>
      </>
    );

  const editable = !sub || sub.status === "needs-work";

  async function submit() {
    setBusy("submit");
    setError("");
    try {
      // AI only pre-screens, so an AI outage must not block the submission: fall back to the keyword check.
      const review = await reviewChallenge(answer, link, challenge!.rubric, challenge!.task).catch(() => {
        const marks = rubricMarks(answer, challenge!.rubric);
        return {
          feedback: [],
          aiScore: Math.round((marks.filter((m) => m.met).length / Math.max(1, marks.length)) * 100),
          aiSummary: "AI was not available. This score is a simple keyword check, so read the answer yourself.",
          aiRubric: marks,
        };
      });
      setState((st) => {
        const next = { answer: answer.trim(), link: link.trim(), aiFeedback: review.feedback, aiScore: review.aiScore, aiSummary: review.aiSummary, aiRubric: review.aiRubric, status: "submitted" as const, companyFeedback: undefined, submittedAt: today() };
        return {
          ...st,
          submissions: sub
            ? st.submissions.map((x) => (x.id === sub.id ? { ...x, ...next } : x))
            : [...st.submissions, { id: newId("s"), challengeId: challenge!.id, learnerId: me.id, ...next }],
        };
      });
      setFeedback(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI did not answer.");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <Breadcrumb items={crumbs} />
      <PageHeader title={challenge.title}>
        <div className="flex items-center gap-2 text-muted">
          {companyUser ? (
            <Link href={`/profile/${companyUser.id}`} className="hover:text-burgundy">
              {company.name}
            </Link>
          ) : (
            company.name
          )}{" "}
          <VerifiedBadge company={company} />
        </div>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-2 text-h4">The task</h2>
            <p className="text-body-lg">{challenge.task}</p>
            <h3 className="mt-5 mb-2 text-body-lg">How it is judged</h3>
            <ul className="list-disc pl-5">
              {challenge.rubric.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="mt-5 text-body-sm text-muted">
              Questions about the task?{" "}
              <Link href="/community" className="font-medium text-burgundy">
                Ask in the community
              </Link>
              . Please don&apos;t share your answer there.
            </p>
          </Card>

          {sub?.status === "needs-work" && sub.companyFeedback && (
            <Card tone="highlight">
              <h2 className="mb-1 text-h4">Feedback from {company.name}</h2>
              <p>{sub.companyFeedback}</p>
              <p className="mt-2 text-body-sm text-muted">Improve your answer below and submit it again.</p>
            </Card>
          )}

          {editable ? (
            <Card>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setConfirming(true);
                }}
              >
                <Textarea label="Your answer" required value={answer} onChange={(e) => setAnswer(e.target.value)} hint="Explain what you did and why." className="min-h-48" />
                <Input label="Link to your work" type="url" placeholder="https://github.com/…" value={link} onChange={(e) => setLink(e.target.value)} />
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    disabled={!answer.trim() || !!busy}
                    onClick={async () => {
                      setBusy("feedback");
                      setError("");
                      try {
                        const review = await reviewChallenge(answer, link, challenge.rubric, challenge.task);
                        setFeedback(review.feedback);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "AI did not answer.");
                      } finally {
                        setBusy("");
                      }
                    }}
                  >
                    Get AI feedback first
                  </Button>
                  <Button type="submit" disabled={!answer.trim() || !!busy}>
                    {busy === "submit" ? "Submitting…" : sub ? "Submit again" : "Submit to company"}
                  </Button>
                </div>
                {error ? <p className="text-body-sm text-danger">{error}</p> : null}
              </form>
              <ConfirmDialog
                open={confirming}
                onClose={() => setConfirming(false)}
                onConfirm={submit}
                title={`Send your work to ${company.name}?`}
                confirmLabel={sub ? "Submit again" : "Submit to company"}
                cancelLabel="Keep editing"
              >
                <p>{company.name} will see your answer{link.trim() ? " and your link" : ""}. You can&apos;t edit it while they review it.</p>
                {!feedback && !sub?.aiFeedback.length && <p className="text-body-sm">Tip: you haven&apos;t asked for AI feedback yet. It can point out gaps before the company sees your work.</p>}
                {!link.trim() && <p className="text-body-sm">You haven&apos;t added a link to your work.</p>}
              </ConfirmDialog>
            </Card>
          ) : (
            <Card>
              <Mascot pose={sub.status === "submitted" ? "wink" : "excited"} size={96} className="mb-2" />
              <h2 className="mb-2 text-h4">{sub.status === "offered" ? "You received an offer" : sub.status === "interview" ? "You're invited to interview" : "Submitted, waiting for review"}</h2>
              <p className="mb-4 text-muted">
                {sub.status === "submitted" ? (
                  <>
                    {company.name} will review your work. AI pre-screens it, but the company makes the decision.
                  </>
                ) : (
                  <>
                    {companyUser ? (
                      <Link href={`/profile/${companyUser.id}`} className="font-medium text-burgundy hover:underline">
                        {company.name}
                      </Link>
                    ) : (
                      company.name
                    )}{" "}
                    liked your work.
                  </>
                )}
              </p>
              {sub.status !== "submitted" && <LinkButton href="/internships">{sub.status === "offered" ? "See your offer" : "See your interview"}</LinkButton>}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Your answer</summary>
                <p className="mt-2 whitespace-pre-wrap">{sub.answer}</p>
                {sub.link && (
                  <a href={sub.link} target="_blank" rel="noreferrer" className="mt-2 text-burgundy underline">
                    {sub.link}
                  </a>
                )}
              </details>
            </Card>
          )}
        </div>

        <AiPanel title="First feedback" loading={busy === "feedback"}>
          {feedback || sub?.aiFeedback.length ? (
            <ul className="list-disc pl-5">
              {(feedback ?? sub!.aiFeedback).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Write your answer, then ask AI for feedback before the company sees it.</p>
          )}
        </AiPanel>
      </div>
    </>
  );
}
