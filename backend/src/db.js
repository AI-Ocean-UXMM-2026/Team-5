import pg from "pg";
import { loadEnv } from "./env.js";

loadEnv();

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    console.error("Set DATABASE_URL. See .env.example.");
    process.exit(1);
  }
}

export async function withTx(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // The connection is already aborted.
    }
    throw error;
  } finally {
    client.release();
  }
}
