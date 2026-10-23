"use client";

import Image from "next/image";
import { useState } from "react";
import { RateButton, RatingsList } from "@/components/RatingForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import Link from "next/link";
import { YouTubeFrame } from "@/components/YouTubeFrame";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Detail, FieldIcon } from "@/components/ui/Detail";
import { ProfileHero, StarsFact } from "@/components/ui/ProfileHero";
import { Input, Textarea } from "@/components/ui/Field";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useCourses } from "@/lib/catalogue";
import { courseTitle } from "@/lib/i18n";
import { challengeWorkFor, emailMatchesWebsite } from "@/lib/rules";
import { setState, useData } from "@/lib/store";
import type { Company } from "@/lib/types";

function CompanyLogo({ company, own }: { company: Company; own: boolean }) {
  const mark = company.logo ? (
    // shortcut: logo is a data URL in localStorage; switch to file storage when the backend exists.
    <Image src={company.logo} alt="" width={88} height={88} unoptimized className="size-[88px] rounded-2xl border border-line object-cover" />
  ) : (
    <span className="grid size-[88px] place-items-center rounded-2xl border border-line bg-burgundy-tint text-burgundy">
      <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 21h16M6 21V9l6-4 6 4v12M10 21v-5h4v5M9 12h.01M12 12h.01M15 12h.01M9 15h.01M12 15h.01M15 15h.01" />
      </svg>
    </span>
  );
  if (!own) return mark;
  return (
    <label className="relative shrink-0 cursor-pointer">
      {mark}
      <span className="sr-only">Upload company logo</span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => setState((st) => ({ ...st, companies: st.companies.map((c) => (c.id === company.id ? { ...c, logo: String(reader.result) } : c)) }));
          reader.readAsDataURL(file);
        }}
      />
      <span className="absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-lg bg-burgundy text-white" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      </span>
    </label>
  );
}

function linkOrText(value: string) {
  return /^https?:\/\//.test(value) ? (
    <a href={value} target="_blank" rel="noreferrer" className="text-burgundy underline-offset-2 hover:underline">
      {value}
    </a>
  ) : (
    value || "—"
  );
}

export function CompanyProfile({ company, own }: { company: Company; own: boolean }) {
  const { s, me, lang } = useData();
  const courses = useCourses();
  const ratings = s.ratings.filter((r) => r.toId === company.id);
  const challenges = s.challenges.filter((c) => c.companyId === company.id);
  // Learners rate a company once they have sent work to one of its challenges.
  const work = me.role === "learner" ? challengeWorkFor(s, me.id, company.id) : undefined;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(company);
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<Company>) => setForm((f) => ({ ...f, ...patch }));
  const setTerms = (patch: Partial<Company["terms"]>) => setForm((f) => ({ ...f, terms: { ...f.terms, ...patch } }));
  const domainError = tried && !emailMatchesWebsite(form.email, form.website) ? "The email must be on your website's domain, not Gmail or similar." : undefined;

  const close = () => {
    setEditing(false);
    setTried(false);
    setForm(company);
  };

  return (
    <>
      {/* Learners usually arrive from an internship or a challenge. */}
      {!own && <Breadcrumb items={me.role === "learner" ? [{ label: "Internships", href: "/internships" }, { label: company.name }] : [{ label: company.name }]} />}
      {editing ? (
        <>
          <Breadcrumb items={[{ label: "Company page", onClick: close }, { label: "Edit profile" }]} />
          <PageHeader title="Edit profile" intro={company.name} />
        </>
      ) : (
        <ProfileHero
          avatar={<CompanyLogo company={company} own={own} />}
          name={company.name}
          badge={<VerifiedBadge company={company} />}
          subtitle={company.terms.role ? `Hiring a ${company.terms.role.toLowerCase()}` : undefined}
          facts={[
            company.terms.location || company.address ? (
              <>
                <span className="text-burgundy">
                  <FieldIcon kind="location" className="size-3.5" />
                </span>
                {company.terms.location || company.address}
              </>
            ) : null,
            company.website ? (
              <>
                <span className="text-burgundy">
                  <FieldIcon kind="website" className="size-3.5" />
                </span>
                <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-burgundy hover:underline">
                  {company.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              </>
            ) : null,
            // Always shown, so learners see how others rated the company before taking its challenge.
            <a key="rating" href="#company-ratings" className="inline-flex items-center gap-1.5 hover:text-burgundy">
              {ratings.length ? (
                <StarsFact ratings={ratings} />
              ) : (
                <>
                  <span aria-hidden className="text-subtle">
                    ★
                  </span>
                  <span className="text-muted">No ratings yet</span>
                </>
              )}
            </a>,
            company.verifiedAt ? <span className="text-muted">Partner since {company.verifiedAt}</span> : null,
          ]}
          actions={
            own ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setForm(company);
                  setEditing(true);
                }}
              >
                Edit profile
              </Button>
            ) : work || challenges.length ? (
              <>
                {challenges.length > 0 && (
                  <LinkButton href="#company-challenges" variant="secondary">
                    See their challenges
                  </LinkButton>
                )}
                {work && (
                  <RateButton
                    interviewId={work.id}
                    toId={company.id}
                    toName={company.name}
                    short={company.name}
                    question={`How was taking ${company.name}'s challenge?`}
                    hint="Was the brief clear? Was their feedback fair and on time?"
                  />
                )}
              </>
            ) : undefined
          }
        />
      )}
      {editing ? (
        <form
          className="flex max-w-3xl flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (!emailMatchesWebsite(form.email, form.website)) return;
            setState((st) => ({ ...st, companies: st.companies.map((c) => (c.id === form.id ? { ...c, ...form, logo: c.logo } : c)) }));
            setEditing(false);
          }}
        >
          <Card className="flex flex-col gap-4">
            <h2 className="text-h4">Company details</h2>
            <Input label="Company name" required value={form.name} onChange={(e) => set({ name: e.target.value })} />
            <Textarea label="About the company" required value={form.about} onChange={(e) => set({ about: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Website" required value={form.website} onChange={(e) => set({ website: e.target.value })} />
              <Input label="LinkedIn or Facebook page" required type="url" value={form.social} onChange={(e) => set({ social: e.target.value })} />
              <Input label="Work email" type="email" required value={form.email} onChange={(e) => set({ email: e.target.value })} error={domainError} />
              <Input label="Phone number" type="tel" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
            </div>
            <Input label="Office address" required value={form.address} onChange={(e) => set({ address: e.target.value })} />
          </Card>
          <Card className="flex flex-col gap-4">
            <h2 className="text-h4">Internship terms</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Role" required value={form.terms.role} onChange={(e) => setTerms({ role: e.target.value })} />
              <Input label="Duration" required value={form.terms.duration} onChange={(e) => setTerms({ duration: e.target.value })} />
              <Input label="Location" required value={form.terms.location} onChange={(e) => setTerms({ location: e.target.value })} />
              <Input label="Stipend" required value={form.terms.stipend} onChange={(e) => setTerms({ stipend: e.target.value })} />
            </div>
          </Card>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <Card>
              <h2 className="mb-3 text-h4">About</h2>
              <p className="whitespace-pre-line text-body-lg">{company.about || "No description yet."}</p>
              {company.videoId && (
                <div className="mt-4">
                  <YouTubeFrame videoId={company.videoId} title={`${company.name} video`} />
                </div>
              )}
            </Card>
            <Card id="company-challenges" className="scroll-mt-24">
              <h2 className="mb-4 text-h4">Challenges</h2>
              {challenges.length ? (
                <ul className="flex flex-col divide-y divide-line">
                  {challenges.map((ch) => (
                    <li key={ch.id}>
                      <Link
                        href={own ? `/company/challenges/${ch.id}` : `/challenges/${ch.id}`}
                        className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3 hover:bg-surface"
                      >
                        <span className="min-w-0">
                          <span className="block font-medium">{ch.title}</span>
                          <span className="block text-body-sm text-muted">{courseTitle(courses.find((c) => c.id === ch.courseId), lang)}</span>
                        </span>
                        <span aria-hidden className="text-burgundy">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">{own ? "Post a challenge and it shows here for learners." : "No challenges posted yet."}</p>
              )}
            </Card>
            <Card>
              <h2 className="mb-1 text-h4">Internship terms</h2>
              <p className="mb-4 text-body-sm text-muted">Written up front and checked by our team, so you know exactly what you apply for.</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail kind="role" label="Role">
                  {company.terms.role || "—"}
                </Detail>
                <Detail kind="duration" label="Duration">
                  {company.terms.duration || "—"}
                </Detail>
                <Detail kind="location" label="Location">
                  {company.terms.location || "—"}
                </Detail>
                <Detail kind="stipend" label="Stipend">
                  {company.terms.stipend || "—"}
                </Detail>
              </dl>
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <Card>
              <h2 className="mb-4 text-h4">Contact</h2>
              <dl className="flex flex-col gap-4">
                <Detail kind="website" label="Website">
                  {linkOrText(company.website)}
                </Detail>
                <Detail kind="social" label="LinkedIn or Facebook">
                  {linkOrText(company.social)}
                </Detail>
                <Detail kind="email" label="Email">
                  {company.email || "—"}
                </Detail>
                <Detail kind="phone" label="Phone">
                  {company.phone || "—"}
                </Detail>
                <Detail kind="address" label="Office">
                  {company.address || "—"}
                </Detail>
              </dl>
            </Card>
            <Card id="company-ratings" className="scroll-mt-24">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-h4">Ratings from learners</h2>
                {ratings.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-body-sm">
                    <StarsFact ratings={ratings} />
                  </span>
                )}
              </div>
              <RatingsList
                ratings={ratings}
                empty={
                  own
                    ? "No ratings yet. Learners who send work to your challenges can rate you here."
                    : work
                      ? "No ratings yet. You took their challenge, so you can be the first to rate them."
                      : "No ratings yet. Learners can rate a company once they send work to one of its challenges."
                }
              />
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
