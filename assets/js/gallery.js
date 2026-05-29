(function () {
  const GALLERY_ITEMS = [
    {
      beforeImageUrl: "assets/project_gallery/classroom-floor-before.jpg",
      afterImageUrl: "assets/project_gallery/classroom-floor-after.jpg",
      title: "Classroom Floor Refresh",
      description: "A classroom floor brought back to a cleaner, brighter, more professional finish.",
      serviceType: "Commercial Floor Care",
      location: "Classroom Project"
    },
    {
      beforeImageUrl: "assets/project_gallery/classroom-yellow-tile-before.jpg",
      afterImageUrl: "assets/project_gallery/classroom-yellow-tile-after.jpg",
      title: "Tile Floor Shine Restoration",
      description: "School tile floors cleaned and finished for a brighter, more polished look.",
      serviceType: "Strip & Wax",
      location: "Classroom Project"
    },
    {
      beforeImageUrl: "assets/project_gallery/hallway-floor-before.jpg",
      afterImageUrl: "assets/project_gallery/hallway-floor-after.jpg",
      title: "Hallway Floor Finish",
      description: "High-traffic hallway floor restored with a clean, reflective finish.",
      serviceType: "Floor Maintenance",
      location: "School Hallway"
    },
    {
      beforeImageUrl: "assets/project_gallery/floor-pattern-before.jpg",
      afterImageUrl: "assets/project_gallery/floor-pattern-after.jpg",
      title: "Patterned Floor Restoration",
      description: "Detailed floor pattern cleaned and finished to bring back depth and shine.",
      serviceType: "Floor Restoration",
      location: "Commercial Space"
    }
  ];

  const FINISHED_FLOOR_ITEMS = [];

  const grid = document.getElementById("galleryGrid");
  const previous = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");
  const finishedSection = document.getElementById("finishedFloors");
  const finishedGrid = document.getElementById("finishedFloorsGrid");

  if (!grid) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function comparisonPane(src, alt, label) {
    const pane = el("div", "gallery-pane");
    pane.appendChild(el("span", "gallery-image-label", label));

    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    image.decoding = "async";
    pane.appendChild(image);

    return pane;
  }

  function galleryCard(item) {
    const card = el("article", "gallery-card");
    const comparison = el("div", "gallery-comparison");
    comparison.appendChild(comparisonPane(item.beforeImageUrl, `${item.title} before floor care`, "Before"));
    comparison.appendChild(comparisonPane(item.afterImageUrl, `${item.title} after floor care`, "After"));
    card.appendChild(comparison);

    const body = el("div", "gallery-card-body");
    const top = el("div", "gallery-card-top");
    top.appendChild(el("span", "gallery-template-label", item.serviceType || "Project Result"));
    top.appendChild(el("span", "gallery-before-after", "Before / After"));
    body.appendChild(top);

    body.appendChild(el("h3", "", item.title));
    body.appendChild(el("p", "", item.description));

    if (item.location) {
      body.appendChild(el("span", "gallery-location", item.location));
    }

    card.appendChild(body);
    return card;
  }

  function finishedFloorCard(item) {
    const card = el("article", "finished-card");
    const image = document.createElement("img");
    image.src = item.imageUrl;
    image.alt = item.alt || item.title;
    image.loading = "lazy";
    image.decoding = "async";
    card.appendChild(image);

    const body = el("div", "finished-card-body");
    body.appendChild(el("h3", "", item.title));
    if (item.description) body.appendChild(el("p", "", item.description));
    card.appendChild(body);
    return card;
  }

  function renderGallery(items) {
    grid.innerHTML = "";
    items.forEach((item) => grid.appendChild(galleryCard(item)));
    grid.scrollLeft = 0;
    window.requestAnimationFrame(() => {
      grid.scrollLeft = 0;
    });
    window.setTimeout(() => {
      grid.scrollLeft = 0;
    }, 120);
    window.setTimeout(() => {
      grid.scrollLeft = 0;
    }, 900);
  }

  function renderFinishedFloors(items) {
    if (!finishedSection || !finishedGrid) return;

    if (!items.length) {
      finishedSection.hidden = true;
      return;
    }

    finishedSection.hidden = false;
    finishedGrid.innerHTML = "";
    items.forEach((item) => finishedGrid.appendChild(finishedFloorCard(item)));
  }

  function scrollGallery(direction) {
    const card = grid.querySelector(".gallery-card");
    if (!card) return;
    const styles = window.getComputedStyle(grid);
    const gap = parseFloat(styles.columnGap || styles.gap) || 24;
    const step = card.getBoundingClientRect().width + gap;
    const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
    const target = Math.min(maxScroll, Math.max(0, grid.scrollLeft + (direction * step)));
    grid.scrollTo({ left: target, behavior: "smooth" });
  }

  if (previous) previous.addEventListener("click", () => scrollGallery(-1));
  if (next) next.addEventListener("click", () => scrollGallery(1));

  renderGallery(GALLERY_ITEMS);
  renderFinishedFloors(FINISHED_FLOOR_ITEMS);
})();
