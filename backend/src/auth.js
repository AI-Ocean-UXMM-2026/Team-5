const OPEN_ROLES = new Set(["learner", "company", "teacher"]);

export function validateSignup(body) {
  const role = body?.role;
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const companyName = String(body?.companyName || "").trim();
  if (!OPEN_ROLES.has(role)) return "Role must be learner, company, or teacher.";
  if (!name) return "Name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email is invalid.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (role === "company" && !companyName) return "Company name is required.";
  return null;
}

export function publicUser(row) {
  return { id: row.id, role: row.role, name: row.name, email: row.email, headline: row.headline };
}
