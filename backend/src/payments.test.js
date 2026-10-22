import { createHmac, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";
import { pool } from "./db.js";
import { assertCheckoutPrice, handleWebhook } from "./payments.js";

test.after(async () => {
  await pool.end();
});

test("a free course cannot be checked out", () => {
  assert.throws(() => assertCheckoutPrice(0), (error) => error.status === 400);
  assert.equal(assertCheckoutPrice(45000), 45000);
});

test("a signed webhook grants access once and a bad signature does not", async () => {
  const previous = process.env.PAYMENT_WEBHOOK_SECRET;
  process.env.PAYMENT_WEBHOOK_SECRET = "test-secret";
  const ids = {};
  try {
    const teacher = await pool.query(
      `INSERT INTO users (role, name, email, password_hash) VALUES ('teacher', 'Teacher', $1, 'x') RETURNING id`,
      [`teacher-${randomUUID()}@example.com`],
    );
    ids.teacher = teacher.rows[0].id;
    const learner = await pool.query(
      `INSERT INTO users (role, name, email, password_hash) VALUES ('learner', 'Learner', $1, 'x') RETURNING id`,
      [`learner-${randomUUID()}@example.com`],
    );
    ids.learner = learner.rows[0].id;
    const course = await pool.query(
      `INSERT INTO courses (teacher_id, title, skill, level, hours, price_mmk, published)
       VALUES ($1, 'Paid', 'js', 'starter', 2, 45000, true) RETURNING id`,
      [ids.teacher],
    );
    ids.course = course.rows[0].id;
    const payment = await pool.query(
      `INSERT INTO payments (user_id, course_id, amount_mmk, status) VALUES ($1, $2, 45000, 'pending') RETURNING id`,
      [ids.learner, ids.course],
    );
    ids.payment = payment.rows[0].id;
    const raw = Buffer.from(JSON.stringify({ paymentId: ids.payment, providerRef: `ref-${ids.payment}` }));
    await assert.rejects(handleWebhook(raw, "bad"), (error) => error.status === 401);
    const pending = await pool.query("SELECT status FROM payments WHERE id = $1", [ids.payment]);
    assert.equal(pending.rows[0].status, "pending");
    const signature = createHmac("sha256", "test-secret").update(raw).digest("hex");
    const first = await handleWebhook(raw, signature);
    const second = await handleWebhook(raw, signature);
    assert.equal(first.already, false);
    assert.equal(second.already, true);
    const granted = await pool.query("SELECT count(*)::int AS n FROM entitlements WHERE payment_id = $1", [ids.payment]);
    assert.equal(granted.rows[0].n, 1);
    const paid = await pool.query("SELECT status, provider_ref FROM payments WHERE id = $1", [ids.payment]);
    assert.equal(paid.rows[0].status, "paid");
    assert.equal(paid.rows[0].provider_ref, `ref-${ids.payment}`);
  } finally {
    if (ids.payment) await pool.query("DELETE FROM entitlements WHERE payment_id = $1", [ids.payment]);
    if (ids.payment) await pool.query("DELETE FROM payments WHERE id = $1", [ids.payment]);
    if (ids.course) await pool.query("DELETE FROM courses WHERE id = $1", [ids.course]);
    if (ids.learner) await pool.query("DELETE FROM users WHERE id = $1", [ids.learner]);
    if (ids.teacher) await pool.query("DELETE FROM users WHERE id = $1", [ids.teacher]);
    if (previous === undefined) delete process.env.PAYMENT_WEBHOOK_SECRET;
    else process.env.PAYMENT_WEBHOOK_SECRET = previous;
  }
});
