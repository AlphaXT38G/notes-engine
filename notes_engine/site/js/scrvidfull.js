// ── Watching a video on a screen's music player: full screen and the window ──
// The picture filling the window (black around it, the plate and keys larger: scrvideo.css), with the
// browser's own full screen when it can (pageFullscreen, tapemonitor.js); the browser leaving it
// (Escape, its own way) brings the television back. The window changing size lays the television out
// again. The F key puts it full screen or back, as on the deck's monitor.
const svFull = (sv, on) => {
  if (on === sv.full) return;
  sv.full = on;
  sv.back.classList.toggle("svfull", on);
  sv.front.classList.toggle("svfull", on);
  pageFullscreen(on);
  if (sv.lit) svPlace(sv);
};
const svShown = () => SV_ALL.find(sv => sv.lit);
// The window's size changing (full screen, a phone's bars, the window resized): laid out again once per
// frame at most, when the browser has settled its new size; the medallions are set again too
let svFrameAsked = 0;
const svRelay = () => {
  if (svFrameAsked) return;
  svFrameAsked = requestAnimationFrame(() => {
    svFrameAsked = 0;
    SV_ALL.forEach(sv => { sv.spotAt = ""; });
    const sv = SV_ALL.find(s => s.out);
    if (!sv) return;
    svFit(sv);
    if (sv.lit) svPlace(sv);
  });
};
addEventListener("resize", svRelay);
["fullscreenchange", "webkitfullscreenchange"].forEach(name => document.addEventListener(name, () => {
  const sv = svShown();
  if (!sv) return;
  if (!fullscreenNow()) svFull(sv, false);
  else svPlace(sv);
  svRelay();
}));
// The F key while a television is on (not while typing, nor with a modifier: Ctrl+F still searches)
document.addEventListener("keydown", e => {
  const sv = svShown();
  if (!sv || (e.key !== "f" && e.key !== "F") || e.repeat || e.ctrlKey || e.altKey || e.metaKey ||
    e.target.matches("input, textarea, select, [contenteditable]")) return;
  e.preventDefault();
  svFull(sv, !sv.full);
  sv.rest(false);
});
