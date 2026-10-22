import type { State } from "./types";

export type Area = "guest" | "learner" | "company" | "shared";

export function homePath(s: State): string {
  const me = s.users.find((u) => u.id === s.sessionUserId);
  if (!me) return "/";
  if (me.role === "learner") return s.progress[me.id]?.roadmap.length ? "/roadmap" : "/onboarding";
  const company = s.companies.find((c) => c.id === me.companyId);
  if (company?.status === "verified") return company.approvalSeen ? "/company/challenges" : "/company/registration/status";
  if (company?.status === "pending" || company?.status === "rejected" || company?.reviewNote) return "/company/registration/status";
  return "/company/registration";
}

/** Where to send the current user instead of `pathname`, or null if they may stay. */
export function redirectFor(s: State, area: Area, pathname: string): string | null {
  // Guest layout would send a logged-in user home; these pages are public.
  if (pathname === "/legal" || pathname.startsWith("/legal/")) return null;
  const me = s.users.find((u) => u.id === s.sessionUserId);
  if (area === "guest") return me ? homePath(s) : null;
  if (!me) return "/login";
  const verified = s.companies.find((c) => c.id === me.companyId)?.status === "verified";
  const onRegistration = pathname.startsWith("/company/registration");
  const onStatus = pathname.startsWith("/company/registration/status");
  const ok =
    area === "learner"
      ? me.role === "learner"
      : area === "company"
        ? me.role === "company" && (verified ? !onRegistration || onStatus : onRegistration)
        : me.role === "learner" || verified || pathname.startsWith("/profile");
  return ok ? null : homePath(s);
}
