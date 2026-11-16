// ── Watching a tape's video ──
// A tape with a long video (tapeVideoId: a YouTube tape's own, or the `video` of an audio file, see
// tapebands.js; videoLong) lights a VIDEO pill on the deck. Pressed, the tape plays and the pill blinks while
// the video's player gets ready and goes through its ad (#tapedeck.vloading); then the video monitor
// comes out of the deck (tapemonitor.js), its tube comes on and shows the video. The sound stays
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
// Only for a long video, worth watching: a live, or one of VIDEO_LONG s at least, as its player
// reports it (the players are made ahead by ytall.js; until then, it is checked again every 2 s).
// An audio file's `video` is taken as long.
const VIDEO_LONG = 20 * 60;
const videoLong = tape => {
  if (!tapeVideoId(tape)) return false;
  if (!tape.id) return true;
  const p = YT_PLAYERS[tape.id];
  return !!p && (p.live || p.duration >= VIDEO_LONG);
};
const paintVideoPill = () => tapeDeck.classList.toggle("hasvideo", videoLong(tapeNow()));
tapeDeck.addEventListener("tapechange", paintVideoPill);
setInterval(paintVideoPill, 2000);
paintVideoPill();

// The player of the tape's video, and whether it has a picture to show: ready, past its ad, and its
// time moving while the tape plays (youtube.js tells an ad by a time standing still), or buffering
// (state 3: after a wind, the time stands still too, but no ad plays); paused, the still picture
const videoPlayer = () => {
  const id = tapeVideoId(tapeNow());
  return id ? ytPlayer(id) : null;
};
const videoShowable = p => p.ready && p.music && !p.ad &&
  (!tapePlaying || p.state === 3 || performance.now() - p.movedAt < YT_STILL_MS());
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
// The player shown, laid under the monitor's tube (none: the tube shows its snow). YouTube picks
// the video's quality by the player's size: the player is laid out VIDEO_WIDTH px wide at least (full
// HD from the first second, and in full screen), then scaled down onto the tube. The embed draws
// bars of its own at its top and bottom edges (the title, "more videos"): the player is made
// VIDEO_CROP px taller at each end and cut back, the video, fitted to its width, filling the tube
// exactly and those bars falling outside.
const VIDEO_WIDTH = 1920, VIDEO_CROP = 90;
const putFrame = frame => {
  if (videoFrame && videoFrame !== frame) {
    videoFrame.classList.remove("onscreen");
    videoFrame.style.cssText = "";
  }
  videoFrame = frame;
  tapeMonitor.classList.toggle("showing", !!frame);
  tapeMonitor.classList.toggle("waiting", videoLit && !frame);
  if (!frame) return;
  const tube = tubeBox(), width = Math.max(VIDEO_WIDTH, tube.width), scale = tube.width / width;
  frame.style.cssText = `left:${tube.left}px;top:${tube.top - VIDEO_CROP * scale}px;width:${width}px;` +
    `height:${tube.height / scale + 2 * VIDEO_CROP}px;transform:scale(${scale});transform-origin:0 0;` +
    `clip-path:inset(${VIDEO_CROP}px 0)`;
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
  restMonitor(false);  // the plate and the keys show a moment
  videoTick();
};

// On and off: the tape plays if it did not; off, the monitor goes back into the deck (at once when
// a screen takes the deck)
const openVideo = () => {
  if (!videoLong(tapeNow())) return;
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
// A tape put in while the video shows (the rack, a tape ending: the next of the station, the first
// again after the last) stays on the tube, short video or not, so that a station plays on in full
// screen; only a tape with no video at all goes back to the cassette
tapeDeck.addEventListener("tapechange", () => { if (videoOn && !tapeVideoId(tapeNow())) closeVideo(); });
