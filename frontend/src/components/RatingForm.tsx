"use client";

import { useState } from "react";
import { nameOf, newId, setState, useData } from "@/lib/store";
import type { Rating } from "@/lib/types";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Dialog } from "./ui/Dialog";
import { Textarea } from "./ui/Field";

export function RatingsList({ ratings, empty }: { ratings: Rating[]; empty: string }) {
  const { s } = useData();
  if (!ratings.length) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="flex flex-col divide-y divide-line">
      {ratings.map((r) => (
        <li key={r.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{nameOf(s, r.fromId)}</span>
            <span className="text-yellow" aria-hidden>
              {"★".repeat(r.stars)}
              <span className="text-line">{"★".repeat(5 - r.stars)}</span>
            </span>
            <span className="sr-only">{r.stars} of 5 stars</span>
          </div>
          {r.comment && <p className="mt-1 text-body-sm text-muted">“{r.comment}”</p>}
        </li>
      ))}
    </ul>
  );
}

/**
 * A button that opens a rating dialog, used on profiles. Once sent, it shows the stars instead,
 * since ratings can't be changed.
 */
export function RateButton({ interviewId, toId, toName }: { interviewId: string; toId: string; toName: string }) {
  const { s, me } = useData();
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  // One rating per person per profile, whichever interview it was given for.
  const existing = s.ratings.find((r) => r.toId === toId && r.fromId === me.id);
  const first = toName.split(" ")[0];

  if (existing)
    return (
      <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-surface px-3 text-sm font-medium">
        You rated {first}
        <span aria-hidden className="text-yellow">
          {"★".repeat(existing.stars)}
        </span>
        <span className="sr-only">{existing.stars} of 5 stars</span>
      </span>
    );

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <span aria-hidden className="text-yellow">
          ★
        </span>
        Rate {first}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Rate ${toName}`}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!stars) return;
            setState((st) => ({ ...st, ratings: [...st.ratings, { id: newId("rt"), interviewId, fromId: me.id, toId, stars, comment: comment.trim() }] }));
            setOpen(false);
          }}
        >
          <fieldset>
            <legend className="mb-2 text-sm font-medium">How was working with {first}?</legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer">
                  <input type="radio" name={`rate-${interviewId}`} value={n} checked={stars === n} onChange={() => setStars(n)} className="peer sr-only" />
                  <span aria-hidden className={`grid size-11 place-items-center rounded-xl text-h3 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy hover:bg-yellow-tint ${n <= stars ? "text-yellow" : "text-subtle"}`}>
                    ★
                  </span>
                  <span className="sr-only">{n === 1 ? "1 star" : `${n} stars`}</span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-body-sm text-muted">{["Choose 1 to 5 stars.", "Poor", "Below what we hoped", "Good", "Very good", "Excellent"][stars]}</p>
          </fieldset>
          <Textarea label="Comment (optional)" hint="What did they do well? What could they improve?" value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-24" />
          <p className="rounded-xl bg-surface p-3 text-body-sm text-muted">Your rating shows on {first}&apos;s profile. You can&apos;t change it after sending.</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!stars}>
              Send rating
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function RatingForm({ interviewId, toId, toName }: { interviewId: string; toId: string; toName: string }) {
  const { s, me } = useData();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [confirming, setConfirming] = useState(false);
  const existing = s.ratings.find((r) => r.interviewId === interviewId && r.fromId === me.id);

  if (existing)
    return (
      <p className="text-muted">
        You rated {toName} <span aria-hidden className="text-yellow">{"★".repeat(existing.stars)}</span>
        <span className="sr-only">{existing.stars} of 5 stars</span> {existing.comment && `“${existing.comment}”`}
      </p>
    );

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setConfirming(true);
      }}
    >
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => setState((st) => ({ ...st, ratings: [...st.ratings, { id: newId("rt"), interviewId, fromId: me.id, toId, stars, comment: comment.trim() }] }))}
        title={`Send ${stars} ${stars === 1 ? "star" : "stars"} to ${toName}?`}
        confirmLabel="Send rating"
      >
        <p>
          Your rating{comment.trim() ? " and comment" : ""} will show on {toName}&apos;s profile. You can&apos;t change it after sending.
        </p>
      </ConfirmDialog>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Rate {toName}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name={`stars-${interviewId}`} value={n} checked={stars === n} onChange={() => setStars(n)} className="peer sr-only" />
              <span aria-hidden className={`grid size-10 place-items-center rounded-xl text-h3 peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy ${n <= stars ? "text-yellow" : "text-subtle"}`}>
                ★
              </span>
              <span className="sr-only">{n === 1 ? "1 star" : `${n} stars`}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Textarea label="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-20" />
      <Button type="submit" disabled={!stars} className="self-start">
        Send rating
      </Button>
    </form>
  );
}
