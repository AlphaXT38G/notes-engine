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
tapeDeck.append(tapeRack);
const rackPart = selector => tapeRack.querySelector(selector);
const rackStations = rackPart(".stations"), rackTracks = rackPart(".tracks");
