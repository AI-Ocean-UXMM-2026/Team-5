"use client";

import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, cardLinkClass, cardLinkStretch } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { copy } from "@/lib/i18n";
import { useData } from "@/lib/store";

export default function Landing() {
  const { s, lang } = useData();
  const t = copy[lang];
  const company = s.companies.find((c) => c.id === "c-gp");

  return (
    <div className="flex flex-col gap-16 py-4">
      <section className="rounded-3xl border border-line bg-gradient-to-br from-white to-burgundy-tint p-6 sm:p-10">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="min-w-0">
            <p className="text-caption font-semibold tracking-[0.14em] text-burgundy uppercase">{t.promoLabel}</p>
            <h1 className="mt-3 text-h1">{t.heroTitle}</h1>
            <p className="mt-3 max-w-xl text-body-lg text-muted">{t.promoBody}</p>
            <ul className="mt-5 flex flex-col gap-3">
              {t.promoPoints.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-burgundy text-white">
                    <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                    </svg>
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
              <LinkButton href="/signup" className="w-full sm:w-auto">
                {t.createAccount}
              </LinkButton>
              <a href="#how" className="inline-flex h-10 w-full items-center justify-center gap-1 text-sm font-semibold text-burgundy sm:w-auto sm:justify-start sm:px-3">
                {t.promoHow} <span aria-hidden>→</span>
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm pt-8 sm:pt-10">
            <Mascot pose="cheer" size={112} className="absolute top-0 right-1 z-20 h-16 w-16 sm:right-0 sm:h-24 sm:w-24" />
            {company && (
              <div className="absolute top-6 right-0 hidden w-[88%] rotate-6 rounded-2xl border border-line bg-white p-5 shadow-md sm:block">
                <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
                  {company.name} <VerifiedBadge company={company} label={t.verified} />
                </div>
                <p className="mt-2 font-heading text-h4 font-semibold">{t.promoChallenge}</p>
              </div>
            )}
            <div className="relative z-10 w-full rounded-2xl border border-line bg-white p-5 shadow-lg sm:mt-16 sm:w-[88%] sm:-rotate-2">
              <Badge tone="success">{t.free}</Badge>
              <p className="mt-3 font-heading text-h4 font-semibold">{t.promoCourse}</p>
            </div>
          </div>
        </div>
      </section>

      <Instructors />

      <p className="rounded-2xl bg-yellow-tint px-5 py-4 text-center text-body font-medium">{t.freeStrip}</p>

      <HowItWorks />

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

const instructors = [
  { name: "Hnin Su Wai", company: "Shwe Code", photo: "/instructors/instructor-1.jpg", roleEn: "Frontend Developer", roleMy: "Frontend ဖန်တီးသူ", years: 6, courseId: "frontend", courseEn: "Frontend basics", courseMy: "Frontend အခြေခံ", tint: "from-white to-burgundy-tint" },
  { name: "Kaung Min Htet", company: "Inle Studio", photo: "/instructors/instructor-2.jpg", roleEn: "UI/UX Designer", roleMy: "UI/UX ဒီဇိုင်နာ", years: 7, courseId: "uiux", courseEn: "UI/UX basics", courseMy: "UI/UX အခြေခံ", tint: "from-white to-yellow-tint" },
  { name: "Thiri Aye", company: "Mingalar Data", photo: "/instructors/instructor-3.jpg", roleEn: "Data Analyst", roleMy: "ဒေတာ လေ့လာသူ", years: 5, courseId: "data", courseEn: "Data analysis", courseMy: "ဒေတာ ခွဲခြမ်းစိတ်ဖြာခြင်း", tint: "from-white to-success-tint" },
  { name: "Min Khant Oo", company: "Bagan Labs", photo: "/instructors/instructor-4.jpg", roleEn: "QA Engineer", roleMy: "QA အင်ဂျင်နီယာ", years: 6, courseId: "qa", courseEn: "Software testing", courseMy: "ဆော့ဖ်ဝဲ စမ်းသပ်ခြင်း", tint: "from-white to-ai" },
  { name: "May Thazin", company: "Wave Digital", photo: "/instructors/instructor-5.jpg", roleEn: "Digital Marketer", roleMy: "ဒစ်ဂျစ်တယ် မားကတ်တင်း", years: 5, courseId: "marketing", courseEn: "Digital marketing", courseMy: "ဒစ်ဂျစ်တယ် မားကတ်တင်း", tint: "from-yellow-tint to-burgundy-tint" },
];

function Instructors() {
  const { lang } = useData();
  const t = copy[lang];
  const my = lang === "my";

  return (
    <section aria-labelledby="instructors">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="instructors" className="text-h2">
          {t.instructorsTitle}
        </h2>
        <p className="mt-2 text-body-lg text-muted">{t.instructorsLead}</p>
      </div>
      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto py-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {instructors.map((person) => (
          <Link
            key={person.name}
            href="/signup"
            className="flex w-[66%] shrink-0 snap-start flex-col rounded-3xl border border-line bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy lg:w-auto"
          >
            <div className={`overflow-hidden rounded-2xl bg-gradient-to-b ${person.tint} p-2`}>
              <Image src={person.photo} alt={person.name} width={320} height={400} className="h-40 w-full rounded-xl object-cover object-top" />
            </div>
            <p className="mt-4 font-heading text-h4 font-semibold">{person.name}</p>
            <p className="mt-1 text-body-sm text-muted">{my ? person.roleMy : person.roleEn}</p>
            <p className="text-body-sm text-muted">{person.company}</p>
            <p className="mt-2 text-body-sm font-semibold text-burgundy">
              {person.years}
              {t.yearsExp}
            </p>
            <p className="mt-3 w-fit rounded-lg bg-burgundy-tint px-2 py-0.5 text-caption font-medium text-burgundy">
              {t.teaches}: {my ? person.courseMy : person.courseEn}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const { lang } = useData();
  const t = copy[lang];

  return (
    <section aria-labelledby="how">
      <h2 id="how" className="text-h2">
        {t.how}
      </h2>
      <ol className="mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
        {t.steps.map((line, i) => (
          <li key={line} className="relative pt-5">
            <p className="flex h-full min-h-28 items-center justify-center rounded-2xl border border-line bg-white px-4 pt-8 pb-5 text-center text-h4 font-semibold shadow-sm">
              {line}
            </p>
            <span className="absolute top-0 left-1/2 grid size-10 -translate-x-1/2 place-items-center rounded-full bg-burgundy text-sm font-medium text-white">
              {i + 1}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
