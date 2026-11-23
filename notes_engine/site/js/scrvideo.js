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
