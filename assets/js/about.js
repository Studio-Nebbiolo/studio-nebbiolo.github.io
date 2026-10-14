(() => {
  const garden = document.querySelector('.about-play');
  const canvas = garden.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const flower = garden.querySelector('.garden-flower');
  const word = document.querySelector('.about-word');
  const status = document.querySelector('.garden-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#603b55', '#617aa5', '#c77960'];
  const particles = [];
  const seeds = Array.from({ length: 21 }, (_, i) => ({
    angle: i * 2.39996, radius: .25 + (i % 5) * .035, size: 3 + (i % 4) * 2,
    color: colors[i % 3], shape: i % 3
  }));
  let width = 1, height = 1, frame = 0, visible = false, lastTime = 0, lastTrail = 0, turns = 0;

  const paintShape = (x, y, size, angle, color, shape, alpha = 1) => {
    context.save();
    context.translate(x, y); context.rotate(angle);
    context.fillStyle = color; context.strokeStyle = color; context.globalAlpha = alpha;
    if (shape === 0) {
      context.lineWidth = Math.max(2, size * .3);
      context.beginPath(); context.arc(0, 0, size, 0, Math.PI * 2); context.stroke();
    } else if (shape === 1) {
      context.fillRect(-size, -size, size * 2, size * 2);
    } else {
      context.beginPath(); context.ellipse(0, 0, size * .65, size * 1.25, 0, 0, Math.PI * 2); context.fill();
    }
    context.restore();
  };
  const draw = time => {
    context.clearRect(0, 0, width, height);
    context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line').trim();
    context.lineWidth = 1;
    for (const radius of [.25, .4]) {
      context.beginPath(); context.arc(width / 2, height / 2, width * radius, 0, Math.PI * 2); context.stroke();
    }
    seeds.forEach(seed => {
      const angle = seed.angle + (motion.matches ? 0 : time * .000035);
      const radius = seed.radius * width;
      paintShape(width / 2 + Math.cos(angle) * radius, height / 2 + Math.sin(angle) * radius,
        seed.size, angle, seed.color, seed.shape, .8);
    });
    particles.forEach(p => paintShape(p.x, p.y, p.size, p.angle, p.color, p.shape,
      motion.matches ? .9 : Math.min(1, p.life / 1.2)));
  };
  const tick = time => {
    frame = 0;
    const dt = Math.min(.035, Math.max(0, (time - lastTime) / 1000)); lastTime = time;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= Math.exp(-dt * .6); p.vy += dt * 30; p.angle += p.spin * dt; p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    draw(time);
    if (visible && !motion.matches) frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (visible && !motion.matches && !frame) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
    else draw(performance.now());
  };
  const resize = () => {
    const rect = garden.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles.length = 0; draw(performance.now());
  };
  const sprinkle = (x, y, count) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = width * (.15 + Math.random() * .4);
      particles.push({ x: motion.matches ? x + Math.cos(angle) * width * .18 : x,
        y: motion.matches ? y + Math.sin(angle) * width * .18 : y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 30,
        size: 4 + Math.random() * 7, angle, spin: Math.random() * 3 - 1.5,
        color: colors[i % 3], shape: i % 3, life: 2.5 + Math.random() * 1.5 });
    }
    if (particles.length > 120) particles.splice(0, particles.length - 120);
    start();
  };
  const burst = (x = width / 2, y = height / 2) => {
    sprinkle(x, y, 24);
    turns += 60; flower.style.setProperty('--bloom-angle', `${turns}deg`);
    garden.dataset.bursts = String(Number(garden.dataset.bursts || 0) + 1);
    status.textContent = window.NebbioloI18n.t('happinessSpread');
  };
  garden.addEventListener('click', event => {
    const rect = garden.getBoundingClientRect();
    if (event.detail === 0) burst();
    else burst(event.clientX - rect.left, event.clientY - rect.top);
  });
  garden.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || motion.matches || performance.now() - lastTrail < 80) return;
    lastTrail = performance.now();
    const rect = garden.getBoundingClientRect();
    sprinkle(event.clientX - rect.left, event.clientY - rect.top, 2);
  });
  word.addEventListener('click', () => burst());
  new ResizeObserver(resize).observe(garden);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start();
    else { cancelAnimationFrame(frame); frame = 0; }
  }, { threshold: .05 }).observe(garden);
  motion.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0; particles.length = 0; start();
  });
  new MutationObserver(() => draw(performance.now())).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] });
  resize();
})();
