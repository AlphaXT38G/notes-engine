// ── The Christmas night lights (christmas.js) ──
// The halos of the garland's fairy lights and the tree's lights, on two canvases, painted by one
// loop that only runs on the Christmas night (setTreeLights, on the phase event).

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

// Tree lights at night, on a canvas over the tree (behind the page, unlike the effects canvas):
// each light is a pre-drawn glow, its brightness and colour given by the current pattern. The
// pattern changes every 12 s (twinkle, chase, wave, colour cycle, sparkle), fading from one to the
// next; the star glows and its rays turn slowly. The loop only runs at night, while on screen.
const treeCanvas = document.createElement("canvas"), tctx = treeCanvas.getContext("2d");
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

// The tree lights, lit on the Christmas night only
document.addEventListener("phase", e => {
  if (e.detail === "christmas" || e.detail === "christmas-night") setTreeLights(e.detail === "christmas-night");
});
