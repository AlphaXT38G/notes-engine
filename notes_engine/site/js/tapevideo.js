// ── Watching a tape's video ──
// A tape with a video (tapeVideoId: a YouTube tape's own, or the `video` of an audio file, see
// tapebands.js) lights a VIDEO pill on the deck. Pressed, the tape plays and the pill blinks while
// the video's player gets ready and goes through its ad (#tapedeck.vloading); then the deck grows
// into the video monitor (tapemonitor.js), its tube comes on and shows the video. The sound stays
// the tape's: a YouTube tape's player is shown as it plays; an audio file's video is a player of its
// own, muted, following the tape's time. YouTube's <iframe>s never move (they would load again, ad
// included, youtube.js): the one shown is laid exactly under the monitor's tube (.ytplayer.onscreen).
// An ad breaking into the video, or a tape whose video is not ready, shows snow on the tube.
const tapeVideoId = tape => (tape.video === false ? "" : tape.video || tape.id || "");
const TAPE_VIDEO = {};  // the owner of an audio file's video player (youtube.js)
let videoOn = false, videoTicker = null, videoFrame = null, videoLit = false, videoFollowed = "";

// The pill, in the deck's badges (in place of AUTO REVERSE while it shows); a key of the deck (data-key)
const videoPill = document.createElement("button");
videoPill.type = "button";
videoPill.className = "vpill";
videoPill.dataset.key = "video";
videoPill.title = "Watch the video";
videoPill.setAttribute("aria-label", videoPill.title);
videoPill.innerHTML = '<i class="lamp"></i><svg viewBox="0 0 20 16" aria-hidden="true"><rect x="2" y="3.5" width="16" height="11" rx="2"/><path d="M7 1l3 2.5 3-2.5"/></svg>VIDEO';
const videoBadges = tapeDeck.querySelector(".badges");
videoBadges.insertBefore(videoPill, videoBadges.lastChild);
const paintVideoPill = () => tapeDeck.classList.toggle("hasvideo", !!tapeVideoId(tapeNow()));
tapeDeck.addEventListener("tapechange", paintVideoPill);
paintVideoPill();

// The player of the tape's video, and whether it has a picture to show: ready, past its ad, and its
// time moving while the tape plays (youtube.js tells an ad by a time standing still). Paused, the
// embed draws its own panels over the video (more videos, its title): the tube says PAUSE instead.
const videoPlayer = () => {
  const id = tapeVideoId(tapeNow());
  return id ? ytPlayer(id) : null;
};
const videoShowable = p => p.ready && p.music && !p.ad && tapePlaying && performance.now() - p.movedAt < YT_STILL_MS();
// An audio file's video plays and pauses with the tape, muted, and goes back to its time when it
// drifts away from it; the one followed before is paused
const followTape = () => {
  const tape = tapeNow(), id = videoOn && !tape.id ? tapeVideoId(tape) : "";
  if (videoFollowed && videoFollowed !== id) ytPause(videoFollowed, TAPE_VIDEO);
  videoFollowed = id;
  if (!id) return;
  const p = ytPlayer(id);
  if (!tapePlaying) { ytPause(id, TAPE_VIDEO); return; }
  if (p.owner !== TAPE_VIDEO || p.want !== "play") ytPlay(id, TAPE_VIDEO, false);
  if (p.ready && p.music && Math.abs(p.time - tapeTime) > 1.5) ytSeek(id, TAPE_VIDEO, tapeTime);
};
// The player shown, laid under the monitor's tube (none: the tube shows its snow). The embed draws
// bars of its own at its top and bottom edges (the title, "more videos"): the player is made
// VIDEO_CROP px taller at each end and cut back to the tube, the video, fitted to its width, filling
// the tube exactly and those bars falling outside.
const VIDEO_CROP = 90;
const putFrame = frame => {
  if (videoFrame && videoFrame !== frame) {
    videoFrame.classList.remove("onscreen");
    videoFrame.style.cssText = "";
  }
  videoFrame = frame;
  tapeMonitor.classList.toggle("showing", !!frame);
  tapeMonitor.classList.toggle("waiting", videoLit && !frame);
  if (!frame) return;
  const tube = tubeBox();
  frame.style.cssText = `left:${tube.left}px;top:${tube.top - VIDEO_CROP}px;width:${tube.width}px;` +
    `height:${tube.height + 2 * VIDEO_CROP}px;clip-path:inset(${VIDEO_CROP}px 0)`;
  frame.classList.add("onscreen");
};
tapeDeck.addEventListener("monitormove", () => { if (videoFrame) putFrame(videoFrame); });

// Four times a second while the video is wanted: before the monitor is out, the deck waits
// (vloading) until there is a picture, then the monitor grows; once its tube is lit, the picture
// shows, or the snow while an ad breaks in or the next tape's video gets ready
const videoTick = () => {
  followTape();
  const p = videoPlayer(), show = !!p && videoShowable(p);
  if (!tapeDeck.classList.contains("tv")) {
    tapeDeck.classList.toggle("vloading", !show);
    if (show) showMonitor(lightTube);
    return;
  }
  if (videoLit) putFrame(show ? p.frame : null);
};
// The tube comes on (a bright line and a flash, tapemonitorfx.css), then the picture
const lightTube = () => {
  videoLit = true;
  tapeMonitor.classList.add("lit");
  videoTick();
};

// On and off: the tape plays if it did not; off, the monitor goes back into the deck (at once when
// a screen takes the deck)
const openVideo = () => {
  if (!tapeVideoId(tapeNow())) return;
  videoOn = true;
  if (!tapePlaying) tapePlay();
  tapeDeck.classList.add("vloading");
  clearInterval(videoTicker);
  videoTicker = setInterval(videoTick, 250);
  videoTick();
};
const closeVideo = atOnce => {
  videoOn = false;
  videoLit = false;
  clearInterval(videoTicker);
  followTape();
  putFrame(null);
  tapeMonitor.classList.remove("lit", "waiting");
  tapeDeck.classList.remove("vloading");
  hideMonitor(atOnce);
};
TAPE_ACTIONS.video = () => (videoOn ? closeVideo() : openVideo());
TAPE_ACTIONS.eject = closeVideo;
document.addEventListener("phase", () => closeVideo(true));
// A tape without a video put in while it shows (the rack, a tape ending): back to the cassette
tapeDeck.addEventListener("tapechange", () => { if (videoOn && !tapeVideoId(tapeNow())) closeVideo(); });
