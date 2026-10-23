"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Quiz } from "@/components/Quiz";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, Empty, PageHeader } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { courseTitle } from "@/lib/i18n";
import { PASS_MARK, allLessonsDone, paidTrackOpen, testPassed } from "@/lib/rules";
import { gradeFinalTest } from "@/lib/answers";
import { useCourses } from "@/lib/catalogue";
import { progressOf, setState, today, updateProgress, useData } from "@/lib/store";

export default function TestPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { s, me, lang } = useData();
  const courses = useCourses();
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const course = courses.find((c) => c.id === courseId);
  if (!course) return <Empty action={<LinkButton href="/courses">See all courses</LinkButton>}>Course not found.</Empty>;
  const title = courseTitle(course, lang);
  const crumbs = [
    { label: "Courses", href: "/courses" },
    { label: title, href: `/courses/${course.id}` },
    { label: "Final test" },
  ];
  const progress = progressOf(s, me.id);
  const cert = s.certificates.find((c) => c.learnerId === me.id && c.courseId === course.id);
  if (!paidTrackOpen(course, progress.paidCourseIds, !!cert))
    return (
      <>
        <Breadcrumb items={crumbs} />
        <Empty action={<LinkButton href={`/courses/${course.id}/pay`}>Buy the full course</LinkButton>}>The final test is included with the paid track.</Empty>
      </>
    );
  if (!allLessonsDone(progress.doneLessons, course))
    return (
      <>
        <Breadcrumb items={crumbs} />
        <Empty action={<LinkButton href={`/courses/${course.id}`}>Back to the course</LinkButton>}>Finish every lesson quiz before you take the test.</Empty>
      </>
    );

  const certId = cert?.id ?? `cert-${me.id}-${course.id}`;
  // Issued the moment the learner passes, so leaving the page can't lose it.
  const issueCertificate = (score: number) =>
    setState((st) =>
      st.certificates.some((c) => c.learnerId === me.id && c.courseId === course.id)
        ? st
        : { ...st, certificates: [...st.certificates, { id: certId, learnerId: me.id, courseId: course.id, score, issuedAt: today() }] },
    );

  return (
    <>
      <Breadcrumb items={crumbs} />
      <PageHeader title={`Final test: ${title}`} intro={`${course.test.length} questions. You need ${PASS_MARK * 100}% to pass and get certified.`} pose="focus" />
      {result ? (
        <Card role="status" tone={result.passed ? "success" : "danger"} className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center sm:p-10">
          <Mascot pose={result.passed ? "cheer" : "think"} size={140} />
          <h2 className="text-h2">{result.passed ? "You finished the course" : "Not passed yet"}</h2>
          <p className="font-heading text-h1 font-semibold">{result.score}%</p>
          <p className="max-w-md text-muted">
            {result.passed
              ? "Your certificate is ready. Next, try this course's company challenge."
              : "You need 70% or more. Go back over the lessons, then try the test again."}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {result.passed ? (
              <>
                <LinkButton href={`/certificates/${certId}`}>View certificate</LinkButton>
                <LinkButton href={`/courses/${course.id}`} variant="secondary">
                  See company challenges
                </LinkButton>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setResult(null)}>
                Try again
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <Quiz
            questions={course.test}
            submitLabel="Submit test"
            grade={(picked) => gradeFinalTest(course, picked)}
            retry={false}
            onChecked={(correct) => {
              const score = Math.round((correct / course.test.length) * 100);
              const passed = testPassed(correct, course.test.length);
              setResult({ score, passed });
              if (passed) issueCertificate(score);
              updateProgress(me.id, (p) => ({ ...p, testScores: { ...p.testScores, [course.id]: score }, testDates: { ...p.testDates, [course.id]: today() } }));
            }}
          />
        </Card>
      )}
    </>
  );
}
