// Walks the learner flow in the real app and saves every screen the video uses into shots-learner/.
import { open, sleep } from "./cdp.mjs";
const b = await open("shots-learner");
const radio = (name, i) => b.js(`document.querySelectorAll('input[name=${name}]')[${i}].click()`);

await b.go("/", 3000);
await b.click("text:button|EN"); await sleep(400);
await b.patch(`(st) => { st.sessionUserId = null; st.users = st.users.filter(u => u.id !== 'u-su'); st.users.push({ id: 'u-su', role: 'learner', name: 'Su Myat', email: 'su@example.com', headline: '', skills: [] }); }`);
await b.go("/", 3500);
await b.shot("landing", { login: "text:header a|Log in", start: "text:a|Start learning", hero: "h1" });

// 1. Learner login
await b.go("/login", 3000);
await b.shot("login", { email: "input[type=email]", go: "text:button|Continue", card: "form", role: "input[name=role][value=learner]@label" });
await b.type("input[type=email]", "su@example.com");
await b.shot("login-filled", { email: "input[type=email]", go: "text:button|Continue" });
await b.js(`document.querySelector('input[type=email]').form.requestSubmit()`); await sleep(3500);

// 2. Set up roadmap
await b.shot("onb-lang", { english: "input[name=lang]@label", go: "text:button|find my path", stepper: ".ca-stepper", title: "h1" });
await b.click("text:button|find my path"); await sleep(1500);
const goal = { goal: "#career-goal", skills: "label:What can you do", hours5: "text:label|5 hrs", go: "text:button|Make my roadmap", stepper: ".ca-stepper" };
await b.shot("onb-goal", goal);
await b.fill("#career-goal", "frontend"); await sleep(300);
await b.type("What can you do", "Basic HTML");
await b.click("text:label|5 hrs"); await sleep(300);
await b.shot("onb-goal-filled", goal);
await b.click("text:button|Make my roadmap"); await sleep(4000);
await b.shot("onb-review", { list: "h:Career starter@[class*=rounded]", why: "h:Why this order@[class*=rounded]", save: "text:button|Save my roadmap", title: "h1" });
await b.click("text:button|Save my roadmap"); await sleep(1500);
const prof = { headline: "label:Headline", skills: "label:Skills", save: "text:button|Save and see my roadmap" };
await b.shot("onb-profile", prof);
await b.type("Headline", "Future frontend developer from Yangon");
await b.type("Skills", "HTML, CSS");
await b.shot("onb-profile-filled", prof);
await b.click("text:button|Save and see my roadmap"); await sleep(3500);
const home = { banner: "h1@section", path: "text:h2|Your path to an internship@section", next: "text:a|Start lesson@section", roadmap: "text:h2|Your roadmap@section", why: "h:Why this order@section" };
await b.shot("home", home, { full: true });
await b.shot("home-v", home);

// 3. Take a final test: lessons done and the course paid, as after a few weeks of study.
await b.patch(`(st) => { const p = st.progress['u-su']; p.doneLessons = ['starter-1','starter-2','starter-3','frontend-1','frontend-2','frontend-3']; p.paidCourseIds = ['frontend']; p.testScores = { starter: 100 }; st.certificates = st.certificates.filter(c => c.learnerId !== 'u-su'); st.certificates.push({ id: 'cert-u-su-starter', learnerId: 'u-su', courseId: 'starter', score: 100, issuedAt: '2026-10-16' }); }`);
await b.go("/courses/frontend", 3500);
console.log(await b.dump());
await b.js(`(() => { const s = [...document.querySelectorAll('h2')].find(h => h.textContent.trim() === 'Final test').closest('section'); s.id = '__final'; const a = s.querySelector('a, button'); if (a) a.id = '__take'; return a?.textContent; })()`).then((t) => console.log("final test link:", t));
const course = { test: "#__take", final: "#__final", lessons: "h:Lessons@section", title: "h1" };
await b.shot("course", course, { full: true });
await b.shot("course-v", course);
await b.go("/courses/frontend/test", 3500);
const q = {}; [[0,2],[1,1],[2,0],[3,2],[4,1]].forEach(([n, i]) => (q["q" + n] = `input[name=q-${n}]:nth-of-type(1)`));
const testBoxes = { submit: "text:button|Submit test", card: "form" };
for (const [n, i] of [[0,2],[1,1],[2,0],[3,2],[4,1]]) testBoxes["a" + n] = `#__a${n}`;
await b.js(`[[0,2],[1,1],[2,0],[3,2],[4,1]].forEach(([n,i]) => { document.querySelectorAll('input[name=q-' + n + ']')[i].closest('label').id = '__a' + n; })`);
await b.shot("test", testBoxes, { full: true });
await b.shot("test-v", testBoxes);
for (const [n, i] of [[0,2],[1,1],[2,0],[3,2],[4,1]]) await radio(`q-${n}`, i);
await sleep(300);
await b.shot("test-answered", testBoxes, { full: true });
await b.js(`[...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Submit test').scrollIntoView({ block: 'center' })`);
const testScroll = await b.js("Math.round(scrollY)");
await b.click("text:button|Submit test"); await sleep(900);
await b.shot("test-confirm", { dialog: "dialog[open] > *", ok: "text:dialog[open] button|Submit test" }, { scroll: testScroll });
await b.click("text:dialog[open] button|Submit test"); await sleep(2500);

// 4. Certified
await b.shot("result-toast", { toast: "[aria-live=polite] .shadow-lg", card: "text:h2|You finished the course@div", cert: "text:a|View certificate" }, { scroll: 0 });
await b.js(`[...document.querySelectorAll('[aria-live=polite] button')].find(x => x.textContent.trim() === 'Dismiss')?.click()`); await sleep(500);
await b.shot("result", { card: "text:h2|You finished the course@div", cert: "text:a|View certificate" }, { scroll: 0 });
await b.click("text:a|View certificate"); await sleep(3000);
await b.shot("cert", { cert: "h1@[class*=rounded]", name: "h1", course: "text:p|Frontend basics" });

// 5. Take a challenge
await b.go("/challenges", 3500);
await b.js(`(() => { const s = [...document.querySelectorAll('h2')].find(h => h.textContent.includes('pricing card')).closest('section'); s.id = '__card'; [...s.querySelectorAll('a')].find(a => a.textContent.trim() === 'Start challenge').id = '__start'; })()`);
await b.shot("challenges", { open: "text:button|Open to you", card: "#__card", start: "#__start" });
await b.click("#__start"); await sleep(3000);
const ch = { task: "h:The task@section", answer: "textarea", link: "label:Link to your work", ai: "text:button|Get AI feedback first", submit: "text:button|Submit to company", panel: "h:First feedback@section" };
await b.shot("challenge", ch, { full: true });
await b.type("textarea", "I built the card with a section, an h2 for the plan name and a list of features. Flexbox keeps the button at the bottom, and a media query at 640px widens it. I checked it at 360px and 1280px in DevTools.");
await b.type("Link to your work", "https://github.com/sumyat/pricing-card");
await b.shot("challenge-filled", ch, { full: true });
await b.click("text:button|Get AI feedback first"); await sleep(2500);
await b.shot("challenge-ai", ch, { full: true });
await b.click("text:button|Submit to company"); await sleep(900);
await b.shot("challenge-confirm", { dialog: "dialog[open] > *", ok: "text:dialog[open] button|Submit to company" }, { scroll: 0 });
await b.click("text:dialog[open] button|Submit to company"); await sleep(2500);
await b.shot("challenge-sent", { status: "h:Submitted@section" }, { full: true });

// 6. Got a job: the company invites Su to interview, then sends an offer.
await b.go("/internships", 3000);
await b.patch(`(st) => { const s = st.submissions.find(x => x.learnerId === 'u-su'); s.status = 'interview'; st.interviews = st.interviews.filter(i => i.id !== 'iv-su'); st.interviews.push({ id: 'iv-su', submissionId: s.id, challengeId: 'ch-pricing', learnerId: 'u-su', companyId: 'c-gp', when: '2026-10-28T10:00', format: 'video', place: 'https://meet.google.com/gpx-su-int', status: 'scheduled' }); }`);
await sleep(1500);
const job = { toast: "[aria-live=polite] .shadow-lg", card: "h:Frontend intern@section", chip: "text:span|Interview scheduled", call: "text:a|Join the call" };
await b.shot("job-invite", job, { scroll: 0 });
await b.js(`[...document.querySelectorAll('[aria-live=polite] button')].find(x => x.textContent.trim() === 'Dismiss')?.click()`); await sleep(500);
await b.shot("job-invite-clean", job, { scroll: 0 });
await b.patch(`(st) => { st.interviews.find(i => i.id === 'iv-su').status = 'offered'; st.submissions.find(x => x.learnerId === 'u-su').status = 'offered'; }`);
await sleep(1500);
const offer = { toast: "[aria-live=polite] .shadow-lg", card: "h:Frontend intern@section", chip: "text:span|Offer received", accept: "text:button|Accept offer" };
await b.shot("job-offer", offer, { scroll: 0 });
await b.js(`[...document.querySelectorAll('[aria-live=polite] button')].find(x => x.textContent.trim() === 'Dismiss')?.click()`); await sleep(500);
await b.shot("job-offer-clean", offer, { scroll: 0 });
await b.click("text:button|Accept offer"); await sleep(900);
await b.shot("job-accept", { dialog: "dialog[open] > *", ok: "text:dialog[open] button|Accept offer" }, { scroll: 0 });
await b.click("text:dialog[open] button|Accept offer"); await sleep(2500);
await b.shot("job-started", { card: "h:Frontend intern@section", chip: "text:span|Internship started" }, { scroll: 0 });
b.close();
