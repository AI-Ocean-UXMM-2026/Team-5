"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Field";
import { courseTitle, formatMmk } from "@/lib/i18n";
import { compressImage, latestPayment, methodName, paymentAccounts, reviewPayment } from "@/lib/payments";
import { paidTrackOpen } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { newId, progressOf, setState, today, useData } from "@/lib/store";

export default function PayForCourse() {
  const { courseId } = useParams<{ courseId: string }>();
  const { s, me, lang } = useData();
  const courses = useCourses();
  const course = courses.find((c) => c.id === courseId);
  const [method, setMethod] = useState<string>(paymentAccounts[0].id);
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState("");
  const [fileError, setFileError] = useState("");
  const [tried, setTried] = useState(false);
  const [copied, setCopied] = useState("");
  const [staffNote, setStaffNote] = useState("We could not find this transfer. Please check the amount and upload a clearer screenshot.");
  if (!course) return <Empty action={<LinkButton href="/courses">See all courses</LinkButton>}>Course not found.</Empty>;

  const title = courseTitle(course, lang);
  const p = progressOf(s, me.id);
  const certified = s.certificates.some((c) => c.learnerId === me.id && c.courseId === course.id);
  const payment = latestPayment(s, me.id, course.id);
  const crumbs = [
    { label: "Courses", href: "/courses" },
    { label: title, href: `/courses/${course.id}` },
    { label: "Buy" },
  ];

  if (course.priceMmk === 0 || (paidTrackOpen(course, p.paidCourseIds, certified) && payment?.status !== "approved"))
    return (
      <>
        <Breadcrumb items={crumbs} />
        <Empty pose="cheer" action={<LinkButton href={`/courses/${course.id}`}>Go to the course</LinkButton>}>
          {course.priceMmk === 0 ? "This course is free. No payment needed." : "You already have the full course."}
        </Empty>
      </>
    );

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!receipt) return;
    setState((st) => ({
      ...st,
      payments: [
        ...(st.payments ?? []),
        { id: newId("pay"), learnerId: me.id, courseId: course.id, amountMmk: course.priceMmk, method, reference: reference.trim(), receipt, status: "pending", submittedAt: today() },
      ],
    }));
    setReceipt("");
    setReference("");
    setTried(false);
  };

  const showForm = !payment || payment.status === "rejected";

  return (
    <>
      <Breadcrumb items={crumbs} />
      <PageHeader title="Buy the full course" intro={`${title}. Pay once by mobile wallet, send us your receipt, and our team opens the rest of the course.`} pose="star" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          {payment?.status === "pending" && (
            <Card className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-h4">We&apos;re checking your payment</h2>
                <Badge tone="highlight">Waiting for staff</Badge>
              </div>
              <p className="text-muted">Our team checks every receipt, usually within 1 working day. We&apos;ll send you a notification when the full course is open.</p>
              <Receipt payment={payment} />
              {/* Demo only: in the real product our staff do this from their own screen. */}
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-line p-4">
                <p className="text-body-sm font-semibold">Demo controls</p>
                <p className="text-body-sm text-muted">In the real product our staff check the receipt. Use these to continue the demo.</p>
                <Button className="self-start" onClick={() => setState((st) => reviewPayment(st, payment.id, true, "", today()))}>
                  Simulate staff approval
                </Button>
                <Textarea label="Message to the learner" value={staffNote} onChange={(e) => setStaffNote(e.target.value)} />
                <Button variant="secondary" className="self-start" onClick={() => setState((st) => reviewPayment(st, payment.id, false, staffNote.trim() || "We could not confirm this payment.", today()))}>
                  Reject payment
                </Button>
              </div>
            </Card>
          )}

          {payment?.status === "approved" && (
            <Card tone="success" className="flex flex-col items-start gap-3">
              <h2 className="text-h4">Payment approved</h2>
              <p>The full course, the final test and the certificate are open for you.</p>
              <LinkButton href={`/courses/${course.id}`}>Continue the course</LinkButton>
            </Card>
          )}

          {showForm && (
            <>
              {payment?.status === "rejected" && (
                <Card tone="danger" className="flex flex-col gap-2">
                  <h2 className="text-h4">We couldn&apos;t confirm your payment</h2>
                  <p>{payment.staffNote}</p>
                  <p className="text-body-sm">Check the details below and send your receipt again.</p>
                </Card>
              )}
              <Card className="flex flex-col gap-4">
                <h2 className="text-h4">1. Send {formatMmk(course.priceMmk)} to one of these accounts</h2>
                <ul className="grid gap-3 sm:grid-cols-3">
                  {paymentAccounts.map((a) => (
                    <li key={a.id} className="flex flex-col gap-2 rounded-xl border border-line p-3">
                      <span className={`w-fit rounded-lg px-2 py-0.5 text-caption font-semibold ${a.tone}`}>{a.name}</span>
                      <span className="text-body-sm text-muted">{a.accountName}</span>
                      <span className="font-heading text-body-lg font-semibold tracking-wide">{a.number}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(a.number.replace(/\s/g, "")).catch(() => {});
                          setCopied(a.id);
                        }}
                        className="w-fit rounded-lg px-2 py-1 text-body-sm font-medium text-burgundy hover:bg-burgundy-tint"
                      >
                        {copied === a.id ? "✓ Copied" : "Copy number"}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="text-body-sm text-muted">Send the exact amount. Never send money to a number that is not on this page, even if someone asks you to in a message.</p>
              </Card>

              <Card>
                <h2 className="mb-4 text-h4">2. Send us your receipt</h2>
                <form className="flex flex-col gap-4" onSubmit={send}>
                  <fieldset>
                    <legend className="mb-2 text-body-sm font-medium">Which app did you pay with?</legend>
                    <div className="flex flex-wrap gap-2">
                      {paymentAccounts.map((a) => (
                        <label
                          key={a.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${method === a.id ? "border-burgundy bg-burgundy-tint text-burgundy" : "border-line hover:bg-surface"}`}
                        >
                          <input type="radio" name="method" checked={method === a.id} onChange={() => setMethod(a.id)} className="accent-burgundy" />
                          {a.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <Input
                    label="Transaction number (optional)"
                    placeholder="From your receipt, e.g. 0123456789"
                    value={reference}
                    onChange={(e) => setReference(e.target.value.slice(0, 40))}
                  />
                  <Input
                    label="Receipt screenshot"
                    type="file"
                    accept="image/*"
                    className="py-2"
                    hint="A screenshot of the finished transfer, showing the amount, date and number."
                    error={fileError || (tried && !receipt ? "Upload your receipt screenshot." : undefined)}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      setFileError("");
                      setReceipt("");
                      if (!file) return;
                      try {
                        setReceipt(await compressImage(file));
                      } catch (err) {
                        setFileError(err instanceof Error ? err.message : "Could not read that image.");
                      }
                    }}
                  />
                  {receipt && (
                    // eslint-disable-next-line @next/next/no-img-element -- a local data URL preview, not a remote image
                    <img src={receipt} alt="Your receipt screenshot" className="max-h-72 w-fit rounded-xl border border-line object-contain" />
                  )}
                  <Button type="submit" className="self-start">
                    Send receipt
                  </Button>
                </form>
              </Card>
            </>
          )}
        </div>

        <Card className="flex flex-col gap-3 lg:sticky lg:top-24">
          <h2 className="text-h4">Your order</h2>
          <p className="font-medium">{title}</p>
          <p className="font-heading text-h3 font-semibold">{formatMmk(course.priceMmk)}</p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-muted">
            <li>Every lesson and quiz</li>
            <li>The final test and certificate</li>
            <li>Company challenges, at no extra cost</li>
          </ul>
          <p className="border-t border-line pt-3 text-body-sm text-muted">Applying for internships and interviews is always free.</p>
        </Card>
      </div>
    </>
  );
}

function Receipt({ payment }: { payment: { receipt: string; method: string; reference: string; amountMmk: number; submittedAt: string } }) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- a local data URL, not a remote image */}
      <img src={payment.receipt} alt="Your receipt screenshot" className="max-h-48 w-fit rounded-xl border border-line object-contain" />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body-sm">
        <dt className="text-muted">Paid with</dt>
        <dd>{methodName(payment.method)}</dd>
        <dt className="text-muted">Amount</dt>
        <dd>{formatMmk(payment.amountMmk)}</dd>
        <dt className="text-muted">Transaction</dt>
        <dd>{payment.reference || "Not given"}</dd>
        <dt className="text-muted">Sent</dt>
        <dd>{payment.submittedAt}</dd>
      </dl>
    </div>
  );
}
