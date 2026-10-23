"use client";

import Link from "next/link";
import { useState } from "react";
import { cardLinkClass, cardLinkStretch, PageHeader } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { copy, courseTitle, formatMmk } from "@/lib/i18n";
import { counted } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { progressOf, useData } from "@/lib/store";

const iconPaths = {
  // compass
  starter: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z",
  // code brackets
  frontend: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  // bug
  qa: "M9 7a3 3 0 0 1 6 0M8 9h8v5a4 4 0 0 1-8 0V9Zm-3 2h3m8 0h3M5 16h3m8 0h3M12 11v7",
  // monitor
  "computer-basics": "M4 5h16v11H4V5Zm5 15h6m-3-4v4",
  // speech bubble
  "english-it": "M5 5h14v10H10l-4 4v-4H5V5Zm4 4h6m-6 3h4",
  // branch
  git: "M7 4v10m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm10-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0c0 4-10 2-10 6",
  // atom
  react: "M12 12h.01M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8Zm-6.9 4 13.8 8m-13.8 0 13.8-8",
  // server rack
  "node-backend": "M4 5h16v5H4V5Zm0 9h16v5H4v-5Zm3-6.5h.01M7 16.5h.01",
  // database
  sql: "M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3Zm0 0v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3",
  // layout
  uiux: "M4 4h16v16H4V4Zm0 5h16M9 9v11",
  // pen nib
  figma: "M12 3 5 10l4 11h6l4-11-7-7Zm0 0v8m0 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3",
  // grid
  spreadsheets: "M4 4h16v16H4V4Zm0 5h16M4 14h16M10 4v16",
  // bar chart
  "python-data": "M4 20h16M7 16v-4m5 4V8m5 8v-7",
  // wrench
  "it-support": "M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3L15 12l-3-3 2.5-2.5Z",
  // shield
  security: "M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Zm-3 9 2 2 4-4",
  // open book
  other: "M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5V5.5ZM12 6v13.5",
};

// Each course gets its own cover colour by area; courses not listed here fall back to yellow.
const covers: Record<string, string> = {
  starter: "bg-success-tint text-success",
  "computer-basics": "bg-success-tint text-success",
  "english-it": "bg-success-tint text-success",
  git: "bg-success-tint text-success",
  frontend: "bg-burgundy-tint text-burgundy",
  react: "bg-burgundy-tint text-burgundy",
  "node-backend": "bg-burgundy-tint text-burgundy",
  sql: "bg-burgundy-tint text-burgundy",
  uiux: "bg-yellow-tint text-ink",
  figma: "bg-yellow-tint text-ink",
  spreadsheets: "bg-ai text-ai-ink",
  "python-data": "bg-ai text-ai-ink",
  qa: "bg-ai text-ai-ink",
  "it-support": "bg-surface text-ink",
  security: "bg-surface text-ink",
};

export default function Courses() {
  const { s, me, lang } = useData();
  const courses = useCourses();
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
