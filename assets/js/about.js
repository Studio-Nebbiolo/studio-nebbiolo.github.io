(() => {
  const button = document.querySelector('.pinwheel-play');
  const rotor = button.querySelector('.pinwheel-rotor');
  const word = document.querySelector('.about-word');
  const status = document.querySelector('.pinwheel-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let angle = 0;
  const spin = () => {
    angle += motion.matches ? 90 : 720;
    rotor.style.transform = `rotate(${angle}deg)`;
    status.textContent = window.NebbioloI18n.t('pinwheelSpun');
  };
  button.addEventListener('click', spin);
  word.addEventListener('click', spin);
})();
