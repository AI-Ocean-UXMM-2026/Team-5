import assert from "node:assert/strict";
import test from "node:test";
import { keepApplicable, NOTHING, OTHER, skillsForRoadmap, toggleChip } from "./skills.ts";

test("Nothing yet clears the other chips, and another chip clears it", () => {
  const html = toggleChip([], "html");
  assert.deepEqual(toggleChip(html, NOTHING), [{ id: NOTHING, level: "little" }]);
  assert.deepEqual(toggleChip([{ id: NOTHING, level: "little" }], "css"), [{ id: "css", level: "little" }]);
  assert.deepEqual(toggleChip(html, "html"), []);
});

test("a new goal keeps only chips that still apply", () => {
  const picked = [
    { id: "html", level: "comfortable" as const },
    { id: "computer", level: "little" as const },
    { id: OTHER, level: "little" as const },
  ];
  const kept = keepApplicable(picked, new Set(["computer", "figma"]));
  assert.deepEqual(kept.map((item) => item.id), ["computer", OTHER]);
});

test("a custom skill stays within 40 characters", () => {
  const text = skillsForRoadmap([{ id: OTHER, level: "little" }], () => "", "x".repeat(50));
  assert.equal(text, `${"x".repeat(40)} (a little)`);
});

test("the roadmap gets skill names and levels, not a typed paragraph", () => {
  const text = skillsForRoadmap(
    [
      { id: "html", level: "little" },
      { id: "css", level: "comfortable" },
    ],
    (id) => id.toUpperCase(),
    "",
  );
  assert.equal(text, "HTML (a little), CSS (comfortable)");
  assert.equal(skillsForRoadmap([{ id: NOTHING, level: "little" }], () => "", "ignored"), "Nothing yet. Starting fresh.");
});
