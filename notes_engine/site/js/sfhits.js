// ── The fight's rounds, the heart and its hits (sansfight.js) ──
// The patterns one after another, the heart's HP, a hit, game over, and what touches the heart.

// The heart's box (inside the border)
const sfInside = () => ({ x0: sfBox.x + 12, y0: sfBox.y + 12, x1: sfBox.x + sfBox.w - 12, y1: sfBox.y + sfBox.h - 12 });

// The fight itself: patterns one after another, the next one starting earlier and earlier, so they
// overlap more and more
const sfFightStart = () => {
  SF.phase = "fight";
  SF.fight = 0;
  SF.nextAt = 2.2;  // a moment to get in place
  SF.n = 0;
  sfUi.classList.add("attacking");
  sfUi.querySelector(".text").textContent = "";
  sfQuake(SF_QUAKE_GO);
  const I = sfInside();
  sfSoul = [(I.x0 + I.x1) / 2, (I.y0 + I.y1) / 2];
};
const sfNextPattern = () => {
  const last = SF.active.length ? SF.active[SF.active.length - 1].name : "";
  let name = SF.n === 0 ? "run" : SF_NAMES[Math.floor(Math.random() * SF_NAMES.length)];
  if (name === last) name = SF_NAMES[(SF_NAMES.indexOf(name) + 1) % SF_NAMES.length];
  const p = SF_PATTERNS[name]();
  p.name = name;
  p.t = 0;
  SF.active.push(p);
  SF.n++;
  // the next one: at the end of this one at first, then sooner (from 1 s after the end to 45 % in)
  const overlap = Math.min(1, SF.fight / 90);
  SF.nextAt = SF.fight + p.dur * (1 - .55 * overlap) + (1 - overlap);
  smAnimate(smArm, [{ transform: "rotate(0)" }, { transform: "rotate(-50deg)" }, { transform: "rotate(0)" }], { duration: 600, easing: "ease-in-out" });
};
const sfPaintHp = () => {
  sfUi.querySelector(".bar i").style.transform = `scaleX(${(SF.hp / SF_HP).toFixed(3)})`;
  sfUi.querySelector(".hpn").textContent = `${SF.hp} / ${SF_HP}`;
};
// A hit: a point less at most every 60 ms of contact, a crunch, the window shakes, the box flashes
const sfHurt = () => {
  const now = performance.now();
  if (now - SF.hitAt < 60 || SF.over) return;
  const first = now - SF.hitAt > 400;  // a new hit, not the same one going on
  SF.hitAt = now;
  SF.hp = Math.max(0, SF.hp - 1);
  sfPaintHp();
  if (first) {
    smNoise(130, 1600, 300, .45);
    smTone(160, 140, { vol: .07, to: 60 });
  } else smTone(120, 50, { vol: .035 });
  SF.shake = Math.max(SF.shake, Math.min(1, SF.shake + (first ? .8 : .25)));  // never cuts a quake short
  sfUi.classList.remove("hurt");
  void sfUi.offsetWidth;
  sfUi.classList.add("hurt");
  if (!SF.hp) sfGameOver();
};
const sfGameOver = () => {
  SF.over = true;
  SF.phase = "over";
  SF.objs = [];
  SF.active = [];
  SF.t = 0;
  smTone(220, 900, { vol: .08, type: "sawtooth", to: 50 });
  smSays("Ha. Ha. ❄", 2600);
  sfUi.classList.add("over");
  setTimeout(() => { if (SF.on) sfEnd(); }, 3800);
};
// Does the heart at x, y touch a bone?
// (a point in a bone: brought into the bone's own frame, where it is an upright box)
const sfInBone = (x, y, cx, cy, len, w, a) => {
  const dx = x - cx, dy = y - cy, c = Math.cos(a), s = Math.sin(a);
  return Math.abs(dx * c + dy * s) < w / 2 + 4.5 && Math.abs(-dx * s + dy * c) < len / 2 + 4.5;
};
const sfTouches = (x, y) => SF.objs.some(o => {
  if (o.t < o.warm) return false;
  if (o.kind === "bone") return (!o.blue || sfMoved > 15) && sfInBone(x, y, o.x, o.y, o.len, o.w, o.a);
  if (o.kind === "flake") return [0, 1, 2].some(i => sfInBone(x, y, o.x, o.y, o.len, o.w, o.a + i * Math.PI / 3));
  return false;
});
