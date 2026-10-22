"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AiPanel } from "@/components/ui/AiPanel";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, Empty, PageHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { Mascot } from "@/components/ui/Mascot";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { challengeFeedback, scoreSubmission } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { challengeUnlocked } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { newId, setState, today, useData } from "@/lib/store";

export default function ChallengeDetail() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { s, me, lang } = useData();
  const challenge = s.challenges.find((c) => c.id === challengeId);
  const sub = s.submissions.find((x) => x.challengeId === challengeId && x.learnerId === me.id);
  const [answer, setAnswer] = useState(sub?.answer ?? "");
  const [link, setLink] = useState(sub?.link ?? "");
  const [feedback, setFeedback] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<"" | "feedback" | "submit">("");

  const company = s.companies.find((c) => c.id === challenge?.companyId);
  if (!challenge || company?.status !== "verified") return <Empty>Challenge not found.</Empty>;
  const course = courses.find((c) => c.id === challenge.courseId);
  if (!challengeUnlocked(s.certificates, me.id, challenge.courseId))
    return (
      <Empty>
        This challenge unlocks after you get certified in{" "}
        <Link href={`/courses/${challenge.courseId}`} className="font-medium text-burgundy">
          {courseTitle(course, lang)}
        </Link>
        .
      </Empty>
    );

  const editable = !sub || sub.status === "needs-work";

  async function submit() {
    setBusy("submit");
    const [aiFeedback, scored] = await Promise.all([feedback ?? challengeFeedback(answer, link, challenge!.rubric), scoreSubmission(answer, link, challenge!.rubric)]);
    setState((st) => {
      const next = { answer: answer.trim(), link: link.trim(), aiFeedback, ...scored, status: "submitted" as const, companyFeedback: undefined, submittedAt: today() };
      return {
        ...st,
        submissions: sub
          ? st.submissions.map((x) => (x.id === sub.id ? { ...x, ...next } : x))
          : [...st.submissions, { id: newId("s"), challengeId: challenge!.id, learnerId: me.id, ...next }],
      };
    });
    setFeedback(null);
    setBusy("");
  }

  return (
    <>
      <PageHeader title={challenge.title}>
        <div className="flex items-center gap-2 text-muted">
          {company.name} <VerifiedBadge company={company} />
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
                  submit();
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
                      setFeedback(await challengeFeedback(answer, link, challenge.rubric));
                      setBusy("");
                    }}
                  >
                    Get AI feedback first
                  </Button>
                  <Button type="submit" disabled={!answer.trim() || !!busy}>
                    {busy === "submit" ? "Submitting…" : sub ? "Submit again" : "Submit to company"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card>
              <Mascot pose={sub.status === "interview" ? "excited" : "wink"} size={96} className="mb-2" />
              <h2 className="mb-2 text-h4">{sub.status === "interview" ? "You're invited to interview" : "Submitted, waiting for review"}</h2>
              <p className="mb-4 text-muted">
                {sub.status === "interview" ? `${company.name} liked your work.` : `${company.name} will review your work. AI pre-screens it, but the company makes the decision.`}
              </p>
              {sub.status === "interview" && <LinkButton href="/internships">See your interview</LinkButton>}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">Your answer</summary>
                <p className="mt-2 whitespace-pre-wrap">{sub.answer}</p>
                {sub.link && (
                  <a href={sub.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-burgundy underline">
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
