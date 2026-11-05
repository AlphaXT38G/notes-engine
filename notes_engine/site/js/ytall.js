// ── Every music of the site, made ahead ──
// A YouTube video may open with a long ad (over two minutes, seen on the sakura tracks). It plays
// muted in its hidden player (youtube.js) and the music follows, so the ad must already be over when
// someone asks for the music, on whatever screen. At the first sign of life of a visitor (pointer,
// tap, key, scroll) EVERY YouTube video of the site is made ahead (ytWarm), those of the screen on
// show first, one every 1.5 s so that the page and the network are not swamped at once. Nothing is
// heard: the players stay muted and paused. The videos are the cassette deck's tapes (TAPE_BANDS
// holds the sakura, Halloween and Christmas ones too): a new video added to a band is made ahead too.
const YT_WARM_GAP = 1500;
const YT_WARM_EVENTS = ["pointermove", "pointerdown", "touchstart", "keydown", "scroll", "wheel"];
const ytSiteIds = () => {
  const cls = document.body.classList;
  const onShow = cls.contains("sakura") ? SK_TRACKS : cls.contains("halloween") ? HW_TRACKS : [];
  const ids = [];
  onShow.concat(...TAPE_BANDS.map(band => band.tapes)).forEach(t => { if (t.id && ids.indexOf(t.id) < 0) ids.push(t.id); });
  // Christmas' turntable plays the Christmas radio, a tape too: first on the Christmas screens
  return cls.contains("christmas") ? [XMAS_LIVE].concat(ids.filter(id => id !== XMAS_LIVE)) : ids;
};
const ytWarmSite = () => {
  YT_WARM_EVENTS.forEach(type => window.removeEventListener(type, ytWarmSite));
  ytSiteIds().forEach((id, i) => setTimeout(() => ytWarm(id), i * YT_WARM_GAP));
};
YT_WARM_EVENTS.forEach(type => window.addEventListener(type, ytWarmSite, { passive: true }));
