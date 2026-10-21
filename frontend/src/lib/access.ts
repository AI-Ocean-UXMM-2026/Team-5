import type { State } from "./types";

export type Area = "guest" | "learner" | "company" | "shared";

export function homePath(s: State): string {
  const me = s.users.find((u) => u.id === s.sessionUserId);
  if (!me) return "/login";
  if (me.role === "learner") return s.progress[me.id]?.roadmap.length ? "/roadmap" : "/onboarding";
  const status = s.companies.find((c) => c.id === me.companyId)?.status;
  if (status === "verified") return "/company/challenges";
  return status === "pending" ? "/company/registration/status" : "/company/registration";
}

/** Where to send the current user instead of `pathname`, or null if they may stay. */
export function redirectFor(s: State, area: Area, pathname: string): string | null {
  const me = s.users.find((u) => u.id === s.sessionUserId);
  if (area === "guest") return me ? homePath(s) : null;
  if (!me) return "/login";
  const verified = s.companies.find((c) => c.id === me.companyId)?.status === "verified";
  const ok =
    area === "learner"
      ? me.role === "learner"
      : area === "company"
        ? me.role === "company" && verified !== pathname.startsWith("/company/registration")
        : me.role === "learner" || verified || pathname.startsWith("/profile");
  return ok ? null : homePath(s);
}
