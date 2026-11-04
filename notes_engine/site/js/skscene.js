// ── Sakura: the scene behind the page ───────────────────────────────────────────────────────────
// The landscape of the sakura screens (sakura.js), in #skscene, behind the courses: painted layers
// (site/img/sakura/, cut out of their backgrounds by tools/sakura/cut.py) stacked in depth, as in
// a theatre set, with mist between them:
//   - the sky (a painting by day; at night, drawn here: a violet gradient, stars, the pink moon);
//   - far away, the snowy volcano over a sea of clouds;
//   - a veil of mist, then the valley: wooded slopes with cherry trees in bloom and, on its rocky
//     spur, the five-storeyed pagoda (its windows glow at night, pagoda-lights.webp);
//   - the clouds filling the bottom of the valley;
//   - on the left, a rocky slope; on the right, the knoll covered with petals, the great cherry
//     tree whose branches arch over the whole top of the window (at night, veins of light run up
//     its wood: tree-veins.webp, made by tools/sakura/cut.py), the samurai looking over the
//     valley, the sheet of paper with its ink drawing, the brush and the inkstone.
// The layers are placed in the box they were painted in (1536 x 1024). The far ones are fitted to
// cover the window (centred, held to the bottom); the left slope and the right group (tree, knoll,
// samurai, paper) are fitted to the window's height and held to their side, so the samurai stays in
// the margin beside the courses on most screens and the tree's trunk never leaves the right edge.
// Each plane slides with the pointer and the scroll by its depth (parallax), the farther the less.
// The light of the hour (skLight, sakura.js) tints the land (an SVG colour matrix on each
// layer: violet at night, warm in the golden hour), fades the day's sky into the night's, lights
// the pagoda's windows.
const SK_BW = 1536, SK_BH = 1024;
const SK_IMG = "img/sakura/";

// ── The night sky (drawn: the day's is a painting) ──
const SK_NIGHT_SKY = (() => {
  const rnd = skRand(31);
  let stars = "", tw = "";
  for (let i = 0; i < 190; i++) {
    const x = rnd() * SK_BW, y = Math.pow(rnd(), 1.3) * 560, r = .6 + rnd() * rnd() * 1.5;
    if (i < 16) tw += `<circle class="tw" style="animation-delay:${(-rnd() * 5).toFixed(2)}s" cx="${skP(x)}" cy="${skP(y)}" r="${skP(r + .6)}"/>`;
    else stars += `M${skP(x)},${skP(y)}h.01`;
  }
  return `<svg viewBox="0 0 ${SK_BW} ${SK_BH}" preserveAspectRatio="xMidYMax slice"><defs>` +
    `<linearGradient id="sk-sky" x2="0" y2="1"><stop offset="0" style="stop-color:var(--s0)"/><stop offset=".4" style="stop-color:var(--s1)"/><stop offset=".72" style="stop-color:var(--s2)"/></linearGradient>` +
    `</defs>` +
    `<rect width="${SK_BW}" height="${SK_BH}" fill="url(#sk-sky)"/>` +
    `<g style="opacity:var(--night)"><path d="${stars}" style="stroke:#fff6fa;stroke-width:2;stroke-linecap:round"/>${tw}</g>` +
    `</svg>`;
})();

const skNightSky = document.createElement("div");
skNightSky.className = "sknightsky";
skNightSky.innerHTML = SK_NIGHT_SKY;
// ── Colours by the hour ──
const skVars = L => {
  const out = [], set = (k, c) => out.push(`--${k}:${skRgb(c)}`);
  set("s0", L.top); set("s1", L.mid); set("s2", L.hor); set("fog", L.fog);
  const night = skSmooth(.2, .9, L.night);
  out.push(`--night:${night.toFixed(3)}`, `--lamp:${skSmooth(.3, .8, L.night).toFixed(3)}`, `--haze:${L.haze.toFixed(3)}`);
  return out.join(";");
};
skPart({
  on() {
    skBack.append(skNightSky);
  },
  off() { skNightSky.remove(); },
  light() {
    skBack.style.cssText = skVars(skL);
  },
});
