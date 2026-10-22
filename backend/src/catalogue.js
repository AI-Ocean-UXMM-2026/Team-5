import { pool } from "./db.js";
import { assertRole, fail } from "./http.js";
import { accessFlags } from "./learn.js";
import { lessonOpen, questionSelect, youtubeVideoId } from "./rules.js";

function readCourse(body, partial) {
  const out = {};
  const need = (key) => !partial || body[key] !== undefined;
  if (need("title")) {
    const title = String(body.title || "").trim();
    if (!title) throw fail(400, "Title is required.");
    out.title = title;
  }
  if (need("skill")) {
    const skill = String(body.skill || "").trim();
    if (!skill) throw fail(400, "Skill is required.");
    out.skill = skill;
  }
  if (need("level")) {
    const level = String(body.level || "").trim();
    if (!level) throw fail(400, "Level is required.");
    out.level = level;
  }
  if (need("hours")) {
    if (!Number.isInteger(body.hours) || body.hours <= 0) throw fail(400, "Hours must be a positive integer.");
    out.hours = body.hours;
  }
  if (need("priceMmk")) {
    if (!Number.isInteger(body.priceMmk) || body.priceMmk < 0) throw fail(400, "Price must be a whole number of MMK.");
    out.price_mmk = body.priceMmk;
  }
  if (need("description")) out.description = String(body.description || "");
  if (partial && !Object.keys(out).length) throw fail(400, "Nothing to update.");
  return out;
}

function readQuestion(body) {
  const prompt = String(body.prompt || "").trim();
  if (!prompt) throw fail(400, "Prompt is required.");
  if (!Array.isArray(body.options) || body.options.length < 2 || body.options.some((item) => typeof item !== "string" || !item.trim())) {
    throw fail(400, "A question needs at least two options.");
  }
  const options = body.options.map((item) => item.trim());
  if (!Number.isInteger(body.answerIndex) || body.answerIndex < 0 || body.answerIndex >= options.length) {
    throw fail(400, "Answer index is invalid.");
  }
  return { prompt, options, answerIndex: body.answerIndex };
}

function readLesson(body) {
  const title = String(body.title || "").trim();
  const summary = String(body.summary || "").trim();
  if (!title) throw fail(400, "Title is required.");
  if (!Array.isArray(body.body) || body.body.some((item) => typeof item !== "string") || !body.body.some((item) => item.trim())) {
    throw fail(400, "Lesson body is required.");
  }
  if (!summary) throw fail(400, "Summary is required.");
  const keyPoints = Array.isArray(body.keyPoints) ? body.keyPoints : [];
  if (keyPoints.some((item) => typeof item !== "string")) throw fail(400, "Key points are invalid.");
  const videoId = youtubeVideoId(body.videoUrl ?? body.videoId ?? "");
  if (videoId === undefined) throw fail(400, "Use a YouTube video link.");
  return { title, body: body.body.map((item) => item.trim()), keyPoints: keyPoints.map((item) => item.trim()), summary, videoId };
}

function questionJson(row, owns) {
  const question = { id: row.id, position: row.position, prompt: row.prompt, options: row.options };
  if (owns) question.answerIndex = row.answer_index;
  return question;
}

async function ownedCourse(courseId, teacherId) {
  const { rows } = await pool.query("SELECT id FROM courses WHERE id = $1 AND teacher_id = $2", [courseId, teacherId]);
  if (!rows[0]) throw fail(404, "Course was not found.");
}

export async function listCourses({ res, user, send }) {
  const teacherId = user?.role === "teacher" ? user.id : null;
  const { rows } = await pool.query(
    `SELECT id, title, skill, level, hours, price_mmk, description, published
     FROM courses
     WHERE published OR ($1::uuid IS NOT NULL AND teacher_id = $1::uuid)
     ORDER BY created_at DESC`,
    [teacherId],
  );
  send(res, 200, {
    courses: rows.map((row) => ({
      id: row.id,
      title: row.title,
      skill: row.skill,
      level: row.level,
      hours: row.hours,
      priceMmk: row.price_mmk,
      description: row.description,
      published: row.published,
    })),
  });
}

export async function createCourse({ res, user, body, send }) {
  assertRole(user, ["teacher"]);
  const fields = readCourse(body, false);
  const { rows } = await pool.query(
    `INSERT INTO courses (teacher_id, title, skill, level, hours, price_mmk, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [user.id, fields.title, fields.skill, fields.level, fields.hours, fields.price_mmk, fields.description],
  );
  send(res, 201, { id: rows[0].id });
}

export async function getCourse({ res, user, params, send }) {
  const { rows } = await pool.query(
    `SELECT id, teacher_id, title, skill, level, hours, price_mmk, description, published
     FROM courses WHERE id = $1`,
    [params.id],
  );
  const course = rows[0];
  const owns = user?.role === "teacher" && user?.id === course?.teacher_id;
  if (!course || (!course.published && !owns)) throw fail(404, "Course was not found.");
  const lessons = await pool.query(
    `SELECT id, position, title, body, key_points, summary, video_id FROM lessons WHERE course_id = $1 ORDER BY position`,
    [course.id],
  );
  const lessonIds = lessons.rows.map((lesson) => lesson.id);
  const quiz = lessonIds.length
    ? await pool.query(
        `SELECT ${questionSelect(owns)}, lesson_id FROM questions
         WHERE kind = 'quiz' AND lesson_id = ANY($1::uuid[]) ORDER BY position`,
        [lessonIds],
      )
    : { rows: [] };
  const test = await pool.query(
    `SELECT ${questionSelect(owns)} FROM questions WHERE kind = 'test' AND course_id = $1 ORDER BY position`,
    [course.id],
  );
  const flags = await accessFlags(user?.role === "learner" ? user.id : null, course.id);
  if (owns) flags.entitled = true;
  const access = { priceMmk: course.price_mmk, lessonCount: lessons.rows.length, entitled: flags.entitled, certified: flags.certified };
  const byLesson = new Map();
  for (const row of quiz.rows) {
    if (!byLesson.has(row.lesson_id)) byLesson.set(row.lesson_id, []);
    byLesson.get(row.lesson_id).push(questionJson(row, owns));
  }
  send(res, 200, {
    course: {
      id: course.id,
      title: course.title,
      skill: course.skill,
      level: course.level,
      hours: course.hours,
      priceMmk: course.price_mmk,
      description: course.description,
      published: course.published,
      lessons: lessons.rows.map((lesson, index) => ({
        id: lesson.id,
        position: lesson.position,
        title: lesson.title,
        body: lesson.body,
        keyPoints: lesson.key_points,
        summary: lesson.summary,
        videoId: lessonOpen(access, index) ? lesson.video_id : null,
        open: lessonOpen(access, index),
        completed: flags.done.includes(lesson.id),
        questions: byLesson.get(lesson.id) || [],
      })),
      test: { questions: test.rows.map((row) => questionJson(row, owns)) },
    },
  });
}

export async function patchCourse({ res, user, body, params, send }) {
  assertRole(user, ["teacher"]);
  const fields = readCourse(body, true);
  const columns = Object.keys(fields);
  const values = Object.values(fields);
  const sets = columns.map((column, index) => `${column} = $${index + 1}`);
  values.push(params.id, user.id);
  const { rowCount } = await pool.query(
    `UPDATE courses SET ${sets.join(", ")} WHERE id = $${columns.length + 1} AND teacher_id = $${columns.length + 2}`,
    values,
  );
  if (!rowCount) throw fail(404, "Course was not found.");
  send(res, 200, { ok: true });
}

export async function addLesson({ res, user, body, params, send }) {
  assertRole(user, ["teacher"]);
  await ownedCourse(params.id, user.id);
  const lesson = readLesson(body);
  const { rows } = await pool.query(
    `INSERT INTO lessons (course_id, position, title, body, key_points, summary, video_id)
     VALUES ($1, (SELECT coalesce(max(position), 0) + 1 FROM lessons WHERE course_id = $1), $2, $3, $4, $5, $6)
     RETURNING id, position`,
    [params.id, lesson.title, lesson.body, lesson.keyPoints, lesson.summary, lesson.videoId],
  );
  send(res, 201, rows[0]);
}

export async function patchLesson({ res, user, body, params, send }) {
  assertRole(user, ["teacher"]);
  const lesson = readLesson(body);
  const { rowCount } = await pool.query(
    `UPDATE lessons SET title = $2, body = $3, key_points = $4, summary = $5, video_id = $6
     WHERE id = $1 AND course_id IN (SELECT id FROM courses WHERE teacher_id = $7)`,
    [params.id, lesson.title, lesson.body, lesson.keyPoints, lesson.summary, lesson.videoId, user.id],
  );
  if (!rowCount) throw fail(404, "Lesson was not found.");
  send(res, 200, { ok: true });
}

export async function addQuizQuestion({ res, user, body, params, send }) {
  assertRole(user, ["teacher"]);
  const { rows } = await pool.query(
    `SELECT l.id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE l.id = $1 AND c.teacher_id = $2`,
    [params.id, user.id],
  );
  if (!rows[0]) throw fail(404, "Lesson was not found.");
  const question = readQuestion(body);
  const inserted = await pool.query(
    `INSERT INTO questions (lesson_id, kind, position, prompt, options, answer_index)
     VALUES ($1, 'quiz', (SELECT coalesce(max(position), 0) + 1 FROM questions WHERE lesson_id = $1), $2, $3, $4)
     RETURNING id, position`,
    [params.id, question.prompt, question.options, question.answerIndex],
  );
  send(res, 201, inserted.rows[0]);
}

export async function addTestQuestion({ res, user, body, params, send }) {
  assertRole(user, ["teacher"]);
  await ownedCourse(params.id, user.id);
  const question = readQuestion(body);
  const inserted = await pool.query(
    `INSERT INTO questions (course_id, kind, position, prompt, options, answer_index)
     VALUES ($1, 'test', (SELECT coalesce(max(position), 0) + 1 FROM questions WHERE course_id = $1), $2, $3, $4)
     RETURNING id, position`,
    [params.id, question.prompt, question.options, question.answerIndex],
  );
  send(res, 201, inserted.rows[0]);
}

export async function patchQuestion({ res, user, body, params, send }) {
  assertRole(user, ["teacher"]);
  const question = readQuestion(body);
  const { rowCount } = await pool.query(
    `UPDATE questions SET prompt = $2, options = $3, answer_index = $4
     WHERE id = $1 AND (
       lesson_id IN (SELECT l.id FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.teacher_id = $5)
       OR course_id IN (SELECT id FROM courses WHERE teacher_id = $5)
     )`,
    [params.id, question.prompt, question.options, question.answerIndex, user.id],
  );
  if (!rowCount) throw fail(404, "Question was not found.");
  send(res, 200, { ok: true });
}

export async function publishCourse({ res, user, params, send }) {
  assertRole(user, ["teacher"]);
  const { rowCount } = await pool.query(
    `UPDATE courses SET published = true, published_at = COALESCE(published_at, now()) WHERE id = $1 AND teacher_id = $2`,
    [params.id, user.id],
  );
  if (!rowCount) throw fail(404, "Course was not found.");
  send(res, 200, { ok: true });
}
