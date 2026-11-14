// ── Station rack of the cassette deck ──
// The station key of the day's cassette deck (tapes.js) pulls a rack out of the deck's right side:
// a module of the same aluminium bolted to it, whose small screen lists the stations (TAPE_BANDS,
// tapebands.js). A station shows its tapes, a tape goes into the deck (swapTape: the door opens as
// for any change of tape), ◀ comes back to the stations. The station key, Escape or a click
// elsewhere puts the rack away. The rows are drawn by taperows.js. The look is taperack.css and
// taperows.css, the opening (a cursor drags the rack out, then its screen comes on like an old
// cathode ray tube) and the closing taperackfx.css: this file only sets classes, #tapedeck.racked
// while the rack is out, .unrack while it goes back in, .rack.inband on a station's tapes.
const tapeRack = document.createElement("div");
tapeRack.className = "rack";
tapeRack.innerHTML = '<div class="slide"><div class="chassis" role="dialog" aria-label="Stations">' +
  '<p class="plate"><button type="button" class="back" aria-label="All stations">◀︎</button>' +
  '<span class="title"></span><span class="count"></span><i class="grip"></i></p>' +
  '<div class="screen"><div class="pages"><div class="page stations"></div><div class="page tracks"></div></div>' +
  '<i class="beam"></i><i class="snow"></i></div></div></div>';
// The cursor of the opening, which grabs the deck's corner and drags the rack out (taperackfx.css)
const rackCursor = document.createElement("i");
rackCursor.className = "rackcursor";
rackCursor.setAttribute("aria-hidden", "true");
rackCursor.innerHTML = '<svg viewBox="0 0 16 22"><path d="M1 1v17.5l4.4-4.2 2.9 6.6 3-1.3-2.9-6.5h6.1z"/></svg>';
tapeDeck.append(tapeRack, rackCursor);
const rackPart = selector => tapeRack.querySelector(selector);
const rackStations = rackPart(".stations"), rackTracks = rackPart(".tracks");

// The plate: STATION SELECT and the count of stations, or a station's name and its count of tapes
const paintRackPlate = band => {
  rackPart(".title").innerHTML = band ? rackText(band.name.toUpperCase()) : "STATION SELECT <i>TD-82</i>";
  const n = band ? band.tapes.length : TAPE_BANDS.length;
  rackPart(".count").textContent = `${n} ${band ? "TAPE" : "STATION"}${n > 1 ? "S" : ""}`;
};
// The pages: the stations, or the tapes of the station rackBand (-1 on the stations)
let rackBand = -1;
const showStations = () => {
  rackBand = -1;
  tapeRack.classList.remove("inband");
  paintRackPlate(null);
};
const showStation = i => {
  rackBand = i;
  rackTracks.innerHTML = TAPE_BANDS[i].tapes.map(tapeRow).join("");
  rackTracks.scrollTop = 0;
  tapeRack.classList.add("inband");
  paintRackPlate(TAPE_BANDS[i]);
  markRack();
};
rackStations.addEventListener("click", e => {
  const row = e.target.closest(".station");
  if (row) showStation(+row.dataset.band);
});
// A tape goes into the deck; the one already in plays or pauses
rackTracks.addEventListener("click", e => {
  const row = e.target.closest(".track");
  if (!row) return;
  const i = +row.dataset.tape;
  if (rackBand === tapeBand && i === tapeAt) TAPE_ACTIONS.play();
  else swapTape(rackBand, i);
});
rackPart(".back").addEventListener("click", showStations);

// What plays is lit: the lamp of its station, the level meter of its tape
const markRack = () => {
  rackStations.querySelectorAll(".station").forEach((row, i) => row.classList.toggle("on", i === tapeBand));
  rackTracks.querySelectorAll(".track").forEach((row, i) => row.classList.toggle("on", rackBand === tapeBand && i === tapeAt));
};
tapeDeck.addEventListener("tapechange", markRack);

// Out and back in. The stations are drawn anew each time, so that they light up again on the screen
// coming on. Back in, taperackfx.css switches the screen off and pushes the rack in (rack-push),
// then .unrack goes; with reduced motion, or closeRack(true), it goes at once.
const rackIsOut = () => tapeDeck.classList.contains("racked");
const setRackKey = out => tapeDeck.querySelectorAll(".key.band").forEach(key => key.setAttribute("aria-expanded", String(out)));
const openRack = () => {
  tapeDeck.style.setProperty("--deck-h", `${tapeDeck.querySelector(".deck").offsetHeight}px`);
  rackStations.innerHTML = TAPE_BANDS.map(stationRow).join("");
  showStations();
  markRack();
  tapeDeck.classList.remove("unrack");
  tapeDeck.classList.add("racked");
  setRackKey(true);
};
const closeRack = atOnce => {
  if (rackIsOut()) tapeDeck.classList.add("unrack");
  if (atOnce === true || matchMedia("(prefers-reduced-motion: reduce)").matches) tapeDeck.classList.remove("unrack");
  tapeDeck.classList.remove("racked");
  setRackKey(false);
};
tapeRack.addEventListener("animationend", e => {
  if (e.animationName === "rack-push") tapeDeck.classList.remove("unrack");
});
// The station key pulls the rack out and puts it back (tapes.js's own action, the next station,
// is what it does without this file)
TAPE_KEYS.find(key => key[0] === "band")[2] = "Stations";  // for the copies made from now on
tapeDeck.querySelectorAll(".key.band").forEach(key => {
  key.title = "Stations";
  key.setAttribute("aria-label", key.title);
});
setRackKey(false);
TAPE_ACTIONS.band = () => (rackIsOut() ? closeRack() : openRack());
// Escape or a click elsewhere on the page puts it back too
document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || !rackIsOut()) return;
  closeRack();
  tapeDeck.querySelector(tapeDeck.classList.contains("tv") ? ".monitor .key.band" : ".deck .key.band").focus();
});
document.addEventListener("click", e => { if (!tapeDeck.contains(e.target)) closeRack(); });
// A screen takes the deck away: the rack goes with it at once, and the day brings the deck back with
// the rack put away
document.addEventListener("phase", () => closeRack(true));
