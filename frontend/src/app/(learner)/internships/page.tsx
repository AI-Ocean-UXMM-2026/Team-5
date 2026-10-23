"use client";

import Link from "next/link";
import { useState } from "react";
import { RatingForm } from "@/components/RatingForm";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { CompanyMark } from "@/components/ui/CompanyMark";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FieldIcon, type FieldKind } from "@/components/ui/Detail";
import { SearchBar } from "@/components/ui/SearchBar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { formatPlace, formatWhen } from "@/lib/i18n";
import { replyToOffer } from "@/lib/rules";
import { setState, useData } from "@/lib/store";
import type { Interview } from "@/lib/types";

const label: Record<Interview["status"], string> = {
  scheduled: "Interview scheduled",
  offered: "Offer received",
  accepted: "Internship started",
  declined: "You declined",
  "not-selected": "Not selected this time",
};

type Filter = "all" | "offers" | "interviews" | "active" | "closed";
const groupOf = (status: Interview["status"]): Exclude<Filter, "all"> =>
  status === "offered" ? "offers" : status === "scheduled" ? "interviews" : status === "accepted" ? "active" : "closed";
const filters: [Filter, string][] = [
  ["all", "All"],
  ["offers", "Offers"],
  ["interviews", "Interviews"],
  ["active", "Active"],
  ["closed", "Closed"],
];
// Offers wait for an answer, so they come first; closed ones go last.
const order: Record<Exclude<Filter, "all">, number> = { offers: 0, interviews: 1, active: 2, closed: 3 };
const emptyFor: Record<Exclude<Filter, "all">, string> = {
  offers: "No offers waiting for your answer.",
  interviews: "No interviews scheduled.",
  active: "No internship has started yet.",
  closed: "Nothing closed yet.",
};

function Term({ kind, children }: { kind: FieldKind; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-2 py-1 text-body-sm">
      <span className="text-burgundy">
        <FieldIcon kind={kind} className="size-3.5" />
      </span>
      {children}
    </span>
  );
}

export default function Internships() {
  const { s, me } = useData();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [rating, setRating] = useState<string | null>(null);
  const [ask, setAsk] = useState<{ id: string; status: "accepted" | "declined" } | null>(null);
  const mine = s.interviews.filter((i) => i.learnerId === me.id);
  const asked = mine.find((i) => i.id === ask?.id);
  const askedCompany = s.companies.find((c) => c.id === asked?.companyId);

  const rows = mine
    .map((i) => ({ i, company: s.companies.find((c) => c.id === i.companyId)!, challenge: s.challenges.find((c) => c.id === i.challengeId), group: groupOf(i.status) }))
    .sort((a, b) => order[a.group] - order[b.group] || b.i.when.localeCompare(a.i.when));
  const counts = { all: rows.length, offers: 0, interviews: 0, active: 0, closed: 0 };
  for (const r of rows) counts[r.group]++;
  const query = q.trim().toLowerCase();
  const shown = rows.filter(
    (r) => (filter === "all" || r.group === filter) && `${r.company.name} ${r.company.terms.role} ${r.challenge?.title ?? ""}`.toLowerCase().includes(query),
  );

  return (
    <>
      <PageHeader title="Internships" intro="Interviews and offers from companies whose challenge you passed. Applying and interviewing are always free.">
        {rows.length > 0 && <SearchBar label="Search internships" placeholder="Company, role or challenge" value={q} onChange={setQ} />}
      </PageHeader>
      {rows.length > 0 && (
        <div role="tablist" aria-label="Internship status" className="mb-4 flex flex-wrap gap-1">
          {filters.map(([id, text]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ${filter === id ? "bg-burgundy-tint text-burgundy" : "text-muted hover:bg-surface"}`}
            >
              {text}
              <span className={`rounded-md px-1.5 text-caption ${filter === id ? "bg-white/70" : "bg-surface"}`}>{counts[id]}</span>
            </button>
          ))}
        </div>
      )}
      {!rows.length ? (
        <Empty pose="sleep" action={<LinkButton href="/challenges">Browse challenges</LinkButton>}>
          No interviews yet. Pass a company challenge to get invited to an interview.
        </Empty>
      ) : !shown.length ? (
        <Empty
          pose="search"
          action={
            <button
              type="button"
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
              className="font-medium text-burgundy hover:underline"
            >
              Show all
            </button>
          }
        >
          {q ? `Nothing matches “${q}”.` : filter === "all" ? "Nothing here yet." : emptyFor[filter]}
        </Empty>
      ) : null}
      <ul className="flex flex-col gap-3">
        {shown.map(({ i, company, challenge, group }) => {
          const companyUser = s.users.find((u) => u.companyId === company.id);
          const profileHref = companyUser ? `/profile/${companyUser.id}` : undefined;
          const ratingOpen = rating === i.id;
          const rated = s.ratings.some((r) => r.toId === company.id && r.fromId === me.id);
          return (
            <li key={i.id}>
              <Card className="flex flex-col gap-4 !p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {profileHref ? (
                    <Link href={profileHref} aria-label={`${company.name} company profile`} className="w-fit rounded-xl transition-opacity hover:opacity-80">
                      <CompanyMark company={company} />
                    </Link>
                  ) : (
                    <CompanyMark company={company} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
                      {profileHref ? (
                        <Link href={profileHref} className="font-medium text-ink underline-offset-2 hover:text-burgundy hover:underline">
                          {company.name}
                        </Link>
                      ) : (
                        company.name
                      )}
                      <VerifiedBadge company={company} />
                    </div>
                    <h2 className="mt-1 text-h4">{company.terms.role || "Internship"}</h2>
                    <p className="mt-1 text-body-sm text-muted">
                      From the challenge{" "}
                      <Link href={`/challenges/${i.challengeId}`} className="font-medium text-ink hover:text-burgundy">
                        {challenge?.title}
                      </Link>
                      {i.when && ` · Interview ${formatWhen(i.when)}`}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge tone={group === "active" ? "success" : group === "offers" ? "highlight" : group === "interviews" ? "brand" : "neutral"}>{label[i.status]}</Badge>
                      <Term kind="duration">{company.terms.duration}</Term>
                      <Term kind="location">{company.terms.location}</Term>
                      <Term kind="stipend">{company.terms.stipend}</Term>
                    </div>
                    {i.status === "scheduled" && i.format && (
                      <p className="mt-3 text-body-sm">
                        <span className="font-medium">{formatPlace({ format: i.format })}:</span>{" "}
                        {i.place && /^https?:\/\//.test(i.place) ? (
                          <a href={i.place} target="_blank" rel="noreferrer" className="break-all text-burgundy hover:underline">
                            Join the call
                          </a>
                        ) : (
                          i.place
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {profileHref && (
                      <LinkButton href={profileHref} variant="tertiary">
                        Company profile
                      </LinkButton>
                    )}
                    {i.status === "offered" && (
                      <>
                        <Button onClick={() => setAsk({ id: i.id, status: "accepted" })}>Accept offer</Button>
                        <Button variant="secondary" onClick={() => setAsk({ id: i.id, status: "declined" })}>
                          Decline
                        </Button>
                      </>
                    )}
                    {i.status === "accepted" &&
                      (rated ? (
                        <Badge tone="success">✓ Rated</Badge>
                      ) : (
                        <Button variant="secondary" aria-expanded={ratingOpen} onClick={() => setRating(ratingOpen ? null : i.id)}>
                          {ratingOpen ? "Close" : "Rate company"}
                        </Button>
                      ))}
                    {(i.status === "declined" || i.status === "not-selected") && (
                      <LinkButton href="/challenges" variant="secondary">
                        Find more challenges
                      </LinkButton>
                    )}
                  </div>
                </div>
                {i.status === "accepted" && (ratingOpen || rated) && (
                  <div className="rounded-xl bg-surface p-4">
                    <RatingForm interviewId={i.id} toId={company.id} toName={company.name} />
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
      <ConfirmDialog
        open={!!ask}
        onClose={() => setAsk(null)}
        onConfirm={() => ask && setState((st) => replyToOffer(st, ask.id, ask.status === "accepted"))}
        title={ask?.status === "accepted" ? `Accept the offer from ${askedCompany?.name}?` : `Decline the offer from ${askedCompany?.name}?`}
        confirmLabel={ask?.status === "accepted" ? "Accept offer" : "Decline offer"}
        danger={ask?.status === "declined"}
      >
        {ask?.status === "accepted" ? (
          <>
            <p>
              {askedCompany?.terms.role || "Internship"} · {askedCompany?.terms.duration} · {askedCompany?.terms.location} · {askedCompany?.terms.stipend}
            </p>
            <p>Your internship starts, and {askedCompany?.name} is told right away. You can rate the company after it starts. You never pay anything to accept.</p>
          </>
        ) : (
          <p>{askedCompany?.name} will move on to other candidates. You can&apos;t take this offer back after declining.</p>
        )}
      </ConfirmDialog>
    </>
  );
}
