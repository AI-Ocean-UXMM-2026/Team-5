"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card, Empty, PageHeader } from "@/components/ui/Card";
import { courseTitle } from "@/lib/i18n";
import { allLessonsDone, challengeUnlocked } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { progressOf, useData } from "@/lib/store";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { s, me, lang } = useData();
  const course = courses.find((c) => c.id === courseId);
  if (!course) return <Empty>Course not found.</Empty>;

  const p = progressOf(s, me.id);
  const lessonsDone = allLessonsDone(p.doneLessons, course);
  const cert = s.certificates.find((c) => c.learnerId === me.id && c.courseId === course.id);
  const unlocked = challengeUnlocked(s.certificates, me.id, course.id);
  const challenges = s.challenges.filter((c) => c.courseId === course.id);

  return (
    <>
      <PageHeader title={courseTitle(course, lang)} intro={course.description} />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <h2 className="mb-4 text-h3">Lessons</h2>
          <ol className="flex flex-col divide-y divide-line">
            {course.lessons.map((l, i) => {
              const done = p.doneLessons.includes(l.id);
              return (
                <li key={l.id} className="flex items-center justify-between gap-4 py-3">
                  <Link href={`/courses/${course.id}/lessons/${l.id}`} className="font-medium hover:text-burgundy">
                    {i + 1}. {l.title}
                  </Link>
                  {done ? <Badge tone="success">✓ Done</Badge> : <Badge>To do</Badge>}
                </li>
              );
            })}
          </ol>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-2 text-h4">Final test</h2>
            {cert ? (
              <>
                <p className="mb-4 text-muted">You passed with {cert.score}%.</p>
                <LinkButton href={`/certificates/${cert.id}`} variant="secondary">
                  View certificate
                </LinkButton>
              </>
            ) : lessonsDone ? (
              <>
                <p className="mb-4 text-muted">All lessons done. Pass with 70% or more to get certified.</p>
                <LinkButton href={`/courses/${course.id}/test`}>Take the test</LinkButton>
              </>
            ) : (
              <p className="text-muted">Finish every lesson quiz to unlock the test.</p>
            )}
          </Card>
          <Card>
            <h2 className="mb-2 text-h4">Company challenges</h2>
            {!challenges.length && <p className="text-muted">No challenges for this course yet.</p>}
            <ul className="flex flex-col gap-2">
              {challenges.map((c) => (
                <li key={c.id}>
                  {unlocked ? (
                    <Link href={`/challenges/${c.id}`} className="font-medium text-burgundy hover:underline">
                      {c.title}
                    </Link>
                  ) : (
                    <span className="text-muted">🔒 {c.title}</span>
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
