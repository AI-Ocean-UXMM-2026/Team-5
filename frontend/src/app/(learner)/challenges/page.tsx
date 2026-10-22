"use client";

import Link from "next/link";
import { Badge, Card, Empty, LockIcon, PageHeader } from "@/components/ui/Card";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { courseTitle } from "@/lib/i18n";
import { challengeUnlocked } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { useData } from "@/lib/store";

const statusLabel = { submitted: "Waiting for review", "needs-work": "Feedback to act on", interview: "Interview invite", offered: "Offer received" } as const;

export default function Challenges() {
  const { s, me, lang } = useData();
  const live = s.challenges.filter((c) => s.companies.find((co) => co.id === c.companyId)?.status === "verified");

  return (
    <>
      <PageHeader title="Company challenges" intro="Real tasks from verified companies. Finish the course to unlock its challenge. It never costs anything to take part." pose="laptop" />
      {!live.length && <Empty>No challenges yet.</Empty>}
      <div className="grid gap-4 md:grid-cols-2">
        {live.map((c) => {
          const company = s.companies.find((co) => co.id === c.companyId)!;
          const course = courses.find((x) => x.id === c.courseId);
          const unlocked = challengeUnlocked(s.certificates, me.id, c.courseId);
          const sub = s.submissions.find((x) => x.challengeId === c.id && x.learnerId === me.id);
          return (
            <Card key={c.id} className={`relative flex flex-col gap-2 ${unlocked ? "group transition-shadow hover:shadow-md" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
                {company.name}
                <span className="relative z-10">
                  <VerifiedBadge company={company} />
                </span>
              </div>
              <h2 className="text-h4">
                {unlocked ? (
                  // The link's ::after covers the whole card so the card is clickable.
                  <Link href={`/challenges/${c.id}`} className="group-hover:text-burgundy after:absolute after:inset-0 after:rounded-2xl">
                    {c.title}
                  </Link>
                ) : (
                  c.title
                )}
              </h2>
              <p className="text-muted">Course: {courseTitle(course, lang)}</p>
              <div className="mt-auto pt-2">
                {sub ? (
                  <Badge tone={sub.status === "needs-work" ? "highlight" : sub.status === "interview" || sub.status === "offered" ? "success" : "brand"}>{statusLabel[sub.status]}</Badge>
                ) : unlocked ? (
                  <Badge tone="brand">Open to you</Badge>
                ) : (
                  <Badge>
                    <LockIcon /> Get certified in {courseTitle(course, lang)} to unlock
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
