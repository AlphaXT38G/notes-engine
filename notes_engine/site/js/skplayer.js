// ── Sakura: the music: the shamisen and its flowers ─────────────────────────────────────────────
// The shamisen, the three-stringed lute, leans in the bottom left corner (#skfront): its curved
// head and its three ivory pegs, its rosewood neck, its square body of stretched skin under a
// red brocade cover, its ivory bridge, its braided tail cord and tassel, its big bachi (the
// plectrum). A click on the bachi (or the body) plays and pauses the music; while it plays, the
// bachi strikes on the beat of the track (bpm), the strings tremble, the skin throbs, a petal
// escapes now and then, the tassel swings. A string plucked twangs (Web Audio).
// The tracks are chosen on sakura flowers standing in an arc around the shamisen: one flower per
// track, each of its own colour (green, blue, red, violet, black, gold...), six to an arc, a wider arc for more; the
// flower of the track chosen is open wider, it turns slowly while its track plays. Its name only shows as the
// flower's tooltip. The play / pause (.skplay, hidden) is in musicButtons: the space bar clicks it.
// Nothing plays by itself; the track chosen is remembered (sk-track). The tracks are YouTube
// videos, played through youtube.js (hidden players, muted during their ads, made ahead by
// ytall.js), or audio files of notes-musics (screenTrack, screens.js): add one to SK_TRACKS ({ id } or
// { file }, its name, short: its cassette's label, bpm: its tempo, for the strikes, and color: its
// flower's) to add a flower. They are also the cassette deck's "Sakura" band (tapes.js).
const SK_TRACKS = [
  { id: "tWzZhZU3sOI", name: "Wafū rock: shamisen and heavy bass", short: "Wafū", bpm: 140, color: "#6cd46a" },
  { id: "AK51LblcEOw", name: "Sakura, traditional koto music", short: "Koto", bpm: 72, color: "#5aa8ff" },
  { id: "oxlaAdCY4jA", name: "Cherry blossom zen music", short: "Zen", bpm: 64, color: "#e8323c" },
  { id: "iX-11teX4Wo", name: "Sengoshin, gods of the war drums", short: "Drums", bpm: 120, color: "#a066e0" },
  { id: "S-h8z0zgX_U", name: "Tao, on the path of the samurai", short: "Tao", bpm: 64, color: "#2a2230" },
  { id: "KBgRUHG6pHU", name: "Epic shamisen, heavy Japanese rock", short: "Epic", bpm: 140, color: "#ffd23a" },
];
let skTrackAt = (() => { try { return (+localStorage.getItem("sk-track") || 0) % SK_TRACKS.length; } catch (e) { return 0; } })();
let skTrack = null, skBeat = -1;
const skEsc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// ── The shamisen ──
const skShamisen = document.createElement("div");
skShamisen.className = "skshamisen";
skShamisen.innerHTML = `<svg viewBox="0 0 150 380" role="group" aria-label="Shamisen">
<defs>
<linearGradient id="sk-wood" x2="1"><stop offset="0" stop-color="#1c0a05"/><stop offset=".35" stop-color="#6a3018"/><stop offset=".55" stop-color="#8a4424"/><stop offset="1" stop-color="#220c06"/></linearGradient>
<linearGradient id="sk-lacq" x2="1"><stop offset="0" stop-color="#0e0606"/><stop offset=".5" stop-color="#3a1810"/><stop offset="1" stop-color="#0a0404"/></linearGradient>
<radialGradient id="sk-hide" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#fffbf2"/><stop offset=".7" stop-color="#efe4cc"/><stop offset="1" stop-color="#d6c6a4"/></radialGradient>
<linearGradient id="sk-ivory" x2="1"><stop offset="0" stop-color="#cbbd9a"/><stop offset=".5" stop-color="#fbf4e2"/><stop offset="1" stop-color="#bba98a"/></linearGradient>
<linearGradient id="sk-shell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e2b8"/><stop offset=".4" stop-color="#d8a860"/><stop offset=".6" stop-color="#8a5228"/><stop offset="1" stop-color="#e8c890"/></linearGradient>
<pattern id="sk-brocade" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#a8141e"/><path d="M4,1l1,2h2l-1.6,1.2.6,2-2-1.2-2,1.2.6-2L1,3h2z" fill="#e8b84a" opacity=".85"/></pattern>
</defs>
<g class="skpeg"><rect x="34" y="10" width="34" height="7" rx="3.5" fill="url(#sk-ivory)"/><rect x="40" y="10" width="3" height="7" fill="#3a1810"/></g>
<g class="skpeg"><rect x="82" y="24" width="34" height="7" rx="3.5" fill="url(#sk-ivory)"/><rect x="106" y="24" width="3" height="7" fill="#3a1810"/></g>
<g class="skpeg"><rect x="32" y="38" width="36" height="7" rx="3.5" fill="url(#sk-ivory)"/><rect x="38" y="38" width="3" height="7" fill="#3a1810"/></g>
<path d="M66,0q12,2 13,14l-2,42h-14l-3,-44q0,-11 6,-12z" fill="url(#sk-lacq)"/>
<path d="M67,4q7,2 8,10" stroke="rgba(255,220,180,.35)" stroke-width="1.5" fill="none"/>
<rect x="62" y="54" width="16" height="4" rx="1" fill="url(#sk-ivory)"/>
<rect x="63" y="57" width="14" height="211" rx="2" fill="url(#sk-wood)"/>
<path d="M66,60v204" stroke="rgba(255,210,170,.28)" stroke-width="1.2"/>
<g class="skbody" role="button" tabindex="-1" aria-label="Play or pause">
<path d="M26,262h88q8,0 9,8l2,80q0,8 -8,8h-94q-8,0 -8,-8l2,-80q1,-8 9,-8z" fill="url(#sk-wood)"/>
<path class="skhide" d="M30,267h80q5,0 5,5l1,74q0,5 -5,5h-82q-5,0 -5,-5l1,-74q0,-5 5,-5z" fill="url(#sk-hide)"/>
<path d="M34,272q30,-3 76,2M33,300q38,3 80,-1M34,330q40,-2 78,2" stroke="rgba(160,130,90,.12)" stroke-width="1" fill="none"/>
<path d="M94,267h16q5,0 5,5v22q-14,-4 -21,-27z" fill="url(#sk-brocade)" stroke="#5a0a10" stroke-width=".8"/>
<path d="M58,272q16,-4 30,0q-3,14 -15,16q-12,-2 -15,-16z" fill="rgba(180,150,110,.2)"/>
<rect x="56" y="330" width="28" height="5" rx="1.5" fill="url(#sk-ivory)" stroke="#8a7048" stroke-width=".6"/>
</g>
<g class="skstrings">
<line class="wire" x1="66" y1="57" x2="62" y2="356" stroke="#f8f0de" stroke-width="1.1"/>
<line class="wire" x1="70" y1="57" x2="70" y2="356" stroke="#f8f0de" stroke-width=".9"/>
<line class="wire" x1="74" y1="57" x2="78" y2="356" stroke="#f8f0de" stroke-width=".7"/>
<g data-string="0" role="button" tabindex="0" aria-label="String"><line x1="66" y1="57" x2="62" y2="330" stroke="transparent" stroke-width="7"/></g>
<g data-string="1" role="button" tabindex="0" aria-label="String"><line x1="70" y1="57" x2="70" y2="330" stroke="transparent" stroke-width="7"/></g>
<g data-string="2" role="button" tabindex="0" aria-label="String"><line x1="74" y1="57" x2="78" y2="330" stroke="transparent" stroke-width="7"/></g>
</g>
<path d="M62,356q8,6 16,0" stroke="#3a1810" stroke-width="3" fill="none"/>
<g class="sktassel"><path d="M70,358q-2,8 2,14" stroke="#c4302b" stroke-width="2.5" fill="none"/>
<path d="M66,370h12l2,4h-16z" fill="#e8b84a"/><path d="M65,374q7,14 14,0" fill="#c4302b"/><path d="M67,375v10M70,376v12M73,376v12M76,375v10" stroke="#a8141e" stroke-width="1"/></g>
<g class="skbachi" role="button" tabindex="0" aria-label="Bachi: play or pause">
<path d="M76,318l22,32" stroke="#2a120a" stroke-width="7" stroke-linecap="round"/>
<path d="M78,320l18,26" stroke="rgba(255,220,180,.35)" stroke-width="1.5" stroke-linecap="round"/>
<path d="M54,298q17,-10 36,-3l-11,22q-3,3 -6,0z" fill="url(#sk-shell)" stroke="#5a3418" stroke-width=".8"/>
<path d="M57,297q15,-7 31,-2" stroke="rgba(255,250,230,.7)" stroke-width="1.2" fill="none"/>
</g>
</svg><i class="skpuffs" aria-hidden="true"></i>`;
const skPlayBtn = document.createElement("button");
skPlayBtn.type = "button";
skPlayBtn.className = "skplay";
musicButtons.push(skPlayBtn);
skShamisen.append(skPlayBtn);

// ── The flowers, in an arc around the shamisen ──
// One flower per track, on arcs around the shamisen's body (to the right of its neck): from the
// bottom up, one after the other at an even spacing; an arc full, the next flowers start a wider one
const skFlowers = document.createElement("div");
skFlowers.className = "skflowers";
skFlowers.setAttribute("role", "group");
skFlowers.setAttribute("aria-label", "Music");
const skFlower = color => `<svg viewBox="-12 -12 24 24" aria-hidden="true"><g fill="${color}" stroke="rgba(120,20,50,.55)" stroke-width=".5">` +
  [0, 72, 144, 216, 288].map(a => `<path transform="rotate(${a})" d="M0,0C-4,-2 -4.5,-8 -1.3,-10.2L0,-8.8L1.3,-10.2C4.5,-8 4,-2 0,0Z"/>`).join("") +
  `</g><circle r="2.2" fill="#f6c64a"/>${[0, 72, 144, 216, 288].map(a => `<circle r=".7" cx="${(Math.sin(a * Math.PI / 180) * 3.6).toFixed(2)}" cy="${(-Math.cos(a * Math.PI / 180) * 3.6).toFixed(2)}" fill="#c8402a"/>`).join("")}</svg>`;
const skFlowersPlace = () => {
  if (innerHeight < 500) {
    // a phone held sideways: no room for an arc, the flowers in a row along the bottom, beside the
    // shamisen (smaller there: css/sakura.css)
    skFlowers.querySelectorAll(".skflower").forEach((b, i) => { b.style.left = `${(4.2 + i * 2.6).toFixed(2)}rem`; b.style.bottom = ".3rem"; });
    return;
  }
  const small = innerWidth < 640, R0 = small ? 7 : 10, cx = small ? 2.9 : 3.7, cy = small ? 1.6 : 2.1;  // rem, from the bottom left
  const start = 4 * Math.PI / 180, end = 62 * Math.PI / 180;
  let ring = 0, a = start;
  skFlowers.querySelectorAll(".skflower").forEach(b => {
    let r = R0 + ring * 2.8;
    if (a > end) { ring++; r = R0 + ring * 2.8; a = start; }  // this arc is full: a wider one
    b.style.left = `${(cx + r * Math.cos(a) - 1.05).toFixed(2)}rem`;
    b.style.bottom = `${(cy + r * Math.sin(a) - 1.05).toFixed(2)}rem`;
    a += 2.7 / r;  // radians to the next flower: an even gap along the arc
  });
};
const skFlowersBuild = () => {
  skFlowers.innerHTML = SK_TRACKS.map((t, i) => `<button type="button" class="skflower" data-track="${i}" title="${skEsc(t.name)}" aria-label="${skEsc(t.name)}">${skFlower(t.color)}</button>`).join("");
  skFlowers.querySelectorAll(".skflower").forEach(b => b.addEventListener("click", () => skSelect(+b.dataset.track, true)));
  skFlowersPlace();
};

// ── Playing ──
// skTrack: the track playing or paused: { yt: its video, paused, time } for a YouTube one, or the
// <audio> of an mp3 (screenTrack)
const SK_YT = {  // the player, as the owner of a YouTube player: its time and its end
  onTime: t => { if (skTrack && skTrack.yt) skTrack.time = t; },
  onEnd: () => skSelect((skTrackAt + 1) % SK_TRACKS.length, true),
};
const skPlaying = () => !!skTrack && !skTrack.paused;
const skTrackTime = () => skTrack ? (skTrack.yt ? skTrack.time : skTrack.currentTime) : 0;
const skTrackStart = () => {
  const tr = SK_TRACKS[skTrackAt];
  skBeat = -1;
  if (tr.id) {
    const player = ytPlay(tr.id, SK_YT, true);
    skTrack = { yt: tr.id, paused: false, time: player.time };
    return;
  }
  skTrack = screenTrack(tr.file, { loop: false });
  skTrack.addEventListener("ended", () => skSelect((skTrackAt + 1) % SK_TRACKS.length, true));
  ["play", "pause"].forEach(ev => skTrack.addEventListener(ev, skPlayerShow));
};
const skTrackPlay = on => {
  if (!skTrack) return;
  if (skTrack.yt) { skTrack.paused = !on; if (on) ytPlay(skTrack.yt, SK_YT, true); else ytPause(skTrack.yt, SK_YT); }
  else if (on) skTrack.play().catch(() => {});
  else skTrack.pause();
};
const skTrackDrop = () => {
  if (skTrack && skTrack.yt) ytPause(skTrack.yt, SK_YT);  // its player stays, paused: no new ad later
  else dropTrack(skTrack);
  skTrack = null;
};
// Play track i: another track starts it; the same one plays / pauses it (a flower only plays it)
const skSelect = (i, flower) => {
  if (i === skTrackAt && skTrack) {
    if (skTrack.paused) skTrackPlay(true); else if (!flower) skTrackPlay(false);
  } else {
    skTrackDrop();
    skTrackAt = i;
    try { localStorage.setItem("sk-track", i); } catch (e) {}
    skTrackStart();
  }
  skPlayerShow();
};
skPlayBtn.addEventListener("click", () => skSelect(skTrackAt));
const skPlayerShow = () => {
  const playing = skPlaying();
  skShamisen.classList.toggle("playing", playing);
  skPlayBtn.textContent = playing ? "Pause" : "Play";
  skFlowers.querySelectorAll(".skflower").forEach(b => {
    const on = +b.dataset.track === skTrackAt;
    b.classList.toggle("on", on);
    b.classList.toggle("live", on && playing);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
};

// ── Sound and motion ──
const SK_STRINGS = [130.8, 174.6, 261.6];  // tuned honchoshi: C, F, C
const skTwang = k => {
  // a shamisen's dry, buzzing twang: a bright tone dying fast, and the bachi's click on the skin
  const f = SK_STRINGS[k];
  skTone(f, 1.4, { type: "sawtooth", gain: .05, attack: .002 });
  skTone(f * 2, .8, { type: "triangle", gain: .04, attack: .002 });
  skNoise(.05, 3000, "bandpass", .25, 0, 1.5, 4);
};
// Restart a CSS animation on an element (a class taken off and put back)
const skReplay = (el, cls) => { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); };
// A strike of the bachi, down through the strings or back up (the upstroke, sukui), on alternate
// beats: the skin throbs, the strings tremble, a petal escapes
let skStrokeUp = false;
const skStrike = (strong = false) => {
  skReplay(skShamisen, "strike");
  const bachi = skShamisen.querySelector(".skbachi");
  bachi.classList.remove("down", "up");
  void bachi.getBoundingClientRect();
  bachi.classList.add(skStrokeUp ? "up" : "down");
  skStrokeUp = !skStrokeUp;
  if (Math.random() < (strong ? 1 : .35)) {
    const puff = document.createElement("i");
    puff.className = "skpuff";
    puff.style.setProperty("--dx", `${(Math.random() * 60 - 10).toFixed(0)}px`);
    puff.style.setProperty("--rot", `${(Math.random() * 360).toFixed(0)}deg`);
    puff.style.background = SK_TRACKS[skTrackAt].color;
    const puffs = skShamisen.querySelector(".skpuffs");
    if (puffs.childElementCount < 8) puffs.append(puff);
    setTimeout(() => puff.remove(), 2600);
  }
};
skShamisen.querySelectorAll("[data-string]").forEach(el => {
  const pluck = () => {
    const k = +el.dataset.string;
    skTwang(k);
    skReplay(skShamisen.querySelectorAll(".skstrings .wire")[k], "pluck");
    skStrike(true);
    if (typeof skShred === "function") skShred();  // plucked like mad: the metal show (skpassages.js)
  };
  el.addEventListener("click", pluck);
  el.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); pluck(); } });
});
[skShamisen.querySelector(".skbachi"), skShamisen.querySelector(".skbody")].forEach(el => {
  el.addEventListener("click", () => skPlayBtn.click());
  el.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); skPlayBtn.click(); } });
});

skPart({
  on() {
    skFlowersBuild();
    skFront.append(skShamisen, skFlowers);
    skPlayerShow();
  },
  off() { skTrackDrop(); skShamisen.remove(); skFlowers.remove(); },
  resize() { skFlowersPlace(); },
  frame() {
    // the bachi strikes on the beat of the track
    if (!skPlaying()) return;
    const beat = Math.floor(skTrackTime() * SK_TRACKS[skTrackAt].bpm / 60);
    if (beat !== skBeat) { skBeat = beat; skStrike(beat % 4 === 0); }
  },
});
