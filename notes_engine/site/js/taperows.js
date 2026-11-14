// ── The rows of the station rack ──
// What a station and a tape look like on the screen of the cassette deck's station rack
// (taperack.js lays the rows out and handles their clicks; taperows.css dresses them). A row is a
// <button> with its index in a data attribute and in --i (taperackfx.css lights the rows up one
// after the other on it), and its colour in --tc. A new look for a row is a change here and there.

// Text of the track lists, safe in innerHTML; numbers as on the LED: 01, 02...
const RACK_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const rackText = s => String(s).replace(/[&<>"]/g, c => RACK_ESCAPES[c]);
const rackNumber = n => String(n).padStart(2, "0");
const isLiveBand = band => band.tapes.every(t => t.live);

// A station: a signal meter in the colour of its first tape, one bar lit per tape (every bar for a
// live station), its name, its count of tapes on a small LED, and a lamp lit while it plays
const RACK_SIGNAL_BARS = 5;
const signalMeter = band => {
  const lit = isLiveBand(band) ? RACK_SIGNAL_BARS : Math.min(band.tapes.length, RACK_SIGNAL_BARS);
  let bars = "";
  for (let k = 1; k <= RACK_SIGNAL_BARS; k++) bars += k <= lit ? '<i class="lit"></i>' : "<i></i>";
  return `<span class="signal">${bars}</span>`;
};
const stationRow = (band, i) =>
  `<button type="button" class="station" data-band="${i}" style="--i:${i};--tc:${band.tapes[0].color}">` +
  `${signalMeter(band)}<span class="name">${rackText(band.name)}</span>` +
  `<span class="count">${isLiveBand(band) ? "LIVE" : rackNumber(band.tapes.length)}</span><span class="lamp"></span></button>`;
