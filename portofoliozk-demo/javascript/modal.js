export function initDocumentationModal() {
  const modal = document.querySelector('#imageModal');
  if (!modal) return;
  const image = modal.querySelector('#modalImage');
  const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); };
  document.querySelectorAll('.modal-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
    image.src = trigger.dataset.image || '';
    image.alt = trigger.dataset.title || 'Documentation preview';
    modal.querySelector('#modalTitle').textContent = trigger.dataset.title || '';
    modal.querySelector('#modalCategory').textContent = trigger.dataset.categoryLabel || '';
    modal.querySelector('#modalDescription').textContent = trigger.dataset.description || '';
    modal.querySelector('#modalDate').textContent = `Date: ${trigger.dataset.date || '[DATE_PLACEHOLDER]'}`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
    modal.querySelector('.modal-close').focus();
  }));
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('open')) close(); });
  modal.querySelector('#fullscreenButton').addEventListener('click', () => image.requestFullscreen?.());
}
