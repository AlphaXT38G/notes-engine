const isSkDate = (d = new Date()) => d.getMonth() === 2 && d.getDate() >= 15 || d.getMonth() === 3 && d.getDate() <= 10;
// the day screen until 18:30, the end of the golden hour; then the night (lanterns, fireflies, the pink moon)
const isSkDaytime = () => { const t = clockSeconds(); return t >= 7 * 3600 && t < 18.5 * 3600; };
const skSubtitle = () => {
  const d = new Date(), m = d.getMonth(), day = d.getDate();
  if (!isSkDate(d)) return "Hanami, whatever the season. Revise under the blossoms.";
  if (m === 2 && day < 25) return "The first blossoms open. So do the notes.";
  if (m === 3 && day > 4) return "The petals fall. Revise before the last one does.";
  return "Full bloom. Hanami season: revise under the blossoms.";
};
SCREENS.sakura = { className: "sakura", subtitle: skSubtitle, transition: "sakura" };
SCREENS["sakura-night"] = { className: "sakura", subtitle: () => "Yozakura: the blossoms by lantern light. " + skSubtitle(), transition: "sakura" };

// Sakura replaces the day, the calm night and the jazz bar, as Christmas and Halloween do (the three
// periods never meet). This file is loaded after halloween.js and before armstrong.js and calm.js,
// so the yeti and boo codes typed after kojiro win (they clear skEgg), and the armstrong and peace
// codes too, and the shows of the clock.
// Easter egg: typing k o j i r o brings the sakura screen at any time of the year, day or night by
// the clock, over Christmas and Halloween too; outside the period, typed again on it it goes back
// to the normal screen. It drops the other screens' eggs; yeti or boo typed after it wins.
let skEgg = false, skEggYeti = 0;
OVERRIDES.push(phase => {
  if (skEgg && yetiTyped !== skEggYeti) skEgg = false;
  const cls = screenClass(phase);
  const replaced = isNormal(phase) || cls === "night" || skEgg && (cls === "christmas" || cls === "halloween");
  if (!replaced || !(skEgg || (!forced || forcedDismissed) && isSkDate())) return phase;
  return isSkDaytime() ? "sakura" : "sakura-night";
});
onCode("kojiro", () => {
  leaveShows();  // typed during a show, it ends it first (epic.js)
  const onSk = document.body.classList.contains("sakura");
  if (onSk && isSkDate()) return;  // it is the season anyway
  skEgg = !onSk;
  skEggYeti = yetiTyped;
  jazzEgg = peaceEgg = xmasEgg = hwEgg = false;
  if (onSk && forced && forced.startsWith("sakura")) forcedDismissed = true;
  applyScreen();
});

// ── Shared helpers ──
const skStill = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const skNight = () => document.body.dataset.phase === "sakura-night";
const skClamp = (v, a, b) => v < a ? a : v > b ? b : v;
const skMix = (a, b, t) => a + (b - a) * t;
const skSmooth = (a, b, v) => { const t = skClamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// Same pseudo-random numbers on every visit (the tree grows the same way): a seeded generator
const skRand = seed => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const skP = n => Math.round(n * 10) / 10;  // one decimal is plenty for coordinates
const skHex = c => [parseInt(c.slice(1, 3), 16) / 255, parseInt(c.slice(3, 5), 16) / 255, parseInt(c.slice(5, 7), 16) / 255];
const skRgb = (c, k = 1, a = 1) => `rgba(${Math.round(skClamp(c[0] * k, 0, 1) * 255)},${Math.round(skClamp(c[1] * k, 0, 1) * 255)},${Math.round(skClamp(c[2] * k, 0, 1) * 255)},${a})`;

// ── The light of the hour ──
// skHour(): the hour shown, fractional. The clock's, except that a forced day screen at night shows
// a morning (and a forced night by day, the late night), and ?skhour=17.5 sets it (to try the light
// of any hour: documented in AGENTS.md).
const skHourParam = (q => q !== null && q !== "" && isFinite(+q) ? +q % 24 : null)(new URLSearchParams(location.search).get("skhour"));
const skHour = () => {
  if (skHourParam !== null) return skHourParam;
  const h = clockSeconds() / 3600;
  const day = h >= 7 && h < 18.5;  // as isSkDaytime: the day screen keeps its golden hour
  if (document.body.dataset.phase === "sakura" && !day) return 10.5;
  if (skNight() && day) return 23;
  return h;
};
// The palette through the day: keyframes of the sky (top, middle, horizon), the haze (fog colour
// and how thick), how much it is night (stars, lanterns, the tint of the land), the warmth of the
// low sun (rays: 1 a golden light, more pushes it further). Interpolated by skLight(hour). The
// golden hour runs from 17:30 to 18:30, warmer and warmer; at 18:45 it is night.
const SK_KEYS = [
  //  hour  sky top    sky mid    horizon    fog        haze night rays
  [0,     "#05030e", "#120922", "#2e1438", "#3a2450", .45, 1,    0],
  [4.6,   "#06040f", "#140a26", "#30163a", "#3a2450", .45, 1,    0],
  [5.6,   "#1e1a3e", "#5c3c6e", "#e89aa4", "#7a5a78", .55, .6,   0],
  [6.6,   "#5a78b2", "#e6b0bc", "#ffd2ac", "#e8c8c8", .7,  0,    .5],
  [8.6,   "#9cc0e2", "#e4e2ec", "#f4ece6", "#efe9ec", .8,  0,    .2],
  [12,    "#4c8cd8", "#a8ccf0", "#e6eff6", "#dde6f0", .4,  0,    0],
  [15.4,  "#588cd0", "#b6cfea", "#f4e8da", "#ece2dc", .4,  0,    .3],
  [17,    "#6a7ab8", "#e8b89a", "#ffd8a8", "#f0d0b0", .45, 0,    .6],
  [17.5,  "#5a5aa8", "#ff9a6a", "#ffc070", "#ffb080", .55, 0,    1.4],
  [18.1,  "#3a2a70", "#e8607a", "#ff8a40", "#d87070", .55, .15,  1.7],
  [18.5,  "#1a1240", "#5a2a5a", "#b04a50", "#5a3050", .5,  .7,   .5],
  [18.8,  "#05030e", "#120922", "#2e1438", "#3a2450", .45, 1,    0],
  [21,    "#05030e", "#120922", "#2e1438", "#3a2450", .45, 1,    0],
  [24,    "#05030e", "#120922", "#2e1438", "#3a2450", .45, 1,    0],
].map(k => ({ h: k[0], top: skHex(k[1]), mid: skHex(k[2]), hor: skHex(k[3]), fog: skHex(k[4]), haze: k[5], night: k[6], rays: k[7] }));
const skLight = hour => {
  let i = 0;
  while (i < SK_KEYS.length - 2 && SK_KEYS[i + 1].h <= hour) i++;
  const a = SK_KEYS[i], b = SK_KEYS[i + 1], t = skSmooth(0, 1, (hour - a.h) / (b.h - a.h));
  const c = (x, y) => x.map((v, j) => skMix(v, y[j], t));
  const L = {
    hour, top: c(a.top, b.top), mid: c(a.mid, b.mid), hor: c(a.hor, b.hor), fog: c(a.fog, b.fog),
    haze: skMix(a.haze, b.haze, t), night: skMix(a.night, b.night, t), rays: skMix(a.rays, b.rays, t),
  };
  // The sun: rises on the left at 06:20, high above the screen at noon, sets on the right behind the
  // tree at 19:00. Positions are fractions of the window (x from the left, y from the bottom).
  const s = (hour - 6.3) / 12.7;
  L.sunVis = skSmooth(-.02, .04, s) * (1 - skSmooth(.96, 1.02, s));
  L.sun = [skMix(.1, .84, skClamp(s, 0, 1)), .36 + .95 * Math.sin(Math.PI * skClamp(s, 0, 1))];
  // The moon (pink, huge): up from 18:35 to 05:35, in the left margin, climbing slowly
  const m = ((hour + 24 - 18.6) % 24) / 11;  // 0 at moonrise, 1 at its setting
  L.moonVis = m < 1 ? skSmooth(0, .08, m) * (1 - skSmooth(.9, 1, m)) : 0;
  L.moonUp = m < 1 ? Math.sin(Math.PI * m) : 0;
  return L;
};
let skL = skLight(12);

// ── Layout: the window's size (the layers are placed by skscene.js) ──
const skLay = { W: 0, H: 0 };
const skLayout = () => { skLay.W = innerWidth; skLay.H = innerHeight; };

// ── Wind and parallax ──
// skWind: 0 calm to 1 a strong gust; a breeze that wanders, gusts now and then (skGust), and the
// pointer moving fast stirs it a little. skPar: the pointer and the scroll, eased, -1..1 / 0..1,
// for the planes to slide (the nearest the most).
let skWind = .25, skGustT = 0, skGustK = 0, skGustIn = 14;
const skGust = (k = 1) => { skGustK = Math.max(skGustK, k); skGustT = 0; };
const skPar = { x: 0, y: 0, tx: 0, ty: 0 };
const skPointer = { x: -1, y: -1, vx: 0, vy: 0, t: 0 };
const skOnMove = e => {
  const now = performance.now(), dt = Math.max(8, now - skPointer.t);
  if (skPointer.x >= 0) {
    skPointer.vx = skMix(skPointer.vx, (e.clientX - skPointer.x) / dt * 1000, .3);
    skPointer.vy = skMix(skPointer.vy, (e.clientY - skPointer.y) / dt * 1000, .3);
  }
  skPointer.x = e.clientX; skPointer.y = e.clientY; skPointer.t = now;
  skPar.tx = (e.clientX / skLay.W - .5) * 2;
  skHover(e);
};

// ── Sounds ──
// One Web Audio context for the screen's sounds (the wind chime, the sword, the shamisen...), made at
// the first sound and resumed if the page had no gesture yet
let skAudio = null;
const skAudioCtx = () => {
  if (!skAudio && window.AudioContext) skAudio = new AudioContext();
  if (skAudio && skAudio.state === "suspended") skAudio.resume().catch(() => {});
  return skAudio;
};
const skOut = () => {
  const ac = skAudioCtx();
  if (!ac || !screenGesture()) return null;
  if (!ac.skBus) { ac.skBus = ac.createGain(); ac.skBus.gain.value = .8; ac.skBus.connect(ac.destination); }
  return ac;
};
// A burst of noise through a filter (wind, a swish, the bamboo's knock)
const skNoise = (secs, freq, type = "bandpass", gain = .3, delay = 0, q = 1, shape = 2) => {
  const ac = skOut();
  if (!ac) return;
  const n = Math.round(ac.sampleRate * secs), buf = ac.createBuffer(1, n, ac.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, shape);
  const src = ac.createBufferSource(), filter = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = buf;
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ac.skBus);
  src.start(ac.currentTime + delay);
};
// A tone with a quick attack and an exponential decay (bells, plucked strings, birds' notes)
const skTone = (freq, secs, { type = "sine", gain = .15, delay = 0, attack = .005, glide = 0 } = {}) => {
  const ac = skOut();
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + delay;
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t0 + secs);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(.0001, t0 + secs);
  o.connect(g).connect(ac.skBus);
  o.start(t0);
  o.stop(t0 + secs + .05);
};

// ── Speech ──
// A short line said by the samurai (or someone of the scene), brushed in a paper bubble at a point
// of the screen, gone after a few seconds
const skSay = (x, y, text, ms = 2800) => {
  const bubble = document.createElement("span");
  bubble.className = "sksay";
  bubble.textContent = text;
  bubble.style.left = `${Math.round(x)}px`;
  bubble.style.top = `${Math.round(y)}px`;
  skFront.append(bubble);
  setTimeout(() => bubble.classList.add("gone"), ms);
  setTimeout(() => bubble.remove(), ms + 600);
};

// ── Clicks on the scene ──
// The scene is behind the page, click-through: a click that lands on the page's background (not on
// a card, the header, a link or a control) is tested against what registered here, from the front
// (the last registered) to the back. A hit is { test(x, y), click(x, y), title }; the pointer
// becomes a hand over one.
const SK_HITS = [];
const skHit = hit => SK_HITS.push(hit);
const skFree = el => !el || !el.closest || !el.closest("section, header, footer, a, button, input, label, summary, #empty, .tapes, [data-skblock]");
const skHitAt = (x, y) => {
  for (let i = SK_HITS.length - 1; i >= 0; i--) if (SK_HITS[i].test(x, y)) return SK_HITS[i];
  return null;
};
// Whether a point of the screen is on the painted part of a layer (not on its transparent
// margins): the image's alpha, read once into a small copy (a quarter of its size)
const skAlphaMap = img => {
  if (img.skMap !== undefined) return img.skMap;
  if (!img.complete || !img.naturalWidth) return null;
  const c = document.createElement("canvas"), w = c.width = Math.max(1, img.naturalWidth >> 2), h = c.height = Math.max(1, img.naturalHeight >> 2);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0, w, h);
  try { img.skMap = { w, h, data: g.getImageData(0, 0, w, h).data }; } catch (e) { img.skMap = null; }  // a tainted image: its box only
  return img.skMap;
};
const skOpaqueAt = (img, x, y, min = 80) => {
  if (!img || !img.isConnected) return false;
  const r = img.getBoundingClientRect();
  if (x < r.left || x >= r.right || y < r.top || y >= r.bottom) return false;
  const m = skAlphaMap(img);
  if (!m) return true;
  const px = Math.min(m.w - 1, ((x - r.left) / r.width * m.w) | 0), py = Math.min(m.h - 1, ((y - r.top) / r.height * m.h) | 0);
  return m.data[(py * m.w + px) * 4 + 3] > min;
};
// The painted layer seen at a point: the front-most one painted there (the scene's layers are in
// the page in the order they are painted), so a click on the knoll is the knoll's, not the tree's
// behind it. The lights and the mist are left out (one sees through them).
const skTopAt = (x, y) => {
  const layers = skBack.querySelectorAll("img.skl:not(.skveins):not(.sklights)");
  for (let i = layers.length - 1; i >= 0; i--) if (skOpaqueAt(layers[i], x, y)) return layers[i];
  return null;
};
// Whether img is what is seen at that point
const skSeenAt = (img, x, y) => !!img && skTopAt(x, y) === img;
let skHovered = null;
const skHover = e => {
  const hit = skFree(e.target) ? skHitAt(e.clientX, e.clientY) : null;
  if (hit === skHovered) return;
  skHovered = hit;
  root.classList.toggle("skhand", !!hit);
  document.body.title = hit && hit.title || "";
};
const skOnClick = e => {
  if (e.button || !skFree(e.target)) return;
  const hit = skHitAt(e.clientX, e.clientY);
  if (hit) hit.click(e.clientX, e.clientY);
};

// ── Teasing the samurai ──
// Each tease (a click on him) is counted for 30 s; at the third he stands, draws and challenges us
// (sksamurai.js: skProvoked). A duel will start there: skDuel, null until a duel file (later, like
// the snowman's fight, sansfight.js) sets it to a function that starts the fight and calls back
// when it ends (skDuel(onEnd)).
let skTeases = [], skDuel = null;
const skTease = () => {
  const now = performance.now();
  skTeases = skTeases.filter(t => now - t < 30000);
  skTeases.push(now);
  if (skTeases.length < 3) return skTeases.length;
  skTeases = [];
  if (typeof skProvoked === "function") skProvoked();
  return 3;
};

// ── The two layers, the parts, the loop ──
const skBack = document.createElement("div"), skFront = document.createElement("div");
skBack.id = "skscene";
skFront.id = "skfront";
skBack.setAttribute("aria-hidden", "true");
const SK_PARTS = [];
// A part is { on(), off(), night(isNight), resize(), light(), frame(dt, t) }, all optional
const skPart = part => SK_PARTS.push(part);
let skOn = false, skRaf = null, skLast = 0, skWasNight = null, skLightAt = -1;
const skEach = (fn, ...args) => SK_PARTS.forEach(p => { if (p[fn]) p[fn](...args); });

const skFrame = now => {
  const dt = Math.max(0, Math.min(.05, (now - skLast) / 1000));
  skLast = now;
  const t = now / 1000;
  // The wind: a wandering breeze, a gust when one comes, the pointer's speed
  skGustT += dt;
  const gust = skGustK * Math.sin(Math.PI * skClamp(skGustT / 4, 0, 1));
  if (skGustT > 4) skGustK = 0;
  const stir = skClamp(Math.hypot(skPointer.vx, skPointer.vy) / 4000, 0, .3);
  skPointer.vx *= .9; skPointer.vy *= .9;
  skWind = skMix(skWind, .22 + .12 * Math.sin(t * .23) * Math.sin(t * .071 + 1) + gust * .7 + stir, Math.min(1, dt * 2));
  // The parallax, eased: the pointer's side and the scroll
  skPar.ty = skClamp(scrollY / Math.max(1, document.documentElement.scrollHeight - skLay.H), 0, 1);
  skPar.x = skMix(skPar.x, skPar.tx, Math.min(1, dt * 1.5));
  skPar.y = skMix(skPar.y, skPar.ty, Math.min(1, dt * 3));
  skEach("frame", dt, t);
  skRaf = requestAnimationFrame(skFrame);
};
const skStart = () => {
  if (skRaf) return;
  skLast = performance.now();
  skRaf = requestAnimationFrame(skFrame);
};
const skStop = () => { cancelAnimationFrame(skRaf); skRaf = null; };
// With reduced motion the scene is drawn once (and again when the light changes), nothing moves
const skDrawStill = () => { if (skOn && skStill()) skEach("frame", 0, performance.now() / 1000); };

const skResize = () => {
  skLayout();
  skEach("resize");
  skDrawStill();
};
const skRelight = force => {
  const h = skHour();
  // the light changes slowly: the parts are relit every 2 minutes of the hour (or at once if forced)
  if (!force && Math.abs(h - skLightAt) < 1 / 30 && Math.abs(h - skLightAt) < 23) return;
  skLightAt = h;
  skL = skLight(h);
  skEach("light");
  skDrawStill();
};
everySecond.push(() => {
  if (!skOn) return;
  skRelight(false);
  if (!skStill() && !document.hidden && --skGustIn <= 0) { skGust(.6 + Math.random() * .5); skGustIn = 18 + Math.random() * 40; }
});
const skVisible = () => {
  if (!skOn) return;
  if (document.hidden || skStill()) skStop(); else skStart();
};

const setSakura = on => {
  if (on === skOn) return;
  skOn = on;
  if (on) {
    skLayout();
    document.body.prepend(skBack);
    document.body.append(skFront);
    skLightAt = -1;
    skL = skLight(skHour());
    skEach("on");
    skEach("resize");
    skEach("light");
    skWasNight = null;
    addEventListener("resize", skResize);
    addEventListener("pointermove", skOnMove, { passive: true });
    document.addEventListener("click", skOnClick);
    document.addEventListener("visibilitychange", skVisible);
    skVisible();
    skDrawStill();
  } else {
    skStop();
    removeEventListener("resize", skResize);
    removeEventListener("pointermove", skOnMove);
    document.removeEventListener("click", skOnClick);
    document.removeEventListener("visibilitychange", skVisible);
    skEach("off");
    skBack.remove();
    skFront.remove();
    root.classList.remove("skhand");
    document.body.title = "";
    skHovered = null;
  }
};
document.addEventListener("sakura", e => setSakura(e.detail));
document.addEventListener("phase", () => {
  if (!skOn || skNight() === skWasNight) return;
  skWasNight = skNight();
  skRelight(true);
  skEach("night", skWasNight);
});
