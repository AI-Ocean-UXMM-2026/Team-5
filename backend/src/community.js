import { pool, withTx } from "./db.js";
import { ownCompany } from "./companies.js";
import { assertRole, fail } from "./http.js";
import { hasContactDetails } from "./rules.js";

function cleanText(value, label) {
  const text = String(value || "").trim();
  if (!text) throw fail(400, `${label} is required.`);
  if (hasContactDetails(text)) throw fail(400, "Remove phone numbers and email addresses.");
  return text;
}

async function assertCanDiscuss(user) {
  if (!user) throw fail(401, "Sign in required.");
  if (user.role === "learner") return { role: "learner" };
  if (user.role !== "company") throw fail(403, "You cannot do that.");
  const company = await ownCompany(user.id);
  if (company.status !== "verified") throw fail(403, "Your company is not verified.");
  return { role: "company", company };
}

export async function createPost({ res, user, body, send }) {
  const actor = await assertCanDiscuss(user);
  const title = cleanText(body.title, "Title");
  const text = cleanText(body.body, "Body");
  if (hasContactDetails(`${title} ${text}`)) throw fail(400, "Remove phone numbers and email addresses.");
  if (actor.role === "learner") {
    const course = await pool.query("SELECT id FROM courses WHERE id = $1 AND published", [body.topicId]);
    if (!course.rows[0]) throw fail(404, "Course was not found.");
    const post = await pool.query(
      `INSERT INTO posts (author_id, kind, topic_id, title, body) VALUES ($1, 'course', $2, $3, $4) RETURNING id`,
      [user.id, body.topicId, title, text],
    );
    send(res, 201, { id: post.rows[0].id, kind: "course" });
    return;
  }
  const challenge = await pool.query("SELECT id FROM challenges WHERE id = $1 AND company_id = $2", [body.topicId, actor.company.id]);
  if (!challenge.rows[0]) throw fail(404, "Challenge was not found.");
  const post = await pool.query(
    `INSERT INTO posts (author_id, kind, topic_id, title, body) VALUES ($1, 'challenge', $2, $3, $4) RETURNING id`,
    [user.id, body.topicId, title, text],
  );
  send(res, 201, { id: post.rows[0].id, kind: "challenge" });
}

export async function createReply({ res, user, body, params, send }) {
  const actor = await assertCanDiscuss(user);
  const text = cleanText(body.body, "Reply");
  const { rows } = await pool.query("SELECT id, kind, topic_id FROM posts WHERE id = $1", [params.id]);
  const post = rows[0];
  if (!post) throw fail(404, "Post was not found.");
  let official = false;
  if (actor.role === "company" && post.kind === "challenge") {
    const owned = await pool.query("SELECT 1 FROM challenges WHERE id = $1 AND company_id = $2", [post.topic_id, actor.company.id]);
    official = owned.rowCount > 0;
  }
  const reply = await withTx(async (client) => {
    if (official) await client.query("UPDATE replies SET is_official = false WHERE post_id = $1 AND is_official", [post.id]);
    const inserted = await client.query(
      `INSERT INTO replies (post_id, author_id, body, is_official) VALUES ($1, $2, $3, $4) RETURNING id, is_official`,
      [post.id, user.id, text, official],
    );
    return inserted.rows[0];
  });
  send(res, 201, { id: reply.id, official: reply.is_official });
}

export async function createReport({ res, user, body, send }) {
  if (!user) throw fail(401, "Sign in required.");
  if (body.targetType !== "post" && body.targetType !== "reply") throw fail(400, "Report a post or a reply.");
  const reason = String(body.reason || "").trim();
  if (!reason) throw fail(400, "A reason is required.");
  const table = body.targetType === "post" ? "posts" : "replies";
  const target = await pool.query(`SELECT author_id FROM ${table} WHERE id = $1`, [body.targetId]);
  if (!target.rows[0]) throw fail(404, "That post was not found.");
  if (target.rows[0].author_id === user.id) throw fail(400, "You cannot report your own post.");
  try {
    const report = await pool.query(
      `INSERT INTO reports (target_type, target_id, reporter_id, reason) VALUES ($1, $2, $3, $4) RETURNING id`,
      [body.targetType, body.targetId, user.id, reason],
    );
    send(res, 201, { id: report.rows[0].id });
  } catch (error) {
    if (error.code === "23505") throw fail(409, "You already reported this.");
    throw error;
  }
}

export async function listReports({ res, user, url, send }) {
  assertRole(user, ["staff"]);
  const status = url.searchParams.get("status") || "open";
  if (!["open", "resolved", "dismissed"].includes(status)) throw fail(400, "Status is invalid.");
  const { rows } = await pool.query(
    `SELECT id, target_type, target_id, reporter_id, reason, status, created_at
     FROM reports WHERE status = $1 ORDER BY created_at DESC`,
    [status],
  );
  send(res, 200, {
    reports: rows.map((row) => ({
      id: row.id,
      targetType: row.target_type,
      targetId: row.target_id,
      reporterId: row.reporter_id,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at,
    })),
  });
}

export async function closeReport({ res, user, body, params, send }) {
  assertRole(user, ["staff"]);
  if (body.status !== "resolved" && body.status !== "dismissed") throw fail(400, "Status must be resolved or dismissed.");
  const result = await withTx(async (client) => {
    const { rows } = await client.query(
      `UPDATE reports SET status = $2, staff_user_id = $3, closed_at = now()
       WHERE id = $1 AND status = 'open' RETURNING id`,
      [params.id, body.status, user.id],
    );
    if (!rows[0]) {
      const found = await client.query("SELECT id FROM reports WHERE id = $1", [params.id]);
      if (!found.rows[0]) throw fail(404, "Report was not found.");
      throw fail(409, "This report is already closed.");
    }
    await client.query(
      `INSERT INTO staff_actions (staff_user_id, subject_type, subject_id, from_status, to_status, note)
       VALUES ($1, 'report', $2, 'open', $3, '')`,
      [user.id, params.id, body.status],
    );
    return { status: body.status };
  });
  send(res, 200, result);
}
