"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { notificationsFor } from "@/lib/notifications";
import { setState } from "@/lib/store";
import type { State } from "@/lib/types";

export function Notifications({ s, userId }: { s: State; userId: string }) {
  // Remember the page the box was opened on, so it closes when the page changes.
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const box = useRef<HTMLDivElement>(null);
  const list = notificationsFor(s, userId);
  const seen = s.seenNotifications?.[userId] ?? [];
  const unread = list.filter((n) => !seen.includes(n.id)).length;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpenOn(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markSeen = (ids: string[]) =>
    setState((st) => {
      const mine = st.seenNotifications?.[userId] ?? [];
      return { ...st, seenNotifications: { ...st.seenNotifications, [userId]: [...new Set([...mine, ...ids])] } };
    });

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-controls="notifications"
        onClick={() => setOpenOn(open ? null : pathname)}
        className={`relative grid size-8 shrink-0 place-items-center rounded-lg border pointer-coarse:size-10 ${open ? "border-burgundy bg-burgundy-tint text-burgundy" : "border-line bg-white text-ink hover:bg-surface"}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        {unread > 0 && (
          <span aria-hidden className="absolute -top-1.5 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-burgundy px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          id="notifications"
          className="fixed inset-x-4 top-18 z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-lg md:absolute md:inset-x-auto md:top-12 md:right-0 md:w-96"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="font-heading text-body font-semibold">Notifications</h2>
            {unread > 0 && (
              <button type="button" onClick={() => markSeen(list.map((n) => n.id))} className="rounded-lg px-2 py-1 text-body-sm font-medium text-burgundy hover:bg-burgundy-tint">
                Mark all as read
              </button>
            )}
          </div>
          {list.length ? (
            <ul className="max-h-96 overflow-y-auto">
              {list.map((n) => {
                const isNew = !seen.includes(n.id);
                return (
                  <li key={n.id} className="border-b border-line last:border-0">
                    <Link
                      href={n.href}
                      onClick={() => {
                        markSeen([n.id]);
                        setOpenOn(null);
                      }}
                      className={`flex gap-3 px-4 py-3 hover:bg-surface ${isNew ? "bg-burgundy-tint/40" : ""}`}
                    >
                      <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-full ${isNew ? "bg-burgundy" : "bg-transparent"}`} />
                      <span className="min-w-0">
                        <span className="block font-medium text-ink">{n.title}</span>
                        <span className="block text-body-sm text-muted">{n.body}</span>
                        <span className="mt-1 block text-caption text-subtle">{n.at}</span>
                      </span>
                      {isNew && <span className="sr-only">(new)</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-body-sm text-muted">No notifications yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
