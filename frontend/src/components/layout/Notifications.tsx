"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { notificationsFor, type Notification } from "@/lib/notifications";
import { setState, today } from "@/lib/store";
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
  const [toast, setToast] = useState<Notification | null>(null);
  const known = useRef<Set<string> | null>(null);
  const ids = list.map((n) => n.id).join("|");

  // A notification that arrives while the app is open also pops up, so events like an approval are hard to miss.
  // Ones that already existed when the page loaded only show in the list.
  useEffect(() => {
    const current = new Set(ids ? ids.split("|") : []);
    const before = known.current;
    known.current = current;
    if (!before) return;
    const fresh = list.find((n) => !before.has(n.id) && !seen.includes(n.id));
    if (!fresh) return;
    const show = setTimeout(() => setToast(fresh), 0);
    const hide = setTimeout(() => setToast((t) => (t?.id === fresh.id ? null : t)), 10000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a change in which notifications exist should trigger this
  }, [ids]);

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

  const markSeen = (seenIds: string[]) =>
    setState((st) => {
      const mine = st.seenNotifications?.[userId] ?? [];
      return { ...st, seenNotifications: { ...st.seenNotifications, [userId]: [...new Set([...mine, ...seenIds])] } };
    });
  // Opening a notification applies its stand-in staff decision, then marks it read.
  const openNotification = (n: Notification) => {
    if (n.approve) setState((st) => n.approve!(st, today()));
    markSeen([n.id]);
    setOpenOn(null);
    setToast(null);
  };

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
                      onClick={() => openNotification(n)}
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
      {/* Rendered on <body>: the top bar's backdrop blur would otherwise pin this "fixed" box to the bar instead of the window. */}
      {createPortal(
        <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end md:inset-x-auto md:right-6 md:bottom-6">
          {toast && (
            <div className="pointer-events-auto flex w-full max-w-sm gap-3 rounded-2xl border border-line bg-white p-4 shadow-lg">
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-burgundy-tint text-burgundy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                  <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{toast.title}</p>
                <p className="text-body-sm text-muted">{toast.body}</p>
                <div className="mt-3 flex gap-2">
                  <Link href={toast.href} onClick={() => openNotification(toast)} className="inline-flex h-9 items-center rounded-xl bg-burgundy px-3 text-sm font-semibold text-white hover:bg-burgundy-dark">
                    View
                  </Link>
                  <button type="button" onClick={() => setToast(null)} className="inline-flex h-9 items-center rounded-xl px-3 text-sm font-semibold text-muted hover:bg-surface">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
