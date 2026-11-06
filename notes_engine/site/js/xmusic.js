// ── Christmas music: the turntable ─────────────────────────────────────────────────────────────
// The music of the Christmas screens (christmas.js), in a file of its own as Halloween's (hwmusic.js).
// It plays on a Christmas turntable in the bottom left corner (red lacquer and gold, snow
// on the lid, holly, a candy-cane tonearm). Two records: "Jingle Bell Rock"
// (christmas/jingle-bell-rock.mp3, looped, red label) or Lofi Girl's Christmas 2025 mix from YouTube
// (played again from the start when it ends; green label; its key stays "radio", the name of the
// live it replaced, so that the choice remembered still holds). The
// other record waits in its sleeve, leaning behind the turntable: clicking the sleeve swaps them
// and plays the new one. The turntable plays / pauses the record on; the choice and the pause
// are remembered. It starts with the screen and keeps playing from day to night. As for the
// jazz, without a user gesture yet it starts muted and the sound comes on at the first click or
// key press.
const XMAS_YT = "7O9jGGm7PlE";
let carolsRock = null, carolsRadio = false;  // the record on: an <audio>, or the YouTube mix (youtube.js)
const CAROLS_YT = {  // the turntable, as the owner of the mix's player: at its end, from the start again
  onEnd: () => { ytSeek(XMAS_YT, CAROLS_YT, 0); ytPlay(XMAS_YT, CAROLS_YT, !carolsMuted); },
};
let carolsPlaying = false, carolsMuted = false, carolsSoundAt = 0;
let carolsRecord = (() => { try { return localStorage.getItem("xmas-record") === "radio" ? "radio" : "rock"; } catch (e) { return "rock"; } })();
const xmasDeck = document.createElement("button");
xmasDeck.id = "xmusic";
xmasDeck.type = "button";
xmasDeck.innerHTML = '<span class="deck"><span class="lid"></span><span class="disc"></span><span class="arm"></span>' +
  '<svg class="holly" viewBox="0 0 40 26" aria-hidden="true"><path d="M20,14C14,4 6,8 1,4 4,9 2,12 6,14 3,16 6,20 4,24 10,20 14,22 20,14Z" fill="#1f7a3e"/>' +
  '<path d="M20,14C26,4 34,8 39,4 36,9 38,12 34,14 37,16 34,20 36,24 30,20 26,22 20,14Z" fill="#17643a"/>' +
  '<circle cx="17" cy="15" r="3" fill="#d6203a"/><circle cx="23" cy="15" r="3" fill="#c8102e"/><circle cx="20" cy="11" r="3" fill="#e0263f"/></svg></span><span class="label"></span>';
// The sleeve of the other record, behind the turntable: its cover shows what it would put on
const XMAS_RECORDS = { rock: { icon: "🔔", short: "Rock", name: "Jingle Bell Rock" }, radio: { icon: "🎄", short: "Lofi", name: "Lofi Christmas" } };
const xmasSleeve = document.createElement("button");
xmasSleeve.id = "xsleeve";
xmasSleeve.type = "button";
xmasSleeve.innerHTML = '<span class="rec"></span><span class="cover"><i></i><b></b></span>';
const carolsOff = () => { try { return localStorage.getItem("xmas-music") === "off"; } catch (e) { return false; } };
const paintDeck = () => {
  const name = XMAS_RECORDS[carolsRecord].name, other = carolsRecord === "rock" ? "radio" : "rock";
  xmasDeck.classList.toggle("playing", carolsPlaying);
  xmasDeck.classList.toggle("radio", carolsRecord === "radio");
  xmasDeck.querySelector(".label").textContent = !carolsPlaying ? "♪ Click for Christmas songs"
    : carolsMuted ? "🔇 Click anywhere for sound" : `♪ ${name} — click to pause`;
  xmasDeck.title = !carolsPlaying ? "Play the music" : carolsMuted ? "Turn the sound on" : "Pause the music";
  xmasSleeve.classList.toggle("rock", other === "rock");
  xmasSleeve.classList.toggle("radio", other === "radio");
  xmasSleeve.querySelector("i").textContent = XMAS_RECORDS[other].icon;
  xmasSleeve.querySelector("b").textContent = XMAS_RECORDS[other].short;
  xmasSleeve.title = `Put on ${XMAS_RECORDS[other].name}`;
  xmasSleeve.setAttribute("aria-label", xmasSleeve.title);
};
// The mix's player stays in the page once made (paused when the record is off), and is muted
// during YouTube's ads: coming back to it plays on with no new ad (youtube.js)
const carolsStart = muted => {  // puts the chosen record on, playing
  if (carolsRecord === "rock") carolsRock = screenTrack("christmas/jingle-bell-rock.mp3", { muted });
  else { ytPlay(XMAS_YT, CAROLS_YT, !muted); carolsRadio = true; }
  carolsMuted = muted;
};
const carolsStop = () => {  // takes the record off
  dropTrack(carolsRock);
  if (carolsRadio) ytPause(XMAS_YT, CAROLS_YT);
  carolsRock = null;
  carolsRadio = false;
};
const carolsPlay = (muted = false) => {
  if (carolsRock) carolsRock.play().catch(() => {});
  else if (carolsRadio) ytPlay(XMAS_YT, CAROLS_YT, !carolsMuted);
  else carolsStart(muted);
  carolsPlaying = true;
  try { localStorage.removeItem("xmas-music"); } catch (e) {}
  paintDeck();
};
const carolsPause = () => {
  if (carolsRock) carolsRock.pause(); else ytPause(XMAS_YT, CAROLS_YT);
  carolsPlaying = false;
  try { localStorage.setItem("xmas-music", "off"); } catch (e) {}
  paintDeck();
};
const carolsSound = () => {
  if (!carolsMuted) return;
  if (carolsRock) carolsRock.muted = false; else ytSound(XMAS_YT, CAROLS_YT, true);
  carolsMuted = false;
  carolsSoundAt = performance.now();
  paintDeck();
};
musicButtons.push(xmasDeck);  // the space bar too (screens.js)
xmasDeck.addEventListener("click", e => {
  e.stopPropagation();
  if (performance.now() - carolsSoundAt < 600) return;  // this same click just turned the sound on
  if (carolsMuted) carolsSound();
  else if (carolsPlaying) carolsPause();
  else carolsPlay();
});
let xmasSwapEnd = null;
xmasSleeve.addEventListener("click", e => {  // the records swap: the one on goes in the sleeve, the other plays
  e.stopPropagation();
  carolsStop();
  carolsRecord = carolsRecord === "rock" ? "radio" : "rock";
  try { localStorage.setItem("xmas-record", carolsRecord); } catch (e) {}
  carolsPlay();
  // the swap, seen: the record lands on the turntable, the sleeve dips (class removed, reflow, put
  // back); once over, the record may spin again
  for (const el of [xmasDeck, xmasSleeve]) { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); }
  clearTimeout(xmasSwapEnd);
  xmasSwapEnd = setTimeout(() => { xmasDeck.classList.remove("swap"); xmasSleeve.classList.remove("swap"); }, 600);
});
const setCarols = on => {
  document.removeEventListener("pointerdown", carolsSound);
  document.removeEventListener("keydown", carolsSound);
  if (!on) { carolsStop(); carolsPlaying = carolsMuted = false; xmasDeck.remove(); xmasSleeve.remove(); return; }
  document.body.append(xmasSleeve, xmasDeck);
  if (!carolsOff()) {
    const canSound = screenGesture();
    carolsPlay(!canSound);
    if (!canSound) {
      document.addEventListener("pointerdown", carolsSound, { once: true });
      document.addEventListener("keydown", carolsSound, { once: true });
    }
  }
  paintDeck();
};

// The turntable comes and goes with the Christmas screens
setCarols(document.body.classList.contains("christmas"));
document.addEventListener("christmas", e => setCarols(e.detail));
