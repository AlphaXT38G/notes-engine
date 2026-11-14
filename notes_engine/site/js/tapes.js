// ── Cassette deck (the day, no screen) ──
// Music for the usual look of the page: an early-80s hi-fi cassette deck in the bottom left corner
// (brushed aluminium, smoked cassette door, two backlit VU meters, a red tape counter and a row of
// piano keys). The music comes in bands, the deck's "stations" (TAPE_BANDS, tapebands.js). A YouTube
// tape plays in a hidden <iframe> driven by postMessage commands, like the Christmas mix (youtube.js,
// muted during ads); an audio file of notes-musics or a live stream plays in an <audio>.
// The keys: ↺ restarts the tape, ◀◀ / ▶▶ wind 30 s back / forward, ▶❚❚ plays or
// pauses, and the station key goes to the next band (its name shows on the counter a moment).
// As the Christmas turntable's sleeve, the next tape of the band waits in its case leaning behind
// the deck: clicking it puts it in too. A change of tape is done as on the real thing: the door
// opens, the tape comes out, the next one goes in, the door closes, it plays. When a tape ends the
// next one goes in the same way.
// Unlike the screens' music, nothing plays by itself: someone reading notes at noon did not ask for
// music. The chosen tape is remembered; a screen (jazz bar, Christmas...) takes the deck away, and
// it comes back stopped with the day.
// The tape in the deck: band and tape in it, remembered as "band:tape"
let [tapeBand, tapeAt] = (() => {
  try {
    const [b, t] = (localStorage.getItem("tape") || "").split(":").map(Number);
    if (TAPE_BANDS[b] && TAPE_BANDS[b].tapes[t]) return [b, t];
  } catch (e) {}
  return [0, 0];
})();
let tapeSrc = null, tapeReady = false, tapePlaying = false, tapeTime = 0, tapeTell = null;
let tapeSwapping = false, tapeTimers = [], tapeFlashUntil = 0;
const tapeNow = () => TAPE_BANDS[tapeBand].tapes[tapeAt];
const tapeNext = () => (tapeAt + 1) % TAPE_BANDS[tapeBand].tapes.length;

// The cassette drawn in CSS: a shell, a coloured label with the tape's name, a window with its two
// reels (spinning while it plays)
const cassette = tape => `<span class="cassette" style="--tc:${tape.color}"><b>${tape.icon} ${tape.short}</b>` +
  '<i class="reels"><i></i><i></i></i></span>';
// The keys, left to right as on the decks of the time (text glyphs, not emoji: ︎). The
// restart key shows a circling arrow, the station key a broadcast mark: an antenna and its waves.
const TAPE_KEYS = [
  ["restart", '<svg viewBox="0 0 24 16" aria-hidden="true"><path d="M8.6 3.4A5.4 5.4 0 1 1 6.7 8.6"/><path class="head" d="M5.2 1.2l5.1 1.3-3.6 3.7z"/></svg>', "Restart the tape"],
  ["rew", "◀︎◀︎", "Rewind 30 s"],
  ["play", "▶︎<small>❚❚</small>", "Play"], ["ff", "▶︎▶︎", "Fast forward 30 s"],
  ["band", '<svg viewBox="0 0 24 16" aria-hidden="true"><circle cx="12" cy="8" r="2.2"/><path d="M8.2 4.2a5.4 5.4 0 0 0 0 7.6M15.8 4.2a5.4 5.4 0 0 1 0 7.6M5.2 1.4a9.6 9.6 0 0 0 0 13.2M18.8 1.4a9.6 9.6 0 0 1 0 13.2"/></svg>', "Next station"],
];
const tapeDeck = document.createElement("div");
tapeDeck.id = "tapedeck";
tapeDeck.innerHTML = '<button type="button" class="case"></button><div class="deck">' +
  '<div class="well"><span class="bay"></span><span class="door"></span></div>' +
  '<div class="panel"><p class="brand">STEREO CASSETTE DECK <i>TD-82</i></p>' +
  '<div class="meters"><span class="vu"><i></i><small>L</small></span><span class="vu"><i></i><small>R</small></span>' +
  '<span class="counter">0:00</span></div>' +
  '<p class="badges"><i class="power"></i>POWER<span>AUTO REVERSE</span><span>CrO₂</span></p></div>' +
  '<div class="keys">' + TAPE_KEYS.map(([k, sym, name]) =>
    `<button type="button" class="key ${k}" title="${name}" aria-label="${name}">${sym}</button>`).join("") +
  '</div></div><span class="label" aria-live="polite"></span>';
const tapeBay = tapeDeck.querySelector(".bay"), tapeCase = tapeDeck.querySelector(".case");
const tapeCounter = tapeDeck.querySelector(".counter");
const tapeKey = k => tapeDeck.querySelector(`.key.${k}`);

// The counter: the tape's time, LIVE for a live, or the band's name a moment after a change
const paintCounter = () => {
  const t = Math.floor(tapeTime);
  tapeCounter.textContent = performance.now() < tapeFlashUntil ? TAPE_BANDS[tapeBand].short
    : tapeNow().live && tapeSrc ? "LIVE" : `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};
const paintTapes = () => {
  const band = TAPE_BANDS[tapeBand], tape = tapeNow(), next = band.tapes[tapeNext()];
  tapeDeck.classList.toggle("playing", tapePlaying);
  tapeDeck.classList.toggle("paused", !tapePlaying && !!tapeSrc);
  tapeDeck.querySelector(".label").textContent = (tapeSwapping ? "⏏ " : tapePlaying ? "♪ " : tapeSrc ? "❚❚ " : "▶ ")
    + `${band.name} · ${tape.name}`;
  const play = tapeKey("play");
  play.title = tapePlaying ? "Pause" : "Play";
  play.setAttribute("aria-label", play.title);
  for (const k of ["restart", "rew", "ff"]) tapeKey(k).disabled = !!tape.live;  // a live has no tape to wind
  // The case behind the deck: the next tape of the band, its label showing (none in a band of one)
  tapeDeck.classList.toggle("single", band.tapes.length < 2);
  tapeCase.innerHTML = cassette(next);
  tapeCase.title = `Put in ${next.name}`;
  tapeCase.setAttribute("aria-label", tapeCase.title);
  paintCounter();
  tapeDeck.dispatchEvent(new Event("tapechange"));  // for what else shows the deck's state (taperack.js)
};
// The label says what plays for a few seconds after a change, then only on hover / focus
const tellTape = () => {
  tapeDeck.classList.add("tell");
  clearTimeout(tapeTell);
  tapeTell = setTimeout(() => tapeDeck.classList.remove("tell"), 4000);
};

// The sources. YouTube: a hidden <iframe> of youtube.js, kept when the tape comes out (it comes
// back where it was, with no new ad) and muted while an ad plays. mp3 and stream: an <audio>,
// never put in the page (screens.js).
const TAPE_YT = {  // the deck, as the owner of a YouTube player: its time and its end
  onTime: t => { tapeTime = t; paintCounter(); },
  onEnd: () => { if (tapePlaying) swapTape(tapeBand, tapeNext()); },
};
const tapeYT = () => tapeSrc && tapeSrc.tagName === "IFRAME";
const tapeStop = () => {  // the tape out of the deck: a YouTube player waits, paused; an <audio> goes
  if (tapeYT()) ytPause(tapeNow().id, TAPE_YT);
  else dropTrack(tapeSrc);
  tapeSrc = null;
  tapeReady = false;
  tapeTime = 0;
};
const tapeStart = () => {
  const tape = tapeNow();
  if (tape.id) {
    const player = ytPlay(tape.id, TAPE_YT, true);
    tapeSrc = player.frame;
    tapeReady = true;  // commands before the player is ready wait in youtube.js
    tapeTime = player.time;
    return;
  }
  const track = tapeSrc = tape.file ? preloadTrack(tape.file, { loop: false }) : new Audio(tape.stream);
  tapeReady = true;
  track.addEventListener("timeupdate", () => { if (tapeSrc === track) { tapeTime = track.currentTime; paintCounter(); } });
  track.addEventListener("ended", () => { if (tapeSrc === track && tapePlaying) swapTape(tapeBand, tapeNext()); });
  track.play().catch(() => {});
};
const tapePlay = () => {
  if (tapeSrc && tapeReady) {
    if (tapeYT()) ytPlay(tapeNow().id, TAPE_YT, true); else tapeSrc.play().catch(() => {});
  } else {
    tapeStop();
    tapeStart();
  }
  tapePlaying = true;
  paintTapes();
};
const tapePause = () => {
  // A live stream is stopped instead (resumed, it would play what it had kept)
  if (tapeYT()) ytPause(tapeNow().id, TAPE_YT);
  else if (tapeNow().stream) tapeStop();
  else tapeSrc.pause();
  tapePlaying = false;
  paintTapes();
};
// Winding: the tape to a time, in seconds (a live has no tape to wind)
const tapeSeek = t => {
  if (!tapeSrc || !tapeReady || tapeNow().live) return;
  tapeTime = Math.max(0, t);
  if (tapeYT()) ytSeek(tapeNow().id, TAPE_YT, tapeTime); else tapeSrc.currentTime = tapeTime;
  paintCounter();
};

// Changing tape, step by step (the moves are CSS transitions, tapes.css): the door opens (.open),
// the tape slides up out of the well (.eject), the new one is put above it without a transition
// (.insert), then slides down into it, the door closes, and it plays. The case behind the deck
// dips meanwhile (.swap). With reduced motion the tape is simply changed.
const tapeLater = (ms, fn) => tapeTimers.push(setTimeout(fn, ms));
const swapTape = (band, i) => {
  if (tapeSwapping) return;
  tapeStop();
  tapePlaying = false;
  if (band !== tapeBand) {  // a new station: its name on the counter for a moment
    tapeFlashUntil = performance.now() + 1800;
    tapeLater(1850, paintCounter);
  }
  tapeBand = band;
  tapeAt = i;
  try { localStorage.setItem("tape", `${band}:${i}`); } catch (e) {}
  const putIn = () => { tapeBay.innerHTML = cassette(tapeNow()); };
  const done = () => { tapeSwapping = false; tapeDeck.classList.remove("swap"); tapePlay(); tellTape(); };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { putIn(); return done(); }
  tapeSwapping = true;
  paintTapes();
  tellTape();
  tapeDeck.classList.add("open", "swap");
  tapeLater(350, () => tapeDeck.classList.add("eject"));
  tapeLater(850, () => {
    putIn();
    tapeDeck.classList.remove("eject");
    tapeDeck.classList.add("insert");
    void tapeBay.offsetWidth;  // the new tape starts above the well, then slides down
    tapeDeck.classList.remove("insert");
  });
  tapeLater(1400, () => tapeDeck.classList.remove("open"));
  tapeLater(1750, done);
};
const TAPE_ACTIONS = {
  restart: () => tapeSeek(0), rew: () => tapeSeek(tapeTime - 30),
  play: () => (tapePlaying ? tapePause() : tapePlay()), ff: () => tapeSeek(tapeTime + 30),
  band: () => swapTape((tapeBand + 1) % TAPE_BANDS.length, 0),
};
musicButtons.push(tapeKey("play"));  // the space bar too (screens.js)
TAPE_KEYS.forEach(([k]) => tapeKey(k).addEventListener("click", () => {
  if (tapeSwapping) return;
  TAPE_ACTIONS[k]();
  tellTape();
}));
tapeCase.addEventListener("click", () => { if (!tapeSwapping) swapTape(tapeBand, tapeNext()); });
const setTapes = on => {
  if (!on) {
    tapeStop();
    tapeTimers.forEach(clearTimeout);
    tapeTimers = [];
    tapePlaying = tapeSwapping = false;
    tapeDeck.classList.remove("open", "eject", "insert", "swap", "tell");
    tapeDeck.remove();
    return;
  }
  if (tapeDeck.isConnected) return;
  tapeBay.innerHTML = cassette(tapeNow());
  document.body.append(tapeDeck);
  paintTapes();
};
// Only during the day: the first screen is set by start.js, after this file, hence the timeout
document.addEventListener("phase", e => setTapes(!e.detail));
setTimeout(() => setTapes(!document.body.dataset.phase));
