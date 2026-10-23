"use client";

import { useState } from "react";
import { AiPanel } from "@/components/ui/AiPanel";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, LockIcon, PageHeader } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { courseSuggestion, goals } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { roadmapStepOpen } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { progressOf, useData } from "@/lib/store";

export default function Roadmap() {
  const { s, me, lang } = useData();
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
  const stepCourses = p.roadmap.map((id) => courses.find((x) => x.id === id)!);
  const steps = stepCourses.map((c, i) => ({
    c,
    done: c.lessons.filter((l) => p.doneLessons.includes(l.id)).length,
    certified: certifiedIds.includes(c.id),
    open: roadmapStepOpen(stepCourses, i, p.doneLessons, certifiedIds),
  }));
  const firstToDo = steps.findIndex((x) => x.open && !x.certified);
  const selected = picked !== null && picked < steps.length ? picked : Math.max(0, firstToDo);
  const current = steps[selected];

  return (
    <>
      <PageHeader title={`Roadmap: ${goal}`} intro="Complete each course, pass the test, and tackle a real company challenge." pose="flag">
        <LinkButton href="/onboarding" variant="secondary">
          Change goal
        </LinkButton>
      </PageHeader>
      <div className="relative overflow-x-auto py-4">
        <div aria-hidden className="absolute top-1/2 right-0 left-0 border-t-2 border-dotted border-subtle">
          <span className="absolute -top-[5px] left-0 size-2 rounded-full bg-ink" />
          <span className="absolute -top-[5px] right-0 size-2 rounded-full bg-ink" />
        </div>
        <ol className="relative flex justify-around gap-6 px-6">
          {steps.map(({ c, done, certified, open }, i) => (
            <li key={c.id} className="w-48 shrink-0">
              <button
                type="button"
                aria-pressed={selected === i}
                onClick={() => setPicked(i)}
                className={`flex h-full w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border bg-white p-4 text-center shadow-sm transition duration-200 focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 ${open ? "hover:-translate-y-0.5 hover:shadow-md" : "bg-disabled text-muted"} ${selected === i ? "border-burgundy ring-2 ring-burgundy/20" : "border-line hover:border-subtle"}`}
              >
                <span
                  aria-label={open ? undefined : "Locked"}
                  className={`grid size-8 place-items-center rounded-full font-heading text-sm font-semibold ${open ? "bg-burgundy text-white" : "bg-line text-muted"}`}
                >
                  {open ? i + 1 : <LockIcon className="size-3.5" />}
                </span>
                <span className="font-heading text-body font-semibold">{courseTitle(c, lang)}</span>
                {certified ? (
                  <Badge tone="success">Certified</Badge>
                ) : !open ? (
                  <Badge>
                    <LockIcon /> Locked
                  </Badge>
                ) : done ? (
                  <Badge tone="highlight">In progress</Badge>
                ) : (
                  <Badge>Not started</Badge>
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-4">
        <AiPanel title={`Lesson ${selected + 1}: ${courseTitle(current.c, lang)}`} tone="yellow">
          {current.open ? (
            <>
              <p>{courseSuggestion(current.c, p.doneLessons, current.certified, p.hoursPerWeek)}</p>
              <p className="mt-2 text-body-sm text-muted">
                {current.c.hours} hours · {current.done} of {current.c.lessons.length} lessons done
              </p>
              <LinkButton href={`/courses/${current.c.id}`} className="mt-4">
                Open course
              </LinkButton>
            </>
          ) : (
            <p>Finish “{courseTitle(steps[selected - 1].c, lang)}” first. This course unlocks when every lesson there is done.</p>
          )}
        </AiPanel>
      </div>
    </>
  );
}
