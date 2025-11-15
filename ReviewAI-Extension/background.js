import { CONFIG } from "./config.js";

class ReviewAPIService {
  constructor() {
    this.apiBaseUrl = CONFIG.API_BASE_URL;
    this.endpoints = {
      analyzeSingle: "/api/analyze-review/",
      analyzeBatch: "/api/analyze-batch-reviews/",
      analyzeQuick: "/api/quick-analyze/",
      batchLimit: "/api/get-batch-limit/",
      login: "/api/login/",
      logout: "/api/logout/",
      userInfo: "/api/user-info/",
    };
  }

  // Login method
  async login(username, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}${this.endpoints.login}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success) {
        // Store token in extension storage
        await chrome.storage.local.set({ 
          authToken: data.token,
          username: data.username,
          loginTime: Date.now()
        });
        
        console.log("Login successful, token stored");
        return data;
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout method
  async logout() {
    try {
      const { authToken } = await chrome.storage.local.get(['authToken']);
      
      if (authToken) {
        await fetch(`${this.apiBaseUrl}${this.endpoints.logout}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token: authToken,
          }),
        });
      }

      // Clear stored data regardless of API call success
      await chrome.storage.local.remove(['authToken', 'username', 'loginTime']);
      console.log("Logout successful, token cleared");
      
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local data on error
      await chrome.storage.local.remove(['authToken', 'username', 'loginTime']);
      throw error;
    }
  }

  async getUserInfo() {
    try {
      const { authToken } = await chrome.storage.local.get(['authToken']);
      
      if (!authToken) {
        throw new Error("No auth token found");
      }

      const response = await fetch(`${this.apiBaseUrl}${this.endpoints.userInfo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error("Get user info error:", error);
      throw error;
    }
  }

  async isLoggedIn() {
    try {
      const { authToken, loginTime } = await chrome.storage.local.get(['authToken', 'loginTime']);
      
      if (!authToken) {
        return false;
      }

      // Check if token is not too old (optional - 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (loginTime && loginTime < thirtyDaysAgo) {
        console.log("Token expired, clearing storage");
        await chrome.storage.local.remove(['authToken', 'username', 'loginTime']);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Check login status error:", error);
      return false;
    }
  }

  async analyzeReview(reviewText, metadata = {}) {
    try {
      const { authToken } = await chrome.storage.local.get(['authToken']);
      
      const requestBody = {
        review_text: reviewText,
        platform_name: metadata.platformName || 'extension',
        product_name: metadata.productName || 'Unknown Product',
        page_url: metadata.pageUrl || '',
        link: metadata.link || '', 
        analysis_type: metadata.analysisType || 'single'
      };

      if (authToken) {
        requestBody.token = authToken;
      }

      const response = await fetch(
        `${this.apiBaseUrl}${this.endpoints.analyzeSingle}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
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
      // Get auth token from storage
      const { authToken } = await chrome.storage.local.get(['authToken']);
      
      const requestBody = {
        reviews: reviews,
        platform_name: metadata.platformName || 'extension',
        product_name: metadata.productName || 'Unknown Product',
        page_url: metadata.pageUrl || '',
        analysis_type: metadata.analysisType || 'batch'
      };

      if (authToken) {
        requestBody.token = authToken;
      }

      const response = await fetch(
        `${this.apiBaseUrl}${this.endpoints.analyzeBatch}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
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

      // Handle both formats: {results: [...]} or [...]
      const results = data.results || data;
      if (!Array.isArray(results)) {
        throw new Error("Invalid response format - expected array");
      }

      return results;
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
      link: request.link,
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

  if (request.action === "login") {
    apiService
      .login(request.username, request.password)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "logout") {
    apiService
      .logout()
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "getUserInfo") {
    apiService
      .getUserInfo()
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.action === "checkLoginStatus") {
    apiService
      .isLoggedIn()
      .then((isLoggedIn) => {
        sendResponse({ success: true, isLoggedIn: isLoggedIn });
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