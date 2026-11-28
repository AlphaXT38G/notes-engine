// ── Christmas: the turntable's television (xmusic.js; its look: scrtvxmas.css) ──
// A 1950s television in red lacquer and gold, as the turntable, snow on its top, holly, golden antennas
// (a red bauble, a star). Its medallion is a glass bauble set on the turntable's corner; the turntable
// is whisked away into a whirl of snowflakes and the television comes out of it with a golden
// shimmer; its tube comes on as an old one, a white line then a flash; its keys are baubles hanging
// from a fir garland; its plate a gift tag. Of the records only the Lofi mix has a video.
// The fields: svScreen, scrvideo.js.
svScreen({
  look: "xtv",
  el: xmasDeck,
  track: () => XMAS_TRACKS[carolsAt],
  media: () => (!carols ? null : XMAS_TRACKS[carolsAt].id ? { yt: XMAS_TRACKS[carolsAt].id } : carols),
  playing: () => carolsPlaying,
  play: () => carolsPlay(),
  pause: () => carolsPause(),
  next: () => xmasSleeves[carolsNextAt()].click(),
  parts: () => [xmasDeck, xmasCrate],
  spot: () => svOn(xmasDeck, ".deck", 1, 0, 3, -2),  // on the lid's top right corner
  label: ".label",
  trigger: `<i class="svball">${SV_GLYPH}</i>`,
  cabinet: SV_ANTENNAS + '<div class="svcab"><i class="svcap"></i>' +
    '<svg class="svholly" viewBox="0 0 40 26" aria-hidden="true"><path d="M20,14C14,4 6,8 1,4 4,9 2,12 6,14 3,16 6,20 4,24 10,20 14,22 20,14Z" fill="#1f7a3e"/>' +
    '<path d="M20,14C26,4 34,8 39,4 36,9 38,12 34,14 37,16 34,20 36,24 30,20 26,22 20,14Z" fill="#17643a"/>' +
    '<circle cx="17" cy="15" r="3" fill="#d6203a"/><circle cx="23" cy="15" r="3" fill="#c8102e"/><circle cx="20" cy="11" r="3" fill="#e0263f"/></svg>' +
    '<div class="svtube"></div><span class="svknobs"><b></b><b></b></span><span class="svfeet"><b></b><b></b></span></div>',
  // the whirl: snowflakes around a point of the turntable, each at its angle, distance, size and delay
  effects: '<span class="svswirl">' + svScatter(22, "i", (i, n) => `--a:${(i * 360 / n).toFixed(0)}deg;--d:${svRand(3, 9)}rem;--s:${svRand(.5, 1.1)}rem;--t:${svRand(0, .35)}s`) +
    '</span><b class="svring"></b>',
  brand: "<b>★ XMAS-TV</b>",
  chrome: [1.2, 5],
});
