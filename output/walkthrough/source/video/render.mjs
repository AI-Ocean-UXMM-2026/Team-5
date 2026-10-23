// node render.mjs <learner|company> stills t1,t2,...
// node render.mjs <learner|company> frames <fps> <from> <to>   (frame indexes, to exclusive)
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const [name, mode, a, b, c] = process.argv.slice(2);
const page = "file://" + resolve("stage.html") + "?v=" + name;
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 600);
const profile = mkdtempSync(join(tmpdir(), "walkr-"));
const proc = spawn(chrome, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--window-size=1920,1080", "--force-color-profile=srgb", "--allow-file-access-from-files", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d.error); pending.delete(d.id); } if (d.method === "Runtime.consoleAPICalled") console.log("page:", d.params.args.map((x) => x.value).join(" ")); if (d.method === "Runtime.exceptionThrown") console.log("page error:", d.params.exceptionDetails.exception?.description); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.value;
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: page });
await sleep(1500);
console.log("ready:", await js("window.ready"), "duration:", await js("window.TL.duration"));
const capture = async (t, file) => {
  await js(`window.renderAt(${t})`);
  await js("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))");
  const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(file, Buffer.from(r.data, "base64"));
};
if (mode === "eval") { await js(`window.renderAt(${a})`); console.log(await js(b)); }
else if (mode === "stills") {
  mkdirSync(`stills-${name}`, { recursive: true });
  for (const t of a.split(",").map(Number)) await capture(t, `stills-${name}/t${t.toFixed(2)}.png`);
} else if (mode === "pipe") {
  // Streams frames straight into ffmpeg, so no frame files are written. Output: seg-<name>-<from>.mp4
  const fps = Number(a), from = Number(b), to = Number(c);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high", `seg-${name}-${String(from).padStart(5, "0")}.mp4`], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((r) => ff.on("close", r));
  for (let i = from; i < to; i++) {
    await js(`window.renderAt(${i / fps})`);
    await js("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))");
    const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    if (!ff.stdin.write(Buffer.from(r.data, "base64"))) await new Promise((res) => ff.stdin.once("drain", res));
    if (i % 300 === 0) console.log(name, "frame", i);
  }
  ff.stdin.end(); console.log("ffmpeg exit", await done);
} else {
  const fps = Number(a), from = Number(b), to = Number(c);
  mkdirSync(`frames-${name}`, { recursive: true });
  for (let i = from; i < to; i++) { await capture(i / fps, `frames-${name}/${String(i).padStart(5, "0")}.png`); if (i % 150 === 0) console.log(name, "frame", i); }
}
ws.close(); proc.kill();
await sleep(800); rmSync(profile, { recursive: true, force: true });
