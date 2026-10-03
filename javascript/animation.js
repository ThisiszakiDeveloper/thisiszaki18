export function initAnimations() {
  const elements = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { elements.forEach((element) => element.classList.add('visible')); return; }
  const observer = new IntersectionObserver((entries, instance) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); instance.unobserve(entry.target); } }), { threshold: .12 });
  elements.forEach((element) => observer.observe(element));
}
