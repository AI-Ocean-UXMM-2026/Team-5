"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CompanyProfile } from "@/components/CompanyProfile";
import { RateButton, RatingsList } from "@/components/RatingForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Badge, Card, cardLinkClass, Empty, PageHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Detail, FieldIcon } from "@/components/ui/Detail";
import { Input } from "@/components/ui/Field";
import { InitialsAvatar, ProfileHero, StarsFact } from "@/components/ui/ProfileHero";
import { courseTitle } from "@/lib/i18n";
import { useCourses } from "@/lib/catalogue";
import { progressOf, setState, useData } from "@/lib/store";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { s, me, lang } = useData();
  const courses = useCourses();
  const user = s.users.find((u) => u.id === userId);
  const [editing, setEditing] = useState(false);
  const [headline, setHeadline] = useState(user?.headline ?? "");
  const [skills, setSkills] = useState(user?.skills.join(", ") ?? "");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!user) return <Empty>Profile not found.</Empty>;

  const own = user.id === me.id;
  const company = s.companies.find((c) => c.id === user.companyId);
  if (company) return <CompanyProfile company={company} own={own} />;

  const certs = s.certificates.filter((c) => c.learnerId === user.id);
  const ratings = s.ratings.filter((r) => r.toId === user.id);

  const dirty = headline !== user.headline || skills !== user.skills.join(", ");
  // Cancel drops unsaved edits, so reopening the form shows what is actually saved.
  const discard = () => {
    setHeadline(user.headline);
    setSkills(user.skills.join(", "));
    setEditing(false);
  };
  const closeEdit = () => (dirty ? setConfirmDiscard(true) : discard());

  // Companies can rate any candidate they view. The rating is tied to their latest interview with the learner
  // when there is one, otherwise to the company–learner pair; either way it's one rating per company per learner.
  const viewerCompanyId = me.role === "company" ? me.companyId : undefined;
  const workedWith = viewerCompanyId
    ? (s.interviews.filter((i) => i.learnerId === user.id && i.companyId === viewerCompanyId).at(-1)?.id ?? `company-${viewerCompanyId}-${user.id}`)
    : undefined;
  const work = s.submissions
    .filter((x) => x.learnerId === user.id)
    .map((x) => {
      const challenge = s.challenges.find((c) => c.id === x.challengeId);
      return { sub: x, challenge, company: s.companies.find((c) => c.id === challenge?.companyId) };
    });
  const workLabel = { submitted: "Waiting for review", "needs-work": "Asked to improve", interview: "Invited to interview", offered: "Offer sent" } as const;

  if (editing)
    return (
      <>
        <Breadcrumb items={[{ label: "Profile", onClick: closeEdit }, { label: "Edit profile" }]} />
        <PageHeader title="Edit profile" intro={user.name} />
        <Card className="max-w-xl">
          <h2 className="text-h4">Headline and skills</h2>
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
              setHeadline(headline.trim());
              setSkills(list.join(", "));
              setEditing(false);
              setSaved(true);
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
        <ConfirmDialog
          open={confirmDiscard}
          onClose={() => setConfirmDiscard(false)}
          onConfirm={discard}
          title="Discard your changes?"
          confirmLabel="Discard changes"
          cancelLabel="Keep editing"
          danger
        >
          <p>Your new headline and skills haven&apos;t been saved.</p>
        </ConfirmDialog>
      </>
    );

  return (
    <>
      {/* Someone else's profile: companies usually arrive from Candidates. */}
      {!own && <Breadcrumb items={me.role === "company" ? [{ label: "Candidates", href: "/company/candidates" }, { label: user.name }] : [{ label: user.name }]} />}
      <ProfileHero
        avatar={<InitialsAvatar name={user.name} />}
        name={user.name}
        subtitle={user.headline || (own ? "Add a headline so companies know what you're aiming for." : undefined)}
        facts={[
          <>
            <span className="text-burgundy">
              <FieldIcon kind="role" className="size-3.5" />
            </span>
            Learner
          </>,
          <>
            <span className="text-burgundy">
              <FieldIcon kind="certificate" className="size-3.5" />
            </span>
            {certs.length} {certs.length === 1 ? "certificate" : "certificates"}
          </>,
          ratings.length ? <StarsFact ratings={ratings} /> : null,
        ]}
        actions={
          own ? (
            <>
              {saved && (
                <p role="status" className="text-body-sm text-success">
                  ✓ Profile saved
                </p>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  setSaved(false);
                  setEditing(true);
                }}
              >
                Edit profile
              </Button>
            </>
          ) : workedWith ? (
            <RateButton interviewId={workedWith} toId={user.id} toName={user.name} />
          ) : undefined
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-4 text-h4">Certificates</h2>
            {certs.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {certs.map((c) => (
                  <li key={c.id}>
                    <Link href={`/certificates/${c.id}`} className={`${cardLinkClass} flex h-full items-start gap-3 rounded-xl border border-line p-4`}>
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-tint text-burgundy">
                        <FieldIcon kind="certificate" className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{courseTitle(courses.find((x) => x.id === c.courseId), lang)}</span>
                        <span className="mt-0.5 block text-body-sm text-muted">
                          Passed with {c.score}% · {c.issuedAt}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">{own ? "Pass a course's final test and your certificate shows here." : "No certificates yet."}</p>
            )}
          </Card>
          <Card>
            <h2 className="mb-4 text-h4">Challenge work</h2>
            {work.length ? (
              <ul className="flex flex-col divide-y divide-line">
                {work.map(({ sub, challenge, company: by }) => (
                  <li key={sub.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      {own ? (
                        <Link href={`/challenges/${sub.challengeId}`} className="font-medium hover:text-burgundy">
                          {challenge?.title}
                        </Link>
                      ) : (
                        <p className="font-medium">{challenge?.title}</p>
                      )}
                      <p className="text-body-sm text-muted">
                        {by?.name} · sent {sub.submittedAt}
                      </p>
                    </div>
                    <Badge tone={sub.status === "offered" || sub.status === "interview" ? "success" : sub.status === "needs-work" ? "highlight" : "brand"}>{workLabel[sub.status]}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">{own ? "Get certified in a course to unlock its company challenge." : "No challenge answers yet."}</p>
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-3 text-h4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.length ? (
                user.skills.map((k) => {
                  const level = progressOf(s, user.id).skillLevels?.[k];
                  const word = level === "comfortable" ? (lang === "my" ? "ရင်းနှီးသည်" : "Comfortable") : lang === "my" ? "အနည်းငယ်" : "A little";
                  return (
                    <Badge key={k} tone="primary">
                      {level ? `${k} · ${word}` : k}
                    </Badge>
                  );
                })
              ) : (
                <p className="text-muted">No skills listed yet.</p>
              )}
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-h4">Contact</h2>
            <dl className="flex flex-col gap-4">
              <Detail kind="email" label="Email">
                {user.email}
              </Detail>
            </dl>
          </Card>
          <Card>
            <h2 className="mb-3 text-h4">Ratings from companies</h2>
            <RatingsList ratings={ratings} empty="No ratings yet." />
          </Card>
        </div>
      </div>
    </>
  );
}
