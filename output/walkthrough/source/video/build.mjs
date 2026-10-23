// Timeline builder. A flow script calls these in order; `T` is the running time in seconds.
// Coordinates: "page" = the captured page (1440 wide); "view" = the 1440x900 browser viewport after scrolling.
import { readFileSync, writeFileSync } from "node:fs";

export const VW = 1440, VH = 900;
export const CARD = 2.0; // chapter card length

export class Video {
  constructor(name, shotsDir, steps) {
    this.name = name;
    this.shotsDir = shotsDir;
    this.m = JSON.parse(readFileSync(`${shotsDir}/manifest.json`, "utf8"));
    this.steps = steps; // chapter titles, for the progress row
    this.T = 0;
    this.pages = []; this.cam = [{ t0: 0, t1: 0, cx: VW / 2, cy: VH / 2, z: 1 }];
    this.cursor = []; this.clicks = []; this.captions = []; this.cards = []; this.rings = []; this.fx = [];
    this.layerId = 0; this.cur = null; this.chapter = 0; this.pendingCard = null;
    this.problems = [];
  }
  shot(name) { const s = this.m[name]; if (!s) throw new Error(`no shot ${name}`); return s; }
  // "shot.key" -> page box; arrays pass through.
  box(ref) {
    if (Array.isArray(ref)) return ref;
    const [shot, key] = ref.split(".");
    const b = this.shot(shot).boxes[key];
    if (!b) { this.problems.push(`missing box ${ref}`); return [600, 400, 200, 60]; }
    return b;
  }
  scrollAt(page, t) {
    const k = page.scroll; let y = k[0][1];
    for (const [a, b, from, to] of k.slice(1)) { if (t >= b) y = to; else if (t > a) { const p = (t - a) / (b - a); y = from + (to - from) * ease(p); break; } else break; }
    return y;
  }
  wait(s) { this.T += s; return this; }

  // Chapter card; the next page() starts hidden under it.
  card(title, sub, pose) {
    this.chapter++;
    this.cards.push({ t0: this.T, t1: this.T + CARD, n: this.chapter, of: this.steps.length, title, sub, pose });
    this.pendingCard = this.T;
    this.cam.push({ t0: this.T + 0.45, t1: this.T + 0.46, cx: VW / 2, cy: VH / 2, z: 1 });
    this.T += CARD - 0.35;
    return this;
  }
  caption(text) { this.captions.push({ t: this.T, chip: `Step ${this.chapter} of ${this.steps.length} · ${this.steps[this.chapter - 1]}`, text }); return this; }

  // A new screen (navigation). base: shot name. Full shots pin the sidebar/header from "<base>~v".
  // keep: the same screen in a new state (e.g. taller after an upload), so keep the scroll and don't slide.
  page(base, { fade = 0.34, label, keep = false } = {}) {
    const s = this.shot(base);
    let t0 = this.T;
    if (this.pendingCard !== null) { t0 = this.pendingCard + 0.45; fade = 0.01; this.pendingCard = null; }
    const chrome = s.kind === "full" && this.m[`${base}~v`] ? `${base}~v` : null;
    if (this.cur) this.cur.tEnd = t0 + fade;
    const y0 = keep && this.cur ? this.scrollAt(this.cur, t0) : 0;
    if (keep && this.cur && !label) label = this.cur.label;
    if (keep) fade = Math.min(fade, 0.3);
    const p = { id: this.pages.length, base, chrome, t0, fade, still: keep, tEnd: 1e9, label: label ?? "", h: s.h, scroll: [[t0, y0]], layers: [] };
    this.pages.push(p); this.cur = p;
    if (fade > 0.05) this.T = t0 + fade * 0.6;
    return this;
  }
  // Scroll the current page to y (or so a box sits near the top).
  scroll(target, dur = 0.9, offset = 140) {
    const p = this.cur;
    let y = typeof target === "number" ? target : this.box(target)[1] - offset;
    y = Math.max(0, Math.min(p.h - VH, Math.round(y)));
    const from = this.scrollAt(p, this.T);
    p.scroll.push([this.T, this.T + dur, from, y]);
    this.T += dur;
    return this;
  }
  view(ref, t = this.T) { const b = this.box(ref); const y = this.scrollAt(this.cur, t); return [b[0], b[1] - y, b[2], b[3]]; }

  // Camera: zoom to a box (view coords), or back to the full screen.
  camTo(ref, { z, dur = 0.9, wait = false, t } = {}) {
    const t0 = t ?? this.T;
    let cx = VW / 2, cy = VH / 2, zz = 1;
    if (ref) {
      const [x, y, w, h] = this.view(ref, t0 + dur);
      zz = z ?? Math.min(1.9, (0.86 * VW) / w, (0.78 * VH) / h);
      zz = Math.max(1, zz);
      cx = x + w / 2; cy = y + h / 2;
    }
    this.cam.push({ t0, t1: t0 + dur, cx, cy, z: zz });
    if (wait) this.T = t0 + dur;
    return this;
  }
  camReset(o = {}) { return this.camTo(null, o); }

  // Cursor glides to a box (where on it: fx/fy fractions), then optionally clicks.
  move(ref, { dur = 0.6, fx = 0.5, fy = 0.5, click = false } = {}) {
    const [x, y, w, h] = this.view(ref, this.T + dur);
    this.cursor.push({ t0: this.T, t1: this.T + dur, x: x + w * fx, y: y + h * fy });
    this.T += dur;
    if (click) this.click();
    return this;
  }
  click() { this.clicks.push(this.T); this.T += 0.25; return this; }

  // Layers on the current page.
  layer(shot, o) {
    const s = this.shot(shot);
    const L = { id: this.layerId++, shot, fixed: s.kind === "view" && o.fixed !== false, top: s.scroll, h: s.h, t0: this.T, tEnd: 1e9, out: 0.25, ...o };
    if (L.ref) { const b = this.box(L.ref); L.clip = L.fixed ? [b[0], b[1] - s.scroll, b[2], b[3]] : [b[0], b[1] - (s.kind === "view" ? s.scroll : 0), b[2], b[3]]; delete L.ref; }
    if (L.hole) { const b = this.box(L.hole); L.hole = [b[0], b[1] - s.scroll, b[2], b[3]]; }
    this.cur.layers.push(L);
    return L;
  }
  // Types into a field: reveals the "after" shot inside the field box, line by line.
  type(shot, ref, dur = 1.0) { this.layer(shot, { ref, effect: "type", dur }); this.T += dur + 0.1; return this; }
  // Shows part (ref) or all of a shot. effect: fade | pop | slide
  show(shot, { ref, effect = "fade", dur = 0.35, wait = true, hole } = {}) {
    const L = this.layer(shot, { ref, effect, dur, hole });
    if (wait) this.T += dur;
    this.last = L; // the layer, for hide()
    return this;
  }
  // A dialog: dims the page and pops the dialog in. Returns both layers so they can be closed.
  modal(shot, dialogRef = `${shot}.dialog`) {
    const back = this.layer(shot, { effect: "fade", dur: 0.25, hole: dialogRef });
    const dlg = this.layer(shot, { ref: dialogRef, effect: "pop", dur: 0.35 });
    this.T += 0.4;
    return [back, dlg];
  }
  hide(layers, dur = 0.25) { for (const L of [].concat(layers)) { L.tEnd = this.T; L.out = dur; } return this; }
  ring(ref, dur = 1.6, { t } = {}) { this.rings.push({ t0: t ?? this.T, t1: (t ?? this.T) + dur, box: this.view(ref, t ?? this.T) }); return this; }
  sparkle(ref, dur = 1.6) { this.fx.push({ type: "sparkle", t0: this.T, t1: this.T + dur, box: this.view(ref) }); return this; }
  confetti(dur = 2.4) { this.fx.push({ type: "confetti", t0: this.T, t1: this.T + dur }); return this; }
  end({ title, line, pose, dur = 4.5 }) {
    this.endCard = { t0: this.T, title, line, pose };
    this.T += dur;
    return this;
  }
  save(file) {
    if (this.problems.length) console.log("PROBLEMS:\n" + this.problems.join("\n"));
    const out = { name: this.name, dir: `../${this.shotsDir.split("/").pop()}`, duration: +this.T.toFixed(3), steps: this.steps, shots: this.m, pages: this.pages, cam: this.cam, cursor: this.cursor, clicks: this.clicks, captions: this.captions, cards: this.cards, rings: this.rings, fx: this.fx, endCard: this.endCard };
    writeFileSync(file, `window.TL = ${JSON.stringify(out)};\n`);
    console.log(`${this.name}: ${out.duration.toFixed(1)}s, ${this.pages.length} screens, ${this.pages.reduce((n, p) => n + p.layers.length, 0)} layers`);
  }
}
export const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
