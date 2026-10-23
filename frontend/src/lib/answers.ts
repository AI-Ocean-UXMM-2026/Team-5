import type { Course, Lesson, Question } from "./types";

// Courses from the API don't send answers, so the server checks them. The built-in backup courses carry
// their answers and are checked here.
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Graded = { correct: number; results?: { correct: boolean; answerIndex?: number }[] };

const knowsAnswers = (questions: Question[]) => questions.every((q) => q.answer !== undefined);

function gradeLocally(questions: Question[], picked: number[]): Graded {
  const results = questions.map((q, i) => ({ correct: picked[i] === q.answer, answerIndex: q.answer }));
  return { correct: results.filter((r) => r.correct).length, results };
}

async function post(path: string, answers: number[]) {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
  } catch {
    throw new Error("We couldn't check your answers. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "We couldn't check your answers. Try again.");
  return data;
}

/** A lesson quiz is practice, so it returns the right answer for each question. */
export async function gradeLessonQuiz(lesson: Lesson, picked: number[]): Promise<Graded> {
  if (knowsAnswers(lesson.quiz) || !lesson.uuid) return gradeLocally(lesson.quiz, picked);
  const data = await post(`/lessons/${lesson.uuid}/check`, picked);
  return { correct: data.correct, results: data.results };
}

/** The final test only says how many were right. */
export async function gradeFinalTest(course: Course, picked: number[]): Promise<Graded> {
  if (knowsAnswers(course.test) || !course.uuid) return { correct: gradeLocally(course.test, picked).correct };
  const data = await post(`/courses/${course.uuid}/check-test`, picked);
  return { correct: data.correct };
}
