// ── The Christmas tree and its gifts (both Christmas screens, christmas.js) ──
// The tree of the winter scene, its gifts and the ribbon bow and gift tag the gifts, the guitar
// and the jar share (bow3d, giftTag), all SVG. buildTree is called once, when Christmas first
// comes (xswitch.js); its lights (treeLights) are lit at night by xlights.js.

// The tree, on the right of the winter scene behind the page (#xscene): tiers of fir with snow on
// the branches, tinsel, baubles, candy canes, light strings and a star, a red skirt and gifts below
// it. Drawn once as SVG in a 520 x 640 box, lit from the top left like the rest of the scene and
// shaded for volume: each tier is rounded by gradients (darker under the tier above it and towards
// its edges), carries rows of hanging branches layered like scales (light on the lit side, dark
// on the far side), a lip under its edge and a rim of light along the lit half; the trunk is a
// cylinder, the skirt a lit cloth, the baubles have their reflection and their shadow on the
// needles, the star is cut in facets. All of it is static (no blur, no animation), so it costs
// nothing once drawn. The lights are also listed (treeLights) for the night canvas that lights
// them up. The sax ornament and the guitar are in a separate layer above the page (#xtree-front),
// so they can be clicked even where the cards cover the tree.
// A ribbon bow seen from the front, in volume without gradients (the gifts, the guitar and the jar
// share it, and the jar and guitar are separate SVGs): the left loop lit, the right one in shade,
// the inside of each loop darker, a glint on the left loop, two tails and the knot.
const bow3d = (x, y, c, dark, k = 1) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${k})">` +
  `<path d="M-1,1L-8,11 -4.5,11.5 0,3Z" fill="${dark}"/><path d="M1,1L7,12 10.5,10.5 1.8,1.5Z" fill="${dark}"/>` +
  `<path d="M0,0C-5,-11 -18,-13 -17,-4 -16,3 -6,2 0,0Z" fill="${c}"/><path d="M-1.5,-.5C-6,-7 -13,-8 -13.5,-3.5 -11,-2 -6,-1 -1.5,-.5Z" fill="${dark}" opacity=".55"/>` +
  `<path d="M0,0C5,-11 18,-13 17,-4 16,3 6,2 0,0Z" fill="${c}"/><path d="M0,0C5,-11 18,-13 17,-4 16,3 6,2 0,0Z" fill="rgba(0,0,0,.22)"/>` +
  `<path d="M1.5,-.5C6,-7 13,-8 13.5,-3.5 11,-2 6,-1 1.5,-.5Z" fill="${dark}" opacity=".55"/>` +
  `<path d="M-14,-6c2,-3 5,-4 8,-2" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.3" stroke-linecap="round"/>` +
  `<ellipse rx="3.4" ry="2.8" fill="${c}"/><ellipse rx="3.4" ry="2.8" fill="rgba(0,0,0,.15)"/><ellipse cx="-1" cy="-1" rx="1.4" ry="1" fill="rgba(255,255,255,.45)"/></g>`;
// A gift tag hanging from its string (x, y: where the string is tied), turned by a few degrees:
// a cream card with a cut corner, its hole, and two red lines of writing too small to read
const giftTag = (x, y, a) => `<g transform="translate(${x},${y}) rotate(${a})"><path d="M0,0L-1,6.5" stroke="#b8935a" stroke-width=".6"/>` +
  `<path d="M-4.5,6H2.5L4.5,8.5V15H-4.5Z" fill="#f6ecd4" stroke="rgba(60,30,0,.35)" stroke-width=".4"/><path d="M2.5,6V8.5H4.5" fill="rgba(0,0,0,.08)"/>` +
  `<circle cx="-1" cy="8.3" r=".8" fill="#8a6a3a"/><path d="M-3,11.2h4.5M-3,13h3" stroke="#c8102e" stroke-width=".55" stroke-linecap="round"/></g>`;
const TREE_W = 520, TREE_H = 640, TREE_X = 330;
const treeLights = [];
// point at t (0 - 1) on a quadratic Bezier curve from (x0, y0) to (x1, y1), controlled by (cx, cy)
const quad = (x0, y0, cx, cy, x1, y1, t) => [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1];
const treeHalfWidth = y => 12 + (y - 60) / (520 - 60) * 172;  // half width of the tree at height y
// Gifts below the tree, as boxes in volume seen a little from above: the front, the side that
// faces the tree's middle (the right one for the gifts on the left, the left one for those on the
// right), and the lid, with its top, overhanging the box and casting a shadow on it. Lit from the
// top left: the top is the lightest, the front shaded across and darker near the floor, a right
// side in shade. The ribbon goes round the box (front, side and top) and a bow sits in the middle
// of the lid; some papers have a pattern. Each one casts a shadow on the skirt (foot). Their
// gradients and patterns are in the tree's defs (buildTree).
const giftPoly = (pts, fill) => `<polygon points="${pts.map(([a, b]) => `${f1(a)},${f1(b)}`).join(" ")}" fill="${fill}"/>`;
const giftBox = ([x, y, w, h, box, rib, ribDark, pat], foot = true) => {
  const side = x + w / 2 < TREE_X ? 1 : -1, d = Math.min(18, w * .24), dx = side * d * .5, dy = -d * .62;
  const sideShade = side > 0 ? "rgba(0,0,0,.3)" : "rgba(0,0,0,.1)", cx = x + w / 2, rw = Math.max(7, w * .14);
  const along = (x0, y0, t) => [x0 + dx * t, y0 + dy * t];  // a point t of the way back from the front
  const band = (x0, ya, yb) => [along(x0, ya, .5 - .16), along(x0, ya, .5 + .16), along(x0, yb, .5 + .16), along(x0, yb, .5 - .16)];
  const sideFace = (x0, ya, yb) => [[x0, ya], along(x0, ya, 1), along(x0, yb, 1), [x0, yb]];
  const L = 10, o = 3, lx = x - o, lw = w + 2 * o, ly = y - L + 2;  // the lid
  const bx = side > 0 ? x + w : x, lsx = side > 0 ? lx + lw : lx;  // where the visible sides are
  let g = foot ? `<ellipse cx="${f1(cx + 9)}" cy="${f1(y + h)}" rx="${f1(w * .62)}" ry="6" fill="url(#xgiftfoot)"/>` : "";
  // the box: its side (paper, ribbon, shade), then its front (paper, pattern, ribbon, shading)
  g += giftPoly(sideFace(bx, y, y + h), box) + (pat ? giftPoly(sideFace(bx, y, y + h), `url(#${pat})`) : "") + giftPoly(band(bx, y, y + h), rib) + giftPoly(sideFace(bx, y, y + h), sideShade);
  g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${box}"/>` + (pat ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${pat})"/>` : "") +
    `<rect x="${f1(cx - rw / 2)}" y="${y}" width="${f1(rw)}" height="${h}" fill="${rib}"/><rect x="${f1(cx - rw / 2)}" y="${y}" width="${f1(rw * .3)}" height="${h}" fill="rgba(255,255,255,.22)"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#xshade)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#xgiftfloor)"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="5" fill="rgba(0,0,0,.28)"/>`;  // the lid's shadow on the box
  // the lid: its side, its front, then its top with the two ribbons crossing and the bow
  const top = [[lx, ly], [lx + lw, ly], along(lx + lw, ly, 1), along(lx, ly, 1)];
  g += giftPoly(sideFace(lsx, ly, ly + L), box) + giftPoly(band(lsx, ly, ly + L), rib) + giftPoly(sideFace(lsx, ly, ly + L), sideShade);
  g += `<rect x="${lx}" y="${ly}" width="${lw}" height="${L}" fill="${box}"/>` + (pat ? `<rect x="${lx}" y="${ly}" width="${lw}" height="${L}" fill="url(#${pat})"/>` : "") +
    `<rect x="${f1(cx - rw / 2)}" y="${ly}" width="${f1(rw)}" height="${L}" fill="${rib}"/><rect x="${lx}" y="${ly}" width="${lw}" height="${L}" fill="url(#xshade)"/>` +
    `<rect x="${lx}" y="${ly + L - 1.5}" width="${lw}" height="1.5" fill="rgba(0,0,0,.25)"/>`;
  g += giftPoly(top, box) + (pat ? giftPoly(top, `url(#${pat})`) : "") +
    giftPoly([[cx - rw / 2, ly], [cx + rw / 2, ly], along(cx + rw / 2, ly, 1), along(cx - rw / 2, ly, 1)], rib) +
    giftPoly([along(lx, ly, .5 - .16), along(lx + lw, ly, .5 - .16), along(lx + lw, ly, .5 + .16), along(lx, ly, .5 + .16)], rib) +
    giftPoly(top, "rgba(255,255,255,.2)") + `<path d="M${f1(lx)},${f1(ly)}H${f1(lx + lw)}" stroke="rgba(255,255,255,.45)" stroke-width="1"/>`;
  const [bowX, bowY] = along(cx, ly, .5);
  return `<g class="gift">${g}${bow3d(bowX, bowY + 1, rib, ribDark, Math.min(1.25, w / 60))}</g>`;
};
// x, y, width, height, paper, ribbon, ribbon in shade, pattern; from the back to the front (lowest last)
const GIFTS = [[178, 512, 72, 50, "#c8102e", "#ffd15c", "#c9921c", "xpdots"], [258, 528, 52, 36, "#2f6fd1", "#eef2f8", "#aab4c4", "xpflakes"],
  [380, 508, 78, 52, "#1e8a4c", "#d6203a", "#8e0f22", "xpstripes"], [452, 530, 46, 32, "#e2a81e", "#c8102e", "#7e0a1d", ""]]
  .sort((a, b) => (a[1] + a[3]) - (b[1] + b[3]));
const buildTree = () => {
  const rnd = seeded(2025), parts = [];
  const defs = [`<linearGradient id="xfir" x1="0" x2="1"><stop class="s1" offset="0"/><stop class="s2" offset=".45"/><stop class="s3" offset="1"/></linearGradient>`,
    `<linearGradient id="xstar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#ffc93c"/><stop offset="1" stop-color="#c98a0c"/></linearGradient>`,
    `<linearGradient id="xgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".45" stop-color="#e3a923"/><stop offset="1" stop-color="#8a5a08"/></linearGradient>`,
    // volume of a tier: in the shadow of the tier above at its top, rounded like a cone (lit on the
    // left, darker towards the edges), a rim of light along the lit half of its edge
    `<linearGradient id="xfirdepth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(0,18,6,.55)"/><stop offset=".4" stop-color="rgba(0,18,6,0)"/><stop offset=".85" stop-color="rgba(0,18,6,0)"/><stop offset="1" stop-color="rgba(0,18,6,.25)"/></linearGradient>`,
    `<radialGradient id="xfirround" cx=".34" cy=".62" r=".72"><stop offset="0" stop-color="rgba(220,255,200,.16)"/><stop offset=".55" stop-color="rgba(220,255,200,0)"/><stop offset="1" stop-color="rgba(0,15,5,.4)"/></radialGradient>`,
    `<linearGradient id="xrim" x1="0" x2="1"><stop offset="0" stop-color="rgba(190,245,170,.75)"/><stop offset=".45" stop-color="rgba(190,245,170,.25)"/><stop offset=".6" stop-color="rgba(190,245,170,0)"/></linearGradient>`,
    `<linearGradient id="xtrunk" x1="0" x2="1"><stop offset="0" stop-color="#8a5a2c"/><stop offset=".35" stop-color="#6b4220"/><stop offset="1" stop-color="#2e1808"/></linearGradient>`,
    `<radialGradient id="xskirt" cx=".32" cy=".25" r=".8"><stop offset="0" stop-color="#ea3048"/><stop offset=".5" stop-color="#c8102e"/><stop offset="1" stop-color="#7e0a1d"/></radialGradient>`,
    `<radialGradient id="xtrunkfoot"><stop offset="0" stop-color="rgba(40,0,8,.55)"/><stop offset="1" stop-color="rgba(40,0,8,0)"/></radialGradient>`];
  const BAUBLES = [["#ff6b7d", "#c8102e", "#5c0614"], ["#fff1a6", "#e2a81e", "#6b4504"], ["#bfe1ff", "#2f7ed8", "#0b2d5c"], ["#ffffff", "#c7ced8", "#59626e"], ["#e9b8ff", "#8e3cc8", "#3a0c5a"]];
  BAUBLES.forEach(([a, b, c], i) => defs.push(`<radialGradient id="xb${i}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`));

  // Tree skirt (a lit cloth with a few soft folds) and trunk (a cylinder standing in it), then the
  // tiers from the bottom up, each casting a shadow on the one below
  const folds = [-110, -62, -18, 30, 76, 118].map(dx => `M${TREE_X + dx * .55},541Q${TREE_X + dx * .8},556 ${TREE_X + dx},${f1(556 + 17 * Math.sqrt(1 - (dx / 150) ** 2))}`).join("");
  parts.push(`<ellipse cx="${TREE_X}" cy="560" rx="150" ry="22" fill="#7e0a1d"/><ellipse cx="${TREE_X}" cy="556" rx="150" ry="19" fill="url(#xskirt)"/>` +
    `<path d="${folds}" fill="none" stroke="rgba(70,0,12,.28)" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M${TREE_X - 150},556a150,19 0 0 0 300,0" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="1 9" stroke-linecap="round"/>` +
    `<ellipse cx="${TREE_X + 6}" cy="551" rx="30" ry="6" fill="url(#xtrunkfoot)"/><rect x="${TREE_X - 15}" y="512" width="30" height="40" fill="url(#xtrunk)"/>` +
    `<ellipse cx="${TREE_X}" cy="552" rx="15" ry="3" fill="#2e1808"/><path d="M${TREE_X - 8},516v32M${TREE_X + 3},514v34" stroke="rgba(0,0,0,.18)" stroke-width="1.2"/>`);
  const TIERS = [[290, 525, 184], [222, 438, 150], [160, 350, 118], [106, 262, 86], [62, 178, 52]];
  TIERS.forEach(([top, bottom, hw], i) => {
    const n = 7 + (4 - i) * 2, step = hw * 2 / n;
    let edge = "";
    for (let j = 0; j < n; j++) {
      const xa = TREE_X - hw + j * step;
      edge += `Q${f1(xa + step / 2)},${f1(bottom + 13 + rnd() * 6)} ${f1(xa + step)},${f1(bottom - rnd() * 4)}`;
    }
    const path = `M${TREE_X},${top - 34}C${TREE_X - hw * .35},${f1(top + (bottom - top) * .45)} ${f1(TREE_X - hw * .8)},${f1(bottom - 20)} ${f1(TREE_X - hw)},${bottom}${edge}` +
      `C${f1(TREE_X + hw * .8)},${f1(bottom - 20)} ${TREE_X + hw * .35},${f1(top + (bottom - top) * .45)} ${TREE_X},${top - 34}Z`;
    if (i) parts.push(`<path d="${path}" transform="translate(0,9)" class="tier-shadow"/>`);
    // the lip: the underside of the branches, seen just below their edge
    parts.push(`<path d="${path}" transform="translate(0,3.5)" class="tier-lip"/><path d="${path}" fill="url(#xfir)"/>` +
      `<path d="${path}" fill="url(#xfirdepth)"/><path d="${path}" fill="url(#xfirround)"/>`);
    // rows of drooping branches inside the tier, layered like scales: each branch is a hanging
    // crescent with its shadow under it and a fringe of needles along its edge, in three tones by
    // where it is (lit on the left, in the shade on the right and in the shadow of the tier above)
    const tones = ["", "", ""], fringe = ["", "", ""];
    let shade = "";
    for (let r = 1; r <= 3; r++) {
      const y = top + (bottom - top) * (r / 4) - 6, half = hw * (.3 + .7 * (y - top + 34) / (bottom - top + 34)) * .88;
      const count = Math.max(3, Math.round(half * 2 / 30)), w = half * 2 / count;
      for (let k = 0; k < count; k++) {
        const x = TREE_X - half + k * w + (rnd() - .5) * 5, yy = y + (rnd() - .5) * 6, out = (x + w / 2 - TREE_X) / hw;
        const lit = (1 - out) / 2 - (r === 1 ? .22 : 0) + (rnd() - .5) * .2, tone = lit > .55 ? 0 : lit > .28 ? 1 : 2;
        const ww = w + 6, sag = 9 + rnd() * 4, x0 = x - 3;
        tones[tone] += `M${f1(x0)},${f1(yy)}Q${f1(x0 + ww / 2)},${f1(yy + sag * 2)} ${f1(x0 + ww)},${f1(yy)}Q${f1(x0 + ww / 2)},${f1(yy + sag * .5)} ${f1(x0)},${f1(yy)}Z`;
        shade += `M${f1(x0 + 1)},${f1(yy + 3)}Q${f1(x0 + ww / 2 + 1)},${f1(yy + sag * 2 + 4)} ${f1(x0 + ww + 1)},${f1(yy + 3)}Q${f1(x0 + ww / 2)},${f1(yy + sag + 2)} ${f1(x0 + 1)},${f1(yy + 3)}Z`;
        for (let q = 1; q < 4; q++) {  // a few needles along the bottom of the crescent
          const t = q / 4, nx = x0 + ww * t, ny = yy + 2 * sag * t * (1 - t) * 2 * .98;
          fringe[tone] += `M${f1(nx)},${f1(ny - 1)}l${f1(out * 2 + (rnd() - .5) * 1.6)},${f1(3 + rnd() * 2.5)}`;
        }
      }
    }
    parts.push(`<path class="ndsh" d="${shade}"/>` + tones.map((d, t) => `<path class="nd${t + 1}" d="${d}"/><path class="nf${t + 1}" d="${fringe[t]}"/>`).join(""));
    parts.push(`<path class="rim" d="M${f1(TREE_X - hw)},${bottom}${edge}" stroke="url(#xrim)"/>`);
    // needle tips along the bottom edge, and snow resting on some branches
    let tips = "", snow = "";
    for (let j = 0; j < n * 3; j++) {
      const x = TREE_X - hw + rnd() * hw * 2, y = bottom - 2 + rnd() * 10;
      tips += `M${f1(x)},${f1(y)}l${f1((rnd() - .5) * 8)},${f1(4 + rnd() * 6)}`;
    }
    for (let j = 0; j < n; j += 2) {
      const xa = TREE_X - hw + j * step + step * .2;
      snow += `M${f1(xa)},${f1(bottom - 3)}q${f1(step * .3)},-6 ${f1(step * .6)},0`;
    }
    parts.push(`<path class="tips" d="${tips}"/><path class="branch-snow" d="${snow}"/>`);
  });
  // Tinsel: golden bead strands swagging across the tree
  [[140, 175], [215, 250], [290, 330], [370, 405], [450, 480]].forEach(([y1, y2], i) => {
    const l = i % 2 ? [TREE_X + treeHalfWidth(y1) - 10, y1] : [TREE_X - treeHalfWidth(y1) + 10, y1];
    const r = i % 2 ? [TREE_X - treeHalfWidth(y2) + 10, y2] : [TREE_X + treeHalfWidth(y2) - 10, y2];
    const d = `M${f1(l[0])},${l[1]}Q${TREE_X},${Math.max(y1, y2) + 34} ${f1(r[0])},${r[1]}`;
    parts.push(`<path class="beads-shade" d="${d}" transform="translate(.8,1.2)"/><path class="beads" d="${d}"/>`);
  });
  // Light strings: a dark wire with small bulbs, unlit (the night canvas lights them)
  let lightsSvg = "";
  [[110, 128], [180, 206], [255, 285], [330, 362], [405, 440], [480, 505]].forEach(([y1, y2], s) => {
    const x0 = TREE_X - treeHalfWidth(y1) + 4, x1 = TREE_X + treeHalfWidth(y2) - 4, cy = Math.max(y1, y2) + 26;
    lightsSvg += `<path class="light-wire" d="M${f1(x0)},${y1}Q${TREE_X},${cy} ${f1(x1)},${y2}"/>`;
    const count = 5 + s * 2;
    for (let i = 0; i < count; i++) {
      const [x, y] = quad(x0, y1, TREE_X, cy, x1, y2, (i + .5) / count), c = (s * 3 + i) % XMAS_LIGHTS.length;
      treeLights.push({ x, y: y + 3, c, n: treeLights.length, seed: rnd() * 100 });
      lightsSvg += `<ellipse cx="${f1(x)}" cy="${f1(y + 3)}" rx="2.6" ry="3.6" fill="${XMAS_LIGHTS[c][0]}"/>`;
    }
  });
  parts.push(lightsSvg);
  // Baubles at random spots inside the tree, not too close to each other nor to the sax
  const taken = [[SAX.x + 14, SAX.y + 22, 34]];
  for (let tries = 0, placed = 0; tries < 600 && placed < 26; tries++) {
    const y = 120 + rnd() * 390, x = TREE_X + (rnd() * 2 - 1) * (treeHalfWidth(y) - 16), r = 7 + rnd() * 5;
    if (taken.some(([tx, ty, tr]) => Math.hypot(tx - x, ty - y) < tr + r + 6)) continue;
    taken.push([x, y, r]);
    placed++;
    const c = (placed * 2 + ((rnd() * 2) | 0)) % BAUBLES.length;  // every colour about as often
    parts.push(`<g class="bauble"><ellipse cx="${f1(x + r * .45)}" cy="${f1(y + r * .75)}" rx="${f1(r * .95)}" ry="${f1(r * .45)}" class="bauble-shadow"/>` +
      `<path d="M${f1(x)},${f1(y - r - 9)}v6" class="hook"/><rect x="${f1(x - 2.6)}" y="${f1(y - r - 4)}" width="5.2" height="4.5" rx="1" fill="url(#xgold)"/>` +
      `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#xb${c})"/>` +
      `<ellipse cx="${f1(x - r * .38)}" cy="${f1(y - r * .42)}" rx="${f1(r * .3)}" ry="${f1(r * .2)}" transform="rotate(-35 ${f1(x - r * .38)} ${f1(y - r * .42)})" fill="rgba(255,255,255,.75)"/>` +
      `<path d="M${f1(x + r * .3)},${f1(y + r * .75)}a${f1(r)},${f1(r)} 0 0 0 ${f1(r * .5)},${f1(-r * .6)}" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1"/>` +
      (rnd() < .35 ? `<path d="M${f1(x - r)},${f1(y)}a${f1(r)},${f1(r * .35)} 0 0 0 ${f1(r * 2)},0" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.6"/>` : "") + `</g>`);
  }
  // Candy canes
  [[262, 300, -14], [372, 452, 12], [295, 392, 8]].forEach(([x, y, a]) => {
    const d = `M0,0v-20a7,7 0 0 1 14,0v3`;
    parts.push(`<g transform="translate(${x},${y}) rotate(${a})"><path d="${d}" class="cane"/><path d="${d}" class="cane-stripes"/></g>`);
  });
  defs.push(`<radialGradient id="xgiftfoot"><stop offset="0" stop-color="rgba(50,0,10,.5)"/><stop offset="1" stop-color="rgba(50,0,10,0)"/></radialGradient>`,
    `<linearGradient id="xgiftfloor" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,.25)"/></linearGradient>`,
    `<pattern id="xpdots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.3" fill="rgba(255,215,90,.75)"/><circle cx="7" cy="7" r="1.3" fill="rgba(255,215,90,.75)"/></pattern>`,
    `<pattern id="xpstripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="3" height="8" fill="rgba(255,255,255,.16)"/></pattern>`,
    `<pattern id="xpflakes" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M4,1v6M1,4h6M2,2l4,4M6,2l-4,4M11,8v5M8.5,10.5h5" stroke="rgba(255,255,255,.55)" stroke-width=".7"/></pattern>`);
  GIFTS.forEach(gift => parts.push(giftBox(gift)));  // the gifts (giftBox, above)
  defs.push(`<linearGradient id="xshade" x1="0" x2="1"><stop offset="0" stop-color="rgba(255,255,255,.18)"/><stop offset=".6" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,.25)"/></linearGradient>`);
  // Star on the top, cut in facets: each point is two triangles from the centre, the one facing the
  // light (top left) bright, the other in shade
  const starPts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 11 : 27;
    return [TREE_X + Math.cos(a) * r, 30 + Math.sin(a) * r, a];
  });
  const star = starPts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ");
  let facets = "";
  starPts.forEach(([x, y, a], i) => {
    if (i % 2) return;
    [starPts[(i + 9) % 10], starPts[i + 1]].forEach(([ix, iy], k) => {
      // how much this facet faces the top left: its middle direction from the centre
      const mid = a + (k ? 1 : -1) * Math.PI / 10, lit = Math.cos(mid - Math.PI * 1.25);
      const fill = lit > .3 ? "#fff6c4" : lit > -.3 ? "#ffd04a" : "#c98a0c";
      facets += `<polygon points="${TREE_X},30 ${f1(x)},${f1(y)} ${f1(ix)},${f1(iy)}" fill="${fill}"/>`;
    });
  });
  parts.push(`<polygon points="${star}" fill="url(#xstar)"/>${facets}<polygon points="${star}" fill="none" stroke="#a8740a" stroke-width="1.2" stroke-linejoin="round"/>` +
    `<circle cx="${TREE_X - 6}" cy="22" r="2.2" fill="rgba(255,255,255,.85)"/>`);
  return `<svg viewBox="0 0 ${TREE_W} ${TREE_H}" preserveAspectRatio="xMidYMax meet"><defs>${defs.join("")}</defs>${parts.join("")}</svg>`;
};
