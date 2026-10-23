"use client";

import { copy } from "@/lib/i18n";
import { useData } from "@/lib/store";

export default function Legal() {
  const { lang } = useData();
  const t = copy[lang];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <h1 className="text-h3 tracking-[-0.02em] sm:text-h2">{t.trustHelp}</h1>
      <section id="how" className="scroll-mt-8">
        <h2 className="text-h3">{t.how}</h2>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-body-lg">
          {t.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      {(
        [
          ["verify", t.howVerify, t.verifyBody],
          ["safety", t.safetyTitle, t.safetyBody],
          ["rules", t.rulesTitle, t.rulesBody],
          ["privacy", t.privacy, t.privacyBody],
          ["terms", t.terms, t.termsBody],
        ] as const
      ).map(([id, title, body]) => (
        <section key={id} id={id} className="scroll-mt-8">
          <h2 className="text-h3">{title}</h2>
          <p className="mt-2 text-body-lg text-muted">{body}</p>
        </section>
      ))}
    </div>
  );
}
