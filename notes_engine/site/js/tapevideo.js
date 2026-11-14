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

// The pill, in the deck's badges (in place of CrO₂ while it shows); a key of the deck (data-key)
const videoPill = document.createElement("button");
videoPill.type = "button";
videoPill.className = "vpill";
videoPill.dataset.key = "video";
videoPill.title = "Watch the video";
videoPill.setAttribute("aria-label", videoPill.title);
videoPill.innerHTML = '<i class="lamp"></i><svg viewBox="0 0 20 16" aria-hidden="true"><rect x="2" y="3.5" width="16" height="11" rx="2"/><path d="M7 1l3 2.5 3-2.5"/></svg>VIDEO';
tapeDeck.querySelector(".badges").append(videoPill);
const paintVideoPill = () => tapeDeck.classList.toggle("hasvideo", !!tapeVideoId(tapeNow()));
tapeDeck.addEventListener("tapechange", paintVideoPill);
paintVideoPill();
