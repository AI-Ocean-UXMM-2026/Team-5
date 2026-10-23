import { pool, requireDatabaseUrl } from "./db.js";
import { loadCatalogue, syncEmbeddings } from "./rag.js";

// Embeds published courses that are new or changed, for the AI roadmap search.
requireDatabaseUrl();
if (!process.env.OPENAI_API_KEY) {
  console.error("Set OPENAI_API_KEY to build embeddings. The roadmap still works with keyword search without it.");
  process.exit(1);
}

const courses = await loadCatalogue();
const updated = await syncEmbeddings(courses);
console.log(`embedded ${updated} of ${courses.length} published courses`);
await pool.end();
