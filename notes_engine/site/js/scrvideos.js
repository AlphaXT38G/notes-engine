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
