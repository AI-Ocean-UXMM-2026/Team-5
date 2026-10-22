import assert from "node:assert/strict";
import { test } from "node:test";
import { googleSession } from "./google-session.ts";
import type { State } from "./types.ts";

const empty = { sessionUserId: null, users: [], companies: [] } as unknown as State;

test("google sign-in opens a new learner and reuses the same email", () => {
  const next = googleSession(empty, { id: "g1", role: "learner", name: "Aye", email: "Aye@gmail.com" });
  assert.equal(next.sessionUserId, "g1");
  assert.equal(next.users[0].email, "aye@gmail.com");
  const again = googleSession(next, { id: "other", role: "learner", name: "Aye", email: "aye@gmail.com" });
  assert.equal(again.sessionUserId, "g1");
  assert.equal(again.users.length, 1);
});

test("a google company account gets a draft company", () => {
  const next = googleSession(empty, { id: "co", role: "company", name: "Hnin", email: "hr@co.com" });
  assert.equal(next.users[0].companyId, "c-co");
  assert.equal(next.companies[0].status, "draft");
});

test("teacher and staff accounts stay out of the demo", () => {
  assert.throws(() => googleSession(empty, { id: "t", role: "teacher", name: "T", email: "t@citadel.test" }), /cannot open the demo/);
});
