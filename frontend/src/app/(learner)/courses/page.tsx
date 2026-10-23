"use client";

import Link from "next/link";
import { useState } from "react";
import { cardLinkClass, cardLinkStretch, PageHeader } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { copy, courseTitle, formatMmk } from "@/lib/i18n";
import { counted } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { progressOf, useData } from "@/lib/store";

const iconPaths = {
  // compass
  starter: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z",
  // code brackets
  frontend: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  // bug
  qa: "M9 7a3 3 0 0 1 6 0M8 9h8v5a4 4 0 0 1-8 0V9Zm-3 2h3m8 0h3M5 16h3m8 0h3M12 11v7",
  // open book
  other: "M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5V5.5ZM12 6v13.5",
};

// Each course gets its own cover colour; new courses fall back to yellow.
const covers: Record<string, string> = {
  starter: "bg-success-tint text-success",
  frontend: "bg-burgundy-tint text-burgundy",
  qa: "bg-ai text-ai-ink",
};

export default function Courses() {
  const { s, me, lang } = useData();
  const t = copy[lang];
  const [q, setQ] = useState("");
  const p = progressOf(s, me.id);
  const shown = courses.filter((c) => `${courseTitle(c, lang)} ${c.title} ${c.skill}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <PageHeader title="Courses" intro="Start free. Every paid course lets you try the first 25% for free. Each course ends with a real company challenge." pose="read">
        <SearchBar label="Search courses" placeholder="Search courses" value={q} onChange={setQ} />
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => {
          const challenges = s.challenges.filter((ch) => ch.courseId === c.id).length;
          const done = c.lessons.filter((l) => p.doneLessons.includes(l.id)).length;
          const certified = s.certificates.some((x) => x.learnerId === me.id && x.courseId === c.id);
          const free = c.priceMmk === 0;
          const fullAccess = free || certified || p.paidCourseIds?.includes(c.id);
          const status = certified ? "Certified" : done ? `${done} of ${c.lessons.length} lessons done` : "Not started";
          const action = certified ? "Review" : done ? "Continue" : fullAccess ? "Start" : "Preview";
          const icon = iconPaths[c.id as keyof typeof iconPaths] ?? iconPaths.other;
          return (
            <section key={c.id} className={`${cardLinkClass} flex flex-col overflow-hidden rounded-2xl border border-line bg-white`}>
              <div className={`flex h-24 items-start justify-between gap-2 p-4 ${covers[c.id] ?? "bg-yellow-tint text-ink"}`}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden className="mt-auto">
                  <path d={icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {p.roadmap.includes(c.id) && <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-caption font-medium text-burgundy">On your roadmap</span>}
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-caption font-semibold text-ink">{free ? t.free : formatMmk(c.priceMmk)}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h2 className="text-h4">
                  <Link href={`/courses/${c.id}`} className={`${cardLinkStretch} group-hover:text-burgundy`}>
                    {courseTitle(c, lang)}
                  </Link>
                </h2>
                <p className="line-clamp-2 text-muted">{c.description}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-muted">
                  <Info d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4Zm0 12a4 4 0 0 1 4-4h10">{counted(c.lessons.length, t.lesson, t.lessons)}</Info>
                  <Info d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2">{counted(c.hours, t.hour, t.hours)}</Info>
                  <Info d="M5 20v-4M12 20v-9M19 20V6">{c.level}</Info>
                  {challenges > 0 && <Info d="M4 8h16v11H4V8Zm5 0V5h6v3M4 13h16">{counted(challenges, "challenge")}</Info>}
                </ul>
                <div className="mt-auto flex flex-col gap-1.5 pt-1">
                  <div
                    role="progressbar"
                    aria-label={`${courseTitle(c, lang)} progress`}
                    aria-valuemin={0}
                    aria-valuemax={c.lessons.length}
                    aria-valuenow={certified ? c.lessons.length : done}
                    className="h-1.5 overflow-hidden rounded-full bg-line"
                  >
                    <div className={`h-full rounded-full ${certified ? "bg-success" : "bg-burgundy"}`} style={{ width: `${certified ? 100 : (done / c.lessons.length) * 100}%` }} />
                  </div>
                  <p className={`text-caption ${certified ? "font-medium text-success" : "text-muted"}`}>{status}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
                <span className="text-body-sm font-medium">{free ? t.fullyFree : fullAccess ? "Full course unlocked" : t.firstFree}</span>
                {/* The whole card is the link; this only looks like a button. */}
                <span
                  aria-hidden
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${action === "Preview" || action === "Review" ? "border border-line text-ink" : "bg-burgundy text-white"}`}
                >
                  {action}
                </span>
              </div>
            </section>
          );
        })}
      </div>
      {!shown.length && <p className="text-muted">No courses match “{q}”.</p>}
    </>
  );
}

function Info({ d, children }: { d: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-subtle">
        <path d={d} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}
