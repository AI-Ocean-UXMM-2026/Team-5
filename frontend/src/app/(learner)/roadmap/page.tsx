"use client";

import { useState } from "react";
import { AiPanel } from "@/components/ui/AiPanel";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, LockIcon, PageHeader } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { courseSuggestion, goals } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { challengeUnlocked, counted, roadmapStepOpen } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { progressOf, useData } from "@/lib/store";

export default function Roadmap() {
  const { s, me, lang } = useData();
  const courses = useCourses();
  const [picked, setPicked] = useState<number | null>(null);
  const p = progressOf(s, me.id);
  const goal = goals.find((g) => g.id === p.goal)?.label ?? "Your goal";
  if (!p.roadmap.length) {
    return (
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-white p-8 text-center">
          <Mascot pose="peek" size={120} />
          <p className="text-muted">Set your career goal and discover the skills you need to move forward.</p>
          <LinkButton href="/onboarding">Set Career Goal</LinkButton>
        </div>
        <Card>
          <h2 className="text-h4">How to set a career goal</h2>
          <p className="mt-2 text-muted">A demo. These answers build an ordered list of courses.</p>
          <dl className="mt-4 flex flex-col gap-3">
            {[
              ["Career goal", "Frontend Developer"],
              ["What you can do already", "A little HTML"],
              ["Hours each week", "5"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-body-sm text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <ol className="mt-4 flex flex-col gap-2 text-muted">
            <li>1. Career starter: working in IT</li>
            <li>2. Frontend basics: HTML, CSS and JavaScript</li>
          </ol>
        </Card>
      </div>
    );
  }

  const certifiedIds = s.certificates.filter((x) => x.learnerId === me.id).map((x) => x.courseId);
  // A course can leave the catalogue after the roadmap was made; skip it rather than break the page.
  const stepCourses = p.roadmap.flatMap((id) => courses.find((x) => x.id === id) ?? []);
  const steps = stepCourses.map((c, i) => ({
    c,
    done: c.lessons.filter((l) => p.doneLessons.includes(l.id)).length,
    certified: certifiedIds.includes(c.id),
    open: roadmapStepOpen(stepCourses, i, p.doneLessons, certifiedIds),
  }));
  const firstToDo = steps.findIndex((x) => x.open && !x.certified);
  const selected = picked !== null && picked < steps.length ? picked : Math.max(0, firstToDo);
  const current = steps[selected];

  // The journey goes past the courses: a company challenge, then an internship.
  const goalChallenges = s.challenges.filter(
    (c) => p.roadmap.includes(c.courseId) && s.companies.find((co) => co.id === c.companyId)?.status === "verified",
  );
  const openChallenges = goalChallenges.filter((c) => challengeUnlocked(s.certificates, me.id, c.courseId));
  const submitted = s.submissions.some((x) => x.learnerId === me.id);
  const interviews = s.interviews.filter((i) => i.learnerId === me.id);
  const started = interviews.some((i) => i.status === "accepted");
  const offered = interviews.some((i) => i.status === "offered");

  return (
    <>
      <PageHeader title={`Roadmap: ${goal}`} intro="Complete each course, pass the test, and tackle a real company challenge." pose="flag">
        <LinkButton href="/onboarding" variant="secondary">
          Change goal
        </LinkButton>
      </PageHeader>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* First on phones so the tip sits above the timeline; beside it on wide screens. */}
        <aside className="lg:sticky lg:top-24 lg:order-last">
          <AiPanel title={`Tip for ${courseTitle(current.c, lang)}`} tone="yellow">
            <div className="flex items-start gap-3">
              <Mascot pose="teach" size={64} />
              <p>
                {current.open
                  ? courseSuggestion(current.c, p.doneLessons, current.certified, p.hoursPerWeek)
                  : `This course opens after you finish “${courseTitle(steps[selected - 1].c, lang)}”. Keep going there first.`}
              </p>
            </div>
          </AiPanel>
        </aside>
        <ol className="flex flex-col">
          {steps.map(({ c, done, certified, open }, i) => {
            const expanded = selected === i;
            return (
              <Step key={c.id} marker={certified ? "done" : open ? "open" : "locked"} label={i + 1}>
                <div className={`rounded-2xl border bg-white transition ${expanded ? "border-burgundy ring-2 ring-burgundy/15" : "border-line hover:border-subtle"}`}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setPicked(i)}
                    className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-2 rounded-2xl p-4 text-left focus-visible:ring-2 focus-visible:ring-burgundy sm:px-5"
                  >
                    <span>
                      <span className="block font-heading font-semibold">{courseTitle(c, lang)}</span>
                      <span className="text-body-sm text-muted">
                        {c.hours} hours · {done} of {c.lessons.length} lessons done
                      </span>
                      {p.roadmapReasons?.[c.id] && <span className="mt-1 block text-body-sm text-ink">Why: {p.roadmapReasons[c.id]}</span>}
                    </span>
                    {certified ? (
                      <Badge tone="success">Certified</Badge>
                    ) : !open ? (
                      <Badge>
                        <LockIcon /> Locked
                      </Badge>
                    ) : i === firstToDo ? (
                      <Badge tone="highlight">You are here</Badge>
                    ) : (
                      <Badge>{done ? "In progress" : "Not started"}</Badge>
                    )}
                  </button>
                  {expanded && (
                    <div className="flex flex-col gap-4 border-t border-line px-4 pt-4 pb-5 sm:px-5">
                      {open ? (
                        <>
                          <div className="flex flex-wrap items-center gap-4">
                            <div
                              role="progressbar"
                              aria-label={`${courseTitle(c, lang)} progress`}
                              aria-valuemin={0}
                              aria-valuemax={c.lessons.length}
                              aria-valuenow={done}
                              className="h-2 min-w-40 flex-1 overflow-hidden rounded-full bg-line"
                            >
                              <div className={`h-full rounded-full ${certified ? "bg-success" : "bg-burgundy"}`} style={{ width: `${(done / c.lessons.length) * 100}%` }} />
                            </div>
                            <LinkButton href={`/courses/${c.id}`} variant={certified ? "secondary" : "primary"}>
                              {certified ? "Review course" : done ? "Continue" : "Start course"}
                            </LinkButton>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted">Finish “{courseTitle(steps[i - 1].c, lang)}” first. This course unlocks when every lesson there is done.</p>
                      )}
                    </div>
                  )}
                </div>
              </Step>
            );
          })}
          <Step marker={submitted ? "done" : openChallenges.length ? "open" : "locked"} label={steps.length + 1}>
            <Milestone
              title="Company challenge"
              text={
                submitted
                  ? "You sent work to a company. Check its feedback in Challenges."
                  : openChallenges.length
                    ? `${counted(openChallenges.length, "challenge")} from verified companies ${openChallenges.length === 1 ? "is" : "are"} open to you.`
                    : goalChallenges.length
                      ? `Get certified in a course above to unlock ${counted(goalChallenges.length, "company challenge")}.`
                      : "Get certified in a course above to unlock company challenges."
              }
              href={openChallenges.length || submitted ? "/challenges" : undefined}
              action="See challenges"
            />
          </Step>
          <Step marker={started ? "done" : interviews.length ? "open" : "locked"} label={steps.length + 2} last>
            <Milestone
              title="Internship"
              text={
                started
                  ? "Your internship has started. Well done."
                  : offered
                    ? "You have an internship offer waiting for your answer."
                    : interviews.length
                      ? `You have ${counted(interviews.length, "interview")} with companies.`
                      : `Pass a company challenge to get an interview and reach your goal: ${goal}.`
              }
              href={interviews.length ? "/internships" : undefined}
              action={offered ? "See offer" : "See internships"}
            />
          </Step>
        </ol>
      </div>
    </>
  );
}

function Step({ marker, label, last, children }: { marker: "done" | "open" | "locked"; label: number; last?: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        <span
          aria-label={marker === "done" ? "Done" : marker === "locked" ? "Locked" : undefined}
          className={`grid size-9 shrink-0 place-items-center rounded-full font-heading text-sm font-semibold ${
            marker === "done" ? "bg-success-tint text-success" : marker === "open" ? "bg-burgundy text-white" : "border border-line bg-white text-muted"
          }`}
        >
          {marker === "done" ? "✓" : marker === "locked" ? <LockIcon className="size-3.5" /> : label}
        </span>
        {!last && <span aria-hidden className={`my-1 w-0.5 flex-1 rounded-full ${marker === "done" ? "bg-success/40" : "bg-line"}`} />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? "" : "pb-4"}`}>{children}</div>
    </li>
  );
}

function Milestone({ title, text, href, action }: { title: string; text: string; href?: string; action: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 sm:px-5">
      <div className="min-w-48 flex-1">
        <p className="font-heading font-semibold">{title}</p>
        <p className="text-body-sm text-muted">{text}</p>
      </div>
      {href && (
        <LinkButton href={href} variant="secondary">
          {action}
        </LinkButton>
      )}
    </div>
  );
}
