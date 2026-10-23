"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Card, cardLinkClass, cardLinkStretch, PageHeader } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { copy, courseTitle, formatMmk } from "@/lib/i18n";
import { counted } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { progressOf, useData } from "@/lib/store";

export default function Courses() {
  const { s, me, lang } = useData();
  const t = copy[lang];
  const [q, setQ] = useState("");
  const roadmap = progressOf(s, me.id).roadmap;
  const shown = courses.filter((c) => `${courseTitle(c, lang)} ${c.title} ${c.skill}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <PageHeader title="Courses" intro="Start free. Every paid course lets you try the first 25% for free. Each course ends with a real company challenge." pose="read">
        <SearchBar label="Search courses" placeholder="Search courses" value={q} onChange={setQ} />
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => {
          const unlocks = s.challenges.filter((ch) => ch.courseId === c.id);
          return (
            <Card key={c.id} className={`${cardLinkClass} flex flex-col gap-2`}>
              <div className="flex flex-wrap gap-2">
                <Badge tone={c.priceMmk === 0 ? "success" : "highlight"}>{c.priceMmk === 0 ? t.free : t.paid}</Badge>
                <Badge>{c.level}</Badge>
                {roadmap.includes(c.id) && <Badge tone="brand">On your roadmap</Badge>}
              </div>
              <h2 className="text-h4">
                <Link href={`/courses/${c.id}`} className={`${cardLinkStretch} group-hover:text-burgundy`}>
                  {courseTitle(c, lang)}
                </Link>
              </h2>
              <p className="text-muted">{c.description}</p>
              <p className="mt-auto pt-2 text-body-sm text-muted">
                {counted(c.lessons.length, t.lesson, t.lessons)} · {counted(c.hours, t.hour, t.hours)}
                {c.priceMmk > 0 && ` · ${formatMmk(c.priceMmk)}`}
                {unlocks.length > 0 && ` · ${t.unlocks} ${unlocks.map((ch) => ch.title).join(", ")}`}
              </p>
              <p className="text-body-sm font-medium">{c.priceMmk === 0 ? t.fullyFree : t.firstFree}</p>
            </Card>
          );
        })}
      </div>
      {!shown.length && <p className="text-muted">No courses match “{q}”.</p>}
    </>
  );
}
