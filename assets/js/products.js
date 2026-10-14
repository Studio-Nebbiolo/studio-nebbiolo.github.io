(() => {
  const dialog = document.getElementById('product-dialog');
  const content = dialog.querySelector('.dialog-content');
  const close = dialog.querySelector('.dialog-close');
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
