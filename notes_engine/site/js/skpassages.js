// ── Sakura: the hidden ways to the other screens, and the fireflies ─────────────────────────────
// Like the sax and the guitar of Christmas or the castle windows of Halloween, three things of the
// scene lead elsewhere, each in its own way:
//   - a sake set on the knoll, by the samurai's paper (a white porcelain flask with a blue band, a
//     little cup): clicked, the flask tips and pours, the cup clinks, and it is time for "just one
//     more drink": the jazz bar (CODES.armstrong(), armstrong.js);
//   - the shamisen plucked like mad (ten strings within five seconds): the metal show
//     (startMetalEgg, metal.js);
//   - the dragon, when it passes: clicked, it roars, its jaws wide, and breathes a jet of blue fire
//     at us that fills the view (skBlueFire); behind it, the epic finale, the one that plays
//     Dragonborn (CODES.kamelot(), epic.js). The pink moon at night already opens
//     the calm night (skplay.js).
// And the fireflies of the night: a click near them and they fly off, brighter, up and away from
// it, coming back elsewhere a while later (their flight is in skpetals.js).

// ── The sake set ──
const skSake = document.createElement("div");
skSake.className = "skl sksake";
skSake.setAttribute("aria-hidden", "true");
skSake.innerHTML = `<svg viewBox="0 0 70 70"><defs>
<linearGradient id="sk-porc" x2="1"><stop offset="0" stop-color="#c8c6c0"/><stop offset=".45" stop-color="#fbfaf6"/><stop offset="1" stop-color="#b8b4ac"/></linearGradient></defs>
<ellipse cx="36" cy="64" rx="30" ry="4" fill="rgba(30,20,10,.35)"/>
<path d="M8,58h56l-3,6h-50z" fill="#5a2e14"/><path d="M8,58h56" stroke="#8a5228" stroke-width="1.5"/>
<g class="cup"><path d="M44,50h16l-2,8h-12z" fill="url(#sk-porc)" stroke="#8a8478" stroke-width=".6"/><path d="M44.5,51h15" stroke="#2a4a8a" stroke-width="1.2"/>
<path class="wine" d="M46,51h12l-.6,2.4h-10.8z" fill="#f2e2b0"/></g>
<path class="stream" d="M43,30q2,8 7,20" stroke="#f2e6c0" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<g class="flask"><path d="M22,12h8v6q0,3 4,8q6,8 6,18q0,12 -12,14q-12,-2 -12,-14q0,-10 6,-18q4,-5 4,-8z" fill="url(#sk-porc)" stroke="#8a8478" stroke-width=".7"/>
<path d="M17,40q9,3 22,0" stroke="#2a4a8a" stroke-width="3" fill="none"/><path d="M23,46l2,3l2,-3M30,47l2,3l2,-3" stroke="#2a4a8a" stroke-width="1" fill="none"/>
<path d="M21,12h10" stroke="#8a8478" stroke-width="1.5"/><path d="M19,30q-2,8 0,16" stroke="#fff" stroke-width="1.5" opacity=".7" fill="none"/></g></svg>`;
const SK_SAKE_AT = [1186, 664, 76];  // in the right group's box: x, y, width (beside the paper)
skSake.style.cssText = `left:${(SK_SAKE_AT[0] / SK_BW * 100).toFixed(3)}%;top:${(SK_SAKE_AT[1] / SK_BH * 100).toFixed(3)}%;width:${(SK_SAKE_AT[2] / SK_BW * 100).toFixed(3)}%`;
skPlanes.push({ el: skSake, depth: 18 });
let skSakeBusy = false;
skHit({
  title: "A sake set",
  test(x, y) {
    if (skSakeBusy || !skSake.isConnected) return false;
    const r = skSake.getBoundingClientRect();
    return x > r.left && x < r.right && y > r.top + r.height * .1 && y < r.bottom;
  },
  click() {
    skSakeBusy = true;
    skSake.classList.add("pour");
    skNoise(.9, 900, "bandpass", .08, .4, 2, 1);  // the sake running
    skTone(2093, .5, { gain: .05, delay: 1.1 });   // the cup's clink
    skTone(3136, .4, { gain: .03, delay: 1.12 });
    const r = skSake.getBoundingClientRect();
    setTimeout(() => skSay(r.left + r.width / 2, r.top, "Just one more drink…", 1800), 900);
    setTimeout(() => { skSake.classList.remove("pour"); skSakeBusy = false; CODES.armstrong(); }, 2100);
  },
});

// ── The shamisen, plucked like mad ──
let skPlucks = [];
const skShred = () => {
  const now = performance.now();
  skPlucks = skPlucks.filter(t => now - t < 5000);
  skPlucks.push(now);
  if (skPlucks.length >= 10) { skPlucks = []; startMetalEgg("You shredded the shamisen."); }
};

// ── The dragon ──
const skDragonAt = (x, y) => skVisitors.find(v => v.kind === "dragon" && v.parts.some(([px, py], i) => {
  const r = (i ? 15 : 26) * skPixel();
  return Math.hypot(px - x, py - y) < r;
}));
skHit({
  title: "The dragon",
  test: (x, y) => !!skDragonAt(x, y),
  click(x, y) {
    const d = skDragonAt(x, y);
    if (!d || d.roaring) return;
    d.roaring = true;  // its jaws stay wide (skdragon.js)
    skNoise(2.4, 140, "lowpass", .6, 0, .8, 1.1);
    skTone(62, 2.2, { type: "sawtooth", gain: .07, attack: .15, glide: .6 });
  },
});

skPart({
  on() { skBack.querySelector(".skg-right").append(skSake); },
  off() { skSake.remove(); skSake.classList.remove("pour"); skSakeBusy = false; },
});
