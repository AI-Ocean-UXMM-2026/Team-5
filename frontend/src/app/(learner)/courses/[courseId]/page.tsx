"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, cardLinkClass, cardLinkStretch, Empty, LockIcon, PageHeader } from "@/components/ui/Card";
import { courseTitle, formatMmk } from "@/lib/i18n";
import { latestPayment } from "@/lib/payments";
import { allLessonsDone, challengeUnlocked, lessonIncluded, paidTrackOpen, previewLessonCount } from "@/lib/rules";
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

  return (
    <>
      <Breadcrumb items={[{ label: "Courses", href: "/courses" }, { label: title }]} />
      <PageHeader title={title} intro={course.description} />
      <div className="grid items-stretch gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="h-full">
          <h2 className="mb-4 text-h3">Lessons</h2>
          <ol className="flex flex-col divide-y divide-line">
            {course.lessons.map((l, i) => {
              const done = p.doneLessons.includes(l.id);
              const open = lessonIncluded(course, i, p.paidCourseIds, !!cert);
              return (
                <li key={l.id} className="flex items-center justify-between gap-4 py-3">
                  {open ? (
                    <Link href={`/courses/${course.id}/lessons/${l.id}`} className="font-medium hover:text-burgundy">
                      {i + 1}. {l.title}
                    </Link>
                  ) : (
                    <span className="font-medium text-muted">
                      {i + 1}. {l.title}
                    </span>
                  )}
                  {done ? (
                    <Badge tone="success">✓ Done</Badge>
                  ) : open ? (
                    <Badge>To do</Badge>
                  ) : (
                    <Badge>
                      <LockIcon /> Locked
                    </Badge>
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
                    <span className="inline-flex items-center gap-1 text-muted">
                      <LockIcon /> {c.title}
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
