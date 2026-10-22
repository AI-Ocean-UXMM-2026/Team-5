import assert from "node:assert/strict";
import test from "node:test";
import { canSendOffer, gradeAnswers, hasContactDetails, lessonOpen, previewLessonCount, questionSelect, testScore, trackOpen, youtubeVideoId } from "./rules.js";

const questions = [
  { answer_index: 1, options: ["a", "b"] },
  { answer_index: 0, options: ["c", "d"] },
];

test("a quiz passes only when every answer is correct", () => {
  const passed = gradeAnswers(questions, [1, 0]);
  assert.equal(passed.perfect, true);
  assert.equal(passed.correct, 2);
  const failed = gradeAnswers(questions, [1, 1]);
  assert.equal(failed.perfect, false);
  assert.deepEqual(failed.results[1], { correct: false, answerIndex: 0 });
  assert.equal(gradeAnswers(questions, [1]), null);
});

test("a certificate requires a score of at least 70", () => {
  assert.deepEqual(testScore(7, 10), { score: 70, passed: true });
  assert.equal(testScore(2, 3).passed, false);
  assert.equal(testScore(69, 100).passed, false);
  assert.equal(testScore(0, 0), null);
});

test("the first ceil(25%) of a paid course stays open", () => {
  assert.equal(previewLessonCount(3, 0), 3);
  assert.equal(previewLessonCount(3, 45000), 1);
  assert.equal(previewLessonCount(5, 30000), 2);
  const locked = { priceMmk: 45000, lessonCount: 4, entitled: false, certified: false };
  assert.equal(lessonOpen(locked, 0), true);
  assert.equal(lessonOpen(locked, 1), false);
  assert.equal(trackOpen(locked), false);
  assert.equal(lessonOpen({ ...locked, entitled: true }, 3), true);
  assert.equal(lessonOpen({ ...locked, certified: true }, 3), true);
  assert.equal(trackOpen({ priceMmk: 0, entitled: false, certified: false }), true);
});

test("an offer requires a scheduled interview", () => {
  assert.equal(canSendOffer("scheduled"), true);
  assert.equal(canSendOffer("submitted"), false);
  assert.equal(canSendOffer("offered"), false);
  assert.equal(canSendOffer(undefined), false);
});

test("posts cannot carry a phone number or email", () => {
  assert.equal(hasContactDetails("write me at aye@example.com"), true);
  assert.equal(hasContactDetails("call 09 123 456 789"), true);
  assert.equal(hasContactDetails("lesson 3 is about css grids"), false);
});

test("a lesson video accepts a YouTube link or id", () => {
  assert.equal(youtubeVideoId(""), null);
  assert.equal(youtubeVideoId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId("https://vimeo.com/123"), undefined);
});

test("learner course reads leave the answer key out", () => {
  assert.doesNotMatch(questionSelect(false), /answer_index/);
  assert.match(questionSelect(true), /answer_index/);
});
