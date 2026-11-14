// ── Video monitor of the cassette deck ──
// What the day's cassette deck becomes to show a tape's video (tapevideo.js decides when, and puts
// the video on it): a 16:9 tube in a thin aluminium bezel, with, over the picture as in full screen,
// a plate (the tape playing, the counter) and a bar of the deck's keys (copies made by
// tapeKeyButton, which do the same thing) plus three of its own: CRT (an old tube's look,
// remembered), full screen, and ⏏ back to the cassette; both go away while the pointer rests. It
// fills the free margin on the left of the notes, so that it never covers them. A cursor drags it
// out of the deck's corner, as the station rack. The look is tapemonitor.css, its moves
// tapemonitorfx.css; it is laid in layers as the rack (.mslide, .mbody) to be dragged out.
TAPE_KEYS.push(
  ["crt", "CRT", "Cathode ray look"],
  ["full", '<svg viewBox="0 0 24 16" aria-hidden="true"><path d="M5 6.5V3h4M15 3h4v3.5M19 9.5V13h-4M9 13H5V9.5"/></svg>', "Full screen"],
  ["eject", "⏏︎", "Back to the cassette"],
);
const tapeMonitor = document.createElement("div");
tapeMonitor.className = "monitor";
tapeMonitor.innerHTML = '<div class="mslide"><div class="mbody">' +
  '<div class="tube"><i class="noise"></i><span class="tubemsg"></span><i class="crt"></i><i class="glare"></i><i class="beam"></i><i class="roll"></i></div>' +
  '<p class="mplate"><i class="rec"></i>VIDEO MONITOR <b>TD-82</b><span class="now"></span><span class="counter">0:00</span></p>' +
  '<div class="mkeys">' + ["restart", "rew", "play", "ff"].map(tapeKeyButton).join("") + '<i class="gap"></i>' +
  ["band", "crt", "full", "eject"].map(tapeKeyButton).join("") + "</div></div></div>";
// its cursor, the station rack's twin (taperack.js), dragged by the monitor's corner
const monitorCursor = rackCursor.cloneNode(true);
monitorCursor.classList.add("mcursor");
tapeDeck.append(tapeMonitor, monitorCursor);
const monitorTube = tapeMonitor.querySelector(".tube");

// The plate names the tape playing
const paintMonitor = () => {
  const tape = tapeNow();
  tapeMonitor.querySelector(".now").textContent = `${tape.icon} ${tape.name}`;
};
tapeDeck.addEventListener("tapechange", paintMonitor);
paintMonitor();

// Its size: the free margin on the left of the notes (from the deck's left edge to a gap before the
// cards), at least MONITOR_MIN rem wide, and no taller than the window (MONITOR_BEZEL: its height
// besides the tube, in rem). Then the station rack's place on its tube (--osd-*: at most 18 × 15
// rem, in the tube's bottom left corner). Whatever lies on the tube is told by a monitormove event.
const MONITOR_MIN = 15, MONITOR_BEZEL = .8;
const monitorRem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
const fitMonitor = () => {
  const notes = document.querySelector(".wrap"), left = tapeDeck.getBoundingClientRect().left;
  const room = notes.getBoundingClientRect().left + parseFloat(getComputedStyle(notes).paddingLeft) - left - 1.2 * monitorRem();
  const tall = (innerHeight - 2 * left - MONITOR_BEZEL * monitorRem()) * 16 / 9 + .8 * monitorRem();
  tapeDeck.style.setProperty("--mon-w", `${Math.max(MONITOR_MIN * monitorRem(), Math.min(room, tall))}px`);
};
// The tube's box in the window, from the layout (not getBoundingClientRect, which would follow the
// monitor's scale while it grows): the monitor is placed in the deck, or in the window in full screen
const tubeBox = () => {
  const full = tapeDeck.classList.contains("full"), deck = tapeDeck.getBoundingClientRect();
  let left = full ? 0 : deck.left, top = full ? 0 : deck.top;
  for (let el = monitorTube; el && el !== tapeDeck; el = el.offsetParent) {
    left += el.offsetLeft;
    top += el.offsetTop;
  }
  const width = monitorTube.offsetWidth, height = monitorTube.offsetHeight;
  return { left, top, width, height, bottom: top + height };
};
const placeOnTube = () => {
  const deck = tapeDeck.getBoundingClientRect(), tube = tubeBox(), gap = .5 * monitorRem();
  const set = (name, px) => tapeDeck.style.setProperty(name, `${px}px`);
  set("--osd-l", tube.left - deck.left + gap);
  set("--osd-b", deck.bottom - tube.bottom + gap);
  set("--osd-w", Math.min(tube.width - 2 * gap, 18 * monitorRem()));
  set("--osd-h", Math.min(tube.height - 2 * gap, 15 * monitorRem()));
  tapeDeck.dispatchEvent(new Event("monitormove"));
};
addEventListener("resize", () => {
  if (!tapeDeck.classList.contains("tv")) return;
  fitMonitor();
  placeOnTube();
});

// Out and back in. A cursor grabs the deck's corner and drags the monitor out of it (mon-pull, from the
// deck's size; --mon-h measured on a monitor laid out unseen first), then `ready` runs (tapevideo.js
// puts the video on); back in, it is pushed into the deck (mon-push), then .untv goes. Reduced
// motion, or hideMonitor(true): at once. The station rack is put away, its place changing. A timer
// stands in for an animation's end that would not come (a tab in the background draws nothing).
const monitorStill = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
let monitorReady = null, monitorTimer = null;
const monitorGrown = () => {
  clearTimeout(monitorTimer);
  if (!tapeDeck.classList.contains("tv")) return;
  placeOnTube();
  const ready = monitorReady;
  monitorReady = null;
  if (ready) ready();
};
const showMonitor = ready => {
  closeRack(true);
  fitMonitor();
  tapeDeck.style.setProperty("--deck-h", `${tapeDeck.querySelector(".deck").offsetHeight}px`);
  tapeDeck.classList.add("measure");
  tapeDeck.style.setProperty("--mon-h", `${tapeMonitor.offsetHeight}px`);
  tapeDeck.classList.remove("measure", "untv");
  monitorReady = ready;
  tapeDeck.classList.add("tv");
  restMonitor(false);
  clearTimeout(monitorTimer);
  if (monitorStill()) monitorGrown();
  else {
    dragCursor(monitorCursor, true);
    monitorTimer = setTimeout(monitorGrown, 1000);
  }
};
const monitorShrunk = () => {
  clearTimeout(monitorTimer);
  tapeDeck.classList.remove("untv");
};
const hideMonitor = atOnce => {
  if (!tapeDeck.classList.contains("tv")) return;
  closeRack(true);
  setFull(false);
  monitorReady = null;
  tapeDeck.classList.remove("tv");
  tapeMonitor.classList.remove("lit");
  dragCursor(monitorCursor, false);
  clearTimeout(monitorTimer);
  if (atOnce === true || monitorStill()) return;
  tapeDeck.classList.add("untv");
  monitorTimer = setTimeout(monitorShrunk, 600);
};
tapeMonitor.addEventListener("animationend", e => {
  if (e.animationName === "mon-pull") monitorGrown();
  if (e.animationName === "mon-push") monitorShrunk();
});

// The CRT key: an old tube's look on the video, or not; remembered
const setCrt = on => {
  tapeDeck.classList.toggle("crt", on);
  try { localStorage.setItem("tape-crt", on ? "1" : "0"); } catch (e) {}
};
try { tapeDeck.classList.toggle("crt", localStorage.getItem("tape-crt") === "1"); } catch (e) {}
TAPE_ACTIONS.crt = () => setCrt(!tapeDeck.classList.contains("crt"));

// Full screen: the monitor fills the window (#tapedeck.full), and the browser goes full screen when
// it can (the prefixed API for older Safari); leaving it (Escape, the browser's own way) or the key
// brings the monitor back
const fullscreenNow = () => document.fullscreenElement || document.webkitFullscreenElement;
const setFull = on => {
  if (on === tapeDeck.classList.contains("full")) return;
  tapeDeck.classList.toggle("full", on);
  const root = document.documentElement;
  root.classList.toggle("tapefull", on);  // no page scroll bar beside the picture
  if (on && !fullscreenNow()) {
    const ask = root.requestFullscreen || root.webkitRequestFullscreen;
    const asked = ask && ask.call(root);
    if (asked && asked.catch) asked.catch(() => {});
  }
  if (!on && fullscreenNow()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  placeOnTube();
};
["fullscreenchange", "webkitfullscreenchange"].forEach(name => document.addEventListener(name, () => {
  if (!fullscreenNow()) setFull(false);
  else placeOnTube();
}));
TAPE_ACTIONS.full = () => setFull(!tapeDeck.classList.contains("full"));
// The plate and the keys go away while the pointer rests or is elsewhere, and come back as it moves
// over the picture, a finger touches it, or the keyboard comes in (.rest; the focus keeps them)
let monitorRest = null;
const restMonitor = rest => {
  clearTimeout(monitorRest);
  tapeMonitor.classList.toggle("rest", rest);
  if (!rest) monitorRest = setTimeout(() => tapeMonitor.classList.add("rest"), 2500);
};
["mousemove", "touchstart", "focusin"].forEach(name => tapeMonitor.addEventListener(name, () => restMonitor(false)));
tapeMonitor.addEventListener("mouseleave", () => restMonitor(true));
