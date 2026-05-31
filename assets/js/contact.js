(function () {
  /*
    Contact integration map:
    - Phone display/click-to-call is loaded from /api/contact-config.
    - Future Google Voice number/SMS settings belong in .env or config/contact.config.json.
    - Future Jobber AI embed/API wiring belongs in the server endpoint /api/jobber-ai/message.
    - Future Jobber form endpoints are exposed as public URLs from JOBBER_REQUEST_WORK_URL and JOBBER_ONLINE_BOOKING_URL.
  */
  const state = {
    config: null,
    loading: false
  };

  const fallbackConfig = {
    phone: {
      display: document.getElementById("businessPhoneDisplay")?.textContent.trim() || "Call Us Today",
      href: document.getElementById("businessPhoneLink")?.getAttribute("href") || "#",
      clickToCallEnabled: true,
      smsEnabled: false
    },
    jobber: {
      requestWorkUrl: "",
      onlineBookingUrl: ""
    },
    jobberAi: {
      enabled: false,
      mode: "placeholder",
      assistantName: "Jobber AI Assistant",
      widgetEmbedUrl: "",
      status: "placeholder"
    }
  };

  const aiModal = document.getElementById("jobberAiModal");
  const aiStatus = document.getElementById("jobberAiStatus");
  const aiMessages = document.getElementById("jobberAiMessages");
  const aiForm = document.getElementById("jobberAiForm");
  const aiInput = document.getElementById("jobberAiInput");
  const aiEmbedMount = document.getElementById("jobberAiEmbedMount");

  function setYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function configuredUrl(value) {
    return value && !String(value).startsWith("[") ? value : "";
  }

  async function fetchConfig() {
    if (state.config || state.loading) return state.config || fallbackConfig;
    state.loading = true;

    try {
      const response = await fetch("/api/contact-config", { cache: "no-store" });
      if (!response.ok) throw new Error(`Contact config request failed: ${response.status}`);
      state.config = await response.json();
    } catch (error) {
      state.config = fallbackConfig;
    } finally {
      state.loading = false;
    }

    applyContactConfig(state.config);
    return state.config;
  }

  function applyContactConfig(config) {
    const phoneLink = document.getElementById("businessPhoneLink");
    const phoneDisplay = document.getElementById("businessPhoneDisplay");
    const phoneProvider = document.getElementById("phoneProviderLabel");
    const smsLink = document.getElementById("businessSmsLink");

    if (phoneDisplay) phoneDisplay.textContent = config.phone.display;
    if (phoneLink) phoneLink.href = config.phone.href || "#";
    if (phoneProvider) phoneProvider.textContent = config.googleVoice && config.googleVoice.ready ? "Google Voice ready" : "Click to call";

    if (smsLink) {
      smsLink.hidden = !config.phone.smsEnabled;
      smsLink.href = config.phone.smsHref || "#";
    }
  }

  function openModal(element) {
    if (element) element.classList.add("open");
  }

  function closeModal(element) {
    if (element) element.classList.remove("open");
  }

  function scheduleUrl() {
    return window.location.protocol === "file:" ? "schedule.html#request-form" : "/schedule#request-form";
  }

  window.openJobber = function openJobber() {
    window.location.assign(scheduleUrl());
  };

  window.closeJobber = function closeJobber() {
    window.location.assign(scheduleUrl());
  };

  function appendAiMessage(role, text) {
    if (!aiMessages || !text) return;
    const item = document.createElement("div");
    item.className = `ai-message ai-message-${role}`;
    item.textContent = text;
    aiMessages.appendChild(item);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function setAiStatus(text, isError) {
    if (!aiStatus) return;
    aiStatus.textContent = text;
    aiStatus.classList.toggle("ai-status-error", Boolean(isError));
  }

  function mountJobberAiEmbed(config) {
    if (!aiEmbedMount) return false;
    const url = configuredUrl(config.jobberAi.widgetEmbedUrl);
    aiEmbedMount.innerHTML = "";
    aiEmbedMount.hidden = true;

    if (!url) return false;

    /*
      Future official Jobber AI embed:
      If Jobber provides a website-safe Receptionist/AI iframe or script URL,
      set JOBBER_AI_WIDGET_EMBED_URL to that public embed URL.
    */
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.title = config.jobberAi.assistantName;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    aiEmbedMount.appendChild(iframe);
    aiEmbedMount.hidden = false;
    return true;
  }

  window.openJobberAiChat = async function openJobberAiChat() {
    openModal(aiModal);
    setAiStatus("Loading assistant...", false);
    const config = await fetchConfig();

    if (mountJobberAiEmbed(config)) {
      setAiStatus("Connected to Jobber AI assistant.", false);
      return;
    }

    if (!aiMessages.children.length) {
      appendAiMessage("assistant", "Hi, I can help with service questions, lead details, quote requests, and walkthrough scheduling. Direct Jobber AI embed/API hookup is prepared but not configured yet.");
    }
    setAiStatus("Jobber AI placeholder active. Ready for future official embed/API hookup.", false);
  };

  window.closeJobberAiChat = function closeJobberAiChat() {
    closeModal(aiModal);
  };

  async function sendAiMessage(message) {
    appendAiMessage("user", message);
    setAiStatus("Assistant is responding...", false);

    try {
      const response = await fetch("/api/jobber-ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error(`Assistant request failed: ${response.status}`);
      const payload = await response.json();
      appendAiMessage("assistant", payload.message);
      setAiStatus(payload.source === "placeholder" ? "Placeholder assistant active." : "Assistant ready.", false);
    } catch (error) {
      appendAiMessage("assistant", "The assistant is temporarily unavailable. Please call or use the quote/schedule buttons.");
      setAiStatus("Assistant unavailable.", true);
    }
  }

  if (aiForm) {
    aiForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = aiInput.value.trim();
      if (!message) return;
      aiInput.value = "";
      sendAiMessage(message);
    });
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal(aiModal);
    }
  });

  [aiModal].forEach((dialog) => {
    if (dialog) dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeModal(dialog);
    });
  });

  setYear();
  fetchConfig();
})();
