"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AuthButton,
  AuthFrame,
  AuthIcon,
  AuthInput,
  AuthNote,
  type AuthIconName,
} from "@/components/auth/AuthFrame";
import { Mascot } from "@/components/ui/Mascot";
import { coursesForGoal, goals, makeRoadmap } from "@/lib/ai";
import { getCourses, useCourses } from "@/lib/catalogue";
import { copy, courseTitle, formatMmk } from "@/lib/i18n";
import { progressOf, setState, updateProgress, useData } from "@/lib/store";
import type { Lang } from "@/lib/types";

type Step = "language" | "goal" | "review" | "profile";
type Draft = {
  roadmap: string[];
  roadmapNote: string;
  reasons?: Record<string, string>;
};

const goalMy: Record<string, string> = {
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  fullstack: "Full-Stack Developer",
  uiux: "UI/UX Designer",
  data: "Data Analyst",
  unsure: "မသေချာသေးပါ",
};

export default function Onboarding() {
  const { s, me, lang } = useData();
  const courses = useCourses();
  const router = useRouter();
  const t = copy[lang];
  const x = (en: string, my: string) => (lang === "my" ? my : en);
  const current = progressOf(s, me.id);
  // Changing the goal later reruns only the goal and review steps. Decided once, so accepting a roadmap mid-flow doesn't switch modes.
  const [remake] = useState(current.roadmap.length > 0);
  const steps: Step[] = remake
    ? ["goal", "review"]
    : ["language", "goal", "review", "profile"];
  const [step, setStep] = useState<Step>(steps[0]);
  const [goal, setGoal] = useState(
    goals.some((g) => g.id === current.goal) ? current.goal : "",
  );
  const [currentSkills, setCurrentSkills] = useState(current.currentSkills);
  const [hours, setHours] = useState(current.hoursPerWeek);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [aiState, setAiState] = useState<"busy" | "error" | "done">("busy");
  const [goalError, setGoalError] = useState("");
  const [headline, setHeadline] = useState(me.headline);
  const [skills, setSkills] = useState(
    me.skills.join(", ") || current.currentSkills,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const index = steps.indexOf(step);
  const unsure = goal === "unsure";

  useEffect(() => {
    if (index > 0) heading.current?.focus();
  }, [index]);

  const labels: Record<Step, string> = {
    language: x("Language", "ဘာသာစကား"),
    goal: x("Your goal", "ပန်းတိုင်"),
    review: x("Your roadmap", "လမ်းကြောင်း"),
    profile: x("Your profile", "ကိုယ်ရေးအကျဉ်း"),
  };

  const build = async () => {
    setStep("review");
    setAiState("busy");
    const minimumLoading = new Promise<void>((resolve) => setTimeout(resolve, 3000));
    try {
      // If course search is down, use the standard path for the goal so the learner is never stuck here.
      const [roadmap] = await Promise.all([
        makeRoadmap(goal, unsure ? "" : currentSkills, hours, []).catch(
          () => ({
            roadmap: coursesForGoal(goal).filter((id) =>
              getCourses().some((c) => c.id === id),
            ),
            roadmapNote:
              "We couldn't reach our course search, so this is the standard path for your goal. You can remake it later.",
          }),
        ),
        minimumLoading,
      ]);
      setDraft(roadmap);
      setAiState("done");
    } catch {
      await minimumLoading;
      setAiState("error");
    }
  };

  const accept = () => {
    if (!draft) return;
    const { reasons, ...result } = draft;
    updateProgress(me.id, (p) => ({
      ...p,
      goal,
      currentSkills: unsure ? "" : currentSkills,
      hoursPerWeek: hours,
      ...result,
      roadmapReasons: reasons,
    }));
    if (remake) router.push("/roadmap");
    else setStep("profile");
  };

  const saveProfile = () => {
    const list = skills
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    setState((st) => ({
      ...st,
      users: st.users.map((u) =>
        u.id === me.id ? { ...u, headline: headline.trim(), skills: list } : u,
      ),
    }));
    router.push("/roadmap");
  };

  const goalDetails: Record<
    string,
    { name: string; icon: AuthIconName; description: string }
  > = {
    frontend: {
      name: "Frontend",
      icon: "code",
      description: x("Build for the web", "ဝဘ်မျက်နှာပြင်များဖန်တီးပါ"),
    },
    backend: {
      name: "Backend",
      icon: "server",
      description: x("Power the applications", "အက်ပ်နောက်ကွယ်စနစ်ဆောက်ပါ"),
    },
    fullstack: {
      name: "Full-stack",
      icon: "layers",
      description: x("Do both", "ရှေ့နှင့်နောက် နှစ်မျိုးလုံး"),
    },
    uiux: {
      name: "UI/UX",
      icon: "pen",
      description: x(
        "Design great experiences",
        "ကောင်းမွန်သောအတွေ့အကြုံ ဖန်တီးပါ",
      ),
    },
    data: {
      name: x("Data analyst", "ဒေတာခွဲခြမ်းစိတ်ဖြာသူ"),
      icon: "chart",
      description: x("Turn data into insights", "ဒေတာမှ အချက်အလက်ရယူပါ"),
    },
    unsure: {
      name: x("Not sure yet", "မသေချာသေးပါ"),
      icon: "compass",
      description: x("Help me decide", "ရွေးချယ်ရန်ကူညီပါ"),
    },
  };
  const stepper = (
    <ol className="ca-stepper" aria-label={x("Onboarding steps", "အဆင့်များ")}>
      {steps.map((id, i) => (
        <li
          key={id}
          aria-current={id === step ? "step" : undefined}
          className={
            i < index ? "ca-stepDone" : id === step ? "ca-stepCurrent" : ""
          }
        >
          <span>{i < index ? <AuthIcon name="check" size={15} /> : i + 1}</span>
          <strong>{labels[id]}</strong>
        </li>
      ))}
    </ol>
  );
  const roadmapPreview = (
    <div className="ca-roadmapMini" aria-hidden>
      <strong>{x("Your roadmap", "သင့်လမ်းကြောင်း")}</strong>
      <div>
        <i />
        <span />
        <i />
        <span />
        <i />
      </div>
    </div>
  );

  return (
    <AuthFrame variant={step === "review" ? "review" : "onboarding"}>
      {step === "language" && (
        <section className="ca-welcome">
          <div className="ca-welcomeScene">
            <div className="ca-welcomeSceneCopy">
              <span className="ca-welcomeEyebrow">
                {x(
                  "SMALL STEPS. REAL POSSIBILITIES.",
                  "တစ်ဆင့်ချင်းမှ အခွင့်အလမ်းဆီသို့",
                )}
              </span>
              <h2>
                {x("Your next chapter", "သင့်ရဲ့ နောက်အခန်းသစ်ကို")}
                <br />
                <em>{x("starts with you.", "အတူတူ စတင်မယ်။")}</em>
              </h2>
              <p>
                {x(
                  "A little learning. A little courage. A path you can call your own.",
                  "နည်းနည်းချင်း သင်ယူရင်း သင့်အတွက် ကိုယ်ပိုင်လမ်းကြောင်းကို ဖန်တီးလိုက်ပါ။",
                )}
              </p>
            </div>
            <Image
              src="/images/landing/career-stairway.webp"
              alt=""
              width={900}
              height={700}
              priority
              className="ca-welcomeJourney"
            />
            <div
              className="ca-welcomeMilestones"
              aria-label={x("Your learning journey", "သင်ယူမှုခရီးစဉ်")}
            >
              <span>
                <AuthIcon name="graduate" size={17} />
                {x("Learn", "သင်ယူ")}
              </span>
              <i aria-hidden>→</i>
              <span>
                <AuthIcon name="code" size={17} />
                {x("Practise", "လေ့ကျင့်")}
              </span>
              <i aria-hidden>→</i>
              <span>
                <AuthIcon name="briefcase" size={17} />
                {x("Find opportunities", "အခွင့်အလမ်းရှာ")}
              </span>
            </div>
          </div>
          <div className="ca-languageStep ca-welcomeForm ca-stepPanel">
            <div className="ca-stepScroll">
              <div className="ca-welcomeStep">
                <span>01 / 04</span>
                <span>
                  {x("LET'S GET TO KNOW YOU", "သင့်အကြောင်း သိပါရစေ")}
                </span>
              </div>
              <div className="ca-welcomeGreeting">
                <Mascot pose="hello" size={88} priority />
                <span>
                  {x("Hey, future you!", "မင်္ဂလာပါ။")} <i aria-hidden>✦</i>
                </span>
              </div>
              <div className="ca-heading">
                <h1 ref={heading} tabIndex={-1}>
                  {x("Make yourself ", "သင့်စိတ်ကြိုက် ")}
                  <em>{x("at home.", "စတင်လိုက်ပါ။")}</em>
                </h1>
                <p>
                  {x(
                    "First, how would you like to learn? Choose the language you're most comfortable with.",
                    "အရင်ဆုံး သင်သက်သောင့်သက်သာ လေ့လာနိုင်ဖို့ နှစ်သက်တဲ့ ဘာသာစကားကို ရွေးပေးပါ။",
                  )}
                </p>
              </div>
              <fieldset>
                <legend className="ca-srOnly">{t.language}</legend>
                <div className="ca-languageChoices">
                  {(
                    [
                      ["en", "English", "Aa"],
                      ["my", "မြန်မာ", "က"],
                    ] as [Lang, string, string][]
                  ).map(([id, label, glyph]) => (
                    <label
                      className={`ca-languageChoice ${lang === id ? "ca-selected" : ""}`}
                      key={id}
                    >
                      <input
                        type="radio"
                        name="lang"
                        checked={lang === id}
                        onChange={() => setState((st) => ({ ...st, lang: id }))}
                      />
                      <span className="ca-languageGlyph">{glyph}</span>
                      <strong>{label}</strong>
                      <small>
                        {id === "en"
                          ? "Let’s get started"
                          : "အတူတူ စလိုက်ကြစို့"}
                      </small>
                      <span className="ca-choiceRadio" aria-hidden />
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="ca-welcomeNext">
                <AuthIcon name="compass" size={17} />
                {x(
                  "Up next: discover a direction that fits you.",
                  "နောက်တစ်ဆင့်မှာ သင့်အတွက် သင့်တော်မယ့် ပန်းတိုင်ကို ရွေးမယ်။",
                )}
              </p>
            </div>
            <div className="ca-stepFooter">
              <AuthButton onClick={() => setStep("goal")}>
                {x("Let’s find my path", "ကျွန်ုပ်၏လမ်းကြောင်း ရှာမယ်")}
              </AuthButton>
              <AuthNote>
                {x(
                  "You can change this any time from the top bar.",
                  "အပေါ်ဘားမှ အချိန်မရွေးပြောင်းနိုင်သည်။",
                )}
              </AuthNote>
            </div>
          </div>
        </section>
      )}

      {step !== "language" && (
        <div className={`ca-journeySplit ca-journeySplit-${step}`}>
          <aside className="ca-journeyAside">
            <div className="ca-journeyAsideCopy">
              <span className="ca-welcomeEyebrow">
                {x("YOUR NEXT CHAPTER", "သင့်ရဲ့ နောက်အခန်းသစ်")}
              </span>
              <h2>
                {step === "goal"
                  ? x("Every great journey", "ခရီးစဉ်တိုင်းမှာ")
                  : step === "review"
                    ? x("Small steps.", "တစ်ဆင့်ချင်း။")
                    : x("Your story.", "သင့်ရဲ့ ဇာတ်လမ်း။")}
                <br />
                <em>
                  {step === "goal"
                    ? x("starts with a direction.", "ဦးတည်ရာတစ်ခု ရှိပါတယ်။")
                    : step === "review"
                      ? x(
                          "A path that's yours.",
                          "သင့်အတွက် ကိုယ်ပိုင်လမ်းကြောင်း။",
                        )
                      : x("Your possibilities.", "သင့်ရဲ့ အခွင့်အလမ်းများ။")}
                </em>
              </h2>
              <p>
                {step === "goal"
                  ? x(
                      "Follow your curiosity. You don't need all the answers to take the first step.",
                      "စိတ်ဝင်စားရာကနေ စတင်ပါ။ ပထမခြေလှမ်းအတွက် အဖြေအားလုံး သိထားဖို့ မလိုပါဘူး။",
                    )
                  : step === "review"
                    ? x(
                        "A little learning at a time. Your goal, your pace, your way forward.",
                        "နည်းနည်းချင်း သင်ယူပါ။ သင့်ပန်းတိုင်၊ သင့်အရှိန်နဲ့ ရှေ့ဆက်ပါ။",
                      )
                    : x(
                        "Let the people behind your next opportunity get to know the person behind the skills.",
                        "သင့်ကျွမ်းကျင်မှုတွေနောက်က သင့်အကြောင်းကို အခွင့်အလမ်းဖန်တီးပေးမယ့်သူတွေ သိခွင့်ပေးပါ။",
                      )}
              </p>
            </div>
            <div className={`ca-stepScene ca-stepScene-${step}`}>
              {step === "goal" ? (
                <>
                  <span className="ca-sceneChip ca-sceneChip-one">
                    <AuthIcon name="code" />
                    Build
                  </span>
                  <span className="ca-sceneChip ca-sceneChip-two">
                    <AuthIcon name="pen" />
                    Design
                  </span>
                  <Image
                    src="/images/auth/mascot-compass.webp"
                    alt={x(
                      "The Citadel mascot holding a compass to choose a direction",
                      "လမ်းကြောင်းရွေးရန် သံလိုက်အိမ်မြှောင်ကိုင်ထားသော mascot",
                    )}
                    width={520}
                    height={390}
                    priority
                  />
                  <span className="ca-sceneChip ca-sceneChip-three">
                    <AuthIcon name="chart" />
                    Discover
                  </span>
                </>
              ) : step === "review" ? (
                <>
                  <div className="ca-sceneRoad">
                    <div>
                      <span>01</span>
                      <AuthIcon name="graduate" />
                      <strong>{x("Learn the basics", "အခြေခံ သင်ယူ")}</strong>
                      <i>✓</i>
                    </div>
                    <div>
                      <span>02</span>
                      <AuthIcon name="code" />
                      <strong>
                        {x("Build your skills", "ကျွမ်းကျင်မှု တည်ဆောက်")}
                      </strong>
                      <i>✦</i>
                    </div>
                    <div>
                      <span>03</span>
                      <AuthIcon name="briefcase" />
                      <strong>
                        {x("Show what you can do", "လုပ်နိုင်စွမ်း ပြသ")}
                      </strong>
                      <i>↗</i>
                    </div>
                  </div>
                  <Mascot pose="journey" size={260} />
                </>
              ) : (
                <>
                  <div className="ca-sceneProfile">
                    <div className="ca-sceneAvatar">{me.name.charAt(0)}</div>
                    <strong>{me.name}</strong>
                    <span>
                      {headline ||
                        x(
                          "Your next chapter starts here",
                          "သင့်အခန်းသစ်ကို ဒီမှာ စတင်ပါ",
                        )}
                    </span>
                    <div>
                      <b>{x("Curiosity", "စူးစမ်းလိုစိတ်")}</b>
                      <b>{x("Potential", "အလားအလာ")}</b>
                      <b>✦</b>
                    </div>
                  </div>
                  <Mascot pose="ready" size={245} />
                </>
              )}
            </div>
            <div className="ca-journeyAsideNote">
              <AuthIcon
                name={
                  step === "goal"
                    ? "compass"
                    : step === "review"
                      ? "clock"
                      : "user"
                }
              />
              <span>
                {step === "goal"
                  ? x(
                      "It's okay to explore. Your direction can change.",
                      "စူးစမ်းကြည့်ပါ။ လမ်းကြောင်းကို ပြန်ပြောင်းနိုင်ပါတယ်။",
                    )
                  : step === "review"
                    ? x(
                        "Made to fit your time, not the other way around.",
                        "သင်အားလပ်တဲ့ အချိန်နဲ့ ကိုက်ညီစေဖို့ပါ။",
                      )
                    : x(
                        "A little introduction. A world of possibilities.",
                        "မိတ်ဆက်မှုလေးမှ အခွင့်အလမ်းများဆီသို့။",
                      )}
              </span>
            </div>
          </aside>
          <div className="ca-journeyContent">
            {stepper}
            {step === "goal" && (
              <section className="ca-goalStep ca-stepPanel">
                <form
                  className="ca-form ca-stepPanel"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!goal) {
                      setGoalError(
                        x(
                          "Choose a goal, or pick Not sure yet.",
                          "ပန်းတိုင်ရွေးပါ သို့မဟုတ် မသေချာသေးပါကို ရွေးပါ။",
                        ),
                      );
                      document.getElementById("career-goal")?.focus();
                      return;
                    }
                    build();
                  }}
                >
                  <div className="ca-stepScroll">
                    <div className="ca-goalHeading">
                      <div className="ca-heading">
                        <h1 ref={heading} tabIndex={-1}>
                          {remake
                            ? x("Ready for a new ", "လမ်းကြောင်းအသစ် ")
                            : x("Where do you ", "ဘယ်ကို ")}
                          <br />
                          {remake ? (
                            <em>{x("direction?", "ရွေးမလား။")}</em>
                          ) : (
                            <>
                              {x("want to ", "ရောက်ချင်ပါသလဲ")}
                              <em>{x("go?", "။")}</em>
                            </>
                          )}
                        </h1>
                        <p>
                          {x(
                            "Choose a path to get a personalised learning roadmap.",
                            "သင်နှင့်ကိုက်ညီသော လမ်းပြမြေပုံရရန် လမ်းကြောင်းရွေးပါ။",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="ca-field">
                      <label htmlFor="career-goal">
                        {x("Career goal", "အလုပ်အကိုင်ပန်းတိုင်")}
                      </label>
                      <div
                        className={`ca-inputWrap ca-selectWrap ${goal ? "" : "ca-selectEmpty"} ${goalError ? "ca-invalid" : ""}`}
                      >
                        <AuthIcon
                          name={goal ? goalDetails[goal].icon : "compass"}
                          size={19}
                        />
                        <select
                          id="career-goal"
                          value={goal}
                          aria-invalid={!!goalError}
                          aria-describedby={
                            goalError ? "goal-error" : "goal-hint"
                          }
                          onChange={(e) => {
                            setGoal(e.target.value);
                            setGoalError("");
                          }}
                        >
                          <option value="" disabled>
                            {x("Choose a career goal", "ပန်းတိုင်တစ်ခု ရွေးပါ")}
                          </option>
                          {goals.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.id === "unsure"
                                ? goalDetails.unsure.name
                                : lang === "my"
                                  ? goalMy[g.id]
                                  : g.label}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="ca-selectChevron"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                      {goalError ? (
                        <p id="goal-error" className="ca-error" role="alert">
                          {goalError}
                        </p>
                      ) : (
                        <p id="goal-hint" className="ca-hint">
                          {goal === "unsure"
                            ? x(
                                "Start with the free career starter course and decide later.",
                                "အခမဲ့ Career starter သင်တန်းဖြင့် စတင်ပြီး နောက်မှ ဆုံးဖြတ်ပါ။",
                              )
                            : goal
                              ? goalDetails[goal].description
                              : x(
                                  "Pick the path you'd like to follow. You can change it later.",
                                  "လိုက်ချင်သည့် လမ်းကြောင်းကို ရွေးပါ။ နောက်မှ ပြောင်းနိုင်သည်။",
                                )}
                        </p>
                      )}
                    </div>
                    <div
                      className={`ca-goalDetails ${unsure ? "ca-unsureDetails" : ""}`}
                    >
                      {!unsure && (
                        <AuthInput
                          label={x(
                            "What can you do already? (optional)",
                            "ဘာတွေလုပ်တတ်ပြီးပြီလဲ။ (မဖြစ်မနေမလိုပါ)",
                          )}
                          icon="chart"
                          placeholder="e.g. HTML, Python, Figma"
                          value={currentSkills}
                          onChange={(e) => setCurrentSkills(e.target.value)}
                        />
                      )}
                      <fieldset className="ca-timeField">
                        <legend className="ca-fieldLegend">
                          {x(
                            "Weekly time commitment",
                            "တစ်ပတ်လျှင် လေ့လာနိုင်သည့်အချိန်",
                          )}
                        </legend>
                        <div className="ca-timeChoices">
                          {[3, 5, 10].map((value) => (
                            <label
                              key={value}
                              className={hours === value ? "ca-selected" : ""}
                            >
                              <input
                                type="radio"
                                name="hours-choice"
                                checked={hours === value}
                                onChange={() => setHours(value)}
                              />
                              {value} {x("hrs", "နာရီ")}
                            </label>
                          ))}
                          <label
                            className={`ca-customHours ${![3, 5, 10].includes(hours) ? "ca-customActive" : ""}`}
                          >
                            <span className="ca-srOnly">
                              {x(
                                "Custom hours per week",
                                "တစ်ပတ်လျှင် အခြားနာရီ",
                              )}
                            </span>
                            <input
                              aria-label={x(
                                "Custom hours per week",
                                "တစ်ပတ်လျှင် အခြားနာရီ",
                              )}
                              type="number"
                              min={1}
                              max={60}
                              placeholder={x("Other", "အခြား")}
                              value={[3, 5, 10].includes(hours) ? "" : hours}
                              onChange={(e) => setHours(Number(e.target.value))}
                            />
                          </label>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                  <div className="ca-stepFooter">
                    <div className="ca-onboardingActions">
                      <AuthButton
                        secondary
                        back
                        onClick={() =>
                          remake ? router.push("/roadmap") : setStep("language")
                        }
                      >
                        {remake
                          ? x("Keep current", "လက်ရှိအတိုင်းထားမယ်")
                          : x("Back", "နောက်သို့")}
                      </AuthButton>
                      <AuthButton type="submit">
                        {x("Make my roadmap", "လမ်းကြောင်းဖန်တီးမယ်")}
                      </AuthButton>
                      {roadmapPreview}
                    </div>
                    <AuthNote>
                      {x(
                        "You can review your roadmap before saving.",
                        "မသိမ်းမီ သင့်လမ်းကြောင်းကို ပြန်စစ်နိုင်သည်။",
                      )}
                    </AuthNote>
                  </div>
                </form>
              </section>
            )}

            {step === "review" && (
              <section
                className="ca-reviewStep ca-stepPanel"
                aria-busy={aiState === "busy"}
              >
                <div className="ca-stepScroll">
                  <div className="ca-heading ca-centered">
                    <h1 ref={heading} tabIndex={-1}>
                      {x("A path built around ", "သင့်အတွက်ဖန်တီးထားသော ")}
                      <em>{x("you.", "လမ်းကြောင်း။")}</em>
                    </h1>
                    <p>
                      {x(
                        "Take a look. Make it yours before you begin.",
                        "စတင်မလေ့လာမီ သင့်နှင့်ကိုက်ညီမှုကို ပြန်စစ်ပါ။",
                      )}
                    </p>
                  </div>
                  {aiState === "busy" && (
                    <div className="ca-building ca-roadmapLoading" role="status" aria-live="polite">
                      <div className="ca-mascotOrbit" aria-hidden="true">
                        <span className="ca-orbitRing" /><span className="ca-orbitSpark">✦</span>
                        <div className="ca-loaderMascot"><Mascot pose="laptop" size={175} /></div>
                        <span className="ca-orbitBadge ca-orbitBadge-learn"><AuthIcon name="graduate" size={20}/></span>
                        <span className="ca-orbitBadge ca-orbitBadge-goal"><AuthIcon name="compass" size={20}/></span>
                        <span className="ca-orbitBadge ca-orbitBadge-done"><AuthIcon name="check" size={20}/></span>
                      </div>
                      <div className="ca-loadingDots" aria-hidden>
                        <i />
                        <i />
                        <i />
                      </div>
                      <h2>
                        {x(
                          "Making a path just for you…",
                          "သင့်နောက်တစ်ဆင့်ကို ရှာဖွေနေသည်…",
                        )}
                      </h2>
                      <p>
                        {x(
                          "Putting your goal, skills, and time together.",
                          "ရည်မှန်းချက်၊ စွမ်းရည်နှင့် အချိန်ကို စုစည်းနေသည်။",
                        )}
                      </p>
                      <div className="ca-loaderPath" aria-hidden="true"><span/><i/><span/><i/><span/></div>
                    </div>
                  )}
                  {aiState === "error" && (
                    <div className="ca-buildError" role="alert">
                      <AuthIcon name="info" size={32} />
                      <h2>
                        {x("Let's try that again.", "ထပ်ကြိုးစားကြည့်ရအောင်။")}
                      </h2>
                      <p>
                        {x(
                          "We couldn't make your roadmap. Check your connection and try again.",
                          "လမ်းကြောင်းမဖန်တီးနိုင်ပါ။ အင်တာနက်ပြန်စစ်ပြီး ထပ်ကြိုးစားပါ။",
                        )}
                      </p>
                      <AuthButton onClick={build}>
                        {x("Try again", "ထပ်ကြိုးစားမယ်")}
                      </AuthButton>
                      <AuthButton
                        secondary
                        back
                        onClick={() => setStep("goal")}
                      >
                        {x("Back to my answers", "အဖြေများသို့ပြန်မယ်")}
                      </AuthButton>
                    </div>
                  )}
                  {aiState === "done" && draft && (
                    <>
                      <div className="ca-roadmapReview">
                        <div className="ca-coursePath">
                          <div className="ca-reviewGoal">
                            <AuthIcon
                              name={goalDetails[goal]?.icon ?? "compass"}
                            />
                            <span>
                              {goal === "unsure"
                                ? x(
                                    "Explore your possibilities",
                                    "အခွင့်အလမ်းများကိုရှာပါ",
                                  )
                                : goalMy[goal]}
                            </span>
                            <small>
                              {hours} {x("hours / week", "နာရီ / တစ်ပတ်")}
                            </small>
                          </div>
                          <ol>
                            {draft.roadmap.map((id, i) => {
                              const c = courses.find((k) => k.id === id);
                              if (!c) return null;
                              return (
                                <li key={id}>
                                  <span className="ca-courseNumber">
                                    {i + 1}
                                  </span>
                                  <div>
                                    <h2>{courseTitle(c, lang)}</h2>
                                    <p>
                                      {c.lessons.length} {t.lessons} · {c.hours}{" "}
                                      {t.hours}
                                      {c.priceMmk > 0 &&
                                        ` · ${formatMmk(c.priceMmk)}`}
                                    </p>
                                  </div>
                                  <span
                                    className={`ca-courseBadge ${c.priceMmk === 0 ? "ca-free" : ""}`}
                                  >
                                    {c.priceMmk === 0
                                      ? t.fullyFree
                                      : t.firstFree}
                                  </span>
                                </li>
                              );
                            })}
                          </ol>
                          <div className="ca-opportunityNote">
                            <AuthIcon name="briefcase" />
                            <p>
                              {x(
                                "Build your skills first. Company challenges and interviews come next.",
                                "စွမ်းရည်ကိုအရင်တည်ဆောက်ပါ။ ကုမ္ပဏီစိန်ခေါ်မှုနှင့် အင်တာဗျူးများက နောက်တစ်ဆင့်ဖြစ်သည်။",
                              )}
                            </p>
                          </div>
                        </div>
                        <aside className="ca-whyRoadmap">
                          <AuthIcon name="spark" size={25} />
                          <h2>
                            {x("Why this order?", "ဘာကြောင့် ဒီအစီအစဉ်လဲ။")}
                          </h2>
                          <p>{draft.roadmapNote}</p>
                          <small>
                            {x(
                              "AI-supported demo suggestion. Review before relying on it.",
                              "AI အကူအညီပါ နမူနာအကြံပြုချက်။ အသုံးမပြုမီ ပြန်စစ်ပါ။",
                            )}
                          </small>
                        </aside>
                      </div>
                    </>
                  )}
                </div>
                {aiState === "done" && draft && (
                  <div className="ca-stepFooter">
                    <div className="ca-reviewActions">
                      <AuthButton
                        secondary
                        back
                        onClick={() => setStep("goal")}
                      >
                        {x("Change my answers", "အဖြေပြင်မယ်")}
                      </AuthButton>
                      <AuthButton onClick={accept}>
                        {x("Save my roadmap", "လမ်းကြောင်းသိမ်းမယ်")}
                      </AuthButton>
                    </div>
                    <button className="ca-textButton" onClick={build}>
                      {x("Suggest it again", "ပြန်အကြံပြုပေးပါ")}
                    </button>
                    <AuthNote>
                      {x(
                        "The career starter is free. Other courses include a free preview; full tracks may be paid.",
                        "Career starter အခမဲ့ဖြစ်သည်။ အခြားသင်တန်းများတွင် အခမဲ့နမူနာပါပြီး အပြည့်အစုံအတွက် အခကြေးငွေရှိနိုင်သည်။",
                      )}
                    </AuthNote>
                  </div>
                )}
              </section>
            )}

            {step === "profile" && (
              <form
                className="ca-profileStep ca-stepPanel"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile();
                }}
              >
                <div className="ca-stepScroll">
                  <div className="ca-profileArt">
                    <Mascot pose="ready" size={125} />
                  </div>
                  <div className="ca-heading ca-centered">
                    <h1 ref={heading} tabIndex={-1}>
                      {x("Put your best foot ", "သင့်အကြောင်းကို ")}
                      <em>{x("forward.", "မိတ်ဆက်ပါ။")}</em>
                    </h1>
                    <p>
                      {x(
                        "Your roadmap is saved. Add a little about yourself, or do it later.",
                        "လမ်းကြောင်းသိမ်းပြီးပါပြီ။ သင့်အကြောင်းယခုဖြည့်ပါ သို့မဟုတ် နောက်မှဖြည့်ပါ။",
                      )}
                    </p>
                  </div>
                  <div className="ca-profilePreview">
                    <span>
                      {me.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div>
                      <strong>{me.name}</strong>
                      <p>
                        {headline ||
                          x(
                            "Your next chapter starts here.",
                            "သင့်အခွင့်အလမ်းအသစ်ကို ဒီမှာစတင်ပါ။",
                          )}
                      </p>
                    </div>
                    <AuthIcon name="spark" />
                  </div>
                  <div className="ca-form">
                    <AuthInput
                      label={x("Headline", "ခေါင်းစဉ်")}
                      icon="user"
                      placeholder={x(
                        "Aspiring frontend developer in Yangon",
                        "Frontend developer ဖြစ်လိုသူ",
                      )}
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                    <AuthInput
                      label={x("Skills", "ကျွမ်းကျင်မှုများ")}
                      icon="code"
                      hint={x(
                        "Separate your skills with commas.",
                        "ကျွမ်းကျင်မှုများကို ကော်မာဖြင့် ခြားပါ။",
                      )}
                      placeholder="HTML, Excel, English"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>
                </div>
                <div className="ca-stepFooter">
                  <AuthButton type="submit">
                    {x(
                      "Save and see my roadmap",
                      "သိမ်းပြီး လမ်းကြောင်းကြည့်မယ်",
                    )}
                  </AuthButton>
                  <button
                    type="button"
                    className="ca-textButton"
                    onClick={() => router.push("/roadmap")}
                  >
                    {x("Skip for now", "နောက်မှဖြည့်မယ်")}
                  </button>
                  <AuthNote>
                    {x(
                      "Verified companies see your profile when you take their challenge.",
                      "စိန်ခေါ်မှုဖြေဆိုသည့်အခါ အတည်ပြုကုမ္ပဏီများက ကိုယ်ရေးအကျဉ်းကို မြင်နိုင်သည်။",
                    )}
                  </AuthNote>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthFrame>
  );
}
