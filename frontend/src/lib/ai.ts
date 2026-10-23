import type { Course, Lesson } from "./types.ts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function ask(path: string, body: unknown) {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("AI did not answer.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "AI did not answer.");
  return data;
}

export type SkillChip = { id: string; en: string; my: string; goalId: string };

export async function loadSkills(): Promise<SkillChip[]> {
  const res = await fetch(`${API}/skills`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data.skills)) throw new Error("Skills could not be loaded.");
  return data.skills;
}

export const goals = [
  { id: "frontend", label: "Frontend Developer" },
  { id: "backend", label: "Backend Developer" },
  { id: "fullstack", label: "Full-Stack Developer" },
  { id: "uiux", label: "UI/UX Designer" },
  { id: "data", label: "Data Analyst" },
  { id: "unsure", label: "Not Sure Yet" },
];

// Used only when the roadmap API can't be reached; callers drop courses that aren't in the catalogue.
export function coursesForGoal(goal: string) {
  if (goal === "frontend") return ["starter", "git", "frontend", "react"];
  if (goal === "backend") return ["starter", "git", "sql", "node-backend"];
  if (goal === "fullstack") return ["starter", "frontend", "sql", "node-backend", "react"];
  if (goal === "uiux") return ["starter", "uiux", "figma", "frontend"];
  if (goal === "data") return ["starter", "spreadsheets", "sql", "python-data"];
  return ["starter", "computer-basics", "frontend", "qa"];
}

/** RAG roadmap: the server searches the published courses and the AI orders the best matches. */
export function makeRoadmap(goal: string, currentSkills: string, hoursPerWeek: number, comfortable: string[]) {
  const label = goals.find((item) => item.id === goal)?.label ?? goal;
  return ask("/ai/roadmap", { goal: label, currentSkills, hoursPerWeek, comfortable }) as Promise<{
    roadmap: string[];
    roadmapNote: string;
    reasons?: Record<string, string>;
  }>;
}

export function courseSuggestion(course: Course, doneLessons: string[], certified: boolean, hoursPerWeek: number) {
  const done = course.lessons.filter((l) => doneLessons.includes(l.id)).length;
  const next = course.lessons.find((l) => !doneLessons.includes(l.id));
  const weeks = Math.max(1, Math.ceil(course.hours / Math.max(1, hoursPerWeek)));
  if (certified) return `You are certified in ${course.skill.toLowerCase()}. Try this course's company challenge next. It can lead to an interview.`;
  if (!next) return "Every lesson is done. Take the final test. You need 70% to get certified and unlock the company challenge.";
  if (!done) return `Start with lesson 1, “${next.title}”. This course is about ${course.hours} hours, roughly ${weeks} week${weeks > 1 ? "s" : ""} at ${hoursPerWeek} hours a week.`;
  return `You finished ${done} of ${course.lessons.length} lessons. Next up: “${next.title}”. Get every quiz answer right to complete it.`;
}

export function summarizeLesson(lesson: Lesson) {
  return ask("/ai/lesson-summary", { title: lesson.title, body: lesson.body }) as Promise<{ summary: string; keyPoints: string[] }>;
}

export function reviewChallenge(answer: string, link: string, rubric: string[], task: string) {
  return ask("/ai/challenge-review", { answer, link, rubric, task }) as Promise<{
    feedback: string[];
    aiScore: number;
    aiSummary: string;
    aiRubric: { point: string; met: boolean }[];
  }>;
}

export function draftChallenge(course: Course) {
  return ask("/ai/challenge-draft", { title: course.title, skill: course.skill, description: course.description }) as Promise<{
    title: string;
    task: string;
    rubric: string[];
  }>;
}
