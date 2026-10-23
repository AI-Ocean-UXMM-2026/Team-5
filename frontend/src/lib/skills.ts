export type SkillLevel = "little" | "comfortable";

export type PickedSkill = { id: string; level: SkillLevel };

export const NOTHING = "nothing";
export const OTHER = "other";

const HOURS = [2, 5, 10, 15];

/** 15+ is stored as 15. The AI route only accepts an integer. */
export function studyHours(value: number) {
  return HOURS.includes(value) ? value : 5;
}

export function toggleChip(picked: PickedSkill[], id: string): PickedSkill[] {
  if (id === NOTHING) return picked.some((item) => item.id === NOTHING) ? [] : [{ id: NOTHING, level: "little" }];
  const rest = picked.filter((item) => item.id !== NOTHING);
  if (rest.some((item) => item.id === id)) return rest.filter((item) => item.id !== id);
  return [...rest, { id, level: "little" }];
}

export function setChipLevel(picked: PickedSkill[], id: string, level: SkillLevel): PickedSkill[] {
  return picked.map((item) => (item.id === id ? { ...item, level } : item));
}

/** A new goal keeps chips that still belong to it, plus Nothing yet and Something else. */
export function keepApplicable(picked: PickedSkill[], allowed: Set<string>): PickedSkill[] {
  return picked.filter((item) => item.id === NOTHING || item.id === OTHER || allowed.has(item.id));
}

export function skillsForRoadmap(
  picked: PickedSkill[],
  labelOf: (id: string) => string,
  otherText: string,
) {
  if (picked.some((item) => item.id === NOTHING)) return "Nothing yet. Starting fresh.";
  const words = (level: SkillLevel) => (level === "comfortable" ? "comfortable" : "a little");
  const parts = picked
    .filter((item) => item.id !== OTHER)
    .map((item) => `${labelOf(item.id)} (${words(item.level)})`);
  const extra = otherText.trim().slice(0, 40);
  const other = picked.find((item) => item.id === OTHER);
  if (other && extra) parts.push(`${extra} (${words(other.level)})`);
  return parts.join(", ");
}

export function profileSkillNames(picked: PickedSkill[], labelOf: (id: string) => string, otherText: string) {
  if (picked.some((item) => item.id === NOTHING)) return [];
  const names = picked.filter((item) => item.id !== OTHER).map((item) => labelOf(item.id));
  const extra = otherText.trim().slice(0, 40);
  if (picked.some((item) => item.id === OTHER) && extra) names.push(extra);
  return names;
}

export function coachStep(goal: string, pickedCount: number, hours: number | null) {
  if (!goal) return "goal" as const;
  if (hours == null && pickedCount === 0) return "chosen" as const;
  if (hours == null) return "skills" as const;
  return "ready" as const;
}
