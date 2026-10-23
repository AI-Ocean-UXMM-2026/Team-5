"use client";

import { useState } from "react";
import type { Graded } from "@/lib/answers";
import type { Question } from "@/lib/types";
import { Button } from "./ui/Button";

export function Quiz({
  questions,
  submitLabel,
  grade,
  onChecked,
  retry = true,
  className = "",
  children,
}: {
  questions: Question[];
  submitLabel: string;
  /** Checks the picked option per question, on the server or locally. */
  grade: (picked: number[]) => Promise<Graded>;
  onChecked: (correct: number) => void;
  retry?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [graded, setGraded] = useState<Graded | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const checked = graded !== null;

  return (
    <form
      className={`flex flex-col gap-6 ${className}`}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const result = await grade(picked.map((p) => p ?? -1));
          setGraded(result);
          onChecked(result.correct);
        } catch (err) {
          setError(err instanceof Error ? err.message : "We couldn't check your answers. Try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {questions.map((q, i) => {
        const result = graded?.results?.[i];
        return (
          <fieldset key={q.q} disabled={checked || busy}>
            <legend className="mb-2 font-medium">
              {i + 1}. {q.q}
            </legend>
            <div className="flex flex-col gap-1.5">
              {q.options.map((o, j) => (
                <label key={o} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q-${i}`}
                    required
                    checked={picked[i] === j}
                    onChange={() => setPicked((p) => p.map((v, k) => (k === i ? j : v)))}
                    className="accent-burgundy"
                  />
                  {o}
                </label>
              ))}
            </div>
            {result && (
              <p className={`mt-2 text-body-sm font-medium ${result.correct ? "text-success" : "text-danger"}`}>
                {result.correct
                  ? "✓ Correct"
                  : result.answerIndex !== undefined
                    ? `✕ Not quite. The answer is “${q.options[result.answerIndex]}”.`
                    : "✕ Not quite."}
              </p>
            )}
          </fieldset>
        );
      })}
      <div className="mt-auto flex flex-wrap items-center justify-end gap-3">
        {checked && retry ? (
          <Button
            variant="secondary"
            className={children ? "mr-auto" : ""}
            onClick={() => {
              setPicked(questions.map(() => null));
              setGraded(null);
            }}
          >
            Try again
          </Button>
        ) : checked ? null : (
          <Button type="submit" disabled={busy} className={children ? "mr-auto" : ""}>
            {busy ? "Checking…" : submitLabel}
          </Button>
        )}
        {children}
        {error && <p className="w-full text-body-sm text-danger">{error}</p>}
      </div>
    </form>
  );
}
