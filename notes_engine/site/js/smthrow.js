// ── The snowman's snowball, thrown (snowman.js) ──
// The third tease is one too many: he scoops a snowball from his belly, packs it and throws it in
// our face (the bitmaps of smball.js), then the splash, the frost and the frozen pointer.

// Enough: he turns to us, packs a snowball and throws it, in our face
const smThrow = async () => {
  smBusy = true;
  const gen = smGen, stale = () => gen !== smGen, k = smK();
  secretFound("sm-snowball");
  snowman.classList.add("hold");
  smSays("That's it!", 1400);
  // facing us: the face slides to the middle of his head, the nose points at us (seen short)
  const face = smAnimate(smFace, [{ transform: "none" }, { transform: "translateX(-14px)" }], { duration: 400, fill: "forwards", easing: "ease-out" });
  const nose = smAnimate(smNose, [{ transform: "none" }, { transform: "scaleX(.45)" }], { duration: 400, fill: "forwards", easing: "ease-out" });
  const imgs = smSnowImages();
  await smWait(600);
  if (stale()) return;
  if (xmasStill()) { smFreeze(innerWidth / 2, innerHeight / 2, gen); return smThrowEnd(gen, face, nose); }
  // He bends down to his right and scoops snow from his own belly with his hand (it leaves a
  // hollow there), stands up again with a loose handful, and packs it in three squeezes: each one
  // makes it rounder, smaller and harder, crumbs falling off.
  smSays("Heh heh heh…", 2400);
  const D = Math.ceil(Math.max(innerWidth, innerHeight) * 1.15), d0 = 34 * k;
  const ball = smExtra("img", "xbig"), clump = smExtra("img", "xclump");
  ball.src = imgs.ball;
  clump.src = imgs.clump;
  ball.style.width = ball.style.height = clump.style.width = clump.style.height = `${D}px`;
  ball.style.opacity = clump.style.opacity = 0;
  const put = (el, x, y, s, sx = 1, sy = 1, rot = 0) => {
    el.style.transform = `translate(${f1(x - D / 2)}px,${f1(y - D / 2)}px) rotate(${f1(rot)}deg) scale(${(s * sx).toFixed(4)},${(s * sy).toFixed(4)})`;
  };
  const putBall = (x, y, s, sx, sy, rot) => put(ball, x, y, s, sx, sy, rot);
  const crumbs = smParticles("xpack");
  const held = () => { const H = smHand(); return [H[0], H[1] - 9 * k]; };  // what he holds sits on his hand
  // the arm angle that puts his hand on the scoop, for a bend: the hand turns by arm + bend
  const SCOOP = [229, 361], BEND = 30;
  const S = smTurn(SM_SHOULDER, SM_WAIST, BEND), v0 = Math.atan2(SM_HAND[1] - SM_SHOULDER[1], SM_HAND[0] - SM_SHOULDER[0]);
  const ARM = (Math.atan2(SCOOP[1] - S[1], SCOOP[0] - S[0]) - v0) * 180 / Math.PI - BEND;
  await smTween(700, t => { const e = smEase(t); smSetBend(BEND * e); smSetArm(ARM * e); });
  if (stale()) return;
  // scooping: the hand digs twice, snow sprays, the hollow opens, a handful comes up
  smNoise(260, 900, 400, .2);
  await smTween(800, t => {
    smSetArm(ARM + 7 * Math.sin(t * Math.PI * 4));
    smDent.style.opacity = Math.min(1, t * 1.4).toFixed(2);
    const [x, y] = held();
    if (Math.random() < .45) crumbs.add(x, y + 6 * k, 2, 140, 160, 2.6 * k, .8);
    clump.style.opacity = Math.min(1, t * 2).toFixed(2);
    put(clump, x, y, d0 * 1.35 / D * Math.min(1, .3 + t));
  });
  if (stale()) return;
  // up again, the handful in front of his chest (a few crumbs dropping)
  await smTween(650, t => {
    const e = smEase(t);
    smSetBend(BEND * (1 - e));
    smSetArm(smLerp(ARM, 26, e));
    const [x, y] = held();
    if (Math.random() < .15) crumbs.add(x, y + 8 * k, 1, 40, 0, 2.2 * k, 1);
    put(clump, x, y, d0 * 1.35 / D);
  });
  if (stale()) return;
  // three squeezes: the loose snow becomes a hard ball
  const pats = [.18, .5, .82];
  let patted = 0;
  await smTween(1600, t => {
    const [x, y] = held();
    if (patted < pats.length && t >= pats[patted]) {
      patted++;
      smNoise(150, 800, 260, .3);
      crumbs.add(x, y, 9 - patted * 2, 170, 60, 2.8 * k, .9);
    }
    const q = pats.reduce((m, p) => Math.max(m, 1 - Math.min(1, Math.abs(t - p) * 12)), 0);  // squeezing now
    const done = Math.min(1, patted / 3 + q * .1), size = d0 * (1.35 - .35 * done) / D;
    smSetArm(26 + 9 * q);
    clump.style.opacity = (1 - done).toFixed(2);
    ball.style.opacity = Math.min(1, done * 1.3).toFixed(2);
    put(clump, x, y, size, 1 + .16 * q, 1 - .16 * q, t * 20);
    putBall(x, y, size, 1 + .16 * q, 1 - .16 * q, t * 20);
  });
  smDrop(clump);
  ball.style.opacity = 1;
  if (stale()) return;
  // the wind-up, the ball in his hand raised over his shoulder, then the throw
  await smTween(650, t => { smSetArm(26 - 88 * smEase(t)); const [x, y] = held(); putBall(x, y, d0 / D); });
  if (stale()) return;
  smSays("Take that!", 1400);
  await smWait(140);
  await smTween(120, t => { smSetArm(-62 + 70 * t * t); const [x, y] = held(); putBall(x, y, d0 / D); });
  if (stale()) return;
  smAnimate(smArm, [{ transform: "rotate(8deg)" }, { transform: "rotate(48deg)" }, { transform: "rotate(0)" }], { duration: 500, easing: "ease-out" });
  smSetArm(0);
  // the flight, towards our eyes. It grows by the same factor each instant (so it keeps growing,
  // and growing, and growing), slowly at first, until it is far bigger than the window. Seen in
  // perspective its distance z is 1 / its size: its place comes to the middle of the window as z
  // (half true perspective, half straight at us, so it heads for our eyes all the way). It spins,
  // and arcs up a little.
  smDrop(crumbs.cv);
  const s0 = d0 / D, sEnd = 2.6, [x0, y0] = held(), x1 = innerWidth / 2, y1 = innerHeight * .46;
  smNoise(1500, 500, 2600, .5, "swell");
  await smTween(1500, t => {
    const s = s0 * Math.pow(sEnd / s0, Math.pow(t, 1.4)), z = s0 / s;
    const f = (1 - t) * (.5 + .5 * Math.min(1, (1 - t) / z)), lift = 160 * k * t * (1 - t) / z * (1 - t);
    putBall(x1 + (x0 - x1) * f, y1 + (y0 - y1) * f - lift, s, 1, 1, t * 300);
  });
  smDrop(ball);
  if (stale()) return;
  smImpact(gen, imgs);
  smFreeze(x1, y1, gen);
  smThrowEnd(gen, face, nose);
};
const smThrowEnd = async (gen, face, nose) => {
  smMad = 0;
  smPaintMad();
  smSays("Ha ha! ❄", 2200);
  // the laugh: a few hops, then back to his three-quarter pose
  smAnimate(smSvg, [{ transform: "none" }, { transform: "translateY(-6px)" }, { transform: "none" }, { transform: "translateY(-5px)" }, { transform: "none" }], { duration: 900, delay: 600 });
  await smWait(2400);
  if (gen !== smGen) return;
  if (face) face.reverse();
  if (nose) nose.reverse();
  await smWait(450);
  if (gen !== smGen) return;
  if (face) face.cancel();
  if (nose) nose.cancel();
  snowman.classList.remove("hold");
  smBusy = false;
  setTimeout(() => { if (gen === smGen) smDent.style.opacity = 0; }, 9000);  // the hollow fills again
};
// In the eyes: a thud and a splash. The snow bursts over the whole window (a splash with spikes
// all round, slammed on and shaking), spray flying off its edges, then it breaks up into lumps
// stuck on the glass that slide down it one by one, the middle first, while we blink twice.
const smImpact = (gen, imgs) => {
  smNoise(450, 300, 80, .9);
  smNoise(320, 2600, 700, .45);
  const W = innerWidth, H = innerHeight, cx = W / 2, cy = H * .46, S = Math.max(W, H) * 1.05;  // its spikes reach the edges
  const white = smExtra("div", "ximpact");
  smAnimate(white, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" });
  const splash = smExtra("img", "xsplash");
  splash.src = imgs.splash;
  splash.style.width = splash.style.height = `${f1(S)}px`;
  const at = (dx, dy, sc) => `translate(${f1(cx - S / 2 + dx)}px,${f1(cy - S / 2 + dy)}px) scale(${sc})`;
  splash.style.transform = at(0, 0, 1);
  smAnimate(splash, [
    { transform: at(0, 0, 1.3), opacity: 1 }, { transform: at(14, -10, .97), opacity: 1, offset: .05 },
    { transform: at(-10, 8, 1.01), opacity: 1, offset: .1 }, { transform: at(6, -4, 1), opacity: 1, offset: .15 },
    { transform: at(0, 0, 1), opacity: 1, offset: .5 }, { transform: at(0, H * .04, 1.02), opacity: 0 },
  ], { duration: 1200, easing: "ease-out", fill: "forwards" });
  const spray = smParticles("xspray");
  for (let i = 0; i < 6; i++) spray.add(cx + (Math.random() - .5) * W * .3, cy + (Math.random() - .5) * H * .3, 24, 2200, 0, 9, .7, 700, .08);
  const L = Math.max(W, H) * .42, spots = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) spots.push([(i + .5) / 4 * W, (j + .5) / 3 * H]);
  spots.push([W / 2, H / 2], [W * .35, H * .55], [W * .62, H * .4]);
  spots.forEach(([x, y], i) => {
    const lump = smExtra("img", null);
    lump.className = "xlump";
    lump.src = imgs.lumps[i % 3];
    const s = L * (.8 + Math.random() * .6), r = Math.random() * 360, jx = (Math.random() - .5) * L * .4, jy = (Math.random() - .5) * L * .4;
    lump.style.width = lump.style.height = `${f1(s)}px`;
    const pos = (dy, sc) => `translate(${f1(x + jx - s / 2)}px,${f1(y + jy - s / 2 + dy)}px) rotate(${f1(r)}deg) scale(${sc})`;
    lump.style.transform = pos(0, 1);
    // the splash breaks up into them; then the middle ones go first (we see again), the edges last
    const edge = Math.hypot(x - W / 2, y - H / 2) / Math.hypot(W / 2, H / 2), hold = 1100 + edge * 1800 + Math.random() * 600, all = hold + 1500 + Math.random() * 1200;
    smAnimate(lump, [
      { transform: pos(0, 1.1), opacity: 0 }, { transform: pos(0, 1.1), opacity: 0, offset: 550 / all }, { transform: pos(0, 1), opacity: 1, offset: 800 / all },
      { transform: pos(H * .06, 1), opacity: 1, offset: hold / all },
      { transform: pos(H * .7, .9), opacity: 0 },
    ], { duration: all, easing: "ease-in", fill: "forwards" });
  });
  // two blinks: eyelids closing over the window
  const lids = smExtra("div", "xlids");
  lids.innerHTML = "<i></i><i></i>";
  const blink = { duration: 340, easing: "ease-in-out" };
  lids.querySelectorAll("i").forEach((lid, i) => {
    const shut = i ? "translateY(-92%)" : "translateY(92%)";
    smAnimate(lid, [{ transform: "none" }, { transform: shut }, { transform: "none" }], { ...blink, delay: 1100 });
    smAnimate(lid, [{ transform: "none" }, { transform: shut }, { transform: "none" }], { ...blink, delay: 1750 });
  });
  setTimeout(() => {
    if (gen !== smGen) return;
    [white, splash, lids, spray.cv].forEach(smDrop);
    document.querySelectorAll(".xlump").forEach(smDrop);
  }, 7000);
};

// The frost and the blurred view, then the frozen pointer
const smFreeze = (x, y, gen) => {
  const frost = smExtra("div", "xfrost"), blur = smExtra("div", "xblur");
  const melt = SM_FREEZE_MS + 2500;
  if (xmasStill()) frost.style.opacity = 1;
  else {
    smAnimate(frost, [{ opacity: 0 }, { opacity: 1, offset: .03 }, { opacity: 1, offset: SM_FREEZE_MS / melt }, { opacity: 0 }], { duration: melt, fill: "forwards" });
    smAnimate(blur, [{ opacity: 1 }, { opacity: 1, offset: .2 }, { opacity: 0, offset: .55 }, { opacity: 0 }], { duration: melt, fill: "forwards" });
  }
  setTimeout(() => { if (gen === smGen) { smDrop(frost); smDrop(blur); } }, melt);
  if (!xmasStill()) smSlowPointer(x, y, melt);
};
// The frozen pointer: an icy one, following the real one slowly (stuckpointer.js)
const SM_ICY = '<svg viewBox="0 0 26 34" width="26" height="34"><path d="M2,2V27L8.5,21 13,31.5 17.5,29.5 13,19.5H22Z" fill="#e3f6ff" stroke="#3d8fc4" stroke-width="1.6" stroke-linejoin="round"/>' +
  '<path d="M5,9 8,12M5,15 9,17M10,21 11,25" stroke="#9fd4f2" stroke-width="1.2" stroke-linecap="round"/><path d="M2,27v4M8.5,21l1,4" stroke="#bfe6fb" stroke-width="1.6" stroke-linecap="round"/></svg>';
const smSlowPointer = (x, y, ms) => { smStuck = stuckPointer({ id: "xcursor", cursor: SM_ICY, ms, from: smMouse || [x, y] }); };

// The frozen pointer, gone at once (the fight needs the real one)
const smUnfreeze = () => {
  if (smStuck) smStuck.stop();
  smStuck = null;
};
