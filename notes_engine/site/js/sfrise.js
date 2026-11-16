// ── The fight's quakes, his rise and the blue fire (sansfight.js) ──
// The quakes the fight lands with, the snowman rising, and the column of blue fire behind him.

// The quakes the fight lands with: [seconds after the start of the run, strength] (a strength
// above 1 shakes harder than any hit). As the dark falls: a heavy blow, then aftershocks dying out
// with a last big one; when the attacks begin: a shorter run, as he strikes.
const SF_QUAKE_IN = [[.05, 1.8], [.25, 1.2], [.42, 1.5], [.6, 1], [.78, 1.3], [.95, .9], [1.15, 1.2], [1.35, .8],
  [1.55, 1.1], [1.8, .7], [2.05, 1], [2.3, .6], [2.55, .8], [2.9, 1.6]];
const SF_QUAKE_GO = [[0, 1.7], [.2, 1.1], [.38, 1.4], [.58, .9], [.8, 1.1], [1.05, .6], [1.35, .5]];
const sfQuake = run => { SF.quakes = SF.quakes.concat(run.map(([dt, s]) => [SF.t + dt, s])); };

// ── He rises: grown (from a point high on him, so his bottom sinks out of the window), floating
// up and down, shaken by the quakes and the hits like the box
const SF_RISE = .35, SF_RISE_S = 1.4;  // how much he grows, in how many seconds
const sfRise = () => {
  const u = Math.min(1, SF.t / SF_RISE_S), g = u * u * (3 - 2 * u), a = 6 * SF.shake * SF.shake;
  const x = (Math.random() - .5) * 2 * a, y = (Math.random() - .5) * 2 * a - g * (6 + 6 * Math.sin(SF.t * 1.7));
  snowman.style.transform = `translate(${f1(x)}px,${f1(y)}px) scale(${(1 + SF_RISE * g).toFixed(3)})`;
  smBox = null;  // his box changes all the time: his eyes measure it again (snowman.js)
};
const sfRiseEnd = () => {
  snowman.style.transition = "transform .9s ease-in-out";
  snowman.style.transform = "";
  setTimeout(() => { if (!SF.on) snowman.style.transition = ""; smBox = null; }, 950);
};

// ── The blue fire behind him, on a canvas inside him (so it grows, floats and shakes with him),
// behind his drawing. With WebGL: a fire shader. Each pixel measures how far the fire has come
// from his outline (three balls and the hat, as distances), rising being cheap and sideways dear,
// so the fire burns far above him and close on his sides; a rising, warped noise bites into that
// heat, leaving tongues of flame; white-cyan at the hottest, deep blue as they thin out; a halo
// around him, embers rising. They flare with the quakes and the hits (K, the shake). Rendered at
// 0.6x (fire is soft).
// Without WebGL: glowing sprites rising from the same outline, added up on a 2D canvas.
// His outline, in his 300 x 520 (xscene.js draws him): the balls (cx, cy, rx, ry, and their
// share of the sprites), the hat's crown (a box: cx, cy, half width, half height) and brim
const SF_BALLS = [[150, 412, 100, 86, .45], [156, 264, 70, 64, .35], [164, 152, 50, 47, .2]];
const SF_HAT = [164, 70, 38, 38], SF_BRIM = [164, 105, 62, 14];
const SF_AURA_X = .45, SF_AURA_Y = .3;  // the canvas reaches that far beyond him (of his size)
const sfVec = a => `vec${a.length}(${a.map(v => v.toFixed(1)).join(", ")})`;  // GLSL floats
const SF_FIRE_FS = `precision mediump float;
uniform vec2 R;
uniform float T, O, K;
float hs(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ns(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hs(i), hs(i + vec2(1., 0.)), f.x), mix(hs(i + vec2(0., 1.)), hs(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0., a = .5;
  for (int i = 0; i < 5; i++) { s += a * ns(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; }
  return s;
}
float el(vec2 p, vec4 e) { return (length((p - e.xy) / e.zw) - 1.) * min(e.z, e.w); }
float bx(vec2 p, vec4 b) { vec2 d = abs(p - b.xy) - b.zw; return length(max(d, 0.)) + min(max(d.x, d.y), 0.); }
float body(vec2 p) {
  float d = min(min(el(p, ${sfVec(SF_BALLS[0].slice(0, 4))}), el(p, ${sfVec(SF_BALLS[1].slice(0, 4))})), el(p, ${sfVec(SF_BALLS[2].slice(0, 4))}));
  return min(d, min(bx(p, ${sfVec(SF_HAT)}), el(p, ${sfVec(SF_BRIM)})));
}
void main() {
  vec2 uv = gl_FragCoord.xy / R;
  // in his units, y down
  vec2 p = ${sfVec([-300 * SF_AURA_X, 520 * (1 + SF_AURA_Y)])} + uv * ${sfVec([300 * (1 + 2 * SF_AURA_X), -520 * (1 + 2 * SF_AURA_Y)])};
  float d = body(p), D = max(d, 0.);
  // the noise of the flames: stretched upwards, warped by a slower one, rising
  vec2 q = p / vec2(55., 95.);
  vec2 w = vec2(fbm(q + vec2(0., T * 1.3)), fbm(q + vec2(4.3, T * 1.6)));
  float n = fbm(q * 1.7 + (w - .5) * 1.6 + vec2(0., T * 2.8)) * .65 + fbm(q * 3.6 + (w - .5) * 2.2 + vec2(0., T * 4.2)) * .35;
  // how far the fire has come from him, going straight up costing less than sideways: the
  // distance to him from a point some way below, plus a part of that way (the tongues sway)
  float far = D;
  for (int i = 1; i < 11; i++) {
    float s = float(i) * 17.;
    far = min(far, max(body(p + vec2((w.x - .5) * .6 * s, s)), 0.) + s * .22);
  }
  // the heat: full at his edge, nothing at the reach; the noise bites into it, so tongues
  float reach = 60. * (1. + .5 * K) * O;
  float x = clamp((1. - far / max(reach, 1.)) * 1.75 - n * 1.5 + .08, 0., 1.);
  // one column behind him, a little wider than his body, narrowing above his head (the fire of
  // his shoulders would spread into a T beside his head), its edges swaying with the noise
  float hw = 86. + 46. * smoothstep(140., 340., p.y);
  x *= smoothstep(hw + 18., hw - 22., abs(p.x - ${SF_BALLS[1][0].toFixed(1)} + (w.y - .5) * 40.));
  float halo = exp(-D / (40. + 30. * K)) * O;
  // embers: rare cells of a grid rising faster than the fire, each a dot drifting in its cell
  vec2 g = vec2(p.x / 16., (p.y + T * 150.) / 16.), id = floor(g), c = fract(g) - .5;
  float r = hs(id), e = 0.;
  if (r > .93) e = smoothstep(.16, 0., length(c - vec2(sin(T * 3. + r * 40.) * .25, (r - .965) * 8.))) * exp(-D / 110.) * step(0., d) * O;
  // deep blue where it thins out, blue, cyan, and a white heart only at the hottest
  vec3 col = mix(vec3(.05, .04, .5), vec3(.12, .38, 1.), smoothstep(.05, .35, x));
  col = mix(col, vec3(.45, .8, 1.), smoothstep(.45, .75, x));
  col = mix(col, vec3(.92, .97, 1.), smoothstep(.88, 1., x));
  float a = smoothstep(0., .2, x);
  col = col * a + vec3(.05, .18, .85) * halo * .5 + vec3(.7, .9, 1.) * e;
  a = max(a, max(halo * .4, e));
  gl_FragColor = vec4(col, a);
}`;
const sfAuraStart = () => {
  const W = snowman.offsetWidth * (1 + 2 * SF_AURA_X), H = snowman.offsetHeight * (1 + 2 * SF_AURA_Y);
  const fire = () => {
    const cv = document.createElement("canvas");
    cv.width = Math.round(W * .6);
    cv.height = Math.round(H * .6);
    const S = sfShader(cv, SF_FIRE_FS);
    return S && { cv, gl: S.gl, uR: S.u("R"), uT: S.u("T"), uO: S.u("O"), uK: S.u("K") };
  };
  // no WebGL (or the shader failed): the sprites
  const sprites = () => {
    const cv = document.createElement("canvas");
    cv.width = Math.round(W);
    cv.height = Math.round(H);
    return { cv, ctx: cv.getContext("2d"), parts: [], due: 0, sprites: [blob(200, 240, 255, 1), blob(60, 140, 255, 1), blob(30, 50, 220, 1)], glow: blob(40, 110, 255, .55) };
  };
  const A = fire() || sprites();
  A.cv.className = "bluefire";
  snowman.insertBefore(A.cv, snowman.firstChild);
  return A;
};
const sfAuraDraw = dt => {
  const A = sfAura;
  if (!A) return;
  const on = Math.min(1, SF.t / SF_RISE_S);  // the fire catches as he rises
  if (A.gl) {
    const gl = A.gl;
    gl.viewport(0, 0, A.cv.width, A.cv.height);
    gl.uniform2f(A.uR, A.cv.width, A.cv.height);
    gl.uniform1f(A.uT, SF.t);
    gl.uniform1f(A.uO, on);
    gl.uniform1f(A.uK, Math.min(1.5, SF.shake));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return;
  }
  const c = A.ctx, W = A.cv.width, H = A.cv.height, k = W / (1 + 2 * SF_AURA_X) / 300, ox = W * SF_AURA_X / (1 + 2 * SF_AURA_X), oy = H * SF_AURA_Y / (1 + 2 * SF_AURA_Y);
  // new tongues, about 170 a second once it burns (capped)
  A.due += dt * 170 * on;
  while (A.due >= 1 && A.parts.length < 340) {
    A.due--;
    const r = Math.random();
    const [cx, cy, rx, ry] = r < SF_BALLS[0][4] ? SF_BALLS[0] : r < SF_BALLS[0][4] + SF_BALLS[1][4] ? SF_BALLS[1] : SF_BALLS[2];
    const a = Math.PI + Math.random() * Math.PI * 1.2 - .1 * Math.PI, e = .8 + Math.random() * .2;  // mostly on the upper side
    A.parts.push({ x: ox + (cx + Math.cos(a) * rx * e) * k, y: oy + (cy + Math.sin(a) * ry * e) * k, vx: Math.cos(a) * 25 * k, vy: -(70 + Math.random() * 90) * k, t: 0, life: .55 + Math.random() * .6, r: (16 + Math.random() * 20) * k, ph: Math.random() * 6.3 });
  }
  A.due = Math.min(A.due, 1);
  c.clearRect(0, 0, W, H);
  c.globalCompositeOperation = "lighter";
  // the glow behind him, breathing
  c.globalAlpha = on * (.75 + .25 * Math.sin(SF.t * 3.1));
  c.drawImage(A.glow, ox + 10 * k, oy + 60 * k, 280 * k, 470 * k);
  A.parts = A.parts.filter(p => {
    p.t += dt;
    if (p.t > p.life) return false;
    const u = p.t / p.life;
    p.x += (p.vx + Math.sin(SF.t * 7 + p.ph) * 30 * k) * dt;
    p.y += p.vy * dt;
    p.vx *= .96;
    const s = p.r * (u < .2 ? .6 + 2 * u : 1.2 - u * .9);  // swells, then thins out as it rises
    c.globalAlpha = (u < .15 ? u / .15 : 1 - (u - .15) / .85) * .8;
    c.drawImage(A.sprites[u < .3 ? 0 : u < .65 ? 1 : 2], p.x - s, p.y - s * 1.4, 2 * s, 2.8 * s);  // taller than wide
    return true;
  });
  c.globalAlpha = 1;
  c.globalCompositeOperation = "source-over";
};
const sfAuraStop = () => {
  if (!sfAura) return;
  const A = sfAura;
  sfAura = null;
  A.cv.classList.add("leaving");
  setTimeout(() => {
    if (A.gl) sfShaderFree(A.gl);
    A.cv.remove();
  }, 700);
};
