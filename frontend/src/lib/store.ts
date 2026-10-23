"use client";

import { useSyncExternalStore } from "react";
import { defaultLang } from "./i18n";
import { emptyProgress, seed } from "./seed";
import type { Lang, Progress, State } from "./types";

const KEY = "citadel-demo-v3";
let state: State | null = null;
const listeners = new Set<() => void>();

function load(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = withSeedRatings(JSON.parse(raw) as State);
    else {
      state = structuredClone(seed);
      state.lang = defaultLang(navigator.languages, Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  } catch {
    state = structuredClone(seed);
  }
  return state;
}

/** Demo data saved before the sample ratings existed gets them too, skipping any pair someone has already rated. */
function withSeedRatings(s: State): State {
  const missing = seed.ratings.filter((r) => !s.ratings.some((x) => x.id === r.id || (x.fromId === r.fromId && x.toId === r.toId)));
  return missing.length ? { ...s, ratings: [...s.ratings, ...missing] } : s;
}

function emit() {
  listeners.forEach((l) => l());
}

export function setState(fn: (s: State) => State) {
  state = fn(load());
  localStorage.setItem(KEY, JSON.stringify(state));
  emit();
}

export function resetDemo() {
  localStorage.removeItem(KEY);
  state = structuredClone(seed);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    state = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Null until the browser store is loaded (server render and first hydration pass). */
export function useStore(): State | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

/** For components rendered inside AppShell, which waits for the store. */
export function useData() {
  const s = useStore();
  if (!s) throw new Error("useData used outside AppShell");
  const me = s.users.find((u) => u.id === s.sessionUserId);
  const company = s.companies.find((c) => c.id === me?.companyId);
  const lang: Lang = s.lang === "my" ? "my" : "en";
  return { s, me: me!, company, lang };
}

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
export const today = () => new Date().toISOString().slice(0, 10);

export function updateProgress(userId: string, fn: (p: Progress) => Progress) {
  setState((s) => ({ ...s, progress: { ...s.progress, [userId]: fn(s.progress[userId] ?? emptyProgress) } }));
}

export const progressOf = (s: State, userId: string) => s.progress[userId] ?? emptyProgress;
export const nameOf = (s: State, userId: string) => s.users.find((u) => u.id === userId)?.name ?? "Unknown";
