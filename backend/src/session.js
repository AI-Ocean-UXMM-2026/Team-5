import { pool } from "./db.js";

const sessionMs = 30 * 24 * 60 * 60 * 1000;

export function readSessionId(req) {
  for (const part of (req.headers.cookie || "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === "citadel_session") return decodeURIComponent(rest.join("="));
  }
  return "";
}

export function setSessionCookie(res, id) {
  const maxAge = id ? Math.floor(sessionMs / 1000) : 0;
  // A Vercel page and this API are different sites, so Lax is dropped. Secure is valid on https and on http://localhost.
  res.setHeader("Set-Cookie", `citadel_session=${id}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${maxAge}`);
}

export async function userFromRequest(req) {
  const id = readSessionId(req);
  if (!id) return null;
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.role, u.name, u.email, u.headline
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = $1 AND s.expires_at > now()`,
      [id],
    );
    return rows[0] || null;
  } catch (error) {
    if (error.code === "22P02") return null;
    throw error;
  }
}

export async function openSession(res, userId) {
  const { rows } = await pool.query("INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id", [
    userId,
    new Date(Date.now() + sessionMs),
  ]);
  setSessionCookie(res, rows[0].id);
}
