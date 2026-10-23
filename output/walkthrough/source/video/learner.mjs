// Learner walkthrough: login → roadmap → final test → certified → challenge → job.
import { Video } from "./build.mjs";
const v = new Video("learner", "../shots-learner", ["Learner login", "Set up roadmap", "Take a final test", "Certified", "Take a challenge", "Got a job"]);

// 1. Learner login
v.card("Learner login", "Sign in with just your email.", 6);
v.page("landing", { label: "The Citadel" }).caption("Su opens The Citadel");
v.camTo("landing.hero", { z: 1.2, dur: 1.4 }).wait(0.9);
v.camReset({ dur: 0.6 }).move("landing.login", { dur: 0.7, click: true }).wait(0.1);
v.page("login", { label: "Log in" }).caption("Sign in with an email");
v.camTo("login.card", { z: 1.5, dur: 0.8 });
v.move("login.email", { dur: 0.7, fx: 0.25, click: true }).type("login-filled", "login.email", 0.9);
v.move("login.go", { dur: 0.45, click: true });

// 2. Set up roadmap
v.card("Set up roadmap", "Your goal and pace in. A roadmap out.", 25);
v.page("onb-lang", { label: "Get started" }).caption("Pick English or Myanmar");
v.move("onb-lang.english", { dur: 0.7, click: true }).ring("onb-lang.english", 1.0).wait(0.5);
v.move("onb-lang.go", { dur: 0.5, click: true });
v.page("onb-goal").caption("Choose a career goal and weekly hours");
v.camTo([652, 260, 640, 300], { z: 1.55, dur: 0.8 });
v.move("onb-goal.goal", { dur: 0.6, fx: 0.25, click: true }).type("onb-goal-filled", "onb-goal.goal", 0.45);
v.move("onb-goal.skills", { dur: 0.45, fx: 0.25, click: true }).type("onb-goal-filled", "onb-goal.skills", 0.6);
v.move("onb-goal.hours5", { dur: 0.45, click: true }).show("onb-goal-filled", { ref: "onb-goal.hours5", dur: 0.15 });
v.camReset({ dur: 0.6 }).move("onb-goal.go", { dur: 0.6, click: true });
v.page("onb-review").caption("AI picks the courses and their order");
v.camTo([652, 238, 637, 324], { z: 1.5, dur: 0.9, wait: true }).ring([672, 322, 596, 166], 1.6).wait(1.6);
v.camReset({ dur: 0.6 }).move("onb-review.save", { dur: 0.6, click: true });
v.page("onb-profile").caption("Add a headline and skills for companies");
v.move("onb-profile.headline", { fx: 0.25, dur: 0.6, click: true }).type("onb-profile-filled", "onb-profile.headline", 0.8);
v.move("onb-profile.skills", { fx: 0.25, dur: 0.4, click: true }).type("onb-profile-filled", "onb-profile.skills", 0.35);
v.move("onb-profile.save", { dur: 0.5, click: true });
v.page("home", { label: "Home" }).caption("Home shows the whole road to an internship");
v.camTo("home.path", { z: 1.25, dur: 1.0, wait: true }).ring([300, 420, 1088, 220], 1.8).wait(1.8);
v.camReset({ dur: 0.6 }).scroll("home.roadmap", 1.0).caption("Two courses to finish, in order").wait(1.6);

// 3. Take a final test
v.card("Take a final test", "Finish the lessons, then prove what you know.", 21);
v.page("course", { label: "Frontend basics" }).caption("Every lesson done. Time for the final test");
v.camTo("course.final", { z: 1.6, dur: 0.9 }).wait(0.4).move("course.test", { dur: 0.7, click: true });
v.page("test", { label: "Final test" }).caption("Five questions. 70% to pass");
v.camTo("test.card", { z: 1.2, dur: 0.7 });
for (let i = 0; i < 5; i++) v.move(`test.a${i}`, { fx: 0.03, dur: i ? 0.42 : 0.6, click: true }).show("test-answered", { ref: `test.a${i}`, dur: 0.12 });
v.move("test.submit", { dur: 0.5, click: true }).camReset({ dur: 0.4 });
const testModal = v.modal("test-confirm", "test-confirm.panel");
v.wait(0.5).move("test-confirm.ok", { dur: 0.55, click: true });

// 4. Certified
v.card("Certified", "Pass the test and the certificate is yours.", 3);
v.page("result", { label: "Final test" }).caption("Passed with 100%");
v.show("result-toast", { ref: "result-toast.toast", effect: "slide", dur: 0.45 });
v.camTo([508, 177, 672, 436], { z: 1.35, dur: 0.8, wait: true }).confetti(2.6).wait(1.5);
v.camReset({ dur: 0.5 }).move("result.cert", { dur: 0.7, click: true });
v.page("cert", { label: "Certificate" }).caption("A certificate companies can trust");
v.camTo("cert.cert", { z: 1.3, dur: 0.9, wait: true }).sparkle("cert.name", 2.0).wait(2.0);

// 5. Take a challenge
v.card("Take a challenge", "Real tasks from verified companies.", 5);
v.page("challenges", { label: "Challenges" }).caption("Certified learners unlock company challenges");
v.ring("challenges.card", 1.6).wait(0.9).move("challenges.start", { dur: 0.7, click: true });
v.page("challenge", { label: "Challenge" }).caption("Explain the work and share a link");
v.camTo([300, 500, 640, 400], { z: 1.5, dur: 0.8 });
v.move("challenge.answer", { fx: 0.15, fy: 0.15, dur: 0.6, click: true }).type("challenge-filled", "challenge.answer", 1.3);
v.move("challenge.link", { fx: 0.25, dur: 0.4, click: true }).type("challenge-filled", "challenge.link", 0.6);
v.move("challenge.ai", { dur: 0.45, click: true });
v.caption("AI feedback before the company sees it").camTo("challenge-ai.panel", { z: 1.7, dur: 0.9 });
v.show("challenge-ai", { ref: "challenge-ai.panel", dur: 0.4 }).wait(1.8);
v.camReset({ dur: 0.6 }).move("challenge.submit", { dur: 0.6, click: true });
const chModal = v.modal("challenge-confirm", "challenge-confirm.panel");
v.wait(0.4).move("challenge-confirm.ok", { dur: 0.5, click: true }).hide(chModal);
v.show("challenge-sent", { dur: 0.35 }).caption("Sent. Golden Pixel reviews it").ring("challenge-sent.status", 1.4).wait(1.4);

// 6. Got a job
v.card("Got a job", "Interview, offer, internship.", 13);
v.page("job-invite-clean", { label: "Internships" }).caption("Golden Pixel invites Su to interview");
v.wait(0.4);
const inviteToast = v.show("job-invite", { ref: "job-invite.toast", effect: "slide", dur: 0.45 }).last;
v.wait(0.3).ring("job-invite.card", 1.5).wait(1.5);
v.hide(inviteToast).show("job-offer-clean", { dur: 0.35 });
const offerToast = v.show("job-offer", { ref: "job-offer.toast", effect: "slide", dur: 0.45 }).last;
v.caption("Then an offer, with pay and terms up front").ring("job-offer.chip", 1.2).wait(1.0);
v.hide(offerToast).move("job-offer.accept", { dur: 0.7, click: true });
const acceptModal = v.modal("job-accept", "job-accept.panel");
v.wait(0.6).move("job-accept.ok", { dur: 0.5, click: true }).hide(acceptModal);
v.show("job-started", { dur: 0.35 }).caption("Su starts her first internship").ring("job-started.chip", 1.6).confetti(2.6).wait(2.0);

v.end({ line: "Learn. Get certified. <b>Get hired.</b>", pose: 7 });
v.save("tl-learner.js");
