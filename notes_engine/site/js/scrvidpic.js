// ── Watching a video on a screen's music player: the picture ──
// The video's player, the television's size and place, and the tick that runs it all, four times a
// second: the medallions coming and going with their tracks, the wait for a picture, the picture shown
// on the tube (or the snow). What a television is and the adapters' fields: scrvideo.js.

// The video's player, and whether it has a picture to show (videoShowable, tapevideo.js, with the
// screen player's music rather than the tape's)
const svPlayer = sv => {
  const t = sv.track(), id = t ? tapeVideoId(t) : "";
  return id ? ytPlayer(id) : null;
};
// An audio file's video follows its music, muted (followVideo, tapevideo.js); a YouTube track's
// video is its own player, nothing to follow
const svFollow = sv => {
  const t = sv.track(), id = sv.on && t && !t.id ? tapeVideoId(t) : "";
  sv.followed = followVideo(SV_FOLLOW, sv.followed, id, sv.playing(), svTime(sv));
};

// Its size: the free margin left of the notes (notesMargin, tapemonitor.js), no taller than the window
// (chrome: the cabinet's width and height besides the tube, in rem), 12 to 40 rem wide
const svFit = sv => {
  const r = svRem(), room = notesMargin(sv.back.getBoundingClientRect().left);
  const bottom = parseFloat(getComputedStyle(sv.back).bottom) || 0;
  const tall = (innerHeight - bottom - 1.5 * r - sv.chrome[1] * r) * 16 / 9 + sv.chrome[0] * r;
  sv.back.style.setProperty("--sv-w", `${Math.max(12 * r, Math.min(room, tall, 40 * r))}px`);
};
// The tube's box in the window: the cabinet's .svtube, or the whole window (16:9) in full screen;
// the front layer is laid on it, and the picture under it
const svPlace = sv => {
  let box;
  if (sv.full) {
    const w = Math.min(innerWidth, innerHeight * 16 / 9), h = w * 9 / 16;
    box = { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h };
  } else {
    const t = sv.back.querySelector(".svtube").getBoundingClientRect();
    box = { left: t.left, top: t.top, width: t.width, height: t.height };
  }
  sv.box = box;
  Object.assign(sv.front.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
  if (sv.frame) svPut(sv, sv.frame);
};
// The player shown (frameStyle, tapevideo.js: laid over the tube, its corners rounded as the tube's,
// --sv-r), or none (the tube shows its snow). Its style is written only when the player or the tube's
// box changes: written again, even the same, it would have the browser lay the big <iframe> out again
// four times a second (the picture jolting)
const svPut = (sv, frame) => {
  if (sv.frame && sv.frame !== frame) {
    sv.frame.classList.remove("svscreen");
    sv.frame.style.cssText = "";
    sv.placed = "";
  }
  sv.frame = frame;
  sv.front.classList.toggle("showing", !!frame);
  sv.front.classList.toggle("waiting", sv.lit && !frame);
  if (!frame || !sv.box) return;
  const b = sv.box, at = [b.left, b.top, b.width, b.height].join();
  if (at === sv.placed) return;
  sv.placed = at;
  const radius = getComputedStyle(sv.front).borderTopLeftRadius.split(" ").map(v => parseFloat(v) || 0);
  frame.style.cssText = frameStyle(b, [radius[0], radius.length > 1 ? radius[1] : radius[0]]);
  frame.classList.add("svscreen");
};
// The medallion on its spot of the player (moved only when the player has moved)
const svSpot = sv => {
  const at = sv.spot();
  if (!at) return;
  const key = `${Math.round(at[0])},${Math.round(at[1])}`;
  if (key === sv.spotAt) return;
  sv.spotAt = key;
  sv.trig.style.left = `${at[0]}px`;
  sv.trig.style.top = `${at[1]}px`;
};

// Four times a second: the medallions come and go with their tracks; a video wanted waits for its
// picture, then the player turns into the television (svShow, scrvidmorph.js), then its tube shows
// the picture, the plate and the play key follow the music. A picture lost for a moment (the player's
// time standing still while it loads more) stays SV_LOST_MS before the snow comes, unless an ad breaks
// in or the video changes.
const SV_LOST_MS = 1500;
const svTick = () => SV_ALL.forEach(sv => {
  const here = sv.here(), t = here ? sv.track() : null, can = !!t && videoLong(t);
  if (can && !sv.trig.isConnected) { sv.spotAt = ""; document.body.append(sv.trig); }
  if (!can && !sv.on && sv.trig.isConnected) sv.trig.remove();
  if (sv.trig.isConnected && !sv.out) svSpot(sv);
  if (!sv.on) return;
  if (!here || !t || !tapeVideoId(t)) { svClose(sv, !here); return; }  // the screen has gone, or a track with no video
  svFollow(sv);
  const p = svPlayer(sv), show = !!p && videoShowable(p, sv.playing());
  if (!sv.out) {
    if (!show && ((p && p.error) || performance.now() - sv.asked > VIDEO_WAIT_MS)) { svClose(sv); return; }
    svLoading(sv, !show);
    if (show) svShow(sv);
    return;
  }
  if (!sv.lit) return;
  const now = performance.now();
  if (show) sv.lostAt = 0; else if (!sv.lostAt) sv.lostAt = now;
  const keep = !show && !!p && sv.frame === p.frame && !p.ad && !p.error && now - sv.lostAt < SV_LOST_MS;
  svPut(sv, show || keep ? p.frame : null);
  svText(sv.front.querySelector(".svnow"), t.name);
  svText(sv.front.querySelector(".svctr"), p && p.live ? "LIVE" : svClock(svTime(sv)));
  svText(sv.front.querySelector(".svkey.play span"), sv.playing() ? "❚❚" : "▶︎");
  sv.front.classList.toggle("paused", !sv.playing());
});
setInterval(svTick, 250);

// Waiting for the picture: the medallion's ring turns, the player's label says so (or a bubble by it)
const svLoading = (sv, on) => {
  sv.trig.classList.toggle("svwait", on);
  const label = sv.label ? sv.el.querySelector(sv.label) : null;
  if (label && label.hasAttribute("data-svload") !== on) label.toggleAttribute("data-svload", on);
};
// The medallion pressed: the music plays (a click: with sound) and the picture is awaited; another
// screen's television, if any, goes at once
const svOpen = sv => {
  const t = sv.track();
  if (!t || !videoLong(t)) return;
  SV_ALL.forEach(other => { if (other !== sv && other.on) svClose(other, true); });
  sv.on = true;
  sv.asked = performance.now();
  sv.trig.classList.add("on");
  if (!sv.playing()) sv.play();
  svTick();
};
