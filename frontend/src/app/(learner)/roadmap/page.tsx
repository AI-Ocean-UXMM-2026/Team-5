"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { AiPanel } from "@/components/ui/AiPanel";
import { LinkButton } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";
import { LockIcon } from "@/components/ui/LockIcon";
import { Mascot } from "@/components/ui/Mascot";
import { goals } from "@/lib/ai";
import { copy, courseTitle, formatMmk } from "@/lib/i18n";
import { useCourses } from "@/lib/catalogue";
import { challengeUnlocked, lessonIncluded, paidTrackOpen, roadmapStepOpen } from "@/lib/rules";
import { progressOf, useData } from "@/lib/store";
import type { Course } from "@/lib/types";
import citFace from "../../../../mascot/18.png";
import "@/components/learning/home.css";

type Stage = { key: string; title: string; detail: string; done: boolean; gate?: boolean; mark: ReactNode };

const check = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export default function Home() {
  const { s, me, lang } = useData();
  const courses = useCourses();
  const t = copy[lang];
  const x = (en: string, my: string) => (lang === "my" ? my : en);
  const p = progressOf(s, me.id);
  const path = p.roadmap.map((id) => courses.find((c) => c.id === id)).filter((c): c is Course => !!c);

  if (!path.length)
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-10 text-center">
        <Mascot pose="peek" size={140} />
        <h1 className="text-h2">{x("Let's find your direction", "သင့်လမ်းကြောင်းကို ရှာကြမယ်")}</h1>
        <p className="text-body-lg text-muted">
          {x("Pick a career goal and AI puts the right courses in order for you.", "ပန်းတိုင်ရွေးလိုက်ရင် AI က သင့်တော်တဲ့ သင်တန်းတွေကို အစီအစဉ်ချပေးပါမယ်။")}
        </p>
        <LinkButton href="/onboarding">{x("Set my career goal", "ပန်းတိုင် သတ်မှတ်မယ်")}</LinkButton>
      </div>
    );

  const certifiedIds = s.certificates.filter((c) => c.learnerId === me.id).map((c) => c.courseId);
  const certified = (id: string) => certifiedIds.includes(id);
  const doneIn = (c: Course) => c.lessons.filter((l) => p.doneLessons.includes(l.id)).length;
  const shortTitle = (c: Course) => courseTitle(c, lang).split(/[:—]/)[0].trim();
  const mySubs = s.submissions.filter((sb) => sb.learnerId === me.id);
  const myInterviews = s.interviews.filter((i) => i.learnerId === me.id);
  const companyName = (id: string) => s.companies.find((c) => c.id === id)?.name ?? "";
  const when = (iso: string) => new Date(iso).toLocaleString(lang === "my" ? "my-MM" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  // The climb: each roadmap course, then the challenge, the interview and the internship gate.
  const openChallenges = s.challenges.filter((ch) => s.companies.find((c) => c.id === ch.companyId)?.status === "verified" && challengeUnlocked(s.certificates, me.id, ch.courseId));
  const scheduled = myInterviews.find((i) => i.status === "scheduled");
  const stages: Stage[] = [
    ...path.map((c, i) => ({
      key: c.id,
      title: shortTitle(c),
      detail: certified(c.id) ? x("Certified", "လက်မှတ်ရပြီ") : `${doneIn(c)} / ${c.lessons.length} ${t.lessons}`,
      done: certified(c.id),
      mark: <>{i + 1}</>,
    })),
    {
      key: "challenge",
      title: x("Company challenge", "ကုမ္ပဏီ စိန်ခေါ်မှု"),
      detail: mySubs.some((sb) => sb.status === "interview")
        ? x("Passed", "အောင်မြင်ပြီ")
        : mySubs.length
          ? x("Submitted", "တင်ပြီးပြီ")
          : openChallenges.length
            ? x("Unlocked", "ဖွင့်ပြီ")
            : x("After a certificate", "လက်မှတ်ရပြီးနောက်"),
      done: mySubs.some((sb) => sb.status === "interview"),
      mark: <>{path.length + 1}</>,
    },
    {
      key: "interview",
      title: x("Interview", "အင်တာဗျူး"),
      detail: scheduled ? when(scheduled.when) : myInterviews.some((i) => i.status === "offered") ? x("Offer received", "ကမ်းလှမ်းချက်ရပြီ") : x("With the company", "ကုမ္ပဏီနှင့်"),
      done: myInterviews.some((i) => i.status === "offered" || i.status === "accepted"),
      mark: <>{path.length + 2}</>,
    },
    {
      key: "internship",
      title: x("Internship", "အလုပ်သင်"),
      detail: myInterviews.some((i) => i.status === "accepted") ? x("Started", "စတင်ပြီ") : x("Your next chapter", "နောက်အခန်းသစ်"),
      done: myInterviews.some((i) => i.status === "accepted"),
      gate: true,
      mark: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 21V10a7 7 0 0 1 14 0v11M9 21v-6a3 3 0 0 1 6 0v6" />
        </svg>
      ),
    },
  ];
  const currentIndex = stages.findIndex((st) => !st.done);

  // The single best next step on the path.
  const nextCourse = path.find((c) => !certified(c.id));
  const nextLessonIndex = nextCourse ? nextCourse.lessons.findIndex((l) => !p.doneLessons.includes(l.id)) : -1;
  const nextLesson = nextCourse && nextLessonIndex >= 0 ? nextCourse.lessons[nextLessonIndex] : undefined;
  const lessonOpen = !!nextCourse && nextLessonIndex >= 0 && lessonIncluded(nextCourse, nextLessonIndex, p.paidCourseIds, false);
  const trackOpen = !!nextCourse && paidTrackOpen(nextCourse, p.paidCourseIds, false);
  const freshChallenge = openChallenges.find((ch) => !mySubs.some((sb) => sb.challengeId === ch.id));

  const next = nextCourse
    ? nextLesson
      ? lessonOpen
        ? {
            eyebrow: `${shortTitle(nextCourse)} · ${x("Lesson", "သင်ခန်းစာ")} ${nextLessonIndex + 1} / ${nextCourse.lessons.length}`,
            title: nextLesson.title,
            body: x("Read the lesson, then pass its practice quiz to mark it done.", "သင်ခန်းစာဖတ်ပြီး လေ့ကျင့်ခန်းကို အောင်အောင်ဖြေပါ။"),
            href: `/courses/${nextCourse.id}/lessons/${nextLesson.id}`,
            cta: doneIn(nextCourse) ? x("Resume lesson", "ဆက်လေ့လာမယ်") : x("Start lesson", "စလေ့လာမယ်"),
          }
        : {
            eyebrow: shortTitle(nextCourse),
            title: x("You've finished the free lessons", "အခမဲ့ သင်ခန်းစာများ ပြီးပါပြီ"),
            body: x("Unlock the rest of the course to keep going and take the final test.", "ကျန်သင်ခန်းစာနဲ့ နောက်ဆုံးစာမေးပွဲအတွက် သင်တန်းကို ဖွင့်ပါ။"),
            href: `/courses/${nextCourse.id}`,
            cta: x("See unlock options", "ဖွင့်ရန် ကြည့်မယ်"),
          }
      : {
          eyebrow: shortTitle(nextCourse),
          title: trackOpen ? x("Every lesson is done", "သင်ခန်းစာအားလုံး ပြီးပါပြီ") : x("Unlock the final test", "နောက်ဆုံးစာမေးပွဲကို ဖွင့်ပါ"),
          body: x("Pass the final test with 70% or more to get certified and unlock the company challenge.", "၇၀% နှင့်အထက်ရရင် လက်မှတ်ရပြီး ကုမ္ပဏီစိန်ခေါ်မှု ဖွင့်ပါမယ်။"),
          href: trackOpen ? `/courses/${nextCourse.id}/test` : `/courses/${nextCourse.id}`,
          cta: trackOpen ? x("Take the final test", "စာမေးပွဲ ဖြေမယ်") : x("See unlock options", "ဖွင့်ရန် ကြည့်မယ်"),
        }
    : freshChallenge
      ? {
          eyebrow: companyName(freshChallenge.companyId),
          title: freshChallenge.title,
          body: x("You're certified. Show the company what you can do. It's free to take part.", "လက်မှတ်ရပြီ။ ကုမ္ပဏီကို သင့်စွမ်းရည် ပြလိုက်ပါ။ အခမဲ့ပါ။"),
          href: `/challenges/${freshChallenge.id}`,
          cta: x("Open the challenge", "စိန်ခေါ်မှု ဖွင့်မယ်"),
        }
      : {
          eyebrow: x("Path complete", "လမ်းကြောင်း ပြီးဆုံး"),
          title: x("Every course on your path is certified", "သင်တန်းအားလုံး လက်မှတ်ရပြီ"),
          body: x("Keep an eye on challenges and interviews below.", "အောက်က စိန်ခေါ်မှုနဲ့ အင်တာဗျူးတွေကို စောင့်ကြည့်ပါ။"),
          href: "/internships",
          cta: x("See internships", "အလုပ်သင်များ ကြည့်မယ်"),
        };

  // Things that are waiting on the learner, newest first in priority order.
  const todos = [
    ...myInterviews
      .filter((i) => i.status === "offered")
      .map((i) => ({ id: i.id, tone: "highlight" as const, label: x("Offer", "ကမ်းလှမ်းချက်"), text: x(`Reply to ${companyName(i.companyId)}'s internship offer`, `${companyName(i.companyId)} ၏ ကမ်းလှမ်းချက်ကို ပြန်ကြားပါ`), href: "/internships" })),
    ...mySubs
      .filter((sb) => sb.status === "needs-work")
      .map((sub) => ({
        id: sub.id,
        tone: "highlight" as const,
        label: x("Feedback", "အကြံပြုချက်"),
        text: x(`Improve your answer to “${s.challenges.find((c) => c.id === sub.challengeId)?.title}”`, `“${s.challenges.find((c) => c.id === sub.challengeId)?.title}” အဖြေကို ပြင်ပါ`),
        href: `/challenges/${sub.challengeId}`,
      })),
    ...myInterviews
      .filter((i) => i.status === "scheduled")
      .map((i) => ({ id: i.id, tone: "brand" as const, label: when(i.when), text: x(`Interview with ${companyName(i.companyId)}`, `${companyName(i.companyId)} နှင့် အင်တာဗျူး`), href: "/internships" })),
    ...openChallenges
      .filter((ch) => !mySubs.some((sb) => sb.challengeId === ch.id))
      .map((ch) => ({ id: ch.id, tone: "success" as const, label: x("Unlocked", "ဖွင့်ပြီ"), text: x(`Take the “${ch.title}” challenge`, `“${ch.title}” စိန်ခေါ်မှုကို ဖြေပါ`), href: `/challenges/${ch.id}` })),
  ].slice(0, 4);

  const say = todos.some((td) => td.label === x("Offer", "ကမ်းလှမ်းချက်"))
    ? x("You have an offer to answer!", "ပြန်ကြားရမယ့် ကမ်းလှမ်းချက် ရှိတယ်!")
    : nextLesson && lessonOpen
      ? x(`Ready for “${nextLesson.title}”?`, `“${nextLesson.title}” အတွက် အဆင်သင့်လား?`)
      : x("One step at a time. Let's keep climbing!", "တစ်ဆင့်ချင်း ဆက်တက်ကြမယ်!");
  const goalLabel = p.goal === "unsure" ? x("Career starter", "အလုပ်အကိုင်အစ") : (goals.find((g) => g.id === p.goal)?.label ?? x("Your goal", "သင့်ပန်းတိုင်"));
  const hoursLeft = path.reduce((n, c) => n + (certified(c.id) ? 0 : c.hours * (1 - doneIn(c) / c.lessons.length)), 0);
  const weeksLeft = Math.ceil(hoursLeft / Math.max(1, p.hoursPerWeek));
  const completedCount = path.filter((c) => certified(c.id)).length;
  const lessonsTotal = path.reduce((n, c) => n + c.lessons.length, 0);
  const lessonsDone = path.reduce((n, c) => n + doneIn(c), 0);
  const now = new Date();
  const finishBy = new Date(now.getFullYear(), now.getMonth(), now.getDate() + weeksLeft * 7).toLocaleDateString(lang === "my" ? "my-MM" : "en-GB", { day: "numeric", month: "short" });
  const today = now.toLocaleDateString(lang === "my" ? "my-MM" : "en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex flex-col gap-6">
      <section className="lh-hero" aria-labelledby="home-title">
        <div className="lh-heroCopy">
          <p className="lh-date">{today}</p>
          <h1 id="home-title">
            {x("Mingalaba", "မင်္ဂလာပါ")}, {me.name.split(" ")[0]}
          </h1>
          <div className="lh-heroChips">
            <span>{goalLabel}</span>
            <span>
              {p.hoursPerWeek} {x("hours a week", "နာရီ / တစ်ပတ်")}
            </span>
            {hoursLeft > 0 && (
              <span className="lh-chipYellow">{x(`About ${weeksLeft} ${weeksLeft === 1 ? "week" : "weeks"} to go`, `နောက်ထပ် ${weeksLeft} ပတ်ခန့်`)}</span>
            )}
          </div>
          <Link href="/onboarding" className="lh-heroButton">
            {p.goal === "unsure" ? x("Pick a career goal", "ပန်းတိုင် ရွေးမယ်") : x("Change goal", "ပန်းတိုင် ပြောင်းမယ်")}
          </Link>
        </div>
        <div className="lh-heroArt" aria-hidden>
          <p className="lh-bubble">{say}</p>
          <span className="lh-spark" style={{ right: 12, top: 30 }}>
            ✦
          </span>
          <span className="lh-spark" style={{ right: 210, bottom: 70, fontSize: 12 }}>
            ✦
          </span>
          <div className="lh-heroStone" />
          <Mascot pose="hello" size={190} onColor priority className="lh-heroMascot" />
        </div>
      </section>

      <Card aria-labelledby="climb-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="climb-title" className="text-h4">
            {x("Your path to an internship", "အလုပ်သင်ဆီသို့ သင့်လမ်းကြောင်း")}
          </h2>
          <p className="text-body-sm text-muted">
            {x(`${path.length} ${path.length === 1 ? "course" : "courses"} · ${completedCount} completed`, `သင်တန်း ${path.length} ခု · ${completedCount} ခု ပြီး`)} ·{" "}
            {currentIndex < 0
              ? x("All steps done", "အဆင့်အားလုံး ပြီးပြီ")
              : x(`Step ${currentIndex + 1} of ${stages.length}`, `အဆင့် ${currentIndex + 1} / ${stages.length}`)}
          </p>
        </div>
        <ol className="lh-climb" style={{ "--steps": stages.length } as CSSProperties}>
          {stages.map((st, i) => {
            const state = st.done ? "lh-done" : i === currentIndex ? "lh-current" : "lh-upcoming";
            return (
              <li key={st.key} className={`lh-step ${state} ${st.gate ? "lh-gate" : ""}`} aria-current={i === currentIndex ? "step" : undefined}>
                <div className="lh-blockWrap">
                  {i === currentIndex && (
                    <span className="lh-here">
                      <Image src={citFace} alt="" width={24} height={24} />
                      {x("You're here", "ဒီမှာ ရောက်နေတယ်")}
                    </span>
                  )}
                  <div className="lh-block" style={{ "--rise": i } as CSSProperties}>
                    {st.done ? check : st.mark}
                  </div>
                </div>
                <p className="lh-stepLabel">
                  <b>{st.title}</b>
                  <span>{st.detail}</span>
                </p>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="flex flex-col gap-3 border-burgundy/25">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-caption font-semibold text-burgundy">{x("Up next", "နောက်တစ်ဆင့်")} · {next.eyebrow}</p>
              <h2 className="mt-2 text-h3">{next.title}</h2>
            </div>
            <span aria-hidden className="grid size-20 shrink-0 place-items-center rounded-full bg-yellow-tint">
              <Mascot pose="laptop" size={84} />
            </span>
          </div>
          <p className="text-muted">{next.body}</p>
          {nextCourse && (
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface" role="progressbar" aria-label={x("Course progress", "သင်တန်း တိုးတက်မှု")} aria-valuemin={0} aria-valuemax={nextCourse.lessons.length} aria-valuenow={doneIn(nextCourse)}>
                <span className="block h-full rounded-full bg-burgundy" style={{ width: `${(doneIn(nextCourse) / nextCourse.lessons.length) * 100}%` }} />
              </div>
              <span className="text-body-sm text-muted tabular-nums">
                {doneIn(nextCourse)} / {nextCourse.lessons.length}
              </span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <LinkButton href={next.href}>{next.cta}</LinkButton>
            {nextCourse && (
              <LinkButton href={`/courses/${nextCourse.id}`} variant="tertiary">
                {x("Course overview", "သင်တန်း အကျဉ်း")}
              </LinkButton>
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <h2 className="text-h4">{x("Needs you", "သင့်ကို စောင့်နေသည်")}</h2>
          {todos.length ? (
            <ul className="mt-3 flex flex-col divide-y divide-line">
              {todos.map((td) => (
                <li key={td.id}>
                  <Link href={td.href} className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-3 hover:bg-surface">
                    <span className="mt-0.5 shrink-0">
                      <Badge tone={td.tone}>{td.label}</Badge>
                    </span>
                    <span className="text-sm font-medium">{td.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <Mascot pose="wink" size={96} />
              <p className="text-muted">{x("Nothing is waiting on you. Your next lesson is the best place to start.", "စောင့်နေတာ မရှိပါ။ နောက်သင်ခန်းစာကနေ စလိုက်ပါ။")}</p>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="roadmap-title" className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 id="roadmap-title" className="text-h4">
                {x("Your roadmap", "သင့်လမ်းပြမြေပုံ")}
              </h2>
              <p className="mt-1 text-body-sm text-muted">
                {x(
                  `${path.length} ${path.length === 1 ? "course" : "courses"} to complete, in this order · ${completedCount} done`,
                  `ပြီးရမည့် သင်တန်း ${path.length} ခု (ဒီအစီအစဉ်အတိုင်း) · ${completedCount} ခု ပြီးပြီ`,
                )}
              </p>
            </div>
            <Link href="/courses" className="text-body-sm font-semibold text-burgundy hover:underline">
              {x("All courses", "သင်တန်းအားလုံး")}
            </Link>
          </div>
          <ol className="mt-6">
            {path.map((c, i) => {
              const cert = s.certificates.find((k) => k.learnerId === me.id && k.courseId === c.id);
              const done = doneIn(c);
              const isCurrent = c.id === nextCourse?.id;
              const stepOpen = roadmapStepOpen(path, i, p.doneLessons, certifiedIds);
              const open = (li: number) => stepOpen && lessonIncluded(c, li, p.paidCourseIds, !!cert);
              const nextLi = c.lessons.findIndex((l) => !p.doneLessons.includes(l.id));
              const action = cert
                ? { href: `/certificates/${cert.id}`, label: x("View certificate", "လက်မှတ် ကြည့်မယ်") }
                : !stepOpen
                  ? null
                  : nextLi < 0
                  ? paidTrackOpen(c, p.paidCourseIds, false)
                    ? { href: `/courses/${c.id}/test`, label: x("Take the final test", "စာမေးပွဲ ဖြေမယ်") }
                    : { href: `/courses/${c.id}`, label: x("Unlock the final test", "စာမေးပွဲ ဖွင့်မယ်") }
                  : open(nextLi)
                    ? { href: `/courses/${c.id}/lessons/${c.lessons[nextLi].id}`, label: done ? x("Continue course", "ဆက်လေ့လာမယ်") : x("Start course", "စလေ့လာမယ်") }
                    : { href: `/courses/${c.id}`, label: x("Unlock the rest", "ကျန်တာ ဖွင့်မယ်") };
              const node = cert ? "bg-burgundy text-white" : isCurrent ? "bg-yellow text-[#5e2333]" : "border border-dashed border-[#e2c6ce] bg-[#fbf3f5] text-[#b48896]";
              return (
                <li key={c.id} className="relative flex gap-4 pb-7">
                  <span aria-hidden className={`absolute top-11 bottom-1 left-[19px] w-0.5 rounded-full ${cert ? "bg-burgundy" : "bg-line"}`} />
                  <span className={`relative grid size-10 shrink-0 place-items-center rounded-xl font-heading font-semibold ${node}`}>
                    {cert ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m5 12.5 4.5 4.5L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <Link href={`/courses/${c.id}`} className="font-heading text-h4 font-semibold hover:text-burgundy">
                        {courseTitle(c, lang)}
                      </Link>
                      {cert ? (
                        <Badge tone="success">{x(`Certified · ${cert.score}%`, `လက်မှတ်ရပြီ · ${cert.score}%`)}</Badge>
                      ) : isCurrent ? (
                        <Badge tone="highlight">{done ? x("In progress", "လေ့လာနေဆဲ") : x("Up next", "နောက်တစ်ခု")}</Badge>
                      ) : (
                        <Badge>{x("Not started", "မစရသေး")}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-body-sm text-muted">
                      {c.lessons.length} {t.lessons} · {c.hours} {t.hours} · {c.priceMmk === 0 ? t.fullyFree : `${t.firstFree} · ${formatMmk(c.priceMmk)}`}
                    </p>
                    {p.roadmapReasons?.[c.id] && (
                      <p className="mt-1 text-body-sm">
                        {x("Why", "ဘာကြောင့်")}: {p.roadmapReasons[c.id]}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface" role="progressbar" aria-label={courseTitle(c, lang)} aria-valuemin={0} aria-valuemax={c.lessons.length} aria-valuenow={done}>
                        <span className="block h-full rounded-full bg-burgundy" style={{ width: `${(done / c.lessons.length) * 100}%` }} />
                      </div>
                      <span className="text-caption text-muted tabular-nums">
                        {done} / {c.lessons.length}
                      </span>
                    </div>
                    <ul className="mt-3 flex flex-col">
                      {c.lessons.map((l, li) => {
                        const lessonDone = p.doneLessons.includes(l.id);
                        const lessonOpen = open(li);
                        const body = (
                          <>
                            <span className={`grid size-5 shrink-0 place-items-center rounded-full ${lessonDone ? "bg-success text-white" : "border border-line text-subtle"}`} aria-hidden>
                              {lessonDone ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m5 12.5 4.5 4.5L19 7" />
                                </svg>
                              ) : !lessonOpen ? (
                                <LockIcon size={11} />
                              ) : null}
                            </span>
                            <span className={`min-w-0 flex-1 truncate ${lessonOpen ? "" : "text-subtle"}`}>
                              {li + 1}. {l.title}
                            </span>
                            <span className="sr-only">{lessonDone ? x("Done", "ပြီးပြီ") : lessonOpen ? x("To do", "လုပ်ရန်") : x("Locked", "ပိတ်ထား")}</span>
                          </>
                        );
                        return (
                          <li key={l.id}>
                            {lessonOpen ? (
                              <Link href={`/courses/${c.id}/lessons/${l.id}`} className="-mx-2 flex min-h-9 items-center gap-2.5 rounded-lg px-2 text-body-sm hover:bg-surface">
                                {body}
                              </Link>
                            ) : (
                              <span className="-mx-2 flex min-h-9 items-center gap-2.5 px-2 text-body-sm">{body}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-3">
                      {action ? (
                        <LinkButton href={action.href} variant={isCurrent ? "primary" : "secondary"}>
                          {action.label}
                        </LinkButton>
                      ) : (
                        <p className="text-body-sm text-muted">
                          {x(`Finish “${courseTitle(path[i - 1], lang)}” first. This course opens when every lesson there is done.`, `“${courseTitle(path[i - 1], lang)}” ကို အရင်ပြီးအောင်လုပ်ပါ။ အဲဒီသင်ခန်းစာအားလုံးပြီးမှ ဒီသင်တန်း ဖွင့်ပါမယ်။`)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            <li className="flex gap-4">
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-t-full rounded-b-md border border-dashed border-[#e2c6ce] bg-[#fbf3f5] text-[#b48896]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 21V10a7 7 0 0 1 14 0v11M9 21v-6a3 3 0 0 1 6 0v6" />
                </svg>
              </span>
              <div className="min-w-0 pt-1">
                <p className="font-semibold">{x(`After ${path.length === 1 ? "this course" : `these ${path.length} courses`}`, `ဒီသင်တန်း ${path.length} ခု ပြီးရင်`)}</p>
                <p className="text-body-sm text-muted">{x("Company challenge → interview → internship. Applying and interviews are always free.", "ကုမ္ပဏီစိန်ခေါ်မှု → အင်တာဗျူး → အလုပ်သင်။ လျှောက်ထားခြင်းနဲ့ အင်တာဗျူးက အမြဲအခမဲ့။")}</p>
              </div>
            </li>
          </ol>
        </section>
        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="text-h4">{x("Roadmap at a glance", "လမ်းပြမြေပုံ အကျဉ်း")}</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {(
                [
                  [x("Courses done", "ပြီးသည့်သင်တန်း"), `${completedCount} / ${path.length}`],
                  [x("Lessons done", "ပြီးသည့်သင်ခန်းစာ"), `${lessonsDone} / ${lessonsTotal}`],
                  [x("Time left", "ကျန်အချိန်"), hoursLeft > 0 ? x(`${Math.ceil(hoursLeft)} h`, `${Math.ceil(hoursLeft)} နာရီ`) : "—"],
                  [x("Finish around", "ပြီးမည့်ရက်"), hoursLeft > 0 ? finishBy : x("Done", "ပြီးပြီ")],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface p-3">
                  <dt className="text-caption text-muted">{k}</dt>
                  <dd className="mt-1 font-heading text-h4 font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-caption text-muted">
              {x(`Based on ${p.hoursPerWeek} hours of study a week.`, `တစ်ပတ် ${p.hoursPerWeek} နာရီ လေ့လာမှုအပေါ် အခြေခံသည်။`)}{" "}
              <Link href="/onboarding" className="font-semibold text-burgundy hover:underline">
                {x("Change", "ပြောင်းမယ်")}
              </Link>
            </p>
          </Card>
          <AiPanel title={x("Why this order", "ဘာကြောင့် ဒီအစီအစဉ်လဲ")}>
            <p>{p.roadmapNote}</p>
          </AiPanel>
        </div>
      </div>
    </div>
  );
}
