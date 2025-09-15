class ReviewAPIService {
  constructor() {
    this.apiBaseUrl = "http://localhost:8000";
    this.endpoints = {
      analyzeSingle: "/api/analyze-review/",
      analyzeBatch: "/api/analyze-batch-reviews/",
      analyzeQuick: "/api/quick-analyze/",
      batchLimit: "/api/get-batch-limit/",
    };
  }

  async analyzeReview(reviewText, metadata = {}) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}${this.endpoints.analyzeSingle}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            review_text: reviewText,
            platform_name: metadata.platformName || 'extension',
            product_name: metadata.productName || 'Unknown Product',
            page_url: metadata.pageUrl || '',
            analysis_type: metadata.analysisType || 'single'
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.prediction) {
        throw new Error("Invalid response format - missing prediction");
      }

      return data;
    } catch (error) {
      console.error("Error analyzing review:", error);
      throw error;
    }
  }

  async analyzeBatchReviews(reviews, metadata = {}) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}${this.endpoints.analyzeBatch}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            reviews: reviews,
            platform_name: metadata.platformName || 'extension',
            product_name: metadata.productName || 'Unknown Product',
            page_url: metadata.pageUrl || '',
            analysis_type: metadata.analysisType || 'batch'
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format - expected array");
      }

      return data;
    } catch (error) {
      console.error("Error analyzing batch reviews:", error);
      throw error;
    }
  }

  async analyzeQuickReview(reviewText) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}${this.endpoints.analyzeQuick}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            review_text: reviewText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.prediction) {
        throw new Error("Invalid response format - missing prediction");
      }

      return data;
    } catch (error) {
      console.error("Error in quick analysis:", error);
      throw error;
    }
  }
  

  async getBatchLimit() {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}${this.endpoints.batchLimit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error("Error fetching batch limit:", error);
      throw error;
    }
  }
}

const apiService = new ReviewAPIService();

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeSelectedReview",
    title: "Analyze Review with ReviewAI",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeSelectedReview" && info.selectionText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: analyzeSelectedText,
      args: [info.selectionText],
    });
  }
});

// Function to be injected for analyzing selected text
function analyzeSelectedText(selectedText) {
  window.postMessage(
    {
      type: "REVIEWAI_ANALYZE_SELECTION",
      text: selectedText,
    },
    "*"
  );
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeReview") {
    const metadata = {
      platformName: request.platformName,
      productName: request.productName,
      pageUrl: request.pageUrl,
      analysisType: request.analysisType
    };
    
    apiService
      .analyzeReview(request.reviewText, metadata)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "analyzeBatchReviews") {
    const metadata = {
      platformName: request.platformName,
      productName: request.productName,
      pageUrl: request.pageUrl,
      analysisType: request.analysisType
    };
    
    apiService
      .analyzeBatchReviews(request.reviews, metadata)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "analyzeQuickReview") {
    apiService
      .analyzeQuickReview(request.reviewText)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "getBatchLimit") {
    apiService
      .getBatchLimit()
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "getSettings") {
    chrome.storage.sync.get(
      ["apiUrl", "autoAnalyze", "showConfidence"],
      (result) => {
        sendResponse(result);
      }
    );
    return true;
  }

  if (request.action === "saveSettings") {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      window.postMessage({ type: "REVIEWAI_TOGGLE_PANEL" }, "*");
    },
  });
});
