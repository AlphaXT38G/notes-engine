// ── The snowman's buttons (snowman.js) ──
// His coal buttons are a xylophone (his dances, Jingle Bells), and the fifth plays Megalovania,
// which brings the fight of sansfight.js.

// ── His buttons: a xylophone (G E D C from the top), and the lowest one plays Megalovania, one note
// a click (in chiptune), his eye glowing blue while it lasts. Spammed on to the 22nd note, the real
// song starts (snowman/megalovania.mp3, loaded ahead from the 10th): it plays to its end, unless the
// button is clicked again, which stops it.
const SM_NOTES = [784, 659.3, 587.3, 523.3], SM_BTN_AT = [[178, 240], [181, 268], [179, 297], [184, 392], [187, 436]];
const SM_MEGA = (() => {  // D D D' A G# G F D F G, then the same on C, B and B flat
  const tail = [1174.7, 880, 830.6, 784, 698.5, 587.3, 698.5, 784];
  return [587.3, 523.3, 493.9, 466.2].reduce((all, low) => all.concat([low, low], tail), []);
})();
const SM_MEGA_SONG = 22;  // the click that starts the song
let smMegaI = 0, smMegaAt = 0, smMegaEnd = null, smMegaTrack = null, smMegaSong = false;
const smChip = freq => smTone(freq, 160, { vol: .07, hold: .09, lowpass: 3200 });  // a square wave, short, like an old console
// The Christmas turntable is hushed while the song plays (xmusic.js), then plays on
let smHushed = false;
const smHush = on => {
  if (on && carolsPlaying && !smHushed) {
    smHushed = true;
    if (carols) carols.pause();
  } else if (!on && smHushed) {
    smHushed = false;
    if (!carolsPlaying) return;  // stopped meanwhile
    if (carols) carols.play().catch(() => {});
  }
};
const smMegaStop = () => {  // the song, its fight and the glow end, the count starts again
  if (typeof sfEnd === "function") sfEnd();
  smHush(false);
  dropTrack(smMegaTrack);
  smMegaTrack = null;
  smMegaSong = false;
  smMegaI = 0;
  clearTimeout(smMegaEnd);
  snowman.classList.remove("badtime");
};
const smMegalovania = () => {
  if (smMegaSong) { smSays("…ok.", 1200); return smMegaStop(); }  // clicked during the song: it stops
  const now = Date.now();
  if (now - smMegaAt > 1500) {  // a pause: from the start again
    smMegaI = 0;
    dropTrack(smMegaTrack);
    smMegaTrack = null;
  }
  smMegaAt = now;
  smMegaI++;
  if (smMegaI === 10 && !smMegaTrack) smMegaTrack = preloadTrack("snowman/megalovania.mp3", { loop: false });
  if (smMegaI >= 4) snowman.classList.add("badtime");
  if (smMegaI === 18) smSays("You're gonna have a bad time.", 2600);
  clearTimeout(smMegaEnd);
  if (smMegaI < SM_MEGA_SONG) {
    smChip(SM_MEGA[(smMegaI - 1) % SM_MEGA.length]);
    smMegaEnd = setTimeout(() => snowman.classList.remove("badtime"), 1600);
    return;
  }
  // the song, whole, his eye glowing all along
  smMegaSong = true;
  const track = smMegaTrack || (smMegaTrack = preloadTrack("snowman/megalovania.mp3", { loop: false }));
  track.addEventListener("ended", () => { if (smMegaTrack === track) smMegaStop(); });
  track.play().catch(() => { if (smMegaTrack === track) smMegaStop(); });
  smHush(true);
  smSays("💀", 1500);
  secretFound("megalovania");
  sfStart();  // and the fight begins (sansfight.js)
};
const SM_JINGLE = "11111110321";  // E E E, E E E, E G C D E
// what he sings on: F F F F F E E E E D D E D G
const SM_ANSWER = [698.5, 698.5, 698.5, 698.5, 698.5, 659.3, 659.3, 659.3, 659.3, 587.3, 587.3, 659.3, 587.3, 784];
let smTune = "", smTuneAt = 0, smDancing = false;
snowman.querySelectorAll(".btn").forEach(btn => {
  const i = +btn.dataset.i;
  btn.addEventListener("pointerdown", e => e.stopPropagation());
  btn.addEventListener("click", e => {
    e.stopPropagation();
    if (i === 4 && smMegaSong) return smMegalovania();  // the song can always be stopped
    if (smBusy && !smDancing) return;
    if (i === 4) {
      smMegalovania();
      smAnimate(btn, [{ transform: "none" }, { transform: "scale(1.3)" }, { transform: "none" }], { duration: 160 });
      return smFloat("note mega", "♪", SM_BTN_AT[4][0] + 14, SM_BTN_AT[4][1] - 10, 1400);
    }
    smNote(SM_NOTES[i]);
    smAnimate(btn, [{ transform: "none" }, { transform: "scale(1.4)" }, { transform: "none" }], { duration: 260, easing: "ease-out" });
    smFloat("note", ["♪", "♫", "♩"][i % 3], SM_BTN_AT[i][0] + 14, SM_BTN_AT[i][1] - 10, 1400);
    const now = Date.now();
    if (now - smTuneAt > 2500) smTune = "";
    smTune = (smTune + i).slice(-20);
    smTuneAt = now;
    if (smTune.endsWith(SM_JINGLE)) { smTune = ""; secretFound("sm-jingle"); smDance(true); }
    else if (smTune.length >= 8 && SM_JINGLE.indexOf(smTune) !== 0 && !smDancing) smDance(false);
  });
});
const smDance = async big => {
  smBusy = smDancing = true;
  const gen = smGen;
  snowman.classList.add("hold");
  smSays(big ? "🎶 Jingle all the way!" : "♪ La la la!", big ? 4200 : 2400);
  const ms = big ? 4200 : 2400, hops = big ? 8 : 5;
  const sway = [];
  for (let i = 0; i <= hops * 2; i++) sway.push({ transform: i % 2 ? `translateY(-9px) rotate(${i % 4 === 1 ? -5 : 5}deg)` : "none" });
  smAnimate(smSvg, sway, { duration: ms, easing: "ease-in-out" });
  smAnimate(smArm, [{ transform: "rotate(0)" }, { transform: "rotate(-35deg)" }, { transform: "rotate(10deg)" }, { transform: "rotate(-35deg)" }, { transform: "rotate(10deg)" }, { transform: "rotate(0)" }], { duration: ms, iterations: 1 });
  smAnimate(smHat, [{ transform: "none" }, { transform: "translateY(-10px) rotate(-6deg)" }, { transform: "none" }, { transform: "translateY(-10px) rotate(6deg)" }, { transform: "none" }], { duration: ms / 2, iterations: 2 });
  if (big) {  // he sings the next line, his buttons lighting up
    for (let i = 0; i < SM_ANSWER.length; i++) {
      await smWait(i === 7 || i === 11 ? 420 : 260);
      if (gen !== smGen) return;
      smNote(SM_ANSWER[i]);
      smFloat("note", "♪", 200 + Math.random() * 40, 120 + Math.random() * 30, 1400);
    }
    await smWait(500);
  } else {
    for (let i = 0; i < 5; i++) { await smWait(ms / 5); smFloat("note", "♫", 190 + Math.random() * 50, 110 + Math.random() * 40, 1400); }
  }
  if (gen !== smGen) return;
  snowman.classList.remove("hold");
  smBusy = smDancing = false;
};
