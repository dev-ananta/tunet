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

  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(newsletterForm);
    const email = String(formData.get("email") || "").trim();

    if (!email) {
      newsletterMessage.textContent = "Please enter your email.";
      return;
    }

    newsletterMessage.textContent = "Saving your interest...";

    try {
      const response = await fetch((window.TuNetConfig || {}).registrationEndpoint || "/api/register-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          message: "Newsletter signup"
        })
      });

      if (!response.ok) {
        throw new Error("Registration storage is not configured yet.");
      }

      newsletterMessage.textContent =
        "Thanks. You are on the list for TuNet academic updates.";
    } catch (error) {
      newsletterMessage.textContent =
        "Thanks. Your interest is noted in this preview; connect Supabase to store it live.";
    }
    newsletterForm.reset();
  });
});
