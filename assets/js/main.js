// 페이지 전체: 내비, 언어, 글자 쪼개기, 스크롤 연출, 커서, 반짝이, 모달, Big Walk 친구들, 이스터에그
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  $('#year').textContent = new Date().getFullYear();

  // ── 글자 하나하나 통통 튀게 ──
  function split(el) {
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      s.style.setProperty('--i', i);
      el.appendChild(s);
    });
  }
  function jump(ch) {
    ch.classList.remove('jump'); void ch.offsetWidth; ch.classList.add('jump');
  }
  document.addEventListener('pointerover', (e) => {
    const ch = e.target.closest && e.target.closest('[data-split] .ch');
    if (ch && !ch.classList.contains('jump')) { jump(ch); Sfx.tick(); }
  });
  document.addEventListener('animationend', (e) => { if (e.target.classList && e.target.classList.contains('ch')) e.target.classList.remove('jump'); });
  function splitAll() {
    $$('[data-split]').forEach(split);
  }

  // ── 언어 ──
  const btnLang = $('#btnLang');
  function onLang(lang) {
    btnLang.textContent = lang === 'en' ? '한' : 'EN';
    btnLang.title = lang === 'en' ? '한국어로 보기' : 'View in English';
    splitAll();
    updateWalkBtn();
  }
  I18n.onChange(onLang);
  btnLang.addEventListener('click', () => { I18n.apply(I18n.lang === 'en' ? 'ko' : 'en'); Sfx.boing(); });

  // 단색 선 아이콘 (currentColor 를 따라 테마에 맞춰진다)
  const ICON = {
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    soundOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  };

  // ── 라이트/다크 ──
  const btnTheme = $('#btnTheme');
  function syncTheme() {
    const dark = Theme.mode === 'dark';
    btnTheme.innerHTML = dark ? ICON.sun : ICON.moon;
    const label = I18n.lang === 'en' ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : (dark ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기');
    btnTheme.setAttribute('aria-label', label);
    btnTheme.title = label;
  }
  btnTheme.addEventListener('click', () => { Theme.toggle(); Sfx.tick(); });
  Theme.onChange(syncTheme);
  I18n.onChange(syncTheme);
  syncTheme();

  // ── 소리 ──
  const btnSound = $('#btnSound');
  function syncSound() {
    btnSound.innerHTML = Sfx.on ? ICON.soundOn : ICON.soundOff;
    btnSound.setAttribute('aria-pressed', Sfx.on);
    btnSound.setAttribute('aria-label', Sfx.on ? '소리 끄기' : '소리 켜기');
  }
  btnSound.addEventListener('click', () => { Sfx.on = !Sfx.on; syncSound(); Sfx.pop(); });
  syncSound();

  // ── 모바일 메뉴 ──
  const links = $('#links');
  const btnMenu = $('#btnMenu');
  btnMenu.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btnMenu.setAttribute('aria-expanded', open);
    btnMenu.innerHTML = open ? ICON.close : ICON.menu;
  });
  $$('a', links).forEach((a) => a.addEventListener('click', () => {
    links.classList.remove('open'); btnMenu.setAttribute('aria-expanded', false); btnMenu.innerHTML = ICON.menu;
  }));

  // ── 내비: 현재 섹션 표시(젤리처럼 움직이는 덩어리) + 아래로 내리면 숨기기 ──
  const nav = $('#nav');
  const blob = $('.blob', links);
  const sections = ['games', 'about', 'lab', 'contact'].map((id) => document.getElementById(id));
  function moveBlob(a) {
    $$('a', links).forEach((x) => x.classList.toggle('active', x === a));
    if (!a) { blob.style.opacity = 0; return; }
    blob.style.opacity = 1;
    blob.style.left = a.offsetLeft + 'px';
    blob.style.width = a.offsetWidth + 'px';
  }
  let lastY = scrollY;
  const progress = $('#progress');
  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!links.classList.contains('open')) nav.classList.toggle('hide', y > lastY && y > 300);
    nav.classList.toggle('scrolled', y > 10);
    lastY = y;
    let cur = null;
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s;
    moveBlob(cur ? $(`a[href="#${cur.id}"]`, links) : null);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // ── 스크롤하면 나타나기 ──
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));

  // ── 숫자 올라가기 ──
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const to = +e.target.dataset.count, t0 = performance.now();
    (function tick(t) {
      const k = Math.min(1, (t - t0) / 1200);
      e.target.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  // ── 클릭하면 반짝이 ──
  // 반짝이는 큰 일(스트라이크, 전설 수확 등)에만 쓴다. 색은 메인/포인트 두 가지.
  const SPARK_SET = ['✦', '•', '✧'];
  const SPARK_COLORS = ['var(--main-ink)', 'var(--point)'];
  window.Sparks = function (x, y, n = 8, set = SPARK_SET) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = set[Math.floor(Math.random() * set.length)];
      const a = rand(0, Math.PI * 2), d = rand(30, 90);
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.color = SPARK_COLORS[i % SPARK_COLORS.length];
      s.style.fontSize = rand(12, 22) + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      s.style.setProperty('--rot', rand(-180, 180) + 'deg');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
  };
  // ── 소개 카드: 터치 기기에서는 눌러서 뒤집기 ──
  $$('.value').forEach((v) => v.addEventListener('click', () => { v.classList.toggle('flipped'); Sfx.whoosh(); }));

  // ── 게임 플레이 모달 ──
  const modal = $('#playModal');
  const frame = $('#playFrame');
  let lastFocus = null;
  function openPlay(src, title) {
    lastFocus = document.activeElement;
    $('#playTitle').textContent = title;
    $('#btnNewTab').href = src;
    frame.src = src;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#btnClose').focus();
    Sfx.boing();
  }
  function closePlay() {
    modal.hidden = true;
    frame.src = 'about:blank';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-play]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openPlay(b.dataset.play, b.dataset.title); }));
  $('#btnClose').addEventListener('click', closePlay);
  modal.addEventListener('click', (e) => { if (e.target === modal) closePlay(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closePlay(); });
  $('#btnFull').addEventListener('click', () => { const el = frame; (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); });

  // ── Big Walk 친구들: 데스크톱 앱 렌더러를 iframe 으로 화면 바닥에 깐다 ──
  // 친구가 없는 곳은 클릭이 아래 페이지로 통과하고(pointer-events: none),
  // 커서 위치는 부모가 알려준다. 친구 위에 커서가 오면 iframe 이 마우스를 받는다.
  let walkFrame = null;
  let walkGot = 0;
  const walkCtl = $('#walkCtl');
  const btnWalk = $('#btnWalk');
  function updateWalkBtn() { if (btnWalk) btnWalk.textContent = I18n.t(walkFrame ? 'walk.dismiss' : 'walk.summon'); }
  function summon() {
    if (walkFrame) return;
    walkFrame = document.createElement('iframe');
    walkFrame.id = 'walkFrame';
    walkFrame.title = 'Big Walk Companion';
    walkFrame.setAttribute('allowtransparency', 'true');
    walkFrame.src = 'play/big-walk/index.html';
    document.body.appendChild(walkFrame);
    walkCtl.hidden = false;
    updateWalkBtn();
    Sfx.boing();
  }
  function dismiss() {
    if (!walkFrame) return;
    walkFrame.remove(); walkFrame = null;
    walkCtl.hidden = true;
    updateWalkBtn();
  }
  btnWalk && btnWalk.addEventListener('click', () => (walkFrame ? dismiss() : summon()));
  $('#walkHome').addEventListener('click', dismiss);
  const post = (msg) => walkFrame && walkFrame.contentWindow && walkFrame.contentWindow.postMessage(msg, location.origin);
  $('#walkAdd').addEventListener('click', () => post({ type: 'bw:add' }));
  $('#walkDaruma').addEventListener('click', () => post({ type: 'bw:daruma' }));
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || !walkFrame) return;
    if (e.data.type === 'bw:ignore') walkFrame.style.pointerEvents = e.data.ignore ? 'none' : 'auto';
    if (e.data.type === 'bw:collected') {
      walkGot++;
      const g = $('#walkGot'); g.hidden = false; $('b', g).textContent = walkGot;
      Sfx.strike();
    }
  });
  addEventListener('pointermove', (e) => {
    if (!walkFrame) return;
    const r = walkFrame.getBoundingClientRect();
    const inside = e.clientY >= r.top && e.clientX >= r.left && e.clientX <= r.right;
    post({ type: 'bw:cursor', p: inside ? { x: e.clientX - r.left, y: e.clientY - r.top } : null });
  });
  // 처음 Big Walk 카드를 보면 친구들이 저절로 떨어진다 (모션 줄이기 설정이면 버튼으로만)
  if (!reduce && innerWidth >= 900) {
    const wio = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) { wio.disconnect(); setTimeout(summon, 400); }
    }, { threshold: 0.5 });
    wio.observe($('#big-walk'));
  }

  // ── 이스터에그: n-e-b-b-i 또는 ↑↑↓↓←→←→BA → 포도 비 ──
  const rain = $('#rain');
  const rctx = rain.getContext('2d');
  let typed = '';
  const KONAMI = 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba';
  let kbuf = '';
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    typed = (typed + (e.key.length === 1 ? e.key.toLowerCase() : '')).slice(-5);
    kbuf = (kbuf + e.key).slice(-KONAMI.length);
    if (typed === 'nebbi' || kbuf === KONAMI) { typed = ''; kbuf = ''; grapeRain(); }
  });
  function grapeRain() {
    if (reduce) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    rain.width = innerWidth * dpr; rain.height = innerHeight * dpr;
    rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rain.style.display = 'block';
    const drops = Array.from({ length: 140 }, () => ({
      x: rand(0, innerWidth), y: rand(-innerHeight, -20), v: rand(240, 520), r: rand(10, 22),
      gold: Math.random() < 0.25,
    }));
    Sfx.strike();
    let last = performance.now(), t0 = last;
    (function fall(t) {
      const dt = Math.min(0.033, (t - last) / 1000); last = t;
      rctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      for (const d of drops) {
        d.y += d.v * dt;
        if (d.y < innerHeight + 40) alive++;
        const P = Theme.pal, c = d.gold ? P.point : P.main;
        rctx.fillStyle = P.rgba(c); rctx.beginPath(); rctx.arc(d.x, d.y, d.r, 0, 7); rctx.fill();
      }
      if (alive && t - t0 < 8000) requestAnimationFrame(fall);
      else rain.style.display = 'none';
    })(last);
  }

  // ── 시작 ──
  I18n.apply(I18n.lang);
  onScroll();
  // 제목 글자가 차례로 한 번씩 뛰어오른다
  if (!reduce) setTimeout(() => $$('#hero [data-split] .ch').forEach((ch, i) => setTimeout(() => jump(ch), i * 60)), 500);
})();
