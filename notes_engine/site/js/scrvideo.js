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
