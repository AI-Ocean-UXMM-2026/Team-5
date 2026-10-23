import type { Certificate, Company, Course, Role, State } from "./types";

export const PASS_MARK = 0.7;

export function testPassed(correct: number, total: number) {
  return total > 0 && correct / total >= PASS_MARK;
}

export function allLessonsDone(doneLessons: string[], course: Course) {
  return course.lessons.every((l) => doneLessons.includes(l.id));
}

// A roadmap course opens once the one before it is finished (every lesson done or certified); a course you are already certified in stays open.
export function roadmapStepOpen(steps: Course[], index: number, doneLessons: string[], certifiedIds: string[]) {
  if (index === 0 || certifiedIds.includes(steps[index].id)) return true;
  const prev = steps[index - 1];
  return certifiedIds.includes(prev.id) || allLessonsDone(doneLessons, prev);
}

export function previewLessonCount(course: Course) {
  if (course.priceMmk === 0) return course.lessons.length;
  return Math.max(1, Math.ceil(course.lessons.length * 0.25));
}

// shortcut: paidCourseIds is a local unlock, not a payment; replace when billing exists.
export function paidTrackOpen(course: Course, paidCourseIds: string[] | undefined, certified: boolean) {
  return course.priceMmk === 0 || certified || (paidCourseIds ?? []).includes(course.id);
}

export function lessonIncluded(course: Course, index: number, paidCourseIds: string[] | undefined, certified: boolean) {
  return paidTrackOpen(course, paidCourseIds, certified) || index < previewLessonCount(course);
}

// A company challenge unlocks only after the learner finishes (is certified in) its course.
export function challengeUnlocked(certificates: Certificate[], learnerId: string, courseId: string) {
  return certificates.some((c) => c.learnerId === learnerId && c.courseId === courseId);
}

export function canPostAsCompany(company: Company | undefined) {
  return company?.status === "verified";
}

export function communityPostKind(role: Role) {
  return role === "company" ? "challenge" : "course";
}

export function companyChallengeIds(company: Company | undefined, challenges: { id: string; companyId: string }[]) {
  if (!company || company.status !== "verified") return [];
  return challenges.filter((c) => c.companyId === company.id).map((c) => c.id);
}

export type RegistrationView = "none" | "waiting" | "needs-info" | "rejected" | "live";

export function registrationView(company: Company | undefined): RegistrationView {
  if (company?.status === "verified") return "live";
  if (company?.status === "rejected") return "rejected";
  if (company?.status === "pending") return "waiting";
  if (company?.reviewNote) return "needs-info";
  return "none";
}

/** Our team's decision on a company waiting for review. Only a pending company can be verified. */
export function approveCompany(s: State, companyId: string, day: string): State {
  if (s.companies.find((c) => c.id === companyId)?.status !== "pending") return s;
  return { ...s, companies: s.companies.map((c) => (c.id === companyId ? { ...c, status: "verified", verifiedAt: day, reviewNote: undefined } : c)) };
}

export function counted(n: number, singular: string, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}

const keywords = (point: string) => point.toLowerCase().split(/\W+/).filter((w) => w.length > 3);

export function rubricMarks(answer: string, rubric: string[]) {
  const text = answer.toLowerCase();
  return rubric.map((point) => ({ point, met: keywords(point).some((w) => text.includes(w)) }));
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_LIKE = /\+?\d[\d\s().-]{5,}\d/g;

// shortcut: any run of 7+ digits counts as a phone number, so long plain numbers are also blocked; upgrade to a phone parser if that annoys users.
export function hasContactDetails(text: string) {
  return EMAIL.test(text) || (text.match(PHONE_LIKE) ?? []).some((m) => m.replace(/\D/g, "").length >= 7);
}

export function applyOffer(s: State, submissionId: string, interviewId: string): State {
  const sub = s.submissions.find((x) => x.id === submissionId);
  const ch = s.challenges.find((c) => c.id === sub?.challengeId);
  const existing = s.interviews.find((i) => i.submissionId === submissionId);
  if (!sub || !ch || sub.status === "offered" || (existing && existing.status !== "scheduled")) return s;
  return {
    ...s,
    submissions: s.submissions.map((x) => (x.id === sub.id ? { ...x, status: "offered" as const } : x)),
    interviews: existing
      ? s.interviews.map((i) => (i.id === existing.id ? { ...i, status: "offered" as const } : i))
      : [...s.interviews, { id: interviewId, submissionId: sub.id, challengeId: ch.id, learnerId: sub.learnerId, companyId: ch.companyId, when: "", status: "offered" }],
  };
}

export function replyToOffer(s: State, interviewId: string, accept: boolean): State {
  const row = s.interviews.find((i) => i.id === interviewId);
  if (!row || row.status !== "offered") return s;
  return { ...s, interviews: s.interviews.map((i) => (i.id === row.id ? { ...i, status: accept ? "accepted" : "declined" } : i)) };
}

const youtubeId = /^[A-Za-z0-9_-]{11}$/;

export function youtubeVideoId(value: string) {
  const raw = value.trim();
  if (!raw) return null;
  if (youtubeId.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);
    let id = "";
    if (host === "youtu.be") id = parts[0] || "";
    else if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
      id = url.searchParams.get("v") || "";
      const marker = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live");
      if (!id && marker >= 0) id = parts[marker + 1] || "";
    }
    if (youtubeId.test(id)) return id;
  } catch {
    // Not a URL.
  }
  return undefined;
}

export function emailMatchesWebsite(email: string, website: string) {
  try {
    const host = new URL(/^https?:\/\//.test(website) ? website : `https://${website}`).hostname.replace(/^www\./, "");
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    return domain === host || domain.endsWith(`.${host}`);
  } catch {
    return false;
  }
}
