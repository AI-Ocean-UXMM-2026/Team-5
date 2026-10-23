"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useLayoutEffect, useRef } from "react";

export type Crumb = { label: string; href?: string; onClick?: () => void };

/** The trail itself. The app shell shows it in the top bar; pages hand it their crumbs through <Breadcrumb>. */
export function CrumbTrail({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`min-w-0 ${className}`}>
      <ol className="flex min-w-0 items-center gap-2 text-body-sm">
        {items.flatMap((item, i) => {
          const last = i === items.length - 1;
          // Phones only have room for the page and the step above it.
          const hideOnPhone = i < items.length - 2 ? "hidden sm:flex" : "flex";
          const crumb = (
            <li key={i} aria-current={last ? "page" : undefined} className={`${hideOnPhone} min-w-0 ${last ? "font-semibold" : "shrink-0"}`}>
              {last ? (
                <span className="truncate">{item.label}</span>
              ) : item.href ? (
                <Link href={item.href} className="truncate text-muted hover:text-burgundy">
                  {item.label}
                </Link>
              ) : (
                <button type="button" onClick={item.onClick} className="truncate text-muted hover:text-burgundy">
                  {item.label}
                </button>
              )}
            </li>
          );
          if (i === 0) return [crumb];
          return [
            <li key={`sep-${i}`} aria-hidden className={`${hideOnPhone} shrink-0 text-subtle`}>
              /
            </li>,
            crumb,
          ];
        })}
      </ol>
    </nav>
  );
}

const CrumbSlot = createContext<((items: Crumb[] | null) => void) | null>(null);

export const CrumbProvider = CrumbSlot.Provider;

/** Sets the page's breadcrumb in the app shell's top bar. Outside the shell it renders in place. */
export function Breadcrumb({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const set = useContext(CrumbSlot);
  const latest = useRef(items);
  useLayoutEffect(() => {
    latest.current = items;
  });
  // Re-send only when the trail itself changes; click handlers always call the page's latest one.
  const key = items.map((item) => `${item.label}|${item.href ?? ""}|${item.onClick ? 1 : 0}`).join("/");
  useEffect(() => {
    if (!set) return;
    set(latest.current.map((item, i) => (item.onClick ? { ...item, onClick: () => latest.current[i]?.onClick?.() } : item)));
    return () => set(null);
  }, [set, key]);
  if (set) return null;
  return <CrumbTrail items={items} className={`mb-4 ${className}`} />;
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="-ml-2 mb-4 inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-ink">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  );
}
