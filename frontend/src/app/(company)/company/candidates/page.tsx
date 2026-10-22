"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { courseTitle } from "@/lib/i18n";
import { courses } from "@/lib/seed";
import { useData } from "@/lib/store";

const challengeStatus = { submitted: "Waiting for review", "needs-work": "Needs another try", interview: "Interview invited" } as const;

export default function Candidates() {
  const { s, company, lang } = useData();
  const [q, setQ] = useState("");
  const certified = s.users
    .filter((u) => u.role === "learner")
    .map((u) => ({ user: u, certs: s.certificates.filter((c) => c.learnerId === u.id) }))
    .filter(({ certs }) => certs.length)
    .filter(({ user, certs }) =>
      `${user.name} ${user.skills.join(" ")} ${certs.map((c) => courseTitle(courses.find((x) => x.id === c.courseId), lang)).join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()),
    );

  return (
    <>
      <PageHeader title="Candidates" intro="Learners who passed a final test. Invite them through your challenges." pose="star">
        <SearchBar label="Search candidates" placeholder="Name, skill or course" value={q} onChange={setQ} />
      </PageHeader>
      {!certified.length && <Empty>No certified learners match.</Empty>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {certified.map(({ user, certs }) => (
          <Card key={user.id} className="flex flex-col gap-2">
            <h2 className="text-h4">
              <Link href={`/profile/${user.id}`} className="hover:text-burgundy">
                {user.name}
              </Link>
            </h2>
            <p className="text-muted">{user.headline}</p>
            <div className="flex flex-col gap-2 pt-1">
              {certs.map((c) => {
                const course = courses.find((x) => x.id === c.courseId);
                const challenge = s.challenges.find((ch) => ch.courseId === c.courseId && ch.companyId === company?.id);
                const sub = challenge && s.submissions.find((x) => x.challengeId === challenge.id && x.learnerId === user.id);
                return (
                  <div key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Badge tone="success">
                      ✓ {courseTitle(course, lang)} · {c.score}%
                    </Badge>
                    <span className="text-body-sm text-muted">{challenge ? `${challenge.title} · ${sub ? challengeStatus[sub.status] : "Not submitted"}` : "No challenge yet"}</span>
                    <Link href={`/profile/${user.id}`} className="text-body-sm font-medium text-burgundy">
                      View profile
                    </Link>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
