// ── Sakura: the hidden ways to the other screens, and the fireflies ─────────────────────────────
// Like the sax and the guitar of Christmas or the castle windows of Halloween, three things of the
// scene lead elsewhere, each in its own way:
//   - a sake set on the knoll, by the samurai's paper (a white porcelain flask with a blue band, a
//     little cup): clicked, the flask tips and pours, the cup clinks, and it is time for "just one
//     more drink": the jazz bar (CODES.armstrong(), armstrong.js);
//   - the shamisen plucked like mad (ten strings within five seconds): the metal show
//     (startMetalEgg, metal.js);
//   - the dragon, when it passes: clicked, it roars, its jaws wide, and breathes a jet of blue fire
//     at us that fills the view (skBlueFire); behind it, the epic finale, the one that plays
//     Dragonborn (CODES.kamelot(), epic.js). The pink moon at night already opens
//     the calm night (skplay.js).
// And the fireflies of the night: a click near them and they fly off, brighter, up and away from
// it, coming back elsewhere a while later (their flight is in skpetals.js).

// ── The sake set ──
const skSake = document.createElement("div");
skSake.className = "skl sksake";
skSake.setAttribute("aria-hidden", "true");
skSake.innerHTML = `<svg viewBox="0 0 70 70"><defs>
<linearGradient id="sk-porc" x2="1"><stop offset="0" stop-color="#c8c6c0"/><stop offset=".45" stop-color="#fbfaf6"/><stop offset="1" stop-color="#b8b4ac"/></linearGradient></defs>
<ellipse cx="36" cy="64" rx="30" ry="4" fill="rgba(30,20,10,.35)"/>
<path d="M8,58h56l-3,6h-50z" fill="#5a2e14"/><path d="M8,58h56" stroke="#8a5228" stroke-width="1.5"/>
<g class="cup"><path d="M44,50h16l-2,8h-12z" fill="url(#sk-porc)" stroke="#8a8478" stroke-width=".6"/><path d="M44.5,51h15" stroke="#2a4a8a" stroke-width="1.2"/>
<path class="wine" d="M46,51h12l-.6,2.4h-10.8z" fill="#f2e2b0"/></g>
<path class="stream" d="M43,30q2,8 7,20" stroke="#f2e6c0" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<g class="flask"><path d="M22,12h8v6q0,3 4,8q6,8 6,18q0,12 -12,14q-12,-2 -12,-14q0,-10 6,-18q4,-5 4,-8z" fill="url(#sk-porc)" stroke="#8a8478" stroke-width=".7"/>
<path d="M17,40q9,3 22,0" stroke="#2a4a8a" stroke-width="3" fill="none"/><path d="M23,46l2,3l2,-3M30,47l2,3l2,-3" stroke="#2a4a8a" stroke-width="1" fill="none"/>
<path d="M21,12h10" stroke="#8a8478" stroke-width="1.5"/><path d="M19,30q-2,8 0,16" stroke="#fff" stroke-width="1.5" opacity=".7" fill="none"/></g></svg>`;
const SK_SAKE_AT = [1186, 664, 76];  // in the right group's box: x, y, width (beside the paper)
skSake.style.cssText = `left:${(SK_SAKE_AT[0] / SK_BW * 100).toFixed(3)}%;top:${(SK_SAKE_AT[1] / SK_BH * 100).toFixed(3)}%;width:${(SK_SAKE_AT[2] / SK_BW * 100).toFixed(3)}%`;
skPlanes.push({ el: skSake, depth: 18 });
let skSakeBusy = false;
skHit({
  title: "A sake set",
  test(x, y) {
    if (skSakeBusy || !skSake.isConnected) return false;
    const r = skSake.getBoundingClientRect();
    return x > r.left && x < r.right && y > r.top + r.height * .1 && y < r.bottom;
  },
  click() {
    skSakeBusy = true;
    skSake.classList.add("pour");
    skNoise(.9, 900, "bandpass", .08, .4, 2, 1);  // the sake running
    skTone(2093, .5, { gain: .05, delay: 1.1 });   // the cup's clink
    skTone(3136, .4, { gain: .03, delay: 1.12 });
    const r = skSake.getBoundingClientRect();
    setTimeout(() => skSay(r.left + r.width / 2, r.top, "Just one more drink…", 1800), 900);
    setTimeout(() => { skSake.classList.remove("pour"); skSakeBusy = false; CODES.armstrong(); }, 2100);
  },
});

// ── The shamisen, plucked like mad ──
let skPlucks = [];
const skShred = () => {
  const now = performance.now();
  skPlucks = skPlucks.filter(t => now - t < 5000);
  skPlucks.push(now);
  if (skPlucks.length >= 10) { skPlucks = []; startMetalEgg("You shredded the shamisen."); }
};

// ── The dragon ──
const skDragonAt = (x, y) => skVisitors.find(v => v.kind === "dragon" && v.parts.some(([px, py], i) => {
  const r = (i ? 15 : 26) * skPixel();
  return Math.hypot(px - x, py - y) < r;
}));
skHit({
  title: "The dragon",
  test: (x, y) => !!skDragonAt(x, y),
  click(x, y) {
    const d = skDragonAt(x, y);
    if (!d || d.roaring) return;
    d.roaring = true;  // its jaws stay wide (skdragon.js)
    skNoise(2.4, 140, "lowpass", .6, 0, .8, 1.1);
    skTone(62, 2.2, { type: "sawtooth", gain: .07, attack: .15, glide: .6 });
    // its breath: a jet of blue fire at us, filling the view; the epic finale behind it
    const P = skPixel(), [hx, hy] = d.parts[0];
    setTimeout(() => skBlueFire(hx + d.dir * 40 * P, hy + 4 * P, () => CODES.kamelot()), 450);
  },
});

// The dragon's breath: blue fire rushing at us from its jaws, puffs of flame growing as they come,
// until the whole view is a wall of blue fire; then (onCovered) the screen changes behind it, and
// the fire thins away. On a canvas of its own over the whole page (outside the scene, which goes
// when the screen changes), with its own loop, gone when the fire is.
const skFirePuff = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(235,248,255,.95)"); gr.addColorStop(.2, "rgba(140,215,255,.8)");
  gr.addColorStop(.5, "rgba(50,110,255,.45)"); gr.addColorStop(1, "rgba(20,40,180,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return c;
})();
const skBlueFire = (x0, y0, onCovered) => {
  const cv = document.createElement("canvas"), g = cv.getContext("2d"), W = innerWidth, H = innerHeight;
  cv.className = "skbluefire";
  cv.width = W; cv.height = H;
  document.body.append(cv);
  skNoise(2.2, 700, "bandpass", .5, 0, .7, .6);  // the roar of the fire
  skNoise(1.6, 260, "lowpass", .4, .2, .7, 1);
  const puffs = [], t0 = performance.now(), reach = Math.hypot(W, H);
  let covered = false, last = t0;
  const step = now => {
    const t = (now - t0) / 1000, dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (t < 1.3) for (let i = 0; i < 7; i++) {  // the jet: puffs from the jaws towards us, spreading
      const a = Math.random() * 6.283, sp = 180 + Math.random() * 520;
      puffs.push({ x: x0, y: y0, vx: (W / 2 - x0) * 1.1 + Math.cos(a) * sp, vy: (H / 2 - y0) * 1.1 + Math.sin(a) * sp, r: 20 + Math.random() * 30, life: 0 });
    }
    g.clearRect(0, 0, W, H);
    // the wall of fire: the view fills with blue, then clears
    const wall = Math.min(1, skSmooth(.5, 1.25, t)) * (1 - skSmooth(1.6, 2.6, t));
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = wall;
    g.fillStyle = "#1a3cc8";
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      p.life += dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.r += (reach * .35) * dt;  // coming at us: they grow
      const a = Math.max(0, 1 - p.life / 1.1) * (1 - skSmooth(1.6, 2.6, t));
      if (a <= 0) { puffs.splice(i, 1); continue; }
      g.globalAlpha = a * .5;
      g.drawImage(skFirePuff, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    g.globalCompositeOperation = "source-over";
    if (!covered && t > 1.25) { covered = true; onCovered(); }
    if (t < 2.7) requestAnimationFrame(step); else cv.remove();
  };
  requestAnimationFrame(step);
};

// ── The fireflies ──
const skFlyNear = (x, y) => skFlies.some(f => !f.away && Math.hypot(f.x - x, f.y - y) < 30);
skHit({
  title: "Fireflies",
  test: (x, y) => skNight() && skFlyNear(x, y),
  click(x, y) {
    skFlies.forEach(f => {
      const dx = f.x - x, dy = f.y - y, d = Math.hypot(dx, dy);
      if (f.away || d > 160) return;
      const k = 160 + Math.random() * 120;
      Object.assign(f, { flee: 1.6 + Math.random(), vx: dx / (d || 1) * k, vy: dy / (d || 1) * k - 120 });
    });
    skTone(2637, .25, { gain: .02 });
    skTone(3520, .2, { gain: .015, delay: .06 });
  },
});

skPart({
  on() { skBack.querySelector(".skg-right").append(skSake); },
  off() { skSake.remove(); skSake.classList.remove("pour"); skSakeBusy = false; },
});
