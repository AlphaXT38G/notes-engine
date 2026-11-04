// ── Sakura: the wind chime ──────────────────────────────────────────────────────────────────────
// A furin (a glass wind chime, a goldfish painted on it, its paper strip hanging below) hangs from
// the great tree by a string, in the right group's box, sliding with the tree's plane (parallax).
// It swings in the wind (skWind: a pendulum pushed by the breeze and the gusts, damped), its paper
// strip fluttering more; when it swings hard the wind rings it, not too often, once the page has
// had a gesture (sound needs one). A click rings it and pushes it. At night a little light glows in
// its glass (--lamp, the lanterns' hour), flickering, and lights the paper strip.
const skFurin = document.createElement("span");
skFurin.className = "skfurin";
skFurin.setAttribute("aria-hidden", "true");
skFurin.innerHTML = `<svg viewBox="0 0 60 220" aria-hidden="true"><defs>
<radialGradient id="sk-glass" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" stop-color="#e8f4ff" stop-opacity=".55"/><stop offset="1" stop-color="#9cc4e8" stop-opacity=".6"/></radialGradient>
</defs>
<g class="skfurin-art">
<path d="M30,0V96" stroke="#3a2a20" stroke-width="1.2"/>
<g class="bell"><path d="M12,124Q10,98 30,94Q50,98 48,124Z" fill="url(#sk-glass)" stroke="#7fa6c8" stroke-width=".8"/>
<path d="M17,116q4,-6 9,-2q-3,5 -9,2zM26,114l3,-3l0,6z" fill="#e0303a"/><path d="M34,108q6,-3 9,2q-5,3 -9,-2z" fill="#2a5aa8" opacity=".8"/>
<path d="M15,104q4,-8 12,-9" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8" fill="none"/>
<path d="M12,124Q30,128 48,124" stroke="#7fa6c8" stroke-width="1.4" fill="none"/></g>
<g class="clapper"><path d="M30,100V140" stroke="#3a2a20"/><circle cx="30" cy="126" r="2.2" fill="#c8a24a"/>
<g class="strip"><rect x="22" y="140" width="16" height="72" rx="1" fill="#fbf4e4" stroke="#d8c8a8" stroke-width=".6"/>
<text x="30" y="160" font-size="11" text-anchor="middle" fill="#b02838" font-family="serif">風</text><text x="30" y="178" font-size="11" text-anchor="middle" fill="#2a1d24" font-family="serif">鈴</text></g></g></g>
</svg>`;
const SK_FURIN_AT = [1390, 40, 78];  // in the right group's box: x, y, width (the string hangs from a branch)
skFurin.style.cssText = `left:${(SK_FURIN_AT[0] / SK_BW * 100).toFixed(3)}%;top:${(SK_FURIN_AT[1] / SK_BH * 100).toFixed(3)}%;width:${(SK_FURIN_AT[2] / SK_BW * 100).toFixed(3)}%`;
skPlanes.push({ el: skFurin, depth: 15 });  // it slides with the tree it hangs from
let skFurinA = 0, skFurinV = 0, skFurinRungAt = 0;  // its swing: angle (degrees) and speed; its last ring

// Its voice: a small glass bell, a bright tone and its high, inharmonic partials
const skFurinRing = (k = 1) => {
  [[2793, .06], [4186, .03], [6050, .015]].forEach(([f, g]) => skTone(f * (1 + (Math.random() - .5) * .01), 1.6, { gain: g * k }));
};
skPart({
  on() { skBack.querySelector(".skg-right").append(skFurin); },
  off() { skFurin.remove(); },
  frame(dt, t) {
    const push = (skWind - .25) * 18 + Math.sin(t * 1.3) * skWind * 6;
    skFurinV += (-(skFurinA - push) * 7 - skFurinV * 1.6) * dt;
    skFurinA += skFurinV * dt;
    skFurin.style.rotate = `${skP(skFurinA)}deg`;
    skFurin.style.setProperty("--strip", `${skP(skFurinA * 1.8 + Math.sin(t * 4) * 6 * skWind)}deg`);
    const now = performance.now();
    if (Math.abs(skFurinV) > 18 && now - skFurinRungAt > 2500 && Math.random() < dt * 4 && screenGesture()) {
      skFurinRungAt = now;
      skFurinRing(.45 + Math.random() * .3);
    }
  },
});
