"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Quiz } from "@/components/Quiz";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, Empty, PageHeader } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { courseTitle } from "@/lib/i18n";
import { PASS_MARK, allLessonsDone, paidTrackOpen, testPassed } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { progressOf, setState, today, updateProgress, useData } from "@/lib/store";

export default function TestPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { s, me, lang } = useData();
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const course = courses.find((c) => c.id === courseId);
  if (!course) return <Empty>Course not found.</Empty>;
  const progress = progressOf(s, me.id);
  const cert = s.certificates.find((c) => c.learnerId === me.id && c.courseId === course.id);
  if (!paidTrackOpen(course, progress.paidCourseIds, !!cert)) return <Empty>The final test is included with the paid track.</Empty>;
  if (!allLessonsDone(progress.doneLessons, course)) return <Empty>Finish every lesson quiz before you take the test.</Empty>;

  const certId = `cert-${me.id}-${course.id}`;
  const issueCertificate = (score: number) => {
    setState((st) =>
      st.certificates.some((c) => c.id === certId)
        ? st
        : { ...st, certificates: [...st.certificates, { id: certId, learnerId: me.id, courseId: course.id, score, issuedAt: today() }] },
    );
    router.push(`/certificates/${certId}`);
  };

  return (
    <>
      <PageHeader title={`Final test: ${courseTitle(course, lang)}`} intro={`${course.test.length} questions. You need ${PASS_MARK * 100}% to pass and get certified.`} pose="focus" />
      {result ? (
        <Card role="status" tone={result.passed ? "success" : "danger"} className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center sm:p-10">
          <Mascot pose={result.passed ? "cheer" : "think"} size={140} />
          <h2 className="text-h2">{result.passed ? "You finished the course" : "Not passed yet"}</h2>
          <p className="font-heading text-h1 font-semibold">{result.score}%</p>
          <p className="max-w-md text-muted">
            {result.passed
              ? "Your score is ready. Get your certificate, then try this course's company challenge."
              : "You need 70% or more. Go back over the lessons, then try the test again."}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {result.passed ? (
              cert ? (
                <LinkButton href={`/certificates/${cert.id}`}>View certificate</LinkButton>
              ) : (
                <Button onClick={() => issueCertificate(result.score)}>Get certificate</Button>
              )
            ) : (
              <Button variant="secondary" onClick={() => setResult(null)}>
                Try again
              </Button>
            )}
            <LinkButton href={`/courses/${course.id}`} variant="secondary">
              Back to course
            </LinkButton>
          </div>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <Quiz
            questions={course.test}
            submitLabel="Submit test"
            retry={false}
            onChecked={(correct) => {
              const score = Math.round((correct / course.test.length) * 100);
              const passed = testPassed(correct, course.test.length);
              setResult({ score, passed });
              updateProgress(me.id, (p) => ({ ...p, testScores: { ...p.testScores, [course.id]: score } }));
            }}
          />
        </Card>
      )}
    </>
  );
}
