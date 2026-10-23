import { emptyProgress } from "./seed.ts";
import type { CoursePayment, State } from "./types";

// shortcut: placeholder accounts for the demo; replace with The Citadel's real wallet numbers before taking real money.
export const paymentAccounts = [
  { id: "kpay", name: "KBZPay (KPay)", accountName: "The Citadel", number: "09 000 000 001", tone: "bg-[#0b4ea2] text-white" },
  { id: "wavepay", name: "WavePay", accountName: "The Citadel", number: "09 000 000 002", tone: "bg-[#ffd200] text-ink" },
  { id: "ayapay", name: "AYA Pay", accountName: "The Citadel", number: "09 000 000 003", tone: "bg-[#c8102e] text-white" },
] as const;

export const methodName = (id: string) => paymentAccounts.find((a) => a.id === id)?.name ?? id;

/** The learner's latest payment for a course, if any. */
export function latestPayment(s: State, learnerId: string, courseId: string): CoursePayment | undefined {
  return (s.payments ?? []).filter((p) => p.learnerId === learnerId && p.courseId === courseId).at(-1);
}

/** Staff decision on a payment. Approving opens the paid track for that course. */
export function reviewPayment(s: State, paymentId: string, approve: boolean, note: string, day: string): State {
  const payment = s.payments?.find((p) => p.id === paymentId);
  if (!payment || payment.status !== "pending") return s;
  const payments = s.payments!.map((p) =>
    p.id === paymentId ? { ...p, status: approve ? ("approved" as const) : ("rejected" as const), staffNote: approve ? undefined : note, reviewedAt: day } : p,
  );
  if (!approve) return { ...s, payments };
  // A learner who paid before setting a goal has no progress yet; start one so the course still opens.
  const progress = s.progress[payment.learnerId] ?? emptyProgress;
  const paidCourseIds = [...new Set([...(progress.paidCourseIds ?? []), payment.courseId])];
  return { ...s, payments, progress: { ...s.progress, [payment.learnerId]: { ...progress, paidCourseIds } } };
}

/** Shrinks a receipt photo so it fits in browser storage (about 100–300 KB). */
export function compressImage(file: File, maxSide = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file is not an image we can read. Upload a PNG or JPG screenshot."));
    };
    img.src = url;
  });
}
