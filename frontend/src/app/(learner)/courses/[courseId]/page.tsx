"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, cardLinkClass, cardLinkStretch, Empty, PageHeader } from "@/components/ui/Card";
import { LockIcon } from "@/components/ui/LockIcon";
import { courseTitle, formatMmk } from "@/lib/i18n";
import { latestPayment } from "@/lib/payments";
import { allLessonsDone, challengeUnlocked, counted, lessonIncluded, paidTrackOpen, previewLessonCount } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { progressOf, useData } from "@/lib/store";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { s, me, lang } = useData();
  const courses = useCourses();
  const course = courses.find((c) => c.id === courseId);
  if (!course) return <Empty action={<LinkButton href="/courses">See all courses</LinkButton>}>Course not found.</Empty>;

  const p = progressOf(s, me.id);
  const lessonsDone = allLessonsDone(p.doneLessons, course);
  const cert = s.certificates.find((c) => c.learnerId === me.id && c.courseId === course.id);
  const trackOpen = paidTrackOpen(course, p.paidCourseIds, !!cert);
  const unlocked = challengeUnlocked(s.certificates, me.id, course.id);
  const payment = latestPayment(s, me.id, course.id);
  const challenges = s.challenges.filter((c) => c.courseId === course.id);

  const title = courseTitle(course, lang);
  // The lesson to pick up next: the first open one not done yet.
  const nextLessonId = course.lessons.find((l, i) => !p.doneLessons.includes(l.id) && lessonIncluded(course, i, p.paidCourseIds, !!cert))?.id;

  return (
    <>
      <Breadcrumb items={[{ label: "Courses", href: "/courses" }, { label: title }]} />
      <PageHeader title={title} intro={course.description} />
      <div className="grid items-stretch gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="h-full">
          <h2 className="mb-4 text-h3">Lessons</h2>
          <ol className="-mx-2 flex flex-col gap-1">
            {course.lessons.map((l, i) => {
              const done = p.doneLessons.includes(l.id);
              const open = lessonIncluded(course, i, p.paidCourseIds, !!cert);
              const next = l.id === nextLessonId;
              const marker = (
                <span
                  aria-hidden
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-body-sm font-semibold ${done ? "bg-success text-white" : next ? "bg-burgundy text-white" : open ? "border border-line bg-white text-ink" : "bg-surface text-subtle"}`}
                >
                  {done ? "✓" : open ? i + 1 : <LockIcon size={13} />}
                </span>
              );
              const text = (
                <span className="min-w-0 flex-1">
                  <span className={`block font-medium ${open ? "" : "text-muted"}`}>{l.title}</span>
                  <span className="block text-body-sm text-muted">
                    Lesson {i + 1} · {done ? "Quiz passed" : `Practice quiz · ${counted(l.quiz.length, "question")}`}
                  </span>
                </span>
              );
              return (
                <li key={l.id}>
                  {open ? (
                    <Link
                      href={`/courses/${course.id}/lessons/${l.id}`}
                      className={`group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors focus-visible:ring-2 focus-visible:ring-burgundy ${next ? "bg-burgundy-tint/50 hover:bg-burgundy-tint" : "hover:bg-surface"}`}
                    >
                      {marker}
                      {text}
                      <span
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${next ? "bg-burgundy text-white" : "border border-line bg-white text-ink group-hover:border-subtle"}`}
                      >
                        {done ? "Review" : next && p.doneLessons.some((id) => course.lessons.some((x) => x.id === id)) ? "Continue" : "Start"}
                      </span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-burgundy">
                        <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-2 py-3">
                      {marker}
                      {text}
                      <Badge>
                        <LockIcon /> Locked
                      </Badge>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          {!trackOpen && (
            <div className="mt-4">
              <p className="text-body-sm text-muted">
                {previewLessonCount(course) === 1 ? "The first lesson is free." : `The first ${previewLessonCount(course)} lessons are free.`} The rest of this course, the final test and the certificate are on the paid track.
              </p>
              {payment?.status === "pending" ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Badge tone="highlight">Payment being checked</Badge>
                  <LinkButton href={`/courses/${course.id}/pay`} variant="secondary">
                    See payment
                  </LinkButton>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <LinkButton href={`/courses/${course.id}/pay`}>Buy the full course · {formatMmk(course.priceMmk)}</LinkButton>
                  {payment?.status === "rejected" && <Badge tone="danger">Last payment not confirmed</Badge>}
                </div>
              )}
            </div>
          )}
        </Card>
        <div className="flex h-full flex-col gap-4">
          <Card className={`${cert || (trackOpen && lessonsDone) ? cardLinkClass : ""} flex flex-1 flex-col`}>
            <h2 className="mb-2 text-h4">Final test</h2>
            {cert ? (
              <>
                <p className="mb-4 text-muted">You passed with {cert.score}%.</p>
                <LinkButton href={`/certificates/${cert.id}`} variant="secondary" className={cardLinkStretch}>
                  View certificate
                </LinkButton>
              </>
            ) : !trackOpen ? (
              <p className="text-muted">The final test is included with the paid track.</p>
            ) : lessonsDone ? (
              <>
                <p className="mb-4 text-muted">All lessons done. Pass with 70% or more to get certified.</p>
                <LinkButton href={`/courses/${course.id}/test`} className={cardLinkStretch}>
                  Take the test
                </LinkButton>
              </>
            ) : (
              <p className="text-muted">Finish every lesson quiz to unlock the test.</p>
            )}
          </Card>
          <Card className="flex flex-1 flex-col">
            <h2 className="mb-2 text-h4">Company challenges</h2>
            {!challenges.length && <p className="text-muted">No challenges for this course yet.</p>}
            <ul className="flex flex-col gap-2">
              {challenges.map((c) => (
                <li key={c.id}>
                  {unlocked ? (
                    <Link href={`/challenges/${c.id}`} className={`${cardLinkClass} block rounded-xl border border-line px-3 py-2 font-medium`}>
                      {c.title}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted">
                      <LockIcon />
                      {c.title}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {!unlocked && !!challenges.length && <p className="mt-2 text-body-sm text-muted">Unlocks when you get certified in this course.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
