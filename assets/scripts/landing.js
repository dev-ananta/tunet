document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-go-sign-in]").forEach((element) => {
    element.addEventListener("click", () => {
      window.location.href = "sign-in.html";
    });
  });

  document.querySelectorAll("[data-go-payment]").forEach((element) => {
    element.addEventListener("click", () => {
      window.location.href = "payment.html";
    });
  });

  const newsletterForm = document.querySelector("[data-newsletter-form]");
  const newsletterMessage = document.querySelector("[data-newsletter-message]");

  if (!newsletterForm || !newsletterMessage) {
    return;
  }

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterMessage.textContent =
      "Thanks. You are on the list for TuNet academic updates.";
    newsletterForm.reset();
  });
});
