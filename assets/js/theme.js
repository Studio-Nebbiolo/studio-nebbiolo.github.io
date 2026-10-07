// 라이트/다크 전환 + 캔버스가 쓸 3색 팔레트.
// CSS 의 --main / --point / --base / --fg 를 읽어서, 섞은 색은 여기서 직접 계산한다
// (캔버스는 color-mix() 를 이해하지 못하는 브라우저가 있다).
(function (root) {
  const html = document.documentElement;
  const listeners = [];
  let cache = null;

  function hex(name) {
    const v = getComputedStyle(html).getPropertyValue(name).trim();
    const m = /^#?([0-9a-f]{6})$/i.exec(v);
    const n = m ? parseInt(m[1], 16) : 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mixRgb = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  function palette() {
    if (cache) return cache;
    const main = hex('--main'), point = hex('--point'), base = hex('--base'), fg = hex('--fg');
    const dark = html.getAttribute('data-theme') === 'dark';
    cache = {
      dark, main, point, base, fg,
      rgba,
      /** a 와 b 를 t 만큼 섞은 색 (t=0 → a) */
      mix: (a, b, t, alpha = 1) => rgba(mixRgb(a, b, t), alpha),
      light: [251, 248, 244], // 라이트 베이스 — 메인 위 글자, 눈 흰자 등 테마와 무관하게 밝아야 할 곳
      ink: [20, 16, 18],      // 다크 베이스 — 눈동자 등 항상 어두워야 할 곳
    };
    return cache;
  }

  const Theme = {
    get mode() { return html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; },
    get pal() { return palette(); },
    set(mode, save = true) {
      html.setAttribute('data-theme', mode);
      if (save) { try { localStorage.setItem('nb.theme', mode); } catch (e) {} }
      cache = null;
      listeners.forEach((fn) => fn(mode));
    },
    toggle() { this.set(this.mode === 'dark' ? 'light' : 'dark'); },
    onChange(fn) { listeners.push(fn); },
  };

  // 직접 고른 적이 없으면 시스템 설정이 바뀔 때 따라간다
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const follow = () => {
    let saved = null;
    try { saved = localStorage.getItem('nb.theme'); } catch (e) {}
    if (saved !== 'light' && saved !== 'dark') Theme.set(mq.matches ? 'dark' : 'light', false);
  };
  if (mq.addEventListener) mq.addEventListener('change', follow); else if (mq.addListener) mq.addListener(follow);

  root.Theme = Theme;
})(window);
