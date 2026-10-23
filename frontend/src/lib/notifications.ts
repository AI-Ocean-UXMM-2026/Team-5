import { approveCompany, PASS_MARK } from "./rules";
import { getCourses } from "./catalogue";
import { formatPlace, formatWhen } from "./i18n";
import { latestCompanyPayment, reviewCompanyPayment, reviewPayment } from "./payments";
import type { State } from "./types";

/**
 * `approve` stands in for our staff until they have their own screen: opening the notification
 * applies the decision, then the link shows the page after approval.
 */
export type Notification = { id: string; title: string; body: string; href: string; at: string; approve?: (s: State, day: string) => State };

/** Built from the demo data, so a notification appears as soon as its event happens. */
export function notificationsFor(s: State, userId: string): Notification[] {
  const list: Notification[] = [];
  const courses = getCourses();
  for (const i of s.interviews) {
    if (i.learnerId !== userId) continue;
    const company = s.companies.find((c) => c.id === i.companyId);
    const role = company?.terms.role || "internship";
    if (i.status === "offered")
      list.push({
        id: `offer-${i.id}`,
        title: `${company?.name} sent you an offer`,
        body: `${role}, ${company?.terms.stipend}. Accept or decline it on the Internships page.`,
        href: "/internships",
        at: i.when.slice(0, 10),
      });
    if (i.status === "scheduled")
      list.push({
        id: `interview-${i.id}`,
        title: `Interview with ${company?.name}`,
        body: `${role} interview on ${formatWhen(i.when)}${i.format ? `, ${formatPlace({ format: i.format })}` : ""}.`,
        href: "/internships",
        at: i.when.slice(0, 10),
      });
  }
  for (const pay of s.payments ?? []) {
    if (pay.learnerId !== userId) continue;
    const course = courses.find((c) => c.id === pay.courseId);
    list.push(
      // Same id before and after approval, so opening it doesn't leave a second unread one behind.
      pay.status === "pending"
        ? {
            id: `payment-${pay.id}`,
            title: "Payment approved",
            body: `The full ${course?.title ?? "course"} course is open for you now.`,
            href: `/courses/${pay.courseId}`,
            at: pay.submittedAt,
            approve: (st, day) => reviewPayment(st, pay.id, true, "", day),
          }
        : pay.status === "approved"
        ? { id: `payment-${pay.id}`, title: "Payment approved", body: `The full ${course?.title ?? "course"} course is open for you now.`, href: `/courses/${pay.courseId}`, at: pay.reviewedAt ?? pay.submittedAt }
        : { id: `payment-${pay.id}`, title: "We couldn't confirm your payment", body: pay.staffNote ?? "Send your receipt again.", href: `/courses/${pay.courseId}/pay`, at: pay.reviewedAt ?? pay.submittedAt },
    );
  }
  for (const cert of s.certificates) {
    if (cert.learnerId !== userId) continue;
    const course = courses.find((c) => c.id === cert.courseId);
    list.push({ id: `cert-${cert.id}`, title: `You're certified in ${course?.title ?? "a course"}`, body: `You passed the final test with ${cert.score}%. Its company challenges are open now.`, href: `/certificates/${cert.id}`, at: cert.issuedAt });
  }
  const company = s.companies.find((c) => c.id === s.users.find((u) => u.id === userId)?.companyId);
  const approvedId = `company-approved-${company?.id}`;
  // After the company is live it stays in the list only for whoever opened it, so companies verified before this never get it.
  if (company && (company.status === "pending" || company.status === "approved" || (company.status === "verified" && s.seenNotifications?.[userId]?.includes(approvedId))))
    list.push({
      id: approvedId,
      title: "Your company is approved & ready to pay",
      body: "Our team checked your company. Choose a partner plan and pay the fee to go live.",
      href: "/company/registration/pay",
      at: company.approvedAt ?? "",
      approve: company.status === "pending" ? (st, day) => approveCompany(st, company.id, day) : undefined,
    });
  const fee = company && latestCompanyPayment(s, company.id);
  if (fee)
    list.push(
      // Same id before and after approval, so opening it doesn't leave a second unread one behind.
      fee.status === "rejected"
        ? { id: `company-pay-${fee.id}`, title: "We couldn't confirm your payment", body: fee.staffNote ?? "Send your receipt again.", href: "/company/registration/pay", at: fee.reviewedAt ?? fee.submittedAt }
        : {
            id: `company-pay-${fee.id}`,
            title: "Payment confirmed. Your company is live",
            body: "Your Verified badge is on. Check your company page, then post your first challenge.",
            href: "/company/registration/status",
            at: fee.reviewedAt ?? fee.submittedAt,
            approve: fee.status === "pending" ? (st, day) => reviewCompanyPayment(st, fee.id, true, "", day) : undefined,
          },
    );
  const progress = s.progress[userId];
  for (const [courseId, score] of Object.entries(progress?.testScores ?? {})) {
    if (score >= PASS_MARK * 100 || s.certificates.some((c) => c.learnerId === userId && c.courseId === courseId)) continue;
    const course = courses.find((c) => c.id === courseId);
    // The score is in the id, so each new failed attempt with a different score is a new notification.
    list.push({
      id: `test-${courseId}-${score}`,
      title: "Final test not passed yet",
      body: `You scored ${score}% in ${course?.title ?? "the final test"}. You need ${PASS_MARK * 100}%. Go over the lessons and try again.`,
      href: `/courses/${courseId}`,
      at: progress?.testDates?.[courseId] ?? "",
    });
  }
  // Offers wait for an answer, so they come first.
  return list.sort((a, b) => Number(b.id.startsWith("offer-")) - Number(a.id.startsWith("offer-")) || b.at.localeCompare(a.at));
}
