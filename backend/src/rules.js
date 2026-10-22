export const PASS_MARK = 0.7;

export function previewLessonCount(lessonCount, priceMmk) {
  if (priceMmk === 0) return lessonCount;
  return Math.max(1, Math.ceil(lessonCount * 0.25));
}

export function trackOpen({ priceMmk, entitled, certified }) {
  return priceMmk === 0 || entitled || certified;
}

export function lessonOpen(access, index) {
  return trackOpen(access) || index < previewLessonCount(access.lessonCount, access.priceMmk);
}

export function questionSelect(includeAnswer) {
  return includeAnswer ? "id, position, prompt, options, answer_index" : "id, position, prompt, options";
}

export function gradeAnswers(questions, answers) {
  if (!Array.isArray(answers) || questions.length === 0 || answers.length !== questions.length) return null;
  const results = questions.map((question, index) => ({
    correct: Number(answers[index]) === question.answer_index,
    answerIndex: question.answer_index,
  }));
  const correct = results.filter((result) => result.correct).length;
  return { correct, total: questions.length, perfect: correct === questions.length, results };
}

export function testScore(correct, total) {
  if (total <= 0) return null;
  const ratio = correct / total;
  const score = Math.round(ratio * 100);
  return { score, passed: ratio >= PASS_MARK && score >= 70 };
}

export function canSendOffer(interviewStatus) {
  return interviewStatus === "scheduled";
}

const youtubeId = /^[A-Za-z0-9_-]{11}$/;

export function youtubeVideoId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (youtubeId.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);
    let id = "";
    if (host === "youtu.be") id = parts[0] || "";
    else if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
      id = url.searchParams.get("v") || "";
      const marker = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live");
      if (!id && marker >= 0) id = parts[marker + 1] || "";
    }
    if (youtubeId.test(id)) return id;
  } catch {
    // Not a URL.
  }
  return undefined;
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_LIKE = /\+?\d[\d\s().-]{5,}\d/g;

// shortcut: any run of 7+ digits counts as a phone number, so long plain numbers are also blocked; upgrade to a phone parser if that annoys users.
export function hasContactDetails(text) {
  const value = String(text || "");
  return EMAIL.test(value) || (value.match(PHONE_LIKE) ?? []).some((match) => match.replace(/\D/g, "").length >= 7);
}
