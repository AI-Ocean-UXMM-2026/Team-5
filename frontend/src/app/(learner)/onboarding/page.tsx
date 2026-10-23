"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackLink } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { coursesForGoal, goals, loadSkills, makeRoadmap, type SkillChip } from "@/lib/ai";
import { emptyProgress } from "@/lib/seed";
import {
  keepApplicable,
  NOTHING,
  OTHER,
  profileSkillNames,
  setChipLevel,
  skillsForRoadmap,
  studyHours,
  toggleChip,
  type PickedSkill,
  type SkillLevel,
} from "@/lib/skills";
import { progressOf, setState, useData } from "@/lib/store";

const copy = {
  en: {
    title: "Set your career goal",
    reset: "Reset your career goal",
    intro: "Tell us where you want to go. AI turns it into an ordered roadmap of courses.",
    goal: "Career goal",
    choose: "Choose a career goal",
    skills: "What can you do already?",
    skillsHint: "Tap everything you already know. No problem if you know nothing yet.",
    forGoal: "For this goal",
    anywhere: "Useful anywhere",
    nothing: "Nothing yet, I am starting fresh",
    other: "Something else?",
    little: "A little",
    comfortable: "Comfortable",
    hours: "Hours you can study each week",
    make: "Make my roadmap",
    remake: "Remake my roadmap",
    busy: "AI is making your roadmap…",
    begin: "Let's begin",
    loadError: "Skills could not be loaded.",
  },
  my: {
    title: "အသက်မွေးမှု ပန်းတိုင် သတ်မှတ်ပါ",
    reset: "အသက်မွေးမှု ပန်းတိုင် ပြန်သတ်မှတ်ပါ",
    intro: "ဘယ်ကို ရောက်ချင်လဲ ပြောပါ။ AI က သင်တန်းအစီအစဉ် လမ်းပြမြေပုံ ဆွဲပေးပါမယ်။",
    goal: "အသက်မွေးမှု ပန်းတိုင်",
    choose: "ပန်းတိုင် ရွေးပါ",
    skills: "ဘာတွေ တတ်ပြီးပြီလဲ။",
    skillsHint: "သိပြီးသား အတတ်တွေကို နှိပ်ပါ။ ဘာမှ မသိသေးရင်လည်း ကိစ္စမရှိပါ။",
    forGoal: "ဒီပန်းတိုင်အတွက်",
    anywhere: "ဘယ်လမ်းမှာမဆို",
    nothing: "မသိသေးပါ၊ အစကနေ စပါမယ်",
    other: "တခြားတစ်ခုခုလား။",
    little: "အနည်းငယ်",
    comfortable: "ရင်းနှီးသည်",
    hours: "တစ်ပတ်လျှင် လေ့လာနိုင်သည့် နာရီ",
    make: "လမ်းပြမြေပုံ ဆွဲမည်",
    remake: "လမ်းပြမြေပုံ ပြန်ဆွဲမည်",
    busy: "AI က လမ်းပြမြေပုံ ဆွဲနေသည်…",
    begin: "စတင်ကြစို",
    loadError: "အတတ်စာရင်းကို မဖွင့်နိုင်ပါ။",
  },
};

const goalMy: Record<string, string> = {
  frontend: "Frontend ဖန်တီးသူ",
  backend: "Backend ဖန်တီးသူ",
  fullstack: "Full-Stack ဖန်တီးသူ",
  uiux: "UI/UX ဒီဇိုင်နာ",
  data: "ဒေတာ လေ့လာသူ",
  unsure: "မသေချာသေးပါ",
};

const chipClass = (on: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy ${on ? "border-burgundy bg-burgundy text-white" : "border-line bg-white text-ink hover:border-subtle"}`;

export default function Onboarding() {
  const { s, me, lang } = useData();
  const router = useRouter();
  const current = progressOf(s, me.id);
  const t = copy[lang];
  const remake = current.roadmap.length > 0;
  const [goal, setGoal] = useState(goals.some((item) => item.id === current.goal) ? current.goal : "");
  const [picked, setPicked] = useState<PickedSkill[]>(current.knownSkills ?? []);
  const [other, setOther] = useState(current.otherSkill ?? "");
  const [hours, setHours] = useState<number | null>(remake && [2, 5, 10, 15].includes(current.hoursPerWeek) ? current.hoursPerWeek : null);
  const [catalogue, setCatalogue] = useState<SkillChip[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let gone = false;
    loadSkills()
      .then((skills) => {
        if (!gone) setCatalogue(skills);
      })
      .catch(() => {
        if (!gone) setLoadError(copy[lang].loadError);
      });
    return () => {
      gone = true;
    };
  }, [lang]);

  useEffect(() => {
    if (!catalogue.length) return;
    const allowed = new Set(catalogue.filter((row) => row.goalId === goal || row.goalId === "all").map((row) => row.id));
    setPicked((prev) => keepApplicable(prev, allowed));
  }, [catalogue, goal]);

  const label = (row: SkillChip) => (lang === "my" ? row.my : row.en);
  const english = (id: string) => catalogue.find((row) => row.id === id)?.en ?? id;

  function chips(rows: SkillChip[]) {
    return (
      <div className="flex flex-wrap items-start gap-3">
        {rows.map((row) => {
          const on = picked.find((item) => item.id === row.id);
          return (
            <div key={`${row.goalId}-${row.id}`} className="flex max-w-full flex-col items-start gap-1">
              <button type="button" aria-pressed={!!on} className={chipClass(!!on)} onClick={() => setPicked((prev) => toggleChip(prev, row.id))}>
                {label(row)}
              </button>
              {on ? <LevelToggle level={on.level} little={t.little} comfortable={t.comfortable} onPick={(level) => setPicked((prev) => setChipLevel(prev, row.id, level))} /> : null}
            </div>
          );
        })}
      </div>
    );
  }

  const forGoal = catalogue.filter((row) => row.goalId === goal);
  const anywhere = catalogue.filter((row) => row.goalId === "all");
  const otherOn = picked.find((item) => item.id === OTHER);

  return (
    <>
      {remake && <BackLink href="/roadmap">Roadmap</BackLink>}
      <PageHeader title={remake ? t.reset : t.title} intro={t.intro} />
      <div className="grid min-w-0 items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <Card>
            <form
              className="flex min-w-0 flex-col gap-5"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!goal) return;
                setBusy(true);
                setError("");
                const hoursPerWeek = studyHours(hours ?? 5);
                const extra = other.trim().slice(0, 40);
                const names = profileSkillNames(picked, english, extra);
                const skillLevels: Record<string, SkillLevel> = {};
                for (const item of picked) {
                  if (item.id === NOTHING || item.id === OTHER) continue;
                  skillLevels[english(item.id)] = item.level;
                }
                if (otherOn && extra) skillLevels[extra] = otherOn.level;
                try {
                  // If AI is down, use the standard path for the goal so the learner is never stuck here.
                  const result = await makeRoadmap(goal, skillsForRoadmap(picked, english, extra), hoursPerWeek).catch(() => ({
                    roadmap: coursesForGoal(goal),
                    roadmapNote: "AI was not available, so this is the standard path for your goal. You can remake it later.",
                  }));
                  setState((st) => ({
                    ...st,
                    users: st.users.map((user) => (user.id === me.id ? { ...user, skills: names } : user)),
                    progress: {
                      ...st.progress,
                      [me.id]: {
                        ...(st.progress[me.id] ?? emptyProgress),
                        goal,
                        currentSkills: skillsForRoadmap(picked, english, extra),
                        hoursPerWeek,
                        knownSkills: picked,
                        otherSkill: extra,
                        skillLevels,
                        ...result,
                      },
                    },
                  }));
                  router.push("/roadmap");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "AI did not answer.");
                  setBusy(false);
                }
              }}
            >
              <Select label={t.goal} value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="">{t.choose}</option>
                {goals.map((item) => (
                  <option key={item.id} value={item.id}>
                    {lang === "my" ? goalMy[item.id] : item.label}
                  </option>
                ))}
              </Select>
              <fieldset className="min-w-0">
                <legend className="text-sm font-medium">{t.skills}</legend>
                <p className="mt-1 text-body-sm text-muted">{t.skillsHint}</p>
                {loadError ? <p className="mt-2 text-body-sm text-danger">{loadError}</p> : null}
                {forGoal.length ? (
                  <div className="mt-4">
                    <p className="mb-2 text-body-sm font-semibold text-muted">{t.forGoal}</p>
                    {chips(forGoal)}
                  </div>
                ) : null}
                {anywhere.length ? (
                  <div className="mt-4">
                    <p className="mb-2 text-body-sm font-semibold text-muted">{t.anywhere}</p>
                    {chips(anywhere)}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-start gap-3">
                  <div className="flex max-w-full flex-col items-start gap-1">
                    <button type="button" aria-pressed={!!otherOn} className={chipClass(!!otherOn)} onClick={() => setPicked((prev) => toggleChip(prev, OTHER))}>
                      {t.other}
                    </button>
                    {otherOn ? (
                      <>
                        <input
                          maxLength={40}
                          value={other}
                          aria-label={t.other}
                          onChange={(e) => setOther(e.target.value.slice(0, 40))}
                          className="mt-1 h-10 w-full max-w-xs rounded-xl border border-line bg-white px-3 text-sm text-ink focus-visible:border-burgundy focus-visible:outline-none"
                        />
                        <LevelToggle level={otherOn.level} little={t.little} comfortable={t.comfortable} onPick={(level) => setPicked((prev) => setChipLevel(prev, OTHER, level))} />
                      </>
                    ) : null}
                  </div>
                  <button type="button" aria-pressed={picked.some((item) => item.id === NOTHING)} className={chipClass(picked.some((item) => item.id === NOTHING))} onClick={() => setPicked((prev) => toggleChip(prev, NOTHING))}>
                    {t.nothing}
                  </button>
                </div>
              </fieldset>
              <div>
                <p className="text-sm font-medium">{t.hours}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {[2, 5, 10, 15].map((n) => (
                    <button key={n} type="button" aria-pressed={hours === n} className={chipClass(hours === n)} onClick={() => setHours(n)}>
                      {n === 15 ? "15+" : n}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={busy || !goal}>
                {busy ? t.busy : remake ? t.remake : t.make}
              </Button>
              {error ? <p className="text-body-sm text-danger">{error}</p> : null}
            </form>
        </Card>
        <div className="flex min-h-72 items-center justify-center lg:h-full lg:items-end">
          {/* The PNG has a white background (multiply blends it in) and its bottom 20% is empty,
              so the shift puts the mascot's feet on the card's bottom edge. */}
          <Image src="/mascot/lets-begin.png" alt={t.begin} width={1080} height={1080} priority className="h-72 w-72 mix-blend-multiply lg:h-[28rem] lg:w-[28rem] lg:translate-y-[20%]" />
        </div>
      </div>
    </>
  );
}

function LevelToggle({ level, little, comfortable, onPick }: { level: SkillLevel; little: string; comfortable: string; onPick: (level: SkillLevel) => void }) {
  return (
    <span className="inline-flex rounded-full border border-line bg-white p-0.5 text-xs">
      {(["little", "comfortable"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={level === value}
          className={`rounded-full px-2 py-0.5 ${level === value ? "bg-burgundy text-white" : "text-muted"}`}
          onClick={() => onPick(value)}
        >
          {value === "little" ? little : comfortable}
        </button>
      ))}
    </span>
  );
}
