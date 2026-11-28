// ── Christmas music: the turntable ─────────────────────────────────────────────────────────────
// The music of the Christmas screens (christmas.js), in a file of its own as Halloween's (hwmusic.js).
// It plays on a Christmas turntable in the bottom left corner (red lacquer and gold, snow
// on the lid, holly, a candy-cane tonearm). XMAS_TRACKS, its records, play one after the other,
// back to the first after the last, as the jazz bar's (jazz.js): Christmas songs (files of
// notes-musics' christmas/) and Lofi Girl's Christmas 2025 mix from YouTube (XMAS_YT, through
// musicTrack, youtube.js). Each record has a label colour of its own (disc) and a cover in its
// track's colour (color). The other records wait in their sleeves behind the turntable, fanned out
// like the jazz bar's, the next one in front: a click on a sleeve puts its record on. They are too
// many for one fan, so the fan shows XMAS_FAN of them and scrolls through the others like a crate
// of records: the candy-cane key at its end (or the mouse wheel, or a swipe, over the fan) brings
// the next sleeves forward, the ones in front going round to the back. The record on is remembered
// (xmas-track), the pause too (xmas-music). It starts with the screen and keeps playing from day to
// night. As for the jazz, without a user gesture yet it starts muted and the sound comes on at the
// first click or key press. XMAS_TRACKS are also the cassette deck's Christmas band (tapebands.js).
const XMAS_YT = "7O9jGGm7PlE";
const XMAS_TRACKS = [
  { file: "christmas/jingle-bell-rock.mp3", icon: "🔔", short: "Rock", name: "Jingle Bell Rock", color: "#a8102a", disc: "#ff4d63" },
  { file: "christmas/all-i-want-for-christmas-is-you.m4a", icon: "🎁", short: "Mariah", name: "All I Want for Christmas Is You", color: "#b0124f", disc: "#ff8fc0" },
  { file: "christmas/last-christmas.m4a", icon: "❤️", short: "Wham!", name: "Last Christmas", color: "#7a1f3d", disc: "#ffb3c6" },
  { file: "christmas/rockin-around-the-christmas-tree.mp3", icon: "⭐", short: "Rockin'", name: "Rockin' Around the Christmas Tree", color: "#8a5a08", disc: "#ffd23a" },
  { file: "christmas/snowman.m4a", icon: "⛄", short: "Sia", name: "Snowman", color: "#1d5aa8", disc: "#9fd8ff" },
  { file: "christmas/carol-of-the-bells.mp3", icon: "🕯️", short: "Libera", name: "Carol of the Bells", color: "#3a3f8f", disc: "#c9b8ff" },
  { file: "christmas/shchedryk.mp3", icon: "🐦", short: "Щедрик", name: "Shchedryk", color: "#0f5f7a", disc: "#ffe066" },
  { file: "christmas/merry-logmas.mp3", icon: "🔥", short: "Logmas", name: "Merry Logmas", color: "#7a3b12", disc: "#ff9a3c" },
  { id: XMAS_YT, icon: "🎄", short: "Lofi", name: "Lofi Girl - Christmas 2025", color: "#17643a", disc: "#5fdc8a" },
];
const XMAS_FAN = 5;  // sleeves in sight at once; the others are behind, the fan scrolls to them
let carolsAt = (() => {
  try {
    const at = localStorage.getItem("xmas-track");
    if (at !== null) return (+at || 0) % XMAS_TRACKS.length;
    // the old turntable had two records; "radio" was the Lofi mix
    return localStorage.getItem("xmas-record") === "radio" ? XMAS_TRACKS.length - 1 : 0;
  } catch (e) { return 0; }
})();
let carols = null, carolsPlaying = false, carolsSoundAt = 0, xmasSwapEnd = null, xmasScroll = 0;
const carolsNextAt = () => (carolsAt + 1) % XMAS_TRACKS.length;
const carolsMuted = () => !!carols && carols.muted;
const xmasDeck = document.createElement("button");
xmasDeck.id = "xmusic";
xmasDeck.type = "button";
xmasDeck.innerHTML = '<span class="deck"><span class="lid"></span><span class="disc"></span><span class="arm"></span>' +
  '<svg class="holly" viewBox="0 0 40 26" aria-hidden="true"><path d="M20,14C14,4 6,8 1,4 4,9 2,12 6,14 3,16 6,20 4,24 10,20 14,22 20,14Z" fill="#1f7a3e"/>' +
  '<path d="M20,14C26,4 34,8 39,4 36,9 38,12 34,14 37,16 34,20 36,24 30,20 26,22 20,14Z" fill="#17643a"/>' +
  '<circle cx="17" cy="15" r="3" fill="#d6203a"/><circle cx="23" cy="15" r="3" fill="#c8102e"/><circle cx="20" cy="11" r="3" fill="#e0263f"/></svg></span><span class="label"></span>';
// The sleeves: one per record, made once; the one of the record on is hidden (it is on the
// turntable), the others take their places in the fan (paintDeck)
const xmasCrate = document.createElement("div");
xmasCrate.id = "xsleeves";
const xmasSleeves = XMAS_TRACKS.map((t, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "xsleeve";
  // a Christmas record cover: gold rim, snowflakes, the track's emblem in a bauble, its short name
  b.innerHTML = '<span class="rec"></span><span class="cover"><i class="bauble"></i><b class="title"></b><span class="flakes"></span></span>';
  b.querySelector(".bauble").textContent = t.icon;
  b.querySelector(".title").textContent = t.short;
  b.title = `Put on ${t.name}`;
  b.setAttribute("aria-label", b.title);
  b.style.setProperty("--rec", t.color);
  b.style.setProperty("--disc", t.disc);
  b.addEventListener("click", e => carolsChoose(e, i));
  xmasCrate.append(b);
  return b;
});
// The candy-cane key at the end of the fan: the next sleeves come forward
const xmasMore = document.createElement("button");
xmasMore.type = "button";
xmasMore.className = "xmore";
xmasMore.innerHTML = '<span aria-hidden="true">›</span>';
xmasMore.title = "More records";
xmasMore.setAttribute("aria-label", xmasMore.title);
xmasCrate.append(xmasMore);
const xmasBehind = () => XMAS_TRACKS.length - 1;  // sleeves behind the turntable
const xmasScrollBy = step => {
  const n = xmasBehind();
  if (n <= XMAS_FAN) return;
  xmasScroll = (xmasScroll + step + n) % n;
  paintDeck();
};
xmasMore.addEventListener("click", e => { e.stopPropagation(); xmasScrollBy(1); });
// the wheel over the fan scrolls it (one sleeve per notch, not too fast), a swipe across it too
let xmasWheelAt = 0, xmasTouchX = null;
xmasCrate.addEventListener("wheel", e => {
  const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (!d || xmasBehind() <= XMAS_FAN) return;
  e.preventDefault();
  const now = performance.now();
  if (now - xmasWheelAt < 120) return;
  xmasWheelAt = now;
  xmasScrollBy(d > 0 ? 1 : -1);
}, { passive: false });
xmasCrate.addEventListener("touchstart", e => { xmasTouchX = e.touches[0].clientX; }, { passive: true });
xmasCrate.addEventListener("touchend", e => {
  if (xmasTouchX === null) return;
  const dx = e.changedTouches[0].clientX - xmasTouchX;
  xmasTouchX = null;
  if (Math.abs(dx) > 30) xmasScrollBy(dx < 0 ? 1 : -1);
}, { passive: true });
const carolsOff = () => { try { return localStorage.getItem("xmas-music") === "off"; } catch (e) { return false; } };
const paintDeck = () => {
  const now = XMAS_TRACKS[carolsAt], n = XMAS_TRACKS.length, behind = n - 1;
  xmasDeck.classList.toggle("playing", carolsPlaying);
  xmasDeck.style.setProperty("--disc", now.disc);
  xmasDeck.querySelector(".label").textContent = !carolsPlaying ? "♪ Click for Christmas songs"
    : carolsMuted() ? "🔇 Click anywhere for sound" : `♪ ${now.name} — click to pause`;
  xmasDeck.title = !carolsPlaying ? "Play the music" : carolsMuted() ? "Turn the sound on" : "Pause the music";
  // the fan, like the jazz bar's: k = 0 for the next record, then the ones after it; the scroll
  // moves the window of XMAS_FAN sleeves in sight along them, going round (j: the place in sight,
  // 0 in front on the left). A sleeve out of sight waits just past the last one, faded out.
  const fan = Math.min(XMAS_FAN, behind);
  xmasSleeves.forEach((b, i) => {
    const k = (i - carolsAt - 1 + n) % n, j = (k - xmasScroll + behind) % behind;
    const on = i === carolsAt, seen = !on && j < fan;
    b.classList.toggle("on", on);
    b.classList.toggle("away", !on && !seen);
    b.tabIndex = seen ? 0 : -1;
    const place = seen ? j : fan;
    b.style.setProperty("--x", `${place * 3.05}rem`);
    b.style.setProperty("--y", `${-place * .12}rem`);
    b.style.setProperty("--r", `${-8 + place * 8}deg`);
    b.style.zIndex = seen ? n - j : 0;
  });
  xmasMore.hidden = behind <= XMAS_FAN;
  xmasMore.style.setProperty("--x", `${fan * 3.05 + 1.2}rem`);
};
// The record carolsAt, playing (a file or the video); at its end the next one
const carolsStart = muted => {
  carols = musicTrack(XMAS_TRACKS[carolsAt], { loop: false, muted });
  const me = carols;
  carols.addEventListener("ended", () => { if (carols === me) carolsPut(carolsNextAt(), me.muted); });
};
const carolsStop = () => {  // takes the record off
  dropTrack(carols);
  carols = null;
};
const carolsPut = (i, muted) => {  // record i on the turntable, playing
  carolsStop();
  carolsAt = i;
  xmasScroll = 0;
  try { localStorage.setItem("xmas-track", i); } catch (e) {}
  carolsStart(muted);
  paintDeck();
};
const carolsPlay = (muted = false) => {
  if (!carols) carolsStart(muted);
  else carols.play().catch(() => {});
  carolsPlaying = true;
  try { localStorage.removeItem("xmas-music"); } catch (e) {}
  paintDeck();
};
const carolsPause = () => {
  if (carols) carols.pause();
  carolsPlaying = false;
  try { localStorage.setItem("xmas-music", "off"); } catch (e) {}
  paintDeck();
};
const carolsSound = () => {
  if (!carolsMuted()) return;
  carols.muted = false;
  carolsSoundAt = performance.now();
  paintDeck();
};
musicButtons.push(xmasDeck);  // the space bar too (screens.js)
xmasDeck.addEventListener("click", e => {
  e.stopPropagation();
  if (performance.now() - carolsSoundAt < 600) return;  // this same click just turned the sound on
  if (carolsMuted()) carolsSound();
  else if (carolsPlaying) carolsPause();
  else carolsPlay();
});
const carolsChoose = (e, i) => {  // a sleeve clicked: its record goes on (a click: with sound)
  e.stopPropagation();
  carolsPlaying = true;
  try { localStorage.removeItem("xmas-music"); } catch (e) {}
  carolsPut(i, false);
  // the swap, seen: the record lands on the turntable (class removed, reflow, put back) while the
  // sleeves slide to their new places; once over, the record may spin again
  xmasDeck.classList.remove("swap"); void xmasDeck.offsetWidth; xmasDeck.classList.add("swap");
  clearTimeout(xmasSwapEnd);
  xmasSwapEnd = setTimeout(() => xmasDeck.classList.remove("swap"), 600);
};
const setCarols = on => {
  document.removeEventListener("pointerdown", carolsSound);
  document.removeEventListener("keydown", carolsSound);
  if (!on) { carolsStop(); carolsPlaying = false; xmasDeck.remove(); xmasCrate.remove(); return; }
  document.body.append(xmasCrate, xmasDeck);
  if (!carols && !carolsOff()) {
    const canSound = screenGesture();
    carolsPlay(!canSound);
    if (!canSound) {
      document.addEventListener("pointerdown", carolsSound, { once: true });
      document.addEventListener("keydown", carolsSound, { once: true });
    }
  }
  paintDeck();
};

// The turntable comes and goes with the Christmas screens
setCarols(document.body.classList.contains("christmas"));
document.addEventListener("christmas", e => setCarols(e.detail));
