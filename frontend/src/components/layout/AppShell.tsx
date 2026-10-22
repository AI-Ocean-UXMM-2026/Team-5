"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { type Area, homePath, redirectFor } from "@/lib/access";
import { copy } from "@/lib/i18n";
import { isPitchUser } from "@/lib/seed";
import { resetDemo, setState, useStore } from "@/lib/store";
import type { Lang, State } from "@/lib/types";

function navFor(s: State) {
  const me = s.users.find((u) => u.id === s.sessionUserId);
  if (!me) return [];
  if (me.role === "learner")
    return [
      ["/roadmap", "Roadmap"],
      ["/courses", "Courses"],
      ["/challenges", "Challenges"],
      ["/internships", "Internships"],
      ["/community", "Community"],
      [`/profile/${me.id}`, "Profile"],
    ];
  if (s.companies.find((c) => c.id === me.companyId)?.status !== "verified") return [["/company/registration", "Registration"]];
  return [
    ["/company/challenges", "Challenges"],
    ["/company/candidates", "Candidates"],
    ["/company/interviews", "Interviews"],
    ["/community", "Community"],
    ["/company/account", "Account"],
  ];
}

const loading = <p className="p-12 text-center text-muted">Loading…</p>;

export function AppShell(props: { area: Area; children: React.ReactNode }) {
  return (
    <Suspense fallback={loading}>
      <Shell {...props} />
    </Suspense>
  );
}

function Shell({ area, children }: { area: Area; children: React.ReactNode }) {
  const s = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const redirect = s && redirectFor(s, area, pathname);

  const lang: Lang = s?.lang === "my" ? "my" : "en";

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  if (!s || redirect) return loading;

  const me = s.users.find((u) => u.id === s.sessionUserId);
  const nav = navFor(s);
  const t = copy[lang];

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3 md:px-8 lg:px-12">
          <Link href={homePath(s)} className="shrink-0 rounded-lg">
            <Image src="/logo/the-citadel-icon-primary.png" alt="The Citadel" width={44} height={44} priority className="size-11" />
          </Link>
          {nav.length > 0 && (
            <nav aria-label="Main" className="order-last -mx-2 flex w-full flex-wrap gap-1 md:order-none md:w-auto">
              {nav.map(([href, label]) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-burgundy-tint text-burgundy" : "text-muted hover:bg-surface hover:text-ink"}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-3 text-sm">
            <div role="group" aria-label={t.language} className="flex rounded-xl border border-line p-0.5">
              {(
                [
                  ["en", "English"],
                  ["my", "မြန်မာ"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={lang === id}
                  onClick={() => lang !== id && setState((st) => ({ ...st, lang: id }))}
                  className={`rounded-lg px-2 py-1 ${lang === id ? "bg-burgundy-tint font-medium text-burgundy" : "text-muted hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {me && <span className="hidden text-muted lg:inline">{me.name}</span>}
            {isPitchUser(me?.id) && (
              <button
                type="button"
                onClick={() => window.confirm("Reset all demo data?") && resetDemo()}
                className="rounded-xl px-2 py-2 text-muted hover:bg-surface hover:text-ink"
              >
                Reset demo
              </button>
            )}
            {me && (
              <button type="button" onClick={() => setState((st) => ({ ...st, sessionUserId: null }))} className="rounded-xl px-2 py-2 font-medium text-burgundy hover:bg-burgundy-tint">
                Log out
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-10 md:px-8 lg:px-12">{children}</main>
      <footer className="bg-ink-strong text-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-8 lg:px-12">
          <Image src="/logo/the-citadel-logo-reversed.png" alt="The Citadel" width={96} height={96} className="size-24" />
          <p className="text-body-sm text-white/70">{t.footer}</p>
        </div>
      </footer>
    </>
  );
}
