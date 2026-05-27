const fs = require("fs/promises");
const path = require("path");

const DEFAULT_CONFIG = {
  businessPhoneDisplay: "(601) 348-1512",
  businessPhoneTel: "+16013481512",
  phoneProvider: "current",
  clickToCallEnabled: true,
  smsEnabled: false,
  googleVoice: {
    enabled: false,
    businessPhoneDisplay: "",
    businessPhoneTel: "",
    smsEnabled: false,
    smsWebhookUrl: ""
  },
  jobber: {
    requestWorkUrl: "[JOBBER_REQUEST_WORK_URL]",
    onlineBookingUrl: "[JOBBER_ONLINE_BOOKING_URL]"
  },
  jobberAi: {
    enabled: false,
    mode: "placeholder",
    assistantName: "Jobber AI Assistant",
    widgetEmbedUrl: "",
    serverApiEndpoint: "",
    leadWebhookUrl: ""
  }
};

function booleanFromEnv(value, fallback) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function normalizeTel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const prefixed = raw.startsWith("+") ? `+${raw.slice(1).replace(/\D/g, "")}` : raw.replace(/\D/g, "");
  return prefixed || "";
}

function telHref(value) {
  const normalized = normalizeTel(value);
  return normalized ? `tel:${normalized}` : "#";
}

function smsHref(value) {
  const normalized = normalizeTel(value);
  return normalized ? `sms:${normalized}` : "#";
}

function envValue(name, fallback) {
  return process.env[name] === undefined || process.env[name] === "" ? fallback : process.env[name];
}

function sanitizePublicUrl(value) {
  const url = String(value || "").trim();
  if (!url || url.startsWith("[")) return "";
  return url;
}

async function loadContactConfig(cwd = process.cwd()) {
  const fileConfig = await readJsonIfExists(path.join(cwd, "config", "contact.config.json"));
  const merged = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    googleVoice: { ...DEFAULT_CONFIG.googleVoice, ...(fileConfig.googleVoice || {}) },
    jobber: { ...DEFAULT_CONFIG.jobber, ...(fileConfig.jobber || {}) },
    jobberAi: { ...DEFAULT_CONFIG.jobberAi, ...(fileConfig.jobberAi || {}) }
  };

  merged.businessPhoneDisplay = envValue("BUSINESS_PHONE_DISPLAY", merged.businessPhoneDisplay);
  merged.businessPhoneTel = envValue("BUSINESS_PHONE_TEL", merged.businessPhoneTel);
  merged.phoneProvider = envValue("PHONE_PROVIDER", merged.phoneProvider);
  merged.clickToCallEnabled = booleanFromEnv(process.env.CLICK_TO_CALL_ENABLED, merged.clickToCallEnabled);
  merged.smsEnabled = booleanFromEnv(process.env.SMS_ENABLED, merged.smsEnabled);

  merged.googleVoice.enabled = booleanFromEnv(process.env.GOOGLE_VOICE_ENABLED, merged.googleVoice.enabled);
  merged.googleVoice.businessPhoneDisplay = envValue("GOOGLE_VOICE_BUSINESS_PHONE_DISPLAY", merged.googleVoice.businessPhoneDisplay);
  merged.googleVoice.businessPhoneTel = envValue("GOOGLE_VOICE_BUSINESS_PHONE_TEL", merged.googleVoice.businessPhoneTel);
  merged.googleVoice.smsEnabled = booleanFromEnv(process.env.GOOGLE_VOICE_SMS_ENABLED, merged.googleVoice.smsEnabled);
  merged.googleVoice.smsWebhookUrl = envValue("GOOGLE_VOICE_SMS_WEBHOOK_URL", merged.googleVoice.smsWebhookUrl);

  merged.jobber.requestWorkUrl = envValue("JOBBER_REQUEST_WORK_URL", merged.jobber.requestWorkUrl);
  merged.jobber.onlineBookingUrl = envValue("JOBBER_ONLINE_BOOKING_URL", merged.jobber.onlineBookingUrl);

  merged.jobberAi.enabled = booleanFromEnv(process.env.JOBBER_AI_ENABLED, merged.jobberAi.enabled);
  merged.jobberAi.mode = envValue("JOBBER_AI_MODE", merged.jobberAi.mode);
  merged.jobberAi.assistantName = envValue("JOBBER_AI_ASSISTANT_NAME", merged.jobberAi.assistantName);
  merged.jobberAi.widgetEmbedUrl = envValue("JOBBER_AI_WIDGET_EMBED_URL", merged.jobberAi.widgetEmbedUrl);
  merged.jobberAi.serverApiEndpoint = envValue("JOBBER_AI_API_ENDPOINT", merged.jobberAi.serverApiEndpoint);
  merged.jobberAi.leadWebhookUrl = envValue("JOBBER_AI_LEAD_WEBHOOK_URL", merged.jobberAi.leadWebhookUrl);

  if (merged.googleVoice.enabled && merged.googleVoice.businessPhoneTel) {
    merged.phoneProvider = "google_voice";
    merged.businessPhoneDisplay = merged.googleVoice.businessPhoneDisplay || merged.businessPhoneDisplay;
    merged.businessPhoneTel = merged.googleVoice.businessPhoneTel;
    merged.smsEnabled = merged.googleVoice.smsEnabled;
  }

  return merged;
}

function publicContactConfig(config) {
  const phoneTel = normalizeTel(config.businessPhoneTel);
  const jobberAiEmbedUrl = sanitizePublicUrl(config.jobberAi.widgetEmbedUrl);

  // Server-only future webhooks/API keys stay off this public browser payload.
  return {
    phone: {
      display: config.businessPhoneDisplay,
      tel: phoneTel,
      href: config.clickToCallEnabled ? telHref(phoneTel) : "#",
      provider: config.phoneProvider,
      clickToCallEnabled: config.clickToCallEnabled,
      smsEnabled: config.smsEnabled,
      smsHref: config.smsEnabled ? smsHref(phoneTel) : ""
    },
    googleVoice: {
      ready: config.phoneProvider === "google_voice",
      smsEnabled: Boolean(config.smsEnabled)
    },
    jobber: {
      requestWorkUrl: sanitizePublicUrl(config.jobber.requestWorkUrl),
      onlineBookingUrl: sanitizePublicUrl(config.jobber.onlineBookingUrl)
    },
    jobberAi: {
      enabled: Boolean(config.jobberAi.enabled),
      mode: config.jobberAi.mode || "placeholder",
      assistantName: config.jobberAi.assistantName || "Jobber AI Assistant",
      widgetEmbedUrl: jobberAiEmbedUrl,
      status: config.jobberAi.enabled || jobberAiEmbedUrl ? "ready" : "placeholder"
    }
  };
}

function indexTemplateValues(config) {
  const publicConfig = publicContactConfig(config);
  return {
    "{{BUSINESS_PHONE_DISPLAY}}": publicConfig.phone.display,
    "{{BUSINESS_PHONE_TEL_HREF}}": publicConfig.phone.href,
    "{{JOBBER_REQUEST_WORK_URL}}": publicConfig.jobber.requestWorkUrl || "[JOBBER_REQUEST_WORK_URL]",
    "{{JOBBER_ONLINE_BOOKING_URL}}": publicConfig.jobber.onlineBookingUrl || "[JOBBER_ONLINE_BOOKING_URL]"
  };
}

module.exports = { loadContactConfig, publicContactConfig, indexTemplateValues };
