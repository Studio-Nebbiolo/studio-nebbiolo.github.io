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
      if (window.Sparks) window.Sparks(r.left + r.width * 0.7, r.top + r.height / 2, 18);
    }

    function draw(t) {
      const P = Theme.pal;
      ctx.clearRect(0, 0, W, H);
      const top = cy - laneH / 2;
      // 거터
      ctx.fillStyle = P.mix(P.base, P.fg, P.dark ? 0.1 : 0.07); ctx.fillRect(0, top - 26, W, laneH + 52);
      // 레인: 포인트(골드)를 옅게 깐 판
      ctx.fillStyle = P.mix(P.base, P.point, P.dark ? 0.22 : 0.3); ctx.fillRect(0, top, W, laneH);
      ctx.strokeStyle = P.rgba(P.fg, 0.06); ctx.lineWidth = 1;
      for (let y = top + 12; y < top + laneH; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // 화살표 표시
      ctx.fillStyle = P.rgba(P.main, 0.35);
      for (let i = -2; i <= 2; i++) {
        const x = W * 0.42 + Math.abs(i) * 16, y = cy + i * (laneH / 6);
        ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.fill();
      }
      // 핀: 밝은 몸통 + 메인 띠
      for (const p of pins) {
        if (!p.a) continue;
        ctx.save(); ctx.translate(p.x, p.y);
        if (p.down) {
          ctx.rotate(p.rot); ctx.globalAlpha = 0.7;
          ctx.fillStyle = P.rgba(P.light);
          ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.9, p.r * 0.85, 0, 0, 7); ctx.fill();
          ctx.fillStyle = P.rgba(P.main); ctx.fillRect(-p.r * 0.6, -p.r * 0.8, 3, p.r * 1.6);
        } else {
          ctx.fillStyle = P.rgba(P.ink, 0.15); ctx.beginPath(); ctx.ellipse(2, 3, p.r, p.r * 0.8, 0, 0, 7); ctx.fill();
          ctx.fillStyle = P.rgba(P.light);
          ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 7); ctx.fill();
          ctx.strokeStyle = P.rgba(P.main); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, p.r * 0.55, 0, 7); ctx.stroke();
        }
        ctx.restore();
      }
      // 조준선: 세게 당길수록 진해진다
      if (aim) {
        const dx = ball.x - aim.x, dy = ball.y - aim.y, d = Math.hypot(dx, dy) || 1, pow = Math.min(1, d / 160);
        ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t / 30;
        ctx.strokeStyle = P.rgba(P.main, 0.35 + pow * 0.65); ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ball.x + (dx / d) * (60 + pow * 220), ball.y + (dy / d) * (60 + pow * 220)); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = P.rgba(P.fg, 0.25); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(aim.x, aim.y); ctx.stroke();
      }
      // 공: 메인 색
      ctx.save(); ctx.translate(ball.x, ball.y);
      ctx.fillStyle = P.rgba(P.ink, 0.18); ctx.beginPath(); ctx.ellipse(2, 4, ball.r, ball.r * 0.8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = P.rgba(P.main);
      ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, 7); ctx.fill();
      ctx.rotate(ball.x / ball.r);
      ctx.fillStyle = P.mix(P.main, P.ink, 0.6);
      [[-3, -4], [3, -4], [0, 3]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); });
      ctx.restore();
      // 처음 안내
      if (state === 'ready' && !aim) {
        const k = (Math.sin(t / 300) + 1) / 2;
        ctx.strokeStyle = P.rgba(P.main, 0.2 + k * 0.4); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r + 8 + k * 6, 0, 7); ctx.stroke();
      }
      if (state === 'done' && msg) {
        msgT += 1 / 60;
        const s = Math.min(1, msgT * 4);
        ctx.save(); ctx.translate(W / 2, cy); ctx.scale(0.6 + s * 0.4, 0.6 + s * 0.4);
        ctx.font = `800 ${Math.min(56, W / 10)}px ${getComputedStyle(document.body).fontFamily}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = P.dark ? P.mix(P.main, P.light, 0.5) : P.rgba(P.main);
        ctx.fillText(msg, 0, 0);
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
    // 품질이 높을수록 진하게: 회색 → 글자색 → 메인 → 포인트
    const QCOLOR = ['var(--muted)', 'var(--fg)', 'var(--main-ink)', 'var(--point)', 'var(--point)'];
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
      f.className = 'floaty'; f.textContent = text; f.style.color = color || 'var(--main-ink)';
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
          if (q >= 3 && window.Sparks) { const b = el.getBoundingClientRect(); window.Sparks(b.left + b.width / 2, b.top, 12); }
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
        bits(['#E8B84A', '#7B1E4B', '#FBF8F4'], 14);
        Sfx.gem();
        rock.style.backgroundPosition = `${(ores % 4) * 33.333}% 0`;
        const f = document.createElement('span');
        f.className = 'floaty'; f.textContent = I18n.t('mine.ore'); f.style.color = 'var(--point)'; f.style.top = '40%'; f.style.textShadow = '0 2px 0 rgba(0,0,0,.6)';
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
    let round = 1, inView = false, timer = 0;
    function next(manual) {
      round = round >= 11 ? 1 : round + 1;
      const boxing = round % 2 === 0;
      imgs[0].classList.toggle('on', !boxing);
      imgs[1].classList.toggle('on', boxing);
      roundEl.textContent = 'ROUND ' + round;
      kindEl.textContent = boxing ? 'BOXING' : 'CHESS';
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
      if (Math.random() < 0.08 && window.Sparks) { const r = b.getBoundingClientRect(); window.Sparks(r.left + r.width / 2, r.top + r.height / 2, 8); }
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
    // 몸통은 메인(와인) 또는 포인트(골드) 포도알. 얼굴은 몸통 위에서 잘 보이는 쪽으로.
    const LOOKS = [
      { body: 'var(--main)', face: '#FBF8F4', acc: 'glasses' },
      { body: 'var(--point)', face: '#141012', acc: 'beret' },
      { body: 'var(--main)', face: '#FBF8F4', acc: 'phones' },
      { body: 'var(--point)', face: '#141012', acc: 'none' },
    ];
    const ACC = {
      glasses: (f) => `<g fill="none" stroke="${f}" stroke-width="2.5"><circle cx="45" cy="70" r="11"/><circle cx="75" cy="70" r="11"/><path d="M56 70h8"/></g>`,
      beret: () => '<path d="M28 40 C32 16 90 14 94 38 C78 32 44 32 28 40Z" style="fill: var(--main)"/><circle cx="62" cy="18" r="4" style="fill: var(--main)"/>',
      phones: () => '<path d="M22 66 C18 18 102 18 98 66" fill="none" style="stroke: var(--fg)" stroke-width="5"/><rect x="12" y="58" width="16" height="24" rx="6" style="fill: var(--point)"/><rect x="92" y="58" width="16" height="24" rx="6" style="fill: var(--point)"/>',
      none: () => '',
    };
    function svg(l) {
      const blush = l.face === '#FBF8F4' ? 'var(--point)' : 'var(--main)';
      return `<svg viewBox="0 0 120 130" aria-hidden="true">
        <ellipse cx="60" cy="124" rx="34" ry="5" style="fill: var(--fg)" opacity=".08"/>
        <g class="m-b"><path d="M60 26 C60 16 64 10 70 6" style="stroke: var(--fg)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="60" cy="74" r="46" style="fill: ${l.body}"/>
        <circle cx="45" cy="70" r="4.5" fill="${l.face}"/><circle cx="75" cy="70" r="4.5" fill="${l.face}"/>
        <ellipse cx="36" cy="86" rx="7" ry="4.5" style="fill: ${blush}" opacity=".5"/><ellipse cx="84" cy="86" rx="7" ry="4.5" style="fill: ${blush}" opacity=".5"/>
        <path d="M54 88 Q60 93 66 88" stroke="${l.face}" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${ACC[l.acc](l.face)}</g></svg>`;
    }
    function render() {
      const team = I18n.t('team');
      box.innerHTML = '';
      team.forEach((m, i) => {
        const l = LOOKS[i % LOOKS.length];
        const el = document.createElement('button');
        el.className = 'member reveal in';
        el.innerHTML = `<span class="say">${m.say}</span>${svg(l)}<h4></h4><p class="role"></p>`;
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
