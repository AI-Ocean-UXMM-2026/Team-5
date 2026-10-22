import assert from "node:assert/strict";
import test from "node:test";
import { readDraft, readLessonSummary, readReview, readRoadmap, requireAi } from "./ai.js";

const courses = [
  { id: "starter", title: "Career starter" },
  { id: "frontend", title: "Frontend basics" },
];

test("ai stays off until OPENAI_API_KEY is set", () => {
  const saved = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    assert.throws(() => requireAi(), (error) => error.status === 503);
  } finally {
    if (saved) process.env.OPENAI_API_KEY = saved;
  }
});

test("a roadmap can only use the given courses", () => {
  assert.deepEqual(readRoadmap({ courseIds: ["starter", "frontend"], note: "Start with careers." }, courses), {
    roadmap: ["starter", "frontend"],
    roadmapNote: "Start with careers.",
  });
  assert.equal(readRoadmap({ courseIds: ["starter", "missing"], note: "No." }, courses), null);
  assert.equal(readRoadmap({ courseIds: ["starter", "starter"], note: "No." }, courses), null);
  assert.equal(readRoadmap({ courseIds: [], note: "No." }, courses), null);
});

test("a lesson summary needs a paragraph and at least two points", () => {
  assert.equal(readLessonSummary({ summary: "Teams review work.", keyPoints: ["Sprints", "Reviews"] }).keyPoints.length, 2);
  assert.equal(readLessonSummary({ summary: "Teams review work.", keyPoints: ["Only one"] }), null);
});

test("a challenge review keeps the rubric order and a 0 to 100 score", () => {
  const review = readReview({ feedback: ["Say more."], score: 70, summary: "Partial.", met: [true, false] }, ["Clear", "Tested"]);
  assert.deepEqual(review.aiRubric, [
    { point: "Clear", met: true },
    { point: "Tested", met: false },
  ]);
  assert.equal(readReview({ feedback: ["Say more."], score: 101, summary: "No.", met: [true] }, ["Clear"]), null);
  assert.equal(readReview({ feedback: ["Say more."], score: 70, summary: "No.", met: [true] }, ["Clear", "Tested"]), null);
});

test("a challenge draft needs a task and at least two rubric points", () => {
  assert.equal(readDraft({ title: "Pricing card", task: "Build a card.", rubric: ["HTML", "CSS"] }).title, "Pricing card");
  assert.equal(readDraft({ title: "Pricing card", task: "Build a card.", rubric: ["HTML"] }), null);
});
