"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Quiz } from "@/components/Quiz";
import { YouTubeFrame } from "@/components/YouTubeFrame";
import { AiPanel } from "@/components/ui/AiPanel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, Empty, PageHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Mascot } from "@/components/ui/Mascot";
import { summarizeLesson } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { allLessonsDone, lessonIncluded, paidTrackOpen } from "@/lib/rules";
import { gradeLessonQuiz } from "@/lib/answers";
import { useCourses } from "@/lib/catalogue";
import { progressOf, updateProgress, useData } from "@/lib/store";

function LessonVideo({ videoId, title }: { videoId?: string; title: string }) {
  if (!videoId) {
    return (
      <div className="mb-6 flex aspect-video items-center justify-center rounded-xl border border-line bg-surface px-6 text-center text-muted">
        This lesson&apos;s YouTube video will play here.
      </div>
    );
  }
  return (
    <div className="mb-6">
      <YouTubeFrame videoId={videoId} title={title} />
    </div>
  );
}

function LessonNotes({ lessonId, saved, userId }: { lessonId: string; saved: string; userId: string }) {
  const [note, setNote] = useState(saved);
  const [savedNote, setSavedNote] = useState(saved);
  const dirty = note !== savedNote;
  return (
    <Card className="flex flex-1 flex-col">
      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          updateProgress(userId, (pr) => ({ ...pr, notes: { ...pr.notes, [lessonId]: note } }));
          setSavedNote(note);
        }}
      >
        <Textarea label="My notes" hint="Saved on this device when you press Save." value={note} onChange={(e) => setNote(e.target.value)} className="min-h-48" />
        <div className="mt-auto flex items-center gap-3 pt-4">
          <Button type="submit" disabled={!dirty}>
            Save
          </Button>
          <p role="status" className="text-body-sm text-muted">
            {dirty ? "Unsaved changes" : savedNote ? "✓ Saved on this device" : ""}
          </p>
        </div>
      </form>
    </Card>
  );
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { s, me, lang } = useData();
  const courses = useCourses();
  const [result, setResult] = useState<{ lessonId: string; keyPoints: string[]; summary: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [passedId, setPassedId] = useState<string | null>(null);
  const course = courses.find((c) => c.id === courseId);
  const index = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!course || index < 0) return <Empty action={<LinkButton href="/courses">See all courses</LinkButton>}>Lesson not found.</Empty>;

  const lesson = course.lessons[index];
  const p = progressOf(s, me.id);
  const certified = s.certificates.some((c) => c.learnerId === me.id && c.courseId === course.id);
  const next = course.lessons[index + 1];
  const nextOpen = !!next && lessonIncluded(course, index + 1, p.paidCourseIds, certified);
  const crumbs = [
    { label: "Courses", href: "/courses" },
    { label: courseTitle(course, lang), href: `/courses/${course.id}` },
    { label: lesson.title },
  ];
  if (!lessonIncluded(course, index, p.paidCourseIds, certified))
    return (
      <>
        <Breadcrumb items={crumbs} />
        <Empty action={<LinkButton href={`/courses/${course.id}`}>Unlock on the course page</LinkButton>}>This lesson is on the paid track.</Empty>
      </>
    );
  const done = p.doneLessons.includes(lesson.id);
  const complete = done || passedId === lesson.id;
  const lastLesson = !next;
  const trackOpen = paidTrackOpen(course, p.paidCourseIds, certified);
  // Counts this lesson as done straight after a perfect quiz, before the store update re-renders.
  const allDone = allLessonsDone([...p.doneLessons, ...(passedId === lesson.id ? [lesson.id] : [])], course);
  const summary = result?.lessonId === lesson.id ? result : null;

  return (
    <>
      <Breadcrumb items={crumbs} />
      <PageHeader title={lesson.title} intro={`Lesson ${index + 1} of ${course.lessons.length} · ${courseTitle(course, lang)}`} />
      <LessonVideo videoId={lesson.videoId} title={lesson.title} />
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
            {complete && lastLesson ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
                <Mascot pose="cheer" size={120} />
                <h2 className="text-h3">You passed the final quiz</h2>
                <p className="max-w-md text-muted">Every answer was right. Take the final test to finish this course.</p>
                <LinkButton href={`/courses/${course.id}/test`}>Final test</LinkButton>
              </div>
            ) : (
              <>
                <h2 className="mb-1 text-h3">Practice quiz</h2>
                <p className="mb-5 text-muted">{done ? "✓ You passed this quiz." : "Get every answer right to complete the lesson."}</p>
                <Quiz
                  key={lesson.id}
                  questions={lesson.quiz}
                  submitLabel="Check answers"
                  grade={(picked) => gradeLessonQuiz(lesson, picked)}
                  className="flex-1"
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
                </Quiz>
              </>
            )}
            {/* Last open lesson: point to what comes next instead of leaving a dead end. */}
            {passedId === lesson.id && !nextOpen && !lastLesson && (
              <div className="mt-6 flex flex-wrap gap-2">
                {allDone && trackOpen ? (
                  <LinkButton href={`/courses/${course.id}/test`}>Take the final test</LinkButton>
                ) : (
                  <LinkButton href={`/courses/${course.id}`} variant="secondary">
                    {next ? "Unlock the next lessons" : "Back to the course"}
                  </LinkButton>
                )}
              </div>
            )}
          </Card>
        </div>
        <div className="flex h-full flex-col gap-6">
          <AiPanel title="Lesson summary" loading={loading} tone="secondary">
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
                  setSummaryError("");
                  try {
                    setResult({ lessonId: lesson.id, ...(await summarizeLesson(lesson)) });
                  } catch (err) {
                    setSummaryError(err instanceof Error ? err.message : "AI did not answer.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Summarize this lesson
              </Button>
              </div>
            )}
            {summaryError ? <p className="mt-3 text-body-sm text-danger">{summaryError}</p> : null}
          </AiPanel>
          <LessonNotes key={lesson.id} lessonId={lesson.id} saved={p.notes[lesson.id] ?? ""} userId={me.id} />
        </div>
      </div>
    </>
  );
}
