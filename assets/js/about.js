(() => {
  const section = document.getElementById('about');
  const button = section.querySelector('.pinwheel-play');
  const scene = section.querySelector('.pinwheel-scene');
  const rotor = button.querySelector('.pinwheel-rotor');
  const blades = [...rotor.querySelectorAll('g')];
  const word = section.querySelector('.about-word');
  const status = section.querySelector('.pinwheel-status');
  const wind = section.querySelector('.wind-flow');
  const strokes = [...wind.querySelectorAll('path')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = ['#603b55', '#617aa5', '#c77960'];
  let angle = 0, phase = 0;
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
  const sendBreeze = () => {
    const bounds = section.getBoundingClientRect();
    const origin = word.getBoundingClientRect();
    const target = rotor.getBoundingClientRect();
    const vertical = target.top > origin.bottom + 40;
    const start = {
      x: origin.right + 14 - bounds.left,
      y: origin.top + origin.height * .55 - bounds.top
    };
    const end = {
      x: target.left + target.width * (vertical ? .5 : .18) - bounds.left,
      y: target.top + target.height * (vertical ? .18 : .5) - bounds.top
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
      const d = `M ${start.x + ox} ${start.y + oy} C ${control1.x + ox} ${control1.y + oy}, ${control2.x + ox} ${control2.y + oy}, ${end.x + ox} ${end.y + oy}`;
      path.setAttribute('d', d);
      path.style.stroke = palette[(index + phase) % palette.length];
      animate(path, [
        { strokeDashoffset: '1', opacity: 0 },
        { strokeDashoffset: '.75', opacity: .7, offset: .18 },
        { strokeDashoffset: '.05', opacity: .6, offset: .8 },
        { strokeDashoffset: '-.3', opacity: 0 }
      ], { duration: 1050, delay: index * 75, easing: 'cubic-bezier(.2,.5,.3,1)' });
    });
    animate(word, [
      { transform: 'translateX(0)' }, { transform: 'translateX(3px)', offset: .3 }, { transform: 'translateX(0)' }
    ], { duration: 420, easing: 'ease-out' });
    animate(scene, [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(1.3deg)', offset: .3 }, { transform: 'rotate(0deg)' }
    ], { duration: 950, delay: 180, easing: 'ease-out' });
  };
  const spin = () => {
    cancelFeedback();
    // Capture wind geometry before starting a new rotor transition.
    if (!motion.matches) sendBreeze();
    phase = (phase + 1) % palette.length;
    blades.forEach((blade, index) => { blade.style.color = palette[(index + phase) % palette.length]; });
    word.style.setProperty('--word-color', palette[phase]);
    scene.style.setProperty('--pin-color', palette[phase]);
    angle += motion.matches ? 90 : 720;
    rotor.style.transform = `rotate(${angle}deg)`;
    status.textContent = window.NebbioloI18n.t('pinwheelSpun');
  };
  button.addEventListener('click', spin);
  word.addEventListener('click', spin);
  addEventListener('resize', cancelFeedback, { passive: true });
  document.addEventListener('nebbiolo:languagechange', cancelFeedback);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelFeedback();
  });
  motion.addEventListener('change', cancelFeedback);
})();
