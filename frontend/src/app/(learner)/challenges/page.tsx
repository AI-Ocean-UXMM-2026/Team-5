"use client";

import Link from "next/link";
import { useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, cardLinkClass, cardLinkStretch, Empty, PageHeader } from "@/components/ui/Card";
import { CompanyMark } from "@/components/ui/CompanyMark";
import { LockIcon } from "@/components/ui/LockIcon";
import { SearchBar } from "@/components/ui/SearchBar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { courseTitle } from "@/lib/i18n";
import { challengeUnlocked } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { useData } from "@/lib/store";
import type { Company } from "@/lib/types";

const statusLabel = { submitted: "Waiting for review", "needs-work": "Feedback to act on", interview: "Interview invite", offered: "Offer received" } as const;

type Filter = "all" | "open" | "submitted" | "locked";
const filters: [Filter, string][] = [
  ["all", "All"],
  ["open", "Open to you"],
  ["submitted", "Submitted"],
  ["locked", "Locked"],
];
// Open challenges first, then ones in review, then the ones still to unlock.
const order: Record<Exclude<Filter, "all">, number> = { open: 0, submitted: 1, locked: 2 };

export default function Challenges() {
  const { s, me, lang } = useData();
  const courses = useCourses();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = s.challenges
    .map((c) => {
      const company = s.companies.find((co) => co.id === c.companyId);
      const course = courses.find((x) => x.id === c.courseId);
      const sub = s.submissions.find((x) => x.challengeId === c.id && x.learnerId === me.id);
      const unlocked = challengeUnlocked(s.certificates, me.id, c.courseId);
      const state: Exclude<Filter, "all"> = sub ? "submitted" : unlocked ? "open" : "locked";
      return { c, company, course, sub, state };
    })
    .filter((r): r is typeof r & { company: Company } => r.company?.status === "verified")
    .sort((a, b) => order[a.state] - order[b.state] || b.c.createdAt.localeCompare(a.c.createdAt));
  const counts = { all: rows.length, open: 0, submitted: 0, locked: 0 };
  for (const r of rows) counts[r.state]++;
  const query = q.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (filter === "all" || r.state === filter) &&
      `${r.c.title} ${r.c.task} ${r.company.name} ${courseTitle(r.course, lang)}`.toLowerCase().includes(query),
  );

  return (
    <>
      <PageHeader title="Company challenges" intro="Real tasks from verified companies. Finish the course to unlock its challenge. It never costs anything to take part.">
        <SearchBar label="Search challenges" placeholder="Task, company or course" value={q} onChange={setQ} />
      </PageHeader>
      <div role="tablist" aria-label="Challenge status" className="mb-4 flex flex-wrap gap-1">
        {filters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ${filter === id ? "bg-burgundy-tint text-burgundy" : "text-muted hover:bg-surface"}`}
          >
            {label}
            <span className={`rounded-md px-1.5 text-caption ${filter === id ? "bg-white/70" : "bg-surface"}`}>{counts[id]}</span>
          </button>
        ))}
      </div>
      {!shown.length && (
        <Empty
          pose="search"
          action={
            q || filter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setFilter("all");
                }}
                className="font-medium text-burgundy hover:underline"
              >
                Show all challenges
              </button>
            ) : undefined
          }
        >
          {q
            ? `No challenges match “${q}”.`
            : !rows.length
              ? "No challenges yet."
              : filter === "open"
                ? "No challenges are open to you yet. Get certified in a course to unlock its challenges."
                : filter === "submitted"
                  ? "You haven't sent work to a challenge yet."
                  : "Nothing is locked. Every challenge is open to you."}
        </Empty>
      )}
      <ul className="flex flex-col gap-3">
        {shown.map(({ c, company, course, sub, state }) => {
          // Locked challenges lead to the course that unlocks them, so the card is never a dead end.
          const href = state === "locked" ? `/courses/${c.courseId}` : `/challenges/${c.id}`;
          const action = state === "open" ? "Start challenge" : state === "locked" ? "Go to course" : sub?.status === "needs-work" ? "Improve answer" : "View submission";
          // Only an unlocked challenge makes the whole card a link; a locked one keeps just its "Go to course" button.
          const locked = state === "locked";
          const companyUser = s.users.find((u) => u.companyId === company.id);
          return (
            <li key={c.id}>
              <Card className={`${locked ? "" : cardLinkClass} flex flex-col gap-4 !p-5 sm:flex-row sm:items-center`}>
                <CompanyMark company={company} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
                    {companyUser ? (
                      <Link href={`/profile/${companyUser.id}`} className="relative z-10 rounded font-medium text-ink hover:text-burgundy hover:underline">
                        {company.name}
                      </Link>
                    ) : (
                      company.name
                    )}
                    <span className="relative z-10">
                      <VerifiedBadge company={company} />
                    </span>
                  </div>
                  <h2 className="mt-1 text-h4">
                    {locked ? (
                      c.title
                    ) : (
                      <Link href={href} className={`${cardLinkStretch} group-hover:text-burgundy`}>
                        {c.title}
                      </Link>
                    )}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-body-sm text-muted">{c.task}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge>{courseTitle(course, lang).split(/[:—]/)[0].trim()}</Badge>
                    {sub ? (
                      <Badge tone={sub.status === "needs-work" ? "highlight" : sub.status === "interview" || sub.status === "offered" ? "success" : "brand"}>{statusLabel[sub.status]}</Badge>
                    ) : state === "open" ? (
                      <Badge tone="success">Open to you</Badge>
                    ) : (
                      <Badge>
                        <LockIcon />
                        <span className="ml-1">Get certified in the course to unlock</span>
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="relative z-10 shrink-0">
                  <LinkButton href={href} variant={state === "open" || sub?.status === "needs-work" ? "primary" : "secondary"}>
                    {action}
                  </LinkButton>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}
