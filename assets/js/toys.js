// 게임 카드마다 붙은 장난감들 + 실험실 뽁뽁이 + 팀원 카드
(function () {
  const rand = (a, b) => a + Math.random() * (b - a);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  function whenVisible(el, cb) {
    const io = new IntersectionObserver((es) => cb(es[0].isIntersecting), { threshold: 0.1 });
    io.observe(el);
  }

  // ───────────────── 🎳 미니 볼링 (Strike-Strike 2) ─────────────────
  (function bowling() {
    const cv = document.getElementById('bowlCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const scoreEl = document.getElementById('bowlScore');
    let W = 0, H = 0, cy = 0, laneH = 0;
    let ball, pins, state, aim, msg, msgT, settle, visible = false;

    function size() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cy = H / 2; laneH = H - 64;
    }
    function reset() {
      size();
      ball = { x: Math.min(90, W * 0.14), y: cy, vx: 0, vy: 0, r: 13, m: 5, gutter: false };
      pins = [];
      const sp = Math.min(26, laneH / 4.6);
      const x0 = W - Math.min(170, W * 0.3);
      for (let k = 0; k < 4; k++) for (let i = 0; i <= k; i++) {
        pins.push({ x: x0 + k * sp * 0.9, y: cy + (i - k / 2) * sp, vx: 0, vy: 0, r: 8.5, m: 1, down: false, rot: 0, a: 1 });
      }
      state = 'ready'; aim = null; settle = 0;
      scoreEl.textContent = '0 / 10';
    }
    const local = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left - cv.clientLeft, y: e.clientY - r.top - cv.clientTop }; };
    cv.addEventListener('pointerdown', (e) => {
      if (state !== 'ready') return;
      const p = local(e);
      if (Math.hypot(p.x - ball.x, p.y - ball.y) > 70) return;
      aim = p; cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', (e) => { if (aim) aim = local(e); });
    cv.addEventListener('pointerup', () => {
      if (!aim) return;
      const dx = ball.x - aim.x, dy = ball.y - aim.y, d = Math.hypot(dx, dy);
      aim = null;
      if (d < 12) return;
      const pow = Math.min(1500, d * 9);
      ball.vx = (dx / d) * pow; ball.vy = (dy / d) * pow;
      state = 'rolling';
      Sfx.roll();
    });

    function collide(a, b) {
      const dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r, d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) return 0;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, over = min - d;
      const tm = a.m + b.m;
      a.x -= nx * over * (b.m / tm); a.y -= ny * over * (b.m / tm);
      b.x += nx * over * (a.m / tm); b.y += ny * over * (a.m / tm);
      const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rv >= 0) return 0;
      const j = (-(1 + 0.8) * rv) / (1 / a.m + 1 / b.m);
      a.vx -= (j / a.m) * nx; a.vy -= (j / a.m) * ny;
      b.vx += (j / b.m) * nx; b.vy += (j / b.m) * ny;
      // 옆으로 튀는 맛을 조금 더한다
      b.vy += rand(-60, 60);
      return -rv;
    }

    function step(dt) {
      if (state !== 'rolling') return;
      const top = cy - laneH / 2, bot = cy + laneH / 2;
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      ball.vx *= 1 - 0.25 * dt; ball.vy *= 1 - 0.25 * dt;
      if (!ball.gutter && (ball.y < top || ball.y > bot)) {
        ball.gutter = true; ball.vy = 0; ball.y = ball.y < top ? top - 14 : bot + 14;
      }
      let hits = 0;
      for (const p of pins) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 1 - 1.6 * dt; p.vy *= 1 - 1.6 * dt;
        p.rot += Math.hypot(p.vx, p.vy) * dt * 0.05;
        if (!ball.gutter) { const h = collide(ball, p); if (h > 30) hits++; }
        if (!p.down && Math.hypot(p.vx, p.vy) > 70) p.down = true;
        if (p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) p.a = 0;
      }
      for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) if (collide(pins[i], pins[j]) > 80) hits++;
      if (hits) Sfx.crash(hits);
      const down = pins.filter((p) => p.down).length;
      scoreEl.textContent = down + ' / 10';
      const moving = Math.hypot(ball.vx, ball.vy) > 20 && ball.x < W + 30 || pins.some((p) => p.a && Math.hypot(p.vx, p.vy) > 8);
      settle = moving ? 0 : settle + dt;
      if (ball.x > W + 30 || settle > 0.5) {
        state = 'done';
        if (down === 10) { msg = I18n.t('bowl.strike'); Sfx.strike(); burst(); }
        else if (down === 0 && ball.gutter) msg = I18n.t('bowl.gutter');
        else msg = I18n.t('bowl.spare', { n: down });
        msgT = 0;
        setTimeout(reset, 2000);
      }
    }
    function burst() {
      const r = cv.getBoundingClientRect();
      if (window.Sparks) window.Sparks(r.left + r.width * 0.7, r.top + r.height / 2, 22, ['⭐', '🎳', '✨', '💥']);
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      const top = cy - laneH / 2;
      // 거터
      ctx.fillStyle = '#1a2338'; ctx.fillRect(0, top - 26, W, laneH + 52);
      // 레인 (나무)
      const g = ctx.createLinearGradient(0, top, 0, top + laneH);
      g.addColorStop(0, '#e9b46f'); g.addColorStop(0.5, '#f4c98a'); g.addColorStop(1, '#dca35c');
      ctx.fillStyle = g; ctx.fillRect(0, top, W, laneH);
      ctx.strokeStyle = 'rgba(120,70,20,.18)'; ctx.lineWidth = 1;
      for (let y = top + 12; y < top + laneH; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // 화살표 표시
      ctx.fillStyle = 'rgba(120,60,10,.35)';
      for (let i = -2; i <= 2; i++) {
        const x = W * 0.42 + Math.abs(i) * 16, y = cy + i * (laneH / 6);
        ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.fill();
      }
      // 핀
      for (const p of pins) {
        if (!p.a) continue;
        ctx.save(); ctx.translate(p.x, p.y);
        if (p.down) {
          ctx.rotate(p.rot); ctx.globalAlpha = 0.85;
          ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b1027'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.9, p.r * 0.85, 0, 0, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#e63946'; ctx.fillRect(-p.r * 0.6, -p.r * 0.8, 3, p.r * 1.6);
        } else {
          ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(3, 4, p.r, p.r * 0.8, 0, 0, 7); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1b1027'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 7); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#e63946'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.55, 0, 7); ctx.stroke();
        }
        ctx.restore();
      }
      // 조준선
      if (aim) {
        const dx = ball.x - aim.x, dy = ball.y - aim.y, d = Math.hypot(dx, dy) || 1, pow = Math.min(1, d / 160);
        ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t / 30;
        ctx.strokeStyle = `hsl(${40 - pow * 40}, 95%, 60%)`; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ball.x + (dx / d) * (60 + pow * 220), ball.y + (dy / d) * (60 + pow * 220)); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(aim.x, aim.y); ctx.stroke();
      }
      // 공
      ctx.save(); ctx.translate(ball.x, ball.y);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(3, 5, ball.r, ball.r * 0.8, 0, 0, 7); ctx.fill();
      const bg = ctx.createRadialGradient(-4, -5, 2, 0, 0, ball.r);
      bg.addColorStop(0, '#5b6b9a'); bg.addColorStop(1, '#141b2e');
      ctx.fillStyle = bg; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, 7); ctx.fill(); ctx.stroke();
      ctx.rotate(ball.x / ball.r);
      ctx.fillStyle = '#0a0d16';
      [[-3, -4], [3, -4], [0, 3]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); });
      ctx.restore();
      // 처음 안내
      if (state === 'ready' && !aim) {
        const k = (Math.sin(t / 300) + 1) / 2;
        ctx.strokeStyle = `rgba(242,180,90,${0.4 + k * 0.5})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r + 8 + k * 6, 0, 7); ctx.stroke();
      }
      if (state === 'done' && msg) {
        msgT += 1 / 60;
        const s = Math.min(1, msgT * 4);
        ctx.save(); ctx.translate(W / 2, cy); ctx.scale(0.5 + s * 0.5, 0.5 + s * 0.5); ctx.rotate(-0.05);
        ctx.font = `400 ${Math.min(64, W / 9)}px 'Bagel Fat One', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 8; ctx.strokeStyle = '#1b1027'; ctx.strokeText(msg, 0, 0);
        ctx.fillStyle = '#ffd166'; ctx.fillText(msg, 0, 0);
        ctx.restore();
      }
    }

    reset();
    window.addEventListener('resize', () => { if (state === 'ready') reset(); else size(); });
    whenVisible(cv, (v) => { visible = v; });
    let last = performance.now();
    (function loop(t) {
      const dt = Math.min(0.033, (t - last) / 1000); last = t;
      if (visible) { step(dt); draw(t); }
      requestAnimationFrame(loop);
    })(last);
  })();

  // ───────────────── 🌱 미니 텃밭 (Farm Idler) ─────────────────
  (function farm() {
    const box = document.getElementById('plots');
    if (!box) return;
    const goldEl = document.getElementById('farmGold');
    const CROPS = ['🥕', '🥔', '🧅', '🍓', '🍅', '🍆', '🌾', '🥬', '🫛', '🌽', '🎃'];
    const QMULT = [1, 1.6, 3, 7, 20];
    const QCOLOR = ['#6d5d7c', '#2f8cff', '#9b51e0', '#f2994a', '#eb5757'];
    let gold = store.get('nb.farmGold', 0);
    goldEl.textContent = gold;
    const ICON = ['🌿', '', '·', '💧', '🌱', '🌿'];

    function render(el) {
      const s = +el.dataset.s;
      const ico = s === 6 ? CROPS[+el.dataset.c] : ICON[s];
      el.innerHTML = `<span class="crop">${ico}</span>`;
      el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    }
    function floaty(el, text, color) {
      const f = document.createElement('span');
      f.className = 'floaty'; f.textContent = text; f.style.color = color || '#3d8b2f';
      el.appendChild(f);
      setTimeout(() => f.remove(), 1000);
    }
    function grow(el) {
      setTimeout(() => { el.dataset.s = 4; render(el); }, 900);
      setTimeout(() => { el.dataset.s = 5; render(el); }, 2000);
      setTimeout(() => { el.dataset.s = 6; render(el); Sfx.tick(); }, 3200);
    }
    for (let i = 0; i < 8; i++) {
      const el = document.createElement('button');
      el.className = 'plot'; el.dataset.s = 0;
      el.setAttribute('aria-label', 'plot');
      render(el);
      el.addEventListener('click', () => {
        const s = +el.dataset.s;
        if (s === 0) { el.dataset.s = 1; Sfx.dig(); }
        else if (s === 1) { el.dataset.s = 2; el.dataset.c = Math.floor(Math.random() * CROPS.length); Sfx.tick(); }
        else if (s === 2) { el.dataset.s = 3; Sfx.pop(); grow(el); }
        else if (s === 6) {
          const r = Math.random();
          const q = r < 0.5 ? 0 : r < 0.78 ? 1 : r < 0.92 ? 2 : r < 0.98 ? 3 : 4;
          const g = Math.round((6 + +el.dataset.c * 4) * QMULT[q]);
          gold += g; goldEl.textContent = gold; store.set('nb.farmGold', gold);
          floaty(el, `+${g}G ${I18n.t('farm.q')[q]}`, QCOLOR[q]);
          Sfx.coin();
          if (q >= 3 && window.Sparks) { const b = el.getBoundingClientRect(); window.Sparks(b.left + b.width / 2, b.top, 14, ['✨', '⭐', CROPS[+el.dataset.c]]); }
          el.dataset.s = 1;
        } else return;
        render(el);
      });
      box.appendChild(el);
    }
  })();

  // ───────────────── ⛏ 곡괭이질 (Miner Idler) ─────────────────
  (function mine() {
    const mineEl = document.getElementById('mine');
    if (!mineEl) return;
    const rock = document.getElementById('rock');
    const swingsEl = document.getElementById('swings');
    const oresEl = document.getElementById('ores');
    let swings = 0, ores = store.get('nb.ores', 0), inView = false;
    oresEl.textContent = ores;
    rock.style.backgroundPosition = `${(ores % 4) * 33.333}% 0`;

    function bits(colors, n) {
      const rr = rock.getBoundingClientRect(), mr = mineEl.getBoundingClientRect();
      for (let i = 0; i < n; i++) {
        const b = document.createElement('i');
        b.className = 'ore';
        b.style.left = rr.left - mr.left + rr.width / 2 + 'px';
        b.style.top = rr.top - mr.top + rr.height / 2 + 'px';
        b.style.background = colors[i % colors.length];
        b.style.setProperty('--dx', rand(-90, 90) + 'px');
        b.style.setProperty('--dy', rand(-110, -20) + 'px');
        mineEl.appendChild(b);
        setTimeout(() => b.remove(), 700);
      }
    }
    function swing() {
      rock.classList.remove('hit'); void rock.offsetWidth; rock.classList.add('hit');
      swings++;
      Sfx.dig();
      bits(['#8a8a8a', '#bdbdbd', '#5e5e5e'], 3);
      if (swings >= 10) {
        swings = 0; ores++;
        oresEl.textContent = ores; store.set('nb.ores', ores);
        bits(['#5ee6b8', '#7cc6ff', '#ff8fab', '#ffd166', '#b892ff'], 14);
        Sfx.gem();
        rock.style.backgroundPosition = `${(ores % 4) * 33.333}% 0`;
        const f = document.createElement('span');
        f.className = 'floaty'; f.textContent = I18n.t('mine.ore'); f.style.color = '#ffd166'; f.style.top = '40%'; f.style.textShadow = '0 2px 0 #000';
        mineEl.appendChild(f); setTimeout(() => f.remove(), 1000);
      }
      swingsEl.textContent = swings;
    }
    mineEl.addEventListener('pointerdown', swing);
    mineEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swing(); } });
    // 게임처럼, 광산이 보이는 동안엔 타자를 칠 때마다 곡괭이질
    whenVisible(mineEl, (v) => { inView = v; });
    window.addEventListener('keydown', (e) => {
      if (!inView || e.repeat || e.target.closest('input, textarea, [contenteditable]')) return;
      if (e.target === mineEl && (e.key === 'Enter' || e.key === ' ')) return; // 위의 keydown 이 이미 처리
      if (e.key.length === 1) swing();
    });
  })();

  // ───────────────── ♟🥊 체스복싱 라운드 전환 ─────────────────
  (function chessboxing() {
    const stage = document.getElementById('cbStage');
    if (!stage) return;
    const imgs = stage.querySelectorAll('.cb-img');
    const roundEl = document.getElementById('cbRound');
    const kindEl = document.getElementById('cbKind');
    const bell = document.getElementById('cbBell');
    let round = 1, inView = false, timer = 0;
    function next(manual) {
      round = round >= 11 ? 1 : round + 1;
      const boxing = round % 2 === 0;
      imgs[0].classList.toggle('on', !boxing);
      imgs[1].classList.toggle('on', boxing);
      roundEl.textContent = 'ROUND ' + round;
      kindEl.textContent = boxing ? '🥊 BOXING' : '♟ CHESS';
      bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring');
      if (manual) Sfx.bell();
    }
    function schedule() { clearInterval(timer); timer = setInterval(() => inView && next(false), 3800); }
    stage.addEventListener('click', () => { next(true); schedule(); });
    stage.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(true); schedule(); } });
    whenVisible(stage, (v) => { inView = v; });
    schedule();
  })();

  // ───────────────── 🫧 포도 뽁뽁이 ─────────────────
  (function bubbleWrap() {
    const box = document.getElementById('bubbles');
    if (!box) return;
    const countEl = document.getElementById('popCount');
    let count = store.get('nb.pops', 0);
    countEl.textContent = count;
    let down = false;

    function build() {
      box.innerHTML = '';
      const n = matchMedia('(max-width: 900px)').matches ? 36 : 40;
      for (let i = 0; i < n; i++) {
        const b = document.createElement('button');
        b.className = 'bub regrow' + (Math.random() < 0.18 ? ' alt' : '');
        b.style.animationDelay = (i % 10) * 25 + Math.floor(i / 10) * 40 + 'ms';
        b.setAttribute('aria-label', 'grape');
        box.appendChild(b);
      }
    }
    function pop(b) {
      if (!b || !b.classList.contains('bub') || b.classList.contains('popped')) return;
      b.classList.add('popped');
      b.classList.remove('regrow');
      count++; countEl.textContent = count; store.set('nb.pops', count);
      Sfx.pop();
      if (Math.random() < 0.08 && window.Sparks) { const r = b.getBoundingClientRect(); window.Sparks(r.left + r.width / 2, r.top + r.height / 2, 8, ['✨', '🍇', '💜']); }
      if (!box.querySelector('.bub:not(.popped)')) setTimeout(build, 600);
    }
    box.addEventListener('pointerdown', (e) => { down = true; pop(e.target.closest('.bub')); });
    window.addEventListener('pointerup', () => { down = false; });
    box.addEventListener('pointermove', (e) => {
      if (!down) return;
      pop(document.elementFromPoint(e.clientX, e.clientY)?.closest('.bub'));
    });
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pop(e.target.closest('.bub')); } });
    document.getElementById('btnRefill').addEventListener('click', () => { build(); Sfx.boing(); });
    build();
  })();

  // ───────────────── 🍇 팀원 카드 ─────────────────
  (function team() {
    const box = document.getElementById('team');
    if (!box) return;
    const LOOKS = [
      { c1: '#c7a4ff', c2: '#7c3aed', acc: 'glasses', r: '-3deg' },
      { c1: '#ffc2d9', c2: '#e05780', acc: 'beret', r: '2deg' },
      { c1: '#b8f5dc', c2: '#22a06b', acc: 'phones', r: '-2deg' },
      { c1: '#ffe3a3', c2: '#e0a100', acc: 'none', r: '3deg' },
    ];
    const ACC = {
      glasses: '<g fill="none" stroke="#1b1027" stroke-width="3.5"><circle cx="45" cy="70" r="12"/><circle cx="75" cy="70" r="12"/><path d="M57 70h6"/></g>',
      beret: '<path d="M26 38 C30 14 92 12 96 36 C80 30 44 30 26 38Z" fill="#e63946" stroke="#1b1027" stroke-width="3.5"/><circle cx="62" cy="16" r="4" fill="#1b1027"/>',
      phones: '<path d="M22 66 C18 18 102 18 98 66" fill="none" stroke="#1b1027" stroke-width="6"/><rect x="12" y="58" width="16" height="24" rx="6" fill="#ffd166" stroke="#1b1027" stroke-width="3.5"/><rect x="92" y="58" width="16" height="24" rx="6" fill="#ffd166" stroke="#1b1027" stroke-width="3.5"/>',
      none: '',
    };
    function svg(l, i) {
      return `<svg viewBox="0 0 120 130" aria-hidden="true"><defs><radialGradient id="tm${i}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${l.c1}"/><stop offset="1" stop-color="${l.c2}"/></radialGradient></defs>
        <ellipse cx="60" cy="124" rx="34" ry="5" fill="#000" opacity=".15"/>
        <g class="m-b"><path d="M60 26 C60 16 64 10 70 6" stroke="#6b4423" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="60" cy="74" r="46" fill="url(#tm${i})" stroke="#1b1027" stroke-width="4"/>
        <circle cx="45" cy="70" r="5" fill="#1b1027"/><circle cx="75" cy="70" r="5" fill="#1b1027"/>
        <ellipse cx="36" cy="86" rx="7" ry="4.5" fill="#ff8fab" opacity=".8"/><ellipse cx="84" cy="86" rx="7" ry="4.5" fill="#ff8fab" opacity=".8"/>
        <path d="M54 88 Q60 94 66 88" stroke="#1b1027" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        ${ACC[l.acc]}</g></svg>`;
    }
    function render() {
      const team = I18n.t('team');
      box.innerHTML = '';
      team.forEach((m, i) => {
        const l = LOOKS[i % LOOKS.length];
        const el = document.createElement('button');
        el.className = 'member reveal in';
        el.style.setProperty('--r', l.r);
        el.innerHTML = `<span class="say">${m.say}</span>${svg(l, i)}<h4></h4><p class="role"></p>`;
        el.querySelector('h4').textContent = m.name;
        el.querySelector('.role').textContent = m.role;
        el.addEventListener('click', () => {
          el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing');
          const s = el.querySelector('.say');
          s.classList.add('show'); Sfx.boing();
          clearTimeout(el._t); el._t = setTimeout(() => s.classList.remove('show'), 1800);
        });
        box.appendChild(el);
      });
    }
    render();
    I18n.onChange(render);
  })();
})();
