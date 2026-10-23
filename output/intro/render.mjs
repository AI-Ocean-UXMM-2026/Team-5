// node render.mjs stills <t1,t2,...>   or   node render.mjs frames <fps> <seconds>
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [mode, a, b] = process.argv.slice(2);
const page = "file://" + resolve("index.html");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9950 + Math.floor(Math.random() * 40);
const proc = spawn(chrome, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "intro-"))}`, "--hide-scrollbars", "--window-size=1920,1080", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d.error); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.value;
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: page });
await sleep(1500);
console.log("ready:", await js("window.ready"), "font:", await js(`document.fonts.check('600 34px "Plus Jakarta Sans"')`));
const capture = async (t, file) => {
  await js(`window.renderAt(${t})`);
  await js("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))");
  const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(file, Buffer.from(r.data, "base64"));
};
if (mode === "stills") {
  mkdirSync("stills", { recursive: true });
  for (const t of a.split(",").map(Number)) await capture(t, `stills/t${t.toFixed(2)}.png`);
} else {
  const fps = Number(a), secs = Number(b), n = Math.round(fps * secs);
  mkdirSync("frames", { recursive: true });
  for (let i = 0; i < n; i++) await capture(i / fps, `frames/${String(i).padStart(4, "0")}.png`);
  console.log("frames:", n);
}
ws.close(); proc.kill();
