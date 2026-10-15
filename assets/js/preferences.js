// Resolve preferences before styles load so the first paint uses the right theme.
(() => {
  const root = document.documentElement;
  let theme, language;
  try { theme = localStorage.getItem('nebbiolo-design-theme'); } catch (_) {}
  try { language = localStorage.getItem('nebbiolo-language'); } catch (_) {}
  const deviceLanguage = navigator.language || navigator.languages?.[0] || '';
  root.lang = language === 'ko' || language === 'en' ? language : /^ko(?:-|$)/i.test(deviceLanguage) ? 'ko' : 'en';
  root.dataset.theme = theme === 'dark' || theme === 'light' ? theme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = root.dataset.theme === 'dark' ? '#211f24' : '#f5f4ef';
})();
