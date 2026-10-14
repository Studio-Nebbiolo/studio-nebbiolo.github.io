(() => {
  const dialog = document.getElementById('product-dialog');
  const content = dialog.querySelector('.dialog-content');
  const close = dialog.querySelector('.dialog-close');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let opener = null;

  document.querySelectorAll('.product-open').forEach(button => {
    button.addEventListener('click', () => {
      const template = document.getElementById(`product-${button.dataset.product}`);
      opener = button;
      content.replaceChildren(template.content.cloneNode(true));
      dialog.showModal();
      dialog.scrollTop = 0;
      document.documentElement.classList.add('modal-open');
      close.focus({ preventScroll: true });
    });
    button.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--image-x', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 8}px`);
      button.style.setProperty('--image-y', `${(event.clientY - rect.top - rect.height / 2) / rect.height * 8}px`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--image-x', '0px');
      button.style.setProperty('--image-y', '0px');
    });
  });

  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('modal-open');
    opener?.focus({ preventScroll: true });
  });
})();
