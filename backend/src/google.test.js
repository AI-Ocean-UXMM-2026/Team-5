import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";
import { pool } from "./db.js";
import { linkGoogleAccount, signInWithGoogle } from "./google.js";

test.after(async () => {
  await pool.end();
});

test("google sign-in is unavailable without GOOGLE_CLIENT_ID", async () => {
  const previous = process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;
  try {
    await assert.rejects(signInWithGoogle("token"), (error) => error.status === 503);
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = previous;
  }
});

test("google sign-in links an email and refuses staff", async () => {
  const email = `google-${randomUUID()}@example.com`;
  const staffEmail = `staff-${randomUUID()}@example.com`;
  const createdEmail = `new-${randomUUID()}@example.com`;
  try {
    const company = await pool.query(
      `INSERT INTO users (role, name, email, password_hash) VALUES ('company', 'Co', $1, 'x') RETURNING id`,
      [email],
    );
    await pool.query(`INSERT INTO users (role, name, email, password_hash) VALUES ('staff', 'Staff', $1, 'x')`, [staffEmail]);
    const linked = await linkGoogleAccount({ sub: `sub-${email}`, email, name: "Other" });
    assert.equal(linked.id, company.rows[0].id);
    assert.equal(linked.role, "company");
    await assert.rejects(linkGoogleAccount({ sub: "other-sub", email, name: "Other" }), (error) => error.status === 409);
    await assert.rejects(linkGoogleAccount({ sub: `sub-${staffEmail}`, email: staffEmail, name: "Staff" }), (error) => error.status === 403);
    const created = await linkGoogleAccount({ sub: `sub-${createdEmail}`, email: createdEmail, name: "New Learner" });
    assert.equal(created.role, "learner");
  } finally {
    await pool.query("DELETE FROM users WHERE email = ANY($1::text[])", [[email, staffEmail, createdEmail]]);
  }
});
