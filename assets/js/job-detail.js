(function () {
  const jobs = Array.isArray(window.SNOWS_CAREERS_JOBS) ? window.SNOWS_CAREERS_JOBS : [];
  const detail = document.getElementById("jobDetail");
  const unavailable = document.getElementById("jobUnavailable");

  function setYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function slugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get("slug");
    if (querySlug) return querySlug;

    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "careers" && parts[1]) return decodeURIComponent(parts[1]);
    return "";
  }

  function jobLocations(job) {
    if (Array.isArray(job.locations) && job.locations.length) return job.locations;
    if (Array.isArray(job.cities) && job.cities.length) {
      return job.cities.map((city) => city.includes(",") ? city : `${city}, MS`);
    }
    return job.location ? [job.location] : [];
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || "";
  }

  function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function renderList(id, items) {
    const list = document.getElementById(id);
    if (!list) return;
    list.innerHTML = "";
    (Array.isArray(items) ? items : []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function appendParagraphs(block, paragraphs) {
    (Array.isArray(paragraphs) ? paragraphs : [paragraphs]).filter(Boolean).forEach((paragraph) => {
      block.appendChild(createTextElement("p", "", paragraph));
    });
  }

  function appendItems(block, items) {
    if (!Array.isArray(items) || !items.length) return;
    const list = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    block.appendChild(list);
  }

  function appendApplicationLinks(block, links) {
    if (!Array.isArray(links) || !links.length) return;
    const actions = document.createElement("div");
    actions.className = "job-application-links";

    links.forEach((link) => {
      if (!link || !link.label || !link.url) return;
      const platform = link.platform || "default";
      const anchor = document.createElement("a");
      anchor.className = `job-application-button job-application-button-${platform}`;
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = link.label;
      anchor.setAttribute("aria-label", `${link.label} for ${document.getElementById("jobTitle")?.textContent || "this job"}`);
      actions.appendChild(anchor);
    });

    if (actions.children.length) block.appendChild(actions);
  }

  function renderDetailSections(job) {
    const panel = document.querySelector(".job-panel");
    if (!panel || !Array.isArray(job.detailSections) || !job.detailSections.length) return false;

    panel.innerHTML = "";
    job.detailSections.forEach((section) => {
      const block = document.createElement("section");
      block.className = "job-block";
      if (section.heading) block.appendChild(createTextElement("h2", "", section.heading));
      appendParagraphs(block, section.paragraphs);
      appendItems(block, section.items);
      if (block.children.length) panel.appendChild(block);
    });

    if (job.closingText) {
      const block = document.createElement("section");
      block.className = "job-block";
      appendParagraphs(block, job.closingText);
      appendApplicationLinks(block, job.applicationLinks);
      panel.appendChild(block);
    }

    return true;
  }

  function renderLocations(job) {
    const container = document.getElementById("jobLocations");
    if (!container) return;
    container.innerHTML = "";
    jobLocations(job).forEach((location) => {
      container.appendChild(createTextElement("span", "job-location-chip", location));
    });
  }

  function renderJob(job) {
    document.title = `${job.title} | Careers | Snows Floor Service`;
    setText("jobTitle", job.title);
    setText("jobCompany", job.company || "Snows Floor Service");
    setText("jobCompanySidebar", job.company || "Snows Floor Service");
    setText("jobEmploymentType", job.employmentType || "Open role");
    setText("jobEmploymentTypeSidebar", job.employmentType || "Open role");
    setText("jobPayType", job.payType || "Discussed during hiring process");
    setText("jobPayTypeSidebar", job.payType || "Discussed during hiring process");
    renderLocations(job);
    if (renderDetailSections(job)) return;

    setText("jobDescription", job.description || job.shortDescription || "");
    setText("jobSchedule", job.schedule || "Schedule expectations will be discussed during the hiring process.");
    setText("jobTransportation", job.transportationRequirements || "Transportation requirements will be discussed if they apply to this role.");
    renderList("jobResponsibilities", job.responsibilities);
    renderList("jobRequirements", job.requirements);
  }

  function showUnavailable() {
    document.title = "Job Not Available | Careers | Snows Floor Service";
    if (detail) detail.hidden = true;
    if (unavailable) unavailable.hidden = false;
  }

  setYear();

  const slug = slugFromUrl();
  const job = jobs.find((candidate) => candidate.slug === slug && candidate.currentlyHiring === true);
  if (!job) {
    showUnavailable();
    return;
  }

  if (detail) detail.hidden = false;
  if (unavailable) unavailable.hidden = true;
  renderJob(job);
})();
