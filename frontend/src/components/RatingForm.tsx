"use client";

import { useState } from "react";
import { nameOf, newId, setState, useData } from "@/lib/store";
import type { Rating } from "@/lib/types";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Textarea } from "./ui/Field";

export function RatingsList({ ratings, empty }: { ratings: Rating[]; empty: string }) {
  const { s } = useData();
  if (!ratings.length) return <p className="text-muted">{empty}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {ratings.map((r) => (
        <li key={r.id}>
          <span aria-hidden className="text-yellow">
            {"★".repeat(r.stars)}
          </span>
          <span className="sr-only">{r.stars} of 5 stars</span> <span className="text-muted">by {nameOf(s, r.fromId)}</span>
          {r.comment && <p>{r.comment}</p>}
        </li>
      ))}
    </ul>
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
