import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateSignup } from "./auth.js";
import { hashPassword, verifyPassword } from "./password.js";

const tables = [
  "users",
  "user_skills",
  "sessions",
  "companies",
  "company_files",
  "courses",
  "lessons",
  "questions",
  "roadmaps",
  "roadmap_steps",
  "lesson_completions",
  "notes",
  "test_attempts",
  "certificates",
  "payments",
  "entitlements",
  "challenges",
  "rubric_points",
  "submissions",
  "interviews",
  "offer_emails",
  "ratings",
  "posts",
  "replies",
  "reports",
  "staff_actions",
];

test("signup accepts a learner and rejects staff and a nameless company", () => {
  assert.equal(validateSignup({ role: "learner", name: "Aye", email: "aye@example.com", password: "long-enough" }), null);
  assert.match(validateSignup({ role: "staff", name: "Ada", email: "ada@example.com", password: "long-enough" }), /teacher/);
  assert.match(validateSignup({ role: "company", name: "Bo", email: "bo@company.com", password: "long-enough" }), /Company name/);
  assert.match(validateSignup({ role: "learner", name: "Aye", email: "aye@example.com", password: "short" }), /8 characters/);
});

test("password hash verifies only the same password", () => {
  const stored = hashPassword("long-enough");
  assert.equal(verifyPassword("long-enough", stored), true);
  assert.equal(verifyPassword("wrong-password", stored), false);
  assert.equal(verifyPassword("long-enough", "plain"), false);
});

test("migration creates every diagram table", () => {
  const sql = readFileSync(new URL("../migrations/001_schema.sql", import.meta.url), "utf8");
  for (const table of tables) assert.match(sql, new RegExp(`CREATE TABLE ${table} \\(`));
  assert.match(sql, /answer_index/);
  assert.doesNotMatch(sql, /revoked/);
});
