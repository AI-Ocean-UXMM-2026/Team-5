export type Role = "learner" | "company";

export type Lang = "en" | "my";

/** answer is only known for the built-in fallback courses; courses from the API are checked on the server. */
export type Question = { q: string; options: string[]; answer?: number };

export type Lesson = {
  /** "<course id>-<position>", kept stable so saved progress still matches. */
  id: string;
  /** Database id, set for courses loaded from the API. */
  uuid?: string;
  title: string;
  body: string[];
  keyPoints: string[];
  summary: string;
  /** YouTube id. shortcut: a private video only plays for the owner, use Unlisted for learners. */
  videoId?: string;
  quiz: Question[];
};

export type Course = {
  /** The course slug, e.g. "frontend". */
  id: string;
  /** Database id, set for courses loaded from the API. */
  uuid?: string;
  title: string;
  skill: string;
  level: string;
  hours: number;
  /** 0 means the whole course is free. */
  priceMmk: number;
  description: string;
  lessons: Lesson[];
  test: Question[];
};

export type User = {
  id: string;
  role: Role;
  name: string;
  email: string;
  headline: string;
  skills: string[];
  companyId?: string;
  /** Date the user accepted the terms and privacy policy and confirmed they are 18 or older. */
  acceptedTermsAt?: string;
};

/** "approved": our team checked the company and it now pays the partner fee; it goes live ("verified") once the fee is confirmed. */
export type CompanyStatus = "draft" | "pending" | "approved" | "verified" | "rejected";

export type PartnerPlan = "monthly" | "yearly";

export type InternshipTerms = { role: string; duration: string; location: string; stipend: string };

export type Company = {
  id: string;
  name: string;
  about: string;
  website: string;
  social: string;
  address: string;
  phone: string;
  email: string;
  documents: string[];
  /** YouTube id for the video sent with registration. */
  videoId?: string;
  terms: InternshipTerms;
  status: CompanyStatus;
  reviewNote?: string;
  /** Day our team approved the registration. */
  approvedAt?: string;
  verifiedAt?: string;
  approvalSeen?: boolean;
  /** Partner plan paid for, and the last day it covers. */
  plan?: PartnerPlan;
  paidUntil?: string;
  /** Data URL of the company logo. */
  logo?: string;
};

export type Challenge = {
  id: string;
  companyId: string;
  courseId: string;
  title: string;
  task: string;
  rubric: string[];
  createdAt: string;
};

export type Submission = {
  id: string;
  challengeId: string;
  learnerId: string;
  answer: string;
  link: string;
  aiFeedback: string[];
  aiSummary: string;
  aiScore: number;
  aiRubric?: { point: string; met: boolean }[];
  status: "submitted" | "needs-work" | "interview" | "offered";
  companyFeedback?: string;
  submittedAt: string;
};

export type Interview = {
  id: string;
  submissionId: string;
  challengeId: string;
  learnerId: string;
  companyId: string;
  when: string;
  /** How the interview happens, and the meeting link or office address. */
  format?: "video" | "office";
  place?: string;
  status: "scheduled" | "offered" | "accepted" | "declined" | "not-selected";
};

export type Rating = {
  id: string;
  interviewId: string;
  fromId: string;
  toId: string;
  stars: number;
  comment: string;
};

export type Reply = { id: string; authorId: string; body: string; at: string };

export type Post = {
  id: string;
  authorId: string;
  kind: "course" | "challenge";
  topicId: string;
  title: string;
  body: string;
  at: string;
  replies: Reply[];
  officialReplyId?: string;
};

export type Report = { id: string; targetId: string; reporterId: string; reason: string; at: string };

export type Certificate = { id: string; learnerId: string; courseId: string; score: number; issuedAt: string };

export type Progress = {
  goal: string;
  currentSkills: string;
  hoursPerWeek: number;
  knownSkills?: { id: string; level: "little" | "comfortable" }[];
  otherSkill?: string;
  skillLevels?: Record<string, "little" | "comfortable">;
  roadmap: string[];
  roadmapNote: string;
  /** Why the AI picked each roadmap course, by course id. */
  roadmapReasons?: Record<string, string>;
  doneLessons: string[];
  paidCourseIds: string[];
  notes: Record<string, string>;
  testScores: Record<string, number>;
  /** Day of the latest final test per course id. */
  testDates?: Record<string, string>;
};

export type State = {
  lang: Lang;
  sessionUserId: string | null;
  users: User[];
  companies: Company[];
  challenges: Challenge[];
  submissions: Submission[];
  interviews: Interview[];
  ratings: Rating[];
  posts: Post[];
  reports: Report[];
  certificates: Certificate[];
  progress: Record<string, Progress>;
  /** Notification ids each user has opened, by user id. */
  seenNotifications?: Record<string, string[]>;
  /** Course payments sent by bank transfer, checked by our staff. */
  payments?: CoursePayment[];
  /** Partner fees companies pay after approval, checked by our staff. */
  companyPayments?: CompanyPayment[];
};

export type CompanyPayment = {
  id: string;
  companyId: string;
  plan: PartnerPlan;
  amountMmk: number;
  /** Id from paymentAccounts, e.g. "kpay". */
  method: string;
  reference: string;
  /** Receipt screenshot as a compressed JPEG data URL. */
  receipt: string;
  status: "pending" | "approved" | "rejected";
  staffNote?: string;
  submittedAt: string;
  reviewedAt?: string;
};

export type CoursePayment = {
  id: string;
  learnerId: string;
  courseId: string;
  amountMmk: number;
  /** Id from paymentAccounts, e.g. "kpay". */
  method: string;
  /** Transaction number the learner typed, if any. */
  reference: string;
  /** Receipt screenshot as a compressed JPEG data URL. */
  receipt: string;
  status: "pending" | "approved" | "rejected";
  staffNote?: string;
  submittedAt: string;
  reviewedAt?: string;
};
