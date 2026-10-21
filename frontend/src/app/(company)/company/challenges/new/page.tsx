"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiPanel } from "@/components/ui/AiPanel";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { draftChallenge } from "@/lib/ai";
import { canPostAsCompany } from "@/lib/rules";
import { courses } from "@/lib/seed";
import { newId, setState, today, useData } from "@/lib/store";

export default function NewChallenge() {
  const { company } = useData();
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[1].id);
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [rubric, setRubric] = useState("");
  const [drafting, setDrafting] = useState(false);

  return (
    <>
      <PageHeader title="Post a challenge" intro="Pick the skill you need. AI drafts a task and rubric that you can edit before posting." />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canPostAsCompany(company)) return;
              const id = newId("ch");
              const items = rubric.split("\n").map((r) => r.trim()).filter(Boolean);
              setState((st) => ({ ...st, challenges: [...st.challenges, { id, companyId: company!.id, courseId, title: title.trim(), task: task.trim(), rubric: items, createdAt: today() }] }));
              router.push(`/company/challenges/${id}`);
            }}
          >
            <Select label="Skill / course" value={courseId} onChange={(e) => setCourseId(e.target.value)} hint="Only learners certified in this course can take the challenge.">
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
            <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea label="Task" required value={task} onChange={(e) => setTask(e.target.value)} className="min-h-40" />
            <Textarea label="Rubric" hint="One point per line. AI uses it to pre-screen answers." required value={rubric} onChange={(e) => setRubric(e.target.value)} />
            <Button type="submit" className="self-start">
              Post challenge
            </Button>
          </form>
        </Card>
        <AiPanel title="Draft the task" loading={drafting}>
          <p className="mb-4">AI writes a first draft for the selected skill. You stay in charge of the final wording.</p>
          <Button
            variant="secondary"
            onClick={async () => {
              setDrafting(true);
              const d = await draftChallenge(courseId);
              setTitle(d.title);
              setTask(d.task);
              setRubric(d.rubric.join("\n"));
              setDrafting(false);
            }}
          >
            {title ? "Draft again" : "Draft with AI"}
          </Button>
        </AiPanel>
      </div>
    </>
  );
}
