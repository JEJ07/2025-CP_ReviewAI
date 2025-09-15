class PopupManager {
  constructor() {
    this.defaultSettings = {
      apiUrl: "http://localhost:8000",
      autoAnalyze: true,
      showConfidence: true,
    };

    this.init();
  }

  init() {
    this.loadSettings();
    this.bindEvents();
  }

  bindEvents() {
    // Only bind if elements exist
    const saveBtn = document.getElementById("save-settings");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.saveSettings();
      });
    }

    const openBtn = document.getElementById("open-panel");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        this.openPanel();
      });
    }

    const testBtn = document.getElementById("test-api");
    if (testBtn) {
      testBtn.addEventListener("click", () => {
        this.testAPI();
      });
    }
  }

  loadSettings() {
    chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
      const settings = { ...this.defaultSettings, ...response };

      const apiUrlInput = document.getElementById("api-url");
      if (apiUrlInput) {
        apiUrlInput.value = settings.apiUrl || this.defaultSettings.apiUrl;
      }

      const autoAnalyzeInput = document.getElementById("auto-analyze");
      if (autoAnalyzeInput) {
        autoAnalyzeInput.checked = settings.autoAnalyze !== false;
      }

      const showConfidenceInput = document.getElementById("show-confidence");
      if (showConfidenceInput) {
        showConfidenceInput.checked = settings.showConfidence !== false;
      }
    });
  }

  saveSettings() {
    const apiUrlInput = document.getElementById("api-url");
    const autoAnalyzeInput = document.getElementById("auto-analyze");
    const showConfidenceInput = document.getElementById("show-confidence");

    const settings = {
      apiUrl: apiUrlInput
        ? apiUrlInput.value.trim()
        : this.defaultSettings.apiUrl,
      autoAnalyze: autoAnalyzeInput
        ? autoAnalyzeInput.checked
        : this.defaultSettings.autoAnalyze,
      showConfidence: showConfidenceInput
        ? showConfidenceInput.checked
        : this.defaultSettings.showConfidence,
    };

    // Validate API URL
    if (!settings.apiUrl) {
      this.showStatus("Please enter a valid API URL", "error");
      return;
    }

    if (!this.isValidUrl(settings.apiUrl)) {
      this.showStatus("Please enter a valid URL format", "error");
      return;
    }

    chrome.runtime.sendMessage(
      {
        action: "saveSettings",
        settings: settings,
      },
      (response) => {
        if (response && response.success) {
          this.showStatus("Settings saved successfully!", "success");
        } else {
          this.showStatus("Failed to save settings", "error");
        }
      }
    );
  }

  openPanel() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            window.postMessage({ type: "REVIEWAI_TOGGLE_PANEL" }, "*");
          },
        });
        window.close();
      }
    });
  }

  testAPI() {
    const apiUrlInput = document.getElementById("api-url");
    const apiUrl = apiUrlInput
      ? apiUrlInput.value.trim()
      : this.defaultSettings.apiUrl;

    if (!apiUrl) {
      this.showStatus("Please enter API URL first", "error");
      return;
    }

    this.showStatus("Testing API connection...", "info");

    const testReview = "This product is amazing! Best purchase ever made.";

    fetch(`${apiUrl}/api/analyze-review/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        review_text: testReview,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      })
      .then((data) => {
        if (data.prediction) {
          this.showStatus("✅ API connection successful!", "success");
        } else {
          this.showStatus("⚠️ API responded but unexpected format", "error");
        }
      })
      .catch((error) => {
        console.error("API test failed:", error);
        this.showStatus(`❌ API test failed: ${error.message}`, "error");
      });
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  showStatus(message, type) {
    const statusEl = document.getElementById("status-message");
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `status-message status-${type}`;
      statusEl.style.display = "block";

      if (type === "success") {
        setTimeout(() => {
          statusEl.style.display = "none";
        }, 3000);
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
