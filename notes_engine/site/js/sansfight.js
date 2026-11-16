// ── The snowman's bad time: a fight, in the style of the old pixel RPG duels ──
// When the whole Megalovania plays (the 22nd click on his lowest button, snowman.js), he picks a
// fight. The page goes black around him; where the courses were, the battle box, and under it the
// stats (LV, HP and its bar). The mouse pointer becomes a red pixel-art heart, trapped in the box:
// it is exactly where the pointer is, never slowed, only kept inside; or moved by the arrow keys,
// and then it stays where they left it until the mouse moves again.
// Around it all, a diorama (sansscenes.js): scenes of cut paper whose layers slide with the heart,
// changing during the fight.
// One line to begin with, a moment to get in place, then the attacks never stop, faster and faster,
// overlapping more and more: bones from both sides along the floor and the ceiling, blue bones
// (they only hurt a heart that moves), bone waves, bones raining from the top, bones riding sine
// waves, a propeller of bones turning around the middle, snowflakes of bones bouncing in the box,
// bones erupting from the floor where red warnings flashed, rings of bones closing on the heart,
// skull blasters charging then firing a beam across the screen, alone or four crossing. The bones
// are outlined and shaded, the blue ones glow, the fast and turning ones leave a trail. Each hit:
// a crunch, the screen shakes, the box flashes red. HP at 0: the heart breaks, game over. The fight
// ends with the song, with Escape, at game over, or with Christmas.
// The fight lands with a quake: a run of jolts and thuds as the dark falls, another when the
// attacks begin. He rises for it: he grows and floats, his bottom sinking out of the window, and
// shakes with the quakes, blue fire burning behind him (a WebGL shader, on a canvas inside him so
// it floats and shakes with him, flaring with the quakes).
// His left eye glows blue and a flame rises from it: a WebGL shader ray-marching a volume of noise
// (rising from the top of the eye, leaning back, flickering), on a small canvas over his face that
// follows his gaze.
// Everything here is made when the fight starts and removed when it ends.
//
// In this file: the fight's state, the heart's drawing, the layout, the dioramas behind it, its
// line of speech, and the start and the end. The rest: sfattacks.js (the attacks), sfhits.js
// (the rounds, the heart's HP and hits), sfframe.js (every frame and the drawing), sfflame.js
// (the flame of his eye), sfrise.js (the quakes, his rise, the blue fire).
const SF_HP = 40;
const SF = { on: false, raf: null, phase: "", t: 0, fight: 0, hp: SF_HP, hitAt: 0, shake: 0, quakes: [], objs: [], active: [], nextAt: 0, n: 0, last: 0, keys: {}, typing: null, over: false, useMouse: true, scene: null };
const SF_SCENE_S = 22;  // seconds of each diorama
let sfUi = null, sfCv = null, sfCtx = null, sfDark = null, sfFlame = null, sfBox = null, sfBg = null, sfBgCtx = null;
let sfSoul = [0, 0], sfMoved = 0, sfAura = null;

// The red heart, in pixels (11 x 10), and its two halves when it breaks
const SF_HEART = ["..XX...XX..", ".XXXX.XXXX.", "XXXXXXXXXXX", "XXXXXXXXXXX", "XXXXXXXXXXX", ".XXXXXXXXX.", "..XXXXXXX..", "...XXXXX...", "....XXX....", ".....X....."];
const SF_CRACK = [5, 5, 6, 5, 4, 5, 6, 5, 5, 5];  // where each row splits
const sfHeart = (ctx, x, y, px, half, color) => {
  ctx.fillStyle = color || "#ff1a1a";
  SF_HEART.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== "X" || (half === 1 && i >= SF_CRACK[j]) || (half === 2 && i < SF_CRACK[j])) continue;
      ctx.fillRect(Math.round(x + (i - 5.5) * px), Math.round(y + (j - 5) * px), Math.ceil(px), Math.ceil(px));
    }
  });
};

// The layout: a big box where the courses are, the stats under it
const sfLayout = () => {
  const W = innerWidth, H = innerHeight;
  const w = Math.min(760, W - 32), h = Math.min(330, Math.max(190, H * .42));
  sfBox = { x: (W - w) / 2, y: Math.max(60, H * .5 - h / 2 - 16), w, h };
  if (!sfUi) return;
  Object.assign(sfUi.querySelector(".box").style, { left: `${sfBox.x}px`, top: `${sfBox.y}px`, width: `${w}px`, height: `${h}px` });
  Object.assign(sfUi.querySelector(".stats").style, { left: `${sfBox.x}px`, top: `${sfBox.y + h + 14}px`, width: `${w}px` });
  sfCv.width = sfBg.width = W;
  sfCv.height = sfBg.height = H;
  if (SF.scene) SF.scene.cur = SF_SCENES[SF.scene.name](W, H);  // its layers, at the new size
};
// The dioramas, one after another (built when they come), crossfading over 1.6 s
const sfSceneNext = () => {
  const i = SF.scene ? (SF_SCENE_ORDER.indexOf(SF.scene.name) + 1) % SF_SCENE_ORDER.length : 0, name = SF_SCENE_ORDER[i];
  SF.scene = { name, cur: SF_SCENES[name](innerWidth, innerHeight), prev: SF.scene ? SF.scene.cur : null, at: SF.t };
};
const sfBackground = dt => {
  const S = SF.scene, W = sfBg.width, H = sfBg.height, f = Math.min(1, (SF.t - S.at) / 1.6);
  const par = [Math.max(-1, Math.min(1, (sfSoul[0] - W / 2) / (W / 2))), Math.max(-1, Math.min(1, (sfSoul[1] - H / 2) / (H / 2)))];
  if (S.prev && f < 1) sfSceneDraw(sfBgCtx, S.prev, W, H, SF.t, dt, par, 1);
  else S.prev = null;
  sfSceneDraw(sfBgCtx, S.cur, W, H, SF.t, dt, par, f);
};

// The opening line in the box, typed letter by letter with a blip
const sfSay = (text, done) => {
  const p = sfUi.querySelector(".text");
  clearInterval(SF.typing);
  p.textContent = "";
  let i = 0;
  SF.typing = setInterval(() => {
    p.textContent = text.slice(0, ++i);
    if (text[i - 1] && text[i - 1].trim()) smTone(180, 40, { vol: .025 });  // a blip a letter
    if (i >= text.length) { clearInterval(SF.typing); SF.typing = null; if (done) setTimeout(done, 700); }
  }, 30);
};

// ── Start and end
const sfKey = e => {
  if (!SF.on) return;
  if (e.key === "Escape") { e.preventDefault(); return sfEnd(); }
  if (e.key.indexOf("Arrow") === 0) {
    e.preventDefault();
    SF.keys[e.key] = e.type === "keydown";
    SF.useMouse = false;  // the heart stays where the keys leave it, until the mouse moves
  }
};
const sfPointer = () => { SF.useMouse = true; };
const sfStart = () => {
  if (SF.on || xmasStill()) return;
  Object.assign(SF, { on: true, phase: "talk", t: 0, fight: 0, hp: SF_HP, hitAt: 0, shake: 0, quakes: [], objs: [], active: [], nextAt: 0, n: 0, keys: {}, over: false, useMouse: true });
  smUnfreeze();  // no slow, frozen pointer from a snowball during the fight
  smBusy = true;
  snowman.classList.add("hold");
  document.body.classList.add("sansfight");
  sfDark = document.createElement("div");
  sfDark.id = "xdark";
  sfBg = document.createElement("canvas");
  sfBgCtx = sfBg.getContext("2d");
  sfDark.append(sfBg);
  snowman.parentNode.insertBefore(sfDark, snowman);
  SF.scene = null;
  sfUi = document.createElement("div");
  sfUi.id = "xfight";
  sfUi.innerHTML = '<div class="box"><p class="text"></p></div><canvas></canvas>' +
    `<div class="stats"><b>YOU</b><span>LV 1</span><span class="hp">HP</span><i class="bar"><i></i></i><span class="hpn">${SF_HP} / ${SF_HP}</span><small>ESC: run away</small></div>`;
  sfCv = sfUi.querySelector("canvas");
  sfCtx = sfCv.getContext("2d");
  document.body.append(sfUi);
  sfLayout();
  sfSceneNext();
  sfUi.addEventListener("pointerdown", e => e.stopPropagation());
  addEventListener("pointermove", sfPointer, { passive: true });
  addEventListener("resize", sfLayout);
  addEventListener("keydown", sfKey, true);
  addEventListener("keyup", sfKey, true);
  sfFlame = sfFlameStart();
  sfAura = sfAuraStart();
  snowman.style.transition = "";
  const I = sfInside();
  sfSoul = [(I.x0 + I.x1) / 2, (I.y0 + I.y1) / 2];
  sfQuake(SF_QUAKE_IN);  // the fight lands on us
  SF.last = performance.now();
  SF.raf = requestAnimationFrame(sfFrame);
  // the dark falls, the one line, then the fight, which never stops
  setTimeout(() => {
    if (!SF.on) return;
    sfSay("* The snowman blocks the way!\n* Get ready...", () => { if (SF.on) sfFightStart(); });
  }, 900);
};
// Over: the song stops with it
const sfEnd = () => {
  if (!SF.on) return;
  SF.on = false;
  cancelAnimationFrame(SF.raf);
  clearInterval(SF.typing);
  removeEventListener("resize", sfLayout);
  removeEventListener("keydown", sfKey, true);
  removeEventListener("keyup", sfKey, true);
  removeEventListener("pointermove", sfPointer);
  SF.scene = null;
  sfFlameStop();
  sfAuraStop();
  sfRiseEnd();
  snowman.classList.remove("hold");
  document.body.classList.remove("sansfight");
  const ui = sfUi, dark = sfDark;
  sfUi = sfDark = null;
  ui.classList.add("leaving");
  dark.classList.add("leaving");
  setTimeout(() => { ui.remove(); dark.remove(); }, 700);
  smBusy = false;
  if (smMegaSong) smMegaStop();
};
