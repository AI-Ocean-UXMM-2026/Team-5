"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { courseTitle } from "@/lib/i18n";
import { courses } from "@/lib/seed";
import { nameOf, setState, useData } from "@/lib/store";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { s, me, lang } = useData();
  const user = s.users.find((u) => u.id === userId);
  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [skills, setSkills] = useState(user?.skills.join(", ") ?? "");
  if (!user) return <Empty>Profile not found.</Empty>;

  const own = user.id === me.id;
  const company = s.companies.find((c) => c.id === user.companyId);
  const certs = s.certificates.filter((c) => c.learnerId === user.id);
  const ratings = s.ratings.filter((r) => r.toId === user.id);

  const closeEdit = () => setEditing(false);

  return (
    <>
      {editing ? (
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-body-sm">
              <li>
                <button type="button" onClick={closeEdit} className="text-muted hover:text-burgundy">
                  Profile
                </button>
              </li>
              <li aria-hidden className="text-subtle">
                /
              </li>
              <li aria-current="page" className="font-medium">
                Edit profile
              </li>
            </ol>
          </nav>
          <h1 className="text-h2">Edit profile</h1>
          <p className="mt-2 font-heading text-h4 font-medium text-muted">{user.name}</p>
        </div>
      ) : (
        <PageHeader title={user.name} intro={user.headline}>
          {own && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit profile
            </Button>
          )}
        </PageHeader>
      )}
      {editing && (
        <Card className="mb-6 max-w-xl">
          <h2 className="text-h4">Skills</h2>
          <p className="mt-1 mb-4 text-muted">A short headline and the skills you want companies to see.</p>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const list = skills
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);
              setState((st) => ({ ...st, users: st.users.map((u) => (u.id === user.id ? { ...u, headline: headline.trim(), skills: list } : u)) }));
              setEditing(false);
            }}
          >
            <Input label="Headline" placeholder="Frontend learner from Yangon" value={headline} onChange={(e) => setHeadline(e.target.value)} />
            <Input label="Skills" placeholder="HTML, CSS, JavaScript" hint="Separate with commas." value={skills} onChange={(e) => setSkills(e.target.value)} />
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button variant="secondary" onClick={closeEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {user.role === "learner" ? (
          <Card>
            <h2 className="mb-3 text-h4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.length ? user.skills.map((k) => <Badge key={k}>{k}</Badge>) : <p className="text-muted">No skills listed yet.</p>}
            </div>
            <h2 className="mt-6 mb-3 text-h4">Certificates</h2>
            {!certs.length && <p className="text-muted">No certificates yet.</p>}
            <ul className="flex flex-col gap-2">
              {certs.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <span>✓ {courseTitle(courses.find((x) => x.id === c.courseId), lang)}</span>
                  <span className="text-body-sm text-muted">
                    {c.score}% · {c.issuedAt}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card>
            <h2 className="mb-2 text-h4">Works at {company?.name}</h2>
            {company?.status === "verified" && (
              <Link href="/company/account" className="font-medium text-burgundy">
                View company page
              </Link>
            )}
          </Card>
        )}
        {user.role === "learner" && (
          <Card>
            <h2 className="mb-3 text-h4">Ratings from companies</h2>
            {!ratings.length && <p className="text-muted">No ratings yet.</p>}
            <ul className="flex flex-col gap-3">
              {ratings.map((r) => (
                <li key={r.id}>
                  <span aria-hidden className="text-yellow">
                    {"★".repeat(r.stars)}
                  </span>
                  <span className="sr-only">{r.stars} of 5 stars</span> <span className="text-muted">by {nameOf(s, r.fromId)}</span>
                  {r.comment && <p>{r.comment}</p>}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
