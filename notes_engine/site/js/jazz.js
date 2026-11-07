// ── Jazz bar (screens "evening" and "closing", body.night) ──────────────────────────────────
// From 21:30 the page turns into a jazz bar (css/jazz.css): warm light, neon title, smoke and
// floating notes, a turntable playing jazz. At 0:45 the bar closes until 1:00 (the bartender's
// announcement is in closing.js), then the metal show takes over (metal.js).
SCREENS.evening = { className: "night", subtitle: null, transition: "night" };
SCREENS.closing = { className: "night", subtitle: "Last call was a while ago.", transition: "night" };
SCHEDULE.push([21 * 3600 + 30 * 60, 45 * 60, "evening"], [45 * 60, 3600, "closing"]);

// Closing time: wrap each letter of the title in a span (.l, with its index --i) so the CSS can
// turn them off one by one; once the sign is dark the bartender comes to close (closing.js). Any
// other phase puts the title back as plain text.
const title = document.querySelector("h1"), titleText = title.textContent;
document.addEventListener("phase", e => {
  if (e.detail !== "closing") { title.textContent = titleText; return; }
  title.innerHTML = [...titleText].map((c, i) => `<span class="l" style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("");
  title.style.setProperty("--n", titleText.length);
});


// Bar air: 3 smoke clouds drifting across the room and a music note rising every ~0.9 s,
// with a random sway and tilt (--sway, --r); everything is removed when the night ends
const air = document.createElement("div");
air.className = "air";
let noteTimer = null;
const note = () => {
  if (crowded(air, 3 + 25)) return;  // 3 smoke clouds + at most 25 notes (see crowded)
  const n = document.createElement("span");
  n.className = "note";
  n.textContent = "♪♫♩♬"[Math.floor(Math.random() * 4)];
  n.style.cssText = `left:${Math.random() * 100}%;font-size:${1 + Math.random() * 1.4}rem;--o:${.25 + Math.random() * .45};` +
    `--sway:${(Math.random() - .5) * 160}px;--r:${(Math.random() - .5) * 50}deg;animation-duration:${9 + Math.random() * 7}s`;
  n.addEventListener("animationend", () => n.remove());
  air.append(n);
};
const setAir = on => {
  clearInterval(noteTimer);
  air.textContent = "";
  air.remove();
  if (!on) return;
  for (let i = 0; i < 3; i++) {
    const s = document.createElement("span");
    s.className = "smoke";
    s.style.cssText = `top:${10 + i * 28}%;left:${-20 + i * 15}%;animation-duration:${50 + i * 17}s;animation-delay:${-i * 13}s`;
    air.append(s);
  }
  document.body.prepend(air);
  for (let i = 0; i < 6; i++) setTimeout(note, i * 300);
  noteTimer = setInterval(note, 900);
};
setAir(document.body.classList.contains("night"));
document.addEventListener("night", e => setAir(e.detail));

// Night music: JAZZ_TRACKS, records on a turntable in the bottom left corner: "Just One More
// Drink" (jazz noir), "Whispers & Jazz" (1940s noir) and two electro swing mixes, one after the
// other, back to the first after the last. The next record waits in its sleeve, leaning behind the
// turntable (as on the Christmas one, xmusic.js): clicking the sleeve puts it on, and the sleeve
// then holds the one after. The record's label takes the colour of its track, the sleeve's cover
// that of the next. The record on is remembered (jazz-track): the next night goes on with it. It
// starts by itself when the night begins. Browsers only allow sound after a user gesture, so if
// the page has not had one yet it autoplays muted and the sound comes on at the first click or key
// press anywhere. The turntable then plays / pauses it. Pausing is remembered: no autoplay on the
// next visits until it is played again. JAZZ_TRACKS are also the cassette deck's Jazz band
// (tapes.js: icon, short, the cover's and the tape's label, name and color).
const JAZZ_TRACKS = [
  { file: "jazz/just-one-more-drink.mp3", icon: "🎷", short: "Jazz", name: "Just One More Drink", color: "#9a4a1c" },
  { file: "jazz/whispers-and-jazz.mp3", icon: "🕯️", short: "Noir", name: "Whispers & Jazz", color: "#5c3a2e" },
  { file: "jazz/bunny-chic-swing-time.mp3", icon: "🐰", short: "Swing", name: "Bunny Chic Swing Time", color: "#c2417a" },
  { file: "jazz/electro-swing-queen.mp3", icon: "🎤", short: "Queen", name: "Electro Swing Queen", color: "#8a6a12" },
];
let jazzAt = (() => { try { return (+localStorage.getItem("jazz-track") || 0) % JAZZ_TRACKS.length; } catch (e) { return 0; } })();
let jazz = null, playing = false, jazzSoundAt = 0, jazzSwapEnd = null;
const jazzNextAt = () => (jazzAt + 1) % JAZZ_TRACKS.length;
const jazzStart = muted => {  // the record jazzAt, playing; at its end the next one
  jazz = screenTrack(JAZZ_TRACKS[jazzAt].file, { loop: false, muted });
  jazz.addEventListener("ended", () => jazzPut(jazzNextAt(), jazz.muted));
};
const jazzPut = (i, muted) => {  // record i on the turntable, playing
  dropTrack(jazz);
  jazzAt = i;
  try { localStorage.setItem("jazz-track", i); } catch (e) {}
  jazzStart(muted);
  paintVinyl();
};
const vinyl = document.createElement("button");
vinyl.id = "vinyl";
vinyl.type = "button";
vinyl.innerHTML = '<span class="deck"><span class="disc"></span><span class="arm"></span></span><span class="label"></span>';
const jazzSleeve = document.createElement("button");
jazzSleeve.id = "jsleeve";
jazzSleeve.type = "button";
jazzSleeve.innerHTML = '<span class="rec"></span><span class="cover"><i></i><b></b></span>';
const jazzOff = () => { try { return localStorage.getItem("jazz") === "off"; } catch (e) { return false; } };
const jazzMuted = () => !!jazz && jazz.muted;
const paintVinyl = () => {
  const now = JAZZ_TRACKS[jazzAt], next = JAZZ_TRACKS[jazzNextAt()];
  vinyl.classList.toggle("playing", playing);
  vinyl.style.setProperty("--rec", now.color);
  vinyl.querySelector(".label").textContent = !playing ? "♪ Click to play some jazz"
    : jazzMuted() ? "🔇 Click anywhere for sound" : `♪ ${now.name} — click to pause`;
  vinyl.title = !playing ? "Play the music" : jazzMuted() ? "Turn the sound on" : "Pause the music";
  jazzSleeve.style.setProperty("--rec", next.color);
  jazzSleeve.querySelector("i").textContent = next.icon;
  jazzSleeve.querySelector("b").textContent = next.short;
  jazzSleeve.title = `Put on ${next.name}`;
  jazzSleeve.setAttribute("aria-label", jazzSleeve.title);
};
const play = (muted = false) => {
  if (!jazz) jazzStart(muted);  // first time: muted when there was no gesture yet
  else jazz.play().catch(() => {});
  playing = true;
  try { localStorage.removeItem("jazz"); } catch (e) {}
  paintVinyl();
};
const pause = () => {
  if (jazz) jazz.pause();
  playing = false;
  try { localStorage.setItem("jazz", "off"); } catch (e) {}
  paintVinyl();
};
const jazzSound = () => {  // unmute a jazz that autoplayed muted
  if (!jazzMuted()) return;
  jazz.muted = false;
  jazzSoundAt = performance.now();
  paintVinyl();
};
musicButtons.push(vinyl);  // the space bar too (screens.js)
vinyl.addEventListener("click", e => {
  e.stopPropagation();
  if (performance.now() - jazzSoundAt < 600) return;  // this same click just turned the sound on
  if (jazzMuted()) jazzSound();
  else playing ? pause() : play();
});
jazzSleeve.addEventListener("click", e => {  // the next record goes on (a click: with sound), the sleeve takes the one after
  e.stopPropagation();
  playing = true;
  try { localStorage.removeItem("jazz"); } catch (e) {}
  jazzPut(jazzNextAt(), false);
  // the swap, seen: the record lands on the turntable, the sleeve dips (class removed, reflow, put
  // back); once over, the record may spin again
  for (const el of [vinyl, jazzSleeve]) { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); }
  clearTimeout(jazzSwapEnd);
  jazzSwapEnd = setTimeout(() => { vinyl.classList.remove("swap"); jazzSleeve.classList.remove("swap"); }, 600);
});
const setMusic = on => {
  document.removeEventListener("pointerdown", jazzSound);
  document.removeEventListener("keydown", jazzSound);
  if (!on) { dropTrack(jazz); jazz = null; playing = false; vinyl.remove(); jazzSleeve.remove(); return; }  // the next night starts it again
  document.body.append(jazzSleeve, vinyl);
  if (!jazz && !jazzOff()) {
    const canSound = screenGesture();
    play(!canSound);
    if (!canSound) {
      document.addEventListener("pointerdown", jazzSound, { once: true });
      document.addEventListener("keydown", jazzSound, { once: true });
    }
  }
  paintVinyl();
};
setMusic(document.body.classList.contains("night"));
document.addEventListener("night", e => setMusic(e.detail));
