(function () {
  const smallNavQuery = window.matchMedia("(max-width: 900px)");
  const scheduleUrl = window.location.protocol === "file:" ? "schedule.html" : "/schedule";

  document.querySelectorAll('a[href="/schedule"], a[href="/schedule/"]').forEach((link) => {
    link.setAttribute("href", scheduleUrl);
  });

  document.querySelectorAll("[data-nav]").forEach((nav) => {
    const toggle = nav.querySelector("[data-nav-toggle]");
    const menu = nav.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    function setOpen(isOpen) {
      nav.classList.toggle("nav-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));

      if (smallNavQuery.matches) {
        menu.setAttribute("aria-hidden", String(!isOpen));
      } else {
        menu.removeAttribute("aria-hidden");
      }
    }

    function syncNavState() {
      if (smallNavQuery.matches) {
        menu.setAttribute("aria-hidden", String(!nav.classList.contains("nav-open")));
      } else {
        nav.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        menu.removeAttribute("aria-hidden");
      }
    }

    toggle.addEventListener("click", () => {
      setOpen(!nav.classList.contains("nav-open"));
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (smallNavQuery.matches && !nav.contains(event.target)) setOpen(false);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    if (typeof smallNavQuery.addEventListener === "function") {
      smallNavQuery.addEventListener("change", syncNavState);
    } else {
      smallNavQuery.addListener(syncNavState);
    }

    syncNavState();
  });
})();
