"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { type Area, homePath, redirectFor } from "@/lib/access";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { copy } from "@/lib/i18n";
import { useCourses } from "@/lib/catalogue";
import { isPitchUser } from "@/lib/seed";
import { progressOf, resetDemo, setState, useStore } from "@/lib/store";
import type { Lang, State, User } from "@/lib/types";
import { Notifications } from "./Notifications";

type IconName = "home" | "book" | "flag" | "briefcase" | "people" | "users" | "calendar" | "building" | "clipboard" | "logout" | "menu" | "close";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1Z" />,
    book: <path d="M12 6.5c-2-1.6-4.7-2-8-1.5v13c3.3-.5 6 0 8 1.5m0-13c2-1.6 4.7-2 8-1.5v13c-3.3-.5-6 0-8 1.5m0-13v13" />,
    flag: <path d="M5 21V4m0 0h11.5l-2 4 2 4H5" />,
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8.5 7V5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v2M3 12.5h18" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 5.3a3 3 0 0 1 0 5.4M17.5 14.2A5.5 5.5 0 0 1 20.5 19" />
      </>
    ),
    users: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4m8-4v4M4 10h16" />
      </>
    ),
    building: <path d="M4 21V5l8-2v18M12 9h8v12M2 21h20M8 8h.01M8 12h.01M8 16h.01M16 13h.01M16 17h.01" />,
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1M9 11h6M9 15h4" />
      </>
    ),
    logout: <path d="M14 7V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2M10 12h10m-3-3 3 3-3 3" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      {paths[name]}
    </svg>
  );
}

type NavItem = { href: string; label: string; icon: IconName; match?: string[] };
type NavGroup = { label: string; items: NavItem[] };

function navFor(s: State, lang: Lang): NavGroup[] {
  const t = copy[lang];
  const x = (en: string, my: string) => (lang === "my" ? my : en);
  const me = s.users.find((u) => u.id === s.sessionUserId);
  if (!me) return [];
  if (me.role === "learner")
    return [
      {
        label: x("Learn", "လေ့လာရန်"),
        items: [
          { href: "/roadmap", label: x("Home", "ပင်မ"), icon: "home" },
          { href: "/courses", label: t.courses, icon: "book", match: ["/certificates"] },
          { href: "/challenges", label: t.challenges, icon: "flag" },
          { href: "/internships", label: t.internships, icon: "briefcase" },
        ],
      },
      { label: x("Connect", "ချိတ်ဆက်ရန်"), items: [{ href: "/community", label: t.community, icon: "people" }] },
    ];
  if (s.companies.find((c) => c.id === me.companyId)?.status !== "verified")
    return [{ label: x("Get verified", "အတည်ပြုရန်"), items: [{ href: "/company/registration", label: x("Registration", "မှတ်ပုံတင်ခြင်း"), icon: "clipboard" }] }];
  return [
    {
      label: x("Hiring", "ခန့်အပ်ရန်"),
      items: [
        { href: "/company/challenges", label: t.challenges, icon: "flag" },
        { href: "/company/candidates", label: x("Candidates", "လျှောက်ထားသူများ"), icon: "users" },
        { href: "/company/interviews", label: x("Interviews", "အင်တာဗျူးများ"), icon: "calendar" },
      ],
    },
    { label: x("Connect", "ချိတ်ဆက်ရန်"), items: [{ href: "/community", label: t.community, icon: "people" }] },
    { label: x("Company", "ကုမ္ပဏီ"), items: [{ href: "/company/account", label: x("Company page", "ကုမ္ပဏီစာမျက်နှာ"), icon: "building" }] },
  ];
}

const isActive = (pathname: string, item: NavItem) =>
  [item.href, ...(item.match ?? [])].some((h) => pathname === h || pathname.startsWith(`${h}/`));

const loading = <p className="p-12 text-center text-muted">Loading…</p>;

function initials(name: string) {
  const parts = name.replace(/[()]/g, " ").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function LanguageSwitch({ lang, label }: { lang: Lang; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 rounded-xl border border-line bg-white p-0.5 text-body-sm">
      {(
        [
          ["en", "EN"],
          ["my", "မြန်မာ"],
        ] as const
      ).map(([id, text]) => (
        <button
          key={id}
          type="button"
          aria-pressed={lang === id}
          onClick={() => lang !== id && setState((st) => ({ ...st, lang: id }))}
          className={`min-h-8 rounded-lg px-2.5 pointer-coarse:min-h-10 ${lang === id ? "bg-burgundy-tint font-semibold text-burgundy" : "text-muted hover:text-ink"}`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

/** Lessons done across the roadmap, one segment per course, so learners always see how far along the path they are. */
function PathMeter({ s, me, lang }: { s: State; me: User; lang: Lang }) {
  const courses = useCourses();
  const p = progressOf(s, me.id);
  const path = p.roadmap.map((id) => courses.find((c) => c.id === id)).filter((c): c is (typeof courses)[number] => !!c);
  if (!path.length) return null;
  const total = path.reduce((n, c) => n + c.lessons.length, 0);
  const done = path.reduce((n, c) => n + c.lessons.filter((l) => p.doneLessons.includes(l.id)).length, 0);
  return (
    <div className="mx-3 mb-3 rounded-2xl border border-line bg-tint p-4">
      <p className="text-caption font-semibold text-muted">{lang === "my" ? "သင့်လမ်းကြောင်း" : "Your path"}</p>
      <p className="mt-1 text-body-sm">
        <span className="font-heading text-h4 font-semibold tabular-nums">{done}</span>
        <span className="text-muted">
          {" "}
          / {total} {lang === "my" ? "သင်ခန်းစာ" : "lessons"}
        </span>
      </p>
      <div className="mt-3 flex gap-1" aria-hidden>
        {path.map((c) => {
          const n = c.lessons.filter((l) => p.doneLessons.includes(l.id)).length;
          return (
            <span key={c.id} className="h-1.5 overflow-hidden rounded-full bg-line" style={{ flex: c.lessons.length }}>
              <span className="block h-full rounded-full bg-burgundy" style={{ width: `${(n / c.lessons.length) * 100}%` }} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({
  s,
  me,
  nav,
  pathname,
  lang,
  onNavigate,
  onReset,
}: {
  s: State;
  me: User;
  nav: NavGroup[];
  pathname: string;
  lang: Lang;
  onNavigate?: () => void;
  onReset: () => void;
}) {
  const company = s.companies.find((c) => c.id === me.companyId);
  const profileHref = me.role === "company" && company?.status === "verified" ? "/company/account" : `/profile/${me.id}`;
  const onProfile = pathname === `/profile/${me.id}`;
  const roleLabel = me.role === "learner" ? (lang === "my" ? "သင်ယူသူ" : "Learner") : company?.name;
  return (
    <>
      <Link href={homePath(s)} onClick={onNavigate} className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <Image src="/logo/the-citadel-icon-primary.png" alt="" width={36} height={36} priority className="size-9" />
        <span className="font-heading text-[19px] font-bold tracking-[-0.04em]">the citadel</span>
      </Link>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 pt-2 pb-4">
        {nav.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 pb-1.5 text-caption font-semibold text-subtle">{group.label}</p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors pointer-coarse:min-h-11 ${active ? "bg-burgundy-tint text-burgundy" : "text-muted hover:bg-surface hover:text-ink"}`}
                    >
                      <Icon name={item.icon} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {me.role === "learner" && <PathMeter s={s} me={me} lang={lang} />}
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2">
          <Link
            href={profileHref}
            onClick={onNavigate}
            aria-current={onProfile ? "page" : undefined}
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition-colors ${onProfile ? "bg-burgundy-tint" : "hover:bg-surface"}`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-burgundy text-caption font-semibold text-white">{initials(me.name)}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{me.name}</span>
              <span className="block truncate text-caption text-muted">{roleLabel}</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={lang === "my" ? "ထွက်ရန်" : "Log out"}
            title={lang === "my" ? "ထွက်ရန်" : "Log out"}
            onClick={() => setState((st) => ({ ...st, sessionUserId: null }))}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface hover:text-ink pointer-coarse:size-11"
          >
            <Icon name="logout" />
          </button>
        </div>
        {isPitchUser(me.id) && (
          <button type="button" onClick={onReset} className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-caption text-subtle hover:bg-surface hover:text-ink">
            {lang === "my" ? "Demo ဒေတာ ပြန်စရန်" : "Reset demo data"}
          </button>
        )}
      </div>
    </>
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
  const [drawer, setDrawer] = useState({ pathname, open: false });
  const [confirmReset, setConfirmReset] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerOpen = drawer.pathname === pathname && drawer.open;
  const setDrawerOpen = (open: boolean) => setDrawer({ pathname, open });

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // The phone drawer behaves like a dialog: Escape closes it and focus moves into it.
  useEffect(() => {
    if (!drawerOpen) return;
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer((d) => ({ ...d, open: false }));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  if (!s || redirect) return loading;

  // The landing and entry flows own their focused headers and page layouts.
  if (["/", "/login", "/signup", "/onboarding"].includes(pathname)) return <>{children}</>;

  const me = s.users.find((u) => u.id === s.sessionUserId);
  const nav = navFor(s, lang);
  const t = copy[lang];
  const current = nav.flatMap((g) => g.items.map((item) => ({ group: g.label, item }))).find(({ item }) => isActive(pathname, item));
  const footer = (
    <footer className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-5 text-caption text-muted md:px-8 lg:px-10">
      <p>{t.rights}</p>
      <nav aria-label={t.trustHelp} className="flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/legal#privacy" className="hover:text-ink">
          {t.privacy}
        </Link>
        <Link href="/legal#terms" className="hover:text-ink">
          {t.terms}
        </Link>
        <Link href="/legal#safety" className="hover:text-ink">
          {t.safetyTitle}
        </Link>
      </nav>
    </footer>
  );

  // Signed-out visitors (for example on the legal page) get a plain header, not the app sidebar.
  if (!me)
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 md:px-8 lg:px-10">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo/the-citadel-icon-primary.png" alt="" width={36} height={36} priority className="size-9" />
              <span className="font-heading text-[19px] font-bold tracking-[-0.04em]">the citadel</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitch lang={lang} label={t.language} />
              <Link href="/login" className="inline-flex h-10 items-center rounded-xl border border-line bg-white px-4 text-sm font-semibold hover:bg-surface">
                {t.logIn}
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-8 lg:px-10">{children}</main>
        {footer}
      </div>
    );

  const sidebar = (onNavigate?: () => void) => (
    <SidebarContent
      s={s}
      me={me}
      nav={nav}
      pathname={pathname}
      lang={lang}
      onNavigate={onNavigate}
      onReset={() => {
        onNavigate?.();
        setConfirmReset(true);
      }}
    />
  );

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-white md:flex">{sidebar()}</aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label={lang === "my" ? "မီနူးပိတ်ရန်" : "Close menu"} className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div ref={drawerRef} id="app-drawer" className="absolute inset-y-0 left-0 flex w-[min(84vw,300px)] flex-col bg-white shadow-xl">
            {sidebar(() => setDrawerOpen(false))}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 md:px-8 lg:px-10">
            <button
              type="button"
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white text-ink hover:bg-surface md:hidden"
              aria-expanded={drawerOpen}
              aria-controls="app-drawer"
              aria-label={lang === "my" ? "မီနူး" : "Menu"}
              onClick={() => setDrawerOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <Link href={homePath(s)} className="shrink-0 md:hidden" aria-label="The Citadel home">
              <Image src="/logo/the-citadel-icon-primary.png" alt="" width={32} height={32} className="size-8" />
            </Link>
            {current && (
              <p className="min-w-0 truncate text-sm">
                <span className="hidden text-muted sm:inline">{current.group} / </span>
                <span className="font-semibold">{current.item.label}</span>
              </p>
            )}
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {me && nav.length > 0 && <Notifications s={s} userId={me.id} />}
              <LanguageSwitch lang={lang} label={t.language} />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-8 lg:px-10">{children}</main>
        {footer}
      </div>

      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={resetDemo} title="Reset the demo?" confirmLabel="Reset demo" danger>
        <p>This clears every account, course progress, challenge, post and rating made in this browser, and logs you out. It can&apos;t be undone.</p>
      </ConfirmDialog>
    </div>
  );
}
