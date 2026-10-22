"use client";

import Link from "next/link";
import { AiPanel } from "@/components/ui/AiPanel";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { goals } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { courses } from "@/lib/seed";
import { progressOf, useData } from "@/lib/store";

export default function Roadmap() {
  const { s, me, lang } = useData();
  const p = progressOf(s, me.id);
  const goal = goals.find((g) => g.id === p.goal)?.label ?? "Your goal";
  if (!p.roadmap.length) return <Empty>No roadmap yet. <Link href="/onboarding" className="font-medium text-burgundy">Set your career goal</Link></Empty>;

  return (
    <>
      <PageHeader title={`Roadmap: ${goal}`} intro="Take these courses in order. Each one ends with a test and a real company challenge." pose="flag">
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
