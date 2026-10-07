// 히어로: 물리로 굴러다니는 포도알. 빈 곳을 누르면 떨어지고, 끌어서 던질 수 있다.
(function (root) {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const rand = (a, b) => a + Math.random() * (b - a);

  // ── 포도알 ──
  const grapes = [];
  const MAX = 80;
  const GRAV = 1500;

  function spawn(x, y, vx = rand(-80, 80), vy = rand(-200, 0)) {
    grapes.push({
      x, y, vx, vy,
      r: rand(14, 26),
      gold: Math.random() < 0.2, stem: Math.random() < 0.5,
      rot: rand(-0.4, 0.4), vr: 0, alpha: 1, dying: false,
    });
    if (grapes.length > MAX) {
      const old = grapes.find((g) => !g.dying);
      if (old) old.dying = true;
    }
  }

  // ── 포인터 (드래그해서 던지기) ──
  let drag = null;
  function localPos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function pick(p) {
    for (let i = grapes.length - 1; i >= 0; i--) {
      const g = grapes[i];
      if (!g.dying && Math.hypot(g.x - p.x, g.y - p.y) < g.r + 6) return g;
    }
    return null;
  }
  canvas.addEventListener('pointerdown', (e) => {
    const p = localPos(e);
    const g = pick(p);
    if (g) {
      drag = { g, samples: [{ ...p, t: performance.now() }] };
      canvas.setPointerCapture(e.pointerId);
      Sfx.tick();
    } else {
      spawn(p.x, p.y, rand(-120, 120), rand(-260, -60));
      Sfx.pop();
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = localPos(e);
    drag.g.x = p.x; drag.g.y = p.y; drag.g.vx = 0; drag.g.vy = 0;
    drag.samples.push({ ...p, t: performance.now() });
    if (drag.samples.length > 5) drag.samples.shift();
  });
  const endDrag = () => {
    if (!drag) return;
    const a = drag.samples[0], b = drag.samples[drag.samples.length - 1];
    const dt = Math.max(16, b.t - a.t) / 1000;
    drag.g.vx = Math.max(-2600, Math.min(2600, (b.x - a.x) / dt));
    drag.g.vy = Math.max(-2600, Math.min(2600, (b.y - a.y) / dt));
    drag.g.vr = drag.g.vx * 0.004;
    if (Math.hypot(drag.g.vx, drag.g.vy) > 900) Sfx.whoosh();
    drag = null;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  function physics(dt) {
    const floor = H - 4;
    for (const g of grapes) {
      if (drag && drag.g === g) continue;
      g.vy += GRAV * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.rot += g.vr * dt;
      if (g.y + g.r > floor) {
        g.y = floor - g.r;
        if (g.vy > 0) g.vy = -g.vy * 0.45;
        if (Math.abs(g.vy) < 40) g.vy = 0;
        g.vx *= 0.985;
        g.vr = g.vx / g.r;
      }
      if (g.x - g.r < 0) { g.x = g.r; g.vx = Math.abs(g.vx) * 0.6; }
      if (g.x + g.r > W) { g.x = W - g.r; g.vx = -Math.abs(g.vx) * 0.6; }
      if (g.dying) g.alpha -= dt * 2;
    }
    // 포도끼리 부딪히기 (두 번 반복하면 쌓일 때 덜 겹친다)
    for (let it = 0; it < 2; it++) {
      for (let i = 0; i < grapes.length; i++) {
        const a = grapes[i];
        for (let j = i + 1; j < grapes.length; j++) {
          const b = grapes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const min = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, over = (min - d) / 2;
          const aFixed = drag && drag.g === a, bFixed = drag && drag.g === b;
          if (!aFixed) { a.x -= nx * over * (bFixed ? 2 : 1); a.y -= ny * over * (bFixed ? 2 : 1); }
          if (!bFixed) { b.x += nx * over * (aFixed ? 2 : 1); b.y += ny * over * (aFixed ? 2 : 1); }
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            const ma = a.r * a.r, mb = b.r * b.r;
            const j2 = (-(1 + 0.5) * rv) / (1 / ma + 1 / mb);
            if (!aFixed) { a.vx -= (j2 / ma) * nx; a.vy -= (j2 / ma) * ny; }
            if (!bFixed) { b.vx += (j2 / mb) * nx; b.vy += (j2 / mb) * ny; }
          }
        }
      }
    }
    for (let i = grapes.length - 1; i >= 0; i--) if (grapes[i].alpha <= 0) grapes.splice(i, 1);
  }

  // 단색 동그라미 + 꼭지
  function drawGrape(g) {
    const P = Theme.pal;
    ctx.save();
    ctx.globalAlpha = Math.max(0, g.alpha);
    ctx.translate(g.x, g.y);
    ctx.rotate(g.rot);
    if (g.stem) {
      ctx.strokeStyle = P.rgba(P.fg, 0.6); ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -g.r + 2); ctx.quadraticCurveTo(2, -g.r - 6, 6, -g.r - 9); ctx.stroke();
    }
    ctx.fillStyle = P.rgba(g.gold ? P.point : P.main);
    ctx.beginPath(); ctx.arc(0, 0, g.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(hero);

  let last = performance.now();
  function frame(t) {
    const dt = Math.min(0.033, (t - last) / 1000);
    last = t;
    if (visible) {
      ctx.clearRect(0, 0, W, H);
      physics(dt);
      for (const g of grapes) drawGrape(g);
    }
    requestAnimationFrame(frame);
  }

  // 첫 등장: 포도알이 후두둑
  const firstDrop = reduce ? 6 : 16;
  for (let i = 0; i < firstDrop; i++) setTimeout(() => spawn(rand(0.05, 0.95) * W, -40, rand(-60, 60), rand(0, 200)), 300 + i * 140);
  requestAnimationFrame(frame);

  root.Hero = { spawn: (x, y) => spawn(x, y) };
})(window);
