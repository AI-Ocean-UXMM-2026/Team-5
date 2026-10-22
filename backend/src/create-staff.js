import { pool, requireDatabaseUrl } from "./db.js";
import { hashPassword } from "./password.js";

requireDatabaseUrl();

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password || password.length < 8) {
  console.error("Usage: npm run create-staff -- \"Name\" email@citadel.test \"password-at-least-8\"");
  process.exit(1);
}

const { rows } = await pool.query(
  `INSERT INTO users (role, name, email, password_hash)
   VALUES ('staff', $1, $2, $3)
   RETURNING id, email`,
  [name.trim(), email.trim().toLowerCase(), hashPassword(password)],
);
console.log(`staff ${rows[0].email} ${rows[0].id}`);
await pool.end();
