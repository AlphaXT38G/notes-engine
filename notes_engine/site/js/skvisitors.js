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

const SK_VISITS = {  };
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
    });
  },
});
