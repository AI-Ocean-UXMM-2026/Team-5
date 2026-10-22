import { OAuth2Client } from "google-auth-library";
import { pool } from "./db.js";
import { fail } from "./http.js";

export async function signInWithGoogle(idToken) {
  if (!process.env.GOOGLE_CLIENT_ID) throw fail(503, "Google sign-in is not configured.");
  return linkGoogleAccount(await verifyGoogleToken(idToken));
}

async function verifyGoogleToken(idToken) {
  if (!idToken || typeof idToken !== "string") throw fail(400, "Google token is required.");
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = String(payload?.email || "").trim().toLowerCase();
    if (!email || !payload?.email_verified || !payload.sub) throw fail(400, "Google account has no verified email.");
    return { sub: payload.sub, email, name: String(payload.name || email).trim() || email };
  } catch (error) {
    if (error.status) throw error;
    throw fail(401, "Google token is invalid.");
  }
}

export async function linkGoogleAccount({ sub, email, name }) {
  const { rows } = await pool.query(
    `SELECT id, role, name, email, headline, google_sub FROM users WHERE google_sub = $1 OR email = $2`,
    [sub, email],
  );
  if (rows.length > 1) throw fail(409, "This Google account does not match the email on file.");
  const existing = rows[0];
  if (existing?.role === "staff") throw fail(403, "Staff accounts cannot use Google sign-in.");
  if (existing?.google_sub && existing.google_sub !== sub) throw fail(409, "This email is already linked to another Google account.");
  if (existing) {
    if (!existing.google_sub) await pool.query("UPDATE users SET google_sub = $1 WHERE id = $2", [sub, existing.id]);
    return existing;
  }
  try {
    const created = await pool.query(
      `INSERT INTO users (role, name, email, google_sub) VALUES ('learner', $1, $2, $3)
       RETURNING id, role, name, email, headline`,
      [name, email, sub],
    );
    return created.rows[0];
  } catch (error) {
    if (error.code === "23505") throw fail(409, "An account with this email already exists.");
    throw error;
  }
}
