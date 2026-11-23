// ── Watching a video on a screen's music player: the transformation ──
// The player turning into its television, and back. Each look writes its own (scrtv*.css): the
// player's parts going away and coming back ([data-svlook].svaway / .svreturn: individual scale /
// translate / rotate, not transform, which the players use for their own poses), the cabinet coming
// and going (.svback.svrise / .svdrop), and a layer of effects laid over the whole corner, the player
// and the television together (.svfx.in / .out: snow, a curtain, smoke, petals...). This file only
// times them: SV_IN (ms) the player gone and the cabinet coming (swap), the cabinet in place and its
// tube coming on (grown); SV_OUT the cabinet gone and the player coming (swap), all over (end).
const SV_IN = { swap: 440, grown: 1250 }, SV_OUT = { swap: 480, end: 1500 };
// Its timers, its own (cleared when another transformation starts, or at once when the screen goes)
const svLater = (sv, ms, fn) => sv.timers.push(setTimeout(fn, ms));
const svStop = sv => { sv.timers.forEach(clearTimeout); sv.timers = []; };
// The player's parts, the medallion with them, away or back (reduced motion: hidden, shown)
const svParts = sv => sv.parts().concat(sv.trig).filter(Boolean);
const svUnmark = sv => svParts(sv).forEach(el => el.classList.remove("svaway", "svreturn", "svgone"));
const svAway = (sv, away) => svParts(sv).forEach(el => {
  el.classList.remove("svaway", "svreturn", "svgone");
  el.setAttribute("data-svlook", sv.look);
  if (svStill()) { el.classList.toggle("svgone", away); return; }
  void el.offsetWidth;  // the animation starts again, even right after the other one
  el.classList.add(away ? "svaway" : "svreturn");
});
// The layer of effects over the box of the player and the cabinet together (a rem around, two above),
// taken off once its animations are over
const svEffects = (sv, way) => {
  if (svStill() || !sv.effects) return;
  const boxes = svParts(sv).concat(sv.back).filter(el => el.isConnected).map(el => el.getBoundingClientRect()).filter(b => b.width);
  if (!boxes.length) return;
  const r = svRem(), edge = (f, side) => f.apply(null, boxes.map(b => b[side]));
  const left = edge(Math.min, "left") - r, top = edge(Math.min, "top") - 2 * r;
  Object.assign(sv.fx.style, { left: `${left}px`, top: `${top}px`, width: `${edge(Math.max, "right") + r - left}px`, height: `${edge(Math.max, "bottom") + r - top}px` });
  sv.fx.classList.remove("in", "out");
  document.body.append(sv.fx);
  void sv.fx.offsetWidth;
  sv.fx.classList.add(way);
  svLater(sv, SV_OUT.end + 300, () => sv.fx.remove());
};

// The player turns into the television: the cabinet laid out unseen (.svpre) to be measured and sized,
// the effects over the corner, the player going, then the cabinet coming, then its tube on
const svShow = sv => {
  svStop(sv);
  sv.out = true;
  svLoading(sv, false);
  sv.back.classList.remove("svrise", "svdrop");
  sv.back.classList.add("svpre");
  sv.front.classList.remove("lit", "showing", "waiting");
  sv.front.classList.toggle("crt", svCrtOn());
  sv.front.style.visibility = "hidden";
  document.body.append(sv.back, sv.front);
  svFit(sv);
  if (svStill()) { svAway(sv, true); svGrown(sv); return; }
  svEffects(sv, "in");
  svAway(sv, true);
  svLater(sv, SV_IN.swap, () => { sv.back.classList.remove("svpre"); sv.back.classList.add("svrise"); });
  svLater(sv, SV_IN.grown, () => svGrown(sv));
};
// In place: the front layer laid on its tube, the tube comes on (.lit: the look's turn-on effect, over
// the picture laid under it at once), the plate and keys show a moment
const svGrown = sv => {
  if (!sv.out) return;
  sv.back.classList.remove("svrise", "svpre");
  svPlace(sv);
  sv.front.style.visibility = "";
  sv.front.classList.add("lit");
  sv.lit = true;
  secretFound("video");
  sv.rest(false);
  svTick();
};
// Back: the picture and the follower let go, and the television turns back into the player (at once
// when the screen goes, or with reduced motion)
const svClose = (sv, atOnce) => {
  sv.on = false;
  sv.lit = false;
  svFollow(sv);
  svPut(sv, null);
  svLoading(sv, false);
  svFull(sv, false);
  sv.trig.classList.remove("on", "svwait");
  sv.front.remove();
  if (!sv.out) return;
  svStop(sv);
  sv.out = false;
  if (atOnce === true || svStill()) {
    sv.back.remove();
    sv.fx.remove();
    svUnmark(sv);
    return;
  }
  svEffects(sv, "out");
  sv.back.classList.remove("svrise", "svpre");
  sv.back.classList.add("svdrop");
  svLater(sv, SV_OUT.swap, () => { sv.back.remove(); sv.back.classList.remove("svdrop"); svAway(sv, false); });
  svLater(sv, SV_OUT.end, () => svUnmark(sv));
};
