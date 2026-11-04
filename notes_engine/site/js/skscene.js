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
  let seas = "";
  for (let i = 0; i < 9; i++) {
    const a = rnd() * 6.28, q = rnd() * 44;
    seas += `<ellipse cx="${skP(Math.cos(a) * q)}" cy="${skP(Math.sin(a) * q)}" rx="${skP(10 + rnd() * 18)}" ry="${skP(8 + rnd() * 13)}"/>`;
  }
  return `<svg viewBox="0 0 ${SK_BW} ${SK_BH}" preserveAspectRatio="xMidYMax slice"><defs>` +
    `<linearGradient id="sk-sky" x2="0" y2="1"><stop offset="0" style="stop-color:var(--s0)"/><stop offset=".4" style="stop-color:var(--s1)"/><stop offset=".72" style="stop-color:var(--s2)"/></linearGradient>` +
    `<radialGradient id="sk-moonhalo"><stop offset=".26" stop-color="#f6a0c4" stop-opacity=".32"/><stop offset=".5" stop-color="#e888b4" stop-opacity=".1"/><stop offset="1" stop-color="#e070a8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="sk-moonfill" cx=".4" cy=".38"><stop offset="0" stop-color="#f8e2ea"/><stop offset=".6" stop-color="#f0bcd0"/><stop offset="1" stop-color="#dc98b6"/></radialGradient>` +
    `<radialGradient id="sk-moonlimb"><stop offset=".7" stop-color="#b04a7a" stop-opacity="0"/><stop offset="1" stop-color="#b04a7a" stop-opacity=".35"/></radialGradient>` +
    `<clipPath id="sk-moonclip"><circle r="74"/></clipPath><filter id="sk-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs>` +
    `<rect width="${SK_BW}" height="${SK_BH}" fill="url(#sk-sky)"/>` +
    `<g style="opacity:var(--night)"><path d="${stars}" style="stroke:#fff6fa;stroke-width:2;stroke-linecap:round"/>${tw}</g>` +
    `<g id="sk-moonpos" transform="translate(250,200)"><g style="opacity:var(--moon)"><circle r="270" fill="url(#sk-moonhalo)"/><circle r="74" fill="url(#sk-moonfill)"/>` +
    `<g clip-path="url(#sk-moonclip)"><g filter="url(#sk-soft)" style="fill:#e27aa6;opacity:.45">${seas}</g></g><circle r="74" fill="url(#sk-moonlimb)"/></g></g></svg>`;
})();

// ── The planes ──
// [name, image or inner HTML, group, depth (px of parallax), placement in the box: x, y, width
// (the height follows the image's proportions), extra class]
const SK_LAYERS = [
  ["mountains", "mountains.webp", "back", 3, -557, -164, 1920, "skfar"],
  ["mist1", "", "back", 5, 0, 560, SK_BW, "skfog"],
  ["valley", "valley.webp", "back", 7, 0, 0, SK_BW],
  ["lights", "pagoda-lights.webp", "back", 7, 0, 0, SK_BW, "sklights"],
  ["mist2", "", "back", 9, -220, 780, SK_BW + 440, "skfog skfog2"],
  ["mist3", "", "back", 11, -260, 690, SK_BW + 520, "skfog skfog3"],
  ["slope", "slope.webp", "left", 14, 0, 410, 920],
  ["tree", "tree.webp", "right", 15, 0, -190, SK_BW, "sktree"],
  ["knoll", "knoll.webp", "right", 17, 0, 60, SK_BW],
  ["samurai", "samurai.webp", "right", 17, 1062, 328, 228, "sksamurai"],  // both feet in the grass
  ["paper", "paper.webp", "right", 18, 1268, 642, 262, "skpaper"],
];
const SK_RATIO = { "samurai.webp": 1.5 };  // height / width (the others are 1024 / 1536)
const skNightSky = document.createElement("div"), skDaySky = document.createElement("img"), skLand = document.createElement("div");
skNightSky.className = "sknightsky";
skNightSky.innerHTML = SK_NIGHT_SKY;
skDaySky.className = "skdaysky";
skDaySky.alt = "";
skDaySky.decoding = "async";
skLand.className = "skland";
const skGroups = {}, skPlanes = [];
// the low sun's glow over the sky and the land, in the golden hour
const skSunGlow = document.createElement("div");
skSunGlow.className = "sksunglow";
// at night, the edges of the window sink into the dark (a vignette over the land)
const skVeil = document.createElement("div");
skVeil.className = "skveil";
["back", "left", "right"].forEach(g => {
  const el = document.createElement("div");
  el.className = `skgroup skg-${g}`;
  skGroups[g] = el;
  skLand.append(el);
});
SK_LAYERS.forEach(([name, file, group, depth, x, y, w, cls = ""]) => {
  const el = document.createElement(file ? "img" : "div");
  el.className = `skl skl-${name} ${cls}`;
  if (file) { el.alt = ""; el.decoding = "async"; el.dataset.src = SK_IMG + file; }
  const h = w * (SK_RATIO[file] || SK_BH / SK_BW) * (file ? 1 : 0) || 244;
  el.style.cssText = `left:${(x / SK_BW * 100).toFixed(3)}%;top:${(y / SK_BH * 100).toFixed(3)}%;width:${(w / SK_BW * 100).toFixed(3)}%;height:${(h / SK_BH * 100).toFixed(3)}%`;
  skGroups[group].append(el);
  skPlanes.push({ el, depth });
});
// The tint of the hour, an SVG colour matrix every layer is drawn through (filter: url(#sk-tint)):
// each channel multiplied (violet at night, warm in the golden hour), a little desaturated at
// night. A filter on each image rather than one over the land: an image's filter is worked out
// once, and the parallax only moves the result.
const skTint = document.createElement("div");
skTint.className = "sktint";
skTint.innerHTML = '<svg width="0" height="0" aria-hidden="true"><filter id="sk-tint" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter>' +
  '<filter id="sk-tint-far" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter></svg>';
// The channels' factors of the hour: day white, golden hour warm, night violet. far: the snowy
// volcano and the far ranges, lit by the moon at night (darkened less). Also used for the petals.
const skTintRGB = (L, far) => {
  const night = skSmooth(.2, .9, L.night) * (far ? .72 : 1), warm = skClamp(L.rays, 0, 1.7);
  return [0, 1, 2].map(i => skMix(1, [1.06, .93, .8][i], warm) * skMix(1, [.27, .24, .5][i], night));
};
const skTintMatrix = (L, far) => {
  const night = skSmooth(.2, .9, L.night) * (far ? .72 : 1), m = skTintRGB(L, far);
  const d = night * .35, g = [.3, .59, .11];  // desaturation towards grey
  const rows = [0, 1, 2].map(i => [0, 1, 2].map(j => (m[i] * ((i === j ? 1 - d : 0) + d * g[j])).toFixed(3)).join(" ") + " 0 0");
  return `${rows.join(" ")} 0 0 0 1 0`;
};

// Where each group's box is on the screen: the back covers the window, the sides fit its height
// Each box reaches SK_PAD px past the window's sides (and the bottom), more than the parallax
// ever slides a plane: their edges never show
const SK_PAD = 26;
const skPlaceGroups = () => {
  const { W, H } = skLay, P = SK_PAD;
  const cover = Math.max((W + 2 * P) / SK_BW, (H + P) / SK_BH), fit = (H + P) / SK_BH;
  const set = (el, s, x) => { el.style.cssText = `left:${skP(x)}px;top:${skP(H + P - SK_BH * s)}px;width:${skP(SK_BW * s)}px;height:${skP(SK_BH * s)}px`; };
  set(skGroups.back, cover, (W - SK_BW * cover) / 2);
  set(skGroups.left, fit, -P);
  set(skGroups.right, fit, W + P - SK_BW * fit);
};

// ── Colours by the hour ──
const skVars = L => {
  const out = [], set = (k, c) => out.push(`--${k}:${skRgb(c)}`);
  set("s0", L.top); set("s1", L.mid); set("s2", L.hor); set("fog", L.fog);
  const night = skSmooth(.2, .9, L.night);
  out.push(`--night:${night.toFixed(3)}`, `--lamp:${skSmooth(.3, .8, L.night).toFixed(3)}`, `--moon:${L.moonVis.toFixed(3)}`, `--haze:${L.haze.toFixed(3)}`);
  // the day's sky: warmer in the golden hour and at dawn, gone at night
  const warm = skClamp(L.rays, 0, 1.7);
  out.push(`--sunglow:${(skClamp(L.rays * .6, 0, 1) * L.sunVis).toFixed(3)}`, `--sunx:${(L.sun[0] * 100).toFixed(1)}%`, `--suny:${((1 - L.sun[1]) * 100).toFixed(1)}%`);
  // in the golden hour the painted sky (blue) gives way to the drawn one, golden, its clouds kept warm
  out.push(`--skyf:sepia(${(warm * .35).toFixed(3)}) saturate(${(1 + warm * .2).toFixed(3)})`);
  out.push(`--daysky:${((1 - night) * (1 - .6 * skClamp(warm / 1.4, 0, 1))).toFixed(3)}`);
  return out.join(";");
};
const skPlaceMoon = () => {
  const moon = skNightSky.querySelector("#sk-moonpos");
  moon.setAttribute("transform", `translate(150,${skP(320 - skL.moonUp * 60)})`);
};

skPart({
  on() {
    // the images load only when the screen first shows
    skPlanes.forEach(({ el }) => { if (el.dataset.src && !el.src) el.src = el.dataset.src; });
    if (!skDaySky.src) skDaySky.src = SK_IMG + "sky.webp";
    skBack.append(skTint, skNightSky, skDaySky, skLand, skSunGlow, skVeil);
  },
  off() { skTint.remove(); skNightSky.remove(); skDaySky.remove(); skLand.remove(); skSunGlow.remove(); skVeil.remove(); },
  resize() { skPlaceGroups(); },
  light() {
    skBack.style.cssText = skVars(skL);
    const [near, far] = skTint.querySelectorAll("feColorMatrix");
    near.setAttribute("values", skTintMatrix(skL));
    far.setAttribute("values", skTintMatrix(skL, true));
    skPlaceMoon();
  },
});
