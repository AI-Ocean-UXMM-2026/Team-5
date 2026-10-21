import assert from "node:assert/strict";
import { test } from "node:test";
import {
  allLessonsDone,
  canPostAsCompany,
  challengeUnlocked,
  emailMatchesWebsite,
  hasContactDetails,
  testPassed,
} from "./rules.ts";
import { homePath, redirectFor } from "./access.ts";
import { seed } from "./seed.ts";
import type { Company, Course, State } from "./types.ts";

const as = (userId: string | null): State => ({ ...seed, sessionUserId: userId });

test("each role only reaches its own area", () => {
  assert.equal(redirectFor(as(null), "learner", "/courses"), "/login");
  assert.equal(redirectFor(as(null), "guest", "/login"), null);
  assert.equal(redirectFor(as("u-aye"), "guest", "/login"), "/onboarding");
  assert.equal(redirectFor(as("u-aye"), "learner", "/courses"), null);
  assert.equal(redirectFor(as("u-aye"), "company", "/company/challenges"), "/onboarding");
  assert.equal(redirectFor(as("u-min"), "shared", "/community"), null);
  assert.equal(redirectFor(as("u-gp"), "company", "/company/challenges"), null);
  assert.equal(redirectFor(as("u-gp"), "company", "/company/registration"), "/company/challenges");
  assert.equal(redirectFor(as("u-gp"), "learner", "/courses"), "/company/challenges");
});

test("an unverified company is locked to registration and its profile", () => {
  assert.equal(homePath(as("u-yds")), "/company/registration");
  assert.equal(redirectFor(as("u-yds"), "company", "/company/registration"), null);
  assert.equal(redirectFor(as("u-yds"), "company", "/company/challenges"), "/company/registration");
  assert.equal(redirectFor(as("u-yds"), "shared", "/community"), "/company/registration");
  assert.equal(redirectFor(as("u-yds"), "shared", "/profile/u-yds"), null);
});

test("test pass mark is 70%", () => {
  assert.equal(testPassed(7, 10), true);
  assert.equal(testPassed(6, 10), false);
  assert.equal(testPassed(0, 0), false);
});

test("test unlocks only when every lesson is done", () => {
  const course = { lessons: [{ id: "a" }, { id: "b" }] } as Course;
  assert.equal(allLessonsDone(["a"], course), false);
  assert.equal(allLessonsDone(["a", "b"], course), true);
});

test("challenge unlocks only with a certificate for that course", () => {
  const certs = [{ id: "c1", learnerId: "u1", courseId: "fe", score: 80, issuedAt: "" }];
  assert.equal(challengeUnlocked(certs, "u1", "fe"), true);
  assert.equal(challengeUnlocked(certs, "u1", "qa"), false);
  assert.equal(challengeUnlocked(certs, "u2", "fe"), false);
});

test("only verified companies can post", () => {
  assert.equal(canPostAsCompany({ status: "verified" } as Company), true);
  assert.equal(canPostAsCompany({ status: "pending" } as Company), false);
  assert.equal(canPostAsCompany(undefined), false);
});

test("community posts block private contact details", () => {
  assert.equal(hasContactDetails("mail me at aye@gmail.com"), true);
  assert.equal(hasContactDetails("call 09 7712 34567"), true);
  assert.equal(hasContactDetails("+95 9 771 234 567"), true);
  assert.equal(hasContactDetails("Lesson 3 in 2026 was hard"), false);
});

test("company email must be on its own domain", () => {
  assert.equal(emailMatchesWebsite("hr@goldenpixel.com.mm", "https://www.goldenpixel.com.mm"), true);
  assert.equal(emailMatchesWebsite("hr@mail.goldenpixel.com.mm", "goldenpixel.com.mm"), true);
  assert.equal(emailMatchesWebsite("goldenpixel@gmail.com", "goldenpixel.com.mm"), false);
  assert.equal(emailMatchesWebsite("hr@goldenpixel.com.mm", ""), false);
});
