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

  function renderLocations(job) {
    const container = document.getElementById("jobLocations");
    if (!container) return;
    container.innerHTML = "";
    jobLocations(job).forEach((location) => {
      container.appendChild(createTextElement("span", "job-location-chip", location));
    });
  }

  function renderJob(job) {
    document.title = `${job.title} | Careers | Snow's Floor Service`;
    setText("jobTitle", job.title);
    setText("jobCompany", job.company || "Snow's Floor Service");
    setText("jobCompanySidebar", job.company || "Snow's Floor Service");
    setText("jobEmploymentType", job.employmentType || "Open role");
    setText("jobEmploymentTypeSidebar", job.employmentType || "Open role");
    setText("jobPayType", job.payType || "Discussed during hiring process");
    setText("jobPayTypeSidebar", job.payType || "Discussed during hiring process");
    setText("jobDescription", job.description || job.shortDescription || "");
    setText("jobSchedule", job.schedule || "Schedule expectations will be discussed during the hiring process.");
    setText("jobTransportation", job.transportationRequirements || "Transportation requirements will be discussed if they apply to this role.");
    renderLocations(job);
    renderList("jobResponsibilities", job.responsibilities);
    renderList("jobRequirements", job.requirements);
  }

  function showUnavailable() {
    document.title = "Job Not Available | Careers | Snow's Floor Service";
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
