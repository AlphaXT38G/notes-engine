// ── The snowman's games (both Christmas screens) ──
// The snowman of christmas.js (#xsnowman, in the left margin) is alive:
// - his eyes follow the mouse pointer.
// - his hat: a click knocks it up in the air; it lands crooked and he straightens it.
// - his carrot nose: it can be dragged off his face. Put back on him, he takes it and plants it in
//   place; dropped anywhere else, it lies there and he fishes it back: a rod (cork handle, reel,
//   rings) drawn over the page, a back cast, the line and its float flying out, a ripple, the
//   strike, the reel cranked with the rod bent, the carrot hanging from the hook up to his face.
// - his body: a click tickles him (he giggles, and it calms him down); held down, the warm hand
//   melts him: he sinks, sweats and drips into a puddle, and freezes back when let go (or, melted
//   flat, builds himself up again).
// - his coal buttons are a xylophone: eight notes in a row and he dances; the start of Jingle
//   Bells (E E E, E E E, E G C D E: buttons 2 2 2, 2 2 2, 2 1 4 3 2 from the top) and he sings on.
//   The fifth, lowest one plays Megalovania, one note per click: spam it (his eye glows blue), and
//   at the 22nd click the real song plays, whole, with a fight (sansfight.js) that lasts as long.
// Each tease (hat, nose, melting him flat) makes him crosser (brows, then red cheeks and steam), and
// he calms down after a while left in peace. The third is one too many: he turns to us, bends down,
// scoops snow from his belly, packs it into a snowball (three squeezes, crumbs falling), winds up
// and throws it. It comes at us, growing as it comes closer and closer, until it fills the whole
// window: we take it in the face. A splash, spray, lumps of snow sliding down the glass, two
// blinks, a blurred view, frost on the window (img/frost.png), and for about fifteen seconds a
// frozen pointer: the real one is hidden, an icy one follows it slowly, shivering, and clicks go
// where the icy one is (touch screens: no pointer).
// What flies (the carrot, the rod and line, the snowball, the snow) is a fixed element over the page,
// made for the move and removed after; on the snowman only transforms and opacity change. The
// snowball and its lumps are bitmaps drawn once on a canvas, so growing them redraws nothing.
// Reduced motion: the same story without the flights (no rod, no flying ball, no slow pointer).
const smQ = sel => snowman.querySelector(sel);
const smHat = smQ(".hat"), smNose = smQ(".nose"), smFace = smQ(".face"), smArm = smQ(".wave");
const smSvg = smQ("svg"), smLook = smQ(".look"), smPuddle = smQ(".puddle"), smUpper = smQ(".upper"), smDent = smQ(".dent");
const smSay = document.createElement("span");
smSay.className = "say";
snowman.append(smSay);
const SM_FREEZE_MS = 12000;  // how long the window stays frozen, before it melts (2.5 s)
let smMad = 0, smMadAt = 0, smBusy = false, smHatUp = false, smGen = 0, smSayEnd = null;
let smMouse = null;  // the pointer: his eyes follow it
let smAnims = [], smExtras = [], smStuck = null, smBox = null, smLookRaf = null;

const smWait = ms => new Promise(done => setTimeout(done, xmasStill() ? 0 : ms));
// a move over ms milliseconds, step(t) called on each frame with t from 0 to 1
const smTween = (ms, step) => new Promise(done => {
  if (xmasStill() || ms <= 0) { step(1); return done(); }
  const t0 = performance.now();
  const frame = now => {
    const t = Math.min(1, (now - t0) / ms);
    step(t);
    if (t < 1) requestAnimationFrame(frame); else done();
  };
  requestAnimationFrame(frame);
});
const smEase = t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
const smLerp = (a, b, t) => a + (b - a) * t;
const smAnimate = (el, frames, opts) => {
  if (xmasStill()) return null;
  const a = el.animate(frames, opts);
  smAnims.push(a);
  return a;
};
const smExtra = (tag, id, parent = document.body) => {
  const el = document.createElement(tag);
  if (id) el.id = id;
  smExtras.push(el);
  parent.append(el);
  return el;
};
const smDrop = el => {
  el.remove();
  smExtras = smExtras.filter(x => x !== el);
};
// A point of his drawing (300 x 520), in the window. The scene is fixed, so is his box: it is
// measured once, again after a resize.
const smPt = (x, y) => {
  const r = smBox || (smBox = snowman.getBoundingClientRect()), k = r.width / 300;
  return [r.left + x * k, r.top + y * k];
};
const smK = () => (smBox || (smBox = snowman.getBoundingClientRect())).width / 300;
addEventListener("resize", () => { smBox = null; });
const smSays = (text, ms = 1800) => {
  smSay.textContent = text;
  smSay.classList.add("on");
  clearTimeout(smSayEnd);
  smSayEnd = setTimeout(() => smSay.classList.remove("on"), ms);
};
// Something that floats up from a point of his drawing and goes (a note, a drop): an element in
// his box, its CSS animation removes nothing, a timer does
const smFloat = (cls, text, x, y, ms) => {
  if (snowman.querySelectorAll("." + cls.split(" ")[0]).length > 12) return;
  const el = smExtra("span", null, snowman);
  el.className = cls;
  el.textContent = text;
  el.style.left = `${f1(x / 3)}%`;
  el.style.top = `${f1(y / 5.2)}%`;
  setTimeout(() => smDrop(el), ms);
};

// Sounds, made with Web Audio (a click always came before, so it may play): the xylophone's notes,
// the crunch of packed snow, the whoosh of the snowball and its thud
let smCtx = null;
const smAudio = () => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!smCtx) { try { smCtx = new AC(); } catch (e) { return null; } }
  if (smCtx.state === "suspended") smCtx.resume();
  return smCtx;
};
const smNote = freq => {
  const ctx = smAudio();
  if (!ctx) return;
  const t = ctx.currentTime, out = ctx.createGain();
  out.gain.setValueAtTime(.0001, t);
  out.gain.exponentialRampToValueAtTime(.2, t + .008);
  out.gain.exponentialRampToValueAtTime(.0001, t + .9);
  out.connect(ctx.destination);
  [[1, 1], [4, .2], [9.2, .05]].forEach(([m, g]) => {  // a bar struck: its tone and two bright overtones
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.value = freq * m;
    og.gain.value = g;
    o.connect(og);
    og.connect(out);
    o.start(t);
    o.stop(t + .95);
  });
};
const smNoise = (ms, from, to, peak, shape) => {  // filtered noise: crunch, whoosh, thud
  const ctx = smAudio();
  if (!ctx) return;
  const n = Math.ceil(ctx.sampleRate * ms / 1000), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime, end = t + ms / 1000;
  src.buffer = buf;
  f.type = "bandpass";
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, end);
  if (shape === "swell") { g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(peak, end); }
  else { g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(.001, end); }
  src.connect(f);
  f.connect(g);
  g.connect(ctx.destination);
  src.start(t);
};
// one oscillator: a blip, a note, a glide (to: the pitch it slides to), held a while (hold, s) then
// dying away, through a low-pass filter if asked (shared with the fight, sansfight.js)
const smTone = (freq, ms, { vol = .05, type = "square", to = 0, hold = 0, lowpass = 0 } = {}) => {
  const ctx = smAudio();
  if (!ctx) return;
  const t = ctx.currentTime, end = t + ms / 1000, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, end);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + .005);
  if (hold) g.gain.setValueAtTime(vol, t + hold);
  g.gain.exponentialRampToValueAtTime(.0001, end);
  let out = o;
  if (lowpass) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = lowpass;
    o.connect(f);
    out = f;
  }
  out.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(end + .02);
};

// His arm (the near one, towards the courses): turned around the shoulder; the hand is its tip.
// And his top half, bent at the waist (the arm goes with it).
const SM_SHOULDER = [218, 258], SM_HAND = [268, 216], SM_WAIST = [150, 328];
let smArmDeg = 0, smBendDeg = 0;
const smSetArm = deg => { smArmDeg = deg; smArm.style.transform = deg ? `rotate(${f1(deg)}deg)` : ""; };
const smSetBend = deg => { smBendDeg = deg; smUpper.style.transform = deg ? `rotate(${f1(deg)}deg)` : ""; };
const smTurn = ([x, y], [cx, cy], deg) => {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};
const smHand = () => smPt(...smTurn(smTurn(SM_HAND, SM_SHOULDER, smArmDeg), SM_WAIST, smBendDeg));

// His eyes follow the pointer: at most once a frame, a few units towards it
addEventListener("pointermove", e => {
  smMouse = [e.clientX, e.clientY];
  if (!smLookRaf && snowman.isConnected) smLookRaf = requestAnimationFrame(smLookAt);
}, { passive: true });
let smLookOff = [0, 0];  // where the eyes look, in units of his drawing (the fight's flame follows)
const smLookAt = () => {
  smLookRaf = null;
  if (!smMouse || !snowman.isConnected) return;
  const [cx, cy] = smPt(178, 140), dx = smMouse[0] - cx, dy = smMouse[1] - cy, d = Math.hypot(dx, dy) || 1;
  const r = Math.min(1, d / 250) * 3.4;
  smLookOff = [dx / d * r, dy / d * r * .8];
  smLook.style.transform = `translate(${f1(smLookOff[0])}px,${f1(smLookOff[1])}px)`;
};

// His temper: 1 = cross, 2 = furious, 3 = the snowball. A quarter of a minute left in peace calms
// him down a step (and so does tickling him).
const smPaintMad = () => {
  snowman.classList.toggle("mad1", smMad === 1);
  snowman.classList.toggle("mad2", smMad >= 2);
};
const smAnnoy = () => {
  smMad++;
  smMadAt = Date.now();
  smPaintMad();
  smAnimate(smSvg, [{ transform: "rotate(0)" }, { transform: "rotate(-2deg)" }, { transform: "rotate(2deg)" }, { transform: "rotate(0)" }], { duration: 350 });
};
const smCheck = () => { if (smMad >= 3 && !smBusy) smThrow(); };
everySecond.push(() => {
  if (smMad && !smBusy && Date.now() - smMadAt > 15000) { smMad--; smMadAt = Date.now(); smPaintMad(); }
});







// Christmas over: every game stops, he is himself again
const smReset = () => {
  smGen++;
  smAnims.forEach(a => a.cancel());
  smAnims = [];
  smExtras.forEach(el => el.remove());
  smExtras = [];
  smUnfreeze();
  if (smMeltRaf) cancelAnimationFrame(smMeltRaf);
  smMeltRaf = null;
  clearTimeout(smPress);
  smPress = null;
  smMad = smMelt = 0;
  smBusy = smHatUp = smMelting = smMelted = smDancing = false;
  smTune = "";
  smPaintMelt();
  smSetArm(0);
  smSetBend(0);
  smDent.style.opacity = 0;
  smMegaStop();
  smBox = null;
  snowman.classList.remove("noseless", "hold", "mad1", "mad2", "laughing", "sweaty", "badtime");
  smSay.classList.remove("on");
};
document.addEventListener("christmas", e => { if (!e.detail) smReset(); else smBox = null; });
