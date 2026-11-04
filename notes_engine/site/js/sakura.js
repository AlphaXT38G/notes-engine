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
  return L;
};
let skL = skLight(12);
