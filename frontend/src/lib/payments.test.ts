import assert from "node:assert/strict";
import test from "node:test";
import { latestPayment, reviewPayment } from "./payments.ts";
import { emptyProgress, seed } from "./seed.ts";
import type { CoursePayment, State } from "./types.ts";

const pending: CoursePayment = {
  id: "pay-1",
  learnerId: "u-aye",
  courseId: "qa",
  amountMmk: 30000,
  method: "kpay",
  reference: "",
  receipt: "data:image/jpeg;base64,",
  status: "pending",
  submittedAt: "2026-10-23",
};
const withPayment: State = { ...seed, payments: [pending], progress: { ...seed.progress, "u-aye": { ...emptyProgress } } };

test("approving a payment opens the paid track for that course", () => {
  const next = reviewPayment(withPayment, "pay-1", true, "", "2026-10-24");
  assert.equal(next.payments![0].status, "approved");
  assert.equal(next.payments![0].reviewedAt, "2026-10-24");
  assert.deepEqual(next.progress["u-aye"].paidCourseIds, ["qa"]);
});

test("rejecting a payment keeps the course locked and saves the note", () => {
  const next = reviewPayment(withPayment, "pay-1", false, "Amount is wrong.", "2026-10-24");
  assert.equal(next.payments![0].status, "rejected");
  assert.equal(next.payments![0].staffNote, "Amount is wrong.");
  assert.deepEqual(next.progress["u-aye"].paidCourseIds ?? [], []);
});

test("a payment is reviewed only once", () => {
  const approved = reviewPayment(withPayment, "pay-1", true, "", "2026-10-24");
  assert.equal(reviewPayment(approved, "pay-1", false, "late", "2026-10-25"), approved);
});

test("latest payment is the newest one for that learner and course", () => {
  const s = { ...withPayment, payments: [{ ...pending, status: "rejected" as const }, { ...pending, id: "pay-2" }] };
  assert.equal(latestPayment(s, "u-aye", "qa")?.id, "pay-2");
  assert.equal(latestPayment(s, "u-min", "qa"), undefined);
});
