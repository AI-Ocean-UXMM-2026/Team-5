"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Card, PageHeader } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { courses } from "@/lib/seed";
import { progressOf, useData } from "@/lib/store";

export default function Courses() {
  const { s, me } = useData();
  const [q, setQ] = useState("");
  const roadmap = progressOf(s, me.id).roadmap;
  const shown = courses.filter((c) => `${c.title} ${c.skill}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <PageHeader title="Courses" intro="IT courses built with partner companies." pose="read">
        <SearchBar label="Search courses" placeholder="Search courses" value={q} onChange={setQ} />
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <Card key={c.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge>{c.level}</Badge>
              {roadmap.includes(c.id) && <Badge tone="brand">On your roadmap</Badge>}
            </div>
            <h2 className="text-h4">
              <Link href={`/courses/${c.id}`} className="hover:text-burgundy">
                {c.title}
              </Link>
            </h2>
            <p className="text-muted">{c.description}</p>
            <p className="mt-auto pt-2 text-body-sm text-muted">
              {c.lessons.length} lessons · {c.hours} hours
            </p>
          </Card>
        ))}
      </div>
      {!shown.length && <p className="text-muted">No courses match “{q}”.</p>}
    </>
  );
}
