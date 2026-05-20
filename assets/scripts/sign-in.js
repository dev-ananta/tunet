document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.querySelector("[data-sign-in-form]");
  const feedback = document.querySelector("[data-sign-in-feedback]");

  if (!signInForm || !feedback) {
    return;
  }

  signInForm.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent = "Checking your account...";

    const formData = new FormData(signInForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!name || !email || password.length < 8) {
      feedback.textContent = "Please enter your name, email, and an 8+ character password.";
      return;
    }

    const completeLocalSignIn = () => {
      window.TuNetApp.setSession({
        name,
        email,
        role: "student"
      });

      feedback.textContent = "Signed in. Redirecting to your dashboard.";
      window.setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 400);
    };

    if (!window.TuNetApp.supabaseClient) {
      feedback.textContent =
        "Supabase is not configured yet, so this preview is using local sign-in.";
      completeLocalSignIn();
      return;
    }

    window.TuNetApp.supabaseClient.auth
      .signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      })
      .then(async ({ error }) => {
        if (error || !(await window.TuNetApp.syncSupabaseSession())) {
          const signInResult = await window.TuNetApp.supabaseClient.auth.signInWithPassword({
            email,
            password
          });
          if (signInResult.error) {
            feedback.textContent = signInResult.error.message;
            return;
          }
        }

        await window.TuNetApp.syncSupabaseSession();
        feedback.textContent = "Account ready. Redirecting to your dashboard.";
        window.setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 400);
      });
  });
});
