const fs = require("fs/promises");
const path = require("path");

const DEFAULT_ENDPOINT = "https://api.getjobber.com/api/graphql";
const DEFAULT_VERSION = "2025-04-16";

async function readQuery(cwd) {
  if (process.env.JOBBER_REVIEWS_GRAPHQL_QUERY) {
    return process.env.JOBBER_REVIEWS_GRAPHQL_QUERY;
  }

  return fs.readFile(path.join(cwd, "config", "jobber-reviews.graphql"), "utf8");
}

function unwrapConnection(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.nodes)) return value.nodes;
  if (Array.isArray(value.edges)) return value.edges.map((edge) => edge && edge.node).filter(Boolean);
  return [];
}

function looksLikeReview(item) {
  if (!item || typeof item !== "object") return false;
  const hasRating = ["rating", "starRating", "stars", "score"].some((field) => item[field] !== undefined);
  const hasText = ["text", "reviewText", "body", "content", "comment", "message"].some((field) => item[field]);
  return hasRating && hasText;
}

function extractReviewNodes(data) {
  const candidates = [];

  function visit(value, score = 0) {
    const connectionItems = unwrapConnection(value);
    if (connectionItems.length && connectionItems.some(looksLikeReview)) {
      candidates.push({ score, items: connectionItems });
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) return;

    for (const [key, child] of Object.entries(value)) {
      const childScore = score + (/review|testimonial/i.test(key) ? 5 : 0);
      if (Array.isArray(child) && child.some(looksLikeReview)) {
        candidates.push({ score: childScore, items: child });
      } else {
        visit(child, childScore);
      }
    }
  }

  visit(data);
  candidates.sort((a, b) => b.score - a.score || b.items.length - a.items.length);
  return candidates[0] ? candidates[0].items : [];
}

async function fetchJobberReviews(config, cwd = process.cwd()) {
  const token = process.env.JOBBER_ACCESS_TOKEN;
  if (!token) {
    return { reviews: [], skipped: "JOBBER_ACCESS_TOKEN is not configured." };
  }

  if (typeof fetch !== "function") {
    throw new Error("Node fetch is unavailable. Use Node 18 or newer for the Jobber review endpoint.");
  }

  const endpoint = process.env.JOBBER_GRAPHQL_ENDPOINT || DEFAULT_ENDPOINT;
  const version = process.env.JOBBER_GRAPHQL_VERSION || DEFAULT_VERSION;
  const query = await readQuery(cwd);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-JOBBER-GRAPHQL-VERSION": version
    },
    body: JSON.stringify({
      query,
      variables: { first: Math.max(config.maxReviews * 4, 20) }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.errors) {
    const message = payload.errors ? payload.errors.map((error) => error.message).join("; ") : response.statusText;
    throw new Error(`Jobber review fetch failed: ${message}`);
  }

  return { reviews: extractReviewNodes(payload.data), skipped: null };
}

module.exports = { fetchJobberReviews };
