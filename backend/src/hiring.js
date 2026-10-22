import { pool, withTx } from "./db.js";
import { assertRole, fail } from "./http.js";
import { deliverOffer } from "./mail.js";
import { ownCompany } from "./companies.js";
import { canSendOffer } from "./rules.js";

async function verifiedCompany(user) {
  const company = await ownCompany(user.id);
  if (company.status !== "verified") throw fail(403, "Your company is not verified.");
  return company;
}

export async function createChallenge({ res, user, body, send }) {
  assertRole(user, ["company"]);
  const company = await verifiedCompany(user);
  const title = String(body.title || "").trim();
  const task = String(body.task || "").trim();
  const points = Array.isArray(body.rubric) ? body.rubric.map((point) => String(point).trim()).filter(Boolean) : [];
  if (!title || !task) throw fail(400, "Title and task are required.");
  if (!points.length) throw fail(400, "Add at least one rubric point.");
  const course = await pool.query("SELECT id FROM courses WHERE id = $1 AND published", [body.courseId]);
  if (!course.rows[0]) throw fail(404, "Course was not found.");
  const challenge = await withTx(async (client) => {
    const inserted = await client.query(
      `INSERT INTO challenges (company_id, course_id, title, task) VALUES ($1, $2, $3, $4) RETURNING id`,
      [company.id, body.courseId, title, task],
    );
    for (let index = 0; index < points.length; index += 1) {
      await client.query("INSERT INTO rubric_points (challenge_id, position, point) VALUES ($1, $2, $3)", [
        inserted.rows[0].id,
        index + 1,
        points[index],
      ]);
    }
    return inserted.rows[0];
  });
  send(res, 201, challenge);
}

export async function submitWork({ res, user, body, params, send }) {
  assertRole(user, ["learner"]);
  const answer = String(body.answer || "").trim();
  const link = String(body.link || "").trim();
  if (!answer || !link) throw fail(400, "Answer and link are required.");
  const challenge = await pool.query("SELECT id, course_id FROM challenges WHERE id = $1", [params.id]);
  if (!challenge.rows[0]) throw fail(404, "Challenge was not found.");
  const cert = await pool.query("SELECT 1 FROM certificates WHERE learner_id = $1 AND course_id = $2", [
    user.id,
    challenge.rows[0].course_id,
  ]);
  if (!cert.rowCount) throw fail(403, "Finish the course and earn the certificate first.");
  const existing = await pool.query("SELECT id, status FROM submissions WHERE challenge_id = $1 AND learner_id = $2", [params.id, user.id]);
  if (!existing.rows[0]) {
    const inserted = await pool.query(
      `INSERT INTO submissions (challenge_id, learner_id, answer, link, status) VALUES ($1, $2, $3, $4, 'submitted') RETURNING id`,
      [params.id, user.id, answer, link],
    );
    send(res, 201, { id: inserted.rows[0].id, status: "submitted" });
    return;
  }
  if (existing.rows[0].status !== "needs-work") throw fail(409, "This challenge is already submitted.");
  await pool.query(
    `UPDATE submissions SET answer = $2, link = $3, status = 'submitted', company_feedback = NULL, submitted_at = now() WHERE id = $1`,
    [existing.rows[0].id, answer, link],
  );
  send(res, 200, { id: existing.rows[0].id, status: "submitted" });
}

async function ownedSubmission(companyId, submissionId, client = pool) {
  const { rows } = await client.query(
    `SELECT s.id, s.status, s.learner_id, s.challenge_id, c.company_id
     FROM submissions s JOIN challenges c ON c.id = s.challenge_id
     WHERE s.id = $1 AND c.company_id = $2
     FOR UPDATE OF s`,
    [submissionId, companyId],
  );
  if (!rows[0]) throw fail(404, "Submission was not found.");
  return rows[0];
}

export async function sendFeedback({ res, user, body, params, send }) {
  assertRole(user, ["company"]);
  const company = await verifiedCompany(user);
  const feedback = String(body.feedback || "").trim();
  if (!feedback) throw fail(400, "Feedback is required.");
  await withTx(async (client) => {
    const submission = await ownedSubmission(company.id, params.id, client);
    if (submission.status !== "submitted") throw fail(409, "Feedback is for a submission that is waiting on you.");
    await client.query("UPDATE submissions SET status = 'needs-work', company_feedback = $2 WHERE id = $1", [submission.id, feedback]);
  });
  send(res, 200, { status: "needs-work" });
}

export async function scheduleInterview({ res, user, body, params, send }) {
  assertRole(user, ["company"]);
  const company = await verifiedCompany(user);
  const when = new Date(body.scheduledFor);
  if (Number.isNaN(when.getTime())) throw fail(400, "Interview time is invalid.");
  const interview = await withTx(async (client) => {
    const submission = await ownedSubmission(company.id, params.id, client);
    if (submission.status !== "submitted") throw fail(409, "Schedule an interview from a submitted challenge.");
    const inserted = await client.query(
      `INSERT INTO interviews (submission_id, challenge_id, learner_id, company_id, scheduled_for, status)
       VALUES ($1, $2, $3, $4, $5, 'scheduled') RETURNING id`,
      [submission.id, submission.challenge_id, submission.learner_id, submission.company_id, when],
    );
    await client.query("UPDATE submissions SET status = 'interview' WHERE id = $1", [submission.id]);
    return inserted.rows[0];
  });
  send(res, 201, { id: interview.id, status: "scheduled" });
}

export async function sendOffer({ res, user, params, send }) {
  assertRole(user, ["company"]);
  const company = await verifiedCompany(user);
  const saved = await withTx(async (client) => {
    const { rows } = await client.query(
      `SELECT i.id, i.status, u.email
       FROM interviews i
       JOIN submissions s ON s.id = i.submission_id
       JOIN users u ON u.id = s.learner_id
       WHERE i.submission_id = $1 AND i.company_id = $2
       FOR UPDATE OF i`,
      [params.id, company.id],
    );
    const interview = rows[0];
    if (!interview) throw fail(404, "Interview was not found.");
    if (!canSendOffer(interview.status)) throw fail(409, "An offer needs a scheduled interview.");
    await client.query("UPDATE interviews SET status = 'offered' WHERE id = $1", [interview.id]);
    await client.query("UPDATE submissions SET status = 'offered' WHERE id = $1", [params.id]);
    const mail = await client.query("INSERT INTO offer_emails (interview_id, to_email) VALUES ($1, $2) RETURNING id", [interview.id, interview.email]);
    return { interviewId: interview.id, mailId: mail.rows[0].id, email: interview.email };
  });
  const delivery = await deliverOffer({
    to: saved.email,
    companyName: company.name,
    role: company.term_role,
    duration: company.term_duration,
    stipend: company.term_stipend,
  });
  await pool.query("UPDATE offer_emails SET attempts = 1, sent_at = $2, last_error = $3 WHERE id = $1", [
    saved.mailId,
    delivery.sentAt,
    delivery.error,
  ]);
  send(res, 201, { interviewId: saved.interviewId, status: "offered", email: { sent: !delivery.error, error: delivery.error } });
}

export async function replyToOffer({ res, user, body, params, send }) {
  assertRole(user, ["learner"]);
  if (typeof body.accept !== "boolean") throw fail(400, "Accept must be true or false.");
  const status = body.accept ? "accepted" : "declined";
  const { rows } = await pool.query("UPDATE interviews SET status = $2 WHERE id = $1 AND learner_id = $3 AND status = 'offered' RETURNING id", [
    params.id,
    status,
    user.id,
  ]);
  if (!rows[0]) {
    const found = await pool.query("SELECT status FROM interviews WHERE id = $1 AND learner_id = $2", [params.id, user.id]);
    if (!found.rows[0]) throw fail(404, "Interview was not found.");
    throw fail(409, "This offer is already closed.");
  }
  send(res, 200, { status });
}

export async function rateInterview({ res, user, body, params, send }) {
  if (!user) throw fail(401, "Sign in required.");
  if (!Number.isInteger(body.stars) || body.stars < 1 || body.stars > 5) throw fail(400, "Stars must be from 1 to 5.");
  const { rows } = await pool.query(
    `SELECT i.id, i.status, i.learner_id, i.company_id, c.owner_user_id
     FROM interviews i JOIN companies c ON c.id = i.company_id WHERE i.id = $1`,
    [params.id],
  );
  const interview = rows[0];
  const isLearner = interview?.learner_id === user.id;
  const isCompany = interview?.owner_user_id === user.id;
  if (!interview || (!isLearner && !isCompany)) throw fail(404, "Interview was not found.");
  if (interview.status !== "accepted") throw fail(409, "You can rate only after the offer is accepted.");
  const targetType = isLearner ? "company" : "user";
  const targetId = isLearner ? interview.company_id : interview.learner_id;
  try {
    const rating = await pool.query(
      `INSERT INTO ratings (interview_id, from_user_id, target_type, target_id, stars, comment)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [interview.id, user.id, targetType, targetId, body.stars, String(body.comment || "")],
    );
    send(res, 201, { id: rating.rows[0].id });
  } catch (error) {
    if (error.code === "23505") throw fail(409, "You already rated this internship.");
    throw error;
  }
}
