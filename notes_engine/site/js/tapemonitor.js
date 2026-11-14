// ── Video monitor of the cassette deck ──
// What the day's cassette deck becomes to show a tape's video (tapevideo.js decides when, and puts
// the video on it): a monitor of the same aluminium, its plate (the tape playing, the counter),
// a 16:9 tube, and the deck's keys under it (copies made by tapeKeyButton, which do the same
// thing), plus three of its own: CRT (an old tube's look, remembered), full screen, and ⏏ back to
// the cassette. It fills the free margin on the left of the notes, so that it never covers them.
// The look is tapemonitor.css, its growing out of the deck and its tube coming on tapemonitorfx.css.
TAPE_KEYS.push(
  ["crt", "CRT", "Cathode ray look"],
  ["full", '<svg viewBox="0 0 24 16" aria-hidden="true"><path d="M5 6.5V3h4M15 3h4v3.5M19 9.5V13h-4M9 13H5V9.5"/></svg>', "Full screen"],
  ["eject", "⏏︎", "Back to the cassette"],
);
const tapeMonitor = document.createElement("div");
tapeMonitor.className = "monitor";
tapeMonitor.innerHTML = '<p class="mplate"><i class="rec"></i>VIDEO MONITOR <b>TD-82</b><span class="now"></span><span class="counter">0:00</span></p>' +
  '<div class="tube"><i class="noise"></i><span class="tubemsg"></span><i class="crt"></i><i class="glare"></i><i class="beam"></i></div>' +
  '<div class="mkeys">' + ["restart", "rew", "play", "ff"].map(tapeKeyButton).join("") + '<i class="gap"></i>' +
  ["band", "crt", "full", "eject"].map(tapeKeyButton).join("") + "</div>";
tapeDeck.append(tapeMonitor);
const monitorTube = tapeMonitor.querySelector(".tube");

// The plate names the tape playing
const paintMonitor = () => {
  const tape = tapeNow();
  tapeMonitor.querySelector(".now").textContent = `${tape.icon} ${tape.name}`;
};
tapeDeck.addEventListener("tapechange", paintMonitor);
paintMonitor();

// Its size: the free margin on the left of the notes (from the deck's left edge to a gap before the
// cards), at least MONITOR_MIN rem wide, and no taller than the window (MONITOR_CHROME: its height
// besides the tube, in rem). Then the station rack's place on its tube (--osd-*: at most 18 × 15
// rem, in the tube's bottom left corner). Whatever lies on the tube is told by a monitormove event.
const MONITOR_MIN = 15, MONITOR_CHROME = 4.4;
const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
const fitMonitor = () => {
  const notes = document.querySelector(".wrap"), left = tapeDeck.getBoundingClientRect().left;
  const room = notes.getBoundingClientRect().left + parseFloat(getComputedStyle(notes).paddingLeft) - left - 1.2 * rem();
  const tall = (innerHeight - 2 * left - MONITOR_CHROME * rem()) * 16 / 9 + .8 * rem();
  tapeDeck.style.setProperty("--mon-w", `${Math.max(MONITOR_MIN * rem(), Math.min(room, tall))}px`);
};
const placeOnTube = () => {
  const deck = tapeDeck.getBoundingClientRect(), tube = monitorTube.getBoundingClientRect(), gap = .5 * rem();
  const set = (name, px) => tapeDeck.style.setProperty(name, `${px}px`);
  set("--osd-l", tube.left - deck.left + gap);
  set("--osd-b", deck.bottom - tube.bottom + gap);
  set("--osd-w", Math.min(tube.width - 2 * gap, 18 * rem()));
  set("--osd-h", Math.min(tube.height - 2 * gap, 15 * rem()));
  tapeDeck.dispatchEvent(new Event("monitormove"));
};
addEventListener("resize", () => {
  if (!tapeDeck.classList.contains("tv")) return;
  fitMonitor();
  placeOnTube();
});

// Out and back in. The monitor grows out of the deck (mon-grow, from the deck's size: --mon-sx and
// --mon-sy, measured on a monitor laid out unseen first), then `ready` runs (tapevideo.js puts the
// video on); back in, it shrinks into the deck (mon-shrink), then .untv goes. Reduced motion, or
// hideMonitor(true): at once. The station rack is put away, its place changing.
const monitorStill = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
let monitorReady = null;
const monitorGrown = () => {
  placeOnTube();
  const ready = monitorReady;
  monitorReady = null;
  if (ready) ready();
};
const showMonitor = ready => {
  closeRack(true);
  fitMonitor();
  tapeDeck.classList.add("measure");
  const deck = tapeDeck.querySelector(".deck").getBoundingClientRect(), mon = tapeMonitor.getBoundingClientRect();
  tapeDeck.classList.remove("measure", "untv");
  tapeDeck.style.setProperty("--mon-sx", deck.width / mon.width);
  tapeDeck.style.setProperty("--mon-sy", deck.height / mon.height);
  monitorReady = ready;
  tapeDeck.classList.add("tv");
  if (monitorStill()) monitorGrown();
};
const hideMonitor = atOnce => {
  if (!tapeDeck.classList.contains("tv")) return;
  closeRack(true);
  setFull(false);
  monitorReady = null;
  tapeDeck.classList.remove("tv");
  if (atOnce !== true && !monitorStill()) tapeDeck.classList.add("untv");
};
tapeMonitor.addEventListener("animationend", e => {
  if (e.target !== tapeMonitor) return;
  if (e.animationName === "mon-grow") monitorGrown();
  if (e.animationName === "mon-shrink") tapeDeck.classList.remove("untv");
});

// The CRT key: an old tube's look on the video, or not; remembered
const setCrt = on => {
  tapeDeck.classList.toggle("crt", on);
  try { localStorage.setItem("tape-crt", on ? "1" : "0"); } catch (e) {}
};
try { tapeDeck.classList.toggle("crt", localStorage.getItem("tape-crt") === "1"); } catch (e) {}
TAPE_ACTIONS.crt = () => setCrt(!tapeDeck.classList.contains("crt"));
