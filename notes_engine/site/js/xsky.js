// ── The Christmas sky (christmas.js) ──
// The snow on the effects canvas (fx.js), both Christmas screens, and Santa's sleigh crossing the
// sky on the Christmas night.

// Snow on the effects canvas (fx.js, mode "christmas"): soft round flakes of a few sizes and, one in
// ten, a six-armed crystal turning as it falls. They drift with a slow changing wind, sway, and
// move aside around the mouse. By day each flake has a faint blue rim, so it shows on the pale sky.
const crystal = day => {
  const s = document.createElement("canvas"), c = s.getContext("2d");
  s.width = s.height = 48;
  c.translate(24, 24);
  c.lineCap = "round";
  for (const [w, color] of day ? [[3.4, "rgba(110,145,190,.55)"], [1.6, "#fff"]] : [[1.8, "rgba(255,255,255,.95)"]]) {
    c.lineWidth = w; c.strokeStyle = color;
    for (let i = 0; i < 6; i++) {
      c.save();
      c.rotate(i * Math.PI / 3);
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(0, -20);
      c.moveTo(0, -8); c.lineTo(-5, -13); c.moveTo(0, -8); c.lineTo(5, -13);
      c.moveTo(0, -14); c.lineTo(-3.5, -17.5); c.moveTo(0, -14); c.lineTo(3.5, -17.5);
      c.stroke();
      c.restore();
    }
  }
  return s;
};
const dayFlake = (() => {
  const s = document.createElement("canvas"), c = s.getContext("2d");
  s.width = s.height = 32;
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.45, "rgba(255,255,255,.95)");
  g.addColorStop(.62, "rgba(120,150,195,.45)"); g.addColorStop(1, "rgba(120,150,195,0)");
  c.fillStyle = g; c.fillRect(0, 0, 32, 32);
  return s;
})();
const FLAKES = { night: [blob(255, 255, 255, .95), crystal(false)], day: [dayFlake, crystal(true)] };
const flakes = [];
let snowWind = 0, snowT = 0, snowMouseX = -1e4, snowMouseY = -1e4;
addEventListener("pointermove", e => { snowMouseX = e.clientX; snowMouseY = e.clientY; });
const newFlake = top => {
  const r = Math.random(), big = Math.random() < .1;
  return { x: Math.random() * fxW, y: top ? -20 : Math.random() * fxH, r: big ? 7 + Math.random() * 6 : 1.2 + r * r * 3.8, crystal: big,
    vy: big ? 28 + Math.random() * 20 : 22 + r * 50, sway: 10 + Math.random() * 25, phase: Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - .5) * 1.2 };
};
fxLayers.push({
  mode: "christmas",
  update(dt) {
    snowT += dt;
    snowWind = Math.sin(snowT * .13) * 22 + Math.sin(snowT * .37) * 10;
    const want = Math.min(320, Math.round(fxW * fxH / 7000));
    while (flakes.length < want) flakes.push(newFlake(flakes.w === fxW));
    flakes.length = Math.min(flakes.length, want);
    flakes.w = fxW;
    for (const f of flakes) {
      f.y += f.vy * dt;
      f.x += (snowWind * (.4 + f.r / 8) + Math.cos(snowT * .9 + f.phase) * f.sway) * dt;
      f.rot += f.vr * dt;
      const dx = f.x - snowMouseX, dy = f.y - snowMouseY, d2 = dx * dx + dy * dy;
      if (d2 < 6400 && d2 > 0) { const d = Math.sqrt(d2); f.x += dx / d * (80 - d) * .05; f.y += dy / d * (80 - d) * .02; }  // within 80 px
      if (f.y > fxH + 20) Object.assign(f, newFlake(true));
      if (f.x < -20) f.x += fxW + 40; else if (f.x > fxW + 20) f.x -= fxW + 40;
    }
  },
  draw(c) {
    const [dot, star] = FLAKES[document.body.dataset.phase === "christmas" ? "day" : "night"];
    for (const f of flakes) {
      c.globalAlpha = f.crystal ? .9 : .55 + Math.min(.45, f.r / 9);
      if (f.crystal) {
        // turned in place with one setTransform rather than save / translate / rotate / restore
        const cos = Math.cos(f.rot), sin = Math.sin(f.rot);
        c.setTransform(cos, sin, -sin, cos, f.x, f.y);
        c.drawImage(star, -f.r * 1.6, -f.r * 1.6, f.r * 3.2, f.r * 3.2);
        c.setTransform(1, 0, 0, 1, 0, 0);
      } else c.drawImage(dot, f.x - f.r * 1.6, f.y - f.r * 1.6, f.r * 3.2, f.r * 3.2);
    }
    c.globalAlpha = 1;
  },
  reset() { flakes.length = 0; flakes.w = 0; },
});

// Santa's sleigh: at night, now and then at random (every 40 s to 4 min), Santa's sleigh crosses
// the sky far away: random height, size, speed and direction, on a gentle arc. Drawn flying to the
// left: Rudolph alone in front, his red nose shining bright (white-hot core, glow, wide halo and a
// small flare, pulsing), then two pairs of reindeer (the far one of each pair darker and a little
// higher, for depth), all galloping (legs and bodies animated in CSS), in red harnesses with gold
// bells; then the red and gold sleigh on curled runners, Santa holding the reins, his sack of
// gifts behind him, and a trail of golden sparkles. Flying to the right, it is mirrored (.ltr).
const deer = (x, y, far, rudolph = false) => `<g transform="translate(${x},${y})"><g class="deer${far ? " far" : ""}" style="--b:${f1(-Math.random())}s">` +
  // far legs (behind the body), antler behind
  `<g class="legs-f" style="--o:-.15s"><path d="M22,27 15,35 9,33"/></g><g class="legs-h" style="--o:-.15s"><path d="M46,27 54,35 62,37"/></g>` +
  `<path class="antler back" d="M14,1C14,-4 16,-9 21,-12M16,-5C18,-7 19,-8 18,-11M15,-2C12,-4 11,-7 12,-9"/>` +
  `<path class="body" d="M16,16C20,11 32,10 44,11C52,11 57,15 56,21C55,27 49,30 41,30C33,31 24,31 18,28C13,26 12,20 16,16Z"/>` +
  `<path class="body" d="M18,18C15,12 12,7 9,3L15,1C18,6 22,11 26,14Z"/>` +
  `<path class="body" d="M9,3C7,0 3,0 0,2-3,4-3,7-1,8 2,9 6,8 9,7 12,6 13,4 12,2Z"/><path class="body" d="M12,1 16,-3 15,2Z"/>` +
  `<path class="pale" d="M18,27C26,30 36,30 44,29 38,26 26,26 18,27ZM9,6C12,9 15,14 18,19 17,13 14,8 11,5Z"/>` +
  `<path class="tail" d="M55,14c3,-3 7,-1 5,2 -1,1 -3,1 -5,0Z"/>` +
  `<path class="antler" d="M11,0C10,-5 12,-10 17,-13M13,-6C15,-8 16,-9 15,-12M12,-3C9,-5 8,-8 9,-10"/>` +
  `<circle cx="5" cy="2.5" r=".9" fill="#111"/>` +
  // near legs, harness with bells
  `<g class="legs-f"><path d="M18,26 12,34 6,31"/></g><g class="legs-h"><path d="M50,25 58,32 66,33"/></g>` +
  `<path class="strap" d="M15,15C17,21 19,26 20,29M27,12C27,18 27,24 27,30"/><circle class="bell" cx="17.5" cy="21" r="1.6"/><circle class="bell" cx="27" cy="21" r="1.6"/>` +
  (rudolph ? `<g class="nose"><circle class="halo" cx="-2" cy="6" r="30"/><circle class="glow" cx="-2" cy="6" r="13"/>` +
      `<path class="flare" d="M-26,6Q-2,4.6 22,6Q-2,7.4-26,6Z"/><circle cx="-2" cy="6" r="3.2" fill="#ff1f1f"/>` +
      `<circle cx="-2" cy="6" r="1.8" fill="#ff8a8a"/><circle cx="-2.6" cy="5.4" r=".9" fill="#fff"/></g>`
    : `<circle cx="-2" cy="6" r="1.4" fill="#1a0e08"/>`) + `</g></g>`;
const sleighEl = document.createElement("div");
sleighEl.id = "sleigh";
sleighEl.setAttribute("aria-hidden", "true");
sleighEl.innerHTML = `<svg viewBox="-12 -34 452 100"><defs>` +
  `<linearGradient id="rd-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a26a40"/><stop offset="1" stop-color="#5a3118"/></linearGradient>` +
  `<linearGradient id="rd-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#76492a"/><stop offset="1" stop-color="#3b200e"/></linearGradient>` +
  `<linearGradient id="sl-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2384f"/><stop offset=".55" stop-color="#b3122e"/><stop offset="1" stop-color="#6e0716"/></linearGradient>` +
  `<radialGradient id="rd-glow"><stop offset="0" stop-color="rgba(255,90,80,1)"/><stop offset=".35" stop-color="rgba(255,40,40,.75)"/><stop offset="1" stop-color="rgba(255,30,30,0)"/></radialGradient>` +
  `<radialGradient id="rd-halo"><stop offset="0" stop-color="rgba(255,60,50,.45)"/><stop offset=".5" stop-color="rgba(255,40,40,.15)"/><stop offset="1" stop-color="rgba(255,40,40,0)"/></radialGradient>` +
  `<radialGradient id="sl-spark"><stop offset="0" stop-color="#fff7d0"/><stop offset=".4" stop-color="rgba(255,215,110,.8)"/><stop offset="1" stop-color="rgba(255,215,110,0)"/></radialGradient></defs>` +
  // golden sparkles trailing behind the sleigh
  [[360, 44, 5], [374, 50, 4], [388, 42, 3.4], [400, 52, 3], [412, 46, 2.4], [424, 50, 2], [434, 44, 1.6]].map(([x, y, r], i) =>
    `<circle class="spark" style="--s:${f1(-i * .23)}s" cx="${x}" cy="${y}" r="${r}" fill="url(#sl-spark)"/>`).join("") +
  // reins from the sleigh to every harness
  `<path class="reins" d="M276,10C220,6 140,4 70,14M276,10C230,4 150,0 82,8M276,10C210,10 120,12 20,16"/>` +
  deer(156, -6, true) + deer(82, -6, true) + deer(148, 2, false) + deer(74, 2, false) + deer(0, 4, false, true) +
  // the sleigh: runners, body with a scroll at the front, gold trim
  `<path class="runner" d="M228,51C220,51 218,44 224,42 228,41 231,45 228,48M226,58H340C346,58 349,54 346,51M250,48 247,58M298,48V58M330,45 334,58"/>` +
  `<path d="M318,20C316,2 326,-12 338,-12 350,-10 356,4 352,20Z" fill="#7a2e1c"/><path d="M326,-6C330,-2 342,-2 346,-8" stroke="#5a1f12" stroke-width="2" fill="none"/>` +
  `<rect x="326" y="-22" width="12" height="11" fill="#1f7a3e"/><rect x="331" y="-22" width="2.4" height="11" fill="#e3b341"/><rect x="339" y="-18" width="10" height="9" fill="#e3b341"/><rect x="343" y="-18" width="2" height="9" fill="#c8102e"/>` +
  // Santa: coat, belt, fur trims, beard, face, floppy hat trailing behind, arm forward on the reins
  `<path d="M286,24C284,6 292,-6 304,-6S324,6 322,24Z" fill="url(#sl-red)"/><rect x="286" y="10" width="36" height="4.5" fill="#1b1b1b"/><rect x="301" y="9.4" width="6" height="5.6" fill="none" stroke="#e3b341" stroke-width="1.4"/>` +
  `<path d="M302,-14C301,-24 310,-28 318,-22 323,-18 328,-12 331,-8L327,-6C323,-10 318,-14 314,-14Z" fill="url(#sl-red)"/><circle cx="330" cy="-6" r="3.4" fill="#fff"/>` +
  `<circle cx="304" cy="-11" r="6.2" fill="#f2c7a2"/><path d="M296,-15C296,-18 312,-18 312,-15" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>` +
  `<path d="M297,-10C294,-2 300,5 306,3 312,5 316,-2 312,-10 309,-7 300,-7 297,-10Z" fill="#f4f6fa"/><circle cx="301" cy="-12" r=".9" fill="#222"/>` +
  `<path d="M292,4C286,8 280,11 274,11" stroke="url(#sl-red)" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="273" cy="11" r="3.2" fill="#1b1b1b"/><path d="M278,9.5 280,13" stroke="#fff" stroke-width="2.4"/>` +
  `<path class="sleigh-body" d="M236,30C232,22 238,14 248,16L262,20H318C324,8 336,2 348,6 342,10 340,18 340,28 340,40 330,48 316,48H250C240,48 236,40 236,30Z"/>` +
  `<path d="M236,30C228,26 226,16 234,12 240,10 244,14 242,18" stroke="#e3b341" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
  `<path d="M248,16 262,20H318C324,8 336,2 348,6" stroke="#e3b341" stroke-width="1.8" fill="none"/>` +
  `<path d="M262,34C268,26 278,26 282,32 284,36 280,40 276,38M282,32C290,40 304,40 310,32 314,28 320,30 318,34" stroke="#f0cc6a" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>`;
let sleighIn = 20 + Math.random() * 60;  // seconds before the next flight
let sleighFlight = null;
const flySleigh = () => {
  if (document.hidden || sleighEl.isConnected || xmasStill()) return;
  const ltr = Math.random() < .5, w = 130 + Math.random() * 70, y = 15 + Math.random() * 25, rise = (Math.random() - .5) * 10;
  sleighEl.style.cssText = `top:${f1(y)}vh;width:${f1(w)}px`;
  sleighEl.classList.toggle("ltr", ltr);  // flying left to right: the drawing is mirrored (CSS)
  const [from, to] = ltr ? [`-${f1(w + 40)}px`, "100vw"] : ["100vw", `-${f1(w + 40)}px`];
  document.body.append(sleighEl);
  sleighFlight = sleighEl.animate([
    { transform: `translate(${from},0)` },
    { transform: `translate(calc((${from} + ${to}) / 2),${f1(-2 - Math.random() * 4)}vh)` },
    { transform: `translate(${to},${f1(rise)}vh)` },
  ], { duration: (14 + Math.random() * 14) * 1000, easing: "linear" });
  sleighFlight.onfinish = sleighFlight.oncancel = () => sleighEl.remove();
};
everySecond.push(() => {
  if (document.body.dataset.phase !== "christmas-night") { if (sleighFlight) sleighFlight.cancel(); sleighIn = 20 + Math.random() * 60; return; }
  if (--sleighIn <= 0) { sleighIn = 40 + Math.random() * 200; flySleigh(); }
});
