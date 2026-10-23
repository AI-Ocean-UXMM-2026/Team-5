import { pool } from "./db.js";

export async function listSkills({ send, res }) {
  const { rows } = await pool.query(
    `SELECT s.id, s.label_en, s.label_my, g.goal_id
     FROM skills s
     JOIN goal_skills g ON g.skill_id = s.id
     ORDER BY g.goal_id, g.position`,
  );
  send(res, 200, {
    skills: rows.map((row) => ({ id: row.id, en: row.label_en, my: row.label_my, goalId: row.goal_id })),
  });
}
