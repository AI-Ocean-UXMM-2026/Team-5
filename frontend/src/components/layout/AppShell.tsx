"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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
    ];
  if (s.companies.find((c) => c.id === me.companyId)?.status !== "verified") return [["/company/registration", "Registration"]];
  return [
    ["/company/challenges", "Challenges"],
    ["/company/candidates", "Candidates"],
    ["/company/interviews", "Interviews"],
    ["/community", "Community"],
  ];
}

const loading = <p className="p-12 text-center text-muted">Loading…</p>;

function initials(name: string) {
  const parts = name.replace(/[()]/g, " ").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-b border-white/15 md:border-0 md:[&>:not(summary)]:!flex">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-body-lg font-semibold md:pointer-events-none md:py-0 [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="text-white/60 md:hidden group-open:hidden">
          +
        </span>
        <span aria-hidden className="hidden text-white/60 group-open:inline md:hidden">
          –
        </span>
      </summary>
      <div className="flex flex-col gap-3 pb-4 text-body-lg text-white/80 md:pt-4 md:pb-0">{children}</div>
    </details>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-white">
      {children}
    </Link>
  );
}

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

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!s || redirect) return loading;

  const me = s.users.find((u) => u.id === s.sessionUserId);
  const nav = navFor(s);
  const t = copy[lang];
  const accountHref =
    me?.role === "company" && s.companies.find((c) => c.id === me.companyId)?.status === "verified" ? "/company/account" : me ? `/profile/${me.id}` : "";
  const onAccount = pathname === accountHref;

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-8 gap-y-2 px-6 py-3 md:px-8 lg:px-12">
          <Link href={homePath(s)} className="flex shrink-0 items-center gap-2.5 rounded-lg">
            <Image src="/logo/the-citadel-icon-primary.png" alt="" width={40} height={40} priority className="size-10" />
            <span className="flex flex-col">
              <span className="font-heading text-base leading-5 font-semibold">The Citadel</span>
              <span className="text-[11px] leading-4 text-subtle">{t.heroTitle}</span>
            </span>
          </Link>
          {nav.length > 0 && (
            <nav aria-label="Main" className="hidden gap-1 md:flex">
              {nav.map(([href, label]) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`whitespace-nowrap border-b-2 px-2 py-2 text-sm font-medium transition-colors ${active ? "border-burgundy text-burgundy" : "border-transparent text-muted hover:text-ink"}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2 text-sm sm:gap-3">
            {nav.length > 0 && (
              <button
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-white text-ink hover:bg-surface pointer-coarse:size-11 md:hidden"
                aria-expanded={menuOpen}
                aria-controls="nav-menu"
                aria-label={menuOpen ? "Close menu" : "Menu"}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  {menuOpen ? (
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  )}
                </svg>
              </button>
            )}
            <div role="group" aria-label={t.language} className={`${nav.length ? "hidden md:flex" : "flex"} shrink-0 rounded-xl border border-line p-0.5`}>
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
            {isPitchUser(me?.id) && (
              <button
                type="button"
                onClick={() => window.confirm("Reset all demo data?") && resetDemo()}
                className="hidden rounded-xl px-2 py-2 text-muted hover:bg-surface hover:text-ink sm:inline"
              >
                Reset demo
              </button>
            )}
            {me && (
              <Link
                href={accountHref}
                aria-label="Account"
                aria-current={onAccount ? "page" : undefined}
                className={`hidden size-10 place-items-center rounded-xl text-sm font-semibold pointer-coarse:size-11 md:grid ${onAccount ? "bg-burgundy text-white" : "border border-line bg-white text-burgundy hover:bg-surface"}`}
              >
                {initials(me.name)}
              </Link>
            )}
            {me && (
              <button
                type="button"
                aria-label="Log out"
                onClick={() => setState((st) => ({ ...st, sessionUserId: null }))}
                className="hidden size-10 place-items-center rounded-xl border border-line bg-white text-ink hover:bg-surface pointer-coarse:size-11 md:grid"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M10 7V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 12h10M11 9l3 3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {menuOpen && nav.length > 0 && (
          <nav id="nav-menu" aria-label="Main" className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
            {nav.map(([href, label]) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-3 py-3 text-sm font-medium ${active ? "bg-burgundy-tint text-burgundy" : "text-ink hover:bg-surface"}`}
                >
                  {label}
                </Link>
              );
            })}
            <div role="group" aria-label={t.language} className="mt-2 flex rounded-xl border border-line p-0.5">
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
                  className={`flex-1 rounded-lg px-3 py-3 ${lang === id ? "bg-burgundy-tint font-medium text-burgundy" : "text-muted hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {me && (
              <Link
                href={accountHref}
                aria-current={onAccount ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${onAccount ? "bg-burgundy-tint text-burgundy" : "text-ink hover:bg-surface"}`}
              >
                <span className={`grid size-10 place-items-center rounded-xl text-sm font-semibold ${onAccount ? "bg-burgundy text-white" : "border border-line bg-white text-burgundy"}`}>
                  {initials(me.name)}
                </span>
                Profile
              </Link>
            )}
            {me && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setState((st) => ({ ...st, sessionUserId: null }));
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-ink hover:bg-surface"
              >
                <span className="grid size-10 place-items-center rounded-xl border border-line bg-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M10 7V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 12h10M11 9l3 3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Log out
              </button>
            )}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-10 md:px-8 lg:px-12">{children}</main>
      <footer className="bg-ink-strong text-white">
        <div className="mx-auto grid max-w-[1280px] gap-2 px-6 py-8 md:grid-cols-4 md:gap-8 md:px-8 lg:px-12">
          <FooterCol title="The Citadel">
            <Image src="/logo/the-citadel-logo-reversed.png" alt="The Citadel" width={96} height={96} className="size-20" />
            <p className="font-semibold text-white">{t.heroTitle}</p>
            <p>{t.eyebrow}</p>
          </FooterCol>
          <FooterCol title={t.forLearners}>
            <FooterLink href="/legal#how">{t.how}</FooterLink>
            <FooterLink href="/courses">{t.courses}</FooterLink>
            <FooterLink href="/challenges">{t.challenges}</FooterLink>
            <FooterLink href="/internships">{t.internships}</FooterLink>
            <FooterLink href="/community">{t.community}</FooterLink>
          </FooterCol>
          <FooterCol title={t.forCompanies}>
            <FooterLink href="/signup?role=company">{t.registerCompany}</FooterLink>
            <FooterLink href="/legal#verify">{t.howVerify}</FooterLink>
            <FooterLink href="/company/challenges/new">{t.postChallenge}</FooterLink>
            <FooterLink href="/community">{t.community}</FooterLink>
          </FooterCol>
          <FooterCol title={t.trustHelp}>
            <p>
              <span className="font-semibold text-white">{t.promise}: </span>
              {t.signupIntro}
            </p>
            <p>
              <FooterLink href="/legal#safety">{t.safetyTitle}: </FooterLink>
              {t.safetyBody}
            </p>
            <p>
              <FooterLink href="/legal#rules">{t.rulesTitle}: </FooterLink>
              {t.rulesBody}
            </p>
          </FooterCol>
        </div>
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 border-t border-white/15 px-6 py-4 text-body text-white/80 md:px-8 lg:px-12">
          <p>{t.rights}</p>
          <nav aria-label={t.trustHelp} className="flex flex-wrap gap-x-4 gap-y-2">
            <FooterLink href="/legal#privacy">{t.privacy}</FooterLink>
            <FooterLink href="/legal#terms">{t.terms}</FooterLink>
            <FooterLink href="/legal#rules">{t.rulesTitle}</FooterLink>
          </nav>
        </div>
      </footer>
    </>
  );
}
