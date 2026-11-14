// ── The cassette deck's stations ──
// What the day's cassette deck (tapes.js) plays, in bands, its "stations": the lofi mixes (mostly
// YouTube), then the music of the screens (jazz bar, late night, metal show, epic finale,
// Christmas, Halloween, sakura), then the radios live, in one band. A tape is a YouTube video (`id`), an audio
// file of notes-musics (`file`, its path there) or a live stream (`stream`), with its `icon`, its
// `short` name for the cassette's label, its `name` and the `color` of the label; `live` when it
// cannot be wound. A YouTube tape can be watched on the deck's video monitor (tapevideo.js); `video`
// gives another tape a YouTube video to show while it plays (an audio file of a long mix: the
// video's id), or takes it away from a YouTube tape (`video: false`, for a short song). A band has a
// `name` and a `short` name for the deck's counter.
// More music: add tapes or bands here. The screens' track lists are defined by their files
// (jazz.js, xmusic.js, hwmusic.js, skplayer.js), loaded before this one.
const TAPE_BANDS = [
  { name: "Lofi", short: "LOFI", tapes: [
    { id: "_jH2oTNRe7g", icon: "🍂", short: "Autumn", name: "Cozy autumn lofi", color: "#d9622b" },
    { id: "XVFUtEh9zrY", icon: "☀️", short: "Summer", name: "Summer lofi", color: "#e8a92a" },
    { file: "lofi/1-am-study-session.mp3", icon: "📚", short: "1 A.M.", name: "1 A.M. study session", color: "#5a5fc4" },
    { id: "FJs41oeAnHU", icon: "🌃", short: "Tokyo", name: "Tokyo lofi hip hop night", color: "#2a8fa8" },
    { id: "09K79_bD6w0", icon: "📼", short: "Silence", name: "Japanese lofi night", color: "#7a4fb0" },
    { id: "rFZHOHl-L8A", icon: "📻", short: "Radio", name: "Lofi hip hop radio", color: "#c43d6a", live: true },
  ] },
  // the jazz bar's tracks (jazz.js, loaded before)
  { name: "Jazz bar", short: "JAZZ", tapes: JAZZ_TRACKS },
  { name: "Late night", short: "NIGHT", tapes: [
    { file: "night/mystical-forest.mp3", icon: "🌙", short: "Night", name: "Mystical Forest", color: "#2f5d8a" },
  ] },
  { name: "Metal show", short: "METAL", tapes: [
    { file: "metal/master-of-puppets-solo.mp3", icon: "🤘", short: "Metal", name: "Master of Puppets solo", color: "#b3121f" },
  ] },
  { name: "Epic finale", short: "EPIC", tapes: [
    { file: "epic/two-steps-from-hell-mix.mp3", icon: "🔥", short: "Epic", name: "Epic finale", color: "#2a62d4" },
    { file: "epic/dragonborn.mp3", icon: "🐉", short: "Dragon", name: "Dragonborn", color: "#8a5a1c" },
  ] },
  // the Christmas turntable's two records (xmusic.js, loaded before: XMAS_YT)
  { name: "Christmas", short: "XMAS", tapes: [
    { file: "christmas/jingle-bell-rock.mp3", icon: "🔔", short: "Rock", name: "Jingle Bell Rock", color: "#c8102e" },
    { id: XMAS_YT, icon: "🎄", short: "Xmas", name: "Lofi Girl - Christmas 2025", color: "#1f7a3e" },
  ] },
  // the Halloween screens' tracks (hwmusic.js), the label in their tape colour
  { name: "Halloween", short: "SPOOKY", tapes: HW_TRACKS.map(t => Object.assign({}, t, { color: t.tape })) },
  // the sakura screens' tracks (skplayer.js), the label in their flower's colour
  { name: "Sakura", short: "SAKURA", tapes: SK_TRACKS.map(t => Object.assign({}, t, { icon: "🌸" })) },
  // the radios live, together
  { name: "Radio", short: "RADIO", tapes: [
    { stream: "https://stream.sepia.sk:8000/impuls128.mp3", icon: "📡", short: "Impuls", name: "Radio Impuls", color: "#e30613", live: true },
    { stream: "https://hitradio-maroc.ice.infomaniak.ch/hitradio-maroc-128.mp3", icon: "🎧", short: "Hit", name: "Hit Radio Maroc", color: "#c1272d", live: true },
  ] },
];
