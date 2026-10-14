(() => {
  const links = [...document.querySelectorAll('nav a')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const setActive = id => links.forEach(link => {
    const active = link.hash === `#${id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  setActive('home');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-10% 0px -45% 0px', threshold: [0, .1, .3, .5] });
    sections.forEach(section => observer.observe(section));
  }
  links.forEach(link => link.addEventListener('click', () => setActive(link.hash.slice(1))));
  document.getElementById('year').textContent = new Date().getFullYear();
})();
