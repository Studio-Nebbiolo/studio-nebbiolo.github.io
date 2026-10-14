(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const applyTheme = dark => {
    root.dataset.theme = dark ? 'dark' : 'light';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', `${dark ? '밝은' : '어두운'} 테마로 전환`);
    document.querySelector('meta[name="theme-color"]').content = dark ? '#211f24' : '#f5f4ef';
  };
  let storedTheme;
  try { storedTheme = localStorage.getItem('nebbiolo-design-theme'); } catch (_) {}
  applyTheme(storedTheme === 'dark');
  themeButton.addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    applyTheme(dark);
    try { localStorage.setItem('nebbiolo-design-theme', dark ? 'dark' : 'light'); } catch (_) {}
  });

  const links = [...document.querySelectorAll('nav a')];
  const sections = [...document.querySelectorAll('main > section[id]')];
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

  const playground = document.querySelector('.playground');
  const toys = [...document.querySelectorAll('.toy')];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const positionToy = (toy, x, y) => {
    const marginX = toy.offsetWidth / (2 * playground.clientWidth);
    const marginY = toy.offsetHeight / (2 * playground.clientHeight);
    toy.dataset.x = clamp(x, marginX + .02, 1 - marginX - .02);
    toy.dataset.y = clamp(y, marginY + .03, 1 - marginY - .03);
    toy.style.left = `${toy.dataset.x * 100}%`;
    toy.style.top = `${toy.dataset.y * 100}%`;
  };
  const shuffle = () => {
    toys.forEach(toy => {
      positionToy(toy, .15 + Math.random() * .7, .2 + Math.random() * .6);
      toy.style.setProperty('--rotation', `${Math.random() * 90 - 45}deg`);
    });
    document.getElementById('playground-status').textContent = '도형을 새롭게 섞었어요.';
  };
  document.querySelector('.shuffle').addEventListener('click', shuffle);
  toys.forEach(toy => {
    let drag = null;
    toy.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      const rect = playground.getBoundingClientRect();
      drag = { pointer: event.pointerId, dx: event.clientX - (rect.left + Number(toy.dataset.x) * rect.width), dy: event.clientY - (rect.top + Number(toy.dataset.y) * rect.height) };
      toy.setPointerCapture(event.pointerId);
      toy.classList.add('dragging');
    });
    toy.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.pointer) return;
      const rect = playground.getBoundingClientRect();
      positionToy(toy, (event.clientX - rect.left - drag.dx) / rect.width, (event.clientY - rect.top - drag.dy) / rect.height);
    });
    const release = () => { drag = null; toy.classList.remove('dragging'); };
    toy.addEventListener('pointerup', release);
    toy.addEventListener('pointercancel', release);
    toy.addEventListener('lostpointercapture', release);
    toy.addEventListener('keydown', event => {
      const directions = { ArrowLeft: [-.05, 0], ArrowRight: [.05, 0], ArrowUp: [0, -.05], ArrowDown: [0, .05] };
      if (directions[event.key]) {
        event.preventDefault();
        const [dx, dy] = directions[event.key];
        positionToy(toy, Number(toy.dataset.x) + dx, Number(toy.dataset.y) + dy);
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toy.style.setProperty('--rotation', `${Math.random() * 180 - 90}deg`);
      }
    });
  });
  new ResizeObserver(() => toys.forEach(toy => positionToy(toy, Number(toy.dataset.x), Number(toy.dataset.y)))).observe(playground);

  document.querySelectorAll('.placeholder').forEach(card => {
    card.addEventListener('click', () => {
      const expanded = card.getAttribute('aria-expanded') !== 'true';
      card.setAttribute('aria-expanded', String(expanded));
      card.setAttribute('aria-label', card.getAttribute('aria-label').replace(expanded ? '펼치기' : '접기', expanded ? '접기' : '펼치기'));
    });
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--tilt', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 30}deg`);
    });
    card.addEventListener('pointerleave', () => card.style.setProperty('--tilt', '0deg'));
    card.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        card.setAttribute('aria-expanded', 'false');
        card.setAttribute('aria-label', card.getAttribute('aria-label').replace('접기', '펼치기'));
      }
    });
  });
})();
