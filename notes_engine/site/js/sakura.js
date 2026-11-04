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