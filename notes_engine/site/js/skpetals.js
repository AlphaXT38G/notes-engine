// ── Sakura: the petals in the air, the fireflies, the slash ─────────────────────────────────────
// Petals come off the great tree's crown (where it is painted: skOpaqueAt) and from the top of
// the window, and drift left with the wind (skWind, sakura.js), fluttering: each one turns and
// flips over (drawn squashed by the cosine of its flip). Two canvases: the far, small ones behind
// the courses (in #skscene, over the landscape), the near ones, a little bigger, in front of them
// (#skfront, click-through), few. The pointer pushes them away and swirls them; its speed drags
// them. A click on one catches it (skHit, sakura.js). Shaken again and again, the tree lets go of
// a storm of petals blown at us, covering the window (skPetalStorm).
// skPetalBurst(x, y, n) throws a handful (the tree shaken); skSlash(x0, y0, x1, y1) draws the
// samurai's cut, a white crescent, and cuts in two the petals it crosses (the halves part).
// At night, fireflies wander over the valley and the knoll, on the back canvas.
// The petals' colours follow the hour: their sprites are drawn again, tinted, when it changes.
const skPetalBack = document.createElement("canvas"), skPetalFront = document.createElement("canvas");
skPetalBack.className = "skpetals";
skPetalFront.className = "skpetals skpetals-front";
const skPB = skPetalBack.getContext("2d"), skPF = skPetalFront.getContext("2d");
const SK_PETAL_COLORS = ["#ff8fb8", "#ff6fa5", "#f4589a", "#ffb3cd", "#ff7eb0"];
let skSprites = [], skPetals = [], skSpawnB = 0, skSpawnF = 0;

// The sprites: a petal (a rounded drop with a notch at its tip, light at its base), its two
// halves (for the cut), each in every colour
const skPetalPath = g => {
  g.beginPath();
  g.moveTo(20, 37);
  g.bezierCurveTo(5, 30, 3, 12, 14, 5);
  g.quadraticCurveTo(17, 3, 20, 9);
  g.quadraticCurveTo(23, 3, 26, 5);
  g.bezierCurveTo(37, 12, 35, 30, 20, 37);
  g.closePath();
};
const skMakeSprites = () => {
  const m = typeof skTintRGB === "function" ? skTintRGB(skL) : [1, 1, 1];
  const tint = hex => skRgb(skHex(hex).map((c, i) => c * m[i]));
  const make = (col, half, k = 1) => {
    const c = document.createElement("canvas");
    c.width = c.height = 40 * k;
    const g = c.getContext("2d");
    g.scale(k, k);
    g.save();
    if (half) { g.beginPath(); g.rect(half === 1 ? 0 : 20, 0, 20, 40); g.clip(); }
    skPetalPath(g);
    const grad = g.createLinearGradient(20, 37, 20, 4);
    grad.addColorStop(0, tint("#fff2f6"));
    grad.addColorStop(.35, tint(col));
    grad.addColorStop(1, tint(col));
    g.fillStyle = grad;
    g.fill();
    g.strokeStyle = "rgba(160,30,80,.35)";
    g.lineWidth = .8;
    g.stroke();
    g.beginPath(); g.moveTo(20, 35); g.quadraticCurveTo(19, 22, 20, 12);
    g.strokeStyle = "rgba(255,255,255,.45)"; g.lineWidth = 1; g.stroke();
    g.restore();
    return c;
  };
  skSprites = SK_PETAL_COLORS.map(col => [0, 1, 2].map(half => make(col, half)));
};

// Where the tree's crown is on the screen (the petals come from there)
const skCrownImg = () => skBack.querySelector(".sktree");
const skSpawn = (front, at) => {
  const { W, H } = skLay;
  let x, y;
  if (at) [x, y] = at;
  else {
    const tree = skCrownImg(), r = tree && tree.getBoundingClientRect();
    if (r && Math.random() < .8) {
      for (let k = 0; k < 4; k++) {  // a point of the painted crown, in view
        x = r.left + r.width * (.05 + Math.random() * .8);
        y = Math.max(0, r.top) + Math.random() * Math.max(10, Math.min(H, r.top + r.height * .55) - Math.max(0, r.top));
        if (skOpaqueAt(tree, x, y)) break;
      }
    } else { x = Math.random() * W * 1.1; y = -20; }
  }
  const z = front ? 1.1 + Math.random() * .5 : .35 + Math.random() * .7;
  return {
    x, y, z, vx: -20 - Math.random() * 30, vy: 10 + Math.random() * 20, a: Math.random() * 6.3, va: (Math.random() - .5) * 3,
    f: Math.random() * 6.3, vf: 1.5 + Math.random() * 3, s: (Math.random() * SK_PETAL_COLORS.length) | 0, half: 0, front,
    sway: Math.random() * 6.3, life: 0,
  };
};
// ── The loop ──
const skPetalStep = (p, dt, t) => {
  const wind = skWind;
  const tvx = -(30 + 170 * wind) * (.6 + .5 * p.z), tvy = 22 + 26 * p.z;
  p.vx += (tvx - p.vx) * Math.min(1, dt * .9);
  p.vy += (tvy - p.vy) * Math.min(1, dt * .7);
  p.sway += dt * (1.2 + p.z);
  p.x += (p.vx + Math.sin(p.sway) * 26 * p.z) * dt;
  p.y += p.vy * dt;
  p.a += p.va * dt;
  p.f += p.vf * dt * (1 + wind);
  p.life += dt;
};
const skPetalDraw = (g, p) => {
  const sz = (p.front ? 18 : 15) * p.z, k = Math.cos(p.f), c = Math.cos(p.a), s = Math.sin(p.a);
  g.setTransform(c, s, -s * k, c * k, p.x, p.y);
  g.globalAlpha = p.half ? Math.max(0, 1 - p.life * .25) : 1;
  g.drawImage(skSprites[p.s][p.half], -sz / 2, -sz / 2, sz, sz);
};
skPart({
  on() {
    skBack.append(skPetalBack);
    skFront.prepend(skPetalFront);
    skPetals = [];
  },
  off() { skPetalBack.remove(); skPetalFront.remove(); skPetals = []; },
  resize() {
    const { W, H } = skLay;
    [skPetalBack, skPetalFront].forEach(c => { c.width = W; c.height = H; });
  },
  light() { skMakeSprites(); },
  frame(dt, t) {
    const { W, H } = skLay;
    if (!skSprites.length) skMakeSprites();
    // new petals, more with the wind; fewer near ones (in front of the courses)
    const few = W < 700 ? .5 : 1;
    skSpawnB += dt * (5 + 9 * skWind) * few;
    skSpawnF += dt * (.5 + 1.2 * skWind) * few;
    const back = skPetals.filter(p => !p.front).length, front = skPetals.length - back;
    while (skSpawnB >= 1) { skSpawnB--; if (back < 70 * few) skPetals.push(skSpawn(false)); }
    while (skSpawnF >= 1) { skSpawnF--; if (front < 12 * few) skPetals.push(skSpawn(true)); }
    skPetals = skPetals.filter(p => { skPetalStep(p, dt, t); return p.y < H + 40 && p.x > -60 && p.x < W + 200 && p.life < 40; });
    skPB.setTransform(1, 0, 0, 1, 0, 0);
    skPB.clearRect(0, 0, W, H);
    skPF.setTransform(1, 0, 0, 1, 0, 0);
    skPF.clearRect(0, 0, W, H);
    for (const p of skPetals) skPetalDraw(p.front ? skPF : skPB, p);
    skPB.globalAlpha = skPF.globalAlpha = 1;
  },
});
