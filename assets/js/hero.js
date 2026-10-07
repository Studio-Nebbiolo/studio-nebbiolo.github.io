// 히어로: 별 + 안개(커서가 걷어냄) + 물리로 굴러다니는 포도알 + 마스코트 네비
(function (root) {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  const mascot = document.getElementById('mascot');
  const bubble = document.getElementById('bubble');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1;
  const fog = document.createElement('canvas');
  const fctx = fog.getContext('2d');
  const FOG_SCALE = 0.5; // 안개는 반 해상도로 그려도 티가 안 난다

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fog.width = Math.ceil(W * FOG_SCALE);
    fog.height = Math.ceil(H * FOG_SCALE);
  }
  resize();
  window.addEventListener('resize', resize);

  const rand = (a, b) => a + Math.random() * (b - a);

  // ── 별 ──
  const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random() * 0.75, r: rand(0.5, 1.8), p: rand(0, 6.28), s: rand(0.6, 2) }));

  // ── 안개 덩어리 ──
  const blobs = Array.from({ length: 10 }, (_, i) => ({
    bx: Math.random(), by: 0.35 + Math.random() * 0.7, r: rand(0.22, 0.42),
    sp: rand(0.03, 0.08) * (i % 2 ? 1 : -1), ph: rand(0, 6.28), ox: 0, oy: 0,
  }));

  // ── 포도알 ──
  const grapes = [];
  const MAX = 80;
  const GRAV = 1500;

  function spawn(x, y, vx = rand(-80, 80), vy = rand(-200, 0), big = false) {
    const green = Math.random() < 0.2;
    grapes.push({
      x, y, vx, vy,
      r: big ? rand(26, 34) : rand(14, 26),
      green, face: Math.random() < 0.45, stem: Math.random() < 0.5,
      rot: rand(-0.4, 0.4), vr: 0, alpha: 1, dying: false, blink: rand(2, 6),
    });
    if (grapes.length > MAX) {
      const old = grapes.find((g) => !g.dying);
      if (old) old.dying = true;
    }
  }

  // ── 포인터 (드래그해서 던지기) ──
  let mouse = { x: -9999, y: -9999, in: false };
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
    const p = localPos(e);
    mouse = { ...p, in: true };
    if (drag) {
      drag.g.x = p.x; drag.g.y = p.y; drag.g.vx = 0; drag.g.vy = 0;
      drag.samples.push({ ...p, t: performance.now() });
      if (drag.samples.length > 5) drag.samples.shift();
    }
  });
  const endDrag = () => {
    if (!drag) return;
    const a = drag.samples[0], b = drag.samples[drag.samples.length - 1];
    const dt = Math.max(16, b.t - a.t) / 1000;
    drag.g.vx = Math.max(-2600, Math.min(2600, (b.x - a.x) / dt));
    drag.g.vy = Math.max(-2600, Math.min(2600, (b.y - a.y) / dt));
    drag.g.vr = drag.g.vx * 0.004;
    drag.g.thrown = true;
    if (Math.hypot(drag.g.vx, drag.g.vy) > 900) Sfx.whoosh();
    drag = null;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  // 글자·버튼 위에 있어도 안개는 커서를 따라 걷히게 히어로 전체에서 받는다
  hero.addEventListener('pointermove', (e) => { const p = localPos(e); mouse = { ...p, in: true }; });
  hero.addEventListener('pointerleave', () => { mouse.in = false; });

  // 마스코트 몸통을 둥근 벽으로 쓴다
  function mascotCollider() {
    const r = mascot.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();
    const s = r.width / 220;
    return { x: r.left - c.left + 110 * s, y: r.top - c.top + 136 * s, r: 86 * s };
  }

  let lastOuch = 0;
  function physics(dt) {
    const floor = H - 4;
    const m = mascotCollider();
    for (const g of grapes) {
      if (drag && drag.g === g) continue;
      g.vy += GRAV * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.rot += g.vr * dt;
      if (g.y + g.r > floor) {
        g.y = floor - g.r;
        if (g.vy > 0) g.vy = -g.vy * 0.45;
        if (Math.abs(g.vy) < 40) { g.vy = 0; g.thrown = false; }
        g.vx *= 0.985;
        g.vr = g.vx / g.r;
      }
      if (g.x - g.r < 0) { g.x = g.r; g.vx = Math.abs(g.vx) * 0.6; }
      if (g.x + g.r > W) { g.x = W - g.r; g.vx = -Math.abs(g.vx) * 0.6; }
      // 마스코트에 부딪히기
      const dx = g.x - m.x, dy = g.y - m.y, d = Math.hypot(dx, dy), min = m.r + g.r;
      if (d < min && d > 0) {
        const nx = dx / d, ny = dy / d;
        g.x = m.x + nx * min; g.y = m.y + ny * min;
        const vn = g.vx * nx + g.vy * ny;
        if (vn < 0) {
          g.vx -= 1.6 * vn * nx; g.vy -= 1.6 * vn * ny;
          if (g.thrown && -vn > 500 && performance.now() - lastOuch > 1500) {
            lastOuch = performance.now();
            Nebbi.react('ouch');
          }
        }
      }
      if (g.dying) g.alpha -= dt * 2;
    }
    // 포도끼리 부딪히기 (몇 번 반복하면 쌓일 때 덜 겹친다)
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

  function drawGrape(g, t) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, g.alpha);
    ctx.translate(g.x, g.y);
    ctx.rotate(g.rot);
    const r = g.r;
    const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
    if (g.green) { grad.addColorStop(0, '#e9ffd0'); grad.addColorStop(0.45, '#9be15d'); grad.addColorStop(1, '#3f8f2a'); }
    else { grad.addColorStop(0, '#e2d0ff'); grad.addColorStop(0.45, '#8b5cf6'); grad.addColorStop(1, '#40167a'); }
    if (g.stem) {
      ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -r + 2); ctx.quadraticCurveTo(2, -r - 6, 6, -r - 9); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#1b1027'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.13, -0.6, 0, Math.PI * 2); ctx.fill();
    if (g.face && r > 15) {
      const blink = ((t / 1000 + g.blink) % 4) < 0.12;
      ctx.fillStyle = '#1b1027';
      const ex = r * 0.3, ey = r * 0.05;
      if (blink) {
        ctx.fillRect(-ex - 3, ey - 1, 6, 2.2); ctx.fillRect(ex - 3, ey - 1, 6, 2.2);
      } else {
        ctx.beginPath(); ctx.arc(-ex, ey, r * 0.11 + 1, 0, 7); ctx.arc(ex, ey, r * 0.11 + 1, 0, 7); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,143,171,.8)';
      ctx.beginPath(); ctx.ellipse(-ex - 3, ey + r * 0.28, r * 0.13, r * 0.08, 0, 0, 7); ctx.ellipse(ex + 3, ey + r * 0.28, r * 0.13, r * 0.08, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  function drawFog(t) {
    const fw = fog.width, fh = fog.height;
    fctx.clearRect(0, 0, fw, fh);
    fctx.globalCompositeOperation = 'source-over';
    const mx = mouse.x * FOG_SCALE, my = mouse.y * FOG_SCALE;
    for (const b of blobs) {
      let x = ((b.bx + Math.sin(t * 0.0001 * 6.28 * b.sp * 10 + b.ph) * 0.12 + 1) % 1) * fw;
      let y = (b.by + Math.cos(t * 0.00013 + b.ph) * 0.04) * fh;
      // 커서 가까운 안개는 밀려난다
      let tx = 0, ty = 0;
      if (mouse.in) {
        const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy) || 1;
        const reach = 260 * FOG_SCALE;
        if (d < reach + b.r * fw * 0.5) { const k = (1 - d / (reach + b.r * fw * 0.5)) * 90 * FOG_SCALE; tx = (dx / d) * k; ty = (dy / d) * k; }
      }
      b.ox += (tx - b.ox) * 0.06; b.oy += (ty - b.oy) * 0.06;
      x += b.ox; y += b.oy;
      const r = b.r * Math.max(fw, fh);
      const g = fctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(226,210,255,0.26)');
      g.addColorStop(0.5, 'rgba(200,180,240,0.10)');
      g.addColorStop(1, 'rgba(200,180,240,0)');
      fctx.fillStyle = g;
      fctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    if (mouse.in) {
      fctx.globalCompositeOperation = 'destination-out';
      const r = 150 * FOG_SCALE;
      const g = fctx.createRadialGradient(mx, my, 0, mx, my, r);
      g.addColorStop(0, 'rgba(0,0,0,0.9)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      fctx.fillStyle = g;
      fctx.fillRect(mx - r, my - r, r * 2, r * 2);
    }
    ctx.drawImage(fog, 0, 0, W, H);
  }

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(hero);

  let last = performance.now();
  function frame(t) {
    const dt = Math.min(0.033, (t - last) / 1000);
    last = t;
    if (visible) {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.001 * s.s + s.p));
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      drawFog(t);
      physics(dt);
      for (const g of grapes) drawGrape(g, t);
    }
    requestAnimationFrame(frame);
  }

  // 첫 등장: 포도알이 후두둑
  const firstDrop = reduce ? 6 : 16;
  for (let i = 0; i < firstDrop; i++) setTimeout(() => spawn(rand(0.05, 0.95) * W, -40, rand(-60, 60), rand(0, 200)), 300 + i * 140);
  requestAnimationFrame(frame);

  // ───────── 마스코트 네비 ─────────
  const pupils = [...mascot.querySelectorAll('.pupil')];
  const eyeCenters = [{ x: 80, y: 134 }, { x: 140, y: 134 }];
  window.addEventListener('pointermove', (e) => {
    const r = mascot.getBoundingClientRect();
    const s = r.width / 220;
    pupils.forEach((p, i) => {
      const cx = r.left + eyeCenters[i].x * s, cy = r.top + eyeCenters[i].y * s;
      const a = Math.atan2(e.clientY - cy, e.clientX - cx);
      const d = Math.min(7, Math.hypot(e.clientX - cx, e.clientY - cy) / 30);
      p.setAttribute('transform', `translate(${Math.cos(a) * d} ${Math.sin(a) * d})`);
    });
  });

  (function blinkLoop() {
    mascot.classList.add('blink');
    setTimeout(() => mascot.classList.remove('blink'), 130);
    setTimeout(blinkLoop, rand(2200, 5200));
  })();

  let bubbleTimer = 0;
  function say(text, ms = 2400) {
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }

  let clicks = [];
  let dizzy = false;
  let lineIdx = 0;
  mascot.addEventListener('click', () => {
    mascot.classList.remove('squish');
    void mascot.offsetWidth;
    mascot.classList.add('squish');
    Sfx.boing();
    const now = performance.now();
    clicks = clicks.filter((c) => now - c < 2500);
    clicks.push(now);
    // 포도알을 머리 위로 뿜어낸다
    const m = mascotCollider();
    for (let i = 0; i < 3; i++) spawn(m.x + rand(-30, 30), m.y - m.r - 20, rand(-420, 420), rand(-900, -500));
    if (clicks.length >= 7 && !dizzy) {
      dizzy = true;
      mascot.classList.add('dizzy');
      say(I18n.t('nebbi.dizzy'), 2200);
      setTimeout(() => { dizzy = false; mascot.classList.remove('dizzy'); clicks = []; }, 2200);
      return;
    }
    if (!dizzy) {
      const lines = I18n.t('nebbi.lines');
      lineIdx = (lineIdx + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length;
      say(lines[lineIdx]);
    }
  });

  const Nebbi = {
    say,
    react(kind) {
      if (kind === 'ouch' && !dizzy) {
        mascot.classList.remove('squish'); void mascot.offsetWidth; mascot.classList.add('squish');
        say(I18n.t('nebbi.ouch'), 1400);
      }
    },
  };
  setTimeout(() => say(I18n.t('nebbi.hello'), 3200), 900);

  root.Hero = { spawn: (x, y) => spawn(x, y) };
  root.Nebbi = Nebbi;
})(window);
