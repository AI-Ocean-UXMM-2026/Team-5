import type { Lang } from "./types";

type Copy = {
  language: string;
  eyebrow: string;
  heroTitle: string;
  heroLead: string;
  promoLabel: string;
  promoBody: string;
  promoPoints: string[];
  promoHow: string;
  promoCourse: string;
  promoChallenge: string;
  verified: string;
  instructorsTitle: string;
  instructorsLead: string;
  teaches: string;
  yearsExp: string;
  createAccount: string;
  logIn: string;
  how: string;
  steps: string[];
  freeStrip: string;
  unlocksAfter: string;
  startLearning: string;
  registerCompany: string;
  forLearners: string;
  forLearnersBody: string;
  forCompanies: string;
  forCompaniesBody: string;
  verifyTitle: string;
  verifyPoints: { title: string; line: string }[];
  verifyBody: string;
  ctaTitle: string;
  courses: string;
  challenges: string;
  internships: string;
  community: string;
  howVerify: string;
  postChallenge: string;
  trustHelp: string;
  promise: string;
  safetyTitle: string;
  safetyBody: string;
  rulesTitle: string;
  rulesBody: string;
  privacy: string;
  privacyBody: string;
  terms: string;
  termsBody: string;
  rights: string;
  signupTitle: string;
  signupIntro: string;
  signupCompany: string;
  namePlaceholder: string;
  companyPlaceholder: string;
  emailPlaceholder: string;
  iAm: string;
  learner: string;
  company: string;
  yourName: string;
  companyName: string;
  email: string;
  emailHint: string;
  emailTaken: string;
  agreeTerms: string;
  readTerms: string;
  continue: string;
  confirmTitle: string;
  confirmIntro: string;
  codeLabel: string;
  demoCode: string;
  wrongCode: string;
  confirmEmail: string;
  resendCode: string;
  codeResent: string;
  changeEmail: string;
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
    eyebrow: "For young people in Myanmar and the IT companies that hire them.",
    heroTitle: "Skills that get you in",
    heroLead: "Learn IT skills, get certified, solve a real company task, and get an interview. Free to start.",
    promoLabel: "The Citadel",
    promoBody: "Learn IT skills, get certified, and solve a real task from a verified company. Then get an interview and an internship.",
    promoPoints: [
      "Free to start. The first 25% of every course is free.",
      "A certificate you earn by passing a real test.",
      "Real challenges from verified companies, then an interview.",
    ],
    promoHow: "See how it works",
    promoCourse: "Frontend basics",
    promoChallenge: "Build a responsive pricing card",
    verified: "Verified",
    instructorsTitle: "Meet our instructors",
    instructorsLead: "Every course is taught by someone who works in the field.",
    teaches: "Teaches",
    yearsExp: "+ yrs experience",
    createAccount: "Start free",
    logIn: "Log in",
    how: "How it works",
    steps: [
      "Set a goal and get an AI roadmap",
      "AI summary + your own notes",
      "Pass the test and get certified",
      "Solve a real company task",
      "Interview and start your internship",
    ],
    freeStrip: "Career starter: free · First 25% of every course: free · Applying and interviews: always free.",
    unlocksAfter: "Unlocks after",
    startLearning: "Start learning",
    registerCompany: "Register your company",
    forLearners: "For learners",
    forLearnersBody: "Roadmap, AI notes, certificate, internship interview.",
    forCompanies: "For companies",
    forCompaniesBody: "You set the challenge, AI pre-screens, you decide. We verify every company.",
    verifyTitle: "Every company is checked",
    verifyPoints: [
      { title: "Registration", line: "Business documents, checked by our team." },
      { title: "A real office", line: "A working address, phone, and company email." },
      { title: "A short call", line: "We speak with someone at the company." },
    ],
    verifyBody: "Before a company can post, we check its business registration, a real office, and a short call with the company.",
    ctaTitle: "Ready for your first challenge?",
    courses: "Courses",
    challenges: "Challenges",
    internships: "Internships",
    community: "Community",
    howVerify: "How we verify companies",
    postChallenge: "Post a challenge",
    trustHelp: "Trust and help",
    promise: "Our promise",
    safetyTitle: "Safety and reporting",
    safetyBody: "Open a community post and choose Report. Our team reviews every report, including a fake offer or a company that breaks the rules.",
    rulesTitle: "Community rules",
    rulesBody: "No sharing challenge answers. No private contact details.",
    privacy: "Privacy policy",
    privacyBody: "This demo keeps your account, learning progress and community posts in this browser only. Nothing is sent to a server. Clearing this site's data removes it.",
    terms: "Terms",
    termsBody: "Learners never pay to apply, take a challenge or interview. The career starter course is free, and the first 25% of every other course is free. Companies are checked before they can post a challenge. Community rules apply to every post.",
    rights: "© 2026 The Citadel · Team 404",
    signupTitle: "Create an account",
    signupIntro: "Learners never pay to apply, take a challenge or interview.",
    signupCompany: "Meet skilled candidates. Hire with confidence.",
    namePlaceholder: "Aye Chan",
    companyPlaceholder: "Golden Pixel Software",
    emailPlaceholder: "you@email.com",
    iAm: "I am",
    learner: "Learner",
    company: "Company",
    yourName: "Your name",
    companyName: "Company name",
    email: "Email",
    emailHint: "Use an email on your company's own domain.",
    emailTaken: "An account with this email already exists.",
    agreeTerms: "I am 18 or older and I agree to the Terms and the Privacy policy.",
    readTerms: "Read the terms and privacy policy",
    continue: "Continue",
    confirmTitle: "Check your email",
    confirmIntro: "We sent a 6-digit code to",
    codeLabel: "Confirmation code",
    demoCode: "Demo only: no email is sent. Your code is",
    wrongCode: "That code doesn't match. Check it and try again.",
    confirmEmail: "Confirm email",
    resendCode: "Send a new code",
    codeResent: "A new code is on its way.",
    changeEmail: "Change email",
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
    eyebrow: "မြန်မာနိုင်ငံက လူငယ်တွေနဲ့ သူတို့ကို ခန့်မယ့် IT ကုမ္ပဏီတွေအတွက်။",
    heroTitle: "အလုပ်ဝင်နိုင်မယ့် ကျွမ်းကျင်မှု",
    heroLead: "IT ကျွမ်းကျင်မှု သင်ယူပါ၊ လက်မှတ်ရယူပါ၊ ကုမ္ပဏီရဲ့ တကယ့်အလုပ်ကို ဖြေရှင်းပြီး အင်တာဗျူးရယူပါ။ အခမဲ့ စတင်နိုင်ပါတယ်။",
    promoLabel: "စီတာဒယ်",
    promoBody: "IT ကျွမ်းကျင်မှု သင်ယူပါ၊ လက်မှတ်ရယူပါ၊ အတည်ပြုထားသော ကုမ္ပဏီရဲ့ တကယ့်အလုပ်ကို ဖြေရှင်းပါ။ ပြီးရင် အင်တာဗျူးနဲ့ အလုပ်သင် ရယူပါ။",
    promoPoints: [
      "အခမဲ့ စတင်နိုင်ပါတယ်။ သင်တန်းတိုင်းရဲ့ ပထမ ၂၅% က အခမဲ့ပါ။",
      "တကယ့် စာမေးပွဲ အောင်မှ ရတဲ့ လက်မှတ်။",
      "အတည်ပြုထားသော ကုမ္ပဏီတွေရဲ့ တကယ့် စိန်ခေါ်မှု၊ ပြီးရင် အင်တာဗျူး။",
    ],
    promoHow: "ဘယ်လို လုပ်သလဲ ကြည့်ရန်",
    promoCourse: "Frontend အခြေခံ",
    promoChallenge: "ဖုန်းနဲ့ ကိုက်ညီသော ဈေးနှုန်းကတ် တည်ဆောက်ပါ",
    verified: "အတည်ပြုပြီး",
    instructorsTitle: "ကျွန်ုပ်တို့ရဲ့ ဆရာများကို တွေ့ဆုံပါ",
    instructorsLead: "သင်တန်းတိုင်းကို လုပ်ငန်းခွင်ထဲမှာ အလုပ်လုပ်နေသူက သင်ပေးပါတယ်။",
    teaches: "သင်ပေးသည်",
    yearsExp: "+ နှစ် အတွေ့အကြုံ",
    createAccount: "အခမဲ့ စတင်ရန်",
    logIn: "အကောင့်ဝင်ရန်",
    how: "ဘယ်လို လုပ်သလဲ",
    steps: [
      "ပန်းတိုင်သတ်မှတ်ပြီး AI လမ်းကြောင်း ရယူပါ",
      "AI အနှစ်ချုပ် + ကိုယ့်မှတ်စု",
      "စာမေးပွဲအောင်ပြီး လက်မှတ်ရယူပါ",
      "ကုမ္ပဏီရဲ့ တကယ့်အလုပ်ကို ဖြေရှင်းပါ",
      "အင်တာဗျူးပြီး အလုပ်သင် စတင်ပါ",
    ],
    freeStrip: "အလုပ်အကိုင် အစ — အခမဲ့ · သင်တန်းတိုင်းရဲ့ ပထမ ၂၅% — အခမဲ့ · လျှောက်ထားခြင်းနဲ့ အင်တာဗျူး — အမြဲအခမဲ့။",
    unlocksAfter: "ပြီးမှ ဖွင့်နိုင်မည်",
    startLearning: "စတင် သင်ယူရန်",
    registerCompany: "ကုမ္ပဏီ မှတ်ပုံတင်ရန်",
    forLearners: "သင်ယူသူများအတွက်",
    forLearnersBody: "လမ်းကြောင်း၊ AI မှတ်စု၊ လက်မှတ်၊ အလုပ်သင် အင်တာဗျူး။",
    forCompanies: "ကုမ္ပဏီများအတွက်",
    forCompaniesBody: "စိန်ခေါ်မှုကို သင်သတ်မှတ်၊ AI က အရင်စစ်၊ ဆုံးဖြတ်ချက်က သင့်ဆီမှာ။ ကုမ္ပဏီတိုင်းကို ကျွန်ုပ်တို့ အတည်ပြုပါတယ်။",
    verifyTitle: "ကုမ္ပဏီတိုင်းကို စစ်ဆေးပါတယ်",
    verifyPoints: [
      { title: "မှတ်ပုံတင်", line: "လုပ်ငန်း မှတ်ပုံတင် စာရွက်စာတမ်းတွေကို ကျွန်ုပ်တို့အဖွဲ့ စစ်ပါတယ်။" },
      { title: "တကယ့်ရုံး", line: "အလုပ်လုပ်နေတဲ့ လိပ်စာ၊ ဖုန်း၊ ကုမ္ပဏီ အီးမေးလ်။" },
      { title: "ဖုန်းခေါ်ဆိုမှုတို", line: "ကုမ္ပဏီက လူတစ်ယောက်နဲ့ ကျွန်ုပ်တို့ စကားပြောပါတယ်။" },
    ],
    verifyBody: "စိန်ခေါ်မှု မတင်ခင် လုပ်ငန်း မှတ်ပုံတင်၊ တကယ့်ရုံး၊ ကုမ္ပဏီနဲ့ ဖုန်းခေါ်ဆိုမှုတိုကို စစ်ပါတယ်။",
    ctaTitle: "ပထမဆုံး စိန်ခေါ်မှုအတွက် အဆင်သင့်ဖြစ်ပြီလား။",
    courses: "သင်တန်းများ",
    challenges: "စိန်ခေါ်မှုများ",
    internships: "အလုပ်သင်များ",
    community: "အသိုင်းအဝိုင်း",
    howVerify: "ကုမ္ပဏီတွေကို ဘယ်လို အတည်ပြုသလဲ",
    postChallenge: "စိန်ခေါ်မှု တင်ရန်",
    trustHelp: "ယုံကြည်မှုနဲ့ အကူအညီ",
    promise: "ကျွန်ုပ်တို့ ကတိ",
    safetyTitle: "လုံခြုံရေးနဲ့ တိုင်ကြားခြင်း",
    safetyBody: "အသိုင်းအဝိုင်း ပို့စ်ကို ဖွင့်ပြီး တိုင်ကြားမည် ကို ရွေးပါ။ အတုအယောင် ကမ်းလှမ်းချက်နဲ့ စည်းကမ်းဖောက်တဲ့ ကုမ္ပဏီ အပါအဝင် တိုင်ကြားချက်တိုင်းကို ကျွန်ုပ်တို့အဖွဲ့ စစ်ပါတယ်။",
    rulesTitle: "အသိုင်းအဝိုင်း စည်းကမ်း",
    rulesBody: "စိန်ခေါ်မှု အဖြေတွေ မမျှဝေရ။ ဖုန်းနံပါတ်၊ အီးမေးလ်လို ကိုယ်ရေး အဆက်အသွယ် မထည့်ရ။",
    privacy: "ကိုယ်ရေးအချက်အလက် မူဝါဒ",
    privacyBody: "ဒီစမ်းသပ်ချက်က အကောင့်၊ သင်ယူမှု တိုးတက်မှုနဲ့ အသိုင်းအဝိုင်း ပို့စ်တွေကို ဒီဘရောက်ဇာထဲမှာပဲ သိမ်းပါတယ်။ ဆာဗာကို မပို့ပါ။ ဒီဆိုက်ရဲ့ ဒေတာကို ဖျက်လိုက်ရင် ပျောက်ပါတယ်။",
    terms: "စည်းကမ်းချက်များ",
    termsBody: "သင်ယူသူတွေ လျှောက်ထားခြင်း၊ စိန်ခေါ်မှုဖြေခြင်း၊ အင်တာဗျူးတက်ခြင်းအတွက် ငွေမပေးရပါ။ အလုပ်အကိုင် အစ သင်တန်းက အခမဲ့ဖြစ်ပြီး တခြားသင်တန်းတိုင်းရဲ့ ပထမ ၂၅% လည်း အခမဲ့ပါ။ ကုမ္ပဏီတွေ စိန်ခေါ်မှု မတင်ခင် စစ်ဆေးခံရပါတယ်။ အသိုင်းအဝိုင်း စည်းကမ်းက ပို့စ်တိုင်းမှာ သက်ရောက်ပါတယ်။",
    rights: "© 2026 The Citadel · Team 404",
    signupTitle: "အကောင့်ဖွင့်ရန်",
    signupIntro: "သင်ယူသူတွေ လျှောက်ထားခြင်း၊ စိန်ခေါ်မှုဖြေခြင်း၊ အင်တာဗျူးတက်ခြင်းအတွက် ငွေမပေးရပါ။",
    signupCompany: "ကျွမ်းကျင်တဲ့ လျှောက်ထားသူတွေကို တွေ့ပါ။ ယုံကြည်စွာ ခန့်အပ်ပါ။",
    namePlaceholder: "အေးချမ်း",
    companyPlaceholder: "Golden Pixel Software",
    emailPlaceholder: "you@email.com",
    iAm: "ကျွန်ုပ်သည်",
    learner: "သင်ယူသူ",
    company: "ကုမ္ပဏီ",
    yourName: "သင့်အမည်",
    companyName: "ကုမ္ပဏီအမည်",
    email: "အီးမေးလ်",
    emailHint: "ကုမ္ပဏီကိုယ်ပိုင် ဒိုမိန်းပေါ်က အီးမေးလ်ကို သုံးပါ။",
    emailTaken: "ဒီအီးမေးလ်နဲ့ အကောင့် ရှိပြီးသားပါ။",
    agreeTerms: "ကျွန်ုပ်သည် အသက် ၁၈ နှစ်နှင့်အထက် ဖြစ်ပြီး စည်းကမ်းချက်များနှင့် ကိုယ်ရေးအချက်အလက် မူဝါဒကို သဘောတူပါသည်။",
    readTerms: "စည်းကမ်းချက်နှင့် ကိုယ်ရေးအချက်အလက် မူဝါဒ ဖတ်ရန်",
    continue: "ဆက်သွားမည်",
    confirmTitle: "အီးမေးလ်ကို စစ်ပါ",
    confirmIntro: "ဂဏန်း ၆ လုံး ကုဒ်ကို ပို့ထားပါတယ် —",
    codeLabel: "အတည်ပြုကုဒ်",
    demoCode: "စမ်းသပ်ချက်သာ — အီးမေးလ် မပို့ပါ။ သင့်ကုဒ်မှာ",
    wrongCode: "ကုဒ် မကိုက်ညီပါ။ ပြန်စစ်ပြီး ထပ်ကြိုးစားပါ။",
    confirmEmail: "အီးမေးလ် အတည်ပြုမည်",
    resendCode: "ကုဒ်အသစ် ပို့ရန်",
    codeResent: "ကုဒ်အသစ် ပို့လိုက်ပါပြီ။",
    changeEmail: "အီးမေးလ် ပြောင်းရန်",
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

/** Burmese for Myanmar locales, and for visitors whose clock is set to Myanmar. */
export function defaultLang(languages: readonly string[], timeZone = ""): Lang {
  if (languages.some((l) => l.toLowerCase().startsWith("my"))) return "my";
  if (timeZone === "Asia/Yangon" || timeZone === "Asia/Rangoon") return "my";
  return "en";
}
