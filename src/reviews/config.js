const fs = require("fs/promises");
const path = require("path");

const DEFAULT_CONFIG = {
  minimumRating: 4,
  source: "google",
  featuredReviewsOnly: false,
  requireManualApproval: false,
  hiddenReviewIds: [],
  approvedReviewIds: [],
  pinnedReviewIds: [],
  maxReviews: 6,
  cacheSeconds: 300,
  verifiedBadgeLabel: "Google review"
};

function listFromEnv(value) {
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function booleanFromEnv(value, fallback) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function numberFromEnv(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function envValue(name, fallback) {
  return process.env[name] === undefined || process.env[name] === "" ? fallback : process.env[name];
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function normalizeList(value) {
  return Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean) : [];
}

async function loadReviewConfig(cwd = process.cwd()) {
  const fileConfig = await readJsonIfExists(path.join(cwd, "config", "reviews.config.json"));
  const merged = { ...DEFAULT_CONFIG, ...fileConfig };

  merged.minimumRating = numberFromEnv(process.env.REVIEWS_MINIMUM_RATING, merged.minimumRating);
  merged.source = envValue("REVIEWS_SOURCE", merged.source);
  merged.featuredReviewsOnly = booleanFromEnv(process.env.REVIEWS_FEATURED_ONLY, merged.featuredReviewsOnly);
  merged.requireManualApproval = booleanFromEnv(process.env.REVIEWS_REQUIRE_MANUAL_APPROVAL, merged.requireManualApproval);
  merged.maxReviews = numberFromEnv(process.env.REVIEWS_MAX, merged.maxReviews);
  merged.cacheSeconds = numberFromEnv(process.env.REVIEWS_CACHE_SECONDS, merged.cacheSeconds);

  if (process.env.REVIEWS_HIDDEN_IDS !== undefined) merged.hiddenReviewIds = listFromEnv(process.env.REVIEWS_HIDDEN_IDS);
  if (process.env.REVIEWS_APPROVED_IDS !== undefined) merged.approvedReviewIds = listFromEnv(process.env.REVIEWS_APPROVED_IDS);
  if (process.env.REVIEWS_PINNED_IDS !== undefined) merged.pinnedReviewIds = listFromEnv(process.env.REVIEWS_PINNED_IDS);

  merged.hiddenReviewIds = normalizeList(merged.hiddenReviewIds);
  merged.approvedReviewIds = normalizeList(merged.approvedReviewIds);
  merged.pinnedReviewIds = normalizeList(merged.pinnedReviewIds);
  merged.minimumRating = Math.max(1, Math.min(5, merged.minimumRating));
  merged.maxReviews = Math.max(1, Math.min(24, merged.maxReviews));
  merged.cacheSeconds = Math.max(0, merged.cacheSeconds);

  return merged;
}

function publicReviewConfig(config) {
  return {
    minimumRating: config.minimumRating,
    source: config.source,
    featuredReviewsOnly: config.featuredReviewsOnly,
    requireManualApproval: config.requireManualApproval,
    maxReviews: config.maxReviews,
    verifiedBadgeLabel: config.verifiedBadgeLabel
  };
}

module.exports = { loadReviewConfig, publicReviewConfig };
