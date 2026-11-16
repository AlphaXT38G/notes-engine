// ── Christmas (screens "christmas" and "christmas-night", body.christmas) ─────────────────────
// From December 1 to January 3 the usual looks are replaced by Christmas (css/christmas.css):
// the day screen from 6:00 to 18:00, the night screen from 18:00 to 6:00. Typing "yeti" brings
// them at any time of the year. Both screens have:
//   - a garland across the top (lit at night),
//   - snow falling on the effects canvas (fx.js),
//   - a winter scene behind the page: big discreet mountains, a decorated tree on the right with
//     gifts, a snowman companion on the left (and at night the moon and chalet lights),
//   - a Christmas turntable playing Jingle Bell Rock or Lofi Girl's Christmas mix (xmusic.js),
//   - a small golden sax hidden among the tree's ornaments, which opens the jazz bar (as the
//     armstrong code), a red guitar standing behind the gifts, which starts the metal show, and a
//     firefly jar swinging under the garland, which opens the calm night (as the peace code).
// At night the tree lights play changing patterns and Santa's sleigh crosses the sky now and then.
// The metal show at 1:00 and the other easter eggs still take over.
//
// In this file, in order: screens and override, the yeti code, shared helpers, the garland, the
// bow, the tag and the gifts, the tree and its sax ornament, the guitar, the jar, the mountains, the
// moon, the snowman, the sax, guitar and jar buttons, the tree lights canvas, the snow, the sleigh,
// the jar's pendulum, and turning it all on and off.
// Every drawing is SVG built once from code (seeded random, so it looks the same on every visit).
const xmasSubtitle = () => {
  const d = new Date(), m = d.getMonth(), day = d.getDate();
  if (m === 11 && day < 24) return `${25 - day} days until Christmas. Revise by the tree.`;
  if (m === 11 && day === 24) return "Christmas Eve. One last chapter before the presents.";
  if (m === 11 && day === 25) return "Merry Christmas! The notes can wait until tomorrow.";
  if (m === 11 && day === 31) return "New Year's Eve. Last revisions of the year.";
  if (m === 0 && day <= 3) return `Happy New Year ${d.getFullYear()}! Exams are coming.`;
  return "Happy holidays, and good luck with the exams.";
};
SCREENS.christmas = { className: "christmas", subtitle: xmasSubtitle, transition: "christmas" };
SCREENS["christmas-night"] = { className: "christmas", subtitle: xmasSubtitle, transition: "christmas" };

// Christmas replaces the day, the calm night and the jazz bar, not the shows: the override only
// rewrites the normal screens (no screen, the calm night, see isNormal) and the jazz screens, and
// it runs before the metal and epic ones (this file is loaded before metal.js), so those still
// win. A forced ?screen=... is left alone (?screen=christmas and ?screen=christmas-night force these
// screens), unless the yeti code was typed (xmasEgg).
const isXmasDate = (d = new Date()) => d.getMonth() === 11 || (d.getMonth() === 0 && d.getDate() <= 3);  // all December, and Jan 1 - 3
const isXmasDaytime = () => { const t = clockSeconds(); return t >= 6 * 3600 && t < 18 * 3600; };
// Easter egg: typing y e t i (outside the search field, or in it then Enter: onCode, ui.js) brings
// Christmas at any time of the year, day or night by the clock as usual, for the rest of the visit,
// over every screen (typed during a show, it ends it first: leaveShows, epic.js). Outside the
// Christmas period, typing it on a Christmas screen (from the egg or a forced ?screen=christmas...)
// goes back to the normal screen; during the period it does nothing there, Christmas is there anyway. What counts is the
// screen shown, not the egg: typed in a jazz bar opened over Christmas (armstrong code, sax), it
// brings Christmas back. It overrides a forced ?screen=.
// yetiTyped: how many times it was typed, so that the armstrong code's bar gives way (armstrong.js)
let xmasEgg = false, yetiTyped = 0;
OVERRIDES.push(phase => {
  if ((xmasEgg || (!forced || forcedDismissed) && isXmasDate()) && (isNormal(phase) || screenClass(phase) === "night")) {
    return isXmasDaytime() ? "christmas" : "christmas-night";
  }
  return phase;
});

onCode("yeti", () => {
  leaveShows();  // typed during a show, it ends it first (epic.js)
  const onXmas = document.body.classList.contains("christmas");
  if (onXmas && isXmasDate()) return;
  yetiTyped++;
  if (!isXmasDate()) xmasEgg = !onXmas;
  if (onXmas && forced && forced.startsWith("christmas")) forcedDismissed = true;  // also leaves a forced Christmas
  applyScreen();
});

// Same pseudo-random numbers on every visit, so the scene is always drawn the same way
const seeded = seed => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// reduced motion: the scene's moving things stay still (the jar, the tree lights, the sleigh, the snowman)
const xmasStill = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const f1 = n => n.toFixed(1);  // one decimal is plenty in SVG coordinates, and keeps the markup short
// point at t (0 - 1) on a quadratic Bezier curve from (x0, y0) to (x1, y1), controlled by (cx, cy)
// Colours of the tree lights: [glass by day, lit glass at night, glow rgb]
const XMAS_LIGHTS = [["#a3192d", "#ff5a6e", "255,70,90"], ["#b07d12", "#ffd86a", "255,200,80"], ["#1d5aa8", "#7cc0ff", "90,170,255"],
  ["#17784a", "#7dffb4", "90,255,160"], ["#9c2a7e", "#ff94dc", "255,120,210"]];
// lights' halos twinkle each at its own pace on a canvas over the garland (paintGarlandGlow, below).
// The halos used to be SVG circles with a CSS animation each: some 150 animated elements, which
// restyled and redrew the whole garland, needles and all, on every frame. Rebuilt to the page width.
  // the firefly jar hangs on the left, in the margin beside the title (placeJar, below)


  // Star on the top







// Turning the screen on and off: the garland and the scene come and go with the class (the music:
// xmusic.js)
