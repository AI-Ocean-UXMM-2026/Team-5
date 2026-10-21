"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Quiz } from "@/components/Quiz";
import { LinkButton } from "@/components/ui/Button";
import { Card, Empty, PageHeader } from "@/components/ui/Card";
import { Mascot } from "@/components/ui/Mascot";
import { PASS_MARK, allLessonsDone, testPassed } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { progressOf, setState, today, updateProgress, useData } from "@/lib/store";

export default function TestPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { s, me } = useData();
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const course = courses.find((c) => c.id === courseId);
  if (!course) return <Empty>Course not found.</Empty>;
  if (!allLessonsDone(progressOf(s, me.id).doneLessons, course)) return <Empty>Finish every lesson quiz before you take the test.</Empty>;

  const certId = `cert-${me.id}-${course.id}`;

  return (
    <>
      <PageHeader title={`Final test: ${course.title}`} intro={`${course.test.length} questions. You need ${PASS_MARK * 100}% to pass and get certified.`} pose="focus" />
      {result && (
        <Card role="status" tone={result.passed ? "success" : "danger"} className="mb-6 flex flex-wrap items-center gap-6">
          <Mascot pose={result.passed ? "cheer" : "think"} size={120} />
          <div className="flex-1">
          <h2 className="text-h3">{result.passed ? `Passed with ${result.score}%` : `${result.score}%: not passed yet`}</h2>
          <p className="mt-1 mb-4">
            {result.passed ? "Your certificate is ready and the company challenges for this course are unlocked." : "Go back over the lessons, then try the test again."}
          </p>
          <div className="flex flex-wrap gap-3">
            {result.passed ? (
              <>
                <LinkButton href={`/certificates/${certId}`}>View certificate</LinkButton>
                <LinkButton href="/challenges" variant="secondary">
                  See challenges
                </LinkButton>
              </>
            ) : (
              <LinkButton href={`/courses/${course.id}`} variant="secondary">
                Back to lessons
              </LinkButton>
            )}
          </div>
          </div>
        </Card>
      )}
      <Card className="max-w-2xl">
        <Quiz
          questions={course.test}
          submitLabel="Submit test"
          onChecked={(correct) => {
            const score = Math.round((correct / course.test.length) * 100);
            const passed = testPassed(correct, course.test.length);
            setResult({ score, passed });
            updateProgress(me.id, (p) => ({ ...p, testScores: { ...p.testScores, [course.id]: score } }));
            if (passed)
              setState((st) =>
                st.certificates.some((c) => c.id === certId)
                  ? st
                  : { ...st, certificates: [...st.certificates, { id: certId, learnerId: me.id, courseId: course.id, score, issuedAt: today() }] },
              );
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </Card>
    </>
  );
}
