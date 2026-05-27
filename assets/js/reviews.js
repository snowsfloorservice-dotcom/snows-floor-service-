(function () {
  const fallbackReviews = [
    {
      id: "featured-downtown-office",
      customerName: "Property Manager",
      rating: 5,
      text: "Snows Floor Service brought our lobby floors back to a deep, professional shine. The work was clean, efficient, and exactly what our building needed before opening Monday morning.",
      businessOrLocation: "Downtown Office Building",
      serviceType: "Strip & Wax",
      verified: true
    },
    {
      id: "featured-medical-office",
      customerName: "Facilities Director",
      rating: 5,
      text: "Reliable, polished, and easy to schedule. Their team maintained our high-traffic floors with the kind of detail we need in a professional medical environment.",
      businessOrLocation: "Medical Office",
      serviceType: "Floor Scrubbing & Maintenance",
      verified: true
    },
    {
      id: "featured-school-campus",
      customerName: "School Administrator",
      rating: 5,
      text: "The floors looked brighter, safer, and easier to maintain after service. Communication was clear and the crew worked around our schedule without disrupting the building.",
      businessOrLocation: "School Campus",
      serviceType: "VCT Floor Maintenance",
      verified: true
    }
  ];

  const clientConfig = {
    minimumRating: 4,
    verifiedBadgeLabel: "Verified customer"
  };

  const track = document.getElementById("reviewsTrack");
  const status = document.getElementById("reviewsStatus");
  const previous = document.getElementById("reviewsPrev");
  const next = document.getElementById("reviewsNext");

  if (!track) return;

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("review-status-error", Boolean(isError));
  }

  function curatedClientFallback(reviews) {
    return reviews.filter((review) => Number(review.rating) >= clientConfig.minimumRating);
  }

  function starText(rating) {
    const full = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function reviewCard(review, label) {
    const card = el("article", "review-card");
    const top = el("div", "review-card-top");
    const stars = el("div", "review-stars", starText(review.rating));
    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
    top.appendChild(stars);

    if (review.verified) {
      top.appendChild(el("span", "verified-badge", label || clientConfig.verifiedBadgeLabel));
    }

    card.appendChild(top);
    card.appendChild(el("p", "review-text", review.text));

    const footer = el("div", "review-meta");
    footer.appendChild(el("strong", "", review.customerName || "Customer"));
    const metaParts = [review.businessOrLocation, review.serviceType].filter(Boolean);
    if (metaParts.length) footer.appendChild(el("span", "", metaParts.join(" • ")));
    card.appendChild(footer);

    return card;
  }

  function renderReviews(reviews, config) {
    track.innerHTML = "";
    const label = config && config.verifiedBadgeLabel;
    reviews.forEach((review) => track.appendChild(reviewCard(review, label)));
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  }

  async function loadReviews() {
    setStatus("Loading curated customer experiences...", false);

    try {
      const payload = await fetchJson("/api/reviews?limit=6");
      if (!payload.reviews || !payload.reviews.length) throw new Error("No curated reviews returned.");
      renderReviews(payload.reviews, payload.config);
      setStatus(payload.source === "jobber" ? "Showing curated Jobber customer experiences." : "Showing featured customer experiences.", false);
      return;
    } catch (error) {
      try {
        const reviews = curatedClientFallback(await fetchJson("data/featured-reviews.json"));
        renderReviews(reviews, clientConfig);
        setStatus("Showing featured customer experiences while live reviews are unavailable.", true);
      } catch (fallbackError) {
        renderReviews(curatedClientFallback(fallbackReviews), clientConfig);
        setStatus("Showing featured customer experiences while live reviews are unavailable.", true);
      }
    }
  }

  function scrollReviews(direction) {
    const card = track.querySelector(".review-card");
    const distance = card ? card.getBoundingClientRect().width + 24 : 340;
    track.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  if (previous) previous.addEventListener("click", () => scrollReviews(-1));
  if (next) next.addEventListener("click", () => scrollReviews(1));

  loadReviews();
})();
