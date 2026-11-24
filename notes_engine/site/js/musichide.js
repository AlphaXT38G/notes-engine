// ── musichide.js: on phones, a button that tucks the music players and their televisions away ──
// On a phone the screen's music player (the cassette deck, a turntable, the cocotte, the
// shamisen...) and its television take a big part of the window, over the notes and the quiz.
// The button in the bottom right corner (phones only, musichide.css) puts html.mhide: the
// players, their televisions and the YouTube picture fade out, the music plays on (nothing is
// paused or removed: a YouTube <iframe> made again would load again, ad included), and the space
// bar still plays / pauses. Pressed again, they come back. Remembered (localStorage, "mhide").

const mhBtn = document.createElement("button");
mhBtn.id = "mhide";
mhBtn.type = "button";
// A note, and a chevron pointing where the players go (down) or come from (up)
mhBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17V5l10-2v12"/>' +
  '<circle cx="6.5" cy="17" r="2.5"/><circle cx="16.5" cy="15" r="2.5"/></svg>' +
  '<svg class="mhchev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

const mhSet = (hide, save) => {
  root.classList.toggle("mhide", hide);
  mhBtn.setAttribute("aria-pressed", hide ? "true" : "false");
  const label = hide ? "Show the music player" : "Hide the music player";
  mhBtn.setAttribute("aria-label", label);
  mhBtn.title = label;
  if (save) try { localStorage.setItem("mhide", hide ? "1" : "0"); } catch (e) {}
};

let mhSaved = false;
try { mhSaved = localStorage.getItem("mhide") === "1"; } catch (e) {}
mhSet(mhSaved, false);
mhBtn.addEventListener("click", () => mhSet(!root.classList.contains("mhide"), true));
document.body.appendChild(mhBtn);
