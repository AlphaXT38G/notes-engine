// ── The fight's attacks (sansfight.js) ──
// The patterns of bones and skull blasters (SF_PATTERNS) and the objects they spawn.

// ── The attacks. Each pattern spawns objects over its duration, faster as the fight goes on (from
// 0.85 to 2 in a minute and a half). Objects: bones { kind: "bone", x, y, w, h, vx, vy, blue } and
// blasters { kind: "blaster", x, y, a (angle of fire), t, charge, fire }, in window pixels.
const sfSpeed = () => Math.min(2, .85 + SF.fight / 80);
// Bones: a centre x, y, a length along their own axis (a = 0: upright), a width, a turn a and its
// speed va, a velocity; blue ones only hurt a moving heart; fn: a motion of their own (o, dt);
// life: seconds; warm: seconds of a harmless ghost first (a warning); trail: leaves afterimages
const sfBoneAt = (x, y, len, w, a, more) => {
  const b = Object.assign({ kind: "bone", x, y, len, w, a, va: 0, vx: 0, vy: 0, blue: false, t: 0, life: 0, warm: 0, trail: false }, more);
  SF.objs.push(b);
  return b;
};
const sfBone = (x, y, w, h, vx, vy, blue) => sfBoneAt(x + w / 2, y + h / 2, h, w, 0, { vx, vy, blue: !!blue });
const sfBlast = (x, y, aim) => {
  const s = sfSpeed();
  SF.objs.push({ kind: "blaster", x, y, a: aim, t: 0, charge: .85 / s + .15, fire: .45 });
  smNoise(600, 300, 1800, .1, "swell");
};
const SF_PATTERNS = {
  // bones running along the floor and the ceiling, from both sides, the gap moving
  run: () => {
    let next = 0;
    return { dur: 6, step: t => {
      if (t < next || t > 5) return;
      const s = sfSpeed(), B = sfBox, gap = Math.max(58, 96 - s * 18), low = 22 + Math.random() * (B.h - gap - 44);
      next = t + .5 / s;
      const fromLeft = Math.random() < .5, x = fromLeft ? B.x - 14 : B.x + B.w + 4, vx = (fromLeft ? 1 : -1) * 250 * s;
      sfBone(x, B.y + B.h - low, 10, low, vx, 0);
      sfBone(x, B.y, 10, B.h - low - gap, vx, 0);
    } };
  },
  // tall blue bones sweeping the box, both ways: stand still and they pass through
  blue: () => {
    let next = 0, side = 0;
    return { dur: 6, step: t => {
      if (t < next || t > 5) return;
      const s = sfSpeed(), B = sfBox;
      next = t + 1 / s;
      side = 1 - side;
      sfBone(side ? B.x - 14 : B.x + B.w + 4, B.y, 12, B.h, (side ? 1 : -1) * 280 * s, 0, true);
      sfBone(side ? B.x + B.w + 4 : B.x - 14, B.y + B.h - 34, 10, 34, (side ? -1 : 1) * 230 * s, 0);
    } };
  },
  // a wave: columns of bones from the top and the bottom, a winding gap between them
  wave: () => {
    let next = 0;
    return { dur: 6, step: t => {
      if (t < next || t > 4.8) return;
      const s = sfSpeed(), B = sfBox, gap = Math.max(70, 112 - s * 22), mid = B.y + B.h / 2 + Math.sin(t * 2.4 * Math.min(1.5, s)) * (B.h / 2 - gap / 2 - 12);
      next = t + .14 / s;
      sfBone(B.x + B.w + 4, B.y, 10, mid - gap / 2 - B.y, -230 * s, 0);
      sfBone(B.x + B.w + 4, mid + gap / 2, 10, B.y + B.h - mid - gap / 2, -230 * s, 0);
    } };
  },
  // bones raining from the ceiling, some aimed at the heart
  rain: () => {
    let next = 0;
    return { dur: 5.5, step: t => {
      if (t < next || t > 4.6) return;
      const s = sfSpeed(), B = sfBox, aimed = Math.random() < .35;
      next = t + .2 / s;
      const x = aimed ? sfSoul[0] - 5 : B.x + 10 + Math.random() * (B.w - 30), h = 34 + Math.random() * 40;
      sfBone(x, B.y - h, 10, h, 0, (230 + Math.random() * 120) * s);
    } };
  },
  // skull blasters around the box, aiming at the heart, charging then firing
  blasters: () => {
    let next = .2, n = 0;
    return { dur: 6.5, step: t => {
      if (t < next || n >= 8) return;
      const s = sfSpeed(), B = sfBox, a = Math.random() * Math.PI * 2, R = Math.max(B.w, B.h) / 2 + 90;
      const x = B.x + B.w / 2 + Math.cos(a) * R, y = B.y + B.h / 2 + Math.sin(a) * R * .8;
      next = t + .75 / s;
      n++;
      sfBlast(x, y, Math.atan2(sfSoul[1] - y, sfSoul[0] - x));
    } };
  },
  // four blasters at once, crossing on the heart
  cross: () => {
    let done = 0;
    return { dur: 3.2, step: t => {
      if (done >= 2 || t < done * 1.6) return;
      const B = sfBox, R = Math.max(B.w, B.h) / 2 + 80, [hx, hy] = sfSoul, turn = done ? Math.PI / 4 : 0;
      done++;
      for (let i = 0; i < 4; i++) {
        const a = turn + i * Math.PI / 2, x = hx + Math.cos(a) * R, y = hy + Math.sin(a) * R;
        sfBlast(x, y, a + Math.PI);
      }
    } };
  },
  // rows of short bones riding sine waves, from the right
  sine: () => {
    let next = 0, ph = Math.random() * 6;
    return { dur: 5.5, step: t => {
      if (t < next || t > 4.6) return;
      const s = sfSpeed(), B = sfBox, base = B.y + B.h / 2, amp = B.h * .32, p = ph + t * 2.2;
      next = t + .2 / s;
      [-1, 1].forEach(side => sfBoneAt(B.x + B.w + 20, base + side * B.h * .2, 46, 10, 0, { trail: true, p: p + (side > 0 ? Math.PI : 0), fn: (o, dt) => {
        o.x -= 240 * s * dt;
        o.y = base + side * B.h * .2 + Math.sin(o.p + o.t * 3.2) * amp * .55;
      } }));
    } };
  },
  // a propeller of four long bones turning around the middle of the box (a hole at its hub)
  spin: () => {
    let made = false;
    return { dur: 6, step: () => {
      if (made) return;
      made = true;
      const s = sfSpeed(), B = sfBox, px = B.x + B.w / 2, py = B.y + B.h / 2, len = Math.min(B.w, B.h) * .44, r0 = 38, dir = Math.random() < .5 ? 1 : -1;
      for (let i = 0; i < 4; i++) {
        sfBoneAt(px, py, len, 12, 0, { life: 5.6, warm: .7, trail: true, ang: i * Math.PI / 2, fn: (o, dt) => {
          o.ang += dir * (o.t < .7 ? .3 : .9 + .45 * s) * dt;
          o.x = px + Math.cos(o.ang) * (r0 + len / 2);
          o.y = py + Math.sin(o.ang) * (r0 + len / 2);
          o.a = o.ang - Math.PI / 2;
        } });
      }
    } };
  },
  // snowflakes of three crossed bones, spinning and bouncing off the walls of the box
  flake: () => {
    let n = 0;
    return { dur: 6, step: t => {
      if (n >= 3 || t < n * 1.1) return;
      n++;
      const s = sfSpeed(), B = sfBox, a = Math.random() * Math.PI * 2, v = 170 * s;
      SF.objs.push({ kind: "flake", x: B.x + 50 + Math.random() * (B.w - 100), y: B.y + 40, vx: Math.cos(a) * v, vy: Math.abs(Math.sin(a)) * v + 40, a: 0, va: 3 + s, len: 64, w: 9, t: 0, life: 6 - n * 1.1, warm: .5, trail: [] });
    } };
  },
  // red warnings on the floor, then bones erupting out of it there (one under the heart)
  erupt: () => {
    let next = .2, n = 0;
    return { dur: 5.6, step: t => {
      if (t < next || n >= 6) return;
      const s = sfSpeed(), B = sfBox, w = 70 + Math.random() * 60, x = n % 2 ? sfSoul[0] - w / 2 : B.x + Math.random() * (B.w - w);
      const h = B.h * (.45 + Math.random() * .25), floor = B.y + B.h, delay = .75 / Math.min(1.5, s);
      next = t + .8 / s;
      n++;
      SF.objs.push({ kind: "warn", x, w, h, t: 0, life: delay });
      for (let bx = x + 6; bx < x + w - 4; bx += 14) {
        sfBoneAt(bx, floor + h / 2, h, 10, 0, { life: delay + .75, fn: o => {
          const u = o.t - delay, k = u < 0 ? 0 : u < .12 ? u / .12 : u < .5 ? 1 : Math.max(0, 1 - (u - .5) / .2);
          o.y = floor + h / 2 - h * k;
        } });
      }
      setTimeout(() => { if (SF.on) { smNoise(180, 900, 200, .2); SF.shake = Math.max(SF.shake, .2); } }, delay * 1000);
    } };
  },
  // rings of short bones closing in on the heart, a gap in each to slip through
  ring: () => {
    let n = 0;
    return { dur: 6, step: t => {
      if (n >= 3 || t < n * 1.7) return;
      n++;
      const s = sfSpeed(), B = sfBox, [cx, cy] = sfSoul, R = Math.hypot(B.w, B.h) * .4, count = 20, gap = Math.floor(Math.random() * count), v = 150 * s;
      for (let i = 0; i < count; i++) {
        if (i === gap || i === (gap + 1) % count || i === (gap + 2) % count) continue;
        const ang = i / count * Math.PI * 2;
        sfBoneAt(cx, cy, 30, 9, ang, { r: R, trail: true, life: R / v + .6, fn: (o, dt) => {
          o.r -= v * dt;
          o.x = cx + Math.cos(ang) * o.r;
          o.y = cy + Math.sin(ang) * o.r;
          o.a = ang;  // lying across the way in, side by side with the next ones
        } });
      }
    } };
  },
};
const SF_NAMES = Object.keys(SF_PATTERNS);
