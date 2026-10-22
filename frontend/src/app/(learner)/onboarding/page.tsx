"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { goals, makeRoadmap } from "@/lib/ai";
import { progressOf, updateProgress, useData } from "@/lib/store";

export default function Onboarding() {
  const { s, me } = useData();
  const router = useRouter();
  const current = progressOf(s, me.id);
  const [goal, setGoal] = useState(goals.some((g) => g.id === current.goal) ? current.goal : "frontend");
  const [currentSkills, setCurrentSkills] = useState(current.currentSkills);
  const [hours, setHours] = useState(current.hoursPerWeek);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remake = current.roadmap.length > 0;

  return (
    <>
      <PageHeader
        title={remake ? "Reset your career goal" : "Set your career goal"}
        intro="Tell us where you want to go. AI turns it into an ordered roadmap of courses."
        pose="ready"
      />
      <div className={remake ? "grid items-start gap-6 lg:grid-cols-2" : undefined}>
        <Card className={remake ? undefined : "max-w-xl"}>
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                const result = await makeRoadmap(goal, currentSkills, hours);
                updateProgress(me.id, (p) => ({ ...p, goal, currentSkills, hoursPerWeek: hours, ...result }));
                router.push("/roadmap");
              } catch (err) {
                setError(err instanceof Error ? err.message : "AI did not answer.");
                setBusy(false);
              }
            }}
          >
            <Select label="Career goal" value={goal} onChange={(e) => setGoal(e.target.value)}>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </Select>
            <Textarea label="What can you do already?" hint="For example: a little HTML, Excel, English" value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} />
            <Input label="Hours you can study each week" type="number" min={1} max={60} required value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            <Button type="submit" disabled={busy}>
              {busy ? "AI is making your roadmap…" : remake ? "Remake my roadmap" : "Make my roadmap"}
            </Button>
            {error ? <p className="text-body-sm text-danger">{error}</p> : null}
          </form>
        </Card>
        {remake && (
          <Card>
            <h2 className="text-h4">How to set a career goal</h2>
            <p className="mt-2 text-muted">A demo. These answers build an ordered list of courses.</p>
            <dl className="mt-4 flex flex-col gap-3">
              {[
                ["Career goal", "Frontend Developer"],
                ["What you can do already", "A little HTML"],
                ["Hours each week", "5"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-body-sm text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <ol className="mt-4 flex flex-col gap-2 text-muted">
              <li>1. Career starter: working in IT</li>
              <li>2. Frontend basics: HTML, CSS and JavaScript</li>
            </ol>
          </Card>
        )}
      </div>
    </>
  );
}
