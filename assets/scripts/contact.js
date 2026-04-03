document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById('contact-form');
  const contactFeedback = document.getElementById('contact-feedback');

  if (contactForm && contactFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.reset();
      contactFeedback.classList.remove('hidden');
      setTimeout(() => {
        contactFeedback.classList.add('hidden');
      }, 5000);
    });
  }
});
