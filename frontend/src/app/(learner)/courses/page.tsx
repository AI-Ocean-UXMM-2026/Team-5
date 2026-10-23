"use client";

import Link from "next/link";
import { useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { Mascot } from "@/components/ui/Mascot";
import { courseTitle, formatMmk } from "@/lib/i18n";
import { useCourses } from "@/lib/catalogue";
import { progressOf, useData } from "@/lib/store";
import "@/components/learning/courses.css";

function CourseArt({ id }: { id: string }) {
  return (
    <div className={`lc-art lc-art-${id}`} aria-hidden="true">
      {id === "frontend" ? (
        <div className="lc-browser">
          <div className="lc-browserBar">
            <i />
            <i />
            <i />
            <span>your-next-project.dev</span>
          </div>
          <div className="lc-code">
            <span>&lt;your future&gt;</span>
            <b>
              Build something
              <br />
              that matters<span>.</span>
            </b>
            <div className="lc-codeLines">
              <i />
              <i />
              <i />
            </div>
            <em>&lt;/&gt;</em>
          </div>
          <div className="lc-floatTag">HTML · CSS · JS</div>
        </div>
      ) : id === "starter" ? (
        <>
          <div className="lc-artLabel">YOUR FIRST CHAPTER</div>
          <Mascot pose="read" size={155} />
          <div className="lc-artNote">
            Big ideas.
            <br />
            <b>Small first steps.</b>
          </div>
          <span className="lc-artStar">✦</span>
        </>
      ) : id !== "qa" ? (
        <div className={`flex size-full items-center justify-center ${covers[id] ?? "bg-yellow-tint text-ink"}`}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d={iconPaths[id as keyof typeof iconPaths] ?? iconPaths.other} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <>
          <div className="lc-testWindow">
            <div className="lc-browserBar">
              <i />
              <i />
              <i />
              <span>Quality check</span>
            </div>
            <p>
              <span>✓</span> Find the unexpected
            </p>
            <p>
              <span>✓</span> Make it work better
            </p>
            <p>
              <span className="lc-bug">!</span> One bug at a time
            </p>
          </div>
          <div className="lc-qaStamp">
            QA<span>TESTED</span>
          </div>
        </>
      )}
    </div>
  );
}

const iconPaths = {
  // compass
  starter: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z",
  // code brackets
  frontend: "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  // bug
  qa: "M9 7a3 3 0 0 1 6 0M8 9h8v5a4 4 0 0 1-8 0V9Zm-3 2h3m8 0h3M5 16h3m8 0h3M12 11v7",
  // monitor
  "computer-basics": "M4 5h16v11H4V5Zm5 15h6m-3-4v4",
  // speech bubble
  "english-it": "M5 5h14v10H10l-4 4v-4H5V5Zm4 4h6m-6 3h4",
  // branch
  git: "M7 4v10m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm10-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0c0 4-10 2-10 6",
  // atom
  react: "M12 12h.01M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8Zm-6.9 4 13.8 8m-13.8 0 13.8-8",
  // server rack
  "node-backend": "M4 5h16v5H4V5Zm0 9h16v5H4v-5Zm3-6.5h.01M7 16.5h.01",
  // database
  sql: "M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3Zm0 0v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3",
  // layout
  uiux: "M4 4h16v16H4V4Zm0 5h16M9 9v11",
  // pen nib
  figma: "M12 3 5 10l4 11h6l4-11-7-7Zm0 0v8m0 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3",
  // grid
  spreadsheets: "M4 4h16v16H4V4Zm0 5h16M4 14h16M10 4v16",
  // bar chart
  "python-data": "M4 20h16M7 16v-4m5 4V8m5 8v-7",
  // wrench
  "it-support": "M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3L15 12l-3-3 2.5-2.5Z",
  // shield
  security: "M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Zm-3 9 2 2 4-4",
  // open book
  other: "M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5V5.5ZM12 6v13.5",
};

// Each course gets its own cover colour by area; courses not listed here fall back to yellow.
const covers: Record<string, string> = {
  starter: "bg-success-tint text-success",
  "computer-basics": "bg-success-tint text-success",
  "english-it": "bg-success-tint text-success",
  git: "bg-success-tint text-success",
  frontend: "bg-burgundy-tint text-burgundy",
  react: "bg-burgundy-tint text-burgundy",
  "node-backend": "bg-burgundy-tint text-burgundy",
  sql: "bg-burgundy-tint text-burgundy",
  uiux: "bg-yellow-tint text-ink",
  figma: "bg-yellow-tint text-ink",
  spreadsheets: "bg-ai text-ai-ink",
  "python-data": "bg-ai text-ai-ink",
  qa: "bg-ai text-ai-ink",
  "it-support": "bg-surface text-ink",
  security: "bg-surface text-ink",
};

export default function Courses() {
  const { s, me, lang } = useData();
  const courses = useCourses();
  const my = lang === "my";
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const progress = progressOf(s, me.id);
  const done = (c: (typeof courses)[number]) =>
    c.lessons.filter((l) => progress.doneLessons.includes(l.id)).length;
  const completed = courses.filter((c) => done(c) === c.lessons.length);
  const roadmapCourses = progress.roadmap
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is (typeof courses)[number] => !!c);
  const shown = courses.filter(
    (c) =>
      (filter === "all" ||
        (filter === "roadmap"
          ? progress.roadmap.includes(c.id)
          : completed.includes(c))) &&
      `${courseTitle(c, lang)} ${c.title} ${c.skill}`
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );

  return (
    <div className="lc-workspace">
      <PageHeader
        title={my ? "သင်တန်းများ" : "Courses"}
        intro={
          my
            ? "လေ့လာပါ။ လေ့ကျင့်ပါ။ လက်တွေ့ပြသပါ။ သင်တန်းတိုင်းကို အခမဲ့ စမ်းလေ့လာနိုင်သည်။"
            : "Learn it. Practise it. Put it to work. Every course starts with a free first step."
        }
      >
        <SearchBar label={my ? "သင်တန်းရှာရန်" : "Search courses"} placeholder={my ? "သင်တန်းရှာရန်" : "Search courses"} value={q} onChange={setQ} />
        <LinkButton href="/roadmap" variant="secondary">
          {my ? "ကျွန်ုပ်၏ လမ်းပြမြေပုံ" : "View my roadmap"}
        </LinkButton>
      </PageHeader>
      <section className="lc-catalog" aria-label={my ? "သင်တန်းများ" : "Course catalogue"}>
        <div className="lc-filterRow">
          <div
            className="lc-filters"
            role="group"
            aria-label={my ? "သင်တန်း စစ်ထုတ်ရန်" : "Filter courses"}
          >
            {[
              ["all", my ? "အားလုံး" : "All courses", courses.length],
              [
                "roadmap",
                my ? "ကျွန်ုပ်၏ လမ်းပြမြေပုံ" : "My roadmap",
                roadmapCourses.length,
              ],
              [
                "completed",
                my ? "ပြီးမြောက်ပြီး" : "Completed",
                completed.length,
              ],
            ].map(([id, label, count]) => (
              <button
                key={id}
                aria-pressed={filter === id}
                onClick={() => setFilter(String(id))}
              >
                {label}
                <span>{count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="lc-courseGrid" aria-live="polite">
          {shown.map((c) => {
            const count = done(c);
            return (
              <article className="lc-courseCard" key={c.id}>
                <Link
                  href={`/courses/${c.id}`}
                  className="lc-coverLink"
                  aria-label={courseTitle(c, lang)}
                >
                  <CourseArt id={c.id} />
                  {progress.roadmap.includes(c.id) && (
                    <span className="lc-roadmapBadge">
                      ✦{" "}
                      {my ? "သင့်လမ်းပြမြေပုံတွင် ပါဝင်သည်" : "On your roadmap"}
                    </span>
                  )}
                </Link>
                <div className="lc-courseBody">
                  <div className="lc-courseMeta">
                    <span>{c.skill}</span>
                    <span>{c.level}</span>
                  </div>
                  <h3>
                    <Link href={`/courses/${c.id}`}>
                      {courseTitle(c, lang)}
                    </Link>
                  </h3>
                  <p>{c.description}</p>
                  <div className="lc-duration">
                    <span>
                      ▤ {c.lessons.length} {my ? "သင်ခန်းစာ" : "lessons"}
                    </span>
                    <span>
                      ◷ {c.hours} {my ? "နာရီ" : "hours"}
                    </span>
                  </div>
                  {count > 0 && (
                    <div className="lc-cardProgress">
                      <div className="lc-track">
                        <span
                          style={{
                            width: `${(count / c.lessons.length) * 100}%`,
                          }}
                        />
                      </div>
                      <small>
                        {Math.round((count / c.lessons.length) * 100)}%
                      </small>
                    </div>
                  )}
                  <div className="lc-courseBottom">
                    <div>
                      <strong>
                        {c.priceMmk === 0
                          ? my
                            ? "အခမဲ့"
                            : "Free"
                          : formatMmk(c.priceMmk)}
                      </strong>
                      <small>
                        {c.priceMmk === 0
                          ? my
                            ? "သင်တန်းတစ်ခုလုံး အခမဲ့"
                            : "The whole course. Yours."
                          : my
                            ? "ပထမ ၂၅% အခမဲ့"
                            : "Try the first 25% free"}
                      </small>
                    </div>
                    <Link
                      href={`/courses/${c.id}`}
                      className="lc-courseArrow"
                      aria-label={`${my ? "သင်တန်းကြည့်ရန်" : "View course"}: ${courseTitle(c, lang)}`}
                    >
                      <span aria-hidden>↗</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {shown.length === 0 && (
          <div className="lc-empty">
            <Mascot pose="search" size={100} />
            <h3>
              {q
                ? my
                  ? "ကိုက်ညီသည့် သင်တန်းမတွေ့ပါ။"
                  : "No courses found."
                : my
                  ? "တစ်ဆင့်ချင်း ရှေ့ဆက်ကြမယ်။"
                  : filter === "completed"
                    ? "Your first finish is ahead of you."
                    : "Your path starts with a plan."}
            </h3>
            <p>
              {q
                ? `Try another search instead of “${q}”.`
                : filter === "completed"
                  ? "Finish a course and it will appear here."
                  : "Create your roadmap to see your recommended courses here."}
            </p>
            <button
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
            >
              {my ? "သင်တန်းအားလုံး ကြည့်ရန်" : "Explore all courses"} →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
