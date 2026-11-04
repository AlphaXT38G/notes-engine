// ── Sakura: the samurai ─────────────────────────────────────────────────────────────────────────
// He stands on the knoll looking over the valley (the painted layer .sksamurai, skscene.js). He
// breathes, and his image sways a little in the wind (css/sakura.css, the `scale` and `rotate`
// properties: the parallax uses `transform`).
// A click on him (on his painted part: skOpaqueAt) and he answers with an iai: the draw and the
// cut in one move, too fast to see. His image lunges and blurs (css: .iai), a white crescent cuts
// the air in front of him and the petals it crosses in two (skSlash, skpetals.js), the swish of
// the blade, the ring of the steel, then the click of the guard against the scabbard.
// Every click teases him (skTease, sakura.js): the second time he grumbles; the third within 30 s
// he turns to face us (skProvoked) and challenges us. The duel itself will come later, like the
// snowman's fight (sansfight.js): skDuel, null until a duel file sets it to a function that
// starts the fight and calls back when it ends (skDuel(onEnd)). Until then he gives up, turns back.
const skSam = () => skBack.querySelector(".sksamurai");
let skSamBusy = false;
const skIai = () => {
  const sam = skSam();
  if (!sam || skSamBusy) return;
  skSamBusy = true;
  const r = sam.getBoundingClientRect(), y = r.top + r.height * .42, x = r.left + r.width * .3;
  sam.classList.remove("iai");
  void sam.offsetWidth;  // restart the animation
  sam.classList.add("iai");
  setTimeout(() => { sam.classList.remove("iai"); skSamBusy = false; }, 1300);
};
skHit({
  title: "The samurai",
  test: (x, y) => skSeenAt(skSam(), x, y),
  click() {
    if (skSamBusy) return;
    skIai();
  },
});
skPart({ off() { const s = skSam(); if (s) s.classList.remove("iai", "face"); skSamBusy = false; skTeases = []; } });
