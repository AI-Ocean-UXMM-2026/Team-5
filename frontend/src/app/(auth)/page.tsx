"use client";

import { LinkButton } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { copy } from "@/lib/i18n";
import { useData } from "@/lib/store";

export default function Landing() {
  const { lang } = useData();
  const t = copy[lang];

  return (
    <div className="flex flex-col gap-16 py-4">
      <section className="grid grid-cols-[1fr_5rem] items-start gap-3 sm:grid-cols-[1fr_7rem] md:grid-cols-[3fr_2fr] md:items-center md:gap-10">
        <div>
          <p className="mb-3 text-body-sm font-semibold text-burgundy">{t.eyebrow}</p>
          <h1 className="text-h1 sm:text-display">{t.heroTitle}</h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted">{t.heroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/signup">{t.createAccount}</LinkButton>
            <LinkButton href="/login" variant="secondary">
              {t.logIn}
            </LinkButton>
          </div>
        </div>
        <Mascot pose="journey" size={360} priority className="h-20 w-20 sm:h-28 sm:w-28 md:mx-auto md:h-auto md:w-full md:max-w-[360px]" />
      </section>

      <section aria-labelledby="how" className="rounded-3xl border border-line bg-white p-6 sm:p-10">
        <h2 id="how" className="text-h3">
          {t.how}
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {t.steps.map((step, i) => (
            <li key={step} className="flex flex-col gap-2 border-t-2 border-yellow pt-4">
              <span className="font-heading text-h4 text-burgundy">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex items-center gap-5 rounded-2xl border border-line bg-white p-6">
          <Mascot pose="teach" size={112} />
          <div>
            <h2 className="text-h4">{t.forLearners}</h2>
            <p className="mt-1 text-muted">{t.forLearnersBody}</p>
          </div>
        </div>
        <div className="flex items-center gap-5 rounded-2xl border border-line bg-white p-6">
          <Mascot pose="search" size={112} />
          <div>
            <h2 className="text-h4">{t.forCompanies}</h2>
            <p className="mt-1 text-muted">{t.forCompaniesBody}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
