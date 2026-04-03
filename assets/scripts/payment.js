document.addEventListener("DOMContentLoaded", () => {
  const session = window.TuNetApp.requireAuth();
  if (!session) {
    return;
  }

  const planButtons = document.querySelectorAll("[data-plan-button]");
  const status = document.querySelector("[data-plan-status]");
  const billingForm = document.querySelector("[data-billing-form]");
  const billingStatus = document.querySelector("[data-billing-status]");

  planButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const plan = button.getAttribute("data-plan-button");
      planButtons.forEach((node) => node.classList.remove("ring-2", "ring-secondary"));
      button.classList.add("ring-2", "ring-secondary");
      if (status) {
        status.textContent = `${plan} selected for ${session.name}.`;
      }
    });
  });

  if (billingForm && billingStatus) {
    billingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      billingStatus.textContent =
        "Billing profile updated locally. Connect a secure backend before collecting live payments.";
    });
  }
});
