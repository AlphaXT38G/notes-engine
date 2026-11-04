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
// Above his hat, where he speaks from
const skSamTop = () => {
  const r = skSam().getBoundingClientRect();
  return [r.left + r.width * .5, r.top + r.height * .02];
};
const skSteel = delay => {
  // the swish of the blade (a fast filtered noise), the ring of the steel (two inharmonic tones)
  skNoise(.28, 2400, "bandpass", .45, delay, .8, 3);
  skTone(2637, 1.4, { gain: .05, delay: delay + .05 });
  skTone(3951, .9, { gain: .03, delay: delay + .05 });
};
const skIai = () => {
  const sam = skSam();
  if (!sam || skSamBusy) return;
  skSamBusy = true;
  const r = sam.getBoundingClientRect(), y = r.top + r.height * .42, x = r.left + r.width * .3;
  sam.classList.remove("iai");
  void sam.offsetWidth;  // restart the animation
  sam.classList.add("iai");
  setTimeout(() => skSlash(x + 30, y + 40, x - Math.min(620, skLay.W * .45), y - 70), 140);
  skSteel(.12);
  // the guard clicks against the scabbard: the blade is back
  skTone(1760, .12, { type: "square", gain: .04, delay: 1.05 });
  skNoise(.05, 5000, "highpass", .2, 1.05);
  setTimeout(() => { sam.classList.remove("iai"); skSamBusy = false; }, 1300);
};
// Teased three times: he turns to us, draws, and challenges us
const skProvoked = () => {
  const sam = skSam();
  if (!sam) return;
  skSamBusy = true;
  sam.classList.add("face");
  const [x, y] = skSamTop();
  setTimeout(() => skSay(x, y, "You will not let me be."), 300);
  setTimeout(() => skSay(x, y, "Then draw your blade."), 3300);
  setTimeout(() => skSteel(0), 3300);
  const back = () => {
    sam.classList.remove("face");
    skSamBusy = false;
  };
  setTimeout(() => {
    if (typeof skDuel === "function") skDuel(back);  // the duel (later): he turns back once it ends
    else { skSay(x, y, "…Another day.", 2600); setTimeout(back, 2600); }
  }, 6300);
};
skHit({
  title: "The samurai",
  test: (x, y) => skSeenAt(skSam(), x, y),
  click() {
    if (skSamBusy) return;
    const n = skTease();
    if (n >= 3) return;  // skProvoked runs
    skIai();
  },
});
skPart({ off() { const s = skSam(); if (s) s.classList.remove("iai", "face"); skSamBusy = false; skTeases = []; } });
