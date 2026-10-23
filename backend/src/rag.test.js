import assert from "node:assert/strict";
import test from "node:test";
import { cosine, courseDocument, hashText, keywordScore, pickCandidates, rankCourses, readRagRoadmap, searchRoadmap, tokens } from "./rag.js";

const course = (slug, title, skill, level = "Beginner", hours = 6, extra = {}) => ({ slug, title, skill, level, hours, description: "", lessons: [], ...extra });
const catalogue = [
  course("starter", "Career starter: working in IT", "IT careers", "Beginner", 3),
  course("frontend", "Frontend basics: HTML, CSS and JavaScript", "Frontend development", "Beginner", 12),
  course("react", "React fundamentals", "React", "Intermediate", 14),
  course("sql", "Databases and SQL", "Databases", "Beginner", 8),
  course("python-data", "Data analysis with Python", "Data analysis", "Intermediate", 12),
  course("spreadsheets", "Spreadsheets for data", "Excel and Google Sheets", "Beginner", 6),
];

test("the course text includes title, skill, level and lesson points", () => {
  const doc = courseDocument(course("sql", "Databases and SQL", "Databases", "Beginner", 8, { description: "Query data.", lessons: [{ title: "SELECT", keyPoints: ["Filter rows"] }] }));
  for (const part of ["Databases and SQL", "Skill: Databases", "Level: Beginner", "Query data.", "SELECT: Filter rows"]) assert.ok(doc.includes(part), part);
  assert.equal(hashText(doc), hashText(doc));
  assert.notEqual(hashText(doc), hashText(`${doc} `));
});

test("tokens drop short and filler words", () => {
  assert.deepEqual(tokens("Learn the basics of SQL and Python"), ["sql", "python"]);
});

test("cosine similarity", () => {
  assert.equal(cosine([1, 0], [1, 0]), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
  assert.equal(cosine([1, 0], [1, 0, 0]), 0);
  assert.equal(cosine(null, [1]), 0);
});

test("keyword score favours title and skill matches", () => {
  const words = tokens("Data analyst who knows SQL");
  assert.ok(keywordScore(words, catalogue[3]) > keywordScore(words, catalogue[1]));
  assert.equal(keywordScore([], catalogue[0]), 0);
});

test("ranking uses embeddings when there are some, keywords otherwise", () => {
  const byWords = rankCourses(catalogue, { text: "Career goal: Data Analyst. Python and spreadsheets." });
  assert.equal(byWords[0].vector, null);
  assert.ok(["python-data", "spreadsheets"].includes(byWords[0].course.slug));

  const withVectors = catalogue.map((c, i) => ({ ...c, embedding: i === 2 ? [1, 0] : [0, 1] }));
  const byMeaning = rankCourses(withVectors, { text: "unrelated words", embedding: [1, 0] });
  assert.equal(byMeaning[0].course.slug, "react");
});

test("candidates skip skills the learner is comfortable with and keep the starter for beginners", () => {
  const ranked = rankCourses(catalogue, { text: "Career goal: Frontend Developer. React." });
  const picked = pickCandidates(ranked, { comfortable: ["Frontend development"], beginner: true, limit: 3 });
  const slugs = picked.map((r) => r.course.slug);
  assert.ok(!slugs.includes("frontend"));
  assert.ok(slugs.includes("starter"));
  assert.equal(slugs.length, 3);
});

test("the search roadmap orders beginner courses first and estimates time", () => {
  const ranked = rankCourses(catalogue, { text: "Career goal: Data Analyst. Python spreadsheets SQL data." });
  const result = searchRoadmap(pickCandidates(ranked, { limit: 4 }), 5, 3);
  const levels = result.roadmap.map((slug) => catalogue.find((c) => c.slug === slug).level);
  assert.deepEqual([...levels].sort((a, b) => (a === "Beginner" ? -1 : b === "Beginner" ? 1 : 0)), levels);
  assert.match(result.roadmapNote, /hours a week/);
  assert.equal(Object.keys(result.reasons).length, result.roadmap.length);
});

test("the model's roadmap may only use retrieved candidates", () => {
  const candidates = pickCandidates(rankCourses(catalogue, { text: "SQL" }), { limit: 3 });
  const [a, b] = candidates.map((r) => r.course.slug).filter((slug) => slug !== "starter");
  assert.deepEqual(readRagRoadmap({ steps: [{ courseId: a, reason: "Basics." }, { courseId: b, reason: "Next." }], note: "About 3 weeks." }, candidates), {
    roadmap: [a, b],
    roadmapNote: "About 3 weeks.",
    reasons: { [a]: "Basics.", [b]: "Next." },
  });
  assert.equal(readRagRoadmap({ steps: [{ courseId: "made-up", reason: "x" }], note: "x" }, candidates), null);
  assert.equal(readRagRoadmap({ steps: [{ courseId: a, reason: "x" }, { courseId: a, reason: "x" }], note: "x" }, candidates), null);
  assert.equal(readRagRoadmap({ steps: [], note: "x" }, candidates), null);
  assert.equal(readRagRoadmap({ steps: [{ courseId: a, reason: "x" }], note: "" }, candidates), null);
});

test("the starter course moves to the front of the model's roadmap", () => {
  const candidates = rankCourses(catalogue, { text: "anything" });
  const result = readRagRoadmap({ steps: [{ courseId: "sql", reason: "a" }, { courseId: "starter", reason: "b" }], note: "n" }, candidates);
  assert.deepEqual(result.roadmap, ["starter", "sql"]);
});
