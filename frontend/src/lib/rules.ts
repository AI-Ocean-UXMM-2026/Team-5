import type { Certificate, Company, Course } from "./types";

export const PASS_MARK = 0.7;

export function testPassed(correct: number, total: number) {
  return total > 0 && correct / total >= PASS_MARK;
}

export function allLessonsDone(doneLessons: string[], course: Course) {
  return course.lessons.every((l) => doneLessons.includes(l.id));
}

// A company challenge unlocks only after the learner finishes (is certified in) its course.
export function challengeUnlocked(certificates: Certificate[], learnerId: string, courseId: string) {
  return certificates.some((c) => c.learnerId === learnerId && c.courseId === courseId);
}

export function canPostAsCompany(company: Company | undefined) {
  return company?.status === "verified";
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_LIKE = /\+?\d[\d\s().-]{5,}\d/g;

// shortcut: any run of 7+ digits counts as a phone number, so long plain numbers are also blocked; upgrade to a phone parser if that annoys users.
export function hasContactDetails(text: string) {
  return EMAIL.test(text) || (text.match(PHONE_LIKE) ?? []).some((m) => m.replace(/\D/g, "").length >= 7);
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
