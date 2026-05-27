const { publicContactConfig } = require("./config");

function cleanMessage(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 1200);
}

function placeholderReply(message, config) {
  const lower = message.toLowerCase();
  const phone = config.phone.display;

  if (!message) {
    return "Hi, I can help with floor care questions, quote requests, and walkthrough scheduling. Tell me a little about your building and the service you need.";
  }

  if (lower.includes("schedule") || lower.includes("walkthrough")) {
    return "I can help start a walkthrough request. Please share your name, business/location, preferred day, and the best phone number. You can also use the Schedule a Walkthrough button to open the Jobber booking flow.";
  }

  if (lower.includes("quote") || lower.includes("price") || lower.includes("cost")) {
    return "For a quote, please send your name, phone number, business type, approximate floor area, and the service you need. A walkthrough is usually the best next step for accurate pricing.";
  }

  if (lower.includes("text") || lower.includes("sms")) {
    return config.phone.smsEnabled
      ? `SMS support is prepared for this number: ${phone}. A future Google Voice/SMS workflow can route messages into Jobber.`
      : `Text workflows are prepared in the system, but SMS is not enabled yet. Calling ${phone} is the fastest way to reach the team today.`;
  }

  return `Thanks. I can help route that into a quote or walkthrough request. For immediate help, call ${phone}, or send your name, business/location, service type, and best callback number here.`;
}

async function createJobberAiMessage(message, contactConfig) {
  const publicConfig = publicContactConfig(contactConfig);
  const clean = cleanMessage(message);

  /*
    Future Jobber AI hookup:
    If Jobber exposes an official external AI assistant API or webhook, connect
    it here using JOBBER_AI_API_ENDPOINT / JOBBER_AI_API_KEY on the server only.
    Do not return API keys, webhook secrets, or private Jobber tokens to the browser.
  */

  return {
    source: publicConfig.jobberAi.status === "ready" ? "jobber-ai-placeholder" : "placeholder",
    assistantName: publicConfig.jobberAi.assistantName,
    message: placeholderReply(clean, publicConfig),
    quickActions: [
      { label: "Request a Quote", action: "quote" },
      { label: "Schedule a Walkthrough", action: "schedule" },
      { label: "Call Now", action: "call" }
    ]
  };
}

module.exports = { createJobberAiMessage };
