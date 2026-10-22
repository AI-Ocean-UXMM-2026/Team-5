import { createHmac, timingSafeEqual } from "node:crypto";
import { pool, withTx } from "./db.js";
import { assertRole, fail, readRaw } from "./http.js";

export function assertCheckoutPrice(priceMmk) {
  if (!Number.isInteger(priceMmk) || priceMmk <= 0) throw fail(400, "This course does not need payment.");
  return priceMmk;
}

export async function checkout({ res, user, body, send }) {
  assertRole(user, ["learner"]);
  const { rows } = await pool.query("SELECT id, price_mmk, published FROM courses WHERE id = $1", [body.courseId]);
  const course = rows[0];
  if (!course || !course.published) throw fail(404, "Course was not found.");
  const amount = assertCheckoutPrice(course.price_mmk);
  const owned = await pool.query("SELECT 1 FROM entitlements WHERE user_id = $1 AND course_id = $2", [user.id, course.id]);
  if (owned.rowCount) throw fail(409, "You already have this course.");
  const payment = await pool.query(
    `INSERT INTO payments (user_id, course_id, amount_mmk, status) VALUES ($1, $2, $3, 'pending') RETURNING id`,
    [user.id, course.id, amount],
  );
  send(res, 201, { paymentId: payment.rows[0].id, amountMmk: amount });
}

export async function handleWebhook(raw, header) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) throw fail(503, "Payments are not configured.");
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const given = Buffer.from(String(header || ""));
  const actual = Buffer.from(expected);
  if (given.length !== actual.length || !timingSafeEqual(given, actual)) throw fail(401, "Invalid signature.");
  let body;
  try {
    body = JSON.parse(raw.toString());
  } catch {
    throw fail(400, "Invalid JSON.");
  }
  const providerRef = String(body.providerRef || "").trim();
  if (!body.paymentId || !providerRef) throw fail(400, "Payment id and provider ref are required.");
  return applyPaid(body.paymentId, providerRef);
}

export async function applyPaid(paymentId, providerRef) {
  try {
    return await withTx(async (client) => {
      const { rows } = await client.query("SELECT id, user_id, course_id, status, provider_ref FROM payments WHERE id = $1 FOR UPDATE", [
        paymentId,
      ]);
      const payment = rows[0];
      if (!payment) throw fail(404, "Payment was not found.");
      if (payment.status === "paid" && payment.provider_ref === providerRef) return { already: true };
      if (payment.status !== "pending") throw fail(409, "Payment is already closed.");
      await client.query("UPDATE payments SET status = 'paid', provider_ref = $2 WHERE id = $1", [paymentId, providerRef]);
      await client.query("INSERT INTO entitlements (user_id, course_id, payment_id) VALUES ($1, $2, $3)", [
        payment.user_id,
        payment.course_id,
        paymentId,
      ]);
      return { already: false };
    });
  } catch (error) {
    if (error.code === "23505") throw fail(409, "That provider ref is already used.");
    throw error;
  }
}

export async function webhook({ req, res, send }) {
  const raw = await readRaw(req);
  const result = await handleWebhook(raw, req.headers["x-citadel-signature"]);
  send(res, 200, { ok: true, already: result.already });
}
