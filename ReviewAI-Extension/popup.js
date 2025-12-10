class PopupManager {
  constructor() {
    this.apiUrl = "https://www.reviewai.live"; // default API URL
    this.bindEvents();
  }

  bindEvents() {
    const openBtn = document.getElementById("open-panel");
    if (openBtn) {
      openBtn.addEventListener("click", () => this.openPanel());
    }
  }

  openPanel() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => window.postMessage({ type: "REVIEWAI_TOGGLE_PANEL" }, "*"),
      });
      window.close();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
