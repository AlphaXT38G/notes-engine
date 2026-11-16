// ── Secrets found ──
// Every easter egg of the site is a secret to find: each screen (day and night, the bar's closing),
// the word codes typed, the Konami code, the shortcuts hidden in the scenes, the snowman's games,
// the video monitor... SECRETS lists them all, in groups. A file calls secretFound(id) where its
// secret happens (ui.js declares it as a no-op first, so a failure here never breaks the others);
// the first time, it is remembered in localStorage (on this browser only: the visitor's own count)
// and a "New secret found" note slides in at the top right.
// A plain red tab hangs from the top right corner of every screen: clicked, a strip of
// parchment slides out beside it with the count, then unrolls downwards with the list of the
// secrets found (only those: the others stay secret). The look and the moves are secrets.css.
const secretCodes = words => words.map(w => [`code-${w}`, `Typed “${w}”`]);
const SECRETS = [
  ["Screens", "☾", [
    ["screen-evening", "The jazz bar"], ["screen-closing", "Closing time at the bar"],
    ["screen-metal", "The metal show"], ["screen-epic", "The epic finale"], ["screen-calm", "The calm night"],
    ["screen-christmas", "Christmas day"], ["screen-christmas-night", "Christmas night"],
    ["screen-halloween", "Halloween day"], ["screen-halloween-night", "Halloween night"],
    ["screen-sakura", "Cherry blossoms by day"], ["screen-sakura-night", "Cherry blossoms by night"],
  ]],
  ["Codes", "✎", [["konami", "The Konami code"]].concat(
    secretCodes(["yeti", "boo", "kojiro", "armstrong", "peace", "kamelot", "normal", "candy", "shenron"]))],
  ["Shows", "🔥", [
    ["fire-clicks", "Twenty flames in a minute"], ["more-epic", "Asked for more epicness"],
  ]],
  ["Christmas", "🎄", [
    ["x-sax", "The golden sax in the tree"], ["x-guitar", "The guitar under the tree"], ["x-jar", "The firefly jar under the garland"],
    ["sm-hat", "Knocked the snowman's hat off"], ["sm-nose", "Stole the snowman's carrot nose"],
    ["sm-laugh", "Made the snowman laugh his head off"], ["sm-jingle", "Made the snowman sing Jingle Bells"],
    ["sm-melt", "Melted the snowman"], ["sm-snowball", "Took a snowball in the face"],
    ["megalovania", "Megalovania"],
  ]],
  ["Halloween", "🎃", [
    ["hw-knight", "The knight in the window"], ["hw-sax", "The saxophonist in the window"],
    ["hw-jar", "The firefly jar by the dead tree"], ["hw-gargoyle", "Woke a gargoyle"],
    ["hw-pumpkins", "Lit every pumpkin"], ["hw-web", "Got the spider's web in the face"],
    ["hw-howl", "Heard the werewolf howl"], ["hw-ghost", "Startled a ghost"], ["hw-scream", "The screamer"],
  ]],
  ["Sakura", "🌸", [
    ["sk-sake", "Poured the sake"], ["sk-shred", "Shredded the shamisen"], ["sk-dragon", "Made the dragon roar"],
    ["sk-moon", "The pink moon"], ["sk-provoked", "Provoked the samurai"], ["sk-storm", "The storm of petals"],
  ]],
  ["Cassette deck", "📼", [
    ["video", "Watched a tape's video"], ["crt", "The cathode ray tube"],
  ]],
];
const SECRET_NAMES = {};
SECRETS.forEach(([, , list]) => list.forEach(([id, name]) => { SECRET_NAMES[id] = name; }));
const SECRET_TOTAL = Object.keys(SECRET_NAMES).length;

// What was found, and when: { id: time }. Unknown ids (a secret since removed) are not counted.
let secretsKnown = {};
try { secretsKnown = JSON.parse(localStorage.getItem("secrets") || "{}") || {}; } catch (e) {}
const secretsCount = () => Object.keys(secretsKnown).filter(id => SECRET_NAMES[id]).length;
const secretsScore = () => `${secretsCount()} / ${SECRET_TOTAL}`;
// An element with its text (never innerHTML for what is written: textContent)
const secretsEl = (tag, text, className) => {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
};

// The tab, and the parchment it pulls out: the strip with the count, the sheet with the list
const secretsBox = document.createElement("div");
secretsBox.id = "secrets";
secretsBox.innerHTML = '<button type="button" class="stab" aria-expanded="false" aria-controls="secretsroll" title="Secrets found" aria-label="Secrets found"></button>' +
  '<div class="sroll" id="secretsroll"><p class="sstrip"><span>Secrets found</span><b class="scount"></b></p>' +
  '<div class="ssheet"><div class="slist"></div></div><i class="srod"></i></div>';
const secretsTab = secretsBox.querySelector(".stab"), secretsList = secretsBox.querySelector(".slist");

// The count and the list, group by group in the order of SECRETS (a group with nothing found is
// left out), then the heights the rolled edge goes down by (secrets.css)
const paintSecrets = () => {
  secretsBox.querySelector(".scount").textContent = secretsScore();
  secretsList.textContent = "";
  SECRETS.forEach(([group, icon, list]) => {
    const found = list.filter(([id]) => secretsKnown[id]);
    if (!found.length) return;
    const h = secretsEl("h3", `${icon} ${group}`), ul = secretsEl("ul");
    h.append(secretsEl("small", `${found.length} / ${list.length}`));
    found.forEach(([, name]) => ul.append(secretsEl("li", name)));
    secretsList.append(h, ul);
  });
  if (!secretsList.firstChild) secretsList.append(secretsEl("p", "Nothing yet. Look around…", "snone"));
  secretsBox.style.setProperty("--secrets-strip", `${secretsBox.querySelector(".sstrip").offsetHeight}px`);
  secretsBox.style.setProperty("--secrets-sheet", `${secretsBox.querySelector(".ssheet").offsetHeight}px`);
};

// Out: the strip slides out (.out), then the sheet unrolls below it (.unrolled); back in, the other
// way round. A click elsewhere or Escape puts it back.
let secretsTimer = null;
const setSecrets = open => {
  if (open === secretsBox.classList.contains("out")) return;
  clearTimeout(secretsTimer);
  secretsTab.setAttribute("aria-expanded", open);
  if (open) {
    paintSecrets();
    secretsBox.classList.add("out");
    secretsTimer = setTimeout(() => secretsBox.classList.add("unrolled"), 380);
  } else {
    secretsBox.classList.remove("unrolled");
    secretsTimer = setTimeout(() => secretsBox.classList.remove("out"), 420);
  }
};
secretsTab.addEventListener("click", () => setSecrets(!secretsBox.classList.contains("out")));
secretsBox.addEventListener("click", e => e.stopPropagation());  // a click on it is not elsewhere
document.addEventListener("click", () => setSecrets(false));
document.addEventListener("keydown", e => { if (e.key === "Escape") setSecrets(false); });
document.body.append(secretsBox);

// "New secret found": a note slides in at the top right, below the tab, for a few seconds; several
// found at once come one after the other
const secretsQueue = [];
let secretsNote = null;
const secretsNext = () => {
  if (secretsNote || !secretsQueue.length) return;
  const note = secretsNote = secretsEl("div", "", "secretnote");
  note.setAttribute("role", "status");
  note.append(secretsEl("b", "New secret found"), secretsEl("span", SECRET_NAMES[secretsQueue.shift()]), secretsEl("small", secretsScore()));
  document.body.append(note);
  requestAnimationFrame(() => requestAnimationFrame(() => note.classList.add("in")));  // from its place off screen
  setTimeout(() => note.classList.remove("in"), 3600);
  setTimeout(() => { note.remove(); secretsNote = null; secretsNext(); }, 4100);
};
secretFound = id => {
  if (!SECRET_NAMES[id] || secretsKnown[id]) return;
  secretsKnown[id] = Date.now();
  try { localStorage.setItem("secrets", JSON.stringify(secretsKnown)); } catch (e) {}
  if (secretsBox.classList.contains("out")) paintSecrets();
  secretsQueue.push(id);
  secretsNext();
};

// The screens: found when they come by the clock, a code or a shortcut, not when forced by the
// URL (?screen=, for trying them out). forced and forcedDismissed are screens.js', loaded later.
document.addEventListener("phase", e => {
  const phase = e.detail;
  if (phase && !(phase === forced && !forcedDismissed)) secretFound(`screen-${phase}`);
});
