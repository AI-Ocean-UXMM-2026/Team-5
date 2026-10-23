"use client";

import { LinkButton } from "@/components/ui/Button";
import { Card, cardLinkClass, cardLinkStretch } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { copy, courseTitle } from "@/lib/i18n";
import { courses } from "@/lib/seed";
import { useData } from "@/lib/store";

export default function Landing() {
  const { s, lang } = useData();
  const t = copy[lang];
  const challenge = s.challenges.find((c) => c.id === "ch-pricing");
  const company = s.companies.find((c) => c.id === challenge?.companyId);
  const course = courses.find((c) => c.id === challenge?.courseId);
  const unlocks = courseTitle(course, lang).split(/[:—]/)[0].trim();

  return (
    <div className="flex flex-col gap-16 py-4">
      <section className="grid items-center gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-h1 sm:text-display">{t.heroTitle}</h1>
              <p className="mt-4 max-w-xl text-body-lg text-muted">{t.heroLead}</p>
            </div>
            <Mascot pose="journey" size={80} priority className="h-14 w-14 sm:h-16 sm:w-16 md:hidden" />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-1">
            <LinkButton href="/signup">{t.createAccount}</LinkButton>
            <LinkButton href="/login" variant="tertiary">
              {t.logIn}
            </LinkButton>
          </div>
          <p className="mt-3 text-body-sm text-muted">{t.signupIntro}</p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Mascot pose="journey" size={200} priority className="hidden h-40 w-40 md:block" />
          {challenge && company && (
            <Card className="w-full">
              <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
                {company.name} <VerifiedBadge company={company} />
              </div>
              <h2 className="mt-2 text-h4">{challenge.title}</h2>
              {unlocks && (
                <p className="mt-2 text-body-sm text-muted">
                  {t.unlocksAfter} {unlocks}
                </p>
              )}
            </Card>
          )}
        </div>
      </section>

      <p className="rounded-2xl bg-yellow-tint px-5 py-4 text-center text-body font-medium">{t.freeStrip}</p>

      <section aria-labelledby="how">
        <h2 id="how" className="text-h3">
          {t.how}
        </h2>
        <ol className="mt-4 flex gap-4 overflow-x-auto pt-6">
          {t.steps.map((step, i) => (
            <li key={step} className="min-w-52 flex-1">
              <Card className="relative h-full !pt-10 text-center">
                <span aria-hidden className="absolute top-0 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-burgundy font-heading text-h3 font-semibold text-white">
                  {i + 1}
                </span>
                <p className="text-body-sm text-muted">{step}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className={`${cardLinkClass} flex h-full flex-col gap-4 !p-8 sm:!p-10`}>
          <Mascot pose="teach" size={96} />
          <h2 className="text-h3">{t.forLearners}</h2>
          <p className="text-body-lg text-muted">{t.forLearnersBody}</p>
          <LinkButton href="/signup" className={`mt-auto self-start ${cardLinkStretch}`}>
            {t.startLearning}
          </LinkButton>
        </Card>
        <Card className={`${cardLinkClass} flex h-full flex-col gap-4 !p-8 sm:!p-10`}>
          <Mascot pose="search" size={96} />
          <h2 className="text-h3">{t.forCompanies}</h2>
          <p className="text-body-lg text-muted">{t.forCompaniesBody}</p>
          <LinkButton href="/signup?role=company" className={`mt-auto self-start ${cardLinkStretch}`}>
            {t.registerCompany}
          </LinkButton>
        </Card>
      </section>

      <section aria-labelledby="trust" className="overflow-hidden rounded-3xl border border-line bg-white">
        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex min-w-0 flex-col gap-6 border-b border-line bg-burgundy-tint p-6 sm:p-10 md:border-r md:border-b-0">
            <h2 id="trust" className="text-h2">
              {t.verifyTitle}
            </h2>
            <p className="text-body-lg">{t.verifyBody}</p>
            {company && (
              <div className="mt-auto flex flex-wrap items-center gap-3">
                <VerifiedBadge company={company} />
                <span className="text-body-sm text-muted">{company.name}</span>
              </div>
            )}
          </div>
          <ol className="flex min-w-0 flex-col">
            {t.verifyPoints.map((point, i) => (
              <li key={point.title} className="flex min-w-0 gap-4 border-b border-line px-6 py-5 last:border-b-0 sm:px-8 sm:py-6">
                <span aria-hidden className="font-heading text-h4 text-burgundy">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-h4">{point.title}</p>
                  <p className="mt-1 text-muted">{point.line}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-white px-6 py-10 text-center">
        <h2 className="text-h2">{t.ctaTitle}</h2>
        <LinkButton href="/signup" className="mt-6">
          {t.createAccount}
        </LinkButton>
      </section>
    </div>
  );
}
