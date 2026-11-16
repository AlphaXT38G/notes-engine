// ── The snowman's snowball, drawn (snowman.js) ──
// The particles of snow (crumbs, spray) and the bitmaps of the snowball, its lumps and its splash,
// drawn once; smthrow.js throws them.

// Snow crumbs and spray: particles with gravity and drag on a canvas over the page, drawn while
// any lives
const smParticles = id => {
  const cv = smExtra("canvas", id), ctx = cv.getContext("2d"), list = [];
  cv.width = innerWidth;
  cv.height = innerHeight;
  let last = 0, raf = null;
  const frame = now => {
    raf = null;
    const dt = Math.min(.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(120,150,200,.55)";
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i], d = Math.pow(p.drag, dt);
      p.vx *= d;
      p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) { list.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.life * 3);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (list.length && cv.isConnected) raf = requestAnimationFrame(frame);
  };
  // n particles from x, y: speed (px/s) in all directions, up (px/s) more upwards, size, life (s)
  const add = (x, y, n, speed, up, r, life, g = 900, drag = .5) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (.3 + Math.random() * .7);
      list.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up, r: r * (.4 + Math.random() * .8), life: life * (.6 + Math.random() * .6), g, drag });
    }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  };
  return { add, cv };
};

// ── The snowball. Drawn once on canvases, as bitmaps (growing them redraws nothing): the ball, a
// lumpy sphere of packed snow lit from the top left, grainy, with the creases of the hands; and
// three lumps of snow, for what sticks on the window after.
const smLump = (ctx, cx, cy, r, amp, n, rnd) => {  // a closed, wobbly outline, smoothed
  const pts = Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2, k = 1 + (rnd() - .5) * amp;
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
  });
  const mid = i => { const p = pts[i % n], q = pts[(i + 1) % n]; return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
  ctx.beginPath();
  ctx.moveTo(...mid(0));
  for (let i = 1; i <= n; i++) { const m = mid(i); ctx.quadraticCurveTo(pts[i % n][0], pts[i % n][1], m[0], m[1]); }
  ctx.closePath();
};
// grain on snow: thousands of specks, light and dark (n per pixel of width, grain: their size)
const smGrain = (ctx, rnd, size, n, grain, light, dark) => {
  for (let i = 0; i < size * n; i++) {
    const s = size / grain * (.6 + rnd() * 1.6);
    ctx.fillStyle = rnd() < .5 ? light : dark;
    ctx.fillRect(rnd() * size, rnd() * size, s, s);
  }
};
const smSnowImage = (size, seed, amp, n, creases, lump) => {  // lump: a flat splash, lighter
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d"), rnd = seeded(seed), h = size / 2, r = size * .46;
  smLump(ctx, h, h, r, amp, n, rnd);
  const g = ctx.createRadialGradient(h * .7, h * .6, r * .05, h, h, r * 1.05);
  [[0, "#ffffff"], [.4, lump ? "#fbfdff" : "#f5f8fc"], [.78, lump ? "#eaf0f7" : "#dbe5f0"], [1, lump ? "#cfdbe9" : "#aabdd4"]].forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  smGrain(ctx, rnd, size, 9, 400, "rgba(255,255,255,.7)", "rgba(110,140,185,.18)");
  // the creases of the hands that packed it
  ctx.lineCap = "round";
  for (let i = 0; i < creases; i++) {
    const a = rnd() * Math.PI * 2, d = r * (.2 + rnd() * .6), x = h + Math.cos(a) * d, y = h + Math.sin(a) * d, l = r * (.15 + rnd() * .25), b = a + Math.PI / 2 + (rnd() - .5);
    ctx.strokeStyle = "rgba(120,150,195,.28)";
    ctx.lineWidth = size / 150;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(b) * l, y - Math.sin(b) * l);
    ctx.quadraticCurveTo(x + Math.cos(a) * l * .3, y + Math.sin(a) * l * .3, x + Math.cos(b) * l, y + Math.sin(b) * l);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.8)";
    ctx.lineWidth = size / 220;
    ctx.stroke();
  }
  // shadow on the far side, highlight on the near one
  const s = ctx.createRadialGradient(h * .65, h * .55, r * .5, h, h, r * 1.1);
  s.addColorStop(0, "rgba(60,90,140,0)");
  s.addColorStop(1, `rgba(60,90,140,${lump ? .12 : .28})`);
  ctx.fillStyle = s;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
  if (lump) return c.toDataURL();
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.beginPath();
  ctx.ellipse(h * .68, h * .58, r * .16, r * .09, -.6, 0, Math.PI * 2);
  ctx.fill();
  return c.toDataURL();
};
// The splash of a snowball hitting us in the face: a mass of snow with spikes thrown out all
// round, tipped with drops, and drops further out; shaded and grainy like the rest
const smSplashImage = size => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d"), rnd = seeded(91), h = size / 2;
  const g = ctx.createRadialGradient(h * .92, h * .88, size * .02, h, h, h);
  [[0, "#ffffff"], [.45, "#f6f9fd"], [.75, "#e4ecf5"], [1, "#c6d4e5"]].forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  smLump(ctx, h, h, size * .25, .3, 18, rnd);
  ctx.fill();
  for (let i = 0; i < 30; i++) {  // the spikes, tapering, each ending in a drop
    const a = i / 30 * Math.PI * 2 + (rnd() - .5) * .18, L = size * (rnd() < .3 ? .26 + rnd() * .08 : .34 + rnd() * .14), w = size * (.02 + rnd() * .03);
    const d = [Math.cos(a), Math.sin(a)], p = [-d[1], d[0]], tip = [h + d[0] * L, h + d[1] * L];
    ctx.beginPath();
    ctx.moveTo(h + d[0] * size * .15 + p[0] * w * 2, h + d[1] * size * .15 + p[1] * w * 2);
    ctx.quadraticCurveTo(h + d[0] * L * .7 + p[0] * w * .5, h + d[1] * L * .7 + p[1] * w * .5, tip[0], tip[1]);
    ctx.quadraticCurveTo(h + d[0] * L * .7 - p[0] * w * .5, h + d[1] * L * .7 - p[1] * w * .5, h + d[0] * size * .15 - p[0] * w * 2, h + d[1] * size * .15 - p[1] * w * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tip[0], tip[1], w * .75, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 40; i++) {  // drops thrown further out
    const a = rnd() * Math.PI * 2, r = size * (.3 + rnd() * .19);
    ctx.beginPath();
    ctx.arc(h + Math.cos(a) * r, h + Math.sin(a) * r, size * (.004 + rnd() * .012), 0, Math.PI * 2);
    ctx.fill();
  }
  // on the snow only: grain, and a shade growing towards the edges
  ctx.globalCompositeOperation = "source-atop";
  smGrain(ctx, rnd, size, 10, 500, "rgba(255,255,255,.75)", "rgba(110,140,185,.2)");
  const e = ctx.createRadialGradient(h, h, size * .2, h, h, h);
  e.addColorStop(0, "rgba(70,100,150,0)");
  e.addColorStop(1, "rgba(70,100,150,.3)");
  ctx.fillStyle = e;
  ctx.fillRect(0, 0, size, size);
  return c.toDataURL();
};
let smImages = null;
const smSnowImages = () => smImages || (smImages = {
  ball: smSnowImage(768, 5, .1, 20, 9),
  clump: smSnowImage(384, 61, .55, 11, 0, true),
  splash: smSplashImage(1024),
  lumps: [smSnowImage(384, 11, .7, 15, 3, true), smSnowImage(384, 23, .8, 13, 2, true), smSnowImage(384, 37, .65, 17, 3, true)],
});
