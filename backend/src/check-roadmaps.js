// Asks the roadmap API for every career goal and prints the picks, to eyeball whether they make sense.
// Usage: npm run check-roadmaps -- https://your-api.example.com
const api = (process.argv[2] || "http://localhost:4000").replace(/\/$/, "");

const cases = [
  { goal: "Frontend Developer", currentSkills: "", comfortable: [] },
  { goal: "Frontend Developer", currentSkills: "HTML (comfortable), CSS (comfortable), JavaScript (a little)", comfortable: ["HTML", "CSS"] },
  { goal: "Backend Developer", currentSkills: "JavaScript (a little)", comfortable: [] },
  { goal: "Full-Stack Developer", currentSkills: "", comfortable: [] },
  { goal: "UI/UX Designer", currentSkills: "Computer basics (comfortable)", comfortable: ["Computer basics"] },
  { goal: "Data Analyst", currentSkills: "Excel or Google Sheets (a little)", comfortable: [] },
  { goal: "Not Sure Yet", currentSkills: "Nothing yet, I am starting fresh", comfortable: [] },
];

const titles = new Map(((await (await fetch(`${api}/catalogue`)).json()).courses || []).map((c) => [c.slug, c.title]));
for (const c of cases) {
  const res = await fetch(`${api}/ai/roadmap`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...c, hoursPerWeek: 5 }) });
  const data = await res.json();
  console.log(`\n${c.goal} | knows: ${c.currentSkills || "nothing"} | ${res.status} ${data.source ?? data.error ?? ""}`);
  for (const slug of data.roadmap || []) console.log(`  - ${titles.get(slug) ?? slug}: ${data.reasons?.[slug] ?? ""}`);
  if (data.roadmapNote) console.log(`  note: ${data.roadmapNote}`);
}
