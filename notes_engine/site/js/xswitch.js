// ── Turning Christmas on and off (christmas.js) ──
// Last of the Christmas files, since it uses them all: the garland, the scene and the shortcuts
// come and go with body.christmas (the music: xmusic.js).

let treeBuilt = false;  // the tree and the scene are built once, the first time Christmas comes
let garlandResize = null;
const onGarlandResize = () => {
  clearTimeout(garlandResize);
  garlandResize = setTimeout(() => {
    if (garland.w === document.documentElement.clientWidth) return;
    buildGarland();
    // the night lights loop repaints the halos; without it (reduced motion), paint them still
    if (!treeRaf && document.body.dataset.phase === "christmas-night") paintGarlandGlow(null);
  }, 200);
};
const setChristmas = on => {
  removeEventListener("resize", onGarlandResize);
  if (!on) { [garland, scene, treeFront, sleighEl, jarBtn].forEach(el => el.remove()); setTreeLights(false); setJarSwing(false); return; }
  if (!treeBuilt) {
    tree.innerHTML = buildTree();
    scene.innerHTML = MOUNTAINS;
    scene.append(moon, tree, snowman);
    treeBuilt = true;
  }
  buildGarland();
  addEventListener("resize", onGarlandResize);
  document.body.prepend(garland, scene);
  document.body.append(treeFront);
  garland.after(jarBtn);  // over the garland, in the page
  setJarSwing(true);
};
setChristmas(document.body.classList.contains("christmas"));
document.addEventListener("christmas", e => setChristmas(e.detail));
