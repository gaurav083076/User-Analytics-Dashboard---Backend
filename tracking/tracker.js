(function () {
  "use strict";
  const isLocalhost = window.location.hostname === "localhost";

  const config = {
    apiEndpoint: isLocalhost
      ? "http://localhost:5000/api/events/track"
      : "/api/events/track",
    sessionIdKey: "analytics_session_id",
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  };

  function getSessionId() {
    let sessionId = localStorage.getItem(config.sessionIdKey);
    let lastActivity = localStorage.getItem("analytics_last_activity");

    const now = Date.now();

    if (
      !sessionId ||
      !lastActivity ||
      now - parseInt(lastActivity, 10) > config.sessionTimeout
    ) {
      sessionId =
        "sess_" +
        now +
        "_" +
        Math.random().toString(36).substr(2, 9);

      localStorage.setItem(config.sessionIdKey, sessionId);
    }

    localStorage.setItem("analytics_last_activity", now.toString());
    return sessionId;
  }

  function sendEvent(eventData) {
    const data = {
      sessionId: getSessionId(),
      pageUrl: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      ...eventData
    };

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json"
      });
      navigator.sendBeacon(config.apiEndpoint, blob);
    } else {
      fetch(config.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(() => {});
    }
  }

  function trackPageView() {
    sendEvent({ eventType: "page_view" });
  }

  function trackClick(event) {
    sendEvent({
      eventType: "click",
      clickX: event.pageX,
      clickY: event.pageY
    });
  }

  function init() {
    if (document.readyState === "complete") {
      trackPageView();
    } else {
      window.addEventListener("load", trackPageView);
    }

    document.addEventListener("click", trackClick, true);

    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        trackPageView();
      }
    });

    observer.observe(document, {
      subtree: true,
      childList: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.Analytics = {
    trackEvent: sendEvent,
    trackPageView,
    getSessionId
  };
})();