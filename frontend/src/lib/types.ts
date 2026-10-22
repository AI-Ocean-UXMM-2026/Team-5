export type Role = "learner" | "company";

export type Lang = "en" | "my";

export type Question = { q: string; options: string[]; answer: number };

export type Lesson = {
  id: string;
  title: string;
  body: string[];
  keyPoints: string[];
  summary: string;
  quiz: Question[];
};

export type Course = {
  id: string;
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
};

export type CompanyStatus = "draft" | "pending" | "verified" | "rejected";

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
  terms: InternshipTerms;
  status: CompanyStatus;
  reviewNote?: string;
  verifiedAt?: string;
  approvalSeen?: boolean;
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
  roadmap: string[];
  roadmapNote: string;
  doneLessons: string[];
  paidCourseIds: string[];
  notes: Record<string, string>;
  testScores: Record<string, number>;
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
};
