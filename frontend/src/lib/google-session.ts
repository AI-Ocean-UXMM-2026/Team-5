import type { Company, State, User } from "./types";

export type GoogleAccount = { id: string; role: string; name: string; email: string; headline?: string };

function draftCompany(id: string, name: string, email: string): Company {
  return {
    id,
    name,
    about: "",
    website: "",
    social: "",
    address: "",
    phone: "",
    email,
    documents: [],
    terms: { role: "", duration: "", location: "", stipend: "" },
    status: "draft",
  };
}

export function googleSession(state: State, account: GoogleAccount): State {
  if (account.role !== "learner" && account.role !== "company") throw new Error("This account cannot open the demo.");
  const email = account.email.trim().toLowerCase();
  const existing = state.users.find((user) => user.id === account.id || user.email.toLowerCase() === email);
  if (existing) return { ...state, sessionUserId: existing.id };
  const user: User = {
    id: account.id,
    role: account.role,
    name: account.name.trim() || email,
    email,
    headline: account.headline || "",
    skills: [],
  };
  if (account.role === "learner") return { ...state, sessionUserId: user.id, users: [...state.users, user] };
  const companyId = `c-${account.id}`;
  return {
    ...state,
    sessionUserId: user.id,
    users: [...state.users, { ...user, companyId }],
    companies: [...state.companies, draftCompany(companyId, user.name, email)],
  };
}
