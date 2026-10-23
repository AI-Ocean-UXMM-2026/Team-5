// Company walkthrough: register → verified → challenge post → recruit candidate.
import { Video } from "./build.mjs";
const v = new Video("company", "../shots-company", ["Register", "Verified", "Challenge post", "Recruit candidate"]);

// 1. Register
v.card("Register", "Sign up, then tell us about your company.", 18);
v.page("signup", { label: "Sign up" }).caption("Thiri signs up Bagan Apps");
v.camTo("signup-company.card", { z: 1.45, dur: 0.8 });
v.move("signup.company", { dur: 0.7, click: true }).show("signup-company", { dur: 0.25 });
v.move("signup-company.name", { fx: 0.2, dur: 0.5, click: true }).type("signup-filled", "signup-company.name", 0.5);
v.move("signup-company.cname", { fx: 0.2, dur: 0.35, click: true }).type("signup-filled", "signup-company.cname", 0.45);
v.move("signup-company.email", { fx: 0.2, dur: 0.35, click: true }).type("signup-filled", "signup-company.email", 0.6);
v.move("signup-company.agree", { fx: 0.03, dur: 0.4, click: true }).show("signup-filled", { ref: "signup-company.agree", dur: 0.12 });
v.move("signup-company.go", { dur: 0.45, click: true });
v.page("reg", { label: "Registration" }).caption("Company details, documents and internship terms");
v.camTo("reg.details", { z: 1.3, dur: 0.8 });
v.move("reg.about", { fx: 0.15, fy: 0.3, dur: 0.6, click: true }).type("reg-filled", "reg.about", 0.8);
v.move("reg.web", { fx: 0.2, dur: 0.35, click: true }).type("reg-filled", "reg.web", 0.35).type("reg-filled", "reg.social", 0.35);
v.move("reg.phone", { fx: 0.2, dur: 0.35, click: true }).type("reg-filled", "reg.phone", 0.3);
v.move("reg.address", { fx: 0.2, dur: 0.35, click: true }).type("reg-filled", "reg.address", 0.4);
v.camReset({ dur: 0.6 }).scroll(560, 0.8);
v.move("reg.doc", { fx: 0.12, dur: 0.5, click: true }).show("reg-filled", { ref: [313, 870, 718, 82], dur: 0.25 }).ring([313, 870, 718, 82], 1.0, { t: v.T }).wait(0.5);
v.move("reg.role", { fx: 0.2, dur: 0.5, click: true }).type("reg-filled", "reg.role", 0.3).type("reg-filled", "reg.duration", 0.25);
v.type("reg-filled", "reg.location", 0.3).type("reg-filled", "reg.stipend", 0.3);
v.move("reg.pledge", { fx: 0.02, fy: 0.3, dur: 0.45, click: true }).show("reg-filled", { ref: [313, 1398, 30, 30], dur: 0.12 });
v.scroll(730, 0.5).move("reg.submit", { dur: 0.45, click: true });
const regModal = v.modal("reg-confirm", "reg-confirm.panel");
v.wait(0.6).move("reg-confirm.ok", { dur: 0.5, click: true });

// 2. Verified
v.card("Verified", "Checked by our team, then live with a badge.", 17);
v.page("status", { label: "Registration" }).caption("Our team checks every company");
v.ring([288, 177, 544, 293], 1.2).wait(1.1);
v.show("status-toast", { ref: "status-toast.toast", effect: "slide", dur: 0.45 }).caption("Approved and ready to pay").camTo("status-toast.toast", { z: 1.6, dur: 0.8, wait: true }).wait(0.6);
v.camReset({ dur: 0.5 }).move("status-toast.view", { dur: 0.5, click: true });
v.page("pay", { label: "Partner plan" }).caption("Pick a plan and pay by mobile wallet");
v.ring([664, 258, 340, 120], 1.2).move([664, 258, 340, 120], { dur: 0.6, click: true }).wait(0.3);
v.ring("pay.wallets", 1.2).wait(1.0);
v.scroll(500, 0.8).caption("Send the receipt");
v.move("pay.txn", { fx: 0.2, dur: 0.5, click: true }).type("pay-filled", "pay.txn", 0.4);
v.move("pay.receipt", { fx: 0.2, dur: 0.4, click: true });
v.page("pay-filled", { keep: true }).ring("pay-filled.preview", 1.0).wait(0.5);
v.scroll(652, 0.6).move("pay-filled.send", { dur: 0.45, click: true });
v.page("pay-pending", { label: "Partner plan" }).caption("Our team checks the payment").wait(0.9);
v.show("pay-sent", { ref: "pay-sent.toast", effect: "slide", dur: 0.45 }).caption("Payment confirmed. Bagan Apps is live").wait(0.8);
v.move("pay-sent.view", { dur: 0.6, click: true });
v.page("live", { label: "Status" }).ring("live.next", 1.2).wait(0.5).move("live.page", { dur: 0.6, click: true });
v.page("company-page", { label: "Company page" }).caption("The Verified badge shows on every post");
v.camTo("company-page.hero", { z: 1.25, dur: 0.9, wait: true }).ring("company-page.badge", 1.6).sparkle("company-page.badge", 1.6).wait(1.6);

// 3. Challenge post
v.card("Challenge post", "A real task, judged the same way for everyone.", 20);
v.page("new", { label: "Post a challenge" }).caption("Write the task and how it's judged");
v.camTo("new.form", { z: 1.35, dur: 0.8 });
v.move("new.title", { fx: 0.2, dur: 0.6, click: true }).type("new-filled", "new.title", 0.6);
v.move("new.task", { fx: 0.15, fy: 0.2, dur: 0.4, click: true }).type("new-filled", "new.task", 1.1);
v.move("new.rubric", { fx: 0.15, fy: 0.25, dur: 0.4, click: true }).type("new-filled", "new.rubric", 0.8);
v.camReset({ dur: 0.5 }).move("new.post", { dur: 0.5, click: true });
v.modal("new-confirm", "new-confirm.panel");
v.wait(0.6).move("new-confirm.ok", { dur: 0.5, click: true });
v.page("posted", { label: "Challenge" }).caption("Live for certified learners").ring("posted.title", 1.4).wait(1.4);

// 4. Recruit candidate
v.card("Recruit candidate", "Read the work, meet the best, send an offer.", 4);
v.page("subs", { label: "Challenge" }).caption("Work arrives, sorted by AI score");
v.camTo("subs.score", { z: 1.6, dur: 0.9, wait: true }).ring("subs.score", 1.4).wait(1.4);
v.caption("Invite the best to interview").camTo([313, 540, 675, 400], { z: 1.4, dur: 0.8 });
v.move("subs.date", { fx: 0.3, dur: 0.6, click: true }).type("subs-invite", "subs.date", 0.35);
v.move("subs.time", { fx: 0.3, dur: 0.35, click: true }).type("subs-invite", "subs.time", 0.3);
v.move("subs.link", { fx: 0.2, dur: 0.4, click: true }).type("subs-invite", "subs.link", 0.6);
v.camReset({ dur: 0.5 }).scroll(153, 0.5).move("subs.send", { dur: 0.45, click: true });
v.modal("invite-confirm", "invite-confirm.panel");
v.wait(0.5).move("invite-confirm.ok", { dur: 0.5, click: true });
v.page("invited", { keep: true }).caption("Interview booked. Then send an offer").ring("invited.interview", 1.2).wait(1.0);
v.move("invited.offer", { dur: 0.6, click: true });
v.modal("offer-confirm", "offer-confirm.panel");
v.wait(0.6).move("offer-confirm.ok", { dur: 0.5, click: true });
v.page("offered", { keep: true }).ring("offered.sent", 1.2).wait(0.9);
v.move("offered.name", { dur: 0.6, click: true });
v.page("candidate", { label: "Candidate" }).caption("Rate Min after the interview");
v.move("candidate.rate", { dur: 0.7, click: true });
v.modal("rate", "rate.panel");
v.move("rate.star5", { dur: 0.6, click: true }).show("rate-filled", { ref: [505, 283, 260, 70], dur: 0.2 });
v.move("rate.comment", { fx: 0.2, fy: 0.3, dur: 0.4, click: true }).type("rate-filled", "rate.comment", 0.8);
v.move("rate.send", { dur: 0.45, click: true });
v.page("rated", { keep: true }).caption("Bagan Apps found its frontend intern").ring("rated.rated", 1.6).sparkle("rated.rated", 1.6).wait(1.8);

v.end({ line: "Post a challenge. <b>Hire certified talent.</b>", pose: 22 });
v.save("tl-company.js");
