"use client";

import { Card, PageHeader } from "@/components/ui/Card";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { nameOf, useData } from "@/lib/store";

export default function Account() {
  const { s, company } = useData();
  const c = company!;
  const ratings = s.ratings.filter((r) => r.toId === c.id);
  const rows: [string, string][] = [
    ["Website", c.website],
    ["LinkedIn or Facebook", c.social],
    ["Email", c.email],
    ["Phone", c.phone],
    ["Office", c.address],
  ];

  return (
    <>
      <PageHeader title={c.name} intro={c.about} pose="jump">
        <VerifiedBadge company={c} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-h4">Company page</h2>
          <dl className="flex flex-col gap-3">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-body-sm text-muted">{k}</dt>
                <dd className="break-words">
                  {/^https?:\/\//.test(v) ? (
                    <a href={v} target="_blank" rel="noreferrer" className="text-burgundy underline-offset-2 hover:underline">
                      {v}
                    </a>
                  ) : (
                    v
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-4 text-h4">Approved internship terms</h2>
            <dl className="grid grid-cols-2 gap-3">
              {Object.entries(c.terms).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-body-sm text-muted capitalize">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <h2 className="mb-4 text-h4">Ratings from interns</h2>
            {!ratings.length && <p className="text-muted">No ratings yet.</p>}
            <ul className="flex flex-col gap-3">
              {ratings.map((r) => (
                <li key={r.id}>
                  <span aria-hidden className="text-yellow">
                    {"★".repeat(r.stars)}
                  </span>
                  <span className="sr-only">{r.stars} of 5 stars</span>{" "}
                  <span className="text-muted">by {nameOf(s, r.fromId)}</span>
                  {r.comment && <p>{r.comment}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
