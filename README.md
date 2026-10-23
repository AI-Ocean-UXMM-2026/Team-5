<p align="center">
  <img src="frontend/mascot/17.png" alt="The Citadel mascot waving the Citadel flag" width="180">
</p>

<h1 align="center">The Citadel</h1>

<p align="center"><strong>Skills that get you in.</strong><br>
For young people in Myanmar and the IT companies that hire them.</p>

<p align="center">
  <a href="https://citadel-pink.vercel.app">Live site</a> ·
  <a href="docs/citadel-flow-and-ia.md">User flow &amp; IA</a> ·
  <a href="docs/The-Citadel-Design-System.md">Design system</a> ·
  <a href="presentation.pptx">Presentation</a> ·
  <a href="The%20citadel%20team%20404.mov">Team video</a>
</p>

---

## What is The Citadel?

The Citadel is a learning and hiring platform for people aged 18–30 in Myanmar who want their first job in IT. Learners study short, practical courses, prove what they can do with a test and a certificate, and then solve real tasks set by verified IT companies. Companies use those tasks to find tested candidates and offer internships.

One web app, one login: what you see depends on whether you are a **learner** or a **company**.

## How it works

**For learners**

1. **Set a career goal.** Pick a goal (Frontend, Backend, Full-Stack, UI/UX, Data, or "not sure yet"), the skills you already have and how many hours a week you can study. AI builds a personal roadmap of courses.
2. **Learn.** Short lessons with an AI summary, your own notes and a practice quiz after each lesson.
3. **Get certified.** Pass the final test (70% or more) to earn a certificate you can share.
4. **Take a company challenge.** Certified learners solve real tasks from verified companies. AI gives first feedback; the company makes every decision.
5. **Interview and start an internship.** Companies invite strong candidates to interview and send offers. After the internship starts, both sides rate each other.

**For companies**

1. **Register** with company details, documents and internship terms.
2. **Get verified** by the Citadel team (documents and a short call), then go live with a Verified badge.
3. **Post challenges.** AI drafts the task and rubric; you edit and publish.
4. **Review work** with an AI summary and score, give feedback, invite to interview and send offers.

**For everyone:** a community for course discussions and challenge questions, with a Report button on every post.

## Our promises

- Learners never pay to apply, take a challenge or interview.
- Only verified companies can post challenges or internships.
- AI pre-screens and supports. People make every hiring decision.
- The career starter course is free, and the first 25% of every paid course is free to try.

## Courses

The catalogue covers the skills Myanmar IT employers hire for, from foundations to job-ready:

| Area | Courses |
|---|---|
| Foundations | Career starter, Computer and internet basics, English for the IT workplace, Git and GitHub |
| Web | Frontend basics (HTML, CSS, JavaScript), React fundamentals, Backend with Node.js, Databases and SQL |
| Design | UI/UX design basics, Figma for beginners |
| Data | Spreadsheets for data, Data analysis with Python |
| More jobs | Manual QA testing, IT support and networking basics, Cybersecurity basics |

Paid courses are paid by mobile-wallet transfer (KBZPay, WavePay or AYA Pay); our team checks each receipt.

## AI in The Citadel

| Feature | What AI does |
|---|---|
| Roadmap | Searches the course catalogue for the best matches to your goal and skills, then orders them and explains each pick (retrieval first, then AI) |
| Lesson summary | Summarises a lesson into a few key points |
| Challenge feedback | Pre-screens an answer against the company's rubric and gives first feedback |
| Challenge draft | Drafts a task and rubric for a company from the chosen course |

If AI is unavailable, the roadmap and challenge pre-screen fall back to a simple keyword search, so nobody gets stuck.

## Tech stack

| Part | Built with | Hosted on |
|---|---|---|
| Website (`frontend/`) | Next.js 16, React 19, TypeScript, Tailwind CSS 4 | Vercel |
| API (`backend/`) | Node.js, PostgreSQL | Railway |
| AI | OpenAI (`gpt-4o-mini`, `text-embedding-3-small`) | via the API |

## Run it locally

You need Node.js 22+ and PostgreSQL.

**API**

```bash
cd backend
npm install
cp .env.example .env   # then set DATABASE_URL (and OPENAI_API_KEY for AI)
npm run migrate
npm run seed -- "Teacher name" teacher@example.com "a-password-8-plus"
npm start              # http://localhost:4000
```

**Website**

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

**Tests**

```bash
cd backend && npm test
cd frontend && npm test
```

## Repository

| Folder | What's inside |
|---|---|
| `frontend/` | The website |
| `backend/` | The API, database migrations and seed data |
| `docs/` | Product brief, business model, user flow and design system |
| `logo/` | Brand logos |
| `output/` | Design explorations, mockups and the walkthrough video source |
| `presentation.pptx` | Pitch deck |
| `The citadel team 404.mov` | Team video |

## Team

Built by **Team 404**.
