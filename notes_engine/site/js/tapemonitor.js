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
