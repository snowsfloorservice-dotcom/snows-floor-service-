const crypto = require("crypto");

const TEXT_FIELDS = ["text", "reviewText", "body", "content", "comment", "message", "description"];
const NAME_FIELDS = ["customerName", "clientName", "reviewerName", "authorName", "name"];
const RATING_FIELDS = ["rating", "starRating", "stars", "score"];

function firstValue(source, fields) {
  for (const field of fields) {
    if (source && source[field] !== undefined && source[field] !== null && source[field] !== "") {
      return source[field];
    }
  }
  return undefined;
}

function nestedValue(source, paths) {
  for (const path of paths) {
    const value = path.split(".").reduce((current, key) => current && current[key], source);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function cleanText(value, fallback = "") {
  return String(value ?? fallback).replace(/\s+/g, " ").trim();
}

function stableId(review) {
  const seed = [
    review.id,
    review.customerName,
    review.text,
    review.createdAt
  ].filter(Boolean).join("|");
  return crypto.createHash("sha1").update(seed || JSON.stringify(review)).digest("hex").slice(0, 16);
}

function normalizeReview(raw, source = "jobber") {
  const text = cleanText(firstValue(raw, TEXT_FIELDS));
  const rating = Number(firstValue(raw, RATING_FIELDS));
  const customerName = cleanText(
    firstValue(raw, NAME_FIELDS) || nestedValue(raw, ["client.name", "customer.name", "author.name"]),
    "Customer"
  );

  const review = {
    id: cleanText(raw.id || raw.uuid || raw.reviewId || ""),
    customerName,
    rating,
    text,
    businessOrLocation: cleanText(
      raw.businessOrLocation || raw.businessName || raw.locationName || raw.location || nestedValue(raw, ["property.name"]),
      ""
    ),
    serviceType: cleanText(raw.serviceType || raw.service || nestedValue(raw, ["job.jobType", "workRequest.serviceType"]), ""),
    verified: Boolean(raw.verified || raw.verifiedCustomer || raw.isVerified),
    featured: Boolean(raw.featured || raw.isFeatured),
    createdAt: raw.createdAt || raw.updatedAt || raw.submittedAt || null,
    source
  };

  review.id = review.id || stableId(review);
  return review;
}

function isPinned(review, pinnedIds) {
  return pinnedIds.has(review.id);
}

function isApproved(review, approvedIds) {
  return approvedIds.has(review.id);
}

function compareReviews(a, b, pinnedIds) {
  const aPinned = isPinned(a, pinnedIds);
  const bPinned = isPinned(b, pinnedIds);
  if (aPinned !== bPinned) return aPinned ? -1 : 1;
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (b.rating !== a.rating) return b.rating - a.rating;
  return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
}

function applyReviewCuration(reviews, config) {
  const hiddenIds = new Set(config.hiddenReviewIds || []);
  const approvedIds = new Set(config.approvedReviewIds || []);
  const pinnedIds = new Set(config.pinnedReviewIds || []);

  return reviews
    .map((review) => normalizeReview(review, review.source || "jobber"))
    .filter((review) => review.text && Number.isFinite(review.rating))
    .filter((review) => review.rating >= config.minimumRating)
    .filter((review) => !hiddenIds.has(review.id))
    .filter((review) => !config.requireManualApproval || isApproved(review, approvedIds) || isPinned(review, pinnedIds))
    .filter((review) => !config.featuredReviewsOnly || review.featured || isApproved(review, approvedIds) || isPinned(review, pinnedIds))
    .sort((a, b) => compareReviews(a, b, pinnedIds))
    .slice(0, config.maxReviews);
}

module.exports = { applyReviewCuration, normalizeReview };
