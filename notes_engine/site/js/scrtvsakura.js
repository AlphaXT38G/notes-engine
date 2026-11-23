// ── Sakura: the shamisen's television (skplayer.js; its look: scrtvsakura.css) ──
// A television of black lacquer with a vermilion and gold edge, a branch of cherry blossom resting on
// its top, petals falling. Its medallion is a hanko seal, 映 (a picture), stamped on the shamisen's
// skin; a gust of petals blows the shamisen away and the television unrolls out of it as a hanging
// scroll; its two shoji doors light up and slide open on the picture; its keys are cherry blossoms
// along a lacquered branch; its plate a strip of washi paper. Drums has no video: no medallion for it.
// The fields: svScreen, scrvideo.js.
const SV_BRANCH = '<svg class="svover svbranch" viewBox="0 0 120 50" aria-hidden="true"><path d="M0 8C30 10 50 18 70 14S100 22 118 30M38 13C42 22 40 30 46 36M78 16C80 8 88 4 94 2" stroke="#4a2a1e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
  [[20, 10], [34, 6], [44, 22], [47, 34], [60, 12], [74, 18], [90, 4], [96, 24], [110, 28], [28, 16], [84, 20], [66, 8]].map(([x, y], i) =>
    `<g transform="translate(${x} ${y}) rotate(${i * 30})">` + [0, 72, 144, 216, 288].map(a => `<ellipse rx="2.6" ry="4" cy="-3.2" transform="rotate(${a})" fill="${i % 3 ? "#ffc2d4" : "#ff9ab8"}"/>`).join("") +
    '<circle r="1.2" fill="#e8a020"/></g>').join("") + "</svg>";
svScreen({
  look: "stv",
  el: skShamisen,
  track: () => SK_TRACKS[skTrackAt],
  media: () => (!skTrack ? null : skTrack.yt ? { yt: skTrack.yt } : skTrack),
  playing: () => skPlaying(),
  play: () => skSelect(skTrackAt, true),
  pause: () => { skTrackPlay(false); skPlayerShow(); },
  next: () => skSelect((skTrackAt + 1) % SK_TRACKS.length, true),
  parts: () => [skShamisen, skFlowers],
  spot: () => svOn(skShamisen, ".skhide", 1, 1, -17, -17),  // on the skin's bottom right
  trigger: '<i class="svhanko">映</i>',
  cabinet: '<div class="svcab"><div class="svtube"></div></div><i class="svroller"></i>',
  over: SV_BRANCH + [8, 30, 55, 72, 90].map((x, i) => `<i class="svover svpetal" style="left:${x}%;animation-delay:${i * .8}s"></i>`).join(""),
  // the gust: petals each from its place, to its distance, turning, at its delay; a pink bloom
  effects: '<b class="svbloom"></b>' + svScatter(26, "i", () => `--x:${svRand(0, 4)}rem;--y:${svRand(0, 8)}rem;--dx:${svRand(6, 16)}rem;--dy:${svRand(-3, -12)}rem;` +
    `--r:${svRand(200, 720)}deg;--s:${svRand(.35, .7)}rem;--t:${svRand(0, .45)}s`),
  brand: '<span class="svseal">桜</span>',
  turn: '<b class="l"></b><b class="r"></b>',
  chrome: [1.4, 2],
});
