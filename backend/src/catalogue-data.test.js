import assert from "node:assert/strict";
import test from "node:test";
import { courses } from "./catalogue-data.js";

test("seed catalogue keeps the locked prices and answer keys in range", () => {
  assert.deepEqual(
    courses.map((course) => course.priceMmk),
    [0, 45000, 30000],
  );
  for (const course of courses) {
    assert.ok(course.lessons.length >= 1);
    assert.ok(course.test.length >= 1);
    const questions = [...course.lessons.flatMap((lesson) => lesson.quiz), ...course.test];
    for (const question of questions) {
      assert.ok(question.options.length >= 2);
      assert.ok(question.answer >= 0 && question.answer < question.options.length);
    }
  }
});

test("every seed course has a unique slug and valid questions", async () => {
  const { moreCourses } = await import("./catalogue-more.js");
  const all = [...courses, ...moreCourses];
  const slugs = all.map((course) => course.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9-]+$/);
  assert.equal(new Set(all.map((course) => course.title)).size, all.length);
  for (const course of all) {
    assert.ok(course.description.length <= 400);
    assert.ok(course.hours > 0 && course.priceMmk >= 0);
    for (const question of [...course.lessons.flatMap((lesson) => lesson.quiz), ...course.test]) {
      assert.ok(question.answer >= 0 && question.answer < question.options.length);
    }
  }
});
