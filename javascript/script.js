import { initNavigation } from './navigation.js';
import { initDocumentationModal } from './modal.js';
import { initDocumentationFilter } from './filter.js';
import { initAnimations } from './animation.js';

initNavigation();
initDocumentationModal();
initDocumentationFilter();
initAnimations();

const emailAddress = 'thisiszaki18@gmail.com';
const whatsappNumber = '6289530977029';
const aboutEmail = document.querySelector('.information-card > div:last-child dd');
const contactDetails = document.querySelectorAll('.contact-details p');
const nameField = document.querySelector('#name');
if (aboutEmail) aboutEmail.innerHTML = `<a href="mailto:${emailAddress}">${emailAddress}</a>`;
if (contactDetails[0]) contactDetails[0].innerHTML = `<strong><svg class="contact-icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>Email</strong><a href="mailto:${emailAddress}">${emailAddress}</a>`;
if (contactDetails[1]) contactDetails[1].innerHTML = `<strong><svg class="contact-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 4a10 10 0 0 0-15 13L4 21l4-1a10 10 0 1 0 12-16Z"></path><path d="M8 9c1 4 3 6 7 7l1-2-2-1-1 1c-1-1-2-2-3-3l1-1-1-2-2 1Z"></path></svg>WhatsApp</strong><a href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer">${whatsappNumber}</a>`;
if (nameField) nameField.placeholder = 'Zaki';

const form = document.querySelector('#contactForm');
const status = document.querySelector('#formStatus');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (status) status.textContent = 'Form frontend siap dihubungkan ke api/contact.php.';
  form.reset();
});
