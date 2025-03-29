document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-button");
  const statusText = document.getElementById("status");

  chrome.storage.local.get(
    "doomMeterEnabled",
    ({ doomMeterEnabled = true }) => {
      updateUI(doomMeterEnabled);
    }
  );

  toggleButton.addEventListener("click", () => {
    chrome.storage.local.get(
      "doomMeterEnabled",
      ({ doomMeterEnabled = true }) => {
        const newValue = !doomMeterEnabled;
        chrome.storage.local.set({ doomMeterEnabled: newValue }, () => {
          updateUI(newValue);
          chrome.runtime.sendMessage({
            action: "toggle_extension",
            enabled: newValue,
          });
        });
      }
    );
  });

  function updateUI(isEnabled) {
    toggleButton.classList.toggle("on", isEnabled);
    statusText.textContent = `DoomMeter is ${isEnabled ? "ON" : "OFF"}`;
  }
});
