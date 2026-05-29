(function () {
  const EMPTY_REVIEW_TEXT = "Customer reviews will appear here soon.";
  const clientConfig = {
    minimumRating: 4,
    verifiedBadgeLabel: "Google review"
  };

  const track = document.getElementById("reviewsTrack");
  const status = document.getElementById("reviewsStatus");
  const previous = document.getElementById("reviewsPrev");
  const next = document.getElementById("reviewsNext");
  const controls = document.querySelector(".review-controls");

  if (!track) return;

  function setStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("review-status-error", Boolean(isError));
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
    if (controls) controls.hidden = false;
    const label = config && config.verifiedBadgeLabel;
    reviews.forEach((review) => track.appendChild(reviewCard(review, label)));
  }

  function renderEmptyState() {
    track.innerHTML = "";
    if (controls) controls.hidden = true;
    const card = el("article", "review-card review-empty-card");
    card.appendChild(el("p", "review-text", EMPTY_REVIEW_TEXT));
    track.appendChild(card);
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return response.json();
  }

  async function loadReviews() {
    setStatus("Checking for Google reviews...", false);

    try {
      const payload = await fetchJson("/api/reviews?limit=6");
      const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];

      if (reviews.length) {
        renderReviews(reviews, payload.config);
        setStatus("Showing positive Google reviews.", false);
        return;
      }
    } catch (error) {
      // No public fallback reviews are shown. Real Google reviews only.
    }

    renderEmptyState();
    setStatus("Google reviews will appear here when available.", false);
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
