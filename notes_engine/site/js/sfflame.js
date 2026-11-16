// ── The flame of his eye in the fight (sansfight.js) ──
// The WebGL flame rising from his blue eye, and sfShader(), which sets up the fight's two shaders
// (this one and the blue fire of sfrise.js).

// ── His burning eye: a ray-marched volumetric flame (WebGL), on a canvas over his face. The eye
// itself (the blue glow of his drawing, snowman.css) stays visible: the flame rises from its top.
const SF_FLAME_FS = `precision mediump float;
uniform vec2 R; uniform float T;
float h3(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * n3(p); p = p * 2.02 + vec3(3.1, 1.7, 5.3); a *= .5; } return s; }
// the flame's density at p: rising from the top of the eye (the eye: a disc of radius .1 around 0),
// wide at its root, thinning, leaning back and swaying, eaten by noise that climbs with time
float dens(vec3 p){
  float y = p.y - .07;
  if (y < -.05) return 0.;
  vec3 q = p - vec3(-.26 * y * y + .06 * sin(T * 2.3 + y * 3.) * y, 0., 0.);
  float r = mix(.12, .015, smoothstep(0., 1.3, y)) + .03 * exp(-y * 10.);
  float d = length(q.xz) - r;
  float n = fbm(vec3(q.x * 4.2, q.y * 3.4 - T * 3.2, q.z * 4.2 + T * .6));
  float keep = smoothstep(.1, .17, length(p.xy));  // not over the eye
  return clamp(-d * 9. + (n - .5) * 2.4 + .3, 0., 1.) * (1. - smoothstep(1.0, 1.4, y)) * smoothstep(-.05, .06, y) * keep;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - vec2(.5 * R.x, .07 * R.y)) / R.y;
  vec3 ro = vec3(0., 0., -3.), rd = normalize(vec3(uv * 1.6, 3.));
  vec3 col = vec3(0.); float tr = 1.;
  for (int i = 0; i < 44; i++) {
    vec3 p = ro + rd * (2.45 + float(i) * .025);
    float d = dens(p);
    if (d > .001) {
      float a = d * .2;
      vec3 e = mix(vec3(.02, .22, 1.), vec3(.78, .97, 1.), d * d) * (1.7 - p.y * .7);
      col += tr * a * e;
      tr *= 1. - a;
      if (tr < .03) break;
    }
  }
  // a soft halo around the eye, outside it
  float r = length(uv * 1.6);
  float g = .006 / (abs(r - .11) + .02) * smoothstep(.09, .13, r);
  col += vec3(.2, .6, 1.) * g * .5;
  gl_FragColor = vec4(col, clamp(1. - tr + g * .2, 0., 1.));
}`;
// A canvas painted by a fragment shader over one triangle covering it (the eye's flame, the fire
// behind him): its WebGL context and a getter of uniforms, or null (no WebGL, or the shader failed)
const sfShader = (cv, fs) => {
  const gl = cv.getContext("webgl", { premultipliedAlpha: true, antialias: false, depth: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }"));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return { gl, u: n => gl.getUniformLocation(prog, n) };
};
const sfShaderFree = gl => {
  const x = gl.getExtension("WEBGL_lose_context");
  if (x) x.loseContext();  // free the GPU now
};
const sfFlameStart = () => {
  const k = smK(), cv = document.createElement("canvas");
  cv.className = "eyefire";
  cv.width = Math.round(90 * k);
  cv.height = Math.round(140 * k);
  const S = sfShader(cv, SF_FLAME_FS);
  if (!S) return null;
  const gl = S.gl, uR = S.u("R"), uT = S.u("T");
  snowman.append(cv);
  const F = { cv, gl, raf: null, t0: performance.now() };
  const frame = now => {
    F.raf = requestAnimationFrame(frame);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(uR, cv.width, cv.height);
    gl.uniform1f(uT, (now - F.t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  F.raf = requestAnimationFrame(frame);
  return F;
};
const sfFlameStop = () => {
  if (!sfFlame) return;
  cancelAnimationFrame(sfFlame.raf);
  sfShaderFree(sfFlame.gl);
  sfFlame.cv.remove();
  sfFlame = null;
};
