document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.querySelector("[data-sign-in-form]");
  const feedback = document.querySelector("[data-sign-in-feedback]");

  if (!signInForm || !feedback) {
    return;
  }

  signInForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(signInForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();

    if (!name || !email) {
      feedback.textContent = "Please enter both your full name and email.";
      return;
    }

    window.TuNetApp.setSession({
      name,
      email,
      role: "student"
    });

    feedback.textContent = "Signed in. Redirecting to your dashboard.";
    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 400);
  });
});
