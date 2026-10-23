"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Mascot } from "@/components/ui/Mascot";
import { homePath } from "@/lib/access";
import { setState, useData } from "@/lib/store";
import "./landing.css";

type IconName =
  | "arrow"
  | "play"
  | "code"
  | "book"
  | "check"
  | "building"
  | "shield"
  | "file"
  | "people"
  | "chat"
  | "calendar"
  | "briefcase"
  | "globe"
  | "spark"
  | "chart"
  | "cloud"
  | "design"
  | "menu";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    play: <path d="m9 5 11 7-11 7Z" />,
    code: (
      <>
        <path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18" />
      </>
    ),
    book: (
      <>
        <path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    building: (
      <>
        <path d="M4 21V7h10v14M14 11h6v10M2 21h20M8 3h6v4M8 10h2m-2 4h2m-2 4h2m6-3h1m-1 3h1" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 9 4v6c0 5-9 9-9 9S3 18 3 13V7Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    file: (
      <>
        <path d="M5 3h9l5 5v13H5Z" />
        <path d="M14 3v6h5M8 13h8m-8 4h5" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-4a6 6 0 0 1 12 0v4m2-17a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5v3" />
      </>
    ),
    chat: <path d="M4 4h16v13H9l-5 4Z" />,
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M8 3v5m8-5v5M4 11h16m-11 5 2 2 4-4" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V3h8v4M3 12c6 4 12 4 18 0m-9 0v5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    spark: <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" />,
    chart: (
      <>
        <path d="M4 21V11h4v10m3 0V4h4v17m3 0V8h4v13" />
      </>
    ),
    cloud: <path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 14 1 4.5 4.5 0 0 1-1 9Z" />,
    design: (
      <>
        <path d="m4 17 12-12 4 4L8 21H4Zm10-10 4 4M4 3h5M4 3v5M21 15v6h-6" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="The Citadel home"
      className={`lp-brand ${light ? "lp-brandLight" : ""}`}
    >
      <Image
        src="/logo/the-citadel-icon-primary.png"
        alt=""
        width={42}
        height={42}
      />
      <span>the citadel</span>
    </Link>
  );
}
function Action({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  const className = `lp-button ${secondary ? "lp-secondary" : ""}`;
  const content = (
    <>
      {children}
      <Icon name={secondary ? "play" : "arrow"} size={16} />
    </>
  );
  return href.startsWith("#") ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
const trackData = [
  {
    en: "Web development",
    my: "ဝဘ်ဖွံ့ဖြိုးရေး",
    icon: "code",
    goal: "Frontend developer",
    skills: ["HTML & CSS", "JavaScript", "Responsive design"],
    task: "Build a responsive bookstore website",
    code: "const greeting = 'Hello, world!';\nconst learner = {\n  name: 'You',\n  isLearning: true\n};\n\nconsole.log(greeting);",
  },
  {
    en: "UI/UX design",
    my: "UI/UX ဒီဇိုင်း",
    icon: "design",
    goal: "UI/UX designer",
    skills: ["User research", "Wireframes", "Prototyping"],
    task: "Redesign a mobile app onboarding flow",
    code: "01  Understand the people\n02  Map the journey\n03  Sketch the possibilities\n04  Build a prototype\n05  Learn from feedback",
  },
  {
    en: "Data analysis",
    my: "ဒေတာခွဲခြမ်းစိတ်ဖြာမှု",
    icon: "chart",
    goal: "Data analyst",
    skills: ["Spreadsheets", "Data cleaning", "Visualisation"],
    task: "Turn a sales dataset into useful insights",
    code: "sales = load_data('sales.csv')\nclean = sales.drop_duplicates()\n\nsummary = clean.groupby('month')\n  .sum('revenue')\n\nplot(summary)",
  },
  {
    en: "QA & testing",
    my: "အရည်အသွေးစစ်ဆေးမှု",
    icon: "shield",
    goal: "QA tester",
    skills: ["Test cases", "Bug reports", "Quality assurance"],
    task: "Find and document bugs in a sample app",
    code: "Test: A new learner signs up\n\nGiven: a valid email address\nWhen: the form is submitted\nThen: show the welcome screen\n\n✓ Expected result confirmed",
  },
  {
    en: "Cloud & DevOps",
    my: "Cloud နှင့် DevOps",
    icon: "cloud",
    goal: "Cloud engineer",
    skills: ["Linux basics", "Deployment", "Cloud foundations"],
    task: "Deploy a simple web application",
    code: "$ git clone my-first-project\n$ npm install\n$ npm run build\n\n✓ Build complete\n✓ Ready to deploy",
  },
] as const;

const sectionIds = ["learning-paths", "how-it-works", "for-companies"] as const;

export default function Landing() {
  const { s, lang } = useData();
  const x = (en: string, my: string) => (lang === "my" ? my : en);
  const [menu, setMenu] = useState(false);
  const [section, setSection] = useState("");
  const [journeyStep, setJourneyStep] = useState(0);
  const [audience, setAudience] = useState<"learner" | "company">("learner");
  const [summaryTab, setSummaryTab] = useState(0);
  const selected = trackData[0];
  const signedIn = !!s.sessionUserId;
  const start = signedIn ? homePath(s) : "/signup";
  const companyStart = signedIn ? homePath(s) : "/signup?role=company";
  const navLinks = [
    ["learning-paths", x("Learning paths", "လေ့လာရေးလမ်းကြောင်း")],
    ["how-it-works", x("How it works", "အသုံးပြုပုံ")],
    ["for-companies", x("For companies", "ကုမ္ပဏီများအတွက်")],
  ] as const;

  // Highlights the nav link for the section crossing the middle of the screen; none while the hero is in view.
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.45;
      const current = sectionIds.find((id) => {
        const r = document.getElementById(id)?.getBoundingClientRect();
        return !!r && r.top <= line && r.bottom > line;
      });
      setSection(current ?? "");
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);
  const learnerJourney = [
    {
      label: x("Choose your direction", "လမ်းကြောင်းရွေးပါ"),
      title: x(
        "A direction that fits you.",
        "သင့်နှင့်ကိုက်ညီသော လမ်းကြောင်း။",
      ),
      text: x(
        "Choose a career goal. Get an AI-supported roadmap based on your skills and available time.",
        "ရည်မှန်းချက်ရွေးပါ။ သင့်ကျွမ်းကျင်မှုနှင့် အချိန်အပေါ်အခြေခံသော AI လမ်းပြမြေပုံရယူပါ။",
      ),
      takeaway: x(
        "Your goal. Your starting point.",
        "သင့်ရည်မှန်းချက်၊ သင့်စတင်ရာ။",
      ),
      icon: "spark" as const,
      scene: 0,
      alt: x(
        "A learner and Citadel mascot choose a direction on a career map.",
        "လေ့လာသူနှင့် Citadel အရုပ်လေးက လမ်းကြောင်းရွေးနေသည်။",
      ),
    },
    {
      label: x("Learn & get certified", "လေ့လာပြီး လက်မှတ်ရယူ"),
      title: x(
        "Small lessons. Real progress.",
        "သင်ခန်းစာငယ်များ၊ လက်တွေ့တိုးတက်မှု။",
      ),
      text: x(
        "Learn, practise, and use AI study notes. Pass your assessment to earn a certificate.",
        "လေ့လာလေ့ကျင့်ပြီး AI မှတ်စုများကိုအသုံးပြုပါ။ စစ်ဆေးမှုအောင်မြင်ပါက လက်မှတ်ရယူပါ။",
      ),
      takeaway: x(
        "Build foundations before the challenge.",
        "စိန်ခေါ်မှုမတိုင်မီ အခြေခံတည်ဆောက်ပါ။",
      ),
      icon: "book" as const,
      scene: 1,
      alt: x(
        "A learner practises building a website with Citadel's mascot beside them.",
        "လေ့လာသူက ဝဘ်ဆိုက်တည်ဆောက်မှုကို လေ့ကျင့်နေသည်။",
      ),
    },
    {
      label: x("Prove your skills", "စွမ်းရည်သက်သေပြ"),
      title: x("Show what you can do.", "သင့်စွမ်းရည်ကို ပြသပါ။"),
      text: x(
        "Complete a company challenge after your course. Get AI feedback, then submit for human review.",
        "သင်တန်းပြီးလျှင် ကုမ္ပဏီစိန်ခေါ်မှုကိုလုပ်ပါ။ AI အကြံပြုချက်ရယူပြီး လူကသုံးသပ်ရန် တင်သွင်းပါ။",
      ),
      takeaway: x(
        "Real work speaks louder than a CV.",
        "လက်တွေ့စွမ်းရည်ကို ပြသပါ။",
      ),
      icon: "code" as const,
      scene: 2,
      alt: x(
        "A learner presents a finished project to a human company reviewer.",
        "လေ့လာသူက ပြီးမြောက်သောလုပ်ငန်းကို ကုမ္ပဏီသုံးသပ်သူထံ ပြသနေသည်။",
      ),
    },
    {
      label: x("Meet the company", "ကုမ္ပဏီနှင့်တွေ့ဆုံ"),
      title: x("Turn proof into possibility.", "စွမ်းရည်မှ အခွင့်အလမ်းဆီသို့။"),
      text: x(
        "Companies shortlist work for interviews. An internship starts after an offer is made and you accept.",
        "ကုမ္ပဏီက အင်တာဗျူးအတွက် ရွေးချယ်သည်။ ကမ်းလှမ်းချက်ပေးပြီး သင်လက်ခံမှ အလုပ်သင်စတင်သည်။",
      ),
      takeaway: x(
        "People make every hiring decision.",
        "အလုပ်ခန့်ခြင်းကို လူကသာ ဆုံးဖြတ်သည်။",
      ),
      icon: "chat" as const,
      scene: 3,
      alt: x(
        "A learner attends a video interview with a company representative.",
        "လေ့လာသူက ကုမ္ပဏီကိုယ်စားလှယ်နှင့် ဗီဒီယိုအင်တာဗျူးလုပ်နေသည်။",
      ),
    },
  ];
  const companyJourney = [
    {
      label: x("Register & verify", "စာရင်းသွင်း၊ အတည်ပြု"),
      title: x(
        "Start with a trusted profile.",
        "ယုံကြည်ရသော ကိုယ်ရေးအချက်အလက်ဖြင့် စတင်ပါ။",
      ),
      text: x(
        "Register your company. Our team checks your documents, contact details, and internship terms.",
        "ကုမ္ပဏီစာရင်းသွင်းပါ။ စာရွက်စာတမ်း၊ ဆက်သွယ်ရန်နှင့် အလုပ်သင်သတ်မှတ်ချက်များကို စစ်ဆေးပေးမည်။",
      ),
      takeaway: x(
        "Verification comes before posting.",
        "အခွင့်အလမ်းမတင်မီ အတည်ပြုသည်။",
      ),
      icon: "shield" as const,
      scene: 0,
      alt: x(
        "A Citadel-branded office welcomes people for a portfolio review.",
        "Citadel အမှတ်တံဆိပ်ပါ ကုမ္ပဏီရုံး။",
      ),
    },
    {
      label: x("Post a challenge", "စိန်ခေါ်မှုတင်"),
      title: x(
        "Set the work that matters.",
        "လိုအပ်သောလက်တွေ့လုပ်ငန်းကို သတ်မှတ်ပါ။",
      ),
      text: x(
        "Describe the skill you need. AI helps draft a practical task and rubric for you to review.",
        "လိုအပ်သောစွမ်းရည်ကိုဖော်ပြပါ။ သင်သုံးသပ်ရန် AI က လက်တွေ့လုပ်ငန်းနှင့် စံနှုန်းကို ရေးဆွဲပေးသည်။",
      ),
      takeaway: x(
        "Your challenge. Your criteria.",
        "သင့်စိန်ခေါ်မှု၊ သင့်စံနှုန်း။",
      ),
      icon: "file" as const,
      scene: 1,
      alt: x(
        "A practical project is prepared on a laptop.",
        "လက်တော့ပ်ပေါ်တွင် လက်တွေ့လုပ်ငန်းပြင်ဆင်နေသည်။",
      ),
    },
    {
      label: x("Review real work", "အလုပ်များသုံးသပ်"),
      title: x(
        "See the skill behind the CV.",
        "ကိုယ်ရေးအကျဉ်းထက် စွမ်းရည်ကိုကြည့်ပါ။",
      ),
      text: x(
        "Review learner submissions with an AI summary and score. Give feedback or shortlist candidates.",
        "AI အကျဉ်းချုပ်နှင့် အမှတ်အကူအညီဖြင့် လုပ်ငန်းများသုံးသပ်ပြီး အကြံပြုချက်ပေးပါ သို့မဟုတ် ရွေးချယ်ပါ။",
      ),
      takeaway: x(
        "AI supports your review. You decide.",
        "AI ကူညီပေးပြီး သင်ဆုံးဖြတ်သည်။",
      ),
      icon: "people" as const,
      scene: 2,
      alt: x(
        "A human employer reviews a candidate's website project.",
        "အလုပ်ရှင်က လျှောက်ထားသူ၏ ဝဘ်ဆိုက်လုပ်ငန်းကို သုံးသပ်နေသည်။",
      ),
    },
    {
      label: x("Interview & offer", "အင်တာဗျူး၊ ကမ်းလှမ်း"),
      title: x(
        "Meet your next team member.",
        "သင့်အဖွဲ့ဝင်အသစ်နှင့် တွေ့ဆုံပါ။",
      ),
      text: x(
        "Interview shortlisted candidates and make an offer. The learner accepts before the internship begins.",
        "ရွေးချယ်ထားသူများနှင့် အင်တာဗျူးလုပ်ပြီး ကမ်းလှမ်းပါ။ လေ့လာသူလက်ခံပြီးမှ အလုပ်သင်စတင်သည်။",
      ),
      takeaway: x(
        "A human conversation. A human choice.",
        "လူအချင်းချင်းဆွေးနွေးပြီး ဆုံးဖြတ်ပါ။",
      ),
      icon: "chat" as const,
      scene: 3,
      alt: x(
        "A company interviews a candidate on a video call.",
        "ကုမ္ပဏီက လျှောက်ထားသူကို ဗီဒီယိုအင်တာဗျူးလုပ်နေသည်။",
      ),
    },
  ];
  const journey = audience === "learner" ? learnerJourney : companyJourney;
  const activeStep = journey[journeyStep];

  const faqs = [
    [
      x("Is there a fee to apply?", "လျှောက်ထားရန် အခကြေးငွေရှိပါသလား။"),
      x(
        "No. Learners never pay to take company challenges, apply for internships, or attend interviews. Course completion requirements still apply to challenges.",
        "မရှိပါ။ ကုမ္ပဏီစိန်ခေါ်မှု၊ အလုပ်သင်လျှောက်ထားမှုနှင့် အင်တာဗျူးအတွက် အခကြေးငွေမယူပါ။ စိန်ခေါ်မှုအတွက် သင်တန်းပြီးမြောက်ရန် လိုအပ်ပါသည်။",
      ),
    ],
    [
      x("Do you guarantee employment?", "အလုပ်ရရန် အာမခံပါသလား။"),
      x(
        "We help you build skills and connect with verified companies. Companies review your work and decide whom to interview and hire. An internship begins after you accept an offer.",
        "ကျွမ်းကျင်မှုတည်ဆောက်ပြီး အတည်ပြုကုမ္ပဏီများနှင့် ချိတ်ဆက်ပေးသည်။ အင်တာဗျူးနှင့် အလုပ်ခန့်ခြင်းကို ကုမ္ပဏီက ဆုံးဖြတ်ပြီး ကမ်းလှမ်းချက်လက်ခံမှ အလုပ်သင်စတင်သည်။",
      ),
    ],
    [
      x("How are companies verified?", "ကုမ္ပဏီများကို ဘယ်လိုစစ်ဆေးပါသလဲ။"),
      x(
        "Our team checks business registration and contact information, speaks with a company representative, and reviews internship terms before a company can post opportunities.",
        "ကုမ္ပဏီမှတ်ပုံတင်၊ ဆက်သွယ်ရန်အချက်အလက်များနှင့် အလုပ်သင်သတ်မှတ်ချက်များကို စစ်ဆေးပြီး ကုမ္ပဏီကိုယ်စားလှယ်နှင့် ဆွေးနွေးသည်။",
      ),
    ],
    [
      x("Do I need experience to get started?", "စတင်ရန် အတွေ့အကြုံလိုပါသလား။"),
      x(
        "You can start with the career starter course. Choose your goal and build your foundations before moving on to a company challenge.",
        "Career starter သင်တန်းနှင့် စတင်နိုင်သည်။ ရည်မှန်းချက်ရွေးပြီး အခြေခံကျွမ်းကျင်မှုများကို တည်ဆောက်ပါ။",
      ),
    ],
    [
      x("How does AI help me learn?", "AI က ဘယ်လိုကူညီပေးပါသလဲ။"),
      x(
        "AI helps organise your roadmap, summarise lessons, and give first feedback on your work. You stay in control of your learning, and people make every hiring decision.",
        "AI က လမ်းပြမြေပုံ၊ သင်ခန်းစာအကျဉ်းချုပ်နှင့် ပထမအကြံပြုချက်များ ပေးသည်။ အလုပ်ခန့်ခြင်းဆုံးဖြတ်ချက်ကို လူကသာ ချမှတ်သည်။",
      ),
    ],
  ];

  return (
    <div className="lp-landing">
      <a href="#main-content" className="lp-skip">
        Skip to content
      </a>
      <header className="lp-header">
        <div className="lp-headerInner">
          <Brand />
          <nav aria-label="Landing navigation" className="lp-desktopNav">
            {navLinks.map(([id, label]) => (
              <a key={id} href={`#${id}`} aria-current={section === id ? "location" : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <div className="lp-headerActions">
            <div className="lp-languages" aria-label="Language" role="group">
              <button aria-pressed={lang === "en"} onClick={() => setState((st) => ({ ...st, lang: "en" }))}>
                EN
              </button>
              <button aria-pressed={lang === "my"} onClick={() => setState((st) => ({ ...st, lang: "my" }))}>
                မြန်မာ
              </button>
            </div>
            <Link href={signedIn ? homePath(s) : "/login"} className="lp-button lp-secondary">
              {signedIn ? x("My dashboard", "ကျွန်ုပ်၏စာမျက်နှာ") : x("Log in", "ဝင်ရန်")}
            </Link>
            <Link href={start} className="lp-button">
              {x("Start learning", "စတင်လေ့လာမယ်")}
              <Icon name="arrow" size={16} />
            </Link>
            <button
              className="lp-menuToggle"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              aria-controls="landing-menu"
              onClick={() => setMenu(!menu)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
        {menu && (
          <nav id="landing-menu" aria-label="Mobile navigation" className="lp-mobileNav">
            {navLinks.map(([id, label]) => (
              <a key={id} href={`#${id}`} aria-current={section === id ? "location" : undefined} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
            <a href="#faq" onClick={() => setMenu(false)}>
              FAQ
            </a>
            <div className="lp-mobileActions">
              <Link href={signedIn ? homePath(s) : "/login"} className="lp-button lp-secondary" onClick={() => setMenu(false)}>
                {signedIn ? x("My dashboard", "ကျွန်ုပ်၏စာမျက်နှာ") : x("Log in", "ဝင်ရန်")}
              </Link>
              <Link href={start} className="lp-button" onClick={() => setMenu(false)}>
                {x("Start learning", "စတင်လေ့လာမယ်")}
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content">
        <section className={`lp-hero lp-container`}>
          <div className="lp-heroCopy">
            <h1>
              {x("A clearer path", "သင့်ရဲ့ပထမဆုံး")}
              <br />
              {x("to your first", "IT အခွင့်အလမ်းအတွက်")}
              <br />
              <em>{x("IT opportunity.", "ရှင်းလင်းသောလမ်းကြောင်း။")}</em>
            </h1>
            <p>
              {x(
                "Structured learning, real company challenges, and a path to internship opportunities in Myanmar.",
                "စနစ်တကျလေ့လာမှု၊ လက်တွေ့ကုမ္ပဏီစိန်ခေါ်မှုများနှင့် မြန်မာနိုင်ငံရှိ အလုပ်သင်အခွင့်အလမ်းများဆီသို့။",
              )}
            </p>
            <div className="lp-actions">
              <Action href={start}>
                {x("Start learning", "စတင်လေ့လာမယ်")}
              </Action>
              <Action href="#how-it-works" secondary>
                {x("See how it works", "အသုံးပြုပုံကြည့်မယ်")}
              </Action>
            </div>
          </div>
          <div className="lp-heroArt">
            <Image
              src="/images/landing/career-stairway.webp"
              alt={x(
                "Citadel's mascot follows a stairway from learning to proving skills and meeting companies.",
                "Citadel အရုပ်လေးက လေ့လာမှုမှ ကုမ္ပဏီများနှင့်တွေ့ဆုံရန် လှေကားအတိုင်း တက်နေသည်။",
              )}
              width={1536}
              height={1024}
              preload
              sizes="(max-width: 700px) 100vw, 60vw"
            />
            <div className={`lp-milestone lp-milestoneOne`}>
              <b>1</b>
              <span>
                <strong>{x("Learn", "လေ့လာ")}</strong>
                <small>{x("Build real skills", "ကျွမ်းကျင်မှုတည်ဆောက်")}</small>
              </span>
            </div>
            <div className={`lp-milestone lp-milestoneTwo`}>
              <b>2</b>
              <span>
                <strong>{x("Prove", "သက်သေပြ")}</strong>
                <small>{x("Show what you can do", "စွမ်းရည်ကိုပြသ")}</small>
              </span>
            </div>
            <div className={`lp-milestone lp-milestoneThree`}>
              <b>3</b>
              <span>
                <strong>{x("Meet", "တွေ့ဆုံ")}</strong>
                <small>
                  {x("Connect with companies", "ကုမ္ပဏီများနှင့်ချိတ်ဆက်")}
                </small>
              </span>
            </div>
            <span className="lp-doorNote">
              {x("Your next", "နောက်ထပ်")}
              <br />
              {x("chapter awaits.", "အခွင့်အလမ်းဆီသို့။")}
              <i aria-hidden>✦</i>
            </span>
          </div>
        </section>

        <section
          id="learning-paths"
          className={`lp-showcase lp-wideContainer`}
          aria-labelledby="platform-title"
        >
          <div className="lp-showcaseCopy">
            <h2 id="platform-title">
              {x(
                "A learning experience designed for real opportunities.",
                "လက်တွေ့အခွင့်အလမ်းများအတွက် လေ့လာမှုအတွေ့အကြုံ။",
              )}
            </h2>
            <p>
              {x(
                "Your roadmap, practical learning, and company challenges. All connected.",
                "သင့်လမ်းပြမြေပုံ၊ လက်တွေ့လေ့လာမှုနှင့် ကုမ္ပဏီစိန်ခေါ်မှုများ အားလုံးချိတ်ဆက်ထားသည်။",
              )}
            </p>
            <Action href={start}>
              {x("Explore the platform", "ပလက်ဖောင်းကိုလေ့လာမယ်")}
            </Action>
          </div>
          <div
            className="lp-dashboard"
            aria-label="Illustrative learning dashboard preview"
          >
            <div className="lp-windowBar">
              <Brand />
              <span className="lp-previewLabel">
                {x("PLATFORM PREVIEW", "နမူနာမြင်ကွင်း")}
              </span>
              <span className="lp-windowDots">○ ○ ○</span>
            </div>
            <div className="lp-dashboardBody">
              <aside className="lp-previewSidebar">
                {(
                  [
                    ["building", "Home"],
                    ["spark", "My journey"],
                    ["book", "Learning"],
                    ["code", "Challenges"],
                    ["shield", "Certificates"],
                  ] as const
                ).map(([icon, label], i) => (
                  <div
                    key={label}
                    className={i === 1 ? "lp-sidebarActive" : ""}
                  >
                    <Icon name={icon} size={14} />
                    <span>{label}</span>
                  </div>
                ))}
              </aside>
              <div className="lp-previewMain">
                <h3>{x("My journey", "ကျွန်ုပ်၏ခရီးစဉ်")}</h3>
                <p className="lp-smallMuted">
                  {x(
                    "From learning to opportunity, one step at a time.",
                    "တစ်ဆင့်ချင်း လေ့လာမှုမှ အခွင့်အလမ်းဆီသို့။",
                  )}
                </p>
                <div className="lp-journeyLine">
                  {(
                    [
                      ["book", x("Learn", "လေ့လာ")],
                      ["shield", x("Get certified", "လက်မှတ်")],
                      ["code", x("Company challenge", "စိန်ခေါ်မှု")],
                      ["chat", x("Interview", "အင်တာဗျူး")],
                      ["briefcase", x("Internship", "အလုပ်သင်")],
                    ] as const
                  ).map(([icon, label], i) => (
                    <div key={label}>
                      <span className={i === 0 ? "lp-currentJourney" : ""}>
                        <Icon name={icon} size={15} />
                      </span>
                      <strong>{label}</strong>
                      <small>
                        {i === 0
                          ? x("In progress", "လေ့လာနေဆဲ")
                          : x("Coming next", "နောက်တစ်ဆင့်")}
                      </small>
                    </div>
                  ))}
                </div>
                <h4>{x("Recommended for you", "သင့်အတွက် အကြံပြုချက်")}</h4>
                <div className="lp-recommendation">
                  <div className="lp-courseArtwork">
                    <Icon name="code" size={33} />
                    <span>&lt; / &gt;</span>
                  </div>
                  <div>
                    <strong>{selected.en} foundations</strong>
                    <small>
                      {x(
                        "Your next step starts here",
                        "နောက်တစ်ဆင့်ကို ဒီမှာစတင်ပါ",
                      )}
                    </small>
                    <div className="lp-progress">
                      <span />
                    </div>
                  </div>
                  <Link href={start}>{x("Continue", "ဆက်လေ့လာ")}</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="lp-how lp-container lp-compactHow"
          aria-labelledby="how-title"
        >
          <div className="lp-howHeading">
            <h2 id="how-title">
              {x("More than learning.", "လေ့လာမှုထက် ပိုမိုသောအတွေ့အကြုံ။")}
              <br />
              <em>
                {x(
                  "A clear path to opportunity.",
                  "အခွင့်အလမ်းဆီသို့ ရှင်းလင်းသောလမ်းကြောင်း။",
                )}
              </em>
            </h2>
            <p>
              {x(
                "See how learners build proof of skill, and how companies discover it.",
                "လေ့လာသူများက စွမ်းရည်ကိုသက်သေပြပြီး ကုမ္ပဏီများက ရှာဖွေနိုင်ပုံကိုကြည့်ပါ။",
              )}
            </p>
          </div>
          <div
            className="lp-audienceSwitch"
            role="group"
            aria-label="Choose whose journey to explore"
          >
            <button
              aria-pressed={audience === "learner"}
              onClick={() => {
                setAudience("learner");
                setJourneyStep(0);
              }}
            >
              <Icon name="book" size={16} />
              {x("For learners", "လေ့လာသူများအတွက်")}
            </button>
            <button
              aria-pressed={audience === "company"}
              onClick={() => {
                setAudience("company");
                setJourneyStep(0);
              }}
            >
              <Icon name="building" size={16} />
              {x("For companies", "ကုမ္ပဏီများအတွက်")}
            </button>
          </div>
          <div
            className="lp-journeyTabs"
            role="tablist"
            aria-label={x("How it works steps", "အသုံးပြုပုံအဆင့်များ")}
          >
            {journey.map((step, i) => (
              <button
                key={`${audience}-${i}`}
                role="tab"
                id={`journey-tab-${i}`}
                aria-controls="journey-panel"
                aria-selected={journeyStep === i}
                tabIndex={journeyStep === i ? 0 : -1}
                onClick={() => setJourneyStep(i)}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowRight"
                      ? (i + 1) % 4
                      : event.key === "ArrowLeft"
                        ? (i + 3) % 4
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 3
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    setJourneyStep(next);
                    (
                      event.currentTarget.parentElement?.children[
                        next
                      ] as HTMLButtonElement
                    )?.focus();
                  }
                }}
              >
                <span>{i + 1}</span>
                {step.label}
              </button>
            ))}
          </div>
          <div
            className="lp-journeyStage"
            id="journey-panel"
            role="tabpanel"
            aria-labelledby={`journey-tab-${journeyStep}`}
          >
            <aside className="lp-stageContext">
              <span className="lp-stageCaption">
                {x("YOUR JOURNEY", "သင့်ခရီးစဉ်")}
              </span>
              <h3>
                {audience === "learner"
                  ? x(
                      "Build your next chapter.",
                      "သင့်အခွင့်အလမ်းအသစ်ကို ဖန်တီးပါ။",
                    )
                  : x(
                      "Meet talent through real work.",
                      "လက်တွေ့စွမ်းရည်ရှိသူများနှင့် တွေ့ဆုံပါ။",
                    )}
              </h3>
              <ol>
                {journey.map((step, i) => (
                  <li
                    key={step.label}
                    className={
                      i === journeyStep
                        ? "lp-currentStage"
                        : i < journeyStep
                          ? "lp-finishedStage"
                          : ""
                    }
                  >
                    <span>
                      {i < journeyStep ? (
                        <Icon name="check" size={12} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <div>
                      <strong>{step.label}</strong>
                      <small>
                        {i === journeyStep
                          ? x(
                              "You're exploring this step",
                              "ယခုကြည့်နေသောအဆင့်",
                            )
                          : i < journeyStep
                            ? x("Previous step", "ယခင်အဆင့်")
                            : x("Coming next", "နောက်တစ်ဆင့်")}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
            <div className="lp-stageImage">
              {audience === "company" && journeyStep === 0 ? (
                <Image
                  src="/images/landing/company-studio.webp"
                  alt={x(
                    "A Citadel-branded company office where people review portfolios.",
                    "စွမ်းရည်မှတ်တမ်းများကို လူများသုံးသပ်နေသော Citadel ကုမ္ပဏီရုံး။",
                  )}
                  width={1536}
                  height={1024}
                  sizes="(max-width:700px) 90vw, 50vw"
                />
              ) : (
                <div className="lp-sceneCrop">
                  <Image
                    src="/images/landing/journey-scenes.webp"
                    alt={activeStep.alt}
                    width={1536}
                    height={1024}
                    sizes="(max-width:700px) 180vw, 100vw"
                    style={{
                      left: `${-(activeStep.scene % 2) * 100}%`,
                      top: `${-Math.floor(activeStep.scene / 2) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
            <div className="lp-stageDetail">
              <span className="lp-stagePill">
                {x("Step", "အဆင့်")} {journeyStep + 1} / 4
              </span>
              <h3>{activeStep.title}</h3>
              <p>{activeStep.text}</p>
              <div className="lp-stageTakeaway">
                <Icon name={activeStep.icon} size={19} />
                <span>{activeStep.takeaway}</span>
              </div>
            </div>
            <div className="lp-stageFooter">
              <span>
                {x("Explore at your own pace", "သင့်အဆင်ပြေသလို လေ့လာပါ")} ·{" "}
                {journeyStep + 1} / 4
              </span>
              <div>
                <button
                  disabled={journeyStep === 0}
                  onClick={() => setJourneyStep(journeyStep - 1)}
                >
                  <span aria-hidden>←</span>
                  {x("Back", "နောက်ပြန်")}
                </button>
                <button
                  disabled={journeyStep === 3}
                  onClick={() => setJourneyStep(journeyStep + 1)}
                >
                  {x("Next", "ရှေ့ဆက်")}
                  <Icon name="arrow" size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="for-companies"
          className="lp-container lp-employerSection"
          aria-labelledby="companies-title"
        >
          <div className="lp-employerArt">
            <Image
              src="/images/landing/company-studio.webp"
              alt={x(
                "Citadel's emblem welcomes a candidate to a company portfolio review.",
                "Citadel အမှတ်တံဆိပ်ပါရုံးတွင် လျှောက်ထားသူ၏ လက်တွေ့လုပ်ငန်းကို သုံးသပ်နေသည်။",
              )}
              width={1536}
              height={1024}
              sizes="(max-width:700px) 100vw, 55vw"
            />
            <div className="lp-employerBadge">
              <Image
                src="/logo/the-citadel-icon-primary.png"
                alt=""
                width={25}
                height={25}
              />
              <span>
                {x(
                  "Real work. A human decision.",
                  "လက်တွေ့လုပ်ငန်း။ လူကဆုံးဖြတ်သည်။",
                )}
              </span>
              <Icon name="check" size={15} />
            </div>
          </div>
          <div className="lp-employerCopy">
            <h2 id="companies-title">
              {x("Find the people", "သင့်အဖွဲ့အတွက် လူတော်များကို")}
              <br />
              <em>
                {x(
                  "behind the potential.",
                  "လက်တွေ့စွမ်းရည်မှတစ်ဆင့် ရှာဖွေပါ။",
                )}
              </em>
            </h2>
            <p>
              {x(
                "A CV tells part of the story. A real challenge shows you what someone can do.",
                "ကိုယ်ရေးအကျဉ်းထက် လက်တွေ့စိန်ခေါ်မှုက တစ်စုံတစ်ဦး၏ စွမ်းရည်ကို ပိုမိုပြသနိုင်သည်။",
              )}
            </p>
            <div className="lp-employerBenefits">
              {[
                {
                  icon: "shield" as const,
                  title: x(
                    "A verified place to begin",
                    "အတည်ပြုခြင်းဖြင့် စတင်ပါ",
                  ),
                  text: x(
                    "Register your company. Our team checks the details.",
                    "ကုမ္ပဏီစာရင်းသွင်းပြီး အချက်အလက်များကို ကျွန်ုပ်တို့စစ်ဆေးမည်။",
                  ),
                },
                {
                  icon: "code" as const,
                  title: x(
                    "Your challenge. Their skills.",
                    "သင့်စိန်ခေါ်မှု၊ သူတို့စွမ်းရည်။",
                  ),
                  text: x(
                    "Set the task and review actual submissions.",
                    "လုပ်ငန်းသတ်မှတ်ပြီး တင်သွင်းထားသည့်အလုပ်များကို သုံးသပ်ပါ။",
                  ),
                },
                {
                  icon: "people" as const,
                  title: x("AI supports. You decide.", "AI ကူညီ၊ သင်ဆုံးဖြတ်။"),
                  text: x(
                    "Meet shortlisted candidates and make the hiring call.",
                    "ရွေးချယ်ထားသူများနှင့်တွေ့ပြီး အလုပ်ခန့်ရန် ဆုံးဖြတ်ပါ။",
                  ),
                },
              ].map((item) => (
                <div key={item.title}>
                  <span>
                    <Icon name={item.icon} size={20} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Action href={companyStart}>
              {x("Get started as a company", "ကုမ္ပဏီအဖြစ် စတင်မယ်")}
            </Action>
            {!signedIn && (
              <p className="mt-3 text-sm">
                {x("Already registered?", "မှတ်ပုံတင်ပြီးပြီလား။")}{" "}
                <Link href="/login?role=company" className="font-semibold text-burgundy underline-offset-2 hover:underline">
                  {x("Log in as a company", "ကုမ္ပဏီအဖြစ် ဝင်ရန်")}
                </Link>
              </p>
            )}
          </div>
        </section>

        <section
          className="lp-container lp-verificationSection"
          aria-labelledby="trust-title"
        >
          <div className="lp-verificationCopy">
            <h2 id="trust-title">
              {x("Opportunity should come", "အခွင့်အလမ်းနဲ့အတူ")}
              <br />
              <em>
                {x("with peace of mind.", "စိတ်ချယုံကြည်မှု ရှိသင့်သည်။")}
              </em>
            </h2>
            <p>
              {x(
                "Every company is checked by our team before it can post. So you can focus on what comes next.",
                "အခွင့်အလမ်းမတင်မီ ကုမ္ပဏီတိုင်းကို ကျွန်ုပ်တို့စစ်ဆေးသည်။ သင်၏ရှေ့ဆက်ခရီးကို စိတ်ချစွာအာရုံစိုက်ပါ။",
              )}
            </p>
            <Link href="/legal#verify" className="lp-button lp-tertiary lp-verificationLink">
              {x("See what we check", "စစ်ဆေးသည့်အချက်များကြည့်ပါ")}
              <Icon name="arrow" size={17} />
            </Link>
            <div className="lp-noFees">
              <Icon name="shield" size={20} />
              <span>
                {x(
                  "No fees to apply, take a challenge, or interview.",
                  "လျှောက်ထားမှု၊ စိန်ခေါ်မှုနှင့် အင်တာဗျူးအတွက် အခကြေးငွေမရှိပါ။",
                )}
              </span>
            </div>
          </div>
          <div className="lp-verificationCard">
            <div className="lp-verificationCardHeader">
              <Brand />
              <span>
                <Icon name="shield" size={15} />
                {x(
                  "Our verification standard",
                  "ကျွန်ုပ်တို့၏စစ်ဆေးမှုစံနှုန်း",
                )}
              </span>
            </div>
            <div className="lp-verificationSeal">
              <Icon name="shield" size={47} />
              <div>
                <h3>{x("Checked by people.", "လူက စစ်ဆေးထားသည်။")}</h3>
                <p>
                  {x(
                    "Built on trust, not just a badge.",
                    "အမှတ်အသားထက် ယုံကြည်မှုကို အခြေခံထားသည်။",
                  )}
                </p>
              </div>
            </div>
            <ol>
              {[
                {
                  title: x("Business registration", "ကုမ္ပဏီမှတ်ပုံတင်"),
                  text: x(
                    "We review company documents.",
                    "ကုမ္ပဏီစာရွက်စာတမ်းများကို စစ်ဆေးသည်။",
                  ),
                },
                {
                  title: x(
                    "Real people. Real contact details.",
                    "လူအစစ်၊ ဆက်သွယ်ရန်အချက်အလက်အစစ်။",
                  ),
                  text: x(
                    "We check contacts and speak with a representative.",
                    "ဆက်သွယ်ရန်အချက်အလက်နှင့် ကိုယ်စားလှယ်ကို စစ်ဆေးသည်။",
                  ),
                },
                {
                  title: x(
                    "Clear internship terms",
                    "ရှင်းလင်းသော အလုပ်သင်သတ်မှတ်ချက်များ",
                  ),
                  text: x(
                    "Role, location, duration, and any stipend, upfront.",
                    "လုပ်ငန်းတာဝန်၊ နေရာ၊ ကာလနှင့် ထောက်ပံ့ကြေးကို ကြိုတင်ဖော်ပြသည်။",
                  ),
                },
              ].map((item, i) => (
                <li key={item.title}>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                  <span>
                    <Icon name="check" size={16} />
                  </span>
                </li>
              ))}
            </ol>
            <div className="lp-verificationFoot">
              <span className="lp-statusDot" />
              {x(
                "Verification before opportunities go live.",
                "အခွင့်အလမ်းများမတင်မီ အတည်ပြုစစ်ဆေးသည်။",
              )}
            </div>
          </div>
        </section>

        <section
          className={`lp-study lp-container`}
          aria-labelledby="study-title"
        >
          <div>
            <h2 id="study-title">
              {x("AI-powered study", "AI အကူအညီဖြင့်")}
              <br />
              {x("summaries.", "သင်ခန်းစာအကျဉ်းချုပ်။")}
            </h2>
            <p>
              {x(
                "Key ideas, clearer notes, and a little help when you need it.",
                "အဓိကအချက်များ၊ ရှင်းလင်းသောမှတ်စုများနှင့် လိုအပ်ချိန်အကူအညီ။",
              )}
            </p>
            <Link href={start} className={`lp-button lp-secondary`}>
              {x("Start your learning journey", "သင့်လေ့လာမှုကိုစတင်မယ်")}
              <Icon name="arrow" size={14} />
            </Link>
          </div>
          <div className="lp-summaryPreview">
            <aside>
              <span>{x("Frontend development", "ဝဘ်ဖွံ့ဖြိုးရေး")}</span>
              <small>Module 2</small>
              {[
                "Introduction",
                "Building with HTML",
                "Styling with CSS",
                "Responsive layouts",
                "Module summary",
              ].map((t, i) => (
                <p key={t} className={i === 4 ? "lp-summarySelected" : ""}>
                  {i + 1}. {t}
                </p>
              ))}
            </aside>
            <div className="lp-summaryContent">
              <h4>
                <Icon name="spark" size={16} />
                {x("AI study summary", "AI သင်ခန်းစာအကျဉ်းချုပ်")}
              </h4>
              <div
                className="lp-summaryTabs"
                role="tablist"
                aria-label="Study preview"
              >
                {[
                  x("Summary", "အကျဉ်းချုပ်"),
                  x("Key ideas", "အဓိကအချက်များ"),
                  x("Practice", "လေ့ကျင့်ခန်း"),
                ].map((t, i) => (
                  <button
                    key={t}
                    id={`summary-tab-${i}`}
                    role="tab"
                    aria-selected={summaryTab === i}
                    aria-controls="summary-panel"
                    tabIndex={summaryTab === i ? 0 : -1}
                    onKeyDown={(event) => {
                      const next =
                        event.key === "ArrowRight"
                          ? (i + 1) % 3
                          : event.key === "ArrowLeft"
                            ? (i + 2) % 3
                            : event.key === "Home"
                              ? 0
                              : event.key === "End"
                                ? 2
                                : null;
                      if (next !== null) {
                        event.preventDefault();
                        setSummaryTab(next);
                        (
                          event.currentTarget.parentElement?.children[
                            next
                          ] as HTMLButtonElement
                        )?.focus();
                      }
                    }}
                    onClick={() => setSummaryTab(i)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div
                id="summary-panel"
                role="tabpanel"
                aria-labelledby={`summary-tab-${summaryTab}`}
                className="lp-summaryPanel"
              >
                <strong>
                  {
                    [
                      x(
                        "Here's what you learned:",
                        "သင်လေ့လာခဲ့သည့်အချက်များ:",
                      ),
                      x("Keep these ideas in mind:", "မှတ်သားထားရန်:"),
                      x("Give it a try:", "စမ်းကြည့်ပါ:"),
                    ][summaryTab]
                  }
                </strong>
                <ul>
                  {(summaryTab === 0
                    ? [
                        x(
                          "HTML gives your page structure.",
                          "HTML သည် စာမျက်နှာဖွဲ့စည်းပုံဖြစ်သည်။",
                        ),
                        x(
                          "CSS brings your design to life.",
                          "CSS ဖြင့် ဒီဇိုင်းဖန်တီးသည်။",
                        ),
                        x(
                          "Responsive layouts work on every screen.",
                          "Responsive layout သည် မည်သည့်မျက်နှာပြင်မဆို ကိုက်ညီသည်။",
                        ),
                      ]
                    : summaryTab === 1
                      ? [
                          x(
                            "Start with semantic HTML.",
                            "Semantic HTML ဖြင့်စတင်ပါ။",
                          ),
                          x(
                            "Build for small screens first.",
                            "မျက်နှာပြင်ငယ်အတွက် ဦးစွာဆောက်ပါ။",
                          ),
                          x("Test with real people.", "လူများနှင့် စမ်းသပ်ပါ။"),
                        ]
                      : [
                          x(
                            "Create a simple profile page.",
                            "ရိုးရှင်းသော ကိုယ်ရေးအကျဉ်းစာမျက်နှာဆောက်ပါ။",
                          ),
                          x(
                            "Add a heading, image, and introduction.",
                            "ခေါင်းစဉ်၊ ပုံနှင့် မိတ်ဆက်စာထည့်ပါ။",
                          ),
                          x(
                            "Make it work on your phone.",
                            "ဖုန်းပေါ်မှာ စမ်းသပ်ပါ။",
                          ),
                        ]
                  ).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Mascot pose="notes" size={140} className="lp-studyMascot" />
          </div>
        </section>

        <section
          id="faq"
          className={`lp-faq lp-container`}
          aria-labelledby="faq-title"
        >
          <div>
            <h2 id="faq-title">
              {x("Have questions?", "မေးခွန်းရှိပါသလား။")}
              <br />
              {x("We've got answers.", "အဖြေတွေ ဒီမှာရှိပါတယ်။")}
            </h2>
          </div>
          <div className="lp-faqList">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden>+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={`lp-finalCta lp-wideContainer`}>
          <Mascot pose="wave" size={150} />
          <div>
            <h2>
              {x(
                "Ready to take the next step?",
                "နောက်တစ်ဆင့်အတွက် အသင့်ဖြစ်ပြီလား။",
              )}
            </h2>
            <p>
              {x(
                "Start learning today. Build toward your next opportunity.",
                "ယနေ့စတင်လေ့လာပြီး နောက်ထပ်အခွင့်အလမ်းအတွက် ပြင်ဆင်ပါ။",
              )}
            </p>
          </div>
          <div className="lp-actions">
            <Action href={start}>{x("Start learning", "စတင်လေ့လာမယ်")}</Action>
            <Action href="#how-it-works" secondary>
              {x("See how it works", "အသုံးပြုပုံကြည့်မယ်")}
            </Action>
          </div>
        </section>
      </main>
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footerMain">
            <div className="lp-footerIntro">
              <Brand light />
              <p>
                {x(
                  "Structured learning, real company challenges, and a path to your first IT opportunity in Myanmar.",
                  "စနစ်တကျလေ့လာမှု၊ ကုမ္ပဏီစိန်ခေါ်မှုအစစ်များနှင့် မြန်မာနိုင်ငံရှိ ပထမဆုံး IT အခွင့်အလမ်းဆီသို့ လမ်းကြောင်း။",
                )}
              </p>
              <div
                className="lp-footerLang"
                aria-label={x("Language", "ဘာသာစကား")}
                role="group"
              >
                <Icon name="globe" size={14} />
                <button
                  aria-pressed={lang === "en"}
                  onClick={() => setState((st) => ({ ...st, lang: "en" }))}
                >
                  English
                </button>
                <button
                  aria-pressed={lang === "my"}
                  onClick={() => setState((st) => ({ ...st, lang: "my" }))}
                >
                  မြန်မာ
                </button>
              </div>
            </div>
            <nav className="lp-footerLinks" aria-label="Footer navigation">
              <div>
                <h3>{x("Explore", "ရှာဖွေရန်")}</h3>
                <a href="#learning-paths">
                  {x("Learning paths", "လေ့လာရေးလမ်းကြောင်း")}
                </a>
                <a href="#how-it-works">{x("How it works", "အသုံးပြုပုံ")}</a>
                <a href="#for-companies">
                  {x("For companies", "ကုမ္ပဏီများအတွက်")}
                </a>
                <a href="#faq">FAQ</a>
              </div>
              <div>
                <h3>{x("Get started", "စတင်ရန်")}</h3>
                <Link href={start}>{x("Start learning", "စတင်လေ့လာမယ်")}</Link>
                <Link href={signedIn ? homePath(s) : "/login"}>
                  {signedIn
                    ? x("My dashboard", "ကျွန်ုပ်၏ ဒက်ရှ်ဘုတ်")
                    : x("Log in", "ဝင်ရောက်မယ်")}
                </Link>
              </div>
              <div>
                <h3>{x("Legal", "ဥပဒေဆိုင်ရာ")}</h3>
                <Link href="/legal#privacy">
                  {x("Privacy", "ကိုယ်ရေးလုံခြုံမှု")}
                </Link>
                <Link href="/legal#terms">
                  {x("Terms", "စည်းကမ်းချက်များ")}
                </Link>
              </div>
            </nav>
          </div>
          <p className="lp-footerMotto" aria-hidden>
            {lang === "my" ? (
              <>
                လေ့လာ၊ ဖန်တီး၊ <em>စတင်။</em>
              </>
            ) : (
              <>
                Learn. Build. <em>Begin.</em>
              </>
            )}
          </p>
          <div className="lp-footerBottom">
            <span>© {new Date().getFullYear()} The Citadel · Team 404</span>
            <span>
              {x(
                "For Myanmar's next generation of IT talent.",
                "မြန်မာ့မျိုးဆက်သစ် IT ပညာရှင်များအတွက်။",
              )}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
