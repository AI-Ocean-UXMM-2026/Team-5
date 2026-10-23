import assert from "node:assert/strict";
import test from "node:test";
import { latestCompanyPayment, latestPayment, reviewCompanyPayment, reviewPayment } from "./payments.ts";
import { emptyProgress, seed } from "./seed.ts";
import type { CompanyPayment, CoursePayment, State } from "./types.ts";

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

test("approving a payment opens the course even before the learner has any progress", () => {
  const noProgress: State = { ...seed, payments: [pending], progress: {} };
  const next = reviewPayment(noProgress, "pay-1", true, "", "2026-10-24");
  assert.deepEqual(next.progress["u-aye"].paidCourseIds, ["qa"]);
});

const fee: CompanyPayment = {
  id: "cpay-1",
  companyId: "c-yds",
  plan: "yearly",
  amountMmk: 1500000,
  method: "kpay",
  reference: "",
  receipt: "data:image/jpeg;base64,",
  status: "pending",
  submittedAt: "2026-10-23",
};
const approvedCompany: State = { ...seed, companies: seed.companies.map((c) => (c.id === "c-yds" ? { ...c, status: "approved" } : c)), companyPayments: [fee] };

test("confirming the partner fee puts the company live for the plan's length", () => {
  const next = reviewCompanyPayment(approvedCompany, "cpay-1", true, "", "2026-10-24");
  const company = next.companies.find((c) => c.id === "c-yds");
  assert.equal(company?.status, "verified");
  assert.equal(company?.verifiedAt, "2026-10-24");
  assert.equal(company?.plan, "yearly");
  assert.equal(company?.paidUntil, "2027-10-24");
  assert.equal(latestCompanyPayment(next, "c-yds")?.status, "approved");
});

test("rejecting the partner fee keeps the company waiting and saves the note", () => {
  const next = reviewCompanyPayment(approvedCompany, "cpay-1", false, "Amount is wrong.", "2026-10-24");
  assert.equal(next.companies.find((c) => c.id === "c-yds")?.status, "approved");
  assert.equal(latestCompanyPayment(next, "c-yds")?.staffNote, "Amount is wrong.");
  assert.equal(reviewCompanyPayment(next, "cpay-1", true, "", "2026-10-25"), next);
});
