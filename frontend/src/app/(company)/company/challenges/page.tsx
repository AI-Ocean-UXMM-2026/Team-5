"use client";

import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, cardLinkClass, cardLinkStretch, Empty, PageHeader } from "@/components/ui/Card";
import { courseTitle } from "@/lib/i18n";
import { counted } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { useData } from "@/lib/store";

export default function CompanyChallenges() {
  const { s, company, lang } = useData();
  const courses = useCourses();
  const mine = s.challenges.filter((c) => c.companyId === company?.id);

  return (
    <>
      <PageHeader title="Your challenges" intro="Learners who finish the course solve these. AI pre-screens their work; you decide who to interview." pose="tablet">
        <LinkButton href="/company/challenges/new">Post a challenge</LinkButton>
      </PageHeader>
      {!mine.length && <Empty>No challenges yet. Post one to start meeting tested learners.</Empty>}
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((c) => {
          const subs = s.submissions.filter((x) => x.challengeId === c.id);
          const waiting = subs.filter((x) => x.status === "submitted").length;
          return (
            <Card key={c.id} className={`${cardLinkClass} flex flex-col gap-4`}>
              <div>
                <h2 className="text-h4">
                  <Link href={`/company/challenges/${c.id}`} className={`${cardLinkStretch} group-hover:text-burgundy`}>
                    {c.title}
                  </Link>
                </h2>
                <p className="text-muted">
                  {courseTitle(courses.find((x) => x.id === c.courseId), lang)} · posted {c.createdAt}
                </p>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <Badge>{counted(subs.length, "submission")}</Badge>
                {waiting > 0 && <Badge tone="highlight">{waiting} to review</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
