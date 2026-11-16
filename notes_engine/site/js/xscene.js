// ── The Christmas winter scene (both Christmas screens, christmas.js) ──
// The layers of the scene (#xscene behind the page, with #xtree; #xtree-front above it for the
// hidden shortcuts), the mountains and their chalet lights, the moon and the snowman (his games:
// snowman.js). Built once, put on the page by xswitch.js.

const scene = document.createElement("div"), tree = document.createElement("div"), treeFront = document.createElement("div");
scene.id = "xscene";
scene.setAttribute("aria-hidden", "true");
tree.id = "xtree";
treeFront.id = "xtree-front";
// Mountains filling the background, kept discreet (colours close to the sky's): three ranges, the
// farther ones higher and paler, each ridge made natural by midpoint displacement between a few
// chosen peaks, with snow on the tops (the range itself clips a jagged snow line), then the snowy
// ground. At night, small yellow chalet lights, soft as if seen through cold air, dot the
// slopes: a few hamlets and lone ones, smaller and dimmer on the far ranges, drawn with their own
// range so the nearer ranges hide them (CSS shows them at night only, some flickering slowly).
// The softness is in their gradients, not in blur filters: a flickering light is redrawn on every
// frame, and a blur would run again each time.
// Drawn once in a 1600 x 700 box, scaled to cover the bottom of the window. ridges keeps each
// range's outline (y at a given x).
const ridges = [];
const MOUNTAINS = (() => {
  const rnd = seeded(77), W = 1600, H = 700;
  const ridge = (peaks, rough) => {  // peaks: [x, y] control points, rough: displacement amplitude
    let pts = peaks;
    for (let level = 0, amp = rough; level < 6; level++, amp *= .55) {
      const next = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        next.push([(x0 + x1) / 2, (y0 + y1) / 2 + (rnd() - .5) * amp], [x1, y1]);
      }
      pts = next;
    }
    return pts;
  };
  const yAt = (pts, x) => {
    const i = Math.max(1, pts.findIndex(([px]) => px >= x));
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + (y1 - y0) * ((x - x0) / ((x1 - x0) || 1));
  };
  const RANGES = [
    ["m0", [[0, 300], [180, 170], [330, 250], [520, 95], [700, 230], [860, 130], [1040, 210], [1230, 70], [1420, 200], [1600, 140]], 70, 70],
    ["m1", [[0, 360], [150, 300], [300, 380], [470, 250], [640, 360], [820, 270], [1000, 390], [1160, 280], [1350, 370], [1600, 290]], 60, 55],
    ["m2", [[0, 470], [200, 420], [380, 480], [560, 430], [760, 500], [960, 440], [1180, 505], [1380, 445], [1600, 480]], 40, 0],
  ];
  let svg = `<svg class="mountains" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice"><defs>` +
    // the glow around a window, and the window itself with a soft edge
    `<radialGradient id="xchalet"><stop offset="0" stop-color="rgba(255,205,40,.75)"/><stop offset=".4" stop-color="rgba(255,190,30,.32)"/><stop offset="1" stop-color="rgba(255,190,30,0)"/></radialGradient>` +
    `<radialGradient id="xchaletcore"><stop offset=".45" stop-color="#ffd23a"/><stop offset="1" stop-color="rgba(255,210,58,0)"/></radialGradient>`;
  const bodies = RANGES.map(([cls, peaks, rough, snowDepth], i) => {
    const pts = ridge(peaks, rough);
    ridges.push({ cls, pts, y: x => yAt(pts, x) });
    const d = `M${pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ")} ${W},${H}H0Z`;
    svg += `<clipPath id="xclip${i}"><path d="${d}"/></clipPath>`;
    let snow = "";
    if (snowDepth) {  // jagged snow line, running a little below the tops
      const top = Math.min(...pts.map(([, y]) => y));
      const line = Array.from({ length: 81 }, (_, k) => {
        const x = k * W / 80, y = Math.max(top + snowDepth * .6, yAt(pts, x) + snowDepth * (.5 + rnd() * .6));
        return `${f1(x)},${f1(y)}`;
      });
      snow = `<path class="caps ${cls}c" clip-path="url(#xclip${i})" d="M0,0 ${line.join(" ")} ${W},0Z"/>`;
    }
    // chalets: hamlets of 2 to 5 lights, and lone ones, below the snow line and above the ground
    const far = 1 - i * .35, lights = [];
    for (let h = 0; h < 6 + i * 2; h++) {
      const x0 = 20 + rnd() * (W - 40), n = rnd() < .4 ? 1 : 2 + ((rnd() * 4) | 0);
      for (let k = 0; k < n; k++) {
        const x = Math.min(W - 5, Math.max(5, x0 + (rnd() - .5) * 40)), y = yAt(pts, x) + 30 + snowDepth * .8 + rnd() * (90 - i * 25);
        if (y > 630) continue;
        const r = (1.6 + rnd() * .9) * (1.4 - far * .5);
        // dimmed with fill-opacity (inherited), so that the flicker can animate the group's opacity
        lights.push(`<g class="chalet${rnd() < .3 ? " flicker" : ""}" style="--d:${f1(-rnd() * 6)}s;fill-opacity:${f1(.6 + (1 - far) * .4)}">` +
          `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 5.5)}" fill="url(#xchalet)"/>` +
          `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 1.8)}" fill="url(#xchaletcore)"/></g>`);
      }
    }
    return `<path class="${cls}" d="${d}"/>${snow}<g class="chalets">${lights.join("")}</g>`;
  });
  return svg + `</defs>${bodies.join("")}` +
    `<path class="ground-shade" d="M0,662C200,636 380,652 560,646S900,632 1100,648 1450,638 1600,646V700H0Z"/>` +
    `<path class="ground" d="M0,670C220,646 400,662 580,656S920,644 1120,658 1460,648 1600,656V700H0Z"/></svg>`;
})();
// The moon (night only, CSS), as we see it from here: a full moon with its dark seas (Oceanus
// Procellarum, the Mare Imbrium, Serenitatis, Tranquillitatis, Crisium, Fecunditatis, Nectaris,
// Nubium, Humorum, Frigoris) softly blurred, the bright craters Tycho (with its rays), Copernicus
// and Kepler, dark Plato, a scatter of small craters, and a darker rim (limb darkening).
const MOON = (() => {
  const rnd = seeded(5);
  const seas = [
    "M-44,-14C-46,0-42,18-30,28-24,30-18,24-16,14-14,6-18,-2-14,-10-16,-20-24,-28-34,-26-40,-22-42,-18-44,-14Z",  // Oceanus Procellarum
    "M-28,-22C-28,-32-16,-36-6,-32 2,-28 2,-18-4,-12-10,-8-22,-10-28,-22Z",  // Imbrium
    "M0,-26C2,-32 12,-32 15,-25 16,-18 10,-14 4,-15-1,-17-2,-22 0,-26Z",  // Serenitatis
    "M6,-12C10,-16 22,-14 25,-6 27,2 20,6 13,4 6,2 2,-6 6,-12Z",  // Tranquillitatis
    "M30,-18C34,-21 41,-19 41,-13 41,-8 35,-6 31,-8 28,-10 27,-15 30,-18Z",  // Crisium
    "M24,0C28,-2 34,1 34,7 33,13 26,14 23,10 21,6 21,2 24,0Z",  // Fecunditatis
    "M14,10C17,8 22,10 21,15 20,19 15,19 13,16 12,13 12,11 14,10Z",  // Nectaris
    "M-20,14C-14,10-4,12-2,19-1,26-8,30-16,28-22,26-24,18-20,14Z",  // Nubium
    "M-34,14C-31,11-25,12-25,17-25,22-31,23-34,20-36,18-36,16-34,14Z",  // Humorum
    "M-30,-36C-16,-41 12,-41 26,-35 24,-32 10,-34-2,-34-14,-34-24,-32-30,-36Z",  // Frigoris
  ];
  const small = Array.from({ length: 26 }, () => {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 44, r = .8 + rnd() * 1.6;
    return `<circle cx="${f1(Math.cos(a) * d)}" cy="${f1(Math.sin(a) * d)}" r="${f1(r)}"/>`;
  }).join("");
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = i / 12 * Math.PI * 2 + rnd() * .3, l = 12 + rnd() * 22;
    return `M-6,36l${f1(Math.cos(a) * l)},${f1(Math.sin(a) * l)}`;
  }).join("");
  return `<svg viewBox="-50 -50 100 100" aria-hidden="true"><defs>` +
    `<radialGradient id="moon-disc" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#fffbea"/><stop offset=".7" stop-color="#f4ecd2"/><stop offset="1" stop-color="#d8cca8"/></radialGradient>` +
    `<clipPath id="moon-clip"><circle r="49"/></clipPath><filter id="moon-soft"><feGaussianBlur stdDeviation="1"/></filter></defs>` +
    `<circle r="49" fill="url(#moon-disc)"/><g clip-path="url(#moon-clip)">` +
    `<g fill="#a99f86" opacity=".5" filter="url(#moon-soft)">${seas.map(d => `<path d="${d}"/>`).join("")}</g>` +
    `<path d="${rays}" stroke="rgba(255,255,245,.35)" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
    `<g fill="rgba(140,130,110,.25)" stroke="rgba(255,255,245,.35)" stroke-width=".5">${small}</g>` +
    `<circle cx="-6" cy="36" r="2.2" fill="#fffef6"/><circle cx="-18" cy="-4" r="2.6" fill="#fdf8e6" stroke="#cfc5a6" stroke-width=".5"/>` +
    `<circle cx="-30" cy="-4" r="1.6" fill="#fdf8e6"/><ellipse cx="-6" cy="-37" rx="2.6" ry="1.6" fill="#8e8670"/>` +
    `<circle r="49" fill="none" stroke="rgba(150,135,100,.25)" stroke-width="3"/></g></svg>`;
})();
const moon = document.createElement("div");
moon.id = "xmoon";
moon.innerHTML = MOON;

// The snowman: a big companion standing in the left margin, beside the columns of courses, seen in
// three-quarter view, face turned to the right as if about to look at the courses. Drawn in a
// 300 x 520 box, lit from the top left: lumpy hand-packed snowballs (wobbly outlines) shaded round,
// a grainy snow texture, contact shadows and a snowdrift at its base, irregular lumps of coal, a
// carrot seen in perspective, a battered top hat tilted back with snow on the brim, a knitted scarf
// with one end blowing behind, tapering branches for arms. It blinks, now and then turns its face
// a little more towards the courses, and waves with the arm on that side (CSS). Its hat, nose,
// brows, cheeks, steam, sweat, buttons, eyes, puddle and two halves (to bend at the waist) are
// parts of their own for its games (snowman.js).
// His carrot nose, also drawn on its own when it is taken from him (snowman.js)
const SNOWMAN_NOSE = `<path d="M178,147C192,145 220,150 244,160 222,163 196,162 179,158 175,155 175,149 178,147Z" fill="url(#sm-carrot)"/>` +
  `<path d="M186,148q2,6 0,11M198,149q2,5 0,10M210,152q1.5,4 0,8M222,155q1,3 0,6" stroke="#a5470a" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
const SNOWMAN = (() => {
  const rnd = seeded(31);
  // closed wobbly outline through n points around an ellipse, smoothed (Catmull-Rom to Bezier)
  const lump = (cx, cy, rx, ry, amp) => {
    const n = 22, pts = Array.from({ length: n }, (_, i) => {
      const a = i / n * Math.PI * 2, k = 1 + (rnd() - .5) * amp;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    });
    let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const [p0, p1, p2, p3] = [pts[(i + n - 1) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]];
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
    }
    return d + "Z";
  };
  // an irregular lump of coal, with a glint
  const coal = (x, y, r) => {
    const pts = Array.from({ length: 7 }, (_, i) => {
      const a = i / 7 * Math.PI * 2, k = r * (.75 + rnd() * .45);
      return `${f1(x + Math.cos(a) * k)},${f1(y + Math.sin(a) * k * .9)}`;
    }).join(" ");
    return `<polygon points="${pts}" fill="url(#sm-coal)"/><circle cx="${f1(x - r * .3)}" cy="${f1(y - r * .35)}" r="${f1(r * .22)}" fill="rgba(255,255,255,.6)"/>`;
  };
  // a branch tapering from its base: the same line stroked thinner and thinner, each a bit shorter
  const branch = (x0, y0, x1, y1, w) => [1, .75, .5].map((f, i) => {
    const xe = x0 + (x1 - x0) * (1 - i * .08), ye = y0 + (y1 - y0) * (1 - i * .08);
    return `<path d="M${x0},${y0}L${f1(xe)},${f1(ye)}" stroke-width="${f1(w * f)}"/>`;
  }).join("");
  const BOTTOM = lump(150, 412, 100, 86, .07), MIDDLE = lump(156, 264, 70, 64, .08), HEAD = lump(164, 152, 50, 47, .07);
  const ball = d => `<g class="snow"><path d="${d}" fill="url(#sm-snow)"/><path d="${d}" fill="url(#sm-under)"/><path d="${d}" fill="#fff" filter="url(#sm-grain)" opacity=".55"/></g>`;
  return `<svg viewBox="0 0 300 520" aria-hidden="true"><defs>` +
    `<radialGradient id="sm-snow" cx=".33" cy=".27" r=".8"><stop class="k1" offset="0"/><stop class="k2" offset=".42"/><stop class="k3" offset=".8"/><stop class="k4" offset="1"/></radialGradient>` +
    `<linearGradient id="sm-under" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="rgba(50,75,120,0)"/><stop offset="1" stop-color="rgba(50,75,120,.28)"/></linearGradient>` +
    `<filter id="sm-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="4"/>` +
    `<feColorMatrix values="0 0 0 0 .45  0 0 0 0 .55  0 0 0 0 .72  0 0 0 -2.2 1.25"/><feComposite in2="SourceGraphic" operator="in"/></filter>` +
    `<radialGradient id="sm-contact"><stop offset="0" stop-color="rgba(55,80,125,.5)"/><stop offset="1" stop-color="rgba(55,80,125,0)"/></radialGradient>` +
    `<radialGradient id="sm-ground"><stop offset="0" stop-color="rgba(30,50,90,.4)"/><stop offset="1" stop-color="rgba(30,50,90,0)"/></radialGradient>` +
    `<linearGradient id="sm-drift" x1="0" y1="0" x2="0" y2="1"><stop class="k1" offset="0"/><stop class="k3" offset="1"/></linearGradient>` +
    `<radialGradient id="sm-coal" cx=".35" cy=".3"><stop offset="0" stop-color="#5d5d66"/><stop offset=".55" stop-color="#1e1e25"/><stop offset="1" stop-color="#08080b"/></radialGradient>` +
    `<linearGradient id="sm-carrot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb867"/><stop offset=".45" stop-color="#ee7d18"/><stop offset="1" stop-color="#a8480a"/></linearGradient>` +
    `<linearGradient id="sm-hat" x1="0" x2="1"><stop offset="0" stop-color="#4a4a5a"/><stop offset=".25" stop-color="#2c2c38"/><stop offset=".7" stop-color="#121218"/><stop offset="1" stop-color="#262630"/></linearGradient>` +
    `<linearGradient id="sm-scarf" x1="0" x2="1"><stop offset="0" stop-color="#e8475d"/><stop offset=".5" stop-color="#b3122e"/><stop offset="1" stop-color="#650614"/></linearGradient>` +
    `<pattern id="sm-knit" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><path d="M0,0 3,6 6,0" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.2"/></pattern>` +
    `</defs><ellipse cx="160" cy="500" rx="135" ry="20" fill="url(#sm-ground)"/>` +
    // Two halves, so that he can bend at the waist (snowman.js): below, the bottom ball, its buttons
    // (the lowest one added for a tune of its own), the snowdrift, the hollow left when he scoops
    // snow from his belly, the puddle he becomes when he melts...
    `<g class="lower">${ball(BOTTOM)}<ellipse cx="154" cy="327" rx="60" ry="12" fill="url(#sm-contact)"/>` +
    // (each button its own part: they are a xylophone, snowman.js)
    [[184, 392, 8, 3], [187, 436, 7.5, 4]].map(([x, y, r, i]) => `<g class="btn" data-i="${i}">${coal(x, y, r)}</g>`).join("") +
    `<path d="M20,505C40,470 80,476 100,486 130,474 180,476 210,486 240,474 270,480 285,505Z" fill="url(#sm-drift)"/>` +
    `<g class="dent"><ellipse cx="226" cy="366" rx="15" ry="7" fill="rgba(80,110,160,.35)"/><path d="M212,364q14,8 28,0" stroke="rgba(255,255,255,.8)" stroke-width="2" fill="none"/></g>` +
    `<ellipse class="puddle" cx="155" cy="498" rx="150" ry="22" fill="rgba(95,155,220,.55)" stroke="rgba(255,255,255,.85)" stroke-width="2.5"/></g>` +
    // ... above, the rest: far arm and the scarf end blowing behind, the middle ball, its buttons
    // following the curve of the body turned to the right, the head, the scarf, the near arm
    `<g class="upper"><g class="twig">${branch(100, 252, 40, 196, 7)}${branch(62, 216, 40, 186, 3.5)}${branch(52, 206, 22, 200, 3)}</g>` +
    `<path d="M112,206C92,214 72,228 50,236 58,226 54,220 46,222 66,210 86,200 110,196Z" fill="url(#sm-scarf)"/><path d="M112,206C92,214 72,228 50,236 58,226 54,220 46,222 66,210 86,200 110,196Z" fill="url(#sm-knit)"/>` +
    ball(MIDDLE) + `<ellipse cx="160" cy="198" rx="42" ry="9" fill="url(#sm-contact)"/>` +
    [[178, 240, 6.5, 0], [181, 268, 7, 1], [179, 297, 7, 2]].map(([x, y, r, i]) => `<g class="btn" data-i="${i}">${coal(x, y, r)}</g>`).join("") +
    `<g class="headball">${ball(HEAD)}<g class="face"><g class="look"><g class="eyes"><ellipse cx="166" cy="140" rx="5.5" ry="6.5" fill="url(#sm-coal)"/><ellipse cx="190" cy="138" rx="4.2" ry="6" fill="url(#sm-coal)"/>` +
    `<circle cx="164.5" cy="137.5" r="1.4" fill="rgba(255,255,255,.7)"/><circle cx="188.8" cy="135.8" r="1.1" fill="rgba(255,255,255,.7)"/></g>` +
    // the glowing blue eye of a bad time (the lowest button's tune, snowman.js)
    `<g class="sans"><circle cx="166" cy="140" r="9" fill="rgba(80,190,255,.45)"/><circle cx="166" cy="140" r="4.5" fill="#7fe0ff"/><circle cx="166" cy="140" r="2" fill="#fff"/></g></g>` +
    [[160, 170, 3.2], [168, 175, 3.3], [177, 177, 3.3], [186, 175, 3], [193, 170, 2.6]].map(([x, y, r]) => coal(x, y, r)).join("") +
    `<g class="nose">${SNOWMAN_NOSE}</g>` +
    // when cross (snowman.js): frowning brows, red cheeks
    `<g class="brows"><path d="M156,126 172,133M184,131 199,123" stroke="#1e1e25" stroke-width="3.6" stroke-linecap="round"/></g>` +
    `<g class="blush"><ellipse cx="154" cy="160" rx="8" ry="4.5"/><ellipse cx="200" cy="158" rx="6" ry="4"/></g></g>` +
    // battered top hat tilted back, snow on the brim, red band with holly
    `<g class="hat"><g transform="rotate(-9 164 104)"><ellipse cx="164" cy="106" rx="62" ry="14" fill="#16161d"/><ellipse cx="164" cy="104" rx="60" ry="12" fill="#25252f"/>` +
    `<path d="M126,104C125,80 127,56 129,36 150,30 180,30 201,36 202,58 203,82 202,104 188,111 140,111 126,104Z" fill="url(#sm-hat)"/>` +
    `<ellipse cx="165" cy="36" rx="36" ry="7.5" fill="#3a3a48"/><path d="M146,40c4,8 6,16 4,26" stroke="rgba(255,255,255,.08)" stroke-width="3" fill="none"/>` +
    `<path d="M126,86C140,92 188,92 202,86L202,100C188,107 140,107 126,100Z" fill="#a30d26"/>` +
    `<path d="M190,94c-6,-10 -16,-8 -20,-12 4,6 0,10 6,12 -4,2 0,6 -2,10 6,-4 10,-2 16,-10Z" fill="#1f7a3e"/><circle cx="190" cy="94" r="3.4" fill="#d6203a"/><circle cx="196" cy="90" r="3.2" fill="#c8102e"/>` +
    `<path d="M106,104c6,-6 14,-5 20,-2 6,-4 14,-3 18,1M190,100c6,-5 14,-5 20,0" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9"/></g></g>` +
    // steam puffing out from under the hat when he is about to lose it
    `<g class="steam"><circle cx="122" cy="96" r="7"/><circle cx="206" cy="94" r="6"/><circle cx="118" cy="84" r="5"/></g>` +
    // a drop of sweat, when he gets too warm
    `<path class="sweat" d="M210,112C214,120 217,124 214,128 211,131 205,129 206,124 206,120 208,117 210,112Z" fill="#a9dcf7" stroke="#5aa6d6" stroke-width="1"/></g>` +
    // scarf around the neck, knotted on the right, its end hanging down the front
    `<path d="M108,196C122,214 196,216 212,196L215,212C198,232 120,232 104,212Z" fill="url(#sm-scarf)"/><path d="M108,196C122,214 196,216 212,196L215,212C198,232 120,232 104,212Z" fill="url(#sm-knit)"/>` +
    `<ellipse cx="196" cy="216" rx="11" ry="9" fill="#9b0d22"/>` +
    `<path d="M188,222C186,246 190,270 196,292L216,288C210,266 206,244 204,220Z" fill="url(#sm-scarf)"/><path d="M188,222C186,246 190,270 196,292L216,288C210,266 206,244 204,220Z" fill="url(#sm-knit)"/>` +
    `<path d="M190,244 207,242M192,264 210,262" stroke="rgba(255,255,255,.4)" stroke-width="4"/>` +
    `<path d="M197,292v9M201,291v11M205,290v9M209,290v10M213,289v8" stroke="#b3122e" stroke-width="2.2" stroke-linecap="round"/>` +
    // near arm, towards the courses: the one that waves
    `<g class="wave"><g class="twig">${branch(218, 258, 274, 212, 7)}${branch(250, 232, 280, 224, 3.5)}${branch(262, 222, 262, 194, 3)}</g></g></g></svg>`;
})();
const snowman = document.createElement("div");
snowman.id = "xsnowman";
snowman.innerHTML = SNOWMAN;
