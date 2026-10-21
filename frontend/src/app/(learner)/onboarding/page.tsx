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
  const [goal, setGoal] = useState(current.goal || "frontend");
  const [currentSkills, setCurrentSkills] = useState(current.currentSkills);
  const [hours, setHours] = useState(current.hoursPerWeek);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <PageHeader title="Set your career goal" intro="Tell us where you want to go. AI turns it into an ordered roadmap of courses." pose="ready" />
      <Card className="max-w-xl">
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const result = await makeRoadmap(goal, currentSkills, hours);
            updateProgress(me.id, (p) => ({ ...p, goal, currentSkills, hoursPerWeek: hours, ...result }));
            router.push("/roadmap");
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
            {busy ? "AI is making your roadmap…" : "Make my roadmap"}
          </Button>
        </form>
      </Card>
    </>
  );
}
