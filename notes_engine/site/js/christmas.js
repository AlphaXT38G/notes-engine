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

// The halos of the garland's fairy lights at night, on a canvas over the garland, at 1x (they are
// soft glows; the crisp lit bulbs stay in the SVG). Painted by the night lights loop (treeFrame,
// below) with each light's twinkle; painted once, still, with reduced motion. Nothing is drawn
// while the page is scrolled past the garland.
const garlandGlow = document.createElement("canvas"), gctx = garlandGlow.getContext("2d");
// the halo of each colour: the same falloff as the baubles' reflections (#fl gradients)
const FAIRY_GLOWS = FAIRY.map(hex => {
  const s = document.createElement("canvas"), c = s.getContext("2d"), rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(",");
  s.width = s.height = 64;
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${rgb},.95)`); g.addColorStop(.35, `rgba(${rgb},.45)`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  return s;
});
// opacity through one twinkle (p: 0 - 1), eased between these keyframes
const TWINKLE = [[0, 1], [.45, .55], [.55, .9], [.7, .4], [1, 1]];
const twinkle = p => {
  let i = 1;
  while (TWINKLE[i][0] < p) i++;
  const [p0, a0] = TWINKLE[i - 1], [p1, a1] = TWINKLE[i], u = (p - p0) / (p1 - p0);
  return a0 + (a1 - a0) * u * u * (3 - 2 * u);
};
let garlandLights = [], garlandGlowShown = false;
const paintGarlandGlow = time => {  // time in seconds, or null: still lights
  const shown = time === null || scrollY < 180;
  if (!shown && !garlandGlowShown) return;  // scrolled away and already cleared
  gctx.clearRect(0, 0, garlandGlow.width, garlandGlow.height);
  garlandGlowShown = shown;
  if (!shown) return;
  for (const l of garlandLights) {
    gctx.globalAlpha = time === null ? 1 : twinkle((((time - l.d) / l.t) % 1 + 1) % 1);
    gctx.drawImage(FAIRY_GLOWS[l.c], l.x - 17, l.y - 17, 34, 34);
  }
  gctx.globalAlpha = 1;
};

  // Star on the top
// The hidden sax, hanging on the right side of the tree like an ornament:
// golden body bent in a J, bell, neck and mouthpiece, a few keys, a ribbon loop to hang it.
const SAX = { x: 388, y: 306, w: 22, h: 38 };  // small: an ornament among others, to be found
const SAX_SVG = `<svg viewBox="0 0 30 52" aria-hidden="true"><path d="M15,0v6" stroke="#c8102e" stroke-width="1.6"/>` +
  `<path d="M6,9 11,6 14,10" fill="none" stroke="#b8860b" stroke-width="2.4" stroke-linecap="round"/>` +
  `<path d="M13,10C14,22 13,34 11,40 9,46 13,50 18,49 23,48 24,43 24,37" fill="none" stroke="url(#saxgold)" stroke-width="5.5" stroke-linecap="round"/>` +
  `<path d="M20.5,38 21,31 28,30 27.5,38Z" fill="url(#saxgold)" stroke="#8a5a08" stroke-width=".8"/>` +
  `<circle cx="13.6" cy="18" r="1.2" fill="#fff5c8"/><circle cx="13.6" cy="24" r="1.2" fill="#fff5c8"/><circle cx="13" cy="30" r="1.2" fill="#fff5c8"/>` +
  `<defs><linearGradient id="saxgold" x1="0" x2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#e3a923"/><stop offset="1" stop-color="#8a5a08"/></linearGradient></defs></svg>`;

// The hidden guitar, standing behind the green gift as if it were part of the pile: a red electric
// guitar twice the size of the old small one, its body half hidden by the gift (its left side and
// horn show beside it), its neck and headstock rising against the tree, the gifts' gold bow and a
// tag tied on the neck, and a soft shadow on the branches behind it. To pass behind the gift while staying in the layer
// above the page (to be clicked), it draws the green and yellow gifts again over itself, exactly
// where the tree draws them (giftBox, without their shadow on the skirt); only the guitar itself
// takes clicks (.gtr, css/christmas.css). Its bottom may be cut by the window: it still reads as a
// guitar. In the tree's coordinates, like the gifts.
const GUITAR = { x: 344, y: 390, w: 84, h: 178 };
const GUITAR_SHAPE = `M10.5,0H15.5L15,8H14.6V35C16,37 18,38 20,34 24,33 25,40 23,44 25,48 25,58 18,61 15,63 11,63 8,61 1,58 1,48 3,44 1,40 2,33 6,34 8,38 10,37 11.4,35V8H11Z`;
const GUITAR_AT = "translate(392,528) rotate(-9) scale(2) translate(-13,-63)";  // the bottom of its body at 392,528
const GUITAR_SVG = `<svg viewBox="${GUITAR.x} ${GUITAR.y} ${GUITAR.w} ${GUITAR.h}" aria-hidden="true"><defs>` +
  `<linearGradient id="guitarred" x1="0" x2="1"><stop offset="0" stop-color="#e8423a"/><stop offset=".45" stop-color="#a80f1d"/><stop offset="1" stop-color="#45000a"/></linearGradient></defs>` +
  // its shadow on the branches behind it, cast to the right (the light comes from the top left)
  `<g transform="translate(6,3)"><path transform="${GUITAR_AT}" d="${GUITAR_SHAPE}" fill="rgba(0,25,10,.3)"/></g>` +
  // the guitar, drawn upright (bottom of the body at 13,63)
  `<g class="gtr"><g transform="${GUITAR_AT}">` +
  `<path d="M10.5,0H15.5L15,8H11Z" fill="#1a1a1f"/><path d="M10,2h-1.6M10,5h-1.6M16,2h1.6M16,5h1.6" stroke="#cfcfcf" stroke-width="1.2"/>` +
  `<rect x="11.4" y="7" width="3.2" height="30" fill="#3b2412"/><rect x="11.4" y="7" width="1" height="30" fill="rgba(255,255,255,.15)"/>` +
  `<path d="M11.4,12h3.2M11.4,17h3.2M11.4,22h3.2M11.4,27h3.2M11.4,32h3.2" stroke="#c9b48a" stroke-width=".5"/>` +
  `<path d="M6,34C2,33 1,40 3,44 1,48 1,58 8,61 11,63 15,63 18,61 25,58 25,48 23,44 25,40 24,33 20,34 18,38 16,38 14.5,37H11.5C10,38 8,38 6,34Z" fill="url(#guitarred)" stroke="#3a0008" stroke-width=".8"/>` +
  `<path d="M4.5,40C3.5,44 3.5,50 5,54M3.4,35.5C4.5,34.5 5.5,35 6,36" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1" stroke-linecap="round"/>` +
  `<rect x="9.5" y="43" width="7" height="3" rx=".8" fill="#111"/><rect x="9.5" y="49" width="7" height="3" rx=".8" fill="#111"/><rect x="10" y="55" width="6" height="1.6" fill="#bbb"/>` +
  `<circle cx="19.5" cy="53" r="1.1" fill="#e3a923"/><circle cx="18" cy="57" r="1.1" fill="#e3a923"/>` +
  `<path d="M12,1V56M13,1V56M14,1V56" stroke="rgba(235,235,235,.6)" stroke-width=".3"/>` +
  // the gold bow tied on the neck, the same ribbon as the red gift's
  `<path d="M11,24.5h4.2" stroke="#ffd15c" stroke-width="2.2"/><path d="M11,25.3h4.2" stroke="#c9921c" stroke-width=".8"/>` + bow3d(13, 24.5, "#ffd15c", "#c9921c", .45) + `</g>` +
  // its tag, hanging straight down from the bow (where the bow is, once the guitar is tilted)
  giftTag(378, 452, -4) + `</g>` +
  // the gifts in front of it, drawn again over it
  GIFTS.filter(g => g[0] >= 380).map(g => giftBox(g, false)).join("") + `</svg>`;

// The hidden firefly jar, hanging under the garland at the top of the page like its baubles: the
// jar of the calm night (calm.js) wrapped as a present, a cork lid with the gifts' red bow, twine
// round the neck, its string going up into the fir, a gift tag, moss at the bottom and a firefly
// glowing inside, wandering behind the glass (CSS). It swings on its string (the jar's pendulum,
// below). Drawn in the coordinates it had on the skirt, the string added above it: the top of the
// string, where it swings from, is the top middle of the box (252, JAR.y).
const JAR = { x: 234, y: 478, w: 36, h: 70 };
const JAR_GLASS = "M245,513H259Q259,516 261.5,517.5Q263.5,519 263.5,522V542Q263.5,546.5 259,546.5H245Q240.5,546.5 240.5,542V522Q240.5,519 242.5,517.5Q245,516 245,513Z";
const JAR_SVG = `<svg viewBox="${JAR.x} ${JAR.y} ${JAR.w} ${JAR.h}" aria-hidden="true"><defs>` +
  `<radialGradient id="jarglow"><stop offset="0" stop-color="rgba(240,255,190,1)"/><stop offset=".3" stop-color="rgba(205,255,140,.6)"/><stop offset="1" stop-color="rgba(170,255,120,0)"/></radialGradient>` +
  `<linearGradient id="jarglass" x1="0" x2="1"><stop offset="0" stop-color="rgba(210,230,255,.34)"/><stop offset=".3" stop-color="rgba(210,230,255,.1)"/><stop offset=".75" stop-color="rgba(210,230,255,.06)"/><stop offset="1" stop-color="rgba(210,230,255,.3)"/></linearGradient>` +
  `<linearGradient id="jarcork" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c49a64"/><stop offset="1" stop-color="#7a5430"/></linearGradient>` +
  `<clipPath id="jarclip"><path d="${JAR_GLASS}"/></clipPath></defs>` +
  // the string, from the fir down to the twine, knotted round the lid
  `<path d="M252,${JAR.y}V508.5" stroke="#b8935a" stroke-width=".9"/><path d="M252,${JAR.y}V508.5" stroke="rgba(255,255,255,.35)" stroke-width=".3" transform="translate(-.3,0)"/>` +
  `<circle class="halo" cx="252" cy="529" r="22" fill="url(#jarglow)"/>` +  // at night, its light around the jar
  `<path d="${JAR_GLASS}" fill="url(#jarglass)"/>` +
  // inside the glass: moss and a twig at the bottom, the firefly (its light, then its body)
  `<g clip-path="url(#jarclip)"><path d="M240,547C242,540 246,543 248,540 250,543 254,539 256,542 259,539 262,542 264,540V547Z" fill="#2f6b34"/>` +
  `<path d="M243,543L258,533M252,537l3,-6" stroke="#5a3a1c" stroke-width="1.1" stroke-linecap="round" fill="none"/>` +
  `<g class="fly"><circle class="glow" cx="252" cy="529" r="9" fill="url(#jarglow)"/>` +
  `<ellipse cx="251.2" cy="528.4" rx="1.3" ry=".8" fill="#2a2a22"/><circle cx="252.6" cy="529.1" r="1.1" fill="#f6ffd0"/>` +
  `<path d="M250.6,527.6l-1.6,-1.4M251.6,527.6l1.2,-1.6" stroke="rgba(220,235,255,.7)" stroke-width=".5"/></g></g>` +
  // the glass: its outline and the reflections of the light from the left
  `<path d="${JAR_GLASS}" fill="none" stroke="rgba(225,240,255,.75)" stroke-width=".8"/>` +
  // its round shape: the thick glass of the bottom and the rim of the neck seen as ellipses
  `<path d="M241.5,543.5Q252,548.5 262.5,543.5" fill="none" stroke="rgba(235,245,255,.6)" stroke-width="1.4"/>` +
  `<ellipse cx="252" cy="513.4" rx="7.2" ry="1.3" fill="none" stroke="rgba(235,245,255,.6)" stroke-width=".6"/>` +
  `<path d="M243.2,522V541" stroke="rgba(255,255,255,.7)" stroke-width="1.3" stroke-linecap="round"/><path d="M261,524V532" stroke="rgba(255,255,255,.35)" stroke-width=".8" stroke-linecap="round"/>` +
  // twine round the neck, the cork lid, and the red bow that makes it a present
  `<path d="M244.6,514.5H259.4" stroke="#c9a86a" stroke-width="1.4"/><rect x="243.5" y="508" width="17" height="5.5" rx="1.2" fill="url(#jarcork)"/>` +
  `<rect x="243.5" y="508" width="17" height="1.4" rx=".7" fill="rgba(255,255,255,.25)"/>` +
  `<path d="M252,508v5.5" stroke="#c8102e" stroke-width="2.4"/>` + bow3d(252, 508.5, "#c8102e", "#7e0a1d", .62) +
  giftTag(244.5, 515, 12) + `</svg>`;


const treeCanvas = document.createElement("canvas"), tctx = treeCanvas.getContext("2d");
let treeBuilt = false;
const saxBtn = document.createElement("button");
saxBtn.id = "xsax";
saxBtn.type = "button";
saxBtn.title = "A sax among the ornaments?";
saxBtn.setAttribute("aria-label", "Go to the jazz bar");
saxBtn.innerHTML = SAX_SVG;
// Always in the tree, even where the tree is behind the cards (narrow screens): its layer is above
// the page, so it stays clickable there, over the cards
saxBtn.style.cssText = `left:${SAX.x / TREE_W * 100}%;top:${SAX.y / TREE_H * 100}%;width:${SAX.w / TREE_W * 100}%;height:${SAX.h / TREE_H * 100}%`;
treeFront.append(saxBtn);
// It does what the armstrong code does (armstrong.js, loaded after this file): typing armstrong
// in the bar then goes back to the normal screen of that moment
saxBtn.addEventListener("click", e => {
  e.stopPropagation();
  secretFound("x-sax");
  CODES.armstrong();
});
// The guitar, in the same layer: the metal show takes over for one song (metal.js, loaded after
// this file, so startMetalEgg exists by the time it is clicked), then Christmas comes back
const guitarBtn = document.createElement("button");
guitarBtn.id = "xguitar";
guitarBtn.type = "button";
guitarBtn.title = "Who left a guitar under the tree?";
guitarBtn.setAttribute("aria-label", "Go to the metal show");
guitarBtn.innerHTML = GUITAR_SVG;
guitarBtn.style.cssText = `left:${GUITAR.x / TREE_W * 100}%;top:${GUITAR.y / TREE_H * 100}%;width:${GUITAR.w / TREE_W * 100}%;height:${GUITAR.h / TREE_H * 100}%`;
treeFront.append(guitarBtn);
guitarBtn.addEventListener("click", e => {
  e.stopPropagation();
  secretFound("x-guitar");
  startMetalEgg("Santa brought a guitar.");
});
// The firefly jar, hanging under the garland (placed by placeJar, below): it does what the peace
// code does (calm.js, loaded after this file): the calm night, until peace is typed again
const jarBtn = document.createElement("button");
jarBtn.id = "xjar";
jarBtn.type = "button";
jarBtn.title = "A firefly in a jar?";
jarBtn.setAttribute("aria-label", "Go to the calm night");
jarBtn.innerHTML = JAR_SVG;
jarBtn.addEventListener("click", e => {
  e.stopPropagation();
  secretFound("x-jar");
  CODES.peace();
});

// Tree lights at night, on a canvas over the tree (behind the page, unlike the effects canvas):
// each light is a pre-drawn glow, its brightness and colour given by the current pattern. The
// pattern changes every 12 s (twinkle, chase, wave, colour cycle, sparkle), fading from one to the
// next; the star glows and its rays turn slowly. The loop only runs at night, while on screen.
const LIGHT_GLOWS = XMAS_LIGHTS.map(([, , rgb]) => blob(...rgb.split(",").map(Number), .9));
const CORE = blob(255, 255, 240, 1), STAR_GLOW = blob(255, 214, 110, .8);
const RAYS = (() => {
  const s = document.createElement("canvas"), c = s.getContext("2d");
  s.width = s.height = 160;
  c.translate(80, 80);
  for (let i = 0; i < 12; i++) {
    c.rotate(Math.PI / 6);
    const g = c.createLinearGradient(0, 0, 0, -80);
    g.addColorStop(0, "rgba(255,230,150,.55)"); g.addColorStop(1, "rgba(255,230,150,0)");
    c.fillStyle = g;
    c.beginPath(); c.moveTo(-(i % 2 ? 2 : 4), 0); c.lineTo(0, i % 2 ? -55 : -80); c.lineTo(i % 2 ? 2 : 4, 0); c.fill();
  }
  return s;
})();
const PATTERNS = [
  (l, t) => [.55 + .45 * Math.sin(t * 2.3 + l.seed), l.c],                                        // twinkle
  (l, t) => [Math.max(.12, Math.sin(l.n * .45 - t * 4.5)) ** 3, l.c],                              // chase along the strings
  (l, t) => [.15 + .85 * ((Math.sin(l.y * .028 - t * 2.6) + 1) / 2) ** 2, l.c],                   // wave falling down the tree
  (l, t) => [1, (l.c + Math.floor(t * 1.6 + l.y * .01)) % XMAS_LIGHTS.length],                    // colours rolling down
  (l, t) => [.3 + .7 * Math.max(0, Math.sin(t * 7 + l.seed * 13)) ** 12, l.c],                    // sparkle
];
let treeRaf = null, treeT = 0, treeLast = 0, treeScale = 1;
const treeResize = () => {
  const r = tree.getBoundingClientRect();
  treeCanvas.width = Math.round(r.width); treeCanvas.height = Math.round(r.height);
  // the SVG keeps its proportions, bottom-aligned and centred in the box (xMidYMax meet)
  treeScale = Math.min(r.width / TREE_W, r.height / TREE_H);
  treeCanvas.ox = (r.width - TREE_W * treeScale) / 2;
  treeCanvas.oy = r.height - TREE_H * treeScale;
};
// The same loop paints the garland's halos (paintGarlandGlow), at 30 frames a second: plenty for
// lights that fade and twinkle, and half the drawing of a 60 Hz screen (a quarter at 120 Hz).
const treeFrame = now => {
  treeRaf = requestAnimationFrame(treeFrame);
  if (now - treeLast < 30) return;
  // never backwards: the first frame's time can be a little before the performance.now() of its
  // start, and a negative time would pick a pattern that does not exist
  treeT += Math.max(0, Math.min(.05, (now - treeLast) / 1000));
  treeLast = now;
  const c = tctx, s = treeScale, idx = Math.floor(treeT / 12), fade = Math.min(1, (treeT % 12) / 1.2);
  const cur = PATTERNS[idx % PATTERNS.length], prev = PATTERNS[(idx + PATTERNS.length - 1) % PATTERNS.length];
  c.clearRect(0, 0, treeCanvas.width, treeCanvas.height);
  c.save();
  c.translate(treeCanvas.ox, treeCanvas.oy);
  c.globalCompositeOperation = "lighter";
  // the star: turning rays and a breathing glow
  c.save();
  c.translate(TREE_X * s, 30 * s);
  c.rotate(treeT * .25);
  c.globalAlpha = .75 + .25 * Math.sin(treeT * 1.7);
  c.drawImage(RAYS, -80 * s, -80 * s, 160 * s, 160 * s);
  c.restore();
  c.globalAlpha = .8 + .2 * Math.sin(treeT * 2.1);
  c.drawImage(STAR_GLOW, (TREE_X - 55) * s, (30 - 55) * s, 110 * s, 110 * s);
  for (const l of treeLights) {
    const [b1, c1] = cur(l, treeT), [b0, c0] = prev(l, treeT);
    const glow = 15 * s;
    // fading between two patterns: the old one dims while the new one brightens
    for (const [b, col] of fade < 1 ? [[b0 * (1 - fade), c0], [b1 * fade, c1]] : [[b1, c1]]) {
      if (b <= .02) continue;
      c.globalAlpha = Math.min(1, b);
      c.drawImage(LIGHT_GLOWS[col], (l.x * s) - glow, (l.y * s) - glow, glow * 2, glow * 2);
      c.drawImage(CORE, (l.x - 3) * s, (l.y - 3) * s, 6 * s, 6 * s);
    }
  }
  c.restore();
  paintGarlandGlow(treeT);
};
const setTreeLights = on => {
  cancelAnimationFrame(treeRaf);
  treeRaf = null;
  removeEventListener("resize", treeResize);
  treeCanvas.remove();
  if (!on) return;
  if (xmasStill()) { paintGarlandGlow(null); return; }
  tree.append(treeCanvas);
  treeResize();
  addEventListener("resize", treeResize);
  treeLast = performance.now();
  treeRaf = requestAnimationFrame(treeFrame);
};

// Snow on the effects canvas (fx.js, mode "christmas"): soft round flakes of a few sizes and, one in
// ten, a six-armed crystal turning as it falls. They drift with a slow changing wind, sway, and
// move aside around the mouse. By day each flake has a faint blue rim, so it shows on the pale sky.
const crystal = day => {
  const s = document.createElement("canvas"), c = s.getContext("2d");
  s.width = s.height = 48;
  c.translate(24, 24);
  c.lineCap = "round";
  for (const [w, color] of day ? [[3.4, "rgba(110,145,190,.55)"], [1.6, "#fff"]] : [[1.8, "rgba(255,255,255,.95)"]]) {
    c.lineWidth = w; c.strokeStyle = color;
    for (let i = 0; i < 6; i++) {
      c.save();
      c.rotate(i * Math.PI / 3);
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(0, -20);
      c.moveTo(0, -8); c.lineTo(-5, -13); c.moveTo(0, -8); c.lineTo(5, -13);
      c.moveTo(0, -14); c.lineTo(-3.5, -17.5); c.moveTo(0, -14); c.lineTo(3.5, -17.5);
      c.stroke();
      c.restore();
    }
  }
  return s;
};
const dayFlake = (() => {
  const s = document.createElement("canvas"), c = s.getContext("2d");
  s.width = s.height = 32;
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.45, "rgba(255,255,255,.95)");
  g.addColorStop(.62, "rgba(120,150,195,.45)"); g.addColorStop(1, "rgba(120,150,195,0)");
  c.fillStyle = g; c.fillRect(0, 0, 32, 32);
  return s;
})();
const FLAKES = { night: [blob(255, 255, 255, .95), crystal(false)], day: [dayFlake, crystal(true)] };
const flakes = [];
let snowWind = 0, snowT = 0, snowMouseX = -1e4, snowMouseY = -1e4;
addEventListener("pointermove", e => { snowMouseX = e.clientX; snowMouseY = e.clientY; });
const newFlake = top => {
  const r = Math.random(), big = Math.random() < .1;
  return { x: Math.random() * fxW, y: top ? -20 : Math.random() * fxH, r: big ? 7 + Math.random() * 6 : 1.2 + r * r * 3.8, crystal: big,
    vy: big ? 28 + Math.random() * 20 : 22 + r * 50, sway: 10 + Math.random() * 25, phase: Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - .5) * 1.2 };
};
fxLayers.push({
  mode: "christmas",
  update(dt) {
    snowT += dt;
    snowWind = Math.sin(snowT * .13) * 22 + Math.sin(snowT * .37) * 10;
    const want = Math.min(320, Math.round(fxW * fxH / 7000));
    while (flakes.length < want) flakes.push(newFlake(flakes.w === fxW));
    flakes.length = Math.min(flakes.length, want);
    flakes.w = fxW;
    for (const f of flakes) {
      f.y += f.vy * dt;
      f.x += (snowWind * (.4 + f.r / 8) + Math.cos(snowT * .9 + f.phase) * f.sway) * dt;
      f.rot += f.vr * dt;
      const dx = f.x - snowMouseX, dy = f.y - snowMouseY, d2 = dx * dx + dy * dy;
      if (d2 < 6400 && d2 > 0) { const d = Math.sqrt(d2); f.x += dx / d * (80 - d) * .05; f.y += dy / d * (80 - d) * .02; }  // within 80 px
      if (f.y > fxH + 20) Object.assign(f, newFlake(true));
      if (f.x < -20) f.x += fxW + 40; else if (f.x > fxW + 20) f.x -= fxW + 40;
    }
  },
  draw(c) {
    const [dot, star] = FLAKES[document.body.dataset.phase === "christmas" ? "day" : "night"];
    for (const f of flakes) {
      c.globalAlpha = f.crystal ? .9 : .55 + Math.min(.45, f.r / 9);
      if (f.crystal) {
        // turned in place with one setTransform rather than save / translate / rotate / restore
        const cos = Math.cos(f.rot), sin = Math.sin(f.rot);
        c.setTransform(cos, sin, -sin, cos, f.x, f.y);
        c.drawImage(star, -f.r * 1.6, -f.r * 1.6, f.r * 3.2, f.r * 3.2);
        c.setTransform(1, 0, 0, 1, 0, 0);
      } else c.drawImage(dot, f.x - f.r * 1.6, f.y - f.r * 1.6, f.r * 3.2, f.r * 3.2);
    }
    c.globalAlpha = 1;
  },
  reset() { flakes.length = 0; flakes.w = 0; },
});

// Santa's sleigh: at night, now and then at random (every 40 s to 4 min), Santa's sleigh crosses
// the sky far away: random height, size, speed and direction, on a gentle arc. Drawn flying to the
// left: Rudolph alone in front, his red nose shining bright (white-hot core, glow, wide halo and a
// small flare, pulsing), then two pairs of reindeer (the far one of each pair darker and a little
// higher, for depth), all galloping (legs and bodies animated in CSS), in red harnesses with gold
// bells; then the red and gold sleigh on curled runners, Santa holding the reins, his sack of
// gifts behind him, and a trail of golden sparkles. Flying to the right, it is mirrored (.ltr).
const deer = (x, y, far, rudolph = false) => `<g transform="translate(${x},${y})"><g class="deer${far ? " far" : ""}" style="--b:${f1(-Math.random())}s">` +
  // far legs (behind the body), antler behind
  `<g class="legs-f" style="--o:-.15s"><path d="M22,27 15,35 9,33"/></g><g class="legs-h" style="--o:-.15s"><path d="M46,27 54,35 62,37"/></g>` +
  `<path class="antler back" d="M14,1C14,-4 16,-9 21,-12M16,-5C18,-7 19,-8 18,-11M15,-2C12,-4 11,-7 12,-9"/>` +
  `<path class="body" d="M16,16C20,11 32,10 44,11C52,11 57,15 56,21C55,27 49,30 41,30C33,31 24,31 18,28C13,26 12,20 16,16Z"/>` +
  `<path class="body" d="M18,18C15,12 12,7 9,3L15,1C18,6 22,11 26,14Z"/>` +
  `<path class="body" d="M9,3C7,0 3,0 0,2-3,4-3,7-1,8 2,9 6,8 9,7 12,6 13,4 12,2Z"/><path class="body" d="M12,1 16,-3 15,2Z"/>` +
  `<path class="pale" d="M18,27C26,30 36,30 44,29 38,26 26,26 18,27ZM9,6C12,9 15,14 18,19 17,13 14,8 11,5Z"/>` +
  `<path class="tail" d="M55,14c3,-3 7,-1 5,2 -1,1 -3,1 -5,0Z"/>` +
  `<path class="antler" d="M11,0C10,-5 12,-10 17,-13M13,-6C15,-8 16,-9 15,-12M12,-3C9,-5 8,-8 9,-10"/>` +
  `<circle cx="5" cy="2.5" r=".9" fill="#111"/>` +
  // near legs, harness with bells
  `<g class="legs-f"><path d="M18,26 12,34 6,31"/></g><g class="legs-h"><path d="M50,25 58,32 66,33"/></g>` +
  `<path class="strap" d="M15,15C17,21 19,26 20,29M27,12C27,18 27,24 27,30"/><circle class="bell" cx="17.5" cy="21" r="1.6"/><circle class="bell" cx="27" cy="21" r="1.6"/>` +
  (rudolph ? `<g class="nose"><circle class="halo" cx="-2" cy="6" r="30"/><circle class="glow" cx="-2" cy="6" r="13"/>` +
      `<path class="flare" d="M-26,6Q-2,4.6 22,6Q-2,7.4-26,6Z"/><circle cx="-2" cy="6" r="3.2" fill="#ff1f1f"/>` +
      `<circle cx="-2" cy="6" r="1.8" fill="#ff8a8a"/><circle cx="-2.6" cy="5.4" r=".9" fill="#fff"/></g>`
    : `<circle cx="-2" cy="6" r="1.4" fill="#1a0e08"/>`) + `</g></g>`;
const sleighEl = document.createElement("div");
sleighEl.id = "sleigh";
sleighEl.setAttribute("aria-hidden", "true");
sleighEl.innerHTML = `<svg viewBox="-12 -34 452 100"><defs>` +
  `<linearGradient id="rd-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a26a40"/><stop offset="1" stop-color="#5a3118"/></linearGradient>` +
  `<linearGradient id="rd-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76492a"/><stop offset="1" stop-color="#3b200e"/></linearGradient>` +
  `<linearGradient id="sl-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2384f"/><stop offset=".55" stop-color="#b3122e"/><stop offset="1" stop-color="#6e0716"/></linearGradient>` +
  `<radialGradient id="rd-glow"><stop offset="0" stop-color="rgba(255,90,80,1)"/><stop offset=".35" stop-color="rgba(255,40,40,.75)"/><stop offset="1" stop-color="rgba(255,30,30,0)"/></radialGradient>` +
  `<radialGradient id="rd-halo"><stop offset="0" stop-color="rgba(255,60,50,.45)"/><stop offset=".5" stop-color="rgba(255,40,40,.15)"/><stop offset="1" stop-color="rgba(255,40,40,0)"/></radialGradient>` +
  `<radialGradient id="sl-spark"><stop offset="0" stop-color="#fff7d0"/><stop offset=".4" stop-color="rgba(255,215,110,.8)"/><stop offset="1" stop-color="rgba(255,215,110,0)"/></radialGradient></defs>` +
  // golden sparkles trailing behind the sleigh
  [[360, 44, 5], [374, 50, 4], [388, 42, 3.4], [400, 52, 3], [412, 46, 2.4], [424, 50, 2], [434, 44, 1.6]].map(([x, y, r], i) =>
    `<circle class="spark" style="--s:${f1(-i * .23)}s" cx="${x}" cy="${y}" r="${r}" fill="url(#sl-spark)"/>`).join("") +
  // reins from the sleigh to every harness
  `<path class="reins" d="M276,10C220,6 140,4 70,14M276,10C230,4 150,0 82,8M276,10C210,10 120,12 20,16"/>` +
  deer(156, -6, true) + deer(82, -6, true) + deer(148, 2, false) + deer(74, 2, false) + deer(0, 4, false, true) +
  // the sleigh: runners, body with a scroll at the front, gold trim
  `<path class="runner" d="M228,51C220,51 218,44 224,42 228,41 231,45 228,48M226,58H340C346,58 349,54 346,51M250,48 247,58M298,48V58M330,45 334,58"/>` +
  `<path d="M318,20C316,2 326,-12 338,-12 350,-10 356,4 352,20Z" fill="#7a2e1c"/><path d="M326,-6C330,-2 342,-2 346,-8" stroke="#5a1f12" stroke-width="2" fill="none"/>` +
  `<rect x="326" y="-22" width="12" height="11" fill="#1f7a3e"/><rect x="331" y="-22" width="2.4" height="11" fill="#e3b341"/><rect x="339" y="-18" width="10" height="9" fill="#e3b341"/><rect x="343" y="-18" width="2" height="9" fill="#c8102e"/>` +
  // Santa: coat, belt, fur trims, beard, face, floppy hat trailing behind, arm forward on the reins
  `<path d="M286,24C284,6 292,-6 304,-6S324,6 322,24Z" fill="url(#sl-red)"/><rect x="286" y="10" width="36" height="4.5" fill="#1b1b1b"/><rect x="301" y="9.4" width="6" height="5.6" fill="none" stroke="#e3b341" stroke-width="1.4"/>` +
  `<path d="M302,-14C301,-24 310,-28 318,-22 323,-18 328,-12 331,-8L327,-6C323,-10 318,-14 314,-14Z" fill="url(#sl-red)"/><circle cx="330" cy="-6" r="3.4" fill="#fff"/>` +
  `<circle cx="304" cy="-11" r="6.2" fill="#f2c7a2"/><path d="M296,-15C296,-18 312,-18 312,-15" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>` +
  `<path d="M297,-10C294,-2 300,5 306,3 312,5 316,-2 312,-10 309,-7 300,-7 297,-10Z" fill="#f4f6fa"/><circle cx="301" cy="-12" r=".9" fill="#222"/>` +
  `<path d="M292,4C286,8 280,11 274,11" stroke="url(#sl-red)" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="273" cy="11" r="3.2" fill="#1b1b1b"/><path d="M278,9.5 280,13" stroke="#fff" stroke-width="2.4"/>` +
  `<path class="sleigh-body" d="M236,30C232,22 238,14 248,16L262,20H318C324,8 336,2 348,6 342,10 340,18 340,28 340,40 330,48 316,48H250C240,48 236,40 236,30Z"/>` +
  `<path d="M236,30C228,26 226,16 234,12 240,10 244,14 242,18" stroke="#e3b341" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
  `<path d="M248,16 262,20H318C324,8 336,2 348,6" stroke="#e3b341" stroke-width="1.8" fill="none"/>` +
  `<path d="M262,34C268,26 278,26 282,32 284,36 280,40 276,38M282,32C290,40 304,40 310,32 314,28 320,30 318,34" stroke="#f0cc6a" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>`;
let sleighIn = 20 + Math.random() * 60;  // seconds before the next flight
let sleighFlight = null;
const flySleigh = () => {
  if (document.hidden || sleighEl.isConnected || xmasStill()) return;
  const ltr = Math.random() < .5, w = 130 + Math.random() * 70, y = 15 + Math.random() * 25, rise = (Math.random() - .5) * 10;
  sleighEl.style.cssText = `top:${f1(y)}vh;width:${f1(w)}px`;
  sleighEl.classList.toggle("ltr", ltr);  // flying left to right: the drawing is mirrored (CSS)
  const [from, to] = ltr ? [`-${f1(w + 40)}px`, "100vw"] : ["100vw", `-${f1(w + 40)}px`];
  document.body.append(sleighEl);
  sleighFlight = sleighEl.animate([
    { transform: `translate(${from},0)` },
    { transform: `translate(calc((${from} + ${to}) / 2),${f1(-2 - Math.random() * 4)}vh)` },
    { transform: `translate(${to},${f1(rise)}vh)` },
  ], { duration: (14 + Math.random() * 14) * 1000, easing: "linear" });
  sleighFlight.onfinish = sleighFlight.oncancel = () => sleighEl.remove();
};
everySecond.push(() => {
  if (document.body.dataset.phase !== "christmas-night") { if (sleighFlight) sleighFlight.cancel(); sleighIn = 20 + Math.random() * 60; return; }
  if (--sleighIn <= 0) { sleighIn = 40 + Math.random() * 200; flySleigh(); }
});

// The tree lights, lit on the Christmas night only
document.addEventListener("phase", e => {
  if (e.detail === "christmas" || e.detail === "christmas-night") setTreeLights(e.detail === "christmas-night");
});

// The jar's pendulum. The jar hangs from its string (placeJar, called when the garland is built),
// in the page like the garland (it scrolls with it), over the garland, a little bigger than the
// baubles. It swings like a pendulum with friction (a period of about 1.7 s): a breath of wind
// every 2 to 6 s, the mouse passing by pushes it (its speed across, the closer the stronger), and
// scrolling the page makes it lag and swing back. Only its rotation changes (transform), on each
// frame while it moves; once it has settled the loop sleeps until the next breath of wind (a
// timer), and the wind waits while the jar is scrolled out of the window. Its place is kept in
// page coordinates (jarAt), so nothing reads the layout per frame or per mouse move.
// Reduced motion: it hangs still.
const JAR_K = () => innerWidth < 700 ? 1.45 : 2.5;  // pixels per unit of its drawing
const jarAt = { x: 0, y: 0, bottom: 0 };  // its string's top, and its bottom, in page pixels
let jarAngle = 0, jarSpin = 0, jarRaf = null, jarLast = 0, jarGust = 0, jarScroll = 0, jarNap = 0;
const placeJar = (x, y) => {
  const k = JAR_K();
  jarBtn.style.cssText = `left:${f1(x - JAR.w * k / 2)}px;top:${f1(y)}px;width:${f1(JAR.w * k)}px;height:${f1(JAR.h * k)}px`;
  Object.assign(jarAt, { x, y, bottom: y + JAR.h * k });
};
const jarFrame = now => {
  jarRaf = null;
  const dt = Math.min(.05, (now - (jarLast || now)) / 1000);
  jarLast = now;
  if (now > jarGust) {  // a breath of wind
    jarSpin += (Math.random() - .5) * .5;
    jarGust = now + 2000 + Math.random() * 4000;
  }
  jarSpin += (-14 * Math.sin(jarAngle) - 1.1 * jarSpin) * dt;
  jarAngle = Math.max(-.7, Math.min(.7, jarAngle + jarSpin * dt));
  jarBtn.style.transform = `rotate(${(jarAngle * 180 / Math.PI).toFixed(2)}deg)`;
  if (Math.abs(jarSpin) > .003 || Math.abs(jarAngle) > .003) { jarRaf = requestAnimationFrame(jarFrame); return; }
  // settled: sleep until the next breath of wind, if it is on screen to feel it
  if (scrollY < jarAt.bottom) jarNap = setTimeout(wakeJar, Math.max(0, jarGust - now));
};
const wakeJar = () => {
  if (jarRaf || xmasStill() || !jarBtn.isConnected) return;
  clearTimeout(jarNap);
  jarLast = 0;
  jarRaf = requestAnimationFrame(jarFrame);
};
const pushJar = e => {
  const dx = e.pageX - jarAt.x, dy = e.pageY - (jarAt.y + (jarAt.bottom - jarAt.y) * .7);
  const near = 1 - Math.hypot(dx, dy) / 160;
  if (near <= 0 || !e.movementX) return;
  jarSpin += Math.max(-.12, Math.min(.12, e.movementX * .004)) * near;
  wakeJar();
};
const scrollJar = () => {
  const y = scrollY;
  jarSpin += Math.max(-.4, Math.min(.4, (y - jarScroll) * .004));
  jarScroll = y;
  wakeJar();
};
const setJarSwing = on => {
  removeEventListener("pointermove", pushJar);
  removeEventListener("scroll", scrollJar);
  if (jarRaf) cancelAnimationFrame(jarRaf);
  clearTimeout(jarNap);
  jarRaf = null;
  jarAngle = jarSpin = 0;
  jarBtn.style.transform = "";
  if (!on || xmasStill()) return;
  jarScroll = scrollY;
  addEventListener("pointermove", pushJar, { passive: true });
  addEventListener("scroll", scrollJar, { passive: true });
  jarSpin = .25;  // it comes in swinging a little
  wakeJar();
};

// Turning the screen on and off: the garland and the scene come and go with the class (the music:
// xmusic.js)
let garlandResize = null;
const onGarlandResize = () => {
  clearTimeout(garlandResize);
  garlandResize = setTimeout(() => {
    if (garland.w === document.documentElement.clientWidth) return;
    buildGarland();
    // the night lights loop repaints the halos; without it (reduced motion), paint them still
    if (!treeRaf && document.body.dataset.phase === "christmas-night") paintGarlandGlow(null);
  }, 200);
};
const setChristmas = on => {
  removeEventListener("resize", onGarlandResize);
  if (!on) { [garland, scene, treeFront, sleighEl, jarBtn].forEach(el => el.remove()); setTreeLights(false); setJarSwing(false); return; }
  if (!treeBuilt) {
    tree.innerHTML = buildTree();
    scene.innerHTML = MOUNTAINS;
    scene.append(moon, tree, snowman);
    treeBuilt = true;
  }
  buildGarland();
  addEventListener("resize", onGarlandResize);
  document.body.prepend(garland, scene);
  document.body.append(treeFront);
  garland.after(jarBtn);  // over the garland, in the page
  setJarSwing(true);
};
setChristmas(document.body.classList.contains("christmas"));
document.addEventListener("christmas", e => setChristmas(e.detail));
