(function () {
  /*
    Future real gallery photos:
    Replace or add items in GALLERY_ITEMS below when Snow's Floor Service has
    actual project photos ready. Keep imageUrl pointed at the final asset path
    and update title, description, serviceType, location, and beforeAfterLabel.
  */
  const GALLERY_ITEMS = [
    {
      imageUrl: "assets/before_after_1.png",
      title: "Example Project Photo",
      description: "Template image. Replace with a real project photo later.",
      serviceType: "Gallery Template",
      location: "",
      beforeAfterLabel: "Placeholder Before / After"
    },
    {
      imageUrl: "assets/before_after_2.png",
      title: "Example Project Photo",
      description: "Template image reserved for a future customer photo.",
      serviceType: "Gallery Template",
      location: "",
      beforeAfterLabel: "Placeholder Before / After"
    },
    {
      imageUrl: "assets/before_after_3.png",
      title: "Example Project Photo",
      description: "Template image reserved for future business photos.",
      serviceType: "Gallery Template",
      location: "",
      beforeAfterLabel: "Placeholder Before / After"
    }
  ];

  const grid = document.getElementById("galleryGrid");
  const previous = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");

  if (!grid) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function galleryCard(item) {
    const card = el("article", "gallery-card");
    const image = document.createElement("img");
    image.src = item.imageUrl;
    image.alt = `${item.title}: ${item.beforeAfterLabel || item.serviceType}`;
    image.loading = "lazy";
    card.appendChild(image);

    const body = el("div", "gallery-card-body");
    const top = el("div", "gallery-card-top");
    top.appendChild(el("span", "gallery-template-label", item.serviceType || "Gallery Template"));
    if (item.beforeAfterLabel) top.appendChild(el("span", "gallery-before-after", item.beforeAfterLabel));
    body.appendChild(top);

    body.appendChild(el("h3", "", item.title));
    body.appendChild(el("p", "", item.description));

    if (item.location) {
      body.appendChild(el("span", "gallery-location", item.location));
    }

    card.appendChild(body);
    return card;
  }

  function renderGallery(items) {
    grid.innerHTML = "";
    items.forEach((item) => grid.appendChild(galleryCard(item)));
  }

  function scrollGallery(direction) {
    const card = grid.querySelector(".gallery-card");
    if (!card) return;
    grid.scrollBy({ left: direction * (card.getBoundingClientRect().width + 24), behavior: "smooth" });
  }

  if (previous) previous.addEventListener("click", () => scrollGallery(-1));
  if (next) next.addEventListener("click", () => scrollGallery(1));

  renderGallery(GALLERY_ITEMS);
})();
