const fs = require("fs/promises");
const path = require("path");

async function fetchFallbackReviews(cwd = process.cwd()) {
  const fallbackPath = path.join(cwd, "data", "featured-reviews.json");
  return JSON.parse(await fs.readFile(fallbackPath, "utf8"));
}

module.exports = { fetchFallbackReviews };
