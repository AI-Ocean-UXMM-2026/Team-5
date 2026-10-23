"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { YouTubeFrame } from "@/components/YouTubeFrame";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { emailMatchesWebsite, youtubeVideoId } from "@/lib/rules";
import { setState, useData } from "@/lib/store";
import type { Company } from "@/lib/types";

export default function Registration() {
  const { company } = useData();
  const router = useRouter();
  const [form, setForm] = useState<Company>(company!);
  const [agreed, setAgreed] = useState(false);
  const [tried, setTried] = useState(false);
  const [videoUrl, setVideoUrl] = useState(company?.videoId ? `https://youtu.be/${company.videoId}` : "");
  const set = (patch: Partial<Company>) => setForm((f) => ({ ...f, ...patch }));
  const setTerms = (patch: Partial<Company["terms"]>) => setForm((f) => ({ ...f, terms: { ...f.terms, ...patch } }));
  const domainError = tried && !emailMatchesWebsite(form.email, form.website) ? "The email must be on your website's domain, not Gmail or similar." : undefined;
  const docsError = tried && !form.documents.length ? "Upload your business registration document." : undefined;
  const videoId = youtubeVideoId(videoUrl);
  const videoError = tried && videoUrl.trim() && videoId === undefined ? "Use a YouTube video link." : undefined;

  return (
    <>
      {(company!.status !== "draft" || company!.reviewNote) && (
        <Breadcrumb items={[{ label: "Registration status", href: "/company/registration/status" }, { label: "Edit registration" }]} />
      )}
      <PageHeader title="Register your company" intro="Our team checks every company before it can post challenges or internships. This keeps learners safe." pose="wave" />
      {form.reviewNote && (
        <Card role="status" tone="highlight" className="mb-6">
          <h2 className="text-body-lg">Our team asked for more information</h2>
          <p>{form.reviewNote}</p>
        </Card>
      )}
      <form
        className="flex max-w-3xl flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (!emailMatchesWebsite(form.email, form.website) || !form.documents.length || videoId === undefined) return;
          setState((st) => ({
            ...st,
            companies: st.companies.map((c) => (c.id === form.id ? { ...form, videoId: videoId || undefined, status: "pending", reviewNote: undefined } : c)),
          }));
          router.push("/company/registration/status");
        }}
      >
        <Card className="flex flex-col gap-4">
          <h2 className="text-h4">1. Company details</h2>
          <Input label="Company name" required value={form.name} onChange={(e) => set({ name: e.target.value })} />
          <Textarea label="About the company" required value={form.about} onChange={(e) => set({ about: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Website" required placeholder="https://yourcompany.com" value={form.website} onChange={(e) => set({ website: e.target.value })} />
            <Input label="LinkedIn or Facebook page" required type="url" value={form.social} onChange={(e) => set({ social: e.target.value })} />
            <Input label="Work email" type="email" required value={form.email} onChange={(e) => set({ email: e.target.value })} error={domainError} hint="Must be on your company's own domain." />
            <Input label="Phone number" type="tel" required value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
          </div>
          <Input label="Office address" required value={form.address} onChange={(e) => set({ address: e.target.value })} />
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-h4">2. Documents</h2>
          {/* shortcut: only file names are kept in the browser; real uploads need the backend's storage. */}
          <Input
            label="Business registration document"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="py-2"
            onChange={(e) => set({ documents: Array.from(e.target.files ?? []).map((f) => f.name) })}
            error={docsError}
            hint={form.documents.length ? `Attached: ${form.documents.join(", ")}` : "PDF or image."}
          />
          <Input
            label="Company video"
            type="url"
            placeholder="https://youtu.be/…"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            error={videoError}
            hint="Paste an unlisted YouTube link. A private video only plays for you."
          />
          {typeof videoId === "string" ? <YouTubeFrame videoId={videoId} title={`${form.name} video`} /> : null}
          <p className="text-body-sm text-muted">After you submit, our team will also book a short call with a company representative.</p>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-h4">3. Internship terms</h2>
          <p className="-mt-2 text-muted">Written up front, so learners know exactly what they apply for.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Role" required value={form.terms.role} onChange={(e) => setTerms({ role: e.target.value })} />
            <Input label="Duration" required placeholder="3 months" value={form.terms.duration} onChange={(e) => setTerms({ duration: e.target.value })} />
            <Input label="Location" required placeholder="Yangon (hybrid)" value={form.terms.location} onChange={(e) => setTerms({ location: e.target.value })} />
            <Input label="Stipend" required placeholder="300,000 MMK / month or Unpaid" value={form.terms.stipend} onChange={(e) => setTerms({ stipend: e.target.value })} />
          </div>
          <label className="flex items-start gap-2">
            <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-burgundy" />
            <span>We will never ask learners for money, a passport or an ID card, and will only post internships that match these terms.</span>
          </label>
        </Card>

        <Button type="submit" className="self-start">
          Submit for verification
        </Button>
      </form>
    </>
  );
}
