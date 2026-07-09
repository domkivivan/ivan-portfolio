/* DOMKIV® hero — domain-warped fog shader on a fullscreen quad (raw WebGL)
   + entry sequence and hero typography reveal */

(function () {
  const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

  const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2  u_res;
uniform float u_oct;
uniform vec2  u_mouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    if (float(i) >= u_oct) break;
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  float t = u_time * 0.045;
  /* pointer gently bends the field */
  uv += u_mouse * 0.12;

  vec2 q = vec2(fbm(uv * 1.4 + t), fbm(uv * 1.4 + vec2(1.7, 4.6) - t * 0.6));
  vec2 r = vec2(fbm(uv * 1.4 + 2.2 * q + vec2(8.3, 2.8) + t * 0.8),
                fbm(uv * 1.4 + 2.2 * q + vec2(4.2, 9.1) - t * 0.5));
  float f = fbm(uv * 1.4 + 2.6 * r);

  vec3 base = vec3(0.019, 0.019, 0.021);
  vec3 mist = vec3(0.075, 0.082, 0.064);
  vec3 volt = vec3(0.706, 0.902, 0.271);

  vec3 col = mix(base, mist, smoothstep(0.1, 0.9, f));

  /* volt glow, driven by the warp field, biased to upper right */
  float glowMask = smoothstep(0.32, 0.9, f * r.x);
  float orb = smoothstep(1.35, 0.05, length(uv - vec2(0.5, 0.3)));
  col += volt * glowMask * orb * 0.55;

  /* faint secondary breath, lower left */
  float orb2 = smoothstep(1.1, 0.0, length(uv + vec2(0.7, 0.45)));
  col += volt * smoothstep(0.4, 0.9, f * q.y) * orb2 * 0.18;

  /* vignette */
  col *= 1.0 - 0.45 * smoothstep(0.4, 1.25, length(uv));

  gl_FragColor = vec4(col, 1.0);
}
`;

  function initShader() {
    const { isMobile, reducedMotion, hasWebGL } = window.DK;
    const hero = document.getElementById('hero');
    const canvas = document.getElementById('hero-canvas');

    if (!hasWebGL || reducedMotion) {
      hero.classList.add('no-webgl');
      return;
    }

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) { hero.classList.add('no-webgl'); return; }

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { hero.classList.add('no-webgl'); return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uOct = gl.getUniformLocation(prog, 'u_oct');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    gl.uniform1f(uOct, isMobile ? 3.0 : 5.0);

    /* lerped pointer → shader field bend */
    let mx = 0, my = 0, tx = 0, ty = 0;
    if (!isMobile) {
      window.addEventListener('pointermove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (0.5 - e.clientY / window.innerHeight) * 2;
      }, { passive: true });
    }

    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
    const scale = isMobile ? 0.6 : 0.85; // render below native res: fog forgives it
    function resize() {
      const w = Math.round(hero.clientWidth * dpr * scale);
      const h = Math.round(hero.clientHeight * dpr * scale);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    }
    resize();
    window.addEventListener('resize', resize);

    let visible = true;
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(hero);

    const t0 = performance.now();
    (function frame(now) {
      if (visible) {
        mx += (tx - mx) * 0.04;
        my += (ty - my) * 0.04;
        gl.uniform2f(uMouse, mx, my);
        gl.uniform1f(uTime, (now - t0) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      requestAnimationFrame(frame);
    })(t0);
  }

  function initEntry() {
    const { reducedMotion } = window.DK;
    const entry = document.getElementById('entry');

    if (typeof gsap === 'undefined') {
      entry.remove();
      document.documentElement.classList.remove('js');
      return;
    }

    if (reducedMotion) {
      entry.remove();
      gsap.set('.hero__word', { y: 0 });
      gsap.set('.hero__sub', { opacity: 1, y: 0 });
      return;
    }

    const mark = entry.querySelector('.entry__mark');
    gsap.timeline()
      .to(mark, { opacity: 1, duration: 0.45, ease: 'power2.out' })
      .to(mark, { opacity: 0, y: -14, duration: 0.4, delay: 0.35, ease: 'power2.in' })
      .to(entry, {
        opacity: 0, duration: 0.5, ease: 'power2.inOut',
        onComplete: function () { entry.remove(); }
      }, '-=0.15')
      .to('.hero__word', {
        y: 0, duration: 1.1, stagger: 0.09,
        ease: 'cubic-bezier(0.32, 0.72, 0, 1)'
      }, '-=0.35')
      .to('.hero__sub', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6');

    /* gentle parallax: title drifts up as hero scrolls away */
    gsap.to('.hero__inner', {
      y: -80, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'bottom 90%', end: 'bottom 30%', scrub: true }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initShader();
    initEntry();
  });
})();
