// ── Sakura: the hanging lantern of the night ────────────────────────────────────────────────────
// At night (the sakura-night screen) a silk lantern hangs on a long chain from the branches
// above, in the left margin, near the courses: a rounded body of orange silk printed with peonies
// over dark curved ribs, a turned wooden cap and base, a leather handle with its brass rivets.
// Lit, the silk glows from within (bright at the bottom, deeper red at its edges, rounded by a
// shade on its sides), a ball of light shines at its foot, a halo of light breathes around it. A click lights it or puts it out (a soft whoosh, or a
// puff). It swings on its chain like a pendulum, pushed by the wind (skWind) and the gusts. It is
// placed beside the courses' column (where the margin is wide enough; none on narrow screens).
const skLantern = document.createElement("button");
skLantern.type = "button";
skLantern.className = "sklantern lit";
skLantern.setAttribute("aria-label", "A hanging lantern: light it or put it out");
skLantern.title = "A hanging lantern";
skLantern.innerHTML = `<i class="skchain"></i><i class="skhalo"></i><svg viewBox="0 0 100 150" aria-hidden="true"><defs>
<linearGradient id="sk-lwood" x2="1"><stop offset="0" stop-color="#2a1208"/><stop offset=".35" stop-color="#6a3a1c"/><stop offset=".55" stop-color="#8a5228"/><stop offset="1" stop-color="#2a1208"/></linearGradient>
<radialGradient id="sk-silk" cx=".5" cy=".78" r=".75"><stop offset="0" class="p0"/><stop offset=".45" class="p1"/><stop offset="1" class="p2"/></radialGradient>
<linearGradient id="sk-round" x2="1"><stop offset="0" stop-color="#2a0804" stop-opacity=".55"/><stop offset=".22" stop-color="#2a0804" stop-opacity="0"/><stop offset=".78" stop-color="#2a0804" stop-opacity="0"/><stop offset="1" stop-color="#2a0804" stop-opacity=".6"/></linearGradient>
<radialGradient id="sk-orb"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffe070"/><stop offset="1" stop-color="#ffb030" stop-opacity="0"/></radialGradient>
<clipPath id="sk-lbody"><path d="M20,44C9,62 8,104 22,126H78C92,104 91,62 80,44Z"/></clipPath>
<symbol id="sk-peony" viewBox="-12 -12 24 24"><g fill="none" stroke="currentColor" stroke-width=".9">
<circle r="3"/><path d="M0,-3q5,-6 8,0q-2,5 -8,3M0,-3q-5,-6 -8,0q2,5 8,3M-3,1q-6,4 -2,9q5,0 5,-7M3,1q6,4 2,9q-5,0 -5,-7"/>
<path d="M-8,-1q-4,-5 1,-9M8,-1q4,-5 -1,-9M-6,8q-6,0 -6,-6M6,8q6,0 6,-6"/></g></symbol></defs>
<path class="skhandle" d="M38,28C36,2 64,2 62,28" fill="none" stroke="#5a2e14" stroke-width="4.5" stroke-linecap="round"/>
<path d="M39,24C38,6 62,6 61,24" fill="none" stroke="rgba(255,210,160,.35)" stroke-width="1"/>
<circle cx="38.5" cy="27" r="1.6" fill="#d8b060"/><circle cx="61.5" cy="27" r="1.6" fill="#d8b060"/>
<rect x="41" y="22" width="18" height="15" rx="3" fill="url(#sk-lwood)"/><circle cx="50" cy="22.5" r="1.5" fill="#d8b060"/>
<path d="M20,44C9,62 8,104 22,126H78C92,104 91,62 80,44Z" fill="url(#sk-silk)"/>
<g clip-path="url(#sk-lbody)" class="skflora"><use href="#sk-peony" x="20.0" y="48.0" width="20" height="20"/><use href="#sk-peony" x="50.0" y="44.0" width="16" height="16"/><use href="#sk-peony" x="67.0" y="61.0" width="18" height="18"/><use href="#sk-peony" x="33.0" y="67.0" width="22" height="22"/><use href="#sk-peony" x="16.0" y="88.0" width="16" height="16"/><use href="#sk-peony" x="56.0" y="86.0" width="20" height="20"/><use href="#sk-peony" x="33.0" y="105.0" width="14" height="14"/><use href="#sk-peony" x="75.0" y="101.0" width="14" height="14"/><use href="#sk-peony" x="47.0" y="59.0" width="10" height="10"/></g>
<path d="M20,44C9,62 8,104 22,126H78C92,104 91,62 80,44Z" fill="url(#sk-round)"/>
<circle class="skorb" cx="50" cy="110" r="11" fill="url(#sk-orb)"/>
<g fill="none" stroke="#3a1206" stroke-width="1.7"><path d="M21.5,44Q3.5,85 21.5,126"/><path d="M31.0,44Q19.0,85 31.0,126"/><path d="M40.5,44Q34.5,85 40.5,126"/><path d="M50.0,44Q50.0,85 50.0,126"/><path d="M59.5,44Q65.5,85 59.5,126"/><path d="M69.0,44Q81.0,85 69.0,126"/><path d="M78.5,44Q96.5,85 78.5,126"/></g>
<ellipse cx="50" cy="42" rx="33" ry="4.5" fill="url(#sk-lwood)"/><ellipse cx="50" cy="41" rx="31" ry="2.5" fill="rgba(255,210,160,.18)"/>
<path d="M24,125h52q2,10 -5,17h-42q-7,-7 -5,-17z" fill="url(#sk-lwood)"/>
<path d="M26,129h48" stroke="rgba(255,210,160,.25)" stroke-width="1.2"/><path d="M29,142h42" stroke="#1a0804" stroke-width="1.5"/></svg>`;
let skLanternA = 0, skLanternV = 0, skLanternLit = true;
const skLanternPlace = () => {
  // beside the courses' column, in the left margin; hidden when the margin is too narrow
  const { W, H } = skLay, col = Math.max(16, (W - 960) / 2 + 16), x = col - 78;
  skLantern.hidden = x < 60;
  skLantern.style.left = `${Math.round(x - 40)}px`;
  skLantern.style.setProperty("--chain", `${Math.round(H * .17)}px`);
};
skLantern.addEventListener("click", () => {
  skLanternLit = !skLanternLit;
  skLantern.classList.toggle("lit", skLanternLit);
  skLanternV += (Math.random() < .5 ? -1 : 1) * 10;
  if (skLanternLit) { skNoise(.5, 600, "lowpass", .18, 0, .7, 1.5); skTone(1320, .4, { gain: .02 }); }  // a soft whoosh: the flame takes
  else skNoise(.25, 1800, "bandpass", .2, 0, .8, 2);  // a puff: blown out
});
skPart({
  on() { skFront.append(skLantern); },
  off() { skLantern.remove(); },
  resize() { skLanternPlace(); },
  night(on) {
    skLantern.classList.toggle("night", on);
    if (on) { skLanternLit = true; skLantern.classList.add("lit"); }
  },
  frame(dt, t) {
    if (!skLantern.classList.contains("night")) return;
    // a long pendulum: slow, pushed by the wind and the gusts, damped
    const push = (skWind - .25) * 9 + Math.sin(t * .7) * skWind * 3;
    skLanternV += (-(skLanternA - push) * 1.6 - skLanternV * .5) * dt;
    skLanternA += skLanternV * dt;
    skLantern.style.rotate = `${skP(skLanternA)}deg`;
  },
});
