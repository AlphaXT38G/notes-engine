// ── Halloween: the cocotte's television (hwmusic.js; its look: scrtvhw.css) ──
// A haunted television, purple-black with an orange glow, a cobweb in two corners of its frame, a
// spider hanging from its top, crooked antennas with a bat on them, a green halo around the picture.
// Its medallion is a little jack-o'-lantern whose face is a screen, by the cocotte; the cocotte sinks
// into a cloud of coloured smoke, bats flying out, and the television flickers out of it like a ghost;
// the tube comes on in green snow, a ghost leaping out of it; its keys are tombstones on a mound; its
// plate a scorched parchment. Every track has a video (one is a live).
// The fields: svScreen, scrvideo.js.
const SV_WEB = side => `<svg class="svover svweb ${side}" viewBox="0 0 40 40" fill="none" stroke="rgba(235,225,255,.6)" stroke-width=".6" aria-hidden="true">` +
  '<path d="M0 0L40 12M0 0L28 28M0 0L12 40M0 9Q7 7 9 0M0 17Q14 14 17 0M0 26Q21 21 26 0M0 35Q28 28 35 0"/></svg>';
svScreen({
  look: "htv",
  el: hwMusic,
  track: () => hwTrack(),
  media: () => (hwTrack().id ? (hwYtOn ? { yt: hwTrack().id } : null) : hwAudioEl),
  playing: () => hwPlaying,
  play: () => hwPlay(),
  pause: () => hwPause(),
  next: () => { const flask = hwShelfEl.querySelector("button"); if (flask) flask.click(); },  // the first flask is poured
  parts: () => [hwMusic, hwShelfEl],
  spot: () => svOn(hwMusic, ".pot", 1, 1, -6, -13),  // on the board, by the pot
  label: ".label",
  trigger: `<i class="svpump">${SV_GLYPH}</i>`,
  cabinet: SV_ANTENNAS + '<svg class="svbat" viewBox="0 0 40 16" aria-hidden="true">' +
    '<path d="M20 6c-2-4-4-4-5-2-3-3-8-3-15 2 5-1 7 1 8 4 2-2 4-1 5 1 1-2 3-3 5-1 0 0 1-3 2-4 1 1 2 4 2 4 2-2 4-1 5 1 1-2 3-3 5-1 1-3 3-5 8-4-7-5-12-5-15-2-1-2-3-2-5 2z" fill="#5a3a78"/>' +
    '<circle cx="18" cy="6" r=".9" fill="#ff8a2a"/><circle cx="22" cy="6" r=".9" fill="#ff8a2a"/></svg>' +
    '<div class="svcab"><div class="svtube"></div><span class="svfeet"><b></b><b></b></span></div>',
  over: SV_WEB("l") + SV_WEB("r") + '<i class="svover svspider"><b></b></i>',
  // the smoke (puffs of three colours, each its place, size, rise and delay) and the bats flying out
  effects: svScatter(9, "i", i => `--x:${svRand(0, 9)}rem;--y:${svRand(0, 2.5)}rem;--s:${svRand(3, 6)}rem;--rise:${svRand(-5, -10)}rem;--t:${svRand(0, .4)}s;` +
    `--c:${["166,107,255", "98,208,62", "255,138,42"][i % 3]}`) +
    svScatter(4, "b", () => `--dx:${svRand(5, 14)}rem;--dy:${svRand(-6, -14)}rem;--t:${svRand(.1, .4)}s`),
  brand: "☠ <b>Haunted TV</b>",
  turn: "<b>👻</b>",
  chrome: [1.2, 5],
});
