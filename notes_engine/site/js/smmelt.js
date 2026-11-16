// ── The snowman's body (snowman.js) ──
// A click tickles him; a press held on him melts him into a puddle, and he freezes back.

// ── His body: tickled by a click, melted by a hand held on it
let smTickles = [], smPress = null;
snowman.querySelectorAll(".snow").forEach(part => part.addEventListener("pointerdown", e => {
  if (smBusy || e.button > 0) return;
  e.preventDefault();
  smPress = setTimeout(() => { smPress = null; smMeltStart(); }, 450);
  const up = () => {
    removeEventListener("pointerup", up);
    removeEventListener("pointercancel", up);
    if (smPress) { clearTimeout(smPress); smPress = null; smTickle(); } else smMelting = false;
  };
  addEventListener("pointerup", up);
  addEventListener("pointercancel", up);
}));
const smTickle = () => {
  const now = Date.now();
  smTickles = smTickles.filter(t => now - t < 3000).concat(now);
  smAnimate(smSvg, [{ transform: "none" }, { transform: "scale(1.06,.93)" }, { transform: "scale(.96,1.05)" }, { transform: "scale(1.02,.98)" }, { transform: "none" }], { duration: 500, easing: "ease-out" });
  if (smTickles.length >= 4) {  // a fit of laughter
    smTickles = [];
    secretFound("sm-laugh");
    snowman.classList.add("laughing");
    smSays("HA HA HA! Stop!", 1600);
    smAnimate(smSvg, [{ transform: "none" }, { transform: "translateY(-10px) rotate(-3deg)" }, { transform: "none" }, { transform: "translateY(-8px) rotate(3deg)" }, { transform: "none" }, { transform: "translateY(-6px)" }, { transform: "none" }], { duration: 1200, delay: 450 });
    setTimeout(() => snowman.classList.remove("laughing"), 1700);
  } else if (smMad) {
    smMad--;
    smPaintMad();
    smSays("Okay, okay… 😊");
  } else smSays(["Hee hee!", "That tickles!", "Hihihi!"][smTickles.length - 1]);
};
// Melting: m from 0 (himself) to 1 (a puddle). He sinks and spreads (scaled from his base), the
// puddle grows under him (counter-scaled, so it stays a puddle), he sweats and drips.
let smMelt = 0, smMelting = false, smMelted = false, smMeltRaf = null, smMeltLast = 0, smMeltSaid = 0;
const smPaintMelt = () => {
  const m = smMelt, sy = 1 - .86 * Math.pow(m, 1.4), sx = 1 + .3 * m;
  smSvg.style.transform = m > 0 ? `scale(${sx.toFixed(3)},${sy.toFixed(3)})` : "";
  smPuddle.style.opacity = Math.min(1, m * 1.6).toFixed(2);
  smPuddle.style.transform = m > 0 ? `scale(${(1 / sx * (.4 + .6 * m)).toFixed(3)},${(1 / sy * (.4 + .6 * m)).toFixed(3)})` : "";
  snowman.classList.toggle("sweaty", m > .04);
};
const smMeltStart = () => {
  smBusy = smMelting = true;
  smMeltSaid = 0;
  snowman.classList.add("hold");
  smSays("Hey, your hand is warm!");
  smMeltLast = performance.now();
  if (!smMeltRaf) smMeltRaf = requestAnimationFrame(smMeltFrame);
};
const smMeltFrame = now => {
  smMeltRaf = null;
  const dt = Math.min(.1, (now - smMeltLast) / 1000);
  smMeltLast = now;
  smMelt = smMelting ? Math.min(1, smMelt + dt / 3.5) : Math.max(0, smMelt - dt / 1.2);
  smPaintMelt();
  if (smMelting && Math.random() < dt * 7) {  // a drop runs down from somewhere on him
    const top = 520 - 420 * (1 - .86 * Math.pow(smMelt, 1.4));
    smFloat("drip", "", 70 + Math.random() * 170, top + Math.random() * (470 - top), 1100);
  }
  if (smMelting && smMelt > .5 && !smMeltSaid) { smMeltSaid = 1; smSays("I'm melting!", 1600); }
  if (smMelt >= 1) { smMelting = false; smMelted = true; return smMeltedFlat(); }
  if (smMelting || smMelt > 0) smMeltRaf = requestAnimationFrame(smMeltFrame);
  else {
    snowman.classList.remove("hold");
    smBusy = false;
    if (smMeltSaid) smSays("Phew…");
  }
};
const smMeltedFlat = async () => {  // a puddle, then he builds himself up again, cross
  const gen = smGen;
  secretFound("sm-melt");
  smSays("…", 1200);
  await smWait(1600);
  if (gen !== smGen) return;
  smSays("Brr… much better!", 1800);
  for (let i = 0; i < 6; i++) smFloat("flake", "❄", 90 + Math.random() * 120, 380 + Math.random() * 100, 1200);
  await smTween(1300, t => {  // back up with a little overshoot
    const e = 1 - Math.pow(1 - t, 3);
    smMelt = Math.max(0, 1 - e * 1.06);
    smPaintMelt();
  });
  if (gen !== smGen) return;
  smMelt = 0;
  smPaintMelt();
  smMelted = false;
  snowman.classList.remove("hold");
  smBusy = false;
  smAnnoy();
  setTimeout(smCheck, 900);
};
