// Stand-in for the AI service on :4000 while capturing, so AI screens show a real reply instead of the offline fallback.
import http from "node:http";
const replies = {
  "/ai/roadmap": {
    roadmap: ["starter", "frontend"],
    roadmapNote: "You already know some HTML, so we start with how IT jobs work in Myanmar, then go straight into Frontend basics. At 5 hours a week you'll finish in about 3 weeks.",
    reasons: {
      starter: "Learn how IT teams work and how companies here hire interns.",
      frontend: "Build on your HTML with CSS layout and JavaScript, the skills frontend challenges test.",
    },
  },
  "/ai/challenge-review": {
    feedback: ["Good use of semantic elements for the plan name and features.", "You say how you tested 360px and 1280px. Companies look for that.", "Add one line on why you picked 640px for the breakpoint."],
    aiScore: 86,
    aiSummary: "Semantic card with flexbox and a 640px media query, tested at both sizes. Meets all three points; the breakpoint choice could be explained more, so this is 86.",
    aiRubric: [{ point: "Semantic HTML", met: true }, { point: "Works at 360px and 1280px", met: true }, { point: "Clear explanation of choices", met: true }],
  },
};
http.createServer(async (req, res) => {
  const origin = req.headers.origin ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.end();
  const body = replies[req.url];
  if (!body) { req.socket.destroy(); return; } // like the service being offline
  await new Promise((r) => setTimeout(r, 400));
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}).listen(4000, () => console.log("mock ai on 4000"));
