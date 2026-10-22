import { readdirSync, readFileSync } from "node:fs";
import { pool, requireDatabaseUrl } from "./db.js";

requireDatabaseUrl();

await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`);

const dir = new URL("../migrations/", import.meta.url);
const applied = new Set((await pool.query("SELECT name FROM schema_migrations")).rows.map((row) => row.name));

for (const name of readdirSync(dir).filter((file) => file.endsWith(".sql")).sort()) {
  if (applied.has(name)) continue;
  const sql = readFileSync(new URL(name, dir), "utf8");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
    await client.query("COMMIT");
    console.log(`applied ${name}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

await pool.end();
