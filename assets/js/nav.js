(function () {
  const smallNavQuery = window.matchMedia("(max-width: 900px)");
  const scheduleUrl = window.location.protocol === "file:" ? "schedule.html" : "/schedule";
  const cleanRoutes = window.location.protocol !== "file:";
  const homeUrl = cleanRoutes ? window.location.origin : "index.html";
  const jobberRequestFormUrl = "https://clienthub.getjobber.com/client_hubs/9630024d-ac05-424c-8a3f-59918f467004/public/work_request/embedded_work_request_form?form_id=4794630";
  const homeScrollTargetKey = "snowsHomeScrollTarget";
  const homeScrollTargets = new Set(["top", "gallery", "reviews", "contact"]);

  function isHomePage() {
    const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
    return path === "" || path === "/" || path.endsWith("/index.html");
  }

  function cleanCurrentHash() {
    const isIndexHome = cleanRoutes && isHomePage() && window.location.pathname.toLowerCase().endsWith("/index.html");
    if ((!window.location.hash && !isIndexHome) || typeof window.history.replaceState !== "function") return;

    const cleanPath = isIndexHome ? "" : window.location.pathname;
    const cleanUrl = window.location.protocol === "file:" ? window.location.href.split("#")[0] : `${window.location.origin}${cleanPath}${window.location.search}`;
    window.history.replaceState(window.history.state, document.title, cleanUrl);
  }

  function getCurrentHashTarget() {
    if (!window.location.hash) return "";

    try {
      return decodeURIComponent(window.location.hash.slice(1));
    } catch (error) {
      return window.location.hash.slice(1);
    }
  }

  function cleanHomeSectionHash(target) {
    if (!homeScrollTargets.has(target)) return;
    cleanCurrentHash();
    window.setTimeout(cleanCurrentHash, 0);
    window.addEventListener("load", cleanCurrentHash, { once: true });
  }

  function scrollToHomeTarget(target, immediate) {
    if (!homeScrollTargets.has(target) || !isHomePage()) return false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = immediate || reducedMotion ? "auto" : "smooth";

    if (target === "top") {
      window.scrollTo({ top: 0, behavior });
    } else {
      const section = document.getElementById(target);
      if (!section) return false;
      section.scrollIntoView({ behavior, block: "start" });
    }

    if (homeScrollTargets.has(getCurrentHashTarget())) cleanCurrentHash();
    return true;
  }

  function readStoredHomeTarget() {
    try {
      const target = window.sessionStorage.getItem(homeScrollTargetKey);
      window.sessionStorage.removeItem(homeScrollTargetKey);
      return target;
    } catch (error) {
      return "";
    }
  }

  function storeHomeTarget(target) {
    try {
      window.sessionStorage.setItem(homeScrollTargetKey, target);
    } catch (error) {}
  }

  document.querySelectorAll('a[href^="/schedule"]').forEach((link) => {
    const href = link.getAttribute("href") || "";
    const hashIndex = href.indexOf("#");
    const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
    link.setAttribute("href", `${scheduleUrl}${hash}`);
  });

  document.querySelectorAll("[data-scroll-target]").forEach((link) => {
    const target = link.getAttribute("data-scroll-target") || "";
    if (!homeScrollTargets.has(target)) return;

    link.setAttribute("href", homeUrl);
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const linkTarget = link.getAttribute("target");
      if (linkTarget && linkTarget !== "_self") return;

      event.preventDefault();

      if (isHomePage()) {
        scrollToHomeTarget(target, false);
        return;
      }

      storeHomeTarget(target);
      window.location.href = homeUrl;
    });
  });

  if (isHomePage()) {
    const storedTarget = readStoredHomeTarget();
    const hashTarget = getCurrentHashTarget();
    const target = homeScrollTargets.has(storedTarget) ? storedTarget : hashTarget;

    if (homeScrollTargets.has(hashTarget)) {
      cleanHomeSectionHash(hashTarget);
    } else {
      cleanCurrentHash();
    }
    if (homeScrollTargets.has(target)) {
      window.requestAnimationFrame(() => scrollToHomeTarget(target, true));
    }
  }

  function addHeadHint(rel, href, as) {
    if (document.head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (as) link.as = as;
    document.head.appendChild(link);
  }

  function warmScheduleForm() {
    if (!document.querySelector('a[href*="schedule"]')) return;
    addHeadHint("preconnect", "https://clienthub.getjobber.com");
    addHeadHint("preconnect", "https://d3ey4dbjkt2f6s.cloudfront.net");
    addHeadHint("prefetch", jobberRequestFormUrl, "document");
  }

  function queueScheduleFormWarmup() {
    window.setTimeout(warmScheduleForm, 800);
  }

  if (document.readyState === "complete") {
    queueScheduleFormWarmup();
  } else {
    window.addEventListener("load", queueScheduleFormWarmup, { once: true });
  }

  function upgradeLinksWhenAvailable(route, selector, createHref) {
    if (!cleanRoutes || typeof fetch !== "function") return;
    fetch(route, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        if (!response.ok) return;
        document.querySelectorAll(selector).forEach((link) => {
          link.setAttribute("href", createHref(link));
        });
      })
      .catch(() => {});
  }

  if (cleanRoutes) {
    upgradeLinksWhenAvailable("/careers", 'a[href="careers.html"]', () => "/careers");
    upgradeLinksWhenAvailable("/careers/jobs", 'a[href="careers-jobs.html"], a[href="careers-jobs.html#openings"]', (link) => {
      const hash = link.getAttribute("href").includes("#") ? "#openings" : "";
      return `/careers/jobs${hash}`;
    });
  }

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
