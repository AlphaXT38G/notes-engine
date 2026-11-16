// ── The Christmas garland (both Christmas screens, christmas.js) ──
// The garland across the top of the page, SVG rebuilt to the page width (buildGarland, called by
// xswitch.js). Its halos at night are painted on a canvas over it (xlights.js), and the firefly jar
// hangs from it (placeJar, xshortcuts.js).

// Garland across the top of the page: wide, heavy swags of fir of irregular widths and depths,
// dusted with snow, a gold ribbon woven through, a few pine cones, velvet bows at the hooks. Small
// fairy lights sit in the fir, and glass baubles hang below it on threads of different lengths.
// By day the lights are unlit glass and the baubles plain; at night (CSS) the lights are lit, each
// bauble reflects its two nearest lights (a coloured glint on the side facing each light), and the
// lights' halos twinkle each at its own pace on a canvas over the garland (paintGarlandGlow, xlights.js).
// The halos used to be SVG circles with a CSS animation each: some 150 animated elements, which
// restyled and redrew the whole garland, needles and all, on every frame. Rebuilt to the page width.
const NEEDLES = ["#1b5a31", "#246b3c", "#123f22", "#2f7d48", "#2a6b5a"];  // greens of the garland's fir needles
const GLASS = [["#ff8a9a", "#b3122e", "#4d0512"], ["#ffe6a0", "#c99416", "#5c3b02"], ["#9ff0c8", "#16804a", "#053520"],
  ["#d6ecff", "#4f8fd6", "#11305e"], ["#ffffff", "#b9c2ce", "#4b5361"]];
const FAIRY = ["#fff1c9", "#fff1c9", "#ffd86a", "#ff5a6e", "#7cc0ff", "#fff1c9"];  // mostly warm white
const garland = document.createElement("div");
garland.id = "garland";
garland.setAttribute("aria-hidden", "true");
const cubic = (p, t) => {
  const u = 1 - t;
  return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
};
const buildGarland = () => {
  const W = Math.max(320, document.documentElement.clientWidth), rnd = seeded(12);
  // irregular swags: widths from 240 to 420 px, depths from 45 to 82 px, hooks at slightly different heights
  const hooks = [[0, 6]];
  const last = () => hooks[hooks.length - 1];  // not .at(-1): Chromium 92+ only
  while (last()[0] < W) hooks.push([last()[0] + 240 + rnd() * 180, 3 + rnd() * 9]);
  const scale = W / last()[0];  // stretch so the last hook lands on the right edge
  hooks.forEach(h => { h[0] *= scale; });
  const swags = [], lights = [], baubles = [];
  // the firefly jar hangs on the left, in the margin beside the title (placeJar, xshortcuts.js)
  const jarX = W < 700 ? W * .1 : W * .12;
  let jarY = 20;
  for (let k = 0; k + 1 < hooks.length; k++) {
    const [x0, y0] = hooks[k], [x1, y1] = hooks[k + 1], w = x1 - x0, sag = 45 + rnd() * 37, lean = (rnd() - .5) * .25;
    const curve = [[x0, y0], [x0 + w * (.28 + lean), y0 + sag * 1.3], [x0 + w * (.72 + lean), y1 + sag * 1.3], [x1, y1]];
    const needles = NEEDLES.map(() => []), snow = [], cones = [];
    let ribbon = "";
    const n = Math.round(w / 2.2);
    for (let i = 0; i <= n; i++) {
      const tt = i / n, [x, y] = cubic(curve, tt), [xa, ya] = cubic(curve, Math.min(1, tt + .01)), [xb, yb] = cubic(curve, Math.max(0, tt - .01));
      const len = Math.hypot(xa - xb, ya - yb) || 1, nx = -(ya - yb) / len, ny = (xa - xb) / len;  // normal, pointing down-ish
      const thick = 11 * Math.sin(Math.PI * Math.min(1, .25 + tt * .5 + (1 - tt) * .25)) + 3;  // fuller in the middle
      for (let j = 0; j < 4; j++) {
        const off = (rnd() - .5) * 2 * thick, a = rnd() * Math.PI * 2, l = 7 + rnd() * 8;
        needles[(rnd() * NEEDLES.length) | 0].push(`M${f1(x + nx * off)},${f1(y + ny * off)}l${f1(Math.cos(a) * l)},${f1(Math.sin(a) * l)}`);
      }
      if (i % 5 === 0 && rnd() < .55) snow.push(`<ellipse cx="${f1(x - nx * (thick - 2) + (rnd() - .5) * 6)}" cy="${f1(y - ny * (thick - 2))}" rx="${f1(2.5 + rnd() * 3.5)}" ry="${f1(1.6 + rnd() * 1.6)}"/>`);
      const wob = Math.sin(tt * Math.PI * 2 * (w / 90)) * thick * .8;
      ribbon += `${i ? "L" : "M"}${f1(x + nx * wob)},${f1(y + ny * wob)}`;
    }
    // pine cones, here and there
    if (rnd() < .7) {
      const [x, y] = cubic(curve, .2 + rnd() * .6), a = f1((rnd() - .5) * 60);
      cones.push(`<g class="cone" transform="translate(${f1(x)},${f1(y + 6)}) rotate(${a})"><ellipse rx="6" ry="10" cy="6"/>` +
        `<path d="M-5,0h10M-6,5h12M-5.5,10h11M-4,14h8"/></g>`);
    }
    // fairy lights in the fir
    const nl = Math.round(w / 34);
    for (let i = 0; i < nl; i++) {
      const tt = (i + .3 + rnd() * .4) / nl, [x, y] = cubic(curve, tt), dx = (rnd() - .5) * 10, dy = (rnd() - .3) * 14;
      lights.push({ k, x: x + dx, y: y + dy, c: FAIRY[(rnd() * FAIRY.length) | 0], d: -rnd() * 5, t: 1.6 + rnd() * 2.6 });
    }
    // glass baubles hanging below, two or three per swag
    const nb = 2 + (rnd() < .5);
    for (let i = 0; i < nb; i++) {
      const tt = (i + .25 + rnd() * .5) / nb, [x, y] = cubic(curve, tt), thread = 8 + rnd() * 28, r = 8 + rnd() * 6;
      const c = (rnd() * GLASS.length) | 0;
      if (Math.abs(x - jarX) > 34) baubles.push({ k, x, y: y + 6, cy: y + 6 + thread + r, r, c });  // off the jar
    }
    if (jarX >= x0 && jarX < x1) {  // the jar's swag: where the middle of the fir crosses its x
      for (let i = 0, best = Infinity; i <= 100; i++) {
        const [x, y] = cubic(curve, i / 100);
        if (Math.abs(x - jarX) < best) { best = Math.abs(x - jarX); jarY = y; }
      }
    }
    const fir = `<path class="fir" d="M${f1(x0)},${f1(y0)}C${curve.slice(1).map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ")}"/>` +
      needles.map((d, i) => `<path stroke="${NEEDLES[i]}" class="needles" d="${d.join("")}"/>`).join("") +
      `<path class="ribbon" d="${ribbon}"/>${cones.join("")}<g class="snow">${snow.join("")}</g>`;
    swags.push(fir);
  }
  const lightSvg = l => `<circle class="glass" cx="${f1(l.x)}" cy="${f1(l.y)}" r="2.6"/><circle class="lit" cx="${f1(l.x)}" cy="${f1(l.y)}" r="3.2" fill="${l.c}"/>`;
  const baubleSvg = b => {
    // the two nearest lights, mirrored on the side of the glass facing them
    const near = lights.map(l => [Math.hypot(l.x - b.x, l.y - b.cy), l]).sort((a, z) => a[0] - z[0]).slice(0, 2);
    const glints = near.map(([d, l]) => {
      const gx = b.x + (l.x - b.x) / d * b.r * .55, gy = b.cy + (l.y - b.cy) / d * b.r * .55;
      return `<circle class="refl" cx="${f1(gx)}" cy="${f1(gy)}" r="${f1(b.r * .5)}" fill="url(#fl${FAIRY.indexOf(l.c)})"/>` +
        `<circle class="refl" cx="${f1(gx)}" cy="${f1(gy)}" r="${f1(Math.max(1, b.r * .1))}" fill="${l.c}"/>`;
    }).join("");
    return `<g class="bauble"><path class="thread" d="M${f1(b.x)},${f1(b.y)}V${f1(b.cy - b.r - 3)}"/>` +
      `<rect class="cap" x="${f1(b.x - 2.8)}" y="${f1(b.cy - b.r - 4)}" width="5.6" height="5" rx="1"/>` +
      `<circle cx="${f1(b.x)}" cy="${f1(b.cy)}" r="${f1(b.r)}" fill="url(#gb${b.c})"/>${glints}` +
      `<ellipse class="shine" cx="${f1(b.x - b.r * .38)}" cy="${f1(b.cy - b.r * .4)}" rx="${f1(b.r * .22)}" ry="${f1(b.r * .32)}" transform="rotate(-30 ${f1(b.x - b.r * .38)} ${f1(b.cy - b.r * .4)})"/></g>`;
  };
  const bows = hooks.map(([x, y]) => `<g class="bow" transform="translate(${f1(x)},${f1(y + 4)})">` +
    `<path d="M-3,3C-9,24-13,34-15,42L-9,38-6,44C-4,30-1,18 1,4ZM3,3C9,24 13,34 15,42L9,38 6,44C4,30 1,18-1,4Z" fill="url(#bowtail)"/>` +
    `<path d="M0,0C-20,-18-34,4-6,6ZM0,0C20,-18 34,4 6,6Z" fill="url(#bowloop)"/><ellipse rx="5" ry="4.5" fill="#9b0d22"/></g>`).join("");
  const defs = FAIRY.map((c, i) => FAIRY.indexOf(c) === i ?
    `<radialGradient id="fl${i}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".35" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>` : "").join("") +
    GLASS.map(([a, b, c], i) => `<radialGradient id="gb${i}" cx=".38" cy=".32" r=".75"><stop class="g1" offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`).join("") +
    `<linearGradient id="bowloop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2384f"/><stop offset=".6" stop-color="#b3122e"/><stop offset="1" stop-color="#7d0a1d"/></linearGradient>` +
    `<linearGradient id="bowtail" x1="0" x2="1"><stop offset="0" stop-color="#8a0c20"/><stop offset=".5" stop-color="#c8102e"/><stop offset="1" stop-color="#8a0c20"/></linearGradient>` +
    `<linearGradient id="ribbon" x1="0" x2="1"><stop offset="0" stop-color="#f6dc8a"/><stop offset=".5" stop-color="#d4a630"/><stop offset="1" stop-color="#f6dc8a"/></linearGradient>`;
  // swag by swag: its baubles behind the fir, its lights in front; the bows on top, at the hooks.
  // The garland does not react to the mouse any more: it is drawn once and never redrawn.
  garland.innerHTML = `<svg width="${W}" height="170" viewBox="0 0 ${W} 170"><defs>${defs}</defs>` +
    swags.map((fir, k) => baubles.filter(b => b.k === k).map(baubleSvg).join("") + fir + lights.filter(l => l.k === k).map(lightSvg).join("")).join("") +
    `${bows}</svg>`;
  garlandLights = lights.map(l => ({ ...l, c: FAIRY.indexOf(l.c) }));
  garlandGlow.width = W; garlandGlow.height = 170;  // also clears it
  garlandGlowShown = false;
  garland.append(garlandGlow);
  garland.w = W;
  placeJar(jarX, jarY);
};
