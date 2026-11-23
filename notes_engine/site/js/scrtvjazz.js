// ── The jazz bar: the turntable's television (jazz.js; its look: scrtvjazz.css) ──
// A walnut lounge television of the 1950s, brass trim, a speaker grille and brass knobs, splayed legs,
// chrome antennas. Its medallion is a brass knob on the turntable's plinth; a red velvet stage curtain
// closes over the turntable and opens on the television, a spotlight on it; the tube warms up as an
// old one, an amber dot growing, the picture sepia before its colours; its keys are a piano's, ivory
// and ebony; its plate an Art Deco marquee rimmed with bulbs. Every record has a video.
// The fields: svScreen, scrvideo.js.
svScreen({
  look: "jtv",
  el: vinyl,
  track: () => JAZZ_TRACKS[jazzAt],
  media: () => (!jazz ? null : JAZZ_TRACKS[jazzAt].id ? { yt: JAZZ_TRACKS[jazzAt].id } : jazz),
  playing: () => playing,
  play: () => play(),
  pause: () => pause(),
  next: () => jazzSleeves[jazzNextAt()].click(),
  parts: () => [vinyl, jazzCrate],
  spot: () => svOn(vinyl, ".deck", 1, 1, -10, -10),  // in the plinth's bottom right corner
  label: ".label",
  trigger: `<i class="svknob">${SV_GLYPH}</i>`,
  cabinet: SV_ANTENNAS + '<div class="svcab"><div class="svtube"></div>' +
    '<i class="svgrille"></i><span class="svbadge">Deluxe</span><span class="svknobs"><b></b><b></b></span><span class="svlegs"><b></b><b></b></span></div>',
  effects: '<b class="svlight"></b><b class="svcur l"></b><b class="svcur r"></b><b class="svrod"></b>',
  brand: "<b>Now playing</b>",
  turn: "<b></b>",
  chrome: [1.2, 5.6],
});
