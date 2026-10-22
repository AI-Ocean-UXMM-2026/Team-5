import assert from "node:assert/strict";
import { test } from "node:test";
import {
  allLessonsDone,
  applyOffer,
  replyToOffer,
  canPostAsCompany,
  communityPostKind,
  lessonIncluded,
  paidTrackOpen,
  previewLessonCount,
  roadmapStepOpen,
  companyChallengeIds,
  challengeUnlocked,
  counted,
  emailMatchesWebsite,
  youtubeVideoId,
  hasContactDetails,
  registrationView,
  rubricMarks,
  testPassed,
} from "./rules.ts";
import { coursesForGoal } from "./ai.ts";
import { homePath, redirectFor } from "./access.ts";
import { defaultLang } from "./i18n.ts";
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

test("myanmar visitors start in burmese, and legal pages stay open", () => {
  assert.equal(defaultLang(["my-MM"], "America/New_York"), "my");
  assert.equal(defaultLang(["en-US"], "Asia/Yangon"), "my");
  assert.equal(defaultLang(["en"], "Asia/Rangoon"), "my");
  assert.equal(defaultLang(["en-GB"], "Asia/Bangkok"), "en");
  assert.equal(defaultLang([], ""), "en");
  assert.equal(redirectFor(as(null), "guest", "/legal"), null);
  assert.equal(redirectFor(as("u-aye"), "guest", "/legal"), null);
});

test("guests go home from the logo, and registration status has a home", () => {
  assert.equal(homePath(as(null)), "/");
  assert.equal(redirectFor(as("u-gp"), "company", "/company/registration/status"), null);
  assert.equal(registrationView({ status: "pending" } as Company), "waiting");
  assert.equal(registrationView({ status: "draft", reviewNote: "Clearer document" } as Company), "needs-info");
  assert.equal(registrationView({ status: "rejected" } as Company), "rejected");
  assert.equal(registrationView({ status: "verified" } as Company), "live");
  assert.equal(registrationView({ status: "draft" } as Company), "none");
  const company = (status: Company["status"], reviewNote?: string, approvalSeen?: boolean): State => ({
    ...seed,
    sessionUserId: "u-yds",
    companies: seed.companies.map((c) => (c.id === "c-yds" ? { ...c, status, reviewNote, approvalSeen } : c)),
  });
  assert.equal(homePath(company("pending")), "/company/registration/status");
  assert.equal(homePath(company("rejected")), "/company/registration/status");
  assert.equal(homePath(company("draft", "Clearer document")), "/company/registration/status");
  assert.equal(homePath(company("verified")), "/company/registration/status");
  assert.equal(homePath(company("verified", undefined, true)), "/company/challenges");
});

test("counts use singular only for one", () => {
  assert.equal(counted(0, "submission"), "0 submissions");
  assert.equal(counted(1, "submission"), "1 submission");
  assert.equal(counted(2, "submission"), "2 submissions");
});

test("rubric marks say which points an answer covers", () => {
  assert.deepEqual(rubricMarks("I used semantic HTML and explained my choices clearly", ["Semantic HTML", "Clear explanation of choices", "Works at 360px"]), [
    { point: "Semantic HTML", met: true },
    { point: "Clear explanation of choices", met: true },
    { point: "Works at 360px", met: false },
  ]);
});

test("an unverified company is locked to registration and its profile", () => {
  assert.equal(homePath(as("u-yds")), "/company/registration");
  assert.equal(redirectFor(as("u-yds"), "company", "/company/registration"), null);
  assert.equal(redirectFor(as("u-yds"), "company", "/company/challenges"), "/company/registration");
  assert.equal(redirectFor(as("u-yds"), "shared", "/community"), "/company/registration");
  assert.equal(redirectFor(as("u-yds"), "shared", "/profile/u-yds"), null);
});

test("a paid course keeps the first 25 percent free until the track is unlocked", () => {
  const paid = { id: "fe", priceMmk: 45000, lessons: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }] } as Course;
  const free = { id: "starter", priceMmk: 0, lessons: [{ id: "a" }, { id: "b" }, { id: "c" }] } as Course;
  assert.equal(previewLessonCount(paid), 1);
  assert.equal(previewLessonCount(free), 3);
  assert.equal(lessonIncluded(paid, 0, [], false), true);
  assert.equal(lessonIncluded(paid, 1, [], false), false);
  assert.equal(paidTrackOpen(paid, [], false), false);
  assert.equal(lessonIncluded(paid, 3, ["fe"], false), true);
  assert.equal(paidTrackOpen(paid, [], true), true);
  assert.equal(lessonIncluded(free, 2, [], false), true);
});

test("a roadmap course stays locked until the one before it is finished", () => {
  const steps = [
    { id: "a", lessons: [{ id: "a1" }, { id: "a2" }] },
    { id: "b", lessons: [{ id: "b1" }] },
    { id: "c", lessons: [{ id: "c1" }] },
  ] as Course[];
  assert.equal(roadmapStepOpen(steps, 0, [], []), true);
  assert.equal(roadmapStepOpen(steps, 1, ["a1"], []), false);
  assert.equal(roadmapStepOpen(steps, 1, ["a1", "a2"], []), true);
  assert.equal(roadmapStepOpen(steps, 2, ["a1", "a2"], []), false);
  assert.equal(roadmapStepOpen(steps, 2, [], ["b"]), true);
  assert.equal(roadmapStepOpen(steps, 1, [], ["b"]), true);
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

test("learners post course discussions and companies post challenges", () => {
  assert.equal(communityPostKind("learner"), "course");
  assert.equal(communityPostKind("company"), "challenge");
});

test("only verified companies can post", () => {
  assert.equal(canPostAsCompany({ status: "verified" } as Company), true);
  assert.equal(canPostAsCompany({ status: "pending" } as Company), false);
  assert.equal(canPostAsCompany(undefined), false);
});

test("a company can only discuss its own challenge, and only when verified", () => {
  const challenges = [
    { id: "a", companyId: "c1" },
    { id: "b", companyId: "c2" },
  ];
  assert.deepEqual(companyChallengeIds({ id: "c1", status: "verified" } as Company, challenges), ["a"]);
  assert.deepEqual(companyChallengeIds({ id: "c1", status: "pending" } as Company, challenges), []);
  assert.deepEqual(companyChallengeIds(undefined, challenges), []);
});

test("community posts block private contact details", () => {
  assert.equal(hasContactDetails("mail me at aye@gmail.com"), true);
  assert.equal(hasContactDetails("call 09 7712 34567"), true);
  assert.equal(hasContactDetails("+95 9 771 234 567"), true);
  assert.equal(hasContactDetails("Lesson 3 in 2026 was hard"), false);
});

test("each career goal uses a real demo course path", () => {
  assert.deepEqual(coursesForGoal("frontend"), ["starter", "frontend"]);
  assert.deepEqual(coursesForGoal("backend"), ["starter", "frontend"]);
  assert.deepEqual(coursesForGoal("uiux"), ["starter", "frontend"]);
  assert.deepEqual(coursesForGoal("data"), ["starter", "qa"]);
  assert.deepEqual(coursesForGoal("fullstack"), ["starter", "frontend", "qa"]);
  assert.deepEqual(coursesForGoal("unsure"), ["starter", "frontend", "qa"]);
});

test("a company offer marks the submission and adds or updates the interview", () => {
  const offered = applyOffer(seed, "s-aye", "iv-aye");
  const row = offered.interviews.find((i) => i.submissionId === "s-aye");
  assert.equal(offered.submissions.find((x) => x.id === "s-aye")?.status, "offered");
  assert.equal(row?.status, "offered");
  assert.equal(row?.id, "iv-aye");
  const scheduled: State = {
    ...seed,
    submissions: seed.submissions.map((x) => (x.id === "s-min" ? { ...x, status: "interview" } : x)),
    interviews: seed.interviews.map((i) => (i.id === "iv-min" ? { ...i, status: "scheduled" } : i)),
  };
  const afterInterview = applyOffer(scheduled, "s-min", "iv-new");
  assert.equal(afterInterview.interviews.find((i) => i.submissionId === "s-min")?.id, "iv-min");
  assert.equal(afterInterview.submissions.find((x) => x.id === "s-min")?.status, "offered");
  assert.equal(applyOffer(seed, "s-min", "iv-dup"), seed);
});

test("a learner can accept or decline an offer only once", () => {
  const accepted = replyToOffer(seed, "iv-min", true);
  assert.equal(accepted.interviews.find((i) => i.id === "iv-min")?.status, "accepted");
  assert.equal(replyToOffer(accepted, "iv-min", false), accepted);
  assert.equal(replyToOffer(seed, "iv-min", false).interviews.find((i) => i.id === "iv-min")?.status, "declined");
});

test("a company video accepts a YouTube link", () => {
  assert.equal(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(youtubeVideoId(""), null);
  assert.equal(youtubeVideoId("https://vimeo.com/123"), undefined);
});

test("company email must be on its own domain", () => {
  assert.equal(emailMatchesWebsite("hr@goldenpixel.com.mm", "https://www.goldenpixel.com.mm"), true);
  assert.equal(emailMatchesWebsite("hr@mail.goldenpixel.com.mm", "goldenpixel.com.mm"), true);
  assert.equal(emailMatchesWebsite("goldenpixel@gmail.com", "goldenpixel.com.mm"), false);
  assert.equal(emailMatchesWebsite("hr@goldenpixel.com.mm", ""), false);
});
