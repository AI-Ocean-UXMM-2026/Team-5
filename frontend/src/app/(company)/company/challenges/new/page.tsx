"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiPanel } from "@/components/ui/AiPanel";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { draftChallenge } from "@/lib/ai";
import { courseTitle } from "@/lib/i18n";
import { canPostAsCompany } from "@/lib/rules";
import { useCourses } from "@/lib/catalogue";
import { newId, setState, today, useData } from "@/lib/store";

export default function NewChallenge() {
  const { company, lang } = useData();
  const courses = useCourses();
  const router = useRouter();
  const [courseId, setCourseId] = useState((courses.find((c) => c.id === "frontend") ?? courses[0]).id);
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [rubric, setRubric] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <Breadcrumb items={[{ label: "Challenges", href: "/company/challenges" }, { label: "Post a challenge" }]} />
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
                  {courseTitle(c, lang)}
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
              setError("");
              try {
                const d = await draftChallenge(courses.find((c) => c.id === courseId) ?? courses[0]);
                setTitle(d.title);
                setTask(d.task);
                setRubric(d.rubric.join("\n"));
              } catch (err) {
                setError(err instanceof Error ? err.message : "AI did not answer.");
              } finally {
                setDrafting(false);
              }
            }}
          >
            {title ? "Draft again" : "Draft with AI"}
          </Button>
          {error ? <p className="mt-3 text-body-sm text-danger">{error}</p> : null}
        </AiPanel>
      </div>
    </>
  );
}
