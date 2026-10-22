"use client";

import Image from "next/image";
import { useState } from "react";
import { RatingsList } from "@/components/RatingForm";
import { Button, LinkArrow } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Detail } from "@/components/ui/Detail";
import { Input, Textarea } from "@/components/ui/Field";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { emailMatchesWebsite } from "@/lib/rules";
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
    <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-burgundy underline-offset-2 hover:underline">
      {value}
      <LinkArrow className="size-3" />
    </a>
  ) : (
    value || "—"
  );
}

export function CompanyProfile({ company, own }: { company: Company; own: boolean }) {
  const { s } = useData();
  const ratings = s.ratings.filter((r) => r.toId === company.id);
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
      {editing ? (
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-body-sm">
              <li>
                <button type="button" onClick={close} className="text-muted hover:text-burgundy">
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
          <p className="mt-2 font-heading text-h4 font-medium text-muted">{company.name}</p>
        </div>
      ) : (
        <PageHeader title={company.name} intro={company.about} media={<CompanyLogo company={company} own={own} />} badge={<VerifiedBadge company={company} />}>
          {own && (
            <Button
              variant="secondary"
              onClick={() => {
                setForm(company);
                setEditing(true);
              }}
            >
              Edit profile
            </Button>
          )}
        </PageHeader>
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
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <Card className="h-full">
            <h2 className="mb-4 text-h4">Company page</h2>
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
          <div className="flex h-full flex-col gap-6">
            <Card>
              <h2 className="mb-4 text-h4">Approved internship terms</h2>
              <dl className="grid grid-cols-2 gap-4">
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
            <Card className="flex-1">
              <h2 className="mb-3 text-h4">Ratings from interns</h2>
              <RatingsList ratings={ratings} empty="No ratings yet." />
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
