import { createHash } from "node:crypto";
import { pool } from "./db.js";
import { fail } from "./http.js";

// Retrieval for the AI roadmap: find the published courses closest to the learner's goal,
// then let the model order only those. Pure helpers come first so they can be tested offline.

export const EMBEDDING_MODEL = "text-embedding-3-small";
const VECTOR_WEIGHT = 0.75;
const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
const STOP = new Set(["and", "the", "for", "with", "you", "your", "how", "what", "into", "from", "that", "this", "are", "can", "use", "basics", "course", "learn"]);

/** The text we embed and keyword-match for one course. */
export function courseDocument(course) {
  const lessons = (course.lessons || []).map((l) => `${l.title}: ${(l.keyPoints || []).join("; ")}`);
  return [`${course.title}.`, `Skill: ${course.skill}.`, `Level: ${course.level}.`, course.description, ...lessons].filter(Boolean).join("\n");
}

export const hashText = (text) => createHash("sha256").update(text).digest("hex");

export function tokens(text) {
  return [...new Set(String(text).toLowerCase().split(/[^a-z0-9+#]+/).filter((w) => w.length > 2 && !STOP.has(w)))];
}

export function cosine(a, b) {
  if (!a?.length || a.length !== b?.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** Share of query words found in the course; title and skill words count double. */
export function keywordScore(queryWords, course) {
  if (!queryWords.length) return 0;
  const strong = new Set(tokens(`${course.title} ${course.skill}`));
  const all = new Set(tokens(courseDocument(course)));
  let hits = 0;
  for (const word of queryWords) hits += strong.has(word) ? 2 : all.has(word) ? 1 : 0;
  return Math.min(1, hits / (queryWords.length * 2));
}

/** Score every course for the query. Uses embeddings when both sides have one, keywords always. */
export function rankCourses(courses, query) {
  const words = tokens(query.text);
  return courses
    .map((course) => {
      const keyword = keywordScore(words, course);
      const vector = query.embedding && course.embedding ? cosine(query.embedding, course.embedding) : null;
      const score = vector === null ? keyword : VECTOR_WEIGHT * vector + (1 - VECTOR_WEIGHT) * keyword;
      return { course, score, vector, keyword };
    })
    .sort((a, b) => b.score - a.score);
}

/** Top matches the model may choose from. Skips skills the learner is already comfortable with; beginners always get the starter course. */
export function pickCandidates(ranked, { comfortable = [], beginner = false, limit = 8, starterSlug = "starter" } = {}) {
  const known = comfortable.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  const coversKnown = (course) => known.some((skill) => course.skill.toLowerCase().includes(skill) || skill.includes(course.skill.toLowerCase()));
  const picked = ranked.filter((r) => !coversKnown(r.course)).slice(0, limit);
  if (beginner && !picked.some((r) => r.course.slug === starterSlug)) {
    const starter = ranked.find((r) => r.course.slug === starterSlug);
    if (starter) picked.splice(Math.max(0, limit - 1), 1, starter);
  }
  return picked;
}

const levelRank = (course) => LEVEL_ORDER[String(course.level).toLowerCase()] ?? 1;

/** Roadmap without the model: the best matches, ordered foundation-first. */
export function searchRoadmap(candidates, hoursPerWeek, size = 4) {
  const chosen = candidates.slice(0, size).sort((a, b) => levelRank(a.course) - levelRank(b.course) || (a.course.slug === "starter" ? -1 : 0));
  const hours = chosen.reduce((sum, r) => sum + r.course.hours, 0);
  const weeks = Math.max(1, Math.ceil(hours / Math.max(1, hoursPerWeek)));
  return {
    roadmap: chosen.map((r) => r.course.slug),
    roadmapNote: `These courses match your goal best. Together they take about ${hours} hours, roughly ${weeks} week${weeks > 1 ? "s" : ""} at ${hoursPerWeek} hours a week.`,
    reasons: Object.fromEntries(chosen.map((r) => [r.course.slug, `Matches your goal: ${r.course.skill}.`])),
  };
}

/** Checks the model's answer: only candidate slugs, no repeats, a note, and one short reason per course. */
export function readRagRoadmap(data, candidates) {
  const allowed = new Set(candidates.map((r) => r.course.slug));
  if (!data || !Array.isArray(data.steps) || !data.steps.length || data.steps.length > 6) return null;
  const roadmap = [];
  const reasons = {};
  for (const step of data.steps) {
    const slug = typeof step?.courseId === "string" ? step.courseId : "";
    if (!allowed.has(slug) || roadmap.includes(slug)) return null;
    roadmap.push(slug);
    reasons[slug] = String(step.reason ?? "").trim().slice(0, 200);
  }
  const note = String(data.note ?? "").trim().slice(0, 600);
  if (!note) return null;
  // The career starter is the foundation, so it always comes first when it is picked.
  const starter = roadmap.indexOf("starter");
  if (starter > 0) roadmap.unshift(...roadmap.splice(starter, 1));
  return { roadmap, roadmapNote: note, reasons };
}

// ---- Database and OpenAI ----

export async function loadCatalogue() {
  const { rows } = await pool.query(
    `SELECT c.id, c.slug, c.title, c.skill, c.level, c.hours, c.price_mmk, c.description,
            coalesce(json_agg(json_build_object('title', l.title, 'keyPoints', l.key_points) ORDER BY l.position)
                     FILTER (WHERE l.id IS NOT NULL), '[]') AS lessons,
            e.embedding, e.content_hash, e.model
     FROM courses c
     LEFT JOIN lessons l ON l.course_id = c.id
     LEFT JOIN course_embeddings e ON e.course_id = c.id
     WHERE c.published AND c.slug IS NOT NULL
     GROUP BY c.id, e.embedding, e.content_hash, e.model`,
  );
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    skill: row.skill,
    level: row.level,
    hours: row.hours,
    priceMmk: row.price_mmk,
    description: row.description,
    lessons: row.lessons,
    embedding: row.model === EMBEDDING_MODEL ? row.embedding : null,
    contentHash: row.content_hash,
  }));
}

export async function embed(texts) {
  if (!process.env.OPENAI_API_KEY) throw fail(503, "AI is not configured.");
  let response;
  try {
    response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
    });
  } catch {
    throw fail(502, "AI did not answer.");
  }
  if (!response.ok) throw fail(502, "AI did not answer.");
  const payload = await response.json();
  return payload.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
}

/** Embeds courses that are new or whose text changed. Returns how many were updated. */
export async function syncEmbeddings(courses) {
  const stale = courses.filter((c) => !c.embedding || c.contentHash !== hashText(courseDocument(c)));
  if (!stale.length || !process.env.OPENAI_API_KEY) return 0;
  const vectors = await embed(stale.map(courseDocument));
  for (const [index, course] of stale.entries()) {
    const hash = hashText(courseDocument(course));
    await pool.query(
      `INSERT INTO course_embeddings (course_id, model, content_hash, embedding, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (course_id) DO UPDATE SET model = $2, content_hash = $3, embedding = $4, updated_at = now()`,
      [course.id, EMBEDDING_MODEL, hash, vectors[index]],
    );
    course.embedding = vectors[index];
    course.contentHash = hash;
  }
  return stale.length;
}
