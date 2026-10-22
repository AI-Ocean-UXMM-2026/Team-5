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
import { courses } from "@/lib/seed";
import { progressOf, updateProgress, useData } from "@/lib/store";

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { s, me, lang } = useData();
  const [result, setResult] = useState<{ lessonId: string; keyPoints: string[]; summary: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const course = courses.find((c) => c.id === courseId);
  const index = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!course || index < 0) return <Empty>Lesson not found.</Empty>;

  const lesson = course.lessons[index];
  const next = course.lessons[index + 1];
  const p = progressOf(s, me.id);
  const done = p.doneLessons.includes(lesson.id);
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
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex max-w-prose flex-col gap-4 text-body-lg">
              {lesson.body.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-1 text-h3">Practice quiz</h2>
            <p className="mb-5 text-muted">{done ? "✓ You passed this quiz." : "Get every answer right to complete the lesson."}</p>
            <Quiz
              key={lesson.id}
              questions={lesson.quiz}
              submitLabel="Check answers"
              onChecked={(correct) => {
                if (correct === lesson.quiz.length && !done) updateProgress(me.id, (pr) => ({ ...pr, doneLessons: [...pr.doneLessons, lesson.id] }));
              }}
            />
          </Card>
          <div className="flex gap-3">
            {next ? (
              <LinkButton href={`/courses/${course.id}/lessons/${next.id}`} variant={done ? "primary" : "secondary"}>
                Next lesson
              </LinkButton>
            ) : (
              <LinkButton href={`/courses/${course.id}`} variant={done ? "primary" : "secondary"}>
                Back to course
              </LinkButton>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-6">
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
          <Card>
            <Textarea
              label="My notes"
              hint="Saved automatically on this device."
              value={p.notes[lesson.id] ?? ""}
              onChange={(e) => {
                const text = e.target.value;
                updateProgress(me.id, (pr) => ({ ...pr, notes: { ...pr.notes, [lesson.id]: text } }));
              }}
              className="min-h-48"
            />
          </Card>
        </div>
      </div>
    </>
  );
}
