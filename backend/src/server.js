import { createServer } from "node:http";
import { publicUser, validateSignup } from "./auth.js";
import { pool, withTx } from "./db.js";
import { loadEnv } from "./env.js";
import { fail, matchPath, readJson, send } from "./http.js";
import { hashPassword, verifyPassword } from "./password.js";
import { openSession, readSessionId, setSessionCookie, userFromRequest } from "./session.js";
import { signInWithGoogle } from "./google.js";
import {
  addLesson,
  addQuizQuestion,
  addTestQuestion,
  createCourse,
  getCourse,
  listCourses,
  patchCourse,
  patchLesson,
  patchQuestion,
  publishCourse,
} from "./catalogue.js";
import { gradeQuiz, gradeTest } from "./learn.js";
import { checkout, webhook } from "./payments.js";
import { downloadCompanyFile, listStaffCompanies, reviewCompany, submitCompany, uploadDocument } from "./companies.js";
import { createChallenge, rateInterview, replyToOffer, scheduleInterview, sendFeedback, sendOffer, submitWork } from "./hiring.js";
import { closeReport, createPost, createReply, createReport, listReports } from "./community.js";
import { challengeDraft, challengeReview, lessonSummary, roadmap } from "./ai.js";

loadEnv();

const port = Number(process.env.PORT || 4000);

async function signup({ res, body }) {
  const problem = validateSignup(body);
  if (problem) return send(res, 400, { error: problem });
  const email = String(body.email).trim().toLowerCase();
  try {
    const user = await withTx(async (client) => {
      const inserted = await client.query(
        `INSERT INTO users (role, name, email, password_hash) VALUES ($1, $2, $3, $4)
         RETURNING id, role, name, email, headline`,
        [body.role, String(body.name).trim(), email, hashPassword(String(body.password))],
      );
      if (body.role === "company") {
        await client.query("INSERT INTO companies (owner_user_id, name, email) VALUES ($1, $2, $3)", [
          inserted.rows[0].id,
          String(body.companyName).trim(),
          email,
        ]);
      }
      return inserted.rows[0];
    });
    await openSession(res, user.id);
    send(res, 201, { user: publicUser(user) });
  } catch (error) {
    if (error.code === "23505") throw fail(409, "An account with this email already exists.");
    throw error;
  }
}

async function login({ res, body }) {
  const email = String(body.email || "").trim().toLowerCase();
  const { rows } = await pool.query("SELECT id, role, name, email, headline, password_hash FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user || !verifyPassword(String(body.password || ""), user.password_hash)) throw fail(401, "Email or password is wrong.");
  await openSession(res, user.id);
  send(res, 200, { user: publicUser(user) });
}

async function logout({ req, res }) {
  const id = readSessionId(req);
  if (id) await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
  setSessionCookie(res, "");
  send(res, 200, { ok: true });
}

async function me({ res, user }) {
  if (!user) throw fail(401, "Sign in required.");
  send(res, 200, { user: publicUser(user) });
}

function googleClient({ res, send }) {
  if (!process.env.GOOGLE_CLIENT_ID) throw fail(503, "Google sign-in is not configured.");
  send(res, 200, { clientId: process.env.GOOGLE_CLIENT_ID });
}

async function googleAuth({ res, body }) {
  const user = await signInWithGoogle(body.idToken);
  await openSession(res, user.id);
  send(res, 200, { user: publicUser(user) });
}

const routes = [
  { method: "POST", path: "/auth/signup", auth: "none", handle: signup },
  { method: "POST", path: "/auth/login", auth: "none", handle: login },
  { method: "POST", path: "/auth/logout", auth: "optional", handle: logout },
  { method: "GET", path: "/auth/me", auth: "optional", handle: me },
  { method: "GET", path: "/auth/google/client", auth: "none", handle: googleClient },
  { method: "POST", path: "/auth/google", auth: "none", handle: googleAuth },
  { method: "POST", path: "/ai/roadmap", auth: "none", handle: roadmap },
  { method: "POST", path: "/ai/lesson-summary", auth: "none", handle: lessonSummary },
  { method: "POST", path: "/ai/challenge-review", auth: "none", handle: challengeReview },
  { method: "POST", path: "/ai/challenge-draft", auth: "none", handle: challengeDraft },
  { method: "GET", path: "/courses", auth: "optional", handle: listCourses },
  { method: "POST", path: "/courses", auth: "required", handle: createCourse },
  { method: "GET", path: "/courses/:id", auth: "optional", handle: getCourse },
  { method: "PATCH", path: "/courses/:id", auth: "required", handle: patchCourse },
  { method: "POST", path: "/courses/:id/lessons", auth: "required", handle: addLesson },
  { method: "PATCH", path: "/lessons/:id", auth: "required", handle: patchLesson },
  { method: "POST", path: "/lessons/:id/questions", auth: "required", handle: addQuizQuestion },
  { method: "POST", path: "/courses/:id/test-questions", auth: "required", handle: addTestQuestion },
  { method: "PATCH", path: "/questions/:id", auth: "required", handle: patchQuestion },
  { method: "POST", path: "/courses/:id/publish", auth: "required", handle: publishCourse },
  { method: "POST", path: "/lessons/:id/quiz", auth: "required", handle: gradeQuiz },
  { method: "POST", path: "/courses/:id/test", auth: "required", handle: gradeTest },
  { method: "POST", path: "/payments/checkout", auth: "required", handle: checkout },
  { method: "POST", path: "/payments/webhook", auth: "none", raw: true, handle: webhook },
  { method: "POST", path: "/companies/me/files", auth: "required", raw: true, handle: uploadDocument },
  { method: "POST", path: "/companies/me/submit", auth: "required", handle: submitCompany },
  { method: "GET", path: "/staff/companies", auth: "required", handle: listStaffCompanies },
  { method: "GET", path: "/staff/company-files/:id", auth: "required", raw: true, handle: downloadCompanyFile },
  { method: "POST", path: "/staff/companies/:id/review", auth: "required", handle: reviewCompany },
  { method: "POST", path: "/challenges", auth: "required", handle: createChallenge },
  { method: "POST", path: "/challenges/:id/submissions", auth: "required", handle: submitWork },
  { method: "POST", path: "/submissions/:id/feedback", auth: "required", handle: sendFeedback },
  { method: "POST", path: "/submissions/:id/interviews", auth: "required", handle: scheduleInterview },
  { method: "POST", path: "/submissions/:id/offers", auth: "required", handle: sendOffer },
  { method: "POST", path: "/interviews/:id/reply", auth: "required", handle: replyToOffer },
  { method: "POST", path: "/interviews/:id/ratings", auth: "required", handle: rateInterview },
  { method: "POST", path: "/posts", auth: "required", handle: createPost },
  { method: "POST", path: "/posts/:id/replies", auth: "required", handle: createReply },
  { method: "POST", path: "/reports", auth: "required", handle: createReport },
  { method: "GET", path: "/staff/reports", auth: "required", handle: listReports },
  { method: "POST", path: "/staff/reports/:id", auth: "required", handle: closeReport },
];

const server = createServer(async (req, res) => {
  res.citadelOrigin = req.headers.origin;
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  try {
    if (req.method === "OPTIONS") return send(res, 204, {});
    if (req.method === "GET" && url.pathname === "/health") {
      if (!process.env.DATABASE_URL) return send(res, 503, { ok: false, error: "DATABASE_URL is not set." });
      await pool.query("SELECT 1");
      return send(res, 200, { ok: true });
    }
    for (const route of routes) {
      if (req.method !== route.method) continue;
      const params = matchPath(route.path, url.pathname);
      if (!params) continue;
      const user = route.auth === "none" ? null : await userFromRequest(req);
      if (route.auth === "required" && !user) return send(res, 401, { error: "Sign in required." });
      const body = route.raw || req.method === "GET" ? undefined : await readJson(req);
      await route.handle({ req, res, user, body, params, url, send });
      return;
    }
    send(res, 404, { error: "Not found." });
  } catch (error) {
    if (res.headersSent) {
      if (!error.status) console.error(error);
      return;
    }
    if (error.code === "23505") return send(res, 409, { error: "That already exists." });
    if (error.code === "22P02") return send(res, 400, { error: "That id is invalid." });
    send(res, error.status || 500, { error: error.status ? error.message : "Something went wrong." });
    if (!error.status) console.error(error);
  }
});

server.listen(port, () => {
  console.log(`api http://localhost:${port}`);
});
