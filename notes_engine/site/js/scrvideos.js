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

// The jazz bar (jazz.js): a walnut lounge television of the 1950s, brass trim, a speaker grille and
// brass knobs, splayed legs, chrome antennas. Its medallion is a brass knob on the turntable's plinth;
// a red velvet stage curtain closes over the turntable and opens on the television, a spotlight on it;
// the tube warms up as an old one, an amber dot growing, the picture sepia before its colours; its
// keys are a piano's, ivory and ebony; its plate an Art Deco marquee.
svScreen({
  look: "jtv",
  here: () => vinyl.isConnected,
  track: () => JAZZ_TRACKS[jazzAt],
  media: () => (!jazz ? null : JAZZ_TRACKS[jazzAt].id ? { yt: JAZZ_TRACKS[jazzAt].id } : jazz),
  playing: () => playing,
  play: () => play(),
  pause: () => pause(),
  next: () => jazzSleeves[jazzNextAt()].click(),
  label: () => vinyl.querySelector(".label"),
  parts: () => [vinyl, jazzCrate],
  spot: () => { const d = svRect(vinyl.querySelector(".deck")); return d && [d.right - 10, d.bottom - 10]; },
  trigger: `<i class="svknob">${SV_GLYPH}</i>`,
  cabinet: '<div class="svant"><b></b><b></b></div><div class="svcab"><div class="svtube"></div>' +
    '<i class="svgrille"></i><span class="svbadge">Deluxe</span><span class="svknobs"><b></b><b></b></span><span class="svlegs"><b></b><b></b></span></div>',
  effects: '<b class="svlight"></b><b class="svcur l"></b><b class="svcur r"></b><b class="svrod"></b>',
  brand: "<b>Now playing</b>",
  turn: "<b></b>",
  chrome: [1.2, 5.6],
});

// Halloween (hwmusic.js): a haunted television, purple-black with an orange glow, a cobweb in the
// corners of its frame, a spider hanging from its top, crooked antennas with a bat on them, a green
// halo around the picture. Its medallion is a little jack-o'-lantern whose face is a screen, by the
// cocotte; the cocotte sinks into a cloud of coloured smoke, bats flying out, and the television
// flickers out of it like a ghost; the tube comes on in green snow, a ghost leaping out of it; its
// keys are tombstones on a mound; its plate a scorched parchment.
const SV_WEB = side => `<svg class="svover svweb ${side}" viewBox="0 0 40 40" fill="none" stroke="rgba(235,225,255,.6)" stroke-width=".6" aria-hidden="true">` +
  '<path d="M0 0L40 12M0 0L28 28M0 0L12 40M0 9Q7 7 9 0M0 17Q14 14 17 0M0 26Q21 21 26 0M0 35Q28 28 35 0"/></svg>';
svScreen({
  look: "htv",
  here: () => hwMusic.isConnected,
  track: () => hwTrack(),
  media: () => (hwTrack().id ? (hwYtOn ? { yt: hwTrack().id } : null) : hwAudioEl),
  playing: () => hwPlaying,
  play: () => hwPlay(),
  pause: () => hwPause(),
  next: () => { const flask = hwShelfEl.querySelector("button"); if (flask) flask.click(); },
  label: () => hwMusic.querySelector(".label"),
  parts: () => [hwMusic, hwShelfEl],
  spot: () => { const p = svRect(hwMusic.querySelector(".pot")); return p && [p.right - 6, p.bottom - 13]; },
  trigger: `<i class="svpump">${SV_GLYPH}</i>`,
  cabinet: '<div class="svant"><b></b><b></b></div><svg class="svbat" viewBox="0 0 40 16" aria-hidden="true">' +
    '<path d="M20 6c-2-4-4-4-5-2-3-3-8-3-15 2 5-1 7 1 8 4 2-2 4-1 5 1 1-2 3-3 5-1 0 0 1-3 2-4 1 1 2 4 2 4 2-2 4-1 5 1 1-2 3-3 5-1 1-3 3-5 8-4-7-5-12-5-15-2-1-2-3-2-5 2z" fill="#5a3a78"/>' +
    '<circle cx="18" cy="6" r=".9" fill="#ff8a2a"/><circle cx="22" cy="6" r=".9" fill="#ff8a2a"/></svg>' +
    '<div class="svcab"><div class="svtube"></div><span class="svfeet"><b></b><b></b></span></div>',
  over: SV_WEB("l") + SV_WEB("r") + '<i class="svover svspider"><b></b></i>',
  effects: svScatter(9, "i", i => `--x:${svRand(0, 9)}rem;--y:${svRand(0, 2.5)}rem;--s:${svRand(3, 6)}rem;--rise:${svRand(-5, -10)}rem;--t:${svRand(0, .4)}s;` +
    `--c:${["166,107,255", "98,208,62", "255,138,42"][i % 3]}`) +
    svScatter(4, "b", i => `--dx:${svRand(5, 14)}rem;--dy:${svRand(-6, -14)}rem;--t:${svRand(.1, .4)}s`),
  brand: "☠ <b>Haunted TV</b>",
  turn: "<b>👻</b>",
  chrome: [1.2, 5],
});

// Sakura (skplayer.js): a television of black lacquer with a vermilion and gold edge, a branch of
// cherry blossom resting on its top, petals falling. Its medallion is a hanko seal, 映 (a picture),
// stamped on the shamisen's skin; a gust of petals blows the shamisen away and the television unrolls
// out of it as a hanging scroll; its shoji doors light up and slide open on the picture; its keys are
// cherry blossoms along a lacquered branch; its plate a strip of washi paper.
const SV_BRANCH = '<svg class="svover svbranch" viewBox="0 0 120 50" aria-hidden="true"><path d="M0 8C30 10 50 18 70 14S100 22 118 30M38 13C42 22 40 30 46 36M78 16C80 8 88 4 94 2" stroke="#4a2a1e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
  [[20, 10], [34, 6], [44, 22], [47, 34], [60, 12], [74, 18], [90, 4], [96, 24], [110, 28], [28, 16], [84, 20], [66, 8]].map(([x, y], i) =>
    `<g transform="translate(${x} ${y}) rotate(${i * 30})">` + [0, 72, 144, 216, 288].map(a => `<ellipse rx="2.6" ry="4" cy="-3.2" transform="rotate(${a})" fill="${i % 3 ? "#ffc2d4" : "#ff9ab8"}"/>`).join("") +
    '<circle r="1.2" fill="#e8a020"/></g>').join("") + "</svg>";
