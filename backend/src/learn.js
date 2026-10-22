import { pool, withTx } from "./db.js";
import { assertRole, fail } from "./http.js";
import { gradeAnswers, lessonOpen, testScore, trackOpen } from "./rules.js";

export async function accessFlags(userId, courseId) {
  if (!userId) return { entitled: false, certified: false, done: [] };
  const [entitled, certified, done] = await Promise.all([
    pool.query("SELECT 1 FROM entitlements WHERE user_id = $1 AND course_id = $2", [userId, courseId]),
    pool.query("SELECT 1 FROM certificates WHERE learner_id = $1 AND course_id = $2", [userId, courseId]),
    pool.query(
      `SELECT lc.lesson_id FROM lesson_completions lc
       JOIN lessons l ON l.id = lc.lesson_id
       WHERE lc.user_id = $1 AND l.course_id = $2`,
      [userId, courseId],
    ),
  ]);
  return {
    entitled: entitled.rowCount > 0,
    certified: certified.rowCount > 0,
    done: done.rows.map((row) => row.lesson_id),
  };
}

export async function gradeQuiz({ res, user, body, params, send }) {
  assertRole(user, ["learner"]);
  const { rows } = await pool.query(
    `SELECT l.id, l.position, c.id AS course_id, c.price_mmk, c.published,
            (SELECT count(*)::int FROM lessons WHERE course_id = c.id) AS lesson_count
     FROM lessons l JOIN courses c ON c.id = l.course_id
     WHERE l.id = $1`,
    [params.id],
  );
  const lesson = rows[0];
  if (!lesson || !lesson.published) throw fail(404, "Lesson was not found.");
  const flags = await accessFlags(user.id, lesson.course_id);
  const access = { priceMmk: lesson.price_mmk, lessonCount: lesson.lesson_count, entitled: flags.entitled, certified: flags.certified };
  if (!lessonOpen(access, lesson.position - 1)) throw fail(403, "This lesson is part of the paid track.");
  const questions = await pool.query(
    `SELECT position, options, answer_index FROM questions WHERE lesson_id = $1 AND kind = 'quiz' ORDER BY position`,
    [lesson.id],
  );
  if (!questions.rows.length) throw fail(400, "This lesson has no quiz.");
  const graded = gradeAnswers(questions.rows, body.answers);
  if (!graded) throw fail(400, "Answer every question.");
  if (graded.perfect) {
    await pool.query("INSERT INTO lesson_completions (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [user.id, lesson.id]);
  }
  send(res, 200, { correct: graded.correct, total: graded.total, passed: graded.perfect, results: graded.results });
}

export async function gradeTest({ res, user, body, params, send }) {
  assertRole(user, ["learner"]);
  const { rows } = await pool.query(
    `SELECT id, price_mmk, published, (SELECT count(*)::int FROM lessons WHERE course_id = courses.id) AS lesson_count
     FROM courses WHERE id = $1`,
    [params.id],
  );
  const course = rows[0];
  if (!course || !course.published) throw fail(404, "Course was not found.");
  const flags = await accessFlags(user.id, course.id);
  const access = { priceMmk: course.price_mmk, lessonCount: course.lesson_count, entitled: flags.entitled, certified: flags.certified };
  if (course.lesson_count === 0 || flags.done.length < course.lesson_count) {
    throw fail(403, "Finish every lesson quiz before you take the test.");
  }
  if (!trackOpen(access)) throw fail(403, "The final test is included with the paid track.");
  const questions = await pool.query(
    `SELECT position, options, answer_index FROM questions WHERE course_id = $1 AND kind = 'test' ORDER BY position`,
    [course.id],
  );
  if (!questions.rows.length) throw fail(400, "This course has no final test.");
  const graded = gradeAnswers(questions.rows, body.answers);
  if (!graded) throw fail(400, "Answer every question.");
  const scored = testScore(graded.correct, graded.total);
  const saved = await withTx(async (client) => {
    const attempt = await client.query(
      `INSERT INTO test_attempts (user_id, course_id, correct_count, question_count, score, passed)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [user.id, course.id, graded.correct, graded.total, scored.score, scored.passed],
    );
    if (!scored.passed) return { certificateId: null };
    const cert = await client.query(
      `INSERT INTO certificates (learner_id, course_id, test_attempt_id, score)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (learner_id, course_id) DO NOTHING
       RETURNING id`,
      [user.id, course.id, attempt.rows[0].id, scored.score],
    );
    if (cert.rows[0]) return { certificateId: cert.rows[0].id };
    const existing = await client.query("SELECT id FROM certificates WHERE learner_id = $1 AND course_id = $2", [user.id, course.id]);
    return { certificateId: existing.rows[0]?.id || null };
  });
  send(res, 200, {
    correct: graded.correct,
    total: graded.total,
    score: scored.score,
    passed: scored.passed,
    certificateId: saved.certificateId,
    results: graded.results,
  });
}
