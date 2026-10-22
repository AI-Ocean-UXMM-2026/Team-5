import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import Busboy from "busboy";
import { pool, withTx } from "./db.js";
import { assertRole, corsHeaders, fail } from "./http.js";
import { youtubeVideoId } from "./rules.js";

export const uploadsDir = path.join(import.meta.dirname, "..", "uploads");
const types = { "application/pdf": ".pdf", "image/jpeg": ".jpg", "image/png": ".png" };

export async function ownCompany(userId) {
  const { rows } = await pool.query("SELECT * FROM companies WHERE owner_user_id = $1", [userId]);
  if (!rows[0]) throw fail(404, "Company profile was not found.");
  return rows[0];
}

function readUpload(req) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const stop = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    let busboy;
    try {
      busboy = Busboy({ headers: req.headers, limits: { files: 1, fileSize: 8 * 1024 * 1024 } });
    } catch {
      stop(fail(400, "Upload the document as a file."));
      return;
    }
    const chunks = [];
    let fileInfo = null;
    let tooBig = false;
    busboy.on("file", (field, file, info) => {
      if (field !== "file") {
        file.resume();
        return;
      }
      fileInfo = info;
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("limit", () => {
        tooBig = true;
      });
    });
    busboy.on("error", () => stop(fail(400, "Upload the document as a file.")));
    busboy.on("finish", () => {
      if (settled) return;
      settled = true;
      if (tooBig) return reject(fail(413, "File must be 8MB or smaller."));
      if (!fileInfo) return reject(fail(400, "Choose a document to upload."));
      resolve({ filename: fileInfo.filename, mime: fileInfo.mimeType, buffer: Buffer.concat(chunks) });
    });
    req.pipe(busboy);
  });
}

export async function uploadDocument({ req, res, user, send }) {
  assertRole(user, ["company"]);
  const company = await ownCompany(user.id);
  if (!String(req.headers["content-type"] || "").includes("multipart/form-data")) throw fail(400, "Upload the document as a file.");
  const file = await readUpload(req);
  const ext = types[file.mime];
  if (!ext) throw fail(400, "Upload a PDF, JPG, or PNG.");
  if (!file.buffer.length) throw fail(400, "That file is empty.");
  await mkdir(uploadsDir, { recursive: true });
  const storageKey = `${randomUUID()}${ext}`;
  await writeFile(path.join(uploadsDir, storageKey), file.buffer);
  const filename = path.basename(file.filename || `document${ext}`).slice(0, 200);
  let rows;
  try {
    ({ rows } = await pool.query(
      `INSERT INTO company_files (company_id, kind, storage_key, filename) VALUES ($1, 'document', $2, $3) RETURNING id`,
      [company.id, storageKey, filename],
    ));
  } catch (error) {
    await unlink(path.join(uploadsDir, storageKey)).catch(() => {});
    throw error;
  }
  send(res, 201, { id: rows[0].id, filename });
}

export async function submitCompany({ res, user, body, send }) {
  assertRole(user, ["company"]);
  const company = await ownCompany(user.id);
  if (company.status === "pending") throw fail(409, "This registration is already waiting for review.");
  if (company.status === "verified") throw fail(409, "This company is already verified.");
  const docs = await pool.query("SELECT 1 FROM company_files WHERE company_id = $1 AND kind = 'document'", [company.id]);
  if (!docs.rowCount) throw fail(400, "Upload a registration document first.");
  let videoId = company.video_id;
  if (body?.videoUrl !== undefined || body?.videoId !== undefined) {
    videoId = youtubeVideoId(body.videoUrl ?? body.videoId ?? "");
    if (videoId === undefined) throw fail(400, "Use a YouTube video link.");
  }
  await pool.query("UPDATE companies SET status = 'pending', review_note = NULL, video_id = $2 WHERE id = $1", [company.id, videoId]);
  send(res, 200, { status: "pending", videoId });
}

export async function listStaffCompanies({ res, user, url, send }) {
  assertRole(user, ["staff"]);
  const status = url.searchParams.get("status") || "pending";
  const values = [];
  let where = "c.status = $1";
  if (status === "needs-info") where = "c.status = 'draft' AND c.review_note IS NOT NULL";
  else if (!["draft", "pending", "verified", "rejected"].includes(status)) throw fail(400, "Status is invalid.");
  else values.push(status);
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.email, c.status, c.review_note, c.verified_at, c.video_id,
            COALESCE(json_agg(json_build_object('id', f.id, 'filename', f.filename, 'kind', f.kind))
              FILTER (WHERE f.id IS NOT NULL), '[]') AS files
     FROM companies c
     LEFT JOIN company_files f ON f.company_id = c.id
     WHERE ${where}
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    values,
  );
  send(res, 200, {
    companies: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status,
      reviewNote: row.review_note,
      verifiedAt: row.verified_at,
      videoId: row.video_id,
      files: row.files,
    })),
  });
}

export async function downloadCompanyFile({ res, user, params }) {
  assertRole(user, ["staff"]);
  const { rows } = await pool.query("SELECT storage_key, filename FROM company_files WHERE id = $1", [params.id]);
  if (!rows[0]) throw fail(404, "File was not found.");
  const full = path.join(uploadsDir, path.basename(rows[0].storage_key));
  try {
    await access(full);
  } catch {
    throw fail(404, "File was not found.");
  }
  const ext = path.extname(full).toLowerCase();
  const mime = { ".pdf": "application/pdf", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" }[ext] || "application/octet-stream";
  res.writeHead(200, {
    ...corsHeaders(res.citadelOrigin),
    "Content-Type": mime,
    "Content-Disposition": `attachment; filename="${String(rows[0].filename).replace(/"/g, "")}"`,
  });
  const stream = createReadStream(full);
  stream.on("error", () => res.destroy());
  stream.pipe(res);
}

export async function reviewCompany({ res, user, body, params, send }) {
  assertRole(user, ["staff"]);
  const decision = body.decision;
  if (!["verified", "rejected", "needs-info"].includes(decision)) throw fail(400, "Decision must be verified, rejected, or needs-info.");
  const note = String(body.note || "").trim();
  if (decision === "needs-info" && !note) throw fail(400, "A note is required.");
  const next = decision === "needs-info" ? "draft" : decision;
  const result = await withTx(async (client) => {
    const { rows } = await client.query("SELECT id, status FROM companies WHERE id = $1 FOR UPDATE", [params.id]);
    if (!rows[0]) throw fail(404, "Company was not found.");
    await client.query(
      `UPDATE companies
       SET status = $2, review_note = $3, verified_at = CASE WHEN $2 = 'verified' THEN now() ELSE NULL END
       WHERE id = $1`,
      [params.id, next, decision === "verified" ? null : note || null],
    );
    await client.query(
      `INSERT INTO staff_actions (staff_user_id, subject_type, subject_id, from_status, to_status, note)
       VALUES ($1, 'company', $2, $3, $4, $5)`,
      [user.id, params.id, rows[0].status, decision, note],
    );
    return { status: next, reviewNote: decision === "verified" ? null : note || null };
  });
  send(res, 200, result);
}
