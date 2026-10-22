"use client";

import Link from "next/link";
import { AiPanel } from "@/components/ui/AiPanel";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, PageHeader } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { goals } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { courses } from "@/lib/seed";
import { progressOf, useData } from "@/lib/store";

export default function Roadmap() {
  const { s, me, lang } = useData();
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

  return (
    <>
      <PageHeader title={`Roadmap: ${goal}`} intro="Complete each course, pass the test, and tackle a real company challenge." pose="flag">
        <LinkButton href="/onboarding" variant="secondary">
          Change goal
        </LinkButton>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ol className="flex flex-col gap-3">
          {p.roadmap.map((id, i) => {
            const c = courses.find((x) => x.id === id)!;
            const done = c.lessons.filter((l) => p.doneLessons.includes(l.id)).length;
            const certified = s.certificates.some((x) => x.learnerId === me.id && x.courseId === id);
            return (
              <li key={id}>
                <Card className="flex items-center gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-tint font-heading font-semibold">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/courses/${id}`} className="font-heading text-h4 font-semibold hover:text-burgundy">
                      {courseTitle(c, lang)}
                    </Link>
                    <p className="text-muted">
                      {c.hours} hours · {done} of {c.lessons.length} lessons done
                    </p>
                  </div>
                  {certified ? <Badge tone="success">Certified</Badge> : done ? <Badge tone="highlight">In progress</Badge> : <Badge>Not started</Badge>}
                </Card>
              </li>
            );
          })}
        </ol>
        <AiPanel title="Why this order">
          <p>{p.roadmapNote}</p>
        </AiPanel>
      </div>
    </>
  );
}
