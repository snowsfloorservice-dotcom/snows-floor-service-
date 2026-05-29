const { loadReviewConfig, publicReviewConfig } = require("./config");
const { applyReviewCuration } = require("./curation");
const { fetchGoogleReviews } = require("./providers/google");

let cache = null;

function cacheIsFresh(config) {
  return cache && config.cacheSeconds > 0 && Date.now() - cache.createdAt < config.cacheSeconds * 1000;
}

async function getCuratedReviews(options = {}) {
  const cwd = options.cwd || process.cwd();
  const config = await loadReviewConfig(cwd);

  if (options.limit) {
    config.maxReviews = Math.max(1, Math.min(config.maxReviews, Number(options.limit) || config.maxReviews));
  }

  if (cacheIsFresh(config)) return cache.payload;

  const errors = [];

  try {
    const googleResult = await fetchGoogleReviews(config, cwd);
    const curatedGoogleReviews = applyReviewCuration(googleResult.reviews.map((review) => ({ ...review, source: "google" })), config);

    const payload = {
      source: "google",
      usingFallback: false,
      reviews: curatedGoogleReviews,
      config: publicReviewConfig(config),
      errors: googleResult.skipped ? [googleResult.skipped] : []
    };

    cache = { createdAt: Date.now(), payload };
    return payload;
  } catch (error) {
    errors.push(error.message);
  }

  const payload = {
    source: "google",
    usingFallback: false,
    reviews: [],
    config: publicReviewConfig(config),
    errors
  };

  cache = { createdAt: Date.now(), payload };
  return payload;
}

module.exports = { getCuratedReviews };
