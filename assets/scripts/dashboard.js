document.addEventListener("DOMContentLoaded", async () => {
  const session = await window.TuNetApp.requireAuth();
  if (!session) {
    return;
  }

  const form = document.querySelector("[data-course-form]");
  const list = document.querySelector("[data-course-list]");
  const emptyState = document.querySelector("[data-empty-state]");
  const count = document.querySelector("[data-course-count]");
  const welcome = document.querySelector("[data-dashboard-welcome]");

  if (welcome) {
    welcome.textContent = `${session.name}, build your academic dashboard`;
  }

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const renderCourses = async () => {
    const courses = await window.TuNetApp.fetchCourses();
    if (!list || !emptyState || !count) {
      return;
    }

    count.textContent = String(courses.length);
    list.innerHTML = "";

    if (!courses.length) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    courses.forEach((course, index) => {
      const item = document.createElement("article");
      item.className =
        "rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm";
      item.innerHTML = `
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-secondary">${escapeHtml(course.term)}</p>
            <h3 class="mt-2 text-xl font-bold text-primary">${escapeHtml(course.name)}</h3>
            <p class="mt-1 text-sm text-on-surface-variant">${escapeHtml(course.level)}</p>
          </div>
          <button class="rounded-full border border-outline-variant/30 px-3 py-1 text-xs font-semibold text-on-surface-variant transition hover:border-primary hover:text-primary" data-delete-course="${index}" type="button">
            Remove
          </button>
        </div>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll("[data-delete-course]").forEach((button) => {
      button.addEventListener("click", async () => {
        const courseIndex = Number(button.getAttribute("data-delete-course"));
        await window.TuNetApp.deleteCourse(courses[courseIndex], courseIndex);
        renderCourses();
      });
    });
  };

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const course = {
        name: String(formData.get("courseName") || "").trim(),
        level: String(formData.get("courseLevel") || "").trim(),
        term: String(formData.get("courseTerm") || "").trim()
      };

      if (!course.name || !course.level || !course.term) {
        return;
      }

      await window.TuNetApp.addCourse(course);
      form.reset();
      renderCourses();
    });
  }

  renderCourses();
});
