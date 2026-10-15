(() => {
  const section = document.getElementById('about');
  const button = section.querySelector('.pinwheel-play');
  const scene = section.querySelector('.pinwheel-scene');
  const rotor = button.querySelector('.pinwheel-rotor');
  const hub = rotor.querySelector('.pinwheel-hub');
  const blades = [...rotor.querySelectorAll('g')];
  const folds = [...rotor.querySelectorAll('.blade-fold')];
  const word = section.querySelector('.about-word');
  const status = section.querySelector('.pinwheel-status');
  const wind = section.querySelector('.wind-flow');
  const strokes = [...wind.querySelectorAll('path')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = ['#603b55', '#617aa5', '#c77960'];
  const incoming = [];
  let angle = 0, phase = 0, velocity = 0, pressure = 0;
  let lean = 0, leanVelocity = 0, frame = 0, lastTime = 0, visible = true;
  let feedback = [];

  const cancelFeedback = () => {
    feedback.forEach(animation => animation.cancel());
    feedback = [];
  };
  const animate = (element, frames, options) => {
    const animation = element.animate(frames, options);
    feedback.push(animation);
    animation.onfinish = () => {
      feedback = feedback.filter(item => item !== animation);
      animation.cancel();
    };
  };
  const render = () => {
    rotor.style.transform = `rotate(${angle}deg)`;
    scene.style.transform = `rotate(${lean}deg)`;
    // Fold highlights move with the paper's orientation to the light.
    const radians = angle * Math.PI / 180;
    folds.forEach((fold, index) => {
      fold.style.opacity = String(.12 + .16 * (.5 + .5 * Math.cos(radians + index * Math.PI / 2 - .7)));
    });
  };
  const settle = () => {
    cancelAnimationFrame(frame); frame = 0;
    incoming.length = 0;
    pressure = 0; velocity = 0; lean = 0; leanVelocity = 0;
    angle %= 360;
    button.dataset.motion = 'idle';
    render();
  };
  const tick = time => {
    frame = 0;
    const dt = Math.min(.04, Math.max(0, (time - lastTime) / 1000));
    lastTime = time;
    while (incoming.length && incoming[0].at <= time) {
      pressure = Math.min(6, pressure + incoming.shift().strength);
    }
    // Short integration steps keep the stem spring stable on slower displays.
    let remaining = dt;
    while (remaining > 0) {
      const step = Math.min(remaining, 1 / 120);
      pressure *= Math.exp(-1.75 * step);
      const drag = .72 + velocity * .00032;
      velocity = Math.min(1900, Math.max(0, velocity + (pressure * 2300 - drag * velocity) * step));
      angle += velocity * step;
      const targetLean = Math.min(2.6, pressure * .9) + Math.sin(angle * Math.PI / 180) * Math.min(.1, velocity * .00008);
      leanVelocity += ((targetLean - lean) * 46 - leanVelocity * 10) * step;
      lean += leanVelocity * step;
      remaining -= step;
    }
    render();
    const resting = incoming.length === 0 && velocity < 1.8 && pressure < .003 && Math.abs(lean) < .02 && Math.abs(leanVelocity) < .03;
    if (resting || !visible || document.hidden || motion.matches) { settle(); return; }
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (frame || motion.matches || !visible || document.hidden) return;
    button.dataset.motion = 'spinning';
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const sendBreeze = () => {
    const bounds = section.getBoundingClientRect();
    const origin = word.getBoundingClientRect();
    const center = hub.getBoundingClientRect();
    const size = button.offsetWidth;
    const vertical = center.top > origin.bottom + size * .45;
    const start = { x: origin.right + 14 - bounds.left, y: origin.top + origin.height * .55 - bounds.top };
    const end = {
      x: center.left + center.width / 2 - (vertical ? 0 : size * .3) - bounds.left,
      y: center.top + center.height / 2 - (vertical ? size * .32 : 0) - bounds.top
    };
    const dx = end.x - start.x, dy = end.y - start.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    wind.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    strokes.forEach((path, index) => {
      const offset = (index - 1) * 8;
      const ox = -dy / distance * offset, oy = dx / distance * offset;
      const lane = Math.min(bounds.width - 24, Math.max(start.x + 130, end.x + 90));
      const control1 = vertical ? { x: lane, y: start.y } : { x: start.x + dx * .4, y: start.y + dy * .15 - 35 };
      const control2 = vertical ? { x: lane, y: end.y - 65 } : { x: end.x - dx * .25, y: end.y - dy * .3 + 25 };
      path.setAttribute('d', `M ${start.x + ox} ${start.y + oy} C ${control1.x + ox} ${control1.y + oy}, ${control2.x + ox} ${control2.y + oy}, ${end.x + ox} ${end.y + oy}`);
      path.style.stroke = palette[(index + phase) % palette.length];
      animate(path, [
        { strokeDashoffset: '1', opacity: 0 },
        { strokeDashoffset: '.75', opacity: .7, offset: .18 },
        { strokeDashoffset: '.05', opacity: .6, offset: .8 },
        { strokeDashoffset: '-.3', opacity: 0 }
      ], { duration: 1100, delay: index * 75, easing: 'cubic-bezier(.2,.5,.3,1)' });
    });
    animate(word, [
      { transform: 'translateX(0)' }, { transform: 'translateX(3px)', offset: .3 }, { transform: 'translateX(0)' }
    ], { duration: 420, easing: 'ease-out' });
    return Math.max(170, Math.min(420, distance * .5));
  };
  const spin = () => {
    cancelFeedback();
    const delay = motion.matches ? 0 : sendBreeze();
    phase = (phase + 1) % palette.length;
    blades.forEach((blade, index) => { blade.style.color = palette[(index + phase) % palette.length]; });
    word.style.setProperty('--word-color', palette[phase]);
    scene.style.setProperty('--pin-color', palette[phase]);
    status.textContent = window.NebbioloI18n.t('pinwheelSpun');
    if (motion.matches) { settle(); angle += 90; render(); return; }
    const gust = { at: performance.now() + delay, strength: 1.25 };
    if (incoming.length < 8) incoming.push(gust);
    else incoming[incoming.length - 1].strength = Math.min(4, incoming[incoming.length - 1].strength + .5);
    // Further clicks add wind; they never reset angular velocity or angle.
    start();
  };
  button.addEventListener('click', spin);
  word.addEventListener('click', spin);
  addEventListener('resize', cancelFeedback, { passive: true });
  document.addEventListener('nebbiolo:languagechange', cancelFeedback);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelFeedback(); settle(); }
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) { cancelFeedback(); settle(); }
  }, { threshold: 0 }).observe(section.querySelector('.about-layout'));
  motion.addEventListener('change', () => { cancelFeedback(); settle(); });
  button.dataset.motion = 'idle';
})();
