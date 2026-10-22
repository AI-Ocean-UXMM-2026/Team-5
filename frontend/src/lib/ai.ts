import { rubricMarks } from "./rules.ts";
import { courses } from "./seed.ts";
import type { Lesson } from "./types.ts";

// shortcut: canned, rule-based "AI" for the demo; replace these functions with real model calls when the backend exists.
const wait = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 800));

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

const goalNote: Record<string, string> = {
  backend: " This demo has no backend course yet, so frontend basics stands in until it does.",
  uiux: " This demo has no UI/UX course yet, so frontend basics stands in until it does.",
  data: " This demo has no data course yet, so manual QA stands in until it does.",
  fullstack: " Full-stack in this demo is the career starter, frontend basics, then manual QA.",
};

export function makeRoadmap(goal: string, currentSkills: string, hoursPerWeek: number) {
  const roadmap = coursesForGoal(goal);
  const hours = roadmap.reduce((sum, id) => sum + (courses.find((c) => c.id === id)?.hours ?? 0), 0);
  const weeks = Math.max(1, Math.ceil(hours / Math.max(1, hoursPerWeek)));
  const skip = /html|css/i.test(currentSkills) && roadmap.includes("frontend") ? " You already know some HTML or CSS, so the first frontend lessons should go quickly." : "";
  return wait({
    roadmap,
    roadmapNote: `About ${hours} hours of learning, roughly ${weeks} week${weeks > 1 ? "s" : ""} at ${hoursPerWeek} hours a week. Start with the career starter so you know how IT teams work.${skip}${goalNote[goal] ?? ""}`,
  });
}

export const summarizeLesson = (lesson: Lesson) => wait({ keyPoints: lesson.keyPoints, summary: lesson.summary });

const covers = (answer: string, point: string) => rubricMarks(answer, [point])[0]?.met;

export function challengeFeedback(answer: string, link: string, rubric: string[]) {
  const feedback = rubric.map((p) => (covers(answer, p) ? `Covers "${p}".` : `Say more about "${p}".`));
  if (answer.trim().length < 150) feedback.push("Your answer is short. Explain why you made each choice.");
  if (!link.trim()) feedback.push("Add a link to your work so the company can check it.");
  return wait(feedback);
}

export function scoreSubmission(answer: string, link: string, rubric: string[]) {
  const marks = rubricMarks(answer, rubric);
  const covered = marks.filter((m) => m.met).length;
  const score = Math.round((covered / Math.max(1, rubric.length)) * 70 + Math.min(20, answer.trim().length / 15) + (link.trim() ? 10 : 0));
  const first = answer.trim().split(/(?<=\.)\s/)[0].slice(0, 140);
  return wait({ aiScore: Math.min(100, score), aiSummary: `${first} Covers ${covered} of ${rubric.length} rubric points.`, aiRubric: marks });
}

const drafts: Record<string, { title: string; task: string; rubric: string[] }> = {
  frontend: {
    title: "Build a simple product page",
    task: "Build a one-page product listing with HTML, CSS and a little JavaScript: a header, three product cards and an Add to cart button that updates a counter. It must work on a phone and a laptop. Share a link and explain your choices.",
    rubric: ["Semantic HTML", "Responsive layout", "Working JavaScript counter", "Clear explanation"],
  },
  qa: {
    title: "Test a login form",
    task: "Write five test cases for a login form with email and password fields, run them on the demo page and report any bugs you find.",
    rubric: ["Clear test steps", "Expected results", "Bug reports with severity"],
  },
  starter: {
    title: "Plan a small team sprint",
    task: "Our team has five tasks for a one-week sprint. Put them in order, explain who should review each one and why.",
    rubric: ["Sensible order", "Review plan", "Clear reasons"],
  },
};

export const draftChallenge = (courseId: string) => wait(drafts[courseId] ?? drafts.starter);
