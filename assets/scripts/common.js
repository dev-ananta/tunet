const TuNetApp = (() => {
  const storageKeys = {
    session: "tunet.session",
    courses: "tunet.courses"
  };

  const readJson = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const getSession = () => readJson(storageKeys.session, null);

  const setSession = (session) => {
    writeJson(storageKeys.session, {
      ...session,
      signedInAt: new Date().toISOString()
    });
  };

  const clearSession = () => {
    localStorage.removeItem(storageKeys.session);
  };

  const getCourses = () => readJson(storageKeys.courses, []);

  const setCourses = (courses) => {
    writeJson(storageKeys.courses, courses);
  };

  const requireAuth = () => {
    const session = getSession();
    if (!session) {
      window.location.href = "sign-in.html";
      return null;
    }
    return session;
  };

  const fillSessionFields = () => {
    const session = getSession();
    document.querySelectorAll("[data-session-name]").forEach((element) => {
      element.textContent = session?.name || "Guest";
    });
    document.querySelectorAll("[data-session-email]").forEach((element) => {
      element.textContent = session?.email || "guest@tunet.local";
    });
  };

  const wireSignOut = () => {
    document.querySelectorAll("[data-sign-out]").forEach((button) => {
      button.addEventListener("click", () => {
        clearSession();
        window.location.href = "sign-in.html";
      });
    });
  };

  const setCurrentYear = () => {
    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  };

  const highlightActiveNavLink = () => {
    const currentPath = window.location.pathname.split("/").pop() || "landing.html";
    document.querySelectorAll("nav a, aside a").forEach((link) => {
      const linkPath = link.getAttribute("href") || "";
      if (linkPath === currentPath) {
        // Classes for sidebar (vertical)
        if (link.closest("aside") || link.parentElement.classList.contains("flex-col")) {
          link.classList.add("bg-white", "text-blue-900", "shadow-sm", "rounded-r-full");
          link.classList.remove("text-slate-500");
        } 
        // Classes for landing nav (horizontal)
        else {
          link.classList.add("border-b-2", "border-orange-500", "pb-1", "font-bold", "text-blue-900");
          link.classList.remove("text-slate-600");
        }
      } else {
        // Reset classes for sidebar
        if (link.closest("aside") || link.parentElement.classList.contains("flex-col")) {
          link.classList.remove("bg-white", "text-blue-900", "shadow-sm", "rounded-r-full");
          link.classList.add("text-slate-500");
        }
        // Reset classes for landing nav
        else if (!linkPath.startsWith("#")) {
          link.classList.remove("border-b-2", "border-orange-500", "pb-1", "font-bold", "text-blue-900");
          link.classList.add("text-slate-600");
        }
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    fillSessionFields();
    wireSignOut();
    setCurrentYear();
    highlightActiveNavLink();
  });

  return {
    getSession,
    setSession,
    clearSession,
    getCourses,
    setCourses,
    requireAuth
  };
})();

window.TuNetApp = TuNetApp;
