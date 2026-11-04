// ── Sakura: the dragon crossing the sky ─────────────────────────────────────────────────────────
// The Lake Dragon of Konami's games (its sprites ripped by Badbatman3, used with permission: the
// sheet is tools/sakura/src/lake-dragon.png, cut by tools/sakura/cut.py into img/sakura/dragon.png),
// snaking across the sky in pixel art, as in the sheet's assembled view: its head, then its
// armoured balls narrowing little by little to its tail. Each part follows the one before it at its
// distance (follow the leader), so the body winds behind the head along its path; the balls stay
// upright, belly down, as in the sheet, their two frames alternating (the scales shimmer); the
// head leans with its climb or dive, opening and shutting its jaws (the sheet's two heads); flying left, every sprite is
// mirrored. The sprites are drawn at a whole number of screen pixels per sprite pixel (skPixel()),
// without smoothing: crisp pixels. They are tinted by the hour (skTintRGB, skscene.js).
// skDragonNew() makes one (skvisitors.js sends it), skDragonStep(d, dt) moves it and says whether
// it is still in view, skDragonDraw(g, d, t) draws it.
const SK_DRAGON_SPR = {  // in the sprite sheet: x, y, width, height
  head: [173, 15, 61, 42], jaws: [239, 15, 61, 50],
  ball: [89, 27, 32, 32], ball2: [125, 27, 32, 32],
  small: [45, 38, 16, 16], small2: [64, 38, 16, 16],
  tail: [3, 39, 31, 17],
};
// The body, from the neck back: its balls narrowing little by little (full for the first four,
// then down to 40 %), the big ball's sprite while it is big enough, then the small one's; each
// ball at a distance from the one before that follows their sizes; the tail at the end
const SK_DRAGON_BALLS = 14;
const SK_DRAGON_BODY = Array.from({ length: SK_DRAGON_BALLS }, (_, i) => ({ k: i < 4 ? 1 : 1 - (i - 3) / (SK_DRAGON_BALLS - 4) * .6 }))
  .map((b, i, all) => Object.assign(b, { gap: i ? 21 * (all[i - 1].k + b.k) / 2 : 9 }));
SK_DRAGON_BODY.push({ tail: true, gap: 12 });
const skDragonSheet = new Image();
let skDragonTinted = null;  // the sheet tinted by the hour (a canvas)
const skPixel = () => Math.max(2, Math.round(skLay.H / 330));
const skDragonTint = () => {
  if (!skDragonSheet.complete || !skDragonSheet.naturalWidth) return null;
  const c = document.createElement("canvas"), g = c.getContext("2d"), m = typeof skTintRGB === "function" ? skTintRGB(skL) : [1, 1, 1];
  c.width = skDragonSheet.naturalWidth; c.height = skDragonSheet.naturalHeight;
  g.drawImage(skDragonSheet, 0, 0);
  // multiply by the colour of the hour, then keep the sprites' own alpha
  g.globalCompositeOperation = "multiply";
  g.fillStyle = skRgb(m.map(v => Math.min(1, v)));
  g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = "destination-in";
  g.drawImage(skDragonSheet, 0, 0);
  return (skDragonTinted = c);
};

const skDragonNew = () => {
  if (!skDragonSheet.src) skDragonSheet.src = SK_IMG + "dragon.png";
  const { W, H } = skLay, dir = Math.random() < .5 ? 1 : -1, P = skPixel();
  const x = dir > 0 ? -60 * P : W + 60 * P, y = H * (.18 + Math.random() * .12);
  return {
    kind: "dragon", t: 0, dir, y0: y, speed: 150 + Math.random() * 40, jaws: 0,
    parts: [[x, y], ...SK_DRAGON_BODY.map((_, i) => [x - dir * (i + 1) * 20 * P, y])],  // the neck, then the body
  };
};
const skDragonStep = (d, dt) => {
  const { W, H } = skLay, P = skPixel(), neck = d.parts[0];
  d.t += dt;
  neck[0] += d.dir * d.speed * dt;
  neck[1] = d.y0 + Math.sin(d.t * 1.1) * H * .08 + Math.sin(d.t * .4 + 1) * H * .05;
  // follow the leader: each part at its distance from the one before
  for (let i = 1; i < d.parts.length; i++) {
    const a = d.parts[i - 1], b = d.parts[i], gap = SK_DRAGON_BODY[i - 1].gap * P;
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    b[0] = a[0] + dx / l * gap;
    b[1] = a[1] + dy / l * gap;
  }
  // its jaws: it opens and shuts its mouth as it flies (the two heads of the sheet)
  d.jaws = d.roaring || (d.t % 1.5) > 1 ? 1 : 0;  // roaring (clicked: skpassages.js), they stay wide
  const tailX = d.parts[d.parts.length - 1][0];
  return d.dir > 0 ? tailX < W + 80 * P : tailX > -80 * P;
};
const skDragonDraw = (g, d, t) => {
  const sheet = skDragonTinted || skDragonTint();
  if (!sheet) return;
  const P = skPixel(), flip = d.dir < 0;
  // a sprite at (x, y): ox, oy the point of the sprite put there (its centre by default), k its scale
  const put = (name, x, y, { rot = 0, k = 1, ox, oy } = {}) => {
    const [sx, sy, sw, sh] = SK_DRAGON_SPR[name], w = Math.round(sw * P * k), h = Math.round(sh * P * k);
    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (flip) g.scale(-1, 1);
    if (rot) g.rotate(rot);
    g.drawImage(sheet, sx, sy, sw, sh, ox === undefined ? -Math.round(w / 2) : -Math.round(ox * P), oy === undefined ? -Math.round(h / 2) : -Math.round(oy * P), w, h);
    g.restore();
  };
  g.save();
  g.imageSmoothingEnabled = false;
  // the tail first, the head last (on top), as in the sheet
  for (let i = d.parts.length - 1; i >= 1; i--) {
    const part = SK_DRAGON_BODY[i - 1], [x, y] = d.parts[i];
    const frame = (Math.floor(t * 4) + i) % 2 ? "2" : "";
    if (part.tail) {
      const [px, py] = d.parts[i - 1];
      put("tail", x, y, { rot: Math.atan2(py - y, (px - x) * d.dir) * .8, k: .9 });
    } else if (part.k > .62) put("ball" + frame, x, y, { k: part.k });
    else put("small" + frame, x, y, { k: part.k * 2 });
  }
  // the head, its back on the neck (the first ball under it), both heads drawn from the same top
  // left corner so the jaw drops when it opens; it leans with the climb or the dive
  const [hx, hy] = d.parts[0], [nx, ny] = d.parts[1];
  const lean = Math.max(-.35, Math.min(.35, Math.atan2(hy - ny, Math.abs(hx - nx))));
  put(d.jaws ? "jaws" : "head", hx, hy, { rot: lean, ox: 8, oy: 25 });
  g.restore();
};
skPart({ light() { skDragonTinted = null; } });
