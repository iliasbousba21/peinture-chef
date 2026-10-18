// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));

// Lightbox
function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// Mobile nav (simple)
document.querySelector('.mobile-menu')?.addEventListener('click', () => {
  const ul = document.querySelector('nav ul');
  ul.style.display = ul.style.display === 'flex' ? 'none' : 'flex';
  ul.style.flexDirection = 'column';
  ul.style.position = 'absolute';
  ul.style.top = '72px';
  ul.style.left = '0';
  ul.style.right = '0';
  ul.style.background = '#0c0c0c';
  ul.style.padding = '1rem';
});
