"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Quiz } from "@/components/Quiz";
import { AiPanel } from "@/components/ui/AiPanel";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, Empty } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Mascot } from "@/components/ui/Mascot";
import { summarizeLesson } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { lessonIncluded } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { progressOf, updateProgress, useData } from "@/lib/store";

function LessonNotes({ lessonId, saved, userId }: { lessonId: string; saved: string; userId: string }) {
  const [note, setNote] = useState(saved);
  return (
    <Card className="flex flex-1 flex-col">
      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          updateProgress(userId, (pr) => ({ ...pr, notes: { ...pr.notes, [lessonId]: note } }));
        }}
      >
        <Textarea label="My notes" hint="Saved on this device when you press Save." value={note} onChange={(e) => setNote(e.target.value)} className="min-h-48" />
        <div className="mt-auto pt-4">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Card>
  );
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { s, me, lang } = useData();
  const [result, setResult] = useState<{ lessonId: string; keyPoints: string[]; summary: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [passedId, setPassedId] = useState<string | null>(null);
  const course = courses.find((c) => c.id === courseId);
  const index = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!course || index < 0) return <Empty>Lesson not found.</Empty>;

  const lesson = course.lessons[index];
  const p = progressOf(s, me.id);
  const certified = s.certificates.some((c) => c.learnerId === me.id && c.courseId === course.id);
  const next = course.lessons[index + 1];
  const nextOpen = !!next && lessonIncluded(course, index + 1, p.paidCourseIds, certified);
  if (!lessonIncluded(course, index, p.paidCourseIds, certified))
    return (
      <Empty>
        This lesson is on the paid track.{" "}
        <Link href={`/courses/${course.id}`} className="font-medium text-burgundy">
          Back to the course
        </Link>
      </Empty>
    );
  const done = p.doneLessons.includes(lesson.id);
  const complete = done || passedId === lesson.id;
  const lastLesson = !next;
  const summary = result?.lessonId === lesson.id ? result : null;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-body-sm text-muted">
        <Link href={`/courses/${course.id}`} className="hover:text-burgundy">
          {courseTitle(course, lang)}
        </Link>{" "}
        / Lesson {index + 1}
      </nav>
      <h1 className="mb-8 text-h2 sm:text-h1">{lesson.title}</h1>
      <div className="grid items-stretch gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex h-full flex-col gap-6">
          <Card>
            <div className="flex max-w-prose flex-col gap-4 text-body-lg">
              {lesson.body.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </Card>
          <Card className="flex flex-1 flex-col">
            <h2 className="mb-1 text-h3">Practice quiz</h2>
            <p className="mb-5 text-muted">{done ? "✓ You passed this quiz." : "Get every answer right to complete the lesson."}</p>
            <Quiz
              key={lesson.id}
              questions={lesson.quiz}
              submitLabel="Check answers"
              retry={passedId !== lesson.id}
              onChecked={(correct) => {
                const perfect = correct === lesson.quiz.length;
                setPassedId(perfect ? lesson.id : null);
                if (perfect && !done) updateProgress(me.id, (pr) => ({ ...pr, doneLessons: [...pr.doneLessons, lesson.id] }));
              }}
            >
              {complete && nextOpen && next && (
                <LinkButton href={`/courses/${course.id}/lessons/${next.id}`} variant="tertiary">
                  Next lesson
                </LinkButton>
              )}
              {complete && lastLesson && (
                <LinkButton href={`/courses/${course.id}/test`}>
                  Finish course
                </LinkButton>
              )}
            </Quiz>
          </Card>
        </div>
        <div className="flex h-full flex-col gap-6">
          <AiPanel title="Lesson summary" loading={loading}>
            {summary ? (
              <>
                <p className="mb-3">{summary.summary}</p>
                <ul className="list-disc pl-5">
                  {summary.keyPoints.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex items-center gap-4">
              <Mascot pose="teach" size={80} />
              <Button
                variant="secondary"
                onClick={async () => {
                  setLoading(true);
                  setResult({ lessonId: lesson.id, ...(await summarizeLesson(lesson)) });
                  setLoading(false);
                }}
              >
                Summarize this lesson
              </Button>
              </div>
            )}
          </AiPanel>
          <LessonNotes key={lesson.id} lessonId={lesson.id} saved={p.notes[lesson.id] ?? ""} userId={me.id} />
        </div>
      </div>
    </>
  );
}
