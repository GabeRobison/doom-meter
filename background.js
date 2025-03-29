let doomMeterEnabled = true;

chrome.storage.local.get("doomMeterEnabled", (result) => {
  doomMeterEnabled = result.doomMeterEnabled ?? true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle_extension") {
    doomMeterEnabled = message.enabled;
    doomMeterEnabled ? analyzeActiveTab() : removeDoomMeterFromAllTabs();
    sendResponse({ status: "success" });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    doomMeterEnabled &&
    isValidUrl(tab?.url)
  ) {
    analyzeTab(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (doomMeterEnabled && isValidUrl(tab?.url)) {
      analyzeTab(tabId, tab.url);
    }
  });
});

function isValidUrl(url) {
  return (
    url &&
    !["chrome://", "file://", "about:", "https://www.google.com"].some(
      (prefix) => url.startsWith(prefix)
    )
  );
}

function analyzeActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && isValidUrl(tab.url)) {
      analyzeTab(tab.id, tab.url);
    }
  });
}

function analyzeTab(tabId, url) {
  chrome.storage.local.get(`analyzed_${url}`, (result) => {
    if (result[`analyzed_${url}`]) {
      chrome.storage.local.get(`sentimentScore_${tabId}`, (scoreResult) => {
        const score = scoreResult[`sentimentScore_${tabId}`];
        if (score !== undefined) {
          injectDoomOverlay(tabId, score, getMessageForScore(score));
        }
      });
      return;
    }

    chrome.scripting.executeScript(
      { target: { tabId }, files: ["content.js"] },
      () => {
        if (chrome.runtime.lastError) {
          console.warn(
            "Script injection failed:",
            chrome.runtime.lastError.message
          );
          return;
        }

        chrome.tabs.sendMessage(
          tabId,
          { action: "extract_text" },
          (response) => {
            if (chrome.runtime.lastError || !response?.text) {
              console.warn(
                "Failed to get text:",
                chrome.runtime.lastError?.message
              );
              return;
            }

            fetchSentiment(response.text)
              .then(({ score, message }) => {
                chrome.storage.local.set({
                  [`sentimentScore_${tabId}`]: score,
                  [`analyzed_${url}`]: true,
                });
                injectDoomOverlay(tabId, score, message);
              })
              .catch((err) => console.error("Sentiment analysis failed:", err));
          }
        );
      }
    );
  });
}

function getMessageForScore(score) {
  const messages = {
    1: "Read away! This page is sunshine and rainbows. ☀️🌈",
    2: "You're safe. This page has good vibes and calm content.",
    3: "No worries here—mildly serious, but nothing troubling.",
    4: "Slightly downbeat, but manageable. Proceed with awareness.",
    5: "Neutral territory. Some negativity may be present.",
    6: "This page might carry a bit of gloom. Skim cautiously.",
    7: "Heads up: this might be a bummer. Prepare emotionally.",
    8: "Caution: the content here could dampen your mood.",
    9: "Warning: highly negative content detected.",
    10: "🚨 Doom alert! This page might ruin your whole day.",
  };
  return messages[score] || "Sentiment unknown.";
}

async function fetchSentiment(text) {
  const res = await fetch("http://localhost:3000/analyze-sentiment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

function injectDoomOverlay(tabId, score, message) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (score, message) => {
      let doomMeter = document.getElementById("doom-meter");

      if (!doomMeter) {
        doomMeter = document.createElement("div");
        doomMeter.id = "doom-meter";

        doomMeter.style = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px;
          background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
          color: #fff;
          font-size: 15px;
          font-family: 'Segoe UI', sans-serif;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(255, 76, 76, 0.3);
          border: 1px solid rgba(255, 76, 76, 0.4);
          max-width: 280px;
          z-index: 9999;
          transition: opacity 0.3s ease, transform 0.3s ease;
          backdrop-filter: blur(8px);
          animation: slideIn 0.4s ease-out;
        `;

        doomMeter.onmouseenter = () =>
          (doomMeter.style.transform = "scale(1.03)");
        doomMeter.onmouseleave = () => (doomMeter.style.transform = "scale(1)");
        document.body.appendChild(doomMeter);

        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = `
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `;
        document.head.appendChild(styleSheet);
      }

      doomMeter.innerHTML = `
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 6px;">
          Doom Meter: <span style="color: #ff4c4c">${score} / 10</span>
        </div>
        <div style="font-size: 14px; color: #ccc;">${message}</div>
      `;
    },
    args: [score, message],
  });
}

function removeDoomMeterFromAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (isValidUrl(tab?.url)) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.getElementById("doom-meter")?.remove(),
        });
      }
    }
  });
}
