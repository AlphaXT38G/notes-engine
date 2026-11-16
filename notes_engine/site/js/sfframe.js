// ── The fight's frame (sansfight.js) ──
// The loop of the fight: the heart, the patterns, the objects, the hits and the shake, then the
// drawing of the bones and the skull blasters on the full-window canvas.

// ── Every frame: the heart, the patterns, the objects, the hits, the shake, the drawing
const sfFrame = now => {
  SF.raf = null;
  if (!SF.on) return;
  const dt = Math.min(.05, (now - SF.last) / 1000);
  SF.last = now;
  SF.t += dt;
  const I = sfInside(), prev = sfSoul.slice();
  if (SF.phase === "fight" || SF.phase === "talk") {
    // the heart: where the pointer is (or moved by the arrows), kept inside the box
    const K = SF.keys, kx = (K.ArrowRight ? 1 : 0) - (K.ArrowLeft ? 1 : 0), ky = (K.ArrowDown ? 1 : 0) - (K.ArrowUp ? 1 : 0);
    if (kx || ky) { sfSoul[0] += kx * 300 * dt; sfSoul[1] += ky * 300 * dt; }
    else if (smMouse && SF.useMouse && SF.phase === "fight") sfSoul = smMouse.slice();
    sfSoul[0] = Math.max(I.x0, Math.min(I.x1, sfSoul[0]));
    sfSoul[1] = Math.max(I.y0, Math.min(I.y1, sfSoul[1]));
  }
  sfMoved = Math.hypot(sfSoul[0] - prev[0], sfSoul[1] - prev[1]) / Math.max(dt, .001);
  if (SF.phase === "fight") {
    SF.fight += dt;
    if (SF.fight >= SF.nextAt) sfNextPattern();
    SF.active = SF.active.filter(p => { p.t += dt; p.step(p.t); return p.t < p.dur; });
  }
  // objects, and the hits (along the whole way the heart went this frame: a fast move does not
  // jump through a bone)
  for (const o of SF.objs) {
    if (o.trail && o.kind === "bone") { o.past = o.past || []; o.past.unshift([o.x, o.y, o.a]); if (o.past.length > 3) o.past.pop(); }
    o.t += dt;
    if (o.kind === "bone") {
      if (o.fn) o.fn(o, dt);
      else { o.x += o.vx * dt; o.y += o.vy * dt; o.a += o.va * dt; }
    } else if (o.kind === "flake") {  // bouncing off the walls of the box
      o.trail.unshift([o.x, o.y, o.a]);
      if (o.trail.length > 3) o.trail.pop();
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.a += o.va * dt;
      const r = o.len / 2 - 6;
      if (o.x < I.x0 + r) { o.x = I.x0 + r; o.vx = Math.abs(o.vx); }
      if (o.x > I.x1 - r) { o.x = I.x1 - r; o.vx = -Math.abs(o.vx); }
      if (o.y < I.y0 + r) { o.y = I.y0 + r; o.vy = Math.abs(o.vy); }
      if (o.y > I.y1 - r) { o.y = I.y1 - r; o.vy = -Math.abs(o.vy); }
    }
  }
  if (SF.phase === "fight") {
    const steps = Math.min(12, Math.ceil(Math.hypot(sfSoul[0] - prev[0], sfSoul[1] - prev[1]) / 6));
    for (let i = 1; i <= Math.max(1, steps); i++) {
      const u = i / Math.max(1, steps);
      if (sfTouches(smLerp(prev[0], sfSoul[0], u), smLerp(prev[1], sfSoul[1], u))) { sfHurt(); break; }
    }
  }
  const [hx, hy] = sfSoul;
  SF.objs = SF.objs.filter(o => {
    if (o.life && o.t > o.life) return false;
    if (o.kind === "bone") {
      const m = o.len / 2 + 80;
      return o.x > sfBox.x - m && o.x < sfBox.x + sfBox.w + m && o.y > sfBox.y - m - 200 && o.y < sfBox.y + sfBox.h + m;
    }
    if (o.kind !== "blaster") return true;
    if (o.t > o.charge && !o.boomed) { o.boomed = true; smNoise(500, 1400, 200, .3); SF.shake = Math.max(SF.shake, .35); }
    if (o.t > o.charge && o.t < o.charge + o.fire && SF.phase === "fight") {
      // the distance from the heart to the beam's line (from the mouth, ahead of the skull)
      const ux = Math.cos(o.a), uy = Math.sin(o.a), rx = hx - (o.x - uy * 17), ry = hy - (o.y + ux * 17), along = rx * ux + ry * uy, across = Math.abs(-rx * uy + ry * ux);
      if (along > 0 && across < 26) sfHurt();
    }
    return o.t < o.charge + o.fire + .35;
  });
  // the quakes due: each a jolt and a low thud
  while (SF.quakes.length && SF.t >= SF.quakes[0][0]) {
    const s = SF.quakes.shift()[1];
    SF.shake = Math.max(SF.shake, s);
    smNoise(260 + 120 * s, 260, 40, .25 * Math.min(1, s));
    smTone(70 + 20 * s, 220 + 100 * s, { vol: .06 * Math.min(1, s), type: "sine", to: 32 });
  }
  // the shake, dying away: the box and the diorama behind it (the strongest also tilt a little)
  if (SF.shake > 0) {
    const a = 10 * SF.shake * SF.shake, r = SF.shake > 1 ? (Math.random() - .5) * 1.6 * (SF.shake - 1) : 0;
    sfUi.style.transform = sfBg.style.transform = `translate(${f1((Math.random() - .5) * 2 * a)}px,${f1((Math.random() - .5) * 2 * a)}px) rotate(${f1(r)}deg)`;
    SF.shake = Math.max(0, SF.shake - dt * 4);
    if (!SF.shake) sfUi.style.transform = sfBg.style.transform = "";
  }
  sfRise();
  sfAuraDraw(dt);
  // the flame follows his gaze (snowman.js moves his eyes; in his own pixels, as he is scaled)
  if (sfFlame) { const k = snowman.offsetWidth / 300; sfFlame.cv.style.transform = `translate(${f1(smLookOff[0] * k)}px,${f1(smLookOff[1] * k)}px)`; }
  if (SF.phase === "fight" && SF.t - SF.scene.at > SF_SCENE_S) sfSceneNext();
  sfBackground(dt);
  sfDraw(now);
  SF.raf = requestAnimationFrame(sfFrame);
};
const sfDraw = now => {
  const c = sfCtx, B = sfBox;
  c.clearRect(0, 0, sfCv.width, sfCv.height);
  // bones, clipped to the box
  c.save();
  c.beginPath();
  c.rect(B.x + 4, B.y + 4, B.w - 8, B.h - 8);
  c.clip();
  for (const o of SF.objs) {
    const ghost = o.t < o.warm ? .3 + .2 * Math.sin(o.t * 30) : 1;  // a warning, blinking, harmless
    if (o.kind === "warn") {  // red on the floor where bones will come out
      const blink = .35 + .25 * Math.sin(o.t * 28);
      c.fillStyle = `rgba(255,40,40,${(blink * .45).toFixed(2)})`;
      c.fillRect(o.x, B.y + B.h - o.h, o.w, o.h);
      c.strokeStyle = `rgba(255,70,70,${blink.toFixed(2)})`;
      c.lineWidth = 2;
      c.strokeRect(o.x + 1, B.y + B.h - o.h + 1, o.w - 2, o.h - 2);
      c.fillStyle = `rgba(255,90,90,${(blink + .3).toFixed(2)})`;
      c.font = "700 22px 'Courier New', monospace";
      c.textAlign = "center";
      c.fillText("!", o.x + o.w / 2, B.y + B.h - 12);
    } else if (o.kind === "bone") {
      if (o.past) o.past.forEach((q, i) => sfDrawBone(c, q[0], q[1], o.len, o.w, q[2], o.blue, ghost * (.22 - i * .06)));
      sfDrawBone(c, o.x, o.y, o.len, o.w, o.a, o.blue, ghost);
    } else if (o.kind === "flake") {
      o.trail.forEach((q, i) => { for (let k = 0; k < 3; k++) sfDrawBone(c, q[0], q[1], o.len, o.w, q[2] + k * Math.PI / 3, false, ghost * (.2 - i * .06)); });
      for (let k = 0; k < 3; k++) sfDrawBone(c, o.x, o.y, o.len, o.w, o.a + k * Math.PI / 3, false, ghost);
      c.globalAlpha = ghost;
      c.fillStyle = "#fff";
      c.beginPath();
      c.arc(o.x, o.y, 7, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#4fd0ff";
      c.beginPath();
      c.arc(o.x, o.y, 3, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
    }
  }
  c.restore();
  // blasters and their beams, over everything
  for (const o of SF.objs) if (o.kind === "blaster") sfBlaster(c, o);
  // the heart (blinking while hurt; broken at the end)
  const [x, y] = sfSoul;
  if (SF.over) {
    const k = Math.min(1, SF.t / .6);
    if (SF.t < 1.6) { sfHeart(c, x - 4 * k, y, 2, 1); sfHeart(c, x + 4 * k, y, 2, 2); }
    else if (SF.t < 2.4) {
      c.fillStyle = "#ff1a1a";
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, d = (SF.t - 1.6) * 120; c.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d + (SF.t - 1.6) * (SF.t - 1.6) * 260, 4, 4); }
    }
  } else if (now - SF.hitAt > 140 || Math.floor(now / 60) % 2) sfHeart(c, x, y, 2);
};
// A bone: a shaft with two knobs at each end, outlined (the outline drawn first, wider, so only its
// outside shows), a shade along it; blue ones glow
const sfDrawBone = (c, x, y, len, w, a, blue, alpha) => {
  if (alpha <= 0 || len <= 0) return;
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.globalAlpha = alpha;
  const r = w * .42, body = w * .62, ends = [-len / 2 + r, len / 2 - r];
  if (blue) { c.fillStyle = "rgba(40,170,255,.22)"; c.fillRect(-w, -len / 2 - 4, w * 2, len + 8); }
  c.beginPath();
  c.rect(-body / 2, ends[0], body, Math.max(0, ends[1] - ends[0]));
  for (const e of ends) {
    c.moveTo(-r * .7 + r, e);
    c.arc(-r * .7, e, r, 0, Math.PI * 2);
    c.moveTo(r * .7 + r, e);
    c.arc(r * .7, e, r, 0, Math.PI * 2);
  }
  c.strokeStyle = blue ? "#0a4f8a" : "#7f8ca4";
  c.lineWidth = 2.4;
  c.stroke();
  c.fillStyle = blue ? "#33b6ff" : "#fff";
  c.fill();
  c.fillStyle = blue ? "rgba(255,255,255,.4)" : "rgba(140,155,185,.45)";
  c.fillRect(body * .1, ends[0] + r * .6, body * .2, Math.max(0, ends[1] - ends[0] - r * 1.2));
  c.restore();
};
// A skull blaster: a long horned skull seen from the side, its jaw dropping open when it fires,
// and its beam from the mouth across the whole window
const sfBlaster = (c, o) => {
  const grow = Math.min(1, o.t / .3), firing = o.t > o.charge, fade = firing ? Math.max(0, 1 - (o.t - o.charge - o.fire) / .35) : 1;
  const open = firing ? Math.min(1, (o.t - o.charge) / .08) : 0;
  c.save();
  c.translate(o.x, o.y);
  c.rotate(o.a);
  c.globalAlpha = Math.min(1, fade);
  if (firing) {  // the beam, flickering a little
    const w = 46 * (o.t < o.charge + o.fire ? 1 + .06 * Math.sin((o.t - o.charge) * 60) : fade);
    c.fillStyle = "rgba(170,230,255,.55)";
    c.fillRect(40, 17 - w / 2 - 5, 3000, w + 10);
    c.fillStyle = "#fff";
    c.fillRect(40, 17 - w / 2, 3000, w);
  }
  c.scale(1.7 * grow, 1.7 * grow);
  c.fillStyle = "#fff";
  c.strokeStyle = "#000";
  c.lineWidth = 1.6;
  c.lineJoin = "round";
  const shape = pts => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); c.stroke(); };
  // horns, swept back
  shape([[-24, -16], [-50, -34], [-40, -20], [-30, -6]]);
  shape([[-24, 10], [-50, 24], [-38, 12], [-28, 2]]);
  // the jaw, turning down around its hinge when it fires
  c.save();
  c.translate(-8, 9);
  c.rotate(.5 * open);
  shape([[0, 0], [38, -1], [36, 5], [30, 9], [4, 11]]);
  c.beginPath();  // lower teeth
  for (let x = 8; x <= 34; x += 6) { c.moveTo(x, -1); c.lineTo(x + 3, -5); c.lineTo(x + 6, -1); }
  c.fill();
  c.stroke();
  c.restore();
  // the cranium and the long snout
  c.beginPath();
  c.ellipse(-12, -3, 22, 19, 0, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  shape([[-6, -19], [26, -12], [34, -5], [34, 3], [28, 9], [-8, 9]]);
  c.fillStyle = "#fff";  // hides the stroke where the snout joins the head
  c.beginPath();
  c.ellipse(-10, -3, 18, 14, 0, 0, Math.PI * 2);
  c.fill();
  // upper teeth
  c.beginPath();
  for (let x = 2; x <= 28; x += 6) { c.moveTo(x, 9); c.lineTo(x + 3, 13); c.lineTo(x + 6, 9); }
  c.fill();
  c.stroke();
  // eye sockets and nostril; a pupil glowing while it charges
  c.fillStyle = "#000";
  c.beginPath();
  c.ellipse(-2, -8, 7, 5.5, -.2, 0, Math.PI * 2);
  c.ellipse(28, -4, 2.2, 1.6, 0, 0, Math.PI * 2);
  c.fill();
  if (!firing) {
    c.fillStyle = Math.floor(o.t * 12) % 2 ? "#ffffff" : "#4fd0ff";
    c.beginPath();
    c.arc(-1, -8, 2.2, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
};
