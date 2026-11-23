// ── Watching a video on a screen's music player ──
// What the day's cassette deck does with its VIDEO pill (tapevideo.js, tapemonitor.js), for the music
// players of the screens: the Christmas turntable, the jazz bar's, the Halloween cocotte, the sakura
// shamisen (their adapters are in scrvideos.js). Each has a television of its own look (scrtv.css):
// - a medallion set on the player (.svtrig, placed on a spot of it: `spot`), shown while the track on
//   has a long video (videoLong(), tapevideo.js: a live, 20 min at least, or an audio file's `video`);
//   pressed, the music plays and the medallion turns while the video's player goes through its ad
//   (the player's label says so), as the deck's LOAD;
// - then the player turns into the television, in its corner: the look's own transformation (a
//   layer of effects over the corner, .svfx, while the player goes away and the television comes),
//   its tube comes on with the look's own effect, and shows the video, with a plate (track, counter)
//   and keys (↺ ◀◀ ▶❚❚ ▶▶, next music, CRT, full screen, ⏏) that go away while the pointer rests;
//   ⏏ turns it back into the player.
// The sound stays the player's: a YouTube track's player is shown as it plays; an audio file's video
// is a player of its own, muted, following the music's time. As on the deck, YouTube's <iframe>s never
// move (they would load again, ad included): the one shown is laid exactly over the tube's place. It
// cannot go inside the television, so the television is two layers around it: .svback (the cabinet,
// under the picture) and .svfront (over the picture, laid on the tube: the plate, the keys, the snow,
// the CRT look, the turn-on effect, what of the look hangs over the picture).
// A screen's adapter: svScreen({ look, here, track, media, playing, play, pause, next, parts, spot,
// label?, trigger, cabinet, over?, turn?, fx?, brand, chrome }).
const SV_ALL = [];
const SV_FOLLOW = {};  // the owner of an audio file's video player (youtube.js)
// The transformation's timing (ms): the player gone and the television coming (swap), the
// television in place (grown); back, the television gone and the player coming (swap), all over (end)
const SV_IN = { swap: 440, grown: 1250 }, SV_OUT = { swap: 480, end: 1500 };
const SV_LOST_MS = 1500;  // a picture lost for a moment stays this long before the snow
const SV_KEYS = [
  ["restart", TAPE_KEYS[0][1], "From the start"], ["rew", "◀︎◀︎", "Back 30 s"], ["play", "▶︎", "Play / pause"],
  ["ff", "▶︎▶︎", "Forward 30 s"], null, ["next", "⇄", "Next music"], ["crt", "CRT", "Cathode ray look"],
  ["full", '<svg viewBox="0 0 24 16" aria-hidden="true"><path d="M5 6.5V3h4M15 3h4v3.5M19 9.5V13h-4M9 13H5V9.5"/></svg>', "Full screen"],
  ["eject", "⏏︎", "Back to the player"],
];
// The medallion's little television (with a play mark on its screen)
const SV_GLYPH = '<svg class="svglyph" viewBox="0 0 20 16" aria-hidden="true"><rect x="2" y="3.5" width="16" height="11" rx="2.2"/>' +
  '<path d="M7 1l3 2.5 3-2.5"/><path class="play" d="M8.6 6.6v5l4.2-2.5z"/></svg>';
const svRem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
const svStill = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const svClock = t => {
  t = Math.max(0, Math.floor(t || 0));
  const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60;
  return (h ? `${h}:${String(m).padStart(2, "0")}` : m) + ":" + String(s).padStart(2, "0");
};
// Text written only when it changes (the plate, the counter, the play key under the pointer)
const svText = (el, text) => { if (el.textContent !== text) el.textContent = text; };

// The music's sound: a YouTube video ({ yt: id }) or an <audio>; its time, and winding it
const svMedia = sv => sv.media() || null;
const svTime = sv => {
  const m = svMedia(sv);
  if (!m) return 0;
  if (m.yt) return YT_PLAYERS[m.yt] ? YT_PLAYERS[m.yt].time : 0;
  return m.currentTime || 0;
};
const svSeek = (sv, t) => {
  const m = svMedia(sv);
  if (!m) return;
  t = Math.max(0, t);
  if (m.yt) {
    const p = YT_PLAYERS[m.yt];
    if (p && !p.live) ytSeek(m.yt, p.owner, t);  // whoever plays it (a screen's own owner, or ytTrack's)
  } else m.currentTime = isFinite(m.duration) ? Math.min(t, m.duration - .5) : t;
};

// A screen's television: its medallion, its two layers, its keys and its layer of effects, made once
const svScreen = cfg => {
  const sv = Object.assign({ on: false, out: false, lit: false, full: false, frame: null, box: null, placed: "", spotAt: "",
    lostAt: 0, asked: 0, followed: "", timers: [], rest: null, stirX: 0, stirY: 0 }, cfg);
  sv.trig = document.createElement("button");
  sv.trig.type = "button";
  sv.trig.className = `svtrig ${sv.look}${sv.label ? "" : " nolabel"}`;  // no label: a bubble says it waits
  sv.trig.title = "Watch the video";
  sv.trig.setAttribute("aria-label", sv.trig.title);
  sv.trig.innerHTML = sv.trigger + '<span class="svbubble">Loading the video…</span>';
  sv.trig.addEventListener("click", e => { e.stopPropagation(); if (sv.on) svClose(sv); else svOpen(sv); });
  sv.back = document.createElement("div");
  sv.back.className = `svback ${sv.look}`;
  sv.back.innerHTML = sv.cabinet;
  sv.front = document.createElement("div");
  sv.front.className = `svfront ${sv.look}`;
  sv.front.innerHTML = `<i class="svnoise"></i><span class="svmsg"></span><i class="svcrt"></i><i class="svglare"></i>${sv.over || ""}` +
    `<i class="svturn">${sv.turn || ""}</i><p class="svplate">${sv.brand}<span class="svnow"></span><span class="svctr">0:00</span></p>` +
    '<div class="svkeys">' + SV_KEYS.map(k => k ? `<button type="button" class="svkey ${k[0]}" data-key="${k[0]}" title="${k[2]}" aria-label="${k[2]}"><span>${k[1]}</span></button>` : '<i class="svgap"></i>').join("") + "</div>";
  sv.fx = document.createElement("div");
  sv.fx.className = `svfx ${sv.look}`;
  sv.fx.innerHTML = sv.effects || "";
  sv.front.addEventListener("click", e => {
    e.stopPropagation();
    const key = e.target.closest(".svkey");
    if (!key) return;
    if (e.detail > 0) key.blur();  // a mouse click lets go of the focus, which would keep the keys
    SV_ACTIONS[key.dataset.key](sv);
  });
  sv.front.addEventListener("mousemove", e => {
    if (sv.front.classList.contains("rest") && Math.hypot(e.clientX - sv.stirX, e.clientY - sv.stirY) < MONITOR_STIR) return;
    sv.stirX = e.clientX;
    sv.stirY = e.clientY;
    svRest(sv, false);
  });
  ["touchstart", "focusin"].forEach(name => sv.front.addEventListener(name, () => svRest(sv, false)));
  sv.front.addEventListener("mouseleave", () => svRest(sv, true));
  SV_ALL.push(sv);
  return sv;
};

// The keys
const SV_ACTIONS = {
  restart: sv => svSeek(sv, 0),
  rew: sv => svSeek(sv, svTime(sv) - 30),
  ff: sv => svSeek(sv, svTime(sv) + 30),
  play: sv => (sv.playing() ? sv.pause() : sv.play()),
  next: sv => sv.next(),
  crt: () => svCrt(!svCrtOn()),
  full: sv => svFull(sv, !sv.full),
  eject: sv => svClose(sv),
};
// The CRT look, shared with the deck's monitor (tape-crt)
const svCrtOn = () => { try { return localStorage.getItem("tape-crt") === "1"; } catch (e) { return false; } };
const svCrt = on => {
  try { localStorage.setItem("tape-crt", on ? "1" : "0"); } catch (e) {}
  if (on) secretFound("crt");
  tapeDeck.classList.toggle("crt", on);
  SV_ALL.forEach(sv => sv.front.classList.toggle("crt", on));
};
// The plate and the keys go away while the pointer rests (as on the deck's monitor)
const svRest = (sv, rest) => {
  clearTimeout(sv.rest);
  sv.front.classList.toggle("rest", rest);
  if (!rest) sv.rest = setTimeout(() => sv.front.classList.add("rest"), 2500);
};

// The video's player, and whether it has a picture to show (as videoShowable, tapevideo.js, for the
// screen's player rather than the tape's)
const svPlayer = sv => {
  const t = sv.track(), id = t ? tapeVideoId(t) : "";
  return id ? ytPlayer(id) : null;
};
const svShowable = (sv, p) => p.ready && p.music && !p.ad &&
  (!sv.playing() || p.state === 3 || performance.now() - p.movedAt < YT_STILL_MS());
// An audio file's video plays and pauses with the music, muted, and goes back to its time when it
// drifts away from it; the one followed before is paused
const svFollow = sv => {
  const t = sv.track(), id = sv.on && t && !t.id ? tapeVideoId(t) : "";
  if (sv.followed && sv.followed !== id) ytPause(sv.followed, SV_FOLLOW);
  sv.followed = id;
  if (!id) return;
  const p = ytPlayer(id);
  if (!sv.playing()) { ytPause(id, SV_FOLLOW); return; }
  if (p.owner !== SV_FOLLOW || p.want !== "play") ytPlay(id, SV_FOLLOW, false);
  if (p.ready && p.music && Math.abs(p.time - svTime(sv)) > 1.5) ytSeek(id, SV_FOLLOW, svTime(sv));
};

// Its size: the free margin left of the notes (as fitMonitor, tapemonitor.js), no taller than the
// window (chrome: the cabinet's width and height besides the tube, in rem)
const svFit = sv => {
  const r = svRem(), notes = document.querySelector(".wrap"), back = sv.back.getBoundingClientRect();
  const room = notes.getBoundingClientRect().left + parseFloat(getComputedStyle(notes).paddingLeft) - back.left - 1.2 * r;
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
// The player shown, laid over the tube's place (as putFrame, tapevideo.js: 1920 px wide at least,
// scaled down, the embed's bars cut off), its corners rounded as the tube's. Written only when the
// player or the tube's box changes: its style written again, even the same, would have the browser
// lay the big <iframe> out again four times a second (the picture jolting)
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
  const width = Math.max(VIDEO_WIDTH, b.width), k = b.width / width;
  const radius = getComputedStyle(sv.front).borderTopLeftRadius.split(" ").map(v => (parseFloat(v) || 0) / k);
  const round = radius.length > 1 ? `${radius[0]}px / ${radius[1]}px` : `${radius[0]}px`;
  frame.style.cssText = `left:${b.left}px;top:${b.top - VIDEO_CROP * k}px;width:${width}px;height:${b.height / k + 2 * VIDEO_CROP}px;` +
    `transform:scale(${k});transform-origin:0 0;clip-path:inset(${VIDEO_CROP}px 0 round ${round})`;
  frame.classList.add("svscreen");
};
// The medallion, set on its spot of the player (moved only when the player has moved)
const svSpot = sv => {
  const at = sv.spot();
  if (!at) return;
  const key = `${Math.round(at[0])},${Math.round(at[1])}`;
  if (key === sv.spotAt) return;
  sv.spotAt = key;
  sv.trig.style.left = `${at[0]}px`;
  sv.trig.style.top = `${at[1]}px`;
};

// Four times a second: the medallions come and go with their tracks, and a video wanted waits for
// its picture, then the player turns into the television, then its tube shows the picture (or the snow)
const svTick = () => SV_ALL.forEach(sv => {
  const here = sv.here(), t = here ? sv.track() : null, can = !!t && videoLong(t);
  if (can && !sv.trig.isConnected) { sv.spotAt = ""; document.body.append(sv.trig); }
  if (!can && !sv.on && sv.trig.isConnected) sv.trig.remove();
  if (sv.trig.isConnected && !sv.out) svSpot(sv);
  if (!sv.on) return;
  if (!here || !t || !tapeVideoId(t)) { svClose(sv, !here); return; }  // the screen has gone, or a track with no video
  svFollow(sv);
  const p = svPlayer(sv), show = !!p && svShowable(sv, p);
  if (!sv.out) {
    if (!show && ((p && p.error) || performance.now() - sv.asked > VIDEO_WAIT_MS)) { svClose(sv); return; }
    svLoading(sv, !show);
    if (show) svShow(sv);
    return;
  }
  if (!sv.lit) return;
  // a picture lost for a moment (the player's time standing still while it loads more) stays on a
  // little before the snow comes, unless an ad breaks in or the video changes
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

// Waiting for the picture: the medallion turns, the player's label says so (or a bubble by it)
const svLoading = (sv, on) => {
  sv.trig.classList.toggle("svwait", on);
  const label = sv.label ? sv.label() : null;
  if (label && label.hasAttribute("data-svload") !== on) label.toggleAttribute("data-svload", on);
};
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

// The transformation: timers of its own (cleared when another starts), the player's parts (the
// medallion with them) going away and coming back with the look's animations ([data-svlook]), and
// the layer of effects laid over the whole corner, the player and the television together
const svLater = (sv, ms, fn) => sv.timers.push(setTimeout(fn, ms));
const svStop = sv => { sv.timers.forEach(clearTimeout); sv.timers = []; };
const svParts = sv => sv.parts().concat(sv.trig).filter(Boolean);
const svAway = (sv, away) => svParts(sv).forEach(el => {
  el.classList.remove("svaway", "svreturn", "svgone");
  el.setAttribute("data-svlook", sv.look);
  if (svStill()) { el.classList.toggle("svgone", away); return; }
  void el.offsetWidth;
  el.classList.add(away ? "svaway" : "svreturn");
});
const svEffects = (sv, way) => {
  if (svStill() || !sv.effects) return;
  const boxes = svParts(sv).concat(sv.back).filter(el => el.isConnected).map(el => el.getBoundingClientRect()).filter(b => b.width);
  if (!boxes.length) return;
  const r = svRem(), left = Math.min.apply(null, boxes.map(b => b.left)) - r, top = Math.min.apply(null, boxes.map(b => b.top)) - 2 * r;
  const right = Math.max.apply(null, boxes.map(b => b.right)) + r, bottom = Math.max.apply(null, boxes.map(b => b.bottom)) + r;
  Object.assign(sv.fx.style, { left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
  sv.fx.classList.remove("in", "out");
  document.body.append(sv.fx);
  void sv.fx.offsetWidth;
  sv.fx.classList.add(way);
  svLater(sv, SV_OUT.end + 300, () => sv.fx.remove());
};
// The player turns into the television, then its tube comes on (.lit: the look's turn-on effect,
// over the picture laid under it at once)
const svShow = sv => {
  svStop(sv);
  sv.out = true;
  svLoading(sv, false);
  sv.back.classList.remove("svrise", "svdrop");
  sv.back.classList.add("svpre");  // laid out, unseen, to be measured
  sv.front.classList.remove("lit", "showing", "waiting");
  sv.front.classList.toggle("crt", svCrtOn());
  sv.front.style.visibility = "hidden";
  document.body.append(sv.back, sv.front);
  svFit(sv);
  if (svStill()) { svAway(sv, true); sv.back.classList.remove("svpre"); svGrown(sv); return; }
  svEffects(sv, "in");
  svAway(sv, true);
  svLater(sv, SV_IN.swap, () => { sv.back.classList.remove("svpre"); sv.back.classList.add("svrise"); });
  svLater(sv, SV_IN.grown, () => svGrown(sv));
};
