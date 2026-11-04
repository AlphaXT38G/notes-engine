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
let skBigSprites = [], skSprites = [], skPetals = [], skSlashes = [], skFlies = [], skSpawnB = 0, skSpawnF = 0;

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
  // k: drawn k times bigger (the petals of the storm come right up to us)
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
  skBigSprites = SK_PETAL_COLORS.map(col => make(col, 0, 3));
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
const skPetalBurst = (x, y, n = 30) => {
  for (let i = 0; i < n; i++) {
    const p = skSpawn(Math.random() < .15, [x + (Math.random() - .5) * 160, y + (Math.random() - .5) * 90]);
    p.vx += (Math.random() - .6) * 160;
    p.vy = (Math.random() - .7) * 120;
    skPetals.push(p);
  }
};
// Distance from a point to a segment
const skSegDist = (px, py, x0, y0, x1, y1) => {
  const dx = x1 - x0, dy = y1 - y0, t = skClamp(((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(px - x0 - t * dx, py - y0 - t * dy);
};
const skSlash = (x0, y0, x1, y1) => {
  skSlashes.push({ x0, y0, x1, y1, t: 0 });
  const add = [];
  skPetals = skPetals.filter(p => {
    if (p.half || skSegDist(p.x, p.y, x0, y0, x1, y1) > 26 * p.z) return true;
    // cut: the two halves part across the cut, spinning
    const nx = -(y1 - y0), ny = x1 - x0, n = Math.hypot(nx, ny) || 1;
    [1, 2].forEach(h => add.push(Object.assign({}, p, { half: h, vx: p.vx + nx / n * (h === 1 ? 70 : -70), vy: p.vy + ny / n * (h === 1 ? 70 : -70) - 30, va: (h === 1 ? 6 : -6) })));
    return false;
  });
  skPetals.push(...add);
};

// The fireflies of the night, over the valley and the knoll
const skMakeFlies = () => {
  const { W, H } = skLay;
  skFlies = Array.from({ length: Math.round(Math.min(22, W / 70)) }, () => ({
    x: W * (.15 + Math.random() * .85), y: H * (.55 + Math.random() * .4), ph: Math.random() * 6.3, sp: .3 + Math.random() * .6, flee: 0, away: 0, back: 1,
  }));
};
const skFlyGlow = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d"), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, "rgba(255,255,210,1)"); gr.addColorStop(.25, "rgba(255,236,140,.8)"); gr.addColorStop(1, "rgba(255,200,80,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  return c;
})();

// ── The storm of petals ──
// The great tree shaken again and again (skplay.js) lets go of all its petals at once, and they
// come at us: thousands of petals in 3D, blown from the tree towards the window, growing as they
// come near (their screen size is their size over their distance), swirling in the wind; those
// that reach us hit the glass and cling to it, big, until the view is covered with petals, then
// slide down it and fall away. On the front canvas, over the courses; a long rushing wind with it.
// skPetalStorm() starts it.
let skStorm = null;
const SK_STORM_BLOW = 4.2;  // seconds of petals blown at us
const skPetalStorm = () => {
  if (skStorm || skStill()) return;
  const { W } = skLay, tree = skCrownImg(), r = tree && tree.getBoundingClientRect();
  skStorm = { t: 0, from: r ? Math.min(W - 60, r.left + r.width * .75) : W * .8, flying: [], stuck: [], rate: Math.min(1500, W * .8) };
  skGust(1.5);
  skNoise(7.5, 420, "bandpass", .4, 0, .6, .4);
  skNoise(6, 1500, "bandpass", .12, .5, 3, .6);
};
const skStormStep = (g, dt) => {
  const S = skStorm, { W, H } = skLay, F = Math.max(W, H) * .9, cx = W / 2, cy = H / 2;
  S.t += dt;
  // new petals, blown from the tree's side of the scene towards us, more and more, then none
  if (S.t < SK_STORM_BLOW) {
    let n = S.rate * dt * skSmooth(0, .8, S.t);
    while (n-- > 0 && S.flying.length < 2200) {
      const z = 4 + Math.random() * 7, sx = skMix(S.from, W * (Math.random() * 1.2 - .1), .4 + Math.random() * .6), sy = H * (Math.random() * .9 - .1);
      S.flying.push({
        x: (sx - cx) * z / F, y: (sy - cy) * z / F, z, vz: -(2.4 + Math.random() * 2.2),
        vx: (Math.random() - .5) * .8, vy: (Math.random() - .3) * .5, ph: Math.random() * 6.3,
        s: (Math.random() * SK_PETAL_COLORS.length) | 0, f: Math.random() * 6.3, vf: 3 + Math.random() * 5, rot: Math.random() * 6.3, vr: (Math.random() - .5) * 4,
      });
    }
  }
  // the flying petals: they come at us, swirl in the wind; at the glass, they cling to it
  const keep = [];
  for (const p of S.flying) {
    p.z += p.vz * dt;
    p.x += (p.vx + Math.sin(S.t * 2.1 + p.ph) * .6) * dt;
    p.y += (p.vy + Math.cos(S.t * 1.7 + p.ph) * .4 + .15) * dt;
    p.f += p.vf * dt; p.rot += p.vr * dt;
    const sx = cx + p.x / p.z * F, sy = cy + p.y / p.z * F, sz = 6 / p.z * F / 60;
    if (p.z < .9) {
      if (S.stuck.length < 1400 && sx > -40 && sx < W + 40 && sy > -40 && sy < H + 40) {
        S.stuck.push({ x: sx, y: sy, sz: Math.min(sz, 150) * (.7 + Math.random() * .3), rot: p.rot, s: p.s, k: Math.cos(p.f) * .4 + .7, t: 0, slide: 0, hold: 2 + Math.random() * 2.5 });
        if (Math.random() < .02) skNoise(.04, 2400, "bandpass", .05);  // a soft tap on the glass
      }
      continue;
    }
    if (sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) continue;
    keep.push(p);
    const k = Math.cos(p.f), c = Math.cos(p.rot), s = Math.sin(p.rot);
    g.globalAlpha = Math.min(1, (12 - p.z) / 3);
    g.setTransform(c, s, -s * k, c * k, sx, sy);
    g.drawImage(skBigSprites[p.s], -sz / 2, -sz / 2, sz, sz);
  }
  S.flying = keep;
  // the petals on the glass: they cling a while, then slide down and fall away, fading
  S.stuck = S.stuck.filter(p => {
    p.t += dt;
    if (p.t > p.hold) { p.slide += dt * (60 + p.sz); p.y += p.slide * dt; }
    const fade = 1 - skSmooth(p.hold + .5, p.hold + 2.5, p.t);
    if (fade <= 0 || p.y > H + p.sz) return false;
    const c = Math.cos(p.rot), s = Math.sin(p.rot);
    g.globalAlpha = .95 * fade;
    g.setTransform(c, s, -s * p.k, c * p.k, p.x, p.y);
    g.drawImage(skBigSprites[p.s], -p.sz / 2, -p.sz / 2, p.sz, p.sz);
    return true;
  });
  g.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (S.t > SK_STORM_BLOW && !S.flying.length && !S.stuck.length) skStorm = null;
};

// Catching a petal: the nearest to the click, near enough
const skPetalNear = (x, y) => {
  let best = null, bd = 1e9;
  for (const p of skPetals) {
    if (p.half) continue;
    const d = Math.hypot(p.x - x, p.y - y), r = Math.max(14, 16 * p.z);
    if (d < r && d < bd) { best = p; bd = d; }
  }
  return best;
};
skHit({
  title: "A falling petal",
  test: (x, y) => skPetals.length > 0 && !!skPetalNear(x, y),
  click(x, y) {
    const p = skPetalNear(x, y);
    if (!p) return;
    skPetals.splice(skPetals.indexOf(p), 1);
    skSlashes.push({ ring: true, x: p.x, y: p.y, t: 0 });
    skTone(1568 + ((Math.random() * 5) | 0) * 196, .9, { gain: .05 });
  },
});

// ── The loop ──
const skPetalStep = (p, dt, t) => {
  const wind = skWind;
  const tvx = -(30 + 170 * wind) * (.6 + .5 * p.z), tvy = 22 + 26 * p.z;
  p.vx += (tvx - p.vx) * Math.min(1, dt * .9);
  p.vy += (tvy - p.vy) * Math.min(1, dt * .7);
  p.sway += dt * (1.2 + p.z);
  // the pointer: pushes away and swirls what is near, drags with its speed
  if (skPointer.x >= 0) {
    const dx = p.x - skPointer.x, dy = p.y - skPointer.y, d = Math.hypot(dx, dy), R = 130;
    if (d < R && d > 1) {
      const k = (1 - d / R) * 900 * dt;
      p.vx += dx / d * k - dy / d * k * .6 + skPointer.vx * .02 * (1 - d / R);
      p.vy += dy / d * k + dx / d * k * .6 + skPointer.vy * .02 * (1 - d / R);
    }
  }
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
    skSlashes = [];
  },
  off() { skPetalBack.remove(); skPetalFront.remove(); skPetals = []; skStorm = null; },
  resize() {
    const { W, H } = skLay;
    [skPetalBack, skPetalFront].forEach(c => { c.width = W; c.height = H; });
    skMakeFlies();
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
    // the fireflies, at night
    const lamp = skSmooth(.3, .8, skL.night);
    if (lamp > .01) {
      skPB.setTransform(1, 0, 0, 1, 0, 0);
      skPB.globalCompositeOperation = "lighter";
      for (const f of skFlies) {
        if (f.away > 0) {  // flown off: back a while later, somewhere else
          f.away -= dt;
          if (f.away <= 0) Object.assign(f, { x: W * (.15 + Math.random() * .85), y: H * (.55 + Math.random() * .4), flee: 0, back: 0 });
          continue;
        }
        if (f.flee > 0) {  // startled: away from the click and up, brighter, fading
          f.flee -= dt;
          f.x += f.vx * dt; f.y += f.vy * dt;
          f.vx *= .985; f.vy -= 30 * dt;
          if (f.flee <= 0) f.away = 5 + Math.random() * 6;
        } else {
          f.back = Math.min(1, (f.back || 0) + dt * .5);  // fading in when it comes back
          f.x += Math.sin(t * f.sp + f.ph) * 14 * dt;
          f.y += Math.cos(t * f.sp * 1.3 + f.ph * 2) * 10 * dt;
        }
        const glow = f.flee > 0 ? Math.min(1, f.flee / 1.2) * 1.4 : (.35 + .65 * Math.max(0, Math.sin(t * 1.4 * f.sp + f.ph))) * f.back;
        skPB.globalAlpha = Math.min(1, lamp * glow);
        const r = f.flee > 0 ? 16 : 12;
        skPB.drawImage(skFlyGlow, f.x - r, f.y - r, r * 2, r * 2);
      }
      skPB.globalCompositeOperation = "source-over";
      skPB.globalAlpha = 1;
    }
    if (skStorm) skStormStep(skPF, dt);
    // the cuts (white crescents) and the catches (a ring of light)
    skPF.setTransform(1, 0, 0, 1, 0, 0);
    skSlashes = skSlashes.filter(sl => {
      sl.t += dt;
      if (sl.ring) {
        const k = sl.t / .6;
        skPF.globalAlpha = Math.max(0, 1 - k);
        skPF.strokeStyle = "#fff4f8";
        skPF.lineWidth = 2;
        skPF.beginPath(); skPF.arc(sl.x, sl.y, 6 + k * 26, 0, 6.3); skPF.stroke();
        return k < 1;
      }
      const k = sl.t / .45, mx = (sl.x0 + sl.x1) / 2, my = (sl.y0 + sl.y1) / 2 - 40;
      skPF.globalAlpha = Math.max(0, 1 - k);
      skPF.lineCap = "round";
      [[18, "rgba(255,190,220,.35)"], [7, "rgba(255,255,255,.8)"], [2.5, "#fff"]].forEach(([w, col]) => {
        skPF.strokeStyle = col;
        skPF.lineWidth = w * (1 - k * .6);
        skPF.beginPath(); skPF.moveTo(sl.x0, sl.y0); skPF.quadraticCurveTo(mx, my, sl.x1, sl.y1); skPF.stroke();
      });
      return k < 1;
    });
    skPF.globalAlpha = 1;
  },
});
