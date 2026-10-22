"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { courseTitle } from "@/lib/i18n";
import { courses } from "@/lib/seed";
import { nameOf, useData } from "@/lib/store";

export default function CertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { s, lang } = useData();
  const cert = s.certificates.find((c) => c.id === certificateId);
  const course = courses.find((c) => c.id === cert?.courseId);
  if (!cert || !course) return <Empty>Certificate not found.</Empty>;

  return (
    <div className="mx-auto max-w-3xl">
      <article className="rounded-3xl border-2 border-burgundy bg-white p-10 text-center sm:p-14">
        <Image src="/logo/the-citadel-logo-primary.png" alt="The Citadel" width={112} height={112} className="mx-auto -mt-4 mb-2 size-28" />
        <Mascot pose="teach" size={128} className="mx-auto" />
        <p className="mt-4 text-body-sm font-semibold tracking-wide text-burgundy uppercase">Certificate of completion</p>
        <h1 className="mt-4 text-h1">{nameOf(s, cert.learnerId)}</h1>
        <p className="mt-4 text-body-lg text-muted">has passed the final test for</p>
        <p className="mt-1 font-heading text-h3 font-semibold">{courseTitle(course, lang)}</p>
        <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-yellow" />
        <dl className="mt-8 flex justify-center gap-10 text-left text-body-sm">
          <div>
            <dt className="text-muted">Score</dt>
            <dd className="font-semibold">{cert.score}%</dd>
          </div>
          <div>
            <dt className="text-muted">Issued</dt>
            <dd className="font-semibold">{cert.issuedAt}</dd>
          </div>
          <div>
            <dt className="text-muted">Certificate ID</dt>
            <dd className="font-semibold">{cert.id}</dd>
          </div>
        </dl>
      </article>
      <Button variant="secondary" className="mt-6 print:hidden" onClick={() => window.print()}>
        Print or save as PDF
      </Button>
    </div>
  );
}
