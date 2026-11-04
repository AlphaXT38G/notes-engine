// ── Sakura: what else can be clicked in the scene ───────────────────────────────────────────────
//   - the great tree's crown: its branches shake (css: .sktree.shake), a gust takes a handful of
//     petals off where it was clicked, with the rustle of the blossoms; shaken six times within
//     eight seconds, it lets go of a storm of petals blown at us, covering the window (skPetalStorm);
//   - the sheet of paper by the samurai: the wind takes it, it tumbles away over the valley, and
//     comes back fluttering a while later to land where it was;
//   - the pink moon, at night: the calm night (what the peace code does, as the firefly jars of
//     Christmas and Halloween).
// Each one is tested on its painted part only (skOpaqueAt), where no card covers it (skHit).
const skTreeImg = () => skBack.querySelector(".sktree");
const skPaperImg = () => skBack.querySelector(".skpaper");
skHit({
  title: "A sheet of paper",
  test: (x, y) => { const p = skPaperImg(); return !!p && !p.classList.contains("fly") && skSeenAt(p, x, y); },
  click() {
    const p = skPaperImg();
    p.classList.remove("back");
    p.classList.add("fly");
    skGust(1);
    skNoise(.6, 2600, "bandpass", .25, 0, .7, 1.2);
    clearTimeout(p.flight);
    p.flight = setTimeout(() => {
      p.classList.replace("fly", "back");
      p.flight = setTimeout(() => p.classList.remove("back"), 4200);
    }, 9000);
  },
});
// The hits are tested from the last registered: the tree first here, so the moon, then
// the samurai and the petals (later files) are tested before it
skHit({
  title: "The great cherry tree",
  test: (x, y) => skSeenAt(skTreeImg(), x, y),  // not where the knoll, the samurai or the paper hide it
  click(x, y) {
    // the tree and its veins of light (skscene.js) shake together
    skBack.querySelectorAll(".sktree").forEach(tree => {
      tree.classList.remove("shake");
      void tree.offsetWidth;
      tree.classList.add("shake");
      clearTimeout(tree.shakeEnd);
      tree.shakeEnd = setTimeout(() => tree.classList.remove("shake"), 1500);
    });
    skGust(.8);
    skNoise(1.1, 3200, "bandpass", .22, 0, .6, 1.5);
  },
});
