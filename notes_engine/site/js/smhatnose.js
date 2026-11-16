// ── The snowman's hat and nose (snowman.js) ──
// The hat knocked off by a click, and the carrot nose dragged off his face: put back by him, or
// fished back with a rod drawn over the page.

// ── The hat: up in the air, spinning, down crooked, then straightened
smHat.addEventListener("click", e => {
  e.stopPropagation();
  if (smBusy || smHatUp) return;
  smHatUp = true;
  secretFound("sm-hat");
  smAnnoy();
  smSays(["Hey!", "My hat!", "Stop that!"][Math.min(smMad, 3) - 1]);
  smAnimate(smHat, [
    { transform: "none" }, { transform: "translate(8px,-80px) rotate(200deg)", offset: .3 },
    { transform: "translate(16px,-6px) rotate(372deg)", offset: .55 }, { transform: "translate(14px,-3px) rotate(374deg)", offset: .62 },
    { transform: "translate(14px,-3px) rotate(374deg)", offset: .82 }, { transform: "translate(0,-6px) rotate(358deg)", offset: .92 },
    { transform: "rotate(360deg)" },
  ], { duration: 2400, easing: "ease-out" });
  setTimeout(() => { smHatUp = false; smCheck(); }, xmasStill() ? 300 : 2400);
});

// ── His nose: the carrot, on its own, the same drawing at the same size as on him. It turns
// around its thick end (#xcarrot's transform-origin), where the hook takes it.
const smCarrot = () => {
  const k = smK();
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.id = "xcarrot";
  el.setAttribute("viewBox", "174 144 72 20");
  el.setAttribute("width", f1(72 * k));
  el.setAttribute("height", f1(20 * k));
  el.innerHTML = '<defs><linearGradient id="sm-carrot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb867"/>' +
    '<stop offset=".45" stop-color="#ee7d18"/><stop offset="1" stop-color="#a8480a"/></linearGradient></defs>' + SNOWMAN_NOSE;
  smExtras.push(el);
  document.body.append(el);
  return el;
};
let smAt = [0, 0, 0];  // where the carrot is: its top left corner, its rotation
const smHome = () => smPt(174, 144);
const smPlace = (el, x, y, rot) => {
  smAt = [x, y, rot];
  el.style.transform = `translate(${f1(x)}px,${f1(y)}px) rotate(${f1(rot)}deg)`;
};
const smBait = () => { const k = smK(); return [smAt[0] + 4 * k, smAt[1] + 8 * k]; };  // its thick end
const smNoseBack = async (el, gen, ms) => {  // from where it is back on his face
  const [x0, y0, r0] = smAt, [x1, y1] = smHome();
  await smTween(ms, t => { const e = smEase(t); smPlace(el, smLerp(x0, x1, e), smLerp(y0, y1, e), r0 * (1 - e)); });
  if (gen !== smGen) return;
  smDrop(el);
  snowman.classList.remove("noseless", "hold");
};
smNose.addEventListener("pointerdown", e => {
  if (smBusy || e.button > 0) return;
  e.preventDefault();
  e.stopPropagation();
  smBusy = true;
  const gen = smGen;
  smAnnoy();
  smSays("My nose!");
  snowman.classList.add("noseless", "hold");
  const el = smCarrot();
  el.classList.add("held");
  const [hx, hy] = smHome(), dx = e.clientX - hx, dy = e.clientY - hy;
  smPlace(el, hx, hy, 0);
  const move = ev => smPlace(el, ev.clientX - dx, ev.clientY - dy, Math.max(-25, Math.min(25, (ev.clientX - dx - smAt[0]) * 2)));
  const up = ev => {
    removeEventListener("pointermove", move);
    removeEventListener("pointerup", up);
    removeEventListener("pointercancel", up);
    if (gen !== smGen) return;
    el.classList.remove("held");
    const r = snowman.getBoundingClientRect();
    const onHim = ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
    if (!onHim) secretFound("sm-nose");  // carried away from him, not just pulled and put back
    (onHim ? smReplant : smFish)(el, gen);
  };
  addEventListener("pointermove", move);
  addEventListener("pointerup", up);
  addEventListener("pointercancel", up);
});
// Put back on him: he takes it and plants it where it belongs
const smReplant = async (el, gen) => {
  smAnimate(smArm, [{ transform: "rotate(0)" }, { transform: "rotate(-38deg)", offset: .5 }, { transform: "rotate(0)" }], { duration: 700, easing: "ease-in-out" });
  await smWait(250);
  await smNoseBack(el, gen, 400);
  if (gen !== smGen) return;
  smSays("There.");
  smBusy = false;
  setTimeout(smCheck, 800);
};

// The fishing rod, drawn over the page in window pixels, from his hand: a cork handle, a blank
// bending as a quadratic curve (three strokes, thinner towards the tip), four rings, a reel with
// its crank; the line from the tip to the hook, sagging, its red and white float; a ripple.
// R: theta (the rod's angle, degrees), len, bend (-1..1, to the clockwise side), crank (radians),
// hook ([x, y] or null), sag (px), bob (the float's bobbing, px), ripple ({ x, y, r, o } or null).
const smRod = () => {
  const k = smK(), wrap = smExtra("div", "xline");
  wrap.innerHTML = '<svg width="100%" height="100%"><path class="line"/><ellipse class="ripple"/><path class="cork"/>' +
    '<path class="blank b0"/><path class="blank b1"/><path class="blank b2"/><g class="rings"><circle/><circle/><circle/><circle/></g>' +
    '<g class="reel"><circle class="spool"/><path class="crank"/><circle class="knob"/></g>' +
    '<g class="float"><circle/><path/></g><path class="hook"/></svg>';
  const q = sel => wrap.querySelector(sel), qa = sel => wrap.querySelectorAll(sel);
  const set = (el, attrs) => { for (const a in attrs) el.setAttribute(a, typeof attrs[a] === "number" ? f1(attrs[a]) : attrs[a]); };
  [[".cork", 6.5], [".b0", 1.5], [".b1", 2.6], [".b2", 3.6], [".crank", 2]].forEach(([s, w]) => set(q(s), { "stroke-width": w * k }));
  set(q(".spool"), { r: 6.5 * k });
  set(q(".knob"), { r: 2.2 * k });
  set(q(".float circle"), { r: 5 * k });
  qa(".rings circle").forEach((c, i) => set(c, { r: (2.4 - i * .35) * k }));
  const R = { theta: -60, len: 0, bend: 0, crank: 0, hook: null, sag: 0, bob: 0, ripple: null, tip: [0, 0] };
  R.draw = () => {
    const B = smHand(), a = R.theta * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], p = [-d[1], d[0]], L = R.len;
    const T = [B[0] + d[0] * L + p[0] * R.bend * L * .35, B[1] + d[1] * L + p[1] * R.bend * L * .35];
    const C = [B[0] + d[0] * L * .55 + p[0] * R.bend * L * .12, B[1] + d[1] * L * .55 + p[1] * R.bend * L * .12];
    const at = t => [(1 - t) * (1 - t) * B[0] + 2 * (1 - t) * t * C[0] + t * t * T[0], (1 - t) * (1 - t) * B[1] + 2 * (1 - t) * t * C[1] + t * t * T[1]];
    const part = t => {  // the curve from the hand to t (de Casteljau)
      const c = [smLerp(B[0], C[0], t), smLerp(B[1], C[1], t)], e = at(t);
      return `M${f1(B[0])},${f1(B[1])}Q${f1(c[0])},${f1(c[1])} ${f1(e[0])},${f1(e[1])}`;
    };
    R.tip = T;
    set(q(".b0"), { d: part(1) });
    set(q(".b1"), { d: part(.62) });
    set(q(".b2"), { d: part(.3) });
    const h0 = [B[0] - d[0] * 13 * k, B[1] - d[1] * 13 * k], h1 = [B[0] + d[0] * 12 * k, B[1] + d[1] * 12 * k];
    set(q(".cork"), { d: L ? `M${f1(h0[0])},${f1(h0[1])}L${f1(h1[0])},${f1(h1[1])}` : "M0,0" });
    qa(".rings circle").forEach((c, i) => { const r = at([.3, .55, .78, 1][i]); set(c, { cx: r[0], cy: r[1] }); });
    const rc = [B[0] - d[0] * 4 * k + p[0] * 7 * k, B[1] - d[1] * 4 * k + p[1] * 7 * k];
    const kn = [rc[0] + Math.cos(R.crank) * 7 * k, rc[1] + Math.sin(R.crank) * 7 * k];
    set(q(".spool"), { cx: rc[0], cy: rc[1] });
    set(q(".crank"), { d: `M${f1(rc[0])},${f1(rc[1])}L${f1(kn[0])},${f1(kn[1])}` });
    set(q(".knob"), { cx: kn[0], cy: kn[1] });
    q(".reel").style.opacity = L > 20 * k ? 1 : 0;
    const H = R.hook;
    q(".line").style.display = q(".hook").style.display = H ? "" : "none";
    q(".float").style.display = H && R.bob !== null ? "" : "none";
    if (H) {
      const M = [(T[0] + H[0]) / 2, (T[1] + H[1]) / 2 + R.sag];
      set(q(".line"), { d: `M${f1(T[0])},${f1(T[1])}Q${f1(M[0])},${f1(M[1])} ${f1(H[0])},${f1(H[1])}` });
      const u = .78, fx = (1 - u) * (1 - u) * T[0] + 2 * (1 - u) * u * M[0] + u * u * H[0], fy = (1 - u) * (1 - u) * T[1] + 2 * (1 - u) * u * M[1] + u * u * H[1] + (R.bob || 0);
      set(q(".float circle"), { cx: fx, cy: fy });
      set(q(".float path"), { d: `M${f1(fx - 5 * k)},${f1(fy)}A${f1(5 * k)},${f1(5 * k)} 0 0 1 ${f1(fx + 5 * k)},${f1(fy)}Z` });
      set(q(".hook"), { d: `M${f1(H[0])},${f1(H[1] - 6 * k)}v${f1(6 * k)}q0,${f1(4 * k)} ${f1(-3.5 * k)},${f1(4 * k)}q${f1(-3 * k)},0 ${f1(-3.5 * k)},${f1(-3 * k)}` });
    }
    const W = R.ripple;
    q(".ripple").style.display = W ? "" : "none";
    if (W) set(q(".ripple"), { cx: W.x, cy: W.y, rx: W.r, ry: W.r * .35, opacity: W.o });
  };
  R.wrap = wrap;
  return R;
};
// Dropped elsewhere: it lies there, and he fishes it back
const smFish = async (el, gen) => {
  smPlace(el, smAt[0], smAt[1], 18);
  if (xmasStill()) { await smNoseBack(el, gen, 0); smBusy = false; smSays("Got it."); return smCheck(); }
  await smWait(500);
  if (gen !== smGen) return;
  smSays("Hmm… 🎣", 1600);
  const k = smK(), R = smRod(), bait = smBait();
  const stale = () => gen !== smGen;
  // the rod comes out of his hand, pointing up
  await smTween(350, t => { R.len = 150 * k * smEase(t); smSetArm(-12 * t); R.draw(); });
  // the back cast, straight up (not across his face), then the forward cast towards the carrot
  await smTween(420, t => { const e = smEase(t); R.theta = -60 - 42 * e; smSetArm(-12 - 26 * e); R.bend = -.3 * e; R.draw(); });
  if (stale()) return;
  const B = smHand(), aim = Math.max(-70, Math.min(-12, Math.atan2(bait[1] - B[1], bait[0] - B[0]) * 180 / Math.PI - 28));
  await smTween(200, t => { const e = t * t; R.theta = -102 + (aim + 102) * e; smSetArm(-38 + 38 * e); R.bend = .55 * Math.sin(t * Math.PI); R.draw(); });
  if (stale()) return;
  // the line flies out in an arc, the float and the hook landing by the carrot; the rod quivers
  const T0 = R.tip.slice(), top = Math.min(T0[1], bait[1]) - 170;
  smNoise(700, 2400, 900, .05);
  await smTween(800, t => {
    const u = 1 - t;
    R.hook = [u * u * T0[0] + 2 * u * t * (T0[0] + bait[0]) / 2 + t * t * bait[0], u * u * T0[1] + 2 * u * t * top + t * t * bait[1]];
    R.bend = .35 * Math.exp(-4 * t) * Math.cos(t * 20);
    R.sag = 50 * k * t;
    R.bob = 0;
    R.draw();
  });
  if (stale()) return;
  // plop: a ripple, the float bobbing
  await smTween(900, t => {
    R.ripple = { x: bait[0], y: bait[1] + 4 * k, r: (4 + 34 * t) * k, o: 1 - t };
    R.bob = Math.sin(t * 14) * 3 * k * (1 - t);
    R.draw();
  });
  if (stale()) return;
  R.ripple = null;
  // the strike: rod up, carrot hooked (it jumps), line taut
  smSays("Got it!", 1500);
  await smTween(220, t => { R.theta = aim - 20 * smEase(t); R.bend = .45 * t; R.sag = 50 * k * (1 - t); R.draw(); });
  if (stale()) return;
  // the reel: crank turning, rod bent, the carrot coming, wriggling, hanging from the hook
  const H0 = bait.slice(), r0 = smAt[2];
  await smTween(1400, t => {
    const e = smEase(t), T = R.tip;
    R.crank += .45;
    R.bend = .45 * (1 - e * .7);
    R.bob = null;
    const w = Math.sin(t * 22) * 7 * k * (1 - e);
    R.hook = [smLerp(H0[0], T[0], e) + w * .4, smLerp(H0[1], T[1] + 14 * k, e) + w];
    const kk = smK();
    smPlace(el, R.hook[0] - 4 * kk, R.hook[1] - 8 * kk, smLerp(r0, 80, Math.min(1, t * 2)));
    R.draw();
  });
  if (stale()) return;
  // up to his face, then on it, as the rod goes back away
  const r1 = smAt[2];
  await smTween(450, t => {
    const e = smEase(t);
    R.theta = aim - 20 + (-95 - aim + 20) * e;
    R.bend = .15 * (1 - e);
    smSetArm(-20 * e);
    R.draw();
    R.hook = [R.tip[0], R.tip[1] + 14 * k];
    const kk = smK();
    smPlace(el, R.hook[0] - 4 * kk, R.hook[1] - 8 * kk, r1);
  });
  if (stale()) return;
  R.hook = null;
  R.draw();
  const back = smNoseBack(el, gen, 450);
  await smTween(350, t => { R.len = 150 * k * (1 - smEase(t)); smSetArm(-20 * (1 - t)); R.draw(); });
  await back;
  if (stale()) return;
  smDrop(R.wrap);
  smSetArm(0);
  smBusy = false;
  setTimeout(smCheck, 800);
};
