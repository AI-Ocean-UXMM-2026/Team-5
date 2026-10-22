import type { Lang } from "./types";

type Copy = {
  language: string;
  footer: string;
  eyebrow: string;
  heroTitle: string;
  heroLead: string;
  createAccount: string;
  logIn: string;
  how: string;
  steps: string[];
  forLearners: string;
  forLearnersBody: string;
  forCompanies: string;
  forCompaniesBody: string;
  signupTitle: string;
  signupIntro: string;
  iAm: string;
  learner: string;
  company: string;
  yourName: string;
  companyName: string;
  email: string;
  emailHint: string;
  emailTaken: string;
  continueRegistration: string;
  continueOnboarding: string;
  free: string;
  paid: string;
  fullyFree: string;
  firstFree: string;
  lesson: string;
  lessons: string;
  hour: string;
  hours: string;
  unlocks: string;
};

export const copy: Record<Lang, Copy> = {
  en: {
    language: "Language",
    footer: "Skills that get you in · Learners never pay to apply, take a challenge or interview.",
    eyebrow: "For young people in Myanmar and the IT companies that hire them",
    heroTitle: "Skills that get you in",
    heroLead:
      "Follow a clear roadmap, learn IT skills, get certified, then prove yourself on a real challenge from a verified company. Coursera gives you a certificate. We give you an interview.",
    createAccount: "Create an account",
    logIn: "Log in",
    how: "How it works",
    steps: [
      "Set a career goal and get an AI roadmap",
      "Learn with AI summaries and your own notes",
      "Pass the test and get certified",
      "Solve a real company challenge",
      "Interview and start your internship",
    ],
    forLearners: "For learners",
    forLearnersBody: "Free to apply, take challenges and interview. Learn what companies actually need.",
    forCompanies: "For companies",
    forCompaniesBody: "Meet tested talent fast. You set the challenge, AI pre-screens, you decide.",
    signupTitle: "Create an account",
    signupIntro: "Learners never pay to apply, take a challenge or interview.",
    iAm: "I am",
    learner: "Learner",
    company: "Company",
    yourName: "Your name",
    companyName: "Company name",
    email: "Email",
    emailHint: "Use an email on your company's own domain.",
    emailTaken: "An account with this email already exists.",
    continueRegistration: "Continue to registration",
    continueOnboarding: "Continue to onboarding",
    free: "Free",
    paid: "Paid",
    fullyFree: "Fully free",
    firstFree: "First 25% free",
    lesson: "lesson",
    lessons: "lessons",
    hour: "hour",
    hours: "hours",
    unlocks: "Unlocks",
  },
  my: {
    language: "ဘာသာစကား",
    footer: "အလုပ်ဝင်နိုင်မယ့် ကျွမ်းကျင်မှု · လျှောက်ထားခြင်း၊ စိန်ခေါ်မှုဖြေခြင်း၊ အင်တာဗျူးတက်ခြင်းအတွက် သင်ယူသူ ငွေမပေးရပါ။",
    eyebrow: "မြန်မာနိုင်ငံက လူငယ်တွေနဲ့ သူတို့ကို ခန့်မယ့် IT ကုမ္ပဏီတွေအတွက်",
    heroTitle: "အလုပ်ဝင်နိုင်မယ့် ကျွမ်းကျင်မှု",
    heroLead:
      "လမ်းကြောင်းရှင်းရှင်းလေးအတိုင်း IT ကျွမ်းကျင်မှု သင်ယူပါ။ လက်မှတ်ရပြီးရင် အတည်ပြုထားတဲ့ ကုမ္ပဏီရဲ့ တကယ့်အလုပ်ကို ပြပါ။ Coursera က လက်မှတ်ပေးတယ်။ ကျွန်ုပ်တို့က အင်တာဗျူးပေးတယ်။",
    createAccount: "အကောင့်ဖွင့်ရန်",
    logIn: "အကောင့်ဝင်ရန်",
    how: "ဘယ်လို လုပ်သလဲ",
    steps: [
      "အသက်မွေးဝမ်းကျောင်း ပန်းတိုင် သတ်မှတ်ပြီး AI လမ်းကြောင်း ရယူပါ",
      "AI အနှစ်ချုပ်နဲ့ ကိုယ့်မှတ်စုနဲ့ သင်ယူပါ",
      "စာမေးပွဲအောင်ပြီး လက်မှတ်ရယူပါ",
      "ကုမ္ပဏီရဲ့ တကယ့် စိန်ခေါ်မှုကို ဖြေရှင်းပါ",
      "အင်တာဗျူးပြီး အလုပ်သင် စတင်ပါ",
    ],
    forLearners: "သင်ယူသူများအတွက်",
    forLearnersBody: "လျှောက်ထားခြင်း၊ စိန်ခေါ်မှုဖြေခြင်း၊ အင်တာဗျူးတက်ခြင်း အခမဲ့ပါ။ ကုမ္ပဏီတွေ တကယ်လိုအပ်တာကို သင်ယူပါ။",
    forCompanies: "ကုမ္ပဏီများအတွက်",
    forCompaniesBody: "စစ်ပြီးသား လူတွေကို မြန်မြန်တွေ့ပါ။ စိန်ခေါ်မှုကို သင်သတ်မှတ်၊ AI က အရင်စစ်၊ ဆုံးဖြတ်ချက်က သင့်ဆီမှာ။",
    signupTitle: "အကောင့်ဖွင့်ရန်",
    signupIntro: "သင်ယူသူတွေ လျှောက်ထားခြင်း၊ စိန်ခေါ်မှုဖြေခြင်း၊ အင်တာဗျူးတက်ခြင်းအတွက် ငွေမပေးရပါ။",
    iAm: "ကျွန်ုပ်သည်",
    learner: "သင်ယူသူ",
    company: "ကုမ္ပဏီ",
    yourName: "သင့်အမည်",
    companyName: "ကုမ္ပဏီအမည်",
    email: "အီးမေးလ်",
    emailHint: "ကုမ္ပဏီကိုယ်ပိုင် ဒိုမိန်းပေါ်က အီးမေးလ်ကို သုံးပါ။",
    emailTaken: "ဒီအီးမေးလ်နဲ့ အကောင့် ရှိပြီးသားပါ။",
    continueRegistration: "မှတ်ပုံတင်ရန် ဆက်သွားမည်",
    continueOnboarding: "စတင်ပြင်ဆင်ရန် ဆက်သွားမည်",
    free: "အခမဲ့",
    paid: "ငွေပေး",
    fullyFree: "အကုန်အခမဲ့",
    firstFree: "ပထမ ၂၅% အခမဲ့",
    lesson: "သင်ခန်းစာ",
    lessons: "သင်ခန်းစာ",
    hour: "နာရီ",
    hours: "နာရီ",
    unlocks: "ဖွင့်နိုင်မည်",
  },
};

const courseTitleMy: Record<string, string> = {
  starter: "အလုပ်အကိုင် အစ — IT မှာ အလုပ်လုပ်ခြင်း",
  frontend: "Frontend အခြေခံ — HTML၊ CSS နှင့် JavaScript",
  qa: "လက်ဖြင့် QA စစ်ဆေးခြင်း",
};

export function courseTitle(course: { id: string; title: string } | undefined, lang: Lang) {
  if (!course) return "";
  return lang === "my" ? (courseTitleMy[course.id] ?? course.title) : course.title;
}

export const formatMmk = (n: number) => `${n.toLocaleString("en-US")} MMK`;
