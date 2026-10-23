"use client";

import { useSyncExternalStore } from "react";
import { courses as builtIn } from "./seed";
import type { Course } from "./types";

// Courses come from the API (/catalogue). The last copy is kept in the browser so pages show at once,
// and the built-in courses are used when the API has never been reached.
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const KEY = "citadel-catalogue-v1";

type ApiQuestion = { id: string; prompt: string; options: string[] };
type ApiCourse = {
  id: string;
  slug: string;
  title: string;
  skill: string;
  level: string;
  hours: number;
  priceMmk: number;
  description: string;
  lessons: { id: string; position: number; title: string; body: string[]; keyPoints: string[]; summary: string; videoId: string | null; quiz: ApiQuestion[] }[];
  test: ApiQuestion[];
};

export function fromApi(c: ApiCourse): Course {
  return {
    id: c.slug,
    uuid: c.id,
    title: c.title,
    skill: c.skill,
    level: c.level,
    hours: c.hours,
    priceMmk: c.priceMmk,
    description: c.description,
    lessons: c.lessons.map((l) => ({
      id: `${c.slug}-${l.position}`,
      uuid: l.id,
      title: l.title,
      body: l.body,
      keyPoints: l.keyPoints,
      summary: l.summary,
      videoId: l.videoId ?? undefined,
      quiz: l.quiz.map((q) => ({ q: q.prompt, options: q.options })),
    })),
    test: c.test.map((q) => ({ q: q.prompt, options: q.options })),
  };
}

let current: Course[] | null = null;
let requested = false;
const listeners = new Set<() => void>();

function cached(): Course[] {
  if (current) return current;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Course[]) : null;
    current = Array.isArray(parsed) && parsed.length ? parsed : builtIn;
  } catch {
    current = builtIn;
  }
  return current;
}

async function refresh() {
  if (requested) return;
  requested = true;
  try {
    const res = await fetch(`${API}/catalogue`);
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.courses) || !data.courses.length) return;
    current = (data.courses as ApiCourse[]).map(fromApi);
    try {
      localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      // Storage full or blocked: the courses still show for this visit.
    }
    listeners.forEach((l) => l());
  } catch {
    // Offline or API down: keep the saved or built-in courses.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void refresh();
  return () => listeners.delete(listener);
}

/** All published courses. Re-renders when the API copy arrives. */
export function useCourses(): Course[] {
  return useSyncExternalStore(subscribe, cached, () => builtIn);
}

/** The current course list, for helpers outside components. */
export const getCourses = (): Course[] => (typeof window === "undefined" ? builtIn : cached());

export const findCourse = (id: string | undefined) => getCourses().find((c) => c.id === id);
