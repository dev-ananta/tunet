document.addEventListener("DOMContentLoaded", async () => {
  const session = await window.TuNetApp.requireAuth();
  if (!session) {
    return;
  }

  const planButtons = document.querySelectorAll("[data-plan-button]");
  const status = document.querySelector("[data-plan-status]");
  const billingForm = document.querySelector("[data-billing-form]");
  const billingStatus = document.querySelector("[data-billing-status]");

  planButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const plan = button.getAttribute("data-plan-button");
      const priceKey = button.getAttribute("data-price-key");
      planButtons.forEach((node) => node.classList.remove("ring-2", "ring-secondary"));
      button.classList.add("ring-2", "ring-secondary");
      if (status) {
        status.textContent = `Preparing secure checkout for ${plan}.`;
      }

      if (!priceKey) {
        return;
      }

      button.disabled = true;
      button.textContent = "Opening Checkout...";

      try {
        const response = await fetch((window.TuNetConfig || {}).checkoutEndpoint || "/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
          },
          body: JSON.stringify({
            priceKey,
            customerEmail: session.email,
            customerName: session.name
          })
        });

        const payload = await response.json();
        if (!response.ok || !payload.url) {
          throw new Error(payload.error || "Checkout is not configured yet.");
        }

        window.location.href = payload.url;
      } catch (error) {
        if (status) {
          status.textContent = `${error.message} Add Stripe and Supabase environment variables before accepting live payments.`;
        }
        button.disabled = false;
        button.textContent = priceKey === "package" ? "Start Checkout" : "Pay Securely";
      }
    });
  });

  if (billingForm && billingStatus) {
    billingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      billingStatus.textContent = "Saving profile...";

      const formData = new FormData(billingForm);
      const profile = {
        name: String(formData.get("name") || session.name || "").trim(),
        studentName: String(formData.get("studentName") || "").trim(),
        preferredTutor: String(formData.get("preferredTutor") || "").trim(),
        preferredTime: String(formData.get("preferredTime") || "").trim(),
        packagePreference: String(formData.get("packagePreference") || "").trim(),
        email: String(formData.get("email") || session.email || "").trim()
      };

      const result = await window.TuNetApp.saveProfile(profile);
      billingStatus.textContent = result.ok
        ? "Profile saved. Use the package buttons above to continue through Stripe Checkout."
        : result.error;
    });
  }
});
