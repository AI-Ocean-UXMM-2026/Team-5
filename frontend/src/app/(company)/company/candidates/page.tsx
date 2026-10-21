"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { courses } from "@/lib/seed";
import { useData } from "@/lib/store";

export default function Candidates() {
  const { s } = useData();
  const [q, setQ] = useState("");
  const certified = s.users
    .filter((u) => u.role === "learner")
    .map((u) => ({ user: u, certs: s.certificates.filter((c) => c.learnerId === u.id) }))
    .filter(({ certs }) => certs.length)
    .filter(({ user, certs }) =>
      `${user.name} ${user.skills.join(" ")} ${certs.map((c) => courses.find((x) => x.id === c.courseId)?.title).join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()),
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
            <div className="flex flex-wrap gap-2 pt-1">
              {certs.map((c) => (
                <Badge key={c.id} tone="success">
                  ✓ {courses.find((x) => x.id === c.courseId)?.title} · {c.score}%
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
