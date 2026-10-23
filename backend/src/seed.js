import { courses as baseCourses } from "./catalogue-data.js";
import { moreCourses } from "./catalogue-more.js";
import { youtubeVideoId } from "./rules.js";
import { pool, requireDatabaseUrl, withTx } from "./db.js";
import { hashPassword } from "./password.js";

requireDatabaseUrl();

const courses = [...baseCourses, ...moreCourses];

const [name, emailArg, password] = process.argv.slice(2);
const email = String(emailArg || "").trim().toLowerCase();
if (!name?.trim() || !email || !password || password.length < 8) {
  console.error('Usage: npm run seed -- "Teacher name" teacher@citadel.test "password-at-least-8"');
  process.exit(1);
}

const teacherId = await withTx(async (client) => {
  const found = await client.query("SELECT id, role FROM users WHERE email = $1", [email]);
  if (found.rows[0] && found.rows[0].role !== "teacher") {
    throw new Error(`${email} is a ${found.rows[0].role}, not a teacher.`);
  }
  const teacher = found.rows[0]
    ? found.rows[0]
    : (
        await client.query(
          `INSERT INTO users (role, name, email, password_hash) VALUES ('teacher', $1, $2, $3) RETURNING id`,
          [name.trim(), email, hashPassword(password)],
        )
      ).rows[0];

  for (const course of courses) {
    const existing = await client.query("SELECT id FROM courses WHERE teacher_id = $1 AND title = $2", [teacher.id, course.title]);
    if (existing.rows[0]) {
      await client.query("UPDATE courses SET slug = $1 WHERE id = $2 AND slug IS NULL", [course.slug, existing.rows[0].id]);
      console.log(`exists ${course.title} ${existing.rows[0].id}`);
      continue;
    }
    const inserted = await client.query(
      `INSERT INTO courses (teacher_id, slug, title, skill, level, hours, price_mmk, description, published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, now()) RETURNING id`,
      [teacher.id, course.slug, course.title, course.skill, course.level, course.hours, course.priceMmk, course.description],
    );
    const courseId = inserted.rows[0].id;
    for (const [index, lesson] of course.lessons.entries()) {
      const videoId = youtubeVideoId(lesson.videoUrl);
      if (videoId === undefined) throw new Error(`Use a YouTube video link for ${lesson.title}.`);
      const lessonRow = await client.query(
        `INSERT INTO lessons (course_id, position, title, body, key_points, summary, video_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [courseId, index + 1, lesson.title, lesson.body, lesson.keyPoints, lesson.summary, videoId],
      );
      for (const [qIndex, question] of lesson.quiz.entries()) {
        await client.query(
          `INSERT INTO questions (lesson_id, kind, position, prompt, options, answer_index)
           VALUES ($1, 'quiz', $2, $3, $4, $5)`,
          [lessonRow.rows[0].id, qIndex + 1, question.prompt, question.options, question.answer],
        );
      }
    }
    for (const [qIndex, question] of course.test.entries()) {
      await client.query(
        `INSERT INTO questions (course_id, kind, position, prompt, options, answer_index)
         VALUES ($1, 'test', $2, $3, $4, $5)`,
        [courseId, qIndex + 1, question.prompt, question.options, question.answer],
      );
    }
    console.log(`published ${course.title} ${courseId}`);
  }
  return teacher.id;
});

console.log(`teacher ${email} ${teacherId}`);
console.log("Run npm run embed to refresh the AI roadmap search (it also runs on the first roadmap request).");
await pool.end();
