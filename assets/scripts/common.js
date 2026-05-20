const TuNetApp = (() => {
  const storageKeys = {
    session: "tunet.session",
    courses: "tunet.courses",
    profile: "tunet.profile"
  };

  const config = window.TuNetConfig || {};
  const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const supabaseClient =
    hasSupabaseConfig && window.supabase
      ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
      : null;

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

  const signOut = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    clearSession();
  };

  const syncSupabaseSession = async () => {
    if (!supabaseClient) {
      return getSession();
    }

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session?.user) {
      clearSession();
      return null;
    }

    const displayName =
      session.user.user_metadata?.full_name ||
      session.user.email?.split("@")[0] ||
      "TuNet Student";

    const normalizedSession = {
      id: session.user.id,
      name: displayName,
      email: session.user.email,
      role: "student",
      accessToken: session.access_token
    };

    setSession(normalizedSession);
    return normalizedSession;
  };

  const saveProfile = async (profile) => {
    writeJson(storageKeys.profile, profile);

    if (!supabaseClient) {
      return { ok: true };
    }

    const session = await syncSupabaseSession();
    if (!session?.id) {
      return { ok: false, error: "Please sign in before saving your profile." };
    }

    const { error } = await supabaseClient.from("profiles").upsert({
      id: session.id,
      full_name: profile.name,
      email: session.email,
      student_name: profile.studentName,
      preferred_tutor: profile.preferredTutor,
      preferred_time: profile.preferredTime,
      package_preference: profile.packagePreference,
      updated_at: new Date().toISOString()
    });

    return error ? { ok: false, error: error.message } : { ok: true };
  };

  const getCourses = () => readJson(storageKeys.courses, []);

  const setCourses = (courses) => {
    writeJson(storageKeys.courses, courses);
  };

  const fetchCourses = async () => {
    const session = supabaseClient ? await syncSupabaseSession() : getSession();
    if (!supabaseClient || !session?.id) {
      return getCourses();
    }

    const { data, error } = await supabaseClient
      .from("courses")
      .select("id,name,level,term,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return getCourses();
    }

    setCourses(data || []);
    return data || [];
  };

  const addCourse = async (course) => {
    if (!supabaseClient) {
      const courses = getCourses();
      courses.unshift(course);
      setCourses(courses);
      return { ok: true, courses };
    }

    const session = await syncSupabaseSession();
    if (!session?.id) {
      return { ok: false, error: "Please sign in before adding a course." };
    }

    const { error } = await supabaseClient.from("courses").insert({
      user_id: session.id,
      name: course.name,
      level: course.level,
      term: course.term
    });

    return error ? { ok: false, error: error.message } : { ok: true, courses: await fetchCourses() };
  };

  const deleteCourse = async (course, index) => {
    if (!supabaseClient || !course?.id) {
      const courses = getCourses();
      courses.splice(index, 1);
      setCourses(courses);
      return { ok: true, courses };
    }

    const { error } = await supabaseClient.from("courses").delete().eq("id", course.id);
    return error ? { ok: false, error: error.message } : { ok: true, courses: await fetchCourses() };
  };

  const requireAuth = async () => {
    const session = supabaseClient ? await syncSupabaseSession() : getSession();
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
        signOut().finally(() => {
          window.location.href = "sign-in.html";
        });
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

  const getContentValue = (path) => {
    const parts = String(path || "").split(".");
    return parts.reduce((value, part) => value?.[part], window.TuNetContent);
  };

  const hydrateContentIndex = () => {
    document.querySelectorAll("[data-content]").forEach((element) => {
      const value = getContentValue(element.getAttribute("data-content"));
      if (value !== undefined) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-content-html]").forEach((element) => {
      const value = getContentValue(element.getAttribute("data-content-html"));
      if (value !== undefined) {
        element.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-content-placeholder]").forEach((element) => {
      const value = getContentValue(element.getAttribute("data-content-placeholder"));
      if (value !== undefined) {
        element.setAttribute("placeholder", value);
      }
    });

    document.querySelectorAll("[data-content-image]").forEach((element) => {
      const value = getContentValue(element.getAttribute("data-content-image"));
      if (value !== undefined) {
        element.setAttribute("src", value);
      }
    });
  };

  const createRahiAssistant = async () => {
    const endpoint = config.rahiEndpoint || "/api/rahi-assistant";
    let status;

    try {
      status = await fetch(endpoint, { method: "GET" }).then((response) => response.json());
    } catch {
      return;
    }

    if (!status?.available) {
      return;
    }

    const content = window.TuNetContent?.rahi || {};
    const shell = document.createElement("section");
    shell.className = "rahi-assistant";
    shell.setAttribute("aria-live", "polite");
    shell.innerHTML = `
      <button class="rahi-launcher" type="button" aria-label="${content.text_index?.[2] || "Open Rahi assistant"}">
        <span class="material-symbols-outlined">auto_awesome</span>
        <span>${content.headers_index?.[0] || "Rahi"}</span>
      </button>
      <div class="rahi-panel" hidden>
        <div class="rahi-panel-header">
          <div>
            <p class="rahi-title">${content.headers_index?.[0] || "Rahi"}</p>
            <p class="rahi-kicker">${content.subtext_index?.[0] || "TuNet assistant"}</p>
          </div>
          <button class="rahi-icon-button" type="button" data-rahi-close aria-label="${content.text_index?.[3] || "Close"}">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="rahi-messages" data-rahi-messages>
          <p class="rahi-message rahi-message-assistant">${content.text_index?.[1] || "Hi, I am Rahi. I can help with TuNet."}</p>
        </div>
        <form class="rahi-form" data-rahi-form>
          <input name="message" autocomplete="off" placeholder="${content.placeholders_index?.[0] || "Ask Rahi..."}" />
          <button type="submit" aria-label="${content.text_index?.[4] || "Send"}">
            <span class="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(shell);

    const launcher = shell.querySelector(".rahi-launcher");
    const panel = shell.querySelector(".rahi-panel");
    const closeButton = shell.querySelector("[data-rahi-close]");
    const form = shell.querySelector("[data-rahi-form]");
    const messages = shell.querySelector("[data-rahi-messages]");

    const appendMessage = (text, type) => {
      const message = document.createElement("p");
      message.className = `rahi-message rahi-message-${type}`;
      message.textContent = text;
      messages.appendChild(message);
      messages.scrollTop = messages.scrollHeight;
    };

    launcher.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
    });

    closeButton.addEventListener("click", () => {
      panel.hidden = true;
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = form.elements.message;
      const message = String(input.value || "").trim();
      if (!message) {
        return;
      }

      appendMessage(message, "user");
      input.value = "";
      input.disabled = true;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, path: window.location.pathname })
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Rahi is unavailable right now.");
        }

        appendMessage(payload.reply, "assistant");
        if (payload.action?.type === "navigate" && payload.action.target) {
          window.setTimeout(() => {
            window.location.href = payload.action.target;
          }, 700);
        }
      } catch (error) {
        appendMessage(error.message, "assistant");
      } finally {
        input.disabled = false;
        input.focus();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    hydrateContentIndex();
    fillSessionFields();
    wireSignOut();
    setCurrentYear();
    highlightActiveNavLink();
    createRahiAssistant();
  });

  return {
    getSession,
    setSession,
    syncSupabaseSession,
    saveProfile,
    clearSession,
    signOut,
    getCourses,
    setCourses,
    fetchCourses,
    addCourse,
    deleteCourse,
    requireAuth,
    supabaseClient,
    hasSupabaseConfig,
    hydrateContentIndex
  };
})();

window.TuNetApp = TuNetApp;
