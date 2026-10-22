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
