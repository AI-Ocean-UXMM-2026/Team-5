"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import { Button } from "./ui/Button";

export function Quiz({ questions, submitLabel, onChecked, retry = true, children }: { questions: Question[]; submitLabel: string; onChecked: (correct: number) => void; retry?: boolean; children?: React.ReactNode }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [checked, setChecked] = useState(false);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setChecked(true);
        onChecked(questions.filter((q, i) => picked[i] === q.answer).length);
      }}
    >
      {questions.map((q, i) => {
        const right = picked[i] === q.answer;
        return (
          <fieldset key={q.q} disabled={checked}>
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
            {checked && (
              <p className={`mt-2 text-body-sm font-medium ${right ? "text-success" : "text-danger"}`}>
                {right ? "✓ Correct" : `✕ Not quite. The answer is “${q.options[q.answer]}”.`}
              </p>
            )}
          </fieldset>
        );
      })}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {checked && retry ? (
          <Button
            variant="secondary"
            className={children ? "mr-auto" : ""}
            onClick={() => {
              setPicked(questions.map(() => null));
              setChecked(false);
            }}
          >
            Try again
          </Button>
        ) : checked ? null : (
          <Button type="submit" className={children ? "mr-auto" : ""}>
            {submitLabel}
          </Button>
        )}
        {children}
      </div>
    </form>
  );
}
