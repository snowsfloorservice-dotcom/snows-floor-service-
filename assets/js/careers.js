(function () {
  const jobs = Array.isArray(window.SNOWS_CAREERS_JOBS) ? window.SNOWS_CAREERS_JOBS : [];
  const serviceAreas = Array.isArray(window.SNOWS_CAREER_SERVICE_AREAS) ? window.SNOWS_CAREER_SERVICE_AREAS : [];
  const nearbyLocations = Array.isArray(window.SNOWS_CAREER_NEARBY_LOCATIONS) ? window.SNOWS_CAREER_NEARBY_LOCATIONS : [];
  const ALL_LOCATIONS_LABEL = "All Mississippi Cities";
  const REMOTE_FILTER_LABEL = "Remote";
  const OUT_OF_RANGE_FILTER = "__out_of_range__";
  const MAX_LOCATION_DISTANCE_MILES = 45;
  const state = {
    location: ALL_LOCATIONS_LABEL,
    query: "",
    locationQuery: ""
  };

  const jobsGrid = document.getElementById("jobsGrid");
  const emptyState = document.getElementById("emptyCareers");
  const jobCount = document.getElementById("jobCount");
  const locationSlider = document.getElementById("locationSlider");
  const searchInput = document.getElementById("jobSearch");
  const locationSearchInput = document.getElementById("locationSearch");
  const searchForm = document.getElementById("careersSearchForm");
  const filtersToggle = document.getElementById("filtersToggle");
  const filtersMenu = document.getElementById("filtersMenu");
  const locationOptions = document.getElementById("locationOptions");
  const useCurrentLocationButton = document.getElementById("useCurrentLocation");
  const locationStatus = document.getElementById("locationStatus");

  function setYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function hiringJobs() {
    return jobs.filter((job) => job.currentlyHiring === true && job.slug);
  }

  function jobCities(job) {
    return job.cities || [];
  }

  function jobZipCodes(job) {
    return Array.isArray(job.zipCodes) ? job.zipCodes : [];
  }

  function jobIsRemote(job) {
    return job.remote === true || /remote/i.test([job.location, job.workplaceType, ...(job.locations || [])].join(" "));
  }

  function jobIsNationwideRemote(job) {
    return jobIsRemote(job) && job.nationwideRemote === true;
  }

  function jobLocations(job) {
    if (Array.isArray(job.locations) && job.locations.length) return job.locations;
    if (jobCities(job).length) {
      return jobCities(job).map((city) => city.includes(",") ? city : `${city}, MS`);
    }
    return job.location ? [job.location] : [];
  }

  function mainLocation(job) {
    return jobLocations(job)[0] || "Mississippi";
  }

  function displayLocation(job) {
    if (jobIsRemote(job)) return mainLocation(job);
    const active = activeAreaLabel();
    return active && jobLocations(job).includes(active) ? active : mainLocation(job);
  }

  function normalizeSearch(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cityFromLocationLabel(location) {
    return String(location || "").split(",")[0].trim();
  }

  function locationTerms(location) {
    return [
      location.label,
      location.city,
      `${location.city} ${location.state}`,
      ...(location.zipCodes || [])
    ].map(normalizeSearch);
  }

  function zipFromQuery(query) {
    const match = String(query || "").match(/\b\d{5}\b/);
    return match ? match[0] : "";
  }

  function hasOutsideState(query) {
    const normalized = normalizeSearch(query);
    const stateMatch = String(query || "").toUpperCase().match(/(?:^|[\s,])([A-Z]{2})(?:\s|$)/);
    return (stateMatch && stateMatch[1] !== "MS") || /\b(alabama|louisiana|tennessee|georgia|florida|texas|arkansas)\b/.test(normalized);
  }

  function serviceAreaByLabel(label) {
    return serviceAreas.find((area) => area.label === label);
  }

  function serviceAreaBySearch(query) {
    const normalized = normalizeSearch(query);
    const zip = zipFromQuery(query);
    if (!normalized) return null;
    return serviceAreas.find((area) => {
      if (zip && (area.zipCodes || []).includes(zip)) return true;
      return locationTerms(area).some((term) => term === normalized || term.includes(normalized) || normalized.includes(term));
    }) || null;
  }

  function nearbyServiceAreaBySearch(query) {
    const normalized = normalizeSearch(query);
    const zip = zipFromQuery(query);
    if (!normalized) return null;
    const match = nearbyLocations.find((location) => {
      if (zip && (location.zipCodes || []).includes(zip)) return true;
      return locationTerms(location).some((term) => term === normalized || term.includes(normalized) || normalized.includes(term));
    });
    return match ? serviceAreaByLabel(match.closestServiceArea) : null;
  }

  function resolveTypedLocation(query) {
    const normalized = normalizeSearch(query);
    if (!normalized || normalized.length < 3) return { type: "none" };
    if (normalized === "remote") return { type: "remote" };
    if (hasOutsideState(query)) return { type: "out-of-range" };

    const exactArea = serviceAreaBySearch(query);
    if (exactArea) return { type: "area", area: exactArea };

    const nearbyArea = nearbyServiceAreaBySearch(query);
    if (nearbyArea) return { type: "nearby", area: nearbyArea };

    return { type: "out-of-range" };
  }

  function activeAreaLabel() {
    const typedLocation = resolveTypedLocation(state.locationQuery);
    if ((typedLocation.type === "area" || typedLocation.type === "nearby") && typedLocation.area) return typedLocation.area.label;
    if (state.location !== ALL_LOCATIONS_LABEL && state.location !== REMOTE_FILTER_LABEL && state.location !== OUT_OF_RANGE_FILTER) return state.location;
    return "";
  }

  function locationSearchText(job) {
    return normalizeSearch([
      job.location,
      ...jobLocations(job),
      ...jobCities(job),
      ...jobZipCodes(job),
      jobIsRemote(job) ? "remote work from home mississippi" : ""
    ].join(" "));
  }

  function matchesSelectedLocation(job) {
    if (state.location === ALL_LOCATIONS_LABEL) return true;
    if (state.location === REMOTE_FILTER_LABEL) return jobIsRemote(job);
    if (state.location === OUT_OF_RANGE_FILTER) return jobIsNationwideRemote(job);
    return jobLocations(job).includes(state.location) || jobCities(job).includes(cityFromLocationLabel(state.location));
  }

  function matchesTypedLocation(job, typedLocation) {
    if (typedLocation.type === "none") return true;
    if (typedLocation.type === "remote") return jobIsRemote(job);
    if (typedLocation.type === "out-of-range") return jobIsNationwideRemote(job);
    if ((typedLocation.type === "area" || typedLocation.type === "nearby") && typedLocation.area) {
      return jobLocations(job).includes(typedLocation.area.label) || jobCities(job).includes(typedLocation.area.city);
    }
    return false;
  }

  function formatEmployment(value) {
    return String(value || "")
      .replace(/^full-time$/i, "Full-Time")
      .replace(/^part-time$/i, "Part-Time");
  }

  function createInfoItem(label, value, className) {
    const item = document.createElement("span");
    item.className = className ? `job-info-item ${className}` : "job-info-item";
    const labelNode = document.createElement("strong");
    labelNode.textContent = `${label}:`;
    item.appendChild(labelNode);
    item.appendChild(createTextElement("span", "job-info-value", value));
    return item;
  }

  function locationsForOpenJobs() {
    const activeJobs = hiringJobs();
    const activeLocationSet = new Set(activeJobs.flatMap(jobLocations));
    const locations = [ALL_LOCATIONS_LABEL];
    if (activeJobs.some(jobIsRemote)) locations.push(REMOTE_FILTER_LABEL);
    serviceAreas.forEach((area) => {
      if (activeLocationSet.has(area.label)) locations.push(area.label);
    });
    return locations;
  }

  function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function createJobCard(job) {
    const card = document.createElement("article");
    card.className = "job-card";

    const main = document.createElement("div");
    main.className = "job-listing-main";
    main.appendChild(createTextElement("h3", "", job.title));

    const locations = jobLocations(job);
    const otherLocations = Math.max(0, locations.length - 1);
    const infoRow = document.createElement("div");
    infoRow.className = "job-info-row";
    infoRow.appendChild(createInfoItem("Location", displayLocation(job)));
    infoRow.appendChild(createInfoItem("Company", "Snow's Floor Service"));
    infoRow.appendChild(createInfoItem("Employment", formatEmployment(job.employmentType)));
    if (job.payType) infoRow.appendChild(createInfoItem("Pay", job.payType));
    if (otherLocations) {
      infoRow.appendChild(createTextElement("span", "job-info-item job-other-locations", `+${otherLocations} other ${otherLocations === 1 ? "location" : "locations"}`));
    }
    main.appendChild(infoRow);
    card.appendChild(main);

    const viewButton = document.createElement("a");
    viewButton.className = "view-job-button";
    viewButton.href = `careers/${encodeURIComponent(job.slug)}`;
    viewButton.textContent = "View Job";
    viewButton.setAttribute("aria-label", `View ${job.title} job details`);
    card.appendChild(viewButton);

    return card;
  }

  function filteredJobs() {
    const query = normalizeSearch(state.query);
    const typedLocation = resolveTypedLocation(state.locationQuery);
    return hiringJobs().filter((job) => {
      const matchesLocation = matchesSelectedLocation(job);
      const searchable = [
        job.title,
        job.department,
        job.employmentType,
        job.payType,
        job.shortDescription,
        ...jobLocations(job)
      ].map(normalizeSearch).join(" ");
      const matchesQuery = !query || searchable.includes(query);
      const matchesLocationQuery = matchesTypedLocation(job, typedLocation);
      return matchesLocation && matchesQuery && matchesLocationQuery;
    });
  }

  function setFiltersOpen(isOpen) {
    if (!filtersToggle || !filtersMenu) return;
    filtersToggle.setAttribute("aria-expanded", String(isOpen));
    filtersMenu.hidden = !isOpen;
  }

  function setLocationOptionsOpen(isOpen) {
    if (!locationOptions) return;
    locationOptions.hidden = !isOpen;
  }

  function setLocationFilter(location) {
    state.location = location;
    if (locationSearchInput) {
      locationSearchInput.value = location === ALL_LOCATIONS_LABEL ? "" : location;
    }
    state.locationQuery = location === ALL_LOCATIONS_LABEL ? "" : location;
    render();
  }

  function updateLocationStatus(message, isError) {
    if (!locationStatus) return;
    locationStatus.textContent = message || "";
    locationStatus.className = isError ? "location-status location-status-error" : "location-status";
  }

  function distanceInMiles(originLatitude, originLongitude, area) {
    const earthRadiusMiles = 3958.8;
    const toRadians = (degrees) => degrees * Math.PI / 180;
    const latitudeDelta = toRadians(area.latitude - originLatitude);
    const longitudeDelta = toRadians(area.longitude - originLongitude);
    const originLat = toRadians(originLatitude);
    const areaLat = toRadians(area.latitude);
    const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(originLat) * Math.cos(areaLat) * Math.sin(longitudeDelta / 2) ** 2;
    return 2 * earthRadiusMiles * Math.asin(Math.sqrt(haversine));
  }

  function nearestServiceArea(latitude, longitude) {
    return serviceAreas
      .filter((area) => Number.isFinite(area.latitude) && Number.isFinite(area.longitude))
      .map((area) => ({ ...area, distance: distanceInMiles(latitude, longitude, area) }))
      .sort((a, b) => a.distance - b.distance)[0];
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      updateLocationStatus("Current location is not available in this browser.", true);
      return;
    }
    updateLocationStatus("Checking your current location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = nearestServiceArea(position.coords.latitude, position.coords.longitude);
        if (!nearest) {
          updateLocationStatus("We could not match your location to a hiring area.", true);
          return;
        }
        if (nearest.distance > MAX_LOCATION_DISTANCE_MILES) {
          state.location = OUT_OF_RANGE_FILTER;
          state.locationQuery = "";
          if (locationSearchInput) locationSearchInput.value = "Current location";
          updateLocationStatus("Your current location is outside our Mississippi hiring area.", true);
          render();
          return;
        }
        updateLocationStatus(`Using nearest hiring area: ${nearest.label}.`);
        setLocationFilter(nearest.label);
        setLocationOptionsOpen(false);
      },
      () => {
        updateLocationStatus("Location access was unavailable. Search by city/state or ZIP code instead.", true);
      },
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 }
    );
  }

  function updateTypedLocationStatus() {
    const typedLocation = resolveTypedLocation(state.locationQuery);
    if (typedLocation.type === "none" || typedLocation.type === "remote") {
      updateLocationStatus("");
      return;
    }
    if ((typedLocation.type === "area" || typedLocation.type === "nearby") && typedLocation.area) {
      const label = typedLocation.type === "nearby" ? "Showing closest available hiring area" : "Showing hiring area";
      updateLocationStatus(`${label}: ${typedLocation.area.label}.`);
      return;
    }
    updateLocationStatus("No matching Mississippi hiring area found.", true);
  }

  function renderLocationSlider() {
    if (!locationSlider) return;
    locationSlider.innerHTML = "";

    locationsForOpenJobs().forEach((location) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = location === state.location ? "location-chip active" : "location-chip";
      button.textContent = location;
      button.dataset.location = location;
      button.addEventListener("click", () => {
        setLocationFilter(location);
        setFiltersOpen(false);
      });
      locationSlider.appendChild(button);
    });
  }

  function renderJobs() {
    if (!jobsGrid || !emptyState || !jobCount) return;
    const visibleJobs = filteredJobs();
    jobsGrid.innerHTML = "";

    visibleJobs.forEach((job) => jobsGrid.appendChild(createJobCard(job)));
    emptyState.hidden = visibleJobs.length > 0;
    jobCount.textContent = `${visibleJobs.length} current ${visibleJobs.length === 1 ? "opening" : "openings"}`;
  }

  function render() {
    renderLocationSlider();
    renderJobs();
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderJobs();
    });
  }

  if (locationSearchInput) {
    locationSearchInput.addEventListener("focus", () => {
      updateLocationStatus("");
      setLocationOptionsOpen(true);
    });
    locationSearchInput.addEventListener("click", () => {
      setLocationOptionsOpen(true);
    });
    locationSearchInput.addEventListener("input", (event) => {
      state.locationQuery = event.target.value;
      state.location = ALL_LOCATIONS_LABEL;
      updateTypedLocationStatus();
      renderLocationSlider();
      renderJobs();
    });
  }

  if (useCurrentLocationButton) {
    useCurrentLocationButton.addEventListener("click", useCurrentLocation);
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updateTypedLocationStatus();
      renderJobs();
    });
  }

  if (filtersToggle) {
    filtersToggle.addEventListener("click", () => {
      setFiltersOpen(filtersToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  document.addEventListener("click", (event) => {
    if (!filtersMenu || !filtersToggle) return;
    if (!filtersMenu.hidden && !filtersMenu.contains(event.target) && !filtersToggle.contains(event.target)) {
      setFiltersOpen(false);
    }
    if (locationOptions && !locationOptions.hidden) {
      const locationWrap = locationOptions.closest(".location-field-wrap");
      if (!locationWrap || !locationWrap.contains(event.target)) setLocationOptionsOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setFiltersOpen(false);
      setLocationOptionsOpen(false);
    }
  });

  setYear();
  render();
})();
