// ── Sakura: what passes in the sky ──────────────────────────────────────────────────────────────
// Now and then (every 35 to 80 s) something crosses the sky. The cranes, the sky lanterns and the
// shooting stars pass far away, on a canvas behind the land (behind the mountains' peaks, the
// valley and the great tree: seen between its branches); the dragon passes near, on a canvas over
// the land, under the petals:
//   - by day, a flight of cranes in a V, white with black wing tips and a red crown, flapping;
//   - at night, sky lanterns rising slowly from the valley, swaying, flickering; or a shooting star;
//   - rarely, day or night, a long dragon snaking across the sky (skdragon.js).
// ?skvisit=cranes (lanterns, star, dragon) shows one two seconds after the page opens (to try them).
const skSkyNear = document.createElement("canvas"), skSkyFarCv = document.createElement("canvas");
skSkyNear.className = skSkyFarCv.className = "skvisitors";
const skNearG = skSkyNear.getContext("2d"), skFarG = skSkyFarCv.getContext("2d");
let skVisitors = [], skVisitIn = 25, skSkyDirty = false;
let skVisitParam = new URLSearchParams(location.search).get("skvisit");  // shown once, the first time the screen opens

// A flight of cranes in a V, crossing from one side to the other
const skCranes = () => {
  const { W, H } = skLay, dir = Math.random() < .5 ? 1 : -1, n = 5 + ((Math.random() * 3) | 0), y = H * (.24 + Math.random() * .14);  // between the crown and the mountains
  const size = 16 + Math.random() * 8, speed = 55 + Math.random() * 25;
  return {
    kind: "cranes", t: 0, birds: Array.from({ length: n }, (_, i) => {
      const rank = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
      return { dx: -rank * size * 2.6, dy: side * rank * size * 1.5, ph: Math.random() * 6.3 };
    }),
    x: dir > 0 ? -150 : W + 150, y, dir, size, speed, end: W + 300,
  };
};
const skDrawCrane = (g, x, y, s, dir, flap) => {
  g.save();
  g.translate(x, y);
  g.scale(dir, 1);
  const w = Math.sin(flap);
  // wings: a long curve up or down with the beat, black at the tips
  [-1, 1].forEach(side => {
    g.beginPath();
    g.moveTo(-s * .1, 0);
    g.quadraticCurveTo(-s * .2, -s * w * .9 * side - s * .2, -s * .5, -s * w * 1.2 * side);
    g.quadraticCurveTo(-s * .05, -s * w * .4 * side, s * .25, 0);
    g.fillStyle = "#f6f4f0"; g.fill();
    g.beginPath();
    g.moveTo(-s * .5, -s * w * 1.2 * side);
    g.lineTo(-s * .32, -s * w * .85 * side);
    g.lineWidth = s * .12; g.strokeStyle = "#1a1418"; g.lineCap = "round"; g.stroke();
  });
  // body, long neck and head forward, legs trailing
  g.fillStyle = "#f6f4f0";
  g.beginPath(); g.ellipse(0, 0, s * .32, s * .1, 0, 0, 6.3); g.fill();
  g.strokeStyle = "#1a1418"; g.lineWidth = s * .06;
  g.beginPath(); g.moveTo(s * .25, 0); g.lineTo(s * .75, -s * .04); g.stroke();
  g.fillStyle = "#d8202a"; g.beginPath(); g.arc(s * .76, -s * .05, s * .05, 0, 6.3); g.fill();
  g.strokeStyle = "#3a3030"; g.lineWidth = s * .03;
  g.beginPath(); g.moveTo(-s * .3, 0); g.lineTo(-s * .85, s * .04); g.moveTo(-s * .3, s * .02); g.lineTo(-s * .82, s * .09); g.stroke();
  g.restore();
};

const SK_VISITS = { cranes: skCranes };
const skVisit = kind => {
  const night = skNight();
  kind = kind || "cranes";
  if (SK_VISITS[kind]) skVisitors.push(SK_VISITS[kind]());  // an unknown ?skvisit= shows nothing
};
everySecond.push(() => {
  if (!skOn || skStill() || document.hidden) return;
  if (--skVisitIn <= 0) { skVisit(); skVisitIn = 35 + Math.random() * 45; }
});

skPart({
  on() {
    skBack.insertBefore(skSkyNear, skPetalBack);
    skBack.insertBefore(skSkyFarCv, skBack.querySelector(".skland"));
    skVisitors = [];
    if (skVisitParam) { const kind = skVisitParam; skVisitParam = null; setTimeout(() => skOn && skVisit(kind), 2000); }
  },
  off() { skSkyNear.remove(); skSkyFarCv.remove(); skVisitors = []; },
  resize() { [skSkyNear, skSkyFarCv].forEach(c => { c.width = skLay.W; c.height = skLay.H; }); skSkyDirty = true; },
  frame(dt, t) {
    if (!skVisitors.length) {
      if (skSkyDirty) { skNearG.clearRect(0, 0, skLay.W, skLay.H); skFarG.clearRect(0, 0, skLay.W, skLay.H); skSkyDirty = false; }
      return;
    }
    const { W } = skLay;
    skNearG.clearRect(0, 0, W, skLay.H);
    skFarG.clearRect(0, 0, W, skLay.H);
    skSkyDirty = true;
    skVisitors = skVisitors.filter(v => {
      v.t += dt;
      const g = v.kind === "dragon" ? skNearG : skFarG;  // far away, behind the land; the dragon, near
      if (v.kind === "cranes") {
        v.x += v.dir * v.speed * dt;
        g.globalAlpha = .92;
        v.birds.forEach(b => skDrawCrane(g, v.x + v.dir * b.dx, v.y + b.dy + Math.sin(v.t * 1.3 + b.ph) * 3, v.size, v.dir, v.t * 5 + b.ph));
        g.globalAlpha = 1;
        return v.dir > 0 ? v.x < v.end : v.x > -300;
      }
    });
  },
});
