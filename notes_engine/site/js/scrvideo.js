// ── Watching a video on a screen's music player: the television ──
// What the day's cassette deck does with its VIDEO pill (tapevideo.js, tapemonitor.js), for the music
// players of the screens: the Christmas turntable, the jazz bar's, the Halloween cocotte, the sakura
// shamisen. Each screen gives its player a television of its own look, in a pair of files of its own
// (scrtvxmas.js / .css, scrtvjazz, scrtvhw, scrtvsakura: its adapter and its look); what they share is
// in four files, loaded in this order:
//   scrvideo.js     this file: svScreen() makes a screen's television (its medallion, its two layers,
//                   its keys, its layer of effects), the keys' actions, the helpers the adapters share
//   scrvidpic.js    the picture: the video's player, its size and place, the tick that runs it all
//   scrvidmorph.js  the transformation: the player turning into the television and back
//   scrvidfull.js   full screen, the window changing size, the F key
// How it goes:
// - a medallion set on the player (.svtrig, on a spot of it: `spot`), shown while the track on has a
//   long video (videoLong(), tapevideo.js: a live, 20 min at least, or an audio file's `video`);
//   pressed, the music plays and a ring turns around it while the video's player goes through its ad
//   (the player's label says so), as the deck's LOAD;
// - then the player turns into the television, in its corner, with the look's own transformation; its
//   tube comes on with the look's own effect and shows the video, with a plate (track, counter) and
//   keys (↺ ◀◀ ▶❚❚ ▶▶, next music, CRT, full screen, ⏏) that go away while the pointer rests; ⏏ turns
//   it back into the player.
// The sound stays the player's: a YouTube track's player is shown as it plays; an audio file's video
// is a player of its own, muted, following the music's time. As on the deck, YouTube's <iframe>s never
// move (they would load again, ad included): the one shown is laid exactly over the tube's place. It
// cannot go inside the television, so the television is two layers around it: .svback (the cabinet,
// under the picture) and .svfront (over the picture, laid on the tube: the plate, the keys, the snow,
// the CRT look, the turn-on effect, what of the look hangs over the picture).
//
// A screen's adapter calls svScreen({ ... }) with:
//   look      its class (xtv, jtv...), on every part of its television
//   el        the player's main element: the television exists while it is in the page
//   track()   the track on: { id } for a YouTube video, { file, video } for an audio file and its clip
//   media()   its sound: { yt: id } for a YouTube video, the <audio> for a file, null when off
//   playing(), play(), pause(), next()   its music, as its own controls do
//   parts()   the elements of the player, gone while the television is out
//   spot()    where its medallion goes: [x, y] in the window (svOn() helps), null when unknown
//   label     a selector of its label inside el, which says "Loading the video…" meanwhile (optional)
//   trigger, cabinet, over, turn, effects, brand   the HTML of its medallion, its cabinet (with a
//             .svtube), what hangs over the picture, its turn-on effect, its transformation's
//             effects, its plate's brand (all static, written in its file)
//   chrome    [w, h]: the cabinet's width and height besides the tube, in rem (to fit the window)
const SV_ALL = [];
const SV_FOLLOW = {};  // the owner of an audio file's video player (youtube.js)
// The keys: the deck's glyphs (TAPE_KEYS, tapes.js and tapemonitor.js) under the screens' names
const svGlyph = k => TAPE_KEYS.find(entry => entry[0] === k)[1];
const SV_KEYS = [
  ["restart", svGlyph("restart"), "From the start"], ["rew", svGlyph("rew"), "Back 30 s"], ["play", "▶︎", "Play / pause"],
  ["ff", svGlyph("ff"), "Forward 30 s"], null, ["next", "⇄", "Next music"], ["crt", svGlyph("crt"), "Cathode ray look"],
  ["full", svGlyph("full"), "Full screen"], ["eject", svGlyph("eject"), "Back to the player"],
];
// The medallion's little television (a play mark on its screen), for the looks that show it
const SV_GLYPH = '<svg class="svglyph" viewBox="0 0 20 16" aria-hidden="true"><rect x="2" y="3.5" width="16" height="11" rx="2.2"/>' +
  '<path d="M7 1l3 2.5 3-2.5"/><path class="play" d="M8.6 6.6v5l4.2-2.5z"/></svg>';
// Parts of cabinets several looks share
const SV_ANTENNAS = '<div class="svant"><b></b><b></b></div>';
const svRem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
const svStill = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// Text written only when it changes (the plate, the counter, the play key under the pointer)
const svText = (el, text) => { if (el.textContent !== text) el.textContent = text; };
const svClock = t => {
  t = Math.max(0, Math.floor(t || 0));
  const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60;
  return (h ? `${h}:${String(m).padStart(2, "0")}` : m) + ":" + String(s).padStart(2, "0");
};
// For the adapters: a point of an element of the player (sel inside el), at fractions fx, fy of its
// box plus dx, dy px; null while it is not in the page
const svOn = (el, sel, fx, fy, dx, dy) => {
  const part = el.querySelector(sel);
  if (!part || !part.isConnected) return null;
  const b = part.getBoundingClientRect();
  return [b.left + fx * b.width + dx, b.top + fy * b.height + dy];
};
// For the adapters' effects: n elements scattered at random once, each with its CSS variables
const svScatter = (n, tag, vars) => Array.from({ length: n }, (x, i) => `<${tag} style="${vars(i, n)}"></${tag}>`).join("");
const svRand = (a, b) => (a + Math.random() * (b - a)).toFixed(2);

// The music's sound: its time, and winding it (a YouTube video by whoever plays it: a screen's own
// owner, or ytTrack's; an <audio> within its length)
const svTime = sv => {
  const m = sv.media();
  if (!m) return 0;
  if (m.yt) return YT_PLAYERS[m.yt] ? YT_PLAYERS[m.yt].time : 0;
  return m.currentTime || 0;
};
const svSeek = (sv, t) => {
  const m = sv.media();
  if (!m) return;
  t = Math.max(0, t);
  if (m.yt) {
    const p = YT_PLAYERS[m.yt];
    if (p && !p.live) ytSeek(m.yt, p.owner, t);
  } else m.currentTime = isFinite(m.duration) ? Math.min(t, m.duration - .5) : t;
};

// A screen's television, made once: its medallion, its two layers, its keys and its layer of effects
// (all its HTML static, from its adapter; the track's name only ever goes in as text)
const svScreen = cfg => {
  const sv = Object.assign({ on: false, out: false, lit: false, full: false, frame: null, box: null, placed: "", spotAt: "",
    lostAt: 0, asked: 0, followed: "", timers: [] }, cfg);
  const make = (tag, cls, html) => {
    const el = document.createElement(tag);
    el.className = `${cls} ${sv.look}`;
    el.innerHTML = html;
    return el;
  };
  sv.here = () => sv.el.isConnected;
  sv.trig = make("button", sv.label ? "svtrig" : "svtrig nolabel", sv.trigger + '<span class="svbubble">Loading the video…</span>');
  sv.trig.type = "button";
  sv.trig.title = "Watch the video";
  sv.trig.setAttribute("aria-label", sv.trig.title);
  sv.trig.addEventListener("click", e => { e.stopPropagation(); if (sv.on) svClose(sv); else svOpen(sv); });
  sv.back = make("div", "svback", sv.cabinet);
  sv.front = make("div", "svfront", `<i class="svnoise"></i><span class="svmsg"></span><i class="svcrt"></i><i class="svglare"></i>${sv.over || ""}` +
    `<i class="svturn">${sv.turn || ""}</i><p class="svplate">${sv.brand}<span class="svnow"></span><span class="svctr">0:00</span></p>` +
    '<div class="svkeys">' + SV_KEYS.map(k => k ? `<button type="button" class="svkey ${k[0]}" data-key="${k[0]}" title="${k[2]}" aria-label="${k[2]}"><span>${k[1]}</span></button>` : '<i class="svgap"></i>').join("") + "</div>");
  sv.fx = make("div", "svfx", sv.effects || "");
  sv.front.addEventListener("click", e => {
    e.stopPropagation();
    const key = e.target.closest(".svkey");
    if (key) SV_ACTIONS[key.dataset.key](sv);
  });
  sv.rest = pointerRest(sv.front);  // the plate and keys go away while the pointer rests (tapemonitor.js)
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
// The CRT look, the deck's (setCrt, tapemonitor.js: remembered), on every television too
const svCrtOn = () => tapeDeck.classList.contains("crt");
const svCrt = on => {
  setCrt(on);
  SV_ALL.forEach(sv => sv.front.classList.toggle("crt", on));
};
