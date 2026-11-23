// ── The screens' televisions ──
// The music players of the screens, each given a television of its own look by scrvideo.js (the look
// is drawn in scrtv.css): what each player plays (track: its track, with `id` for a YouTube video or
// `file` and `video` for an audio file and its clip; media: the sound, { yt: id } or the <audio>),
// whether it plays, how to play, pause and change the music, its parts (gone while the television is
// out, which takes their place in the corner), the spot of it where its medallion is set, its label
// (that says "Loading the video…" while the picture is awaited), and the parts of its television:
// the medallion, the cabinet, what hangs over the picture, the turn-on effect, the transformation's
// effects. The epic finale has none (its songs have no video).

// Effects scattered at random once: n elements, each with its own CSS variables
const svScatter = (n, tag, vars) => Array.from({ length: n }, (x, i) => `<${tag} style="${vars(i, n)}"></${tag}>`).join("");
const svRand = (a, b) => (a + Math.random() * (b - a)).toFixed(2);
const svRect = el => (el && el.isConnected ? el.getBoundingClientRect() : null);

// Christmas (xmusic.js): a 1950s television in red lacquer and gold, as the turntable, snow on its top,
// holly, golden antennas (a red bauble, a star). Its medallion is a glass bauble set on the turntable's
// corner; the turntable is whisked away into a whirl of snowflakes and the television comes out of
// it with a golden shimmer; its tube comes on as an old one, a white line then a flash; its keys are
// baubles hanging from a fir garland. Only the Lofi mix has a video.
const SV_XMAS_TRACKS = { rock: { file: "christmas/jingle-bell-rock.mp3", name: "Jingle Bell Rock" }, radio: { id: XMAS_YT, name: "Lofi Christmas" } };
svScreen({
  look: "xtv",
  here: () => xmasDeck.isConnected,
  track: () => SV_XMAS_TRACKS[carolsRecord],
  media: () => (carolsRecord === "radio" ? (carolsRadio ? { yt: XMAS_YT } : null) : carolsRock),
  playing: () => carolsPlaying,
  play: () => carolsPlay(),
  pause: () => carolsPause(),
  next: () => xmasSleeve.click(),
  label: () => xmasDeck.querySelector(".label"),
  parts: () => [xmasDeck, xmasSleeve],
  spot: () => { const d = svRect(xmasDeck.querySelector(".deck")); return d && [d.right + 3, d.top - 2]; },
  trigger: `<i class="svball">${SV_GLYPH}</i>`,
  cabinet: '<div class="svant"><b></b><b></b></div><div class="svcab"><i class="svcap"></i>' +
    '<svg class="svholly" viewBox="0 0 40 26" aria-hidden="true"><path d="M20,14C14,4 6,8 1,4 4,9 2,12 6,14 3,16 6,20 4,24 10,20 14,22 20,14Z" fill="#1f7a3e"/>' +
    '<path d="M20,14C26,4 34,8 39,4 36,9 38,12 34,14 37,16 34,20 36,24 30,20 26,22 20,14Z" fill="#17643a"/>' +
    '<circle cx="17" cy="15" r="3" fill="#d6203a"/><circle cx="23" cy="15" r="3" fill="#c8102e"/><circle cx="20" cy="11" r="3" fill="#e0263f"/></svg>' +
    '<div class="svtube"></div><span class="svknobs"><b></b><b></b></span><span class="svfeet"><b></b><b></b></span></div>',
  effects: '<span class="svswirl">' + svScatter(22, "i", i => `--a:${(i * 360 / 22).toFixed(0)}deg;--d:${svRand(3, 9)}rem;--s:${svRand(.5, 1.1)}rem;--t:${svRand(0, .35)}s`) +
    '</span><b class="svring"></b>',
  brand: "<b>★ XMAS-TV</b>",
  chrome: [1.2, 5],
});
