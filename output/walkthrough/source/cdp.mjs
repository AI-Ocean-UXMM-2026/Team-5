// Small CDP helper: drives the local app in headless Chrome and saves screens with the boxes of key elements.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const W = 1440, H = 900, K = "citadel-demo-v3";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function open(outDir) {
  mkdirSync(outDir, { recursive: true });
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const port = 9700 + Math.floor(Math.random() * 90);
  const proc = spawn(chrome, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "walk-"))}`, "--hide-scrollbars", "--force-color-profile=srgb", `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
  let target;
  for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page"); } catch {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d.error); pending.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) console.log("JS error:", r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result?.value; };
  const metrics = (h = H) => send("Emulation.setDeviceMetricsOverride", { width: W, height: h, deviceScaleFactor: 2, mobile: false });
  await metrics();
  // Hide the Next.js dev badge and the caret, so the screens look like the shipped app.
  const css = `nextjs-portal{display:none!important} *{caret-color:transparent!important} html{scroll-behavior:auto!important}`;
  await send("Page.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(css)};document.head.appendChild(s);});` });

  const go = async (path, wait = 2500) => { await send("Page.navigate", { url: `http://localhost:3000${path}` }); await sleep(wait); };
  // Boxes of named elements in page coordinates. Each value is a CSS selector, or "text:<tag>|<text>" to find by visible text.
  // A trailing "@<selector>" swaps the match for its closest ancestor matching that selector (to box a whole card).
  const boxes = (sel = {}) => js(`(() => { const out = {}; const find = (q) => { let up = null; const at = q.lastIndexOf('@'); if (at > 0) { up = q.slice(at + 1); q = q.slice(0, at); }
      let e; if (q.startsWith('label:')) { const t = q.slice(6); e = [...document.querySelectorAll('input,textarea,select')].find(i => i.labels?.[0]?.textContent.trim().startsWith(t)); } else if (q.startsWith('h:')) { const t = q.slice(2); e = [...document.querySelectorAll('h1,h2,h3,h4')].find(x => x.offsetParent !== null && x.textContent.trim().includes(t)); } else if (q.startsWith('text:')) { const [tag, t] = q.slice(5).split('|'); e = [...document.querySelectorAll(tag)].find(x => x.offsetParent !== null && x.textContent.trim().includes(t)); } else e = document.querySelector(q);
      return e && up ? e.closest(up) : e; };
    for (const [k, q] of Object.entries(${JSON.stringify(sel)})) { const e = find(q); if (!e) { out[k] = null; continue; } const r = e.getBoundingClientRect(); out[k] = [Math.round(r.left + scrollX), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]; }
    return out; })()`);
  const manifest = {};
  // full: the whole page at once (scroll 0). Otherwise the 900px viewport at the given scroll, which is recorded.
  const shot = async (name, sel = {}, { full = false, maxH = 5200, scroll = null } = {}) => {
    await js("document.activeElement?.blur?.()");
    await js(`[...document.querySelectorAll('p')].filter(p => p.textContent.trim() === 'Failed to fetch').forEach(p => { const root = p.parentElement; root.style.display = 'none'; const prev = root.previousElementSibling; if (prev && prev.textContent.trim().toLowerCase() === 'or') prev.style.display = 'none'; })`);
    let h = H;
    // A full-page shot also saves the plain viewport (name~v), whose sidebar and header stay pinned while the video scrolls.
    if (full) { await js("scrollTo(0, 0)"); await sleep(200); const v = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(outDir, `${name}~v.png`), Buffer.from(v.data, "base64")); manifest[`${name}~v`] = { kind: "view", w: W, h: H, scroll: 0, boxes: await boxes({ aside: "aside", header: "header" }), path: await js("location.pathname") }; }
    if (full) { h = await js(`Math.min(${maxH}, Math.max(${H}, document.documentElement.scrollHeight))`); await metrics(h); await js("scrollTo(0, 0)"); await sleep(500); }
    else if (scroll !== null) { await js(`scrollTo(0, ${scroll})`); await sleep(300); }
    await js("new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))");
    const b = await boxes({ aside: "aside", header: "header", ...sel });
    const y = full ? 0 : await js("Math.round(scrollY)");
    const r = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(outDir, `${name}.png`), Buffer.from(r.data, "base64"));
    if (full) { await metrics(); await sleep(300); }
    manifest[name] = { kind: full ? "full" : "view", w: W, h, scroll: y, boxes: b, path: await js("location.pathname") };
    const missing = Object.entries(b).filter(([k, v]) => !v && k !== "aside" && k !== "header").map(([k]) => k);
    console.log("shot", name, h, y, missing.length ? "MISSING " + missing.join(",") : "");
    writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 1));
  };
  // Types into a field found by its label (or a selector starting with "#"/"[" /"input"/"textarea"), like a person would.
  const type = async (field, text) => {
    const r = await js(`(() => { const f = ${JSON.stringify(field)}; const e = (/^[a-z#\\[.]/.test(f) ? document.querySelector(f) : null) || [...document.querySelectorAll('input,textarea')].find(i => i.labels?.[0]?.textContent.trim().startsWith(f)); if (!e) return 'NOT FOUND ' + f; e.focus(); e.select?.(); return 'ok'; })()`);
    if (r !== "ok") console.log(r);
    await send("Input.insertText", { text }); await sleep(150);
  };
  const upload = async (field, file) => {
    const id = await js(`[...document.querySelectorAll('input[type=file]')].find(i => i.labels?.[0]?.textContent.includes(${JSON.stringify(field)}))?.id`);
    const doc = await send("DOM.getDocument", { depth: -1, pierce: true });
    const q = await send("DOM.querySelector", { nodeId: doc.root.nodeId, selector: `[id="${id}"]` });
    await send("DOM.setFileInputFiles", { nodeId: q.nodeId, files: [file] }); await sleep(1200);
  };
  const click = (q) => js(`(() => { const q = ${JSON.stringify(q)}; let e; if (q.startsWith('text:')) { const [tag, t] = q.slice(5).split('|'); e = [...document.querySelectorAll(tag)].reverse().find(x => x.offsetParent !== null && x.textContent.trim().includes(t)); } else e = document.querySelector(q); if (!e) return 'NOT FOUND ' + q; e.click(); return 'ok'; })()`);
  const fill = (q, v) => js(`(() => { const e = document.querySelector(${JSON.stringify(q)}); if (!e) return 'NOT FOUND'; const proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : e.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, ${JSON.stringify(v)}); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok'; })()`);
  const patch = (fn) => js(`(() => { const st = JSON.parse(localStorage.getItem('${K}')); (${fn})(st); localStorage.setItem('${K}', JSON.stringify(st)); window.dispatchEvent(new StorageEvent('storage', { key: '${K}' })); return true; })()`);
  const state = () => js(`JSON.parse(localStorage.getItem('${K}'))`);
  // What's on the page: headings, buttons, inputs. For finding selectors.
  const dump = () => js(`JSON.stringify({ path: location.pathname, h: [...document.querySelectorAll('h1,h2,h3')].map(e=>e.textContent.trim()).slice(0,14), btn: [...document.querySelectorAll('button,a[href]')].filter(e=>e.offsetParent!==null).map(e=>e.textContent.trim().replace(/\\s+/g,' ').slice(0,40)).filter(Boolean).slice(0,50), inp: [...document.querySelectorAll('input,select,textarea')].map(e=>(e.tagName+':'+(e.type||'')+':'+(e.name||e.id)+':'+(e.labels?.[0]?.textContent.trim()||e.placeholder||'')).slice(0,70)) })`);
  const close = () => { ws.close(); proc.kill(); };
  return { send, js, go, shot, click, fill, patch, state, dump, boxes, close, metrics, type, upload };
}
