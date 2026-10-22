import { courses } from "./seed.ts";
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

export const goals = [
  { id: "frontend", label: "Frontend Developer" },
  { id: "backend", label: "Backend Developer" },
  { id: "fullstack", label: "Full-Stack Developer" },
  { id: "uiux", label: "UI/UX Designer" },
  { id: "data", label: "Data Analyst" },
  { id: "unsure", label: "Not Sure Yet" },
];

// shortcut: only starter, frontend and qa courses exist; other goals reuse the closest path until those courses are added.
export function coursesForGoal(goal: string) {
  if (goal === "frontend" || goal === "backend" || goal === "uiux") return ["starter", "frontend"];
  if (goal === "data") return ["starter", "qa"];
  return ["starter", "frontend", "qa"];
}

export function makeRoadmap(goal: string, currentSkills: string, hoursPerWeek: number) {
  const label = goals.find((item) => item.id === goal)?.label ?? goal;
  return ask("/ai/roadmap", {
    goal: label,
    currentSkills,
    hoursPerWeek,
    courses: courses.map((course) => ({
      id: course.id,
      title: course.title,
      skill: course.skill,
      hours: course.hours,
      level: course.level,
      description: course.description,
    })),
  }) as Promise<{ roadmap: string[]; roadmapNote: string }>;
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

export function draftChallenge(courseId: string) {
  const course = courses.find((item) => item.id === courseId) ?? courses[0];
  return ask("/ai/challenge-draft", { title: course.title, skill: course.skill, description: course.description }) as Promise<{
    title: string;
    task: string;
    rubric: string[];
  }>;
}
