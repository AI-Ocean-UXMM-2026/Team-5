import { existsSync, readFileSync } from "node:fs";

export function loadEnv() {
  const path = new URL("../.env", import.meta.url);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const split = trimmed.indexOf("=");
    if (split < 0) continue;
    const key = trimmed.slice(0, split).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(split + 1).trim();
  }
}
