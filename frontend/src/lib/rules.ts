import type { Certificate, Company, Course } from "./types";

export const PASS_MARK = 0.7;

export function testPassed(correct: number, total: number) {
  return total > 0 && correct / total >= PASS_MARK;
}

export function allLessonsDone(doneLessons: string[], course: Course) {
  return course.lessons.every((l) => doneLessons.includes(l.id));
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

export function emailMatchesWebsite(email: string, website: string) {
  try {
    const host = new URL(/^https?:\/\//.test(website) ? website : `https://${website}`).hostname.replace(/^www\./, "");
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    return domain === host || domain.endsWith(`.${host}`);
  } catch {
    return false;
  }
}
