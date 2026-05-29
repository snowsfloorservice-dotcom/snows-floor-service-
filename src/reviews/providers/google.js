const fs = require("fs/promises");
const path = require("path");

function reviewArrayFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.reviews)) return payload.reviews;
  if (payload.result && Array.isArray(payload.result.reviews)) return payload.result.reviews;
  if (payload.place && Array.isArray(payload.place.reviews)) return payload.place.reviews;
  if (payload.location && Array.isArray(payload.location.reviews)) return payload.location.reviews;
  return [];
}

async function readLocalGoogleReviews(cwd) {
  const configuredPath = process.env.GOOGLE_REVIEWS_JSON_PATH;
  const reviewsPath = configuredPath ? path.resolve(cwd, configuredPath) : path.join(cwd, "data", "google-reviews.json");

  try {
    const payload = JSON.parse(await fs.readFile(reviewsPath, "utf8"));
    return reviewArrayFromPayload(payload);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function fetchGoogleReviews(config, cwd = process.cwd()) {
  if (process.env.GOOGLE_REVIEWS_JSON) {
    return {
      reviews: reviewArrayFromPayload(JSON.parse(process.env.GOOGLE_REVIEWS_JSON)),
      skipped: null
    };
  }

  const localReviews = await readLocalGoogleReviews(cwd);
  if (localReviews.length) return { reviews: localReviews, skipped: null };

  /*
    Future Google Reviews integration:
    Connect GOOGLE_REVIEWS_API_URL / GOOGLE_REVIEWS_API_KEY here when a Google
    Business Profile or Places reviews integration is available. The curation
    layer already filters public output to 4-star and 5-star reviews by default.
  */
  return { reviews: [], skipped: "Google Reviews integration is not configured." };
}

module.exports = { fetchGoogleReviews };
