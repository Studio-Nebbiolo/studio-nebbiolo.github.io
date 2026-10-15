(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const applyTheme = dark => {
    root.dataset.theme = dark ? 'dark' : 'light';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', window.NebbioloI18n.t(dark ? 'lightTheme' : 'darkTheme'));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#211f24' : '#f5f4ef';
  };
  let storedTheme;
  try { storedTheme = localStorage.getItem('nebbiolo-design-theme'); } catch (_) {}
  applyTheme(storedTheme === 'dark');
  document.addEventListener('nebbiolo:languagechange', () => applyTheme(root.dataset.theme === 'dark'));
  themeButton.addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    applyTheme(dark);
    try { localStorage.setItem('nebbiolo-design-theme', dark ? 'dark' : 'light'); } catch (_) {}
  });

  const links = [...document.querySelectorAll('nav a')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  const progress = document.querySelector('.scroll-progress');
  let scrollPending = false;
  const updateScroll = () => {
    const threshold = Math.min(innerHeight * .35, 250);
    const atBottom = scrollY > 0 && scrollY + innerHeight >= root.scrollHeight - 2;
    const active = atBottom ? sections[sections.length - 1] : [...sections].reverse().find(section => section.getBoundingClientRect().top <= threshold) || sections[0];
    links.forEach(link => {
      const selected = link.hash === `#${active.id}`;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const distance = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
    scrollPending = false;
  };
  const scheduleScroll = () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  };
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll);
  updateScroll();

  document.addEventListener('nebbiolo:languagechange', scheduleScroll);
  const resolveLegacyHash = () => {
    if (location.hash !== '#home') return;
    history.replaceState(null, '', `${location.pathname}${location.search}#products`);
    document.getElementById('products').scrollIntoView({ behavior: 'instant' });
  };
  addEventListener('hashchange', resolveLegacyHash);
  resolveLegacyHash();
})();
