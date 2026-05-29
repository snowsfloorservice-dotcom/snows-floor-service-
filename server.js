const fs = require("fs");
const fsp = require("fs/promises");
const http = require("http");
const path = require("path");
const { loadContactConfig, publicContactConfig, indexTemplateValues } = require("./src/contact/config");
const { createJobberAiMessage } = require("./src/contact/jobberAiService");
const { getCuratedReviews } = require("./src/reviews/reviewService");

const ROOT = __dirname;

function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml"
  }[extension] || "application/octet-stream";
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function renderIndexHtml(filePath) {
  const config = await loadContactConfig(ROOT);
  const replacements = indexTemplateValues(config);
  let html = await fsp.readFile(filePath, "utf8");

  for (const [token, value] of Object.entries(replacements)) {
    html = html.replaceAll(token, value);
  }

  return html;
}

async function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const isIndex = path.basename(filePath).toLowerCase() === "index.html";
    const file = isIndex ? await renderIndexHtml(filePath) : await fsp.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentType(filePath),
      "Cache-Control": isIndex ? "no-cache" : (url.search ? "public, max-age=31536000, immutable" : "no-cache")
    });
    res.end(file);
  } catch (error) {
    res.writeHead(error.code === "ENOENT" ? 404 : 500);
    res.end(error.code === "ENOENT" ? "Not found" : "Server error");
  }
}

loadEnvFile();

const PORT = Number(process.env.PORT || 4173);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/contact-config") {
    try {
      const config = await loadContactConfig(ROOT);
      sendJson(res, 200, publicContactConfig(config));
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/jobber-ai/message" && req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      const config = await loadContactConfig(ROOT);
      sendJson(res, 200, await createJobberAiMessage(body.message, config));
    } catch (error) {
      sendJson(res, 500, { source: "error", message: "The assistant is temporarily unavailable." });
    }
    return;
  }

  if (url.pathname === "/api/reviews") {
    try {
      const limit = url.searchParams.get("limit");
      sendJson(res, 200, await getCuratedReviews({ cwd: ROOT, limit }));
    } catch (error) {
      sendJson(res, 500, { source: "error", reviews: [], error: error.message });
    }
    return;
  }

  if (url.pathname === "/schedule" || url.pathname === "/schedule/") {
    url.pathname = "/schedule.html";
  }

  if (url.pathname === "/careers" || url.pathname === "/careers/") {
    url.pathname = "/careers.html";
  }

  if (url.pathname === "/careers/jobs" || url.pathname === "/careers/jobs/") {
    url.pathname = "/careers-jobs.html";
  }

  if (/^\/careers\/(?!jobs\/?$)[a-z0-9-]+\/?$/i.test(url.pathname)) {
    url.pathname = "/job.html";
  }

  await serveStatic(req, res, url);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Snows Floor Service site running at http://127.0.0.1:${PORT}`);
});
