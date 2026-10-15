(() => {
  const button = document.querySelector('.contact-copy');
  const address = document.querySelector('.contact-address');
  const label = button.querySelector('.contact-copy-label');
  const status = document.querySelector('.contact-status');
  const email = address.textContent.trim();
  let state = 'idle', pending = false, resetTimer;

  const render = () => {
    label.textContent = window.NebbioloI18n.t({ idle: 'copyEmail', copied: 'emailCopied', selected: 'emailSelected' }[state]);
    button.classList.toggle('is-copied', state === 'copied');
    status.textContent = state === 'idle' ? '' : window.NebbioloI18n.t(state === 'copied' ? 'emailCopiedStatus' : 'emailSelectedStatus');
  };
  const fallbackCopy = () => {
    const field = document.createElement('textarea');
    field.value = email; field.readOnly = true; field.tabIndex = -1;
    field.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none;font-size:16px';
    document.body.appendChild(field);
    let copied = false;
    try { field.select(); copied = document.execCommand('copy'); } catch (_) {}
    finally { field.remove(); button.focus({ preventScroll: true }); }
    return copied;
  };
  button.addEventListener('click', async () => {
    if (pending) return;
    pending = true; clearTimeout(resetTimer); button.setAttribute('aria-busy', 'true');
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(email); copied = true; }
    } catch (_) {}
    if (!copied) copied = fallbackCopy();
    state = copied ? 'copied' : 'selected';
    if (!copied) {
      const selection = getSelection();
      if (selection) { const range = document.createRange(); range.selectNodeContents(address); selection.removeAllRanges(); selection.addRange(range); }
    }
    pending = false; button.removeAttribute('aria-busy'); render();
    resetTimer = setTimeout(() => { state = 'idle'; render(); }, 2800);
  });
  document.addEventListener('nebbiolo:languagechange', render);
})();
