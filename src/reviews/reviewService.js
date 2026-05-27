const { loadReviewConfig, publicReviewConfig } = require("./config");
const { applyReviewCuration } = require("./curation");
const { fetchFallbackReviews } = require("./providers/fallback");
const { fetchJobberReviews } = require("./providers/jobber");

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
    const jobberResult = await fetchJobberReviews(config, cwd);
    const curatedJobberReviews = applyReviewCuration(jobberResult.reviews, config);

    if (curatedJobberReviews.length) {
      const payload = {
        source: "jobber",
        usingFallback: false,
        reviews: curatedJobberReviews,
        config: publicReviewConfig(config)
      };
      cache = { createdAt: Date.now(), payload };
      return payload;
    }

    if (jobberResult.skipped) errors.push(jobberResult.skipped);
  } catch (error) {
    errors.push(error.message);
  }

  const fallbackReviews = await fetchFallbackReviews(cwd);
  const curatedFallbackReviews = applyReviewCuration(fallbackReviews.map((review) => ({ ...review, source: "fallback" })), config);
  const payload = {
    source: "fallback",
    usingFallback: true,
    reviews: curatedFallbackReviews,
    config: publicReviewConfig(config),
    errors
  };

  cache = { createdAt: Date.now(), payload };
  return payload;
}

module.exports = { getCuratedReviews };
