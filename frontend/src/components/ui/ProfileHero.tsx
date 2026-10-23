import type { ReactNode } from "react";

/** One header for every profile (learners and companies): a brand cover, the avatar or logo, name, a short line, quick facts and actions. */
export function ProfileHero({
  avatar,
  name,
  badge,
  subtitle,
  facts,
  actions,
}: {
  avatar: ReactNode;
  name: string;
  badge?: ReactNode;
  subtitle?: ReactNode;
  facts?: ReactNode[];
  actions?: ReactNode;
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-line bg-white">
      {/* Cover band: the same burgundy as the learner home banner, with the faint citadel steps. */}
      <div
        aria-hidden
        className="h-24 sm:h-28"
        style={{
          background:
            "linear-gradient(#ffffff1f 0 0) right 120px bottom 0 / 72px 30% no-repeat, linear-gradient(#ffffff1f 0 0) right 44px bottom 0 / 72px 55% no-repeat, radial-gradient(120% 160% at 90% 0%, #b65a6f 0%, #963d50 45%, #5e2333 100%)",
        }}
      />
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-10 flex flex-wrap items-end justify-between gap-3 sm:-mt-12">
          <div className="rounded-[22px] bg-white p-1 shadow-sm">{avatar}</div>
          {actions && <div className="flex flex-wrap items-center gap-2 pb-1">{actions}</div>}
        </div>
        <h1 className="mt-3 flex flex-wrap items-center gap-2 text-h3 tracking-[-0.02em] sm:text-h2">
          {name}
          {badge}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-body-lg text-muted">{subtitle}</p>}
        {!!facts?.filter(Boolean).length && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {facts.filter(Boolean).map((f, i) => (
              <li key={i} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-body-sm text-ink">
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Initials on a burgundy tile, the profile avatar for people. */
export function InitialsAvatar({ name, size = 88 }: { name: string; size?: number }) {
  const parts = name.replace(/[()]/g, " ").split(/\s+/).filter(Boolean);
  const text = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  return (
    <span aria-hidden className="grid place-items-center rounded-[18px] bg-burgundy font-heading font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.34 }}>
      {text}
    </span>
  );
}

/** Average stars, shown as "★ 4.5 · 2 ratings". */
export function StarsFact({ ratings }: { ratings: { stars: number }[] }) {
  if (!ratings.length) return null;
  const avg = ratings.reduce((n, r) => n + r.stars, 0) / ratings.length;
  return (
    <>
      <span aria-hidden className="text-yellow">
        ★
      </span>
      <span className="font-semibold">{avg.toFixed(1)}</span>
      <span className="text-muted">
        · {ratings.length} {ratings.length === 1 ? "rating" : "ratings"}
      </span>
    </>
  );
}
