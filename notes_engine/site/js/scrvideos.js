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
