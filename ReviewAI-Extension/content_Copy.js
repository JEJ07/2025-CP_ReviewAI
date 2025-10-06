class ReviewAIContentScript {
  constructor() {
    if (window.reviewAIInitialized) {
      console.log("ReviewAI: Already initialized globally");
      return;
    }

    this.isInitialized = false;
    this.currentUser = null;
    this.isLoggedIn = false;

    this.reviewSelectors = {
      amazon: ['div[data-hook="review-collapsed"]', ".review-text-content"],
      ebay: [".fdbk-container__details__comment"],
      flipkart: [".ZmyHeo", ".review-text"],
      shopee: [
        ".YNedDV",
        // ".item"
      ],
      lazada: [".content", ".item-content-main-content"],
      temu: ["._2EO0yd2j"],
      shein: [".rate-des"],
      alibaba: [
        "div.r-relative.r-mt-\\[4px\\].r-overflow-hidden.r-whitespace-normal.r-text-\\[14px\\].r-font-normal.r-leading-\\[18px\\].r-tracking-\\[0\\%\\].r-text-\\[\\#222\\].r-mb-\\[12px\\]",
      ],
      newegg: [".comments-content"],
      general: [
        // ".review-text",
        // ".review-content",
        // ".review-body",
        // ".product-review",
        // '[class*="review"]',
        // '[class*="comment"]',
        // ".content",
        // '[class*="content"]',
      ],
    };

    this.batchLimit = null;
    window.reviewAIInitialized = true;
    this.init();
  }

  async init() {
    if (this.isInitialized) return;

    console.log("ReviewAI: Initializing on", window.location.hostname);

    await this.checkLoginStatus();

    this.createAnalysisPanel();
    this.setupEventListeners();
    this.updateBatchLimitDisplay();
    this.setupNavigationWatcher();
    this.isInitialized = true;

    console.log("ReviewAI Content Script initialized");
  }

  async checkLoginStatus() {
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "checkLoginStatus" }, resolve);
      });

      if (response.success) {
        this.isLoggedIn = response.isLoggedIn;
        
        if (this.isLoggedIn) {
          const userResponse = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "getUserInfo" }, resolve);
          });
          
          if (userResponse.success) {
            this.currentUser = userResponse.data.user;
          }
        }
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      this.isLoggedIn = false;
      this.currentUser = null;
    }
  }

  setupNavigationWatcher() {
    let currentUrl = window.location.href;
    
    const observer = new MutationObserver(async () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log("🔄 Navigation detected, updating product name...");
        
        setTimeout(async () => {
          if (this.shadow) {
            const productName = await this.getProductName();
            const displayName = productName.length > 50 
              ? productName.substring(0, 50) + "..." 
              : productName;
              
            const productNameEl = this.shadow.querySelector(".reviewai-product-name");
            if (productNameEl) {
              productNameEl.textContent = displayName;
              productNameEl.title = productName;
              console.log("✅ Product name updated after navigation:", productName);
            }
          }
        }, 1000);
      }
    });
    
    observer.observe(document, { childList: true, subtree: true });
  }

  async getProductName() {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes("amazon.com") || hostname.includes("amazon.")) {
      const selectors = [
        "#productTitle",
        ".product-title",
        '[data-automation-id="product-title"]',
        "h1.a-size-large",
        "h1 span",
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          return element.textContent.trim();
        }
      }
    } else if (hostname.includes("shopee.ph") || hostname.includes("shopee.")) {
      const selectors = [
        "h1",
        ".vR6K3w", 
        "[data-testid='pdp-product-title']",
        ".page-product-detail__header h1",
        "h1.vR6K3w",
        ".WBVL_7",
        ".pdp-product-title",
        "[class*='product-title']",
        "[class*='product-name']"
      ];

      console.log("🔍 SHOPEE: Starting product name detection...");

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          const title = element.textContent.trim();
          console.log(`✅ SHOPEE: Immediate success with "${selector}"`);
          return title;
        }
      }

      console.log("🔍 SHOPEE: Waiting for dynamic content...");
      const title = await this.waitForShopeeProductTitle(selectors);
      if (title) {
        console.log(`✅ SHOPEE: Dynamic success`);
        return title;
      }
    } else if (
      hostname.includes("lazada.com.ph") ||
      hostname.includes("lazada.")
    ) {
      const selectors = [
        '[data-spm="product_title"]',
        ".product-title h1",
        "h1.pdp-product-title",
        'h1[class*="title"]',
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          return element.textContent.trim();
        }
      }
    }

    const genericSelectors = [
      "h1",
      ".product-title",
      ".product-name",
      '[class*="product"][class*="title"]',
      '[class*="product"][class*="name"]',
      "title",
    ];

    for (const selector of genericSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        let title = element.textContent.trim();
        title = title.replace(/\s*[-|]\s*.*/g, "");
        if (title.length > 10) {
          return title;
        }
      }
    }

    return "Product Page";
  }

  async waitForShopeeProductTitle(selectors, maxWait = 5000) {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = maxWait / 200;
      
      const checkForTitle = () => {
        attempts++;
        
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            const title = element.textContent.trim();
            console.log(`✅ SHOPEE: Found title after ${attempts * 200}ms`);
            resolve(title);
            return;
          }
        }
        
        if (attempts < maxAttempts) {
          setTimeout(checkForTitle, 200);
        } else {
          console.log("❌ SHOPEE: Timeout after 5 seconds");
          resolve(null);
        }
      };
      
      setTimeout(checkForTitle, 200);
    });
  }

  async loadShadowStyles() {
    // Your complete CSS content - paste your entire styles.css content here
    return `
      /* Reset only for panel elements */
      #reviewai-panel,
      #reviewai-panel * {
        box-sizing: border-box;
      }
      
      #reviewai-panel {
        margin: 0;
        padding: 0;
      }

      #reviewai-panel,
      #reviewai-panel * {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }

      #reviewai-panel input,
      #reviewai-panel textarea {
        background: white !important;
        color: #374151 !important;
        border: 2px solid #e0e0e0 !important;
      }

      /* Force override dark themes */
      [data-theme="dark"] #reviewai-panel,
      .dark #reviewai-panel,
      [class*="dark"] #reviewai-panel {
        background: white !important;
        color: #374151 !important;
      }

      [data-theme="dark"] #reviewai-panel input,
      .dark #reviewai-panel textarea,
      [class*="dark"] #reviewai-panel input {
        background: white !important;
        color: #374151 !important;
      }

      #reviewai-panel {
        position: fixed !important;
        top: 20px;
        right: 20px;
        width: 400px;
        z-index: 2147483647 !important;
        max-height: 80vh;
        background: #ffffff;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        transition: all 0.3s ease;
        overflow: hidden;
      }

      #reviewai-panel.reviewai-hidden {
        opacity: 0 !important;
        pointer-events: none !important;
        transition: opacity 0.2s;
      }

      /* Header Styles */
      .reviewai-header {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .reviewai-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .reviewai-close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
      }

      .reviewai-close-btn:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      /* Content Styles */
      .reviewai-content {
        max-height: calc(80vh - 70px);
        overflow-y: auto;
      }

      /* Tab Styles */
      .reviewai-tabs {
        display: flex;
        border-bottom: 1px solid #e0e0e0;
      }

      .reviewai-tab {
        flex: 1;
        padding: 12px 16px;
        background: #f8f9fa;
        color: #000000;
        border: none;
        border-bottom: 3px solid transparent;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .reviewai-tab:hover {
        background: #e9ecef;
      }

      .reviewai-tab.active {
        background: white;
        border-bottom-color: #3b82f6;
        color: #3b82f6;
      }

      /* Tab Content */
      .reviewai-tab-content {
        display: none;
        padding: 20px;
      }

      .reviewai-tab-content.active {
        display: block;
      }

      /* Input Section */
      .reviewai-input-section {
        margin-bottom: 20px;
      }

      #reviewai-text-input {
        width: 100%;
        height: 100px;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-family: inherit;
        font-size: 13px;
        resize: vertical;
        margin-bottom: 12px;
        box-sizing: border-box;
      }

      #reviewai-text-input:focus {
        outline: none;
        border-color: #3b82f6;
      }

      /* Button Styles */
      .reviewai-btn-primary {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: transform 0.2s ease;
        width: 100%;
      }

      .reviewai-btn-primary:hover {
        transform: translateY(-1px);
      }

      .reviewai-btn-secondary {
        background: #f8f9fa;
        color: #495057;
        border: 2px solid #e0e0e0;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
        width: 100%;
        margin-bottom: 10px;
      }

      .reviewai-btn-secondary:hover {
        background: #e9ecef;
        border-color: #1e3a8a;
      }

      .reviewai-btn-small {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
      }

      /* Result Styles */
      .reviewai-result-section {
        min-height: 0px;
      }

      .reviewai-result-card {
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 16px;
      }

      .reviewai-result-card.reviewai-fake {
        border-color: #dc3545;
      }

      .reviewai-result-card.reviewai-genuine {
        border-color: #28a745;
      }

      .reviewai-result-card.reviewai-medium {
        border-color: #f59e0b;
      }

      .reviewai-result-card.reviewai-uncertain {
        border-color: #6b7280;
      }

      .reviewai-result-header {
        padding: 12px 16px;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .reviewai-result-header h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .reviewai-status-icon {
        font-size: 16px;
      }

      .reviewai-main-result {
        padding: 16px;
        display: flex;
        align-items: center;
      }

      /* Circular Progress */
      .reviewai-circular-progress {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 2rem;
      }

      .reviewai-progress-circle {
        position: relative;
        width: 120px;
        height: 120px;
      }

      .reviewai-progress-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .reviewai-progress-bar {
        transition: stroke-dashoffset 1s ease-out;
      }

      .reviewai-progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }

      .reviewai-percentage {
        font-size: 1.5rem;
        font-weight: bold;
        color: #1f2937;
      }

      .reviewai-conf-label {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 2px;
      }

      /* Prediction Details */
      .reviewai-prediction-details {
        flex: 1;
        min-width: 0;
      }

      .reviewai-prediction {
        margin-bottom: 12px;
      }

      .reviewai-confidence-desc {
        margin-bottom: 8px;
      }

      .reviewai-prediction .reviewai-value {
        display: block;
        font-size: 18px;
        font-weight: 700;
        margin-top: 4px;
      }

      .reviewai-prediction .reviewai-value.reviewai-fake {
        color: #ef4444;
        font-weight: 600;
      }

      .reviewai-prediction .reviewai-value.reviewai-genuine {
        color: #28a745;
        font-weight: 600;
      }

      .reviewai-prediction .reviewai-value.reviewai-medium {
        color: #f59e0b;
        font-weight: 600;
      }

      .reviewai-prediction .reviewai-value.reviewai-uncertain {
        color: #6b7280;
        font-weight: 600;
      }

      .reviewai-label {
        font-weight: 500;
        color: #6c757d;
      }

      .reviewai-value {
        font-weight: 600;
        margin-left: 8px;
      }

      /* Probability Bars */
      .reviewai-probabilities {
        padding: 0 16px 16px;
      }

      .reviewai-probabilities h5 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
      }

      .reviewai-prob-item {
        margin-bottom: 8px;
      }

      .reviewai-prob-item span {
        font-size: 12px;
        font-weight: 500;
        color: #6c757d;
      }

      .reviewai-bar {
        height: 6px;
        background: #e9ecef;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 4px;
      }

      .reviewai-bar-fill {
        height: 100%;
        transition: width 0.5s ease;
      }

      .reviewai-bar-fill.reviewai-genuine {
        background: #28a745;
      }

      .reviewai-bar-fill.reviewai-fake {
        background: #dc3545;
      }

      /* Low Confidence Warning */
      .reviewai-low-confidence-warning {
        margin-bottom: 1rem;
        padding: 1rem;
        background-color: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 0.5rem;
      }

      .reviewai-warning-content {
        display: flex;
        align-items: center;
      }

      .reviewai-warning-icon {
        color: #d97706;
        font-size: 1.125rem;
        margin-right: 0.5rem;
      }

      .reviewai-warning-title {
        font-weight: 600;
        color: #92400e;
        font-size: 13px;
      }

      .reviewai-warning-text {
        font-size: 0.875rem;
        color: #a16207;
        margin-top: 2px;
      }

      /* Individual Predictions */
      .reviewai-individual-predictions {
        padding: 0 16px 16px;
        border-top: 1px solid #e0e0e0;
        margin-top: 12px;
        padding-top: 12px;
      }

      .reviewai-individual-predictions h5 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
      }

      .reviewai-model-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        font-size: 12px;
      }

      .reviewai-model-name {
        font-weight: 500;
        color: #6c757d;
      }

      .reviewai-model-fake {
        font-weight: 500;
        color: #dc3545;
      }

      /* Batch Analysis */
      /* .reviewai-batch-controls {
        margin-bottom: 20px;
      } */

      .reviewai-status {
        margin-top: 8px;
        font-size: 12px;
        color: #6c757d;
        font-style: italic;
      }

      .reviewai-batch-summary {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .reviewai-batch-summary h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
      }

      .reviewai-batch-limit-note {
        font-size: 12px;
        color: #6b7280;
        margin: 4px;
      }

      .reviewai-summary-stats {
        display: flex;
        gap: 16px;
      }

      .reviewai-stat {
        text-align: center;
        flex: 1;
      }

      .reviewai-stat-number {
        display: block;
        font-size: 20px;
        font-weight: 700;
        color: #495057;
      }

      .reviewai-stat.reviewai-fake .reviewai-stat-number {
        color: #ef4444;
      }

      .reviewai-stat.reviewai-genuine .reviewai-stat-number {
        color: #28a745;
      }

      .reviewai-stat-label {
        display: block;
        font-size: 11px;
        color: #6c757d;
        font-weight: 500;
        margin-top: 4px;
      }

      .reviewai-batch-results h5 {
        margin: 0 0 12px 0;
        font-size: 13px;
        font-weight: 600;
        color: #495057;
      }

      .reviewai-batch-item {
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        margin-bottom: 8px;
        padding: 12px;
        transition: all 0.2s ease;
      }

      .reviewai-batch-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .reviewai-batch-item.reviewai-fake {
        border-left: 4px solid #ef4444;
      }

      .reviewai-batch-item.reviewai-genuine {
        border-left: 4px solid #28a745;
      }

      .reviewai-batch-item.reviewai-medium {
        border-left: 4px solid #f59e0b;
      }
      .reviewai-batch-item.reviewai-uncertain {
        border-left: 4px solid #6b7280;
      }

      .reviewai-batch-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .reviewai-batch-prediction {
        font-weight: 600;
        font-size: 12px;
      }

      .reviewai-batch-confidence {
        font-size: 12px;
        color: #6c757d;
        margin-left: auto;
      }

      .reviewai-batch-preview {
        font-size: 11px;
        color: #6c757d;
        line-height: 1.4;
      }

      /* Loading Animation */
      .reviewai-loading {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.95);
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10;
      }

      .reviewai-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e0e0e0;
        border-top: 4px solid #1e3a8a;
        border-radius: 50%;
        animation: reviewai-spin 1s linear infinite;
        margin-bottom: 12px;
      }

      @keyframes reviewai-spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .reviewai-loading p {
        margin: 0;
        font-size: 13px;
        color: #6c757d;
      }

      /* Quick Analyze Buttons */
      .reviewai-analyze-quick {
        position: absolute;
        top: 5px;
        right: 5px;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 3px 6px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        opacity: 0.7;
        transition: all 0.2s ease;
        z-index: 1000;
      }

      .reviewai-analyze-quick:hover {
        opacity: 1;
        transform: scale(1.05);
      }

      /* Tooltip */
      .reviewai-tooltip {
        position: absolute;
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 6px;
        padding: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2147483646;
        animation: reviewai-fadeIn 0.2s ease;
      }

      @keyframes reviewai-fadeIn {
        from {
          opacity: 0;
          transform: translateY(-5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Toast */
      .reviewai-success-toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: #22c55e;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        z-index: 2147483647;
        transition: transform 0.3s ease;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }

      .reviewai-success-toast.reviewai-show {
        transform: translateX(-50%) translateY(0);
      }

      /* Warning Toast */
      .reviewai-warning-toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: #f59e0b;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        z-index: 2147483647;
        transition: transform 0.3s ease;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      }

      .reviewai-warning-toast.reviewai-show {
        transform: translateX(-50%) translateY(0);
      }

      /* Update Error Toast for consistency */
      .reviewai-error-toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        z-index: 2147483647;
        transition: transform 0.3s ease;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }
      /* .reviewai-error-toast {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: #dc3545;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        z-index: 2147483647;
        transition: transform 0.3s ease;
        max-width: 400px;
        text-align: center;
      } */

      .reviewai-error-toast.reviewai-show {
        transform: translateX(-50%) translateY(0);
      }

      /* Responsive Design */
      @media (max-width: 480px) {
        #reviewai-panel {
          width: calc(100vw - 40px);
          right: 20px;
          left: 20px;
        }

        #reviewai-panel.reviewai-hidden {
          transform: translateY(-100vh);
        }

        .reviewai-summary-stats {
          flex-direction: column;
          gap: 8px;
        }
      }

      /* Scrollbar Styling */
      .reviewai-content::-webkit-scrollbar {
        width: 6px;
      }

      .reviewai-content::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .reviewai-content::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }

      .reviewai-content::-webkit-scrollbar-thumb:hover {
        background: #a1a1a1;
      }

      .reviewai-model-breakdown {
        font-weight: 500;
        color: #495057;
        font-size: 12px;
      }

      .reviewai-header-content {
        flex: 1;
        min-width: 0;
      }

      .reviewai-product-name {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 400;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .reviewai-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 15px 20px;
      }

      /* Quick Tooltip Styles */
      .reviewai-quick-tooltip {
        position: absolute;
        z-index: 10001;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        animation: reviewai-tooltip-appear 0.2s ease-out;
      }

      .reviewai-analyze-button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
        white-space: nowrap;
        display: block;
      }

      .reviewai-analyze-button:hover {
        background: #1e40af;
      }

      .reviewai-quick-results {
        padding: 12px;
      }

      .reviewai-quick-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 20px;
        color: #6b7280;
        font-size: 12px;
      }

      .reviewai-spinner-small {
        width: 16px;
        height: 16px;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #3b82f6;
        border-radius: 50%;
        animation: reviewai-spin 1s linear infinite;
      }

      .reviewai-compact-result {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }

      .reviewai-compact-circle {
        position: relative;
        width: 70px;
        height: 70px;
        flex-shrink: 0;
      }

      .reviewai-circle-svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .reviewai-progress-circle {
        transition: stroke-dashoffset 0.5s ease;
      }

      .reviewai-circle-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }

      .reviewai-compact-info {
        flex: 1;
        min-width: 0;
      }

      .reviewai-prediction-line {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
      }

      .reviewai-icon {
        font-size: 16px;
      }

      .reviewai-prediction-text {
        font-weight: 600;
        font-size: 1.5em;
        color: #374151;
      }

      .reviewai-confidence-line {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
      }

      .reviewai-probabilities-compact {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 11px;
      }

      .reviewai-prob-genuine {
        color: #28a745;
        font-weight: 500;
      }

      .reviewai-prob-fake {
        color: #ef4444;
        font-weight: 500;
      }

      .reviewai-error {
        text-align: center;
        padding: 12px;
      }

      .reviewai-error span {
        display: block;
        color: #ef4444;
        font-weight: 500;
        margin-bottom: 4px;
        font-size: 12px;
      }

      .reviewai-error small {
        color: #6b7280;
        font-size: 11px;
      }

      /* Animation for tooltip */
      @keyframes reviewai-tooltip-appear {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .reviewai-quick-tooltip .reviewai-circle-center,
      .reviewai-quick-tooltip .reviewai-percentage {
        font-size: 18px !important;
        font-weight: bold;
        color: #222;
        line-height: 1;
      }
      #reviewai-panel .reviewai-circular-progress {
        margin-right: 24px !important;
      }

      #reviewai-panel .reviewai-percentage {
        font-size: 24px !important;
        font-weight: bold !important;
        color: #1f2937 !important;
        line-height: 1 !important;
      }

      #reviewai-panel .reviewai-conf-label {
        font-size: 12px !important;
        color: #6b7280 !important;
        margin-top: 2px !important;
        font-weight: 500 !important;
      }

      .reviewai-settings-section {
        padding: 20px !important;
      }

      .reviewai-settings-section h4 {
        margin: 0 0 20px 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #1e3a8a !important;
        border-bottom: 2px solid #e0e0e0 !important;
        padding-bottom: 8px !important;
      }

      .reviewai-setting-item {
        margin-bottom: 20px !important;
        padding: 16px !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 8px !important;
        background: #fafbfc !important;
        transition: all 0.2s ease !important;
      }

      .reviewai-setting-item:hover {
        border-color: #3b82f6 !important;
        background: #f8faff !important;
      }

      .reviewai-setting-desc {
        margin: 8px 0 0 0 !important;
        color: #6b7280 !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
      }

      .reviewai-pattern-status {
        margin-top: 20px !important;
      }

      .reviewai-pattern-status h5 {
        margin: 0 0 12px 0 !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        color: #495057 !important;
      }

      .reviewai-status-item {
        padding: 12px !important;
        border-radius: 6px !important;
        margin: 8px 0 !important;
        font-size: 13px !important;
      }

      .reviewai-status-item strong {
        display: block !important;
        margin-bottom: 4px !important;
        font-size: 13px !important;
      }

      .reviewai-status-item small {
        color: #6b7280 !important;
        font-size: 12px !important;
      }

      .reviewai-status-success {
        background: #dcfce7 !important;
        border: 1px solid #22c55e !important;
        color: #15803d !important;
      }

      .reviewai-status-warning {
        background: #fef3c7 !important;
        border: 1px solid #f59e0b !important;
        color: #a16207 !important;
      }

      .reviewai-status-neutral {
        background: #f3f4f6 !important;
        border: 1px solid #9ca3af !important;
        color: #374151 !important;
      }

      /* Button Styles for Settings */
      .reviewai-btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%) !important;
        color: white !important;
        padding: 10px 20px !important;
        border: none !important;
        border-radius: 6px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        font-size: 13px !important;
        transition: transform 0.2s ease !important;
        width: 100% !important;
      }

      .reviewai-btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%) !important;
        transform: translateY(-1px) !important;
      }

      /* User Selection Modal - Professional Style */
      #reviewai-selection-prompt {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 350px !important;
        z-index: 999999 !important;
        background: white !important;
        border: 2px solid #e0e0e0 !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        animation: reviewai-modal-appear 0.3s ease-out !important;
      }

      @keyframes reviewai-modal-appear {
        0% {
          transform: translateY(-20px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes reviewai-modal-disappear {
        0% {
          transform: translateY(0);
          opacity: 1;
        }
        100% {
          transform: translateY(-20px);
          opacity: 0;
        }
      }

      .reviewai-prompt-header {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
        color: white !important;
        padding: 16px !important;
        border-radius: 10px 10px 0 0 !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }

      .reviewai-prompt-header h3 {
        margin: 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
      }

      #reviewai-prompt-close {
        background: rgba(255, 255, 255, 0.2) !important;
        border: none !important;
        color: white !important;
        border-radius: 50% !important;
        width: 28px !important;
        height: 28px !important;
        cursor: pointer !important;
        font-size: 16px !important;
        font-weight: bold !important;
        transition: background-color 0.2s ease !important;
      }

      #reviewai-prompt-close:hover {
        background: rgba(255, 255, 255, 0.3) !important;
      }

      .reviewai-prompt-content {
        padding: 20px !important;
      }

      .reviewai-prompt-content p {
        margin: 0 0 16px 0 !important;
        font-size: 14px !important;
        color: #374151 !important;
        line-height: 1.4 !important;
      }

      /* Selection Status Box */
      #reviewai-selection-status {
        text-align: center !important;
        padding: 12px !important;
        background: #f8f9fa !important;
        border-radius: 8px !important;
        margin: 16px 0 !important;
        font-weight: 600 !important;
        color: #1f2937 !important;
        border: 2px solid #e0e0e0 !important;
        font-size: 13px !important;
      }

      #reviewai-mode-status {
        font-weight: 700 !important;
      }

      /* Button Styles - Match Main Panel */
      #reviewai-start-selection {
        padding: 12px 16px !important;
        border: none !important;
        border-radius: 6px !important;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        color: white !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        font-size: 13px !important;
        width: 100% !important;
        transition: transform 0.2s ease !important;
      }

      #reviewai-start-selection:hover {
        transform: translateY(-1px) !important;
      }

      #reviewai-finish-selection {
        padding: 12px 16px !important;
        border: none !important;
        border-radius: 6px !important;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
        color: white !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        font-size: 13px !important;
        width: 100% !important;
        margin-bottom: 8px !important;
        transition: transform 0.2s ease !important;
      }

      #reviewai-finish-selection:hover:not(:disabled) {
        transform: translateY(-1px) !important;
      }

      #reviewai-finish-selection:disabled {
        background: #9ca3af !important;
        cursor: not-allowed !important;
        transform: none !important;
      }

      #reviewai-cancel-selection {
        padding: 8px 16px !important;
        border: 2px solid #ef4444 !important;
        border-radius: 6px !important;
        background: white !important;
        color: #ef4444 !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        font-size: 13px !important;
        width: 100% !important;
        transition: all 0.2s ease !important;
      }

      #reviewai-cancel-selection:hover {
        background: #fef2f2 !important;
      }

      #reviewai-close-modal {
        padding: 8px 16px !important;
        border: 2px solid #6b7280 !important;
        border-radius: 6px !important;
        background: white !important;
        color: #6b7280 !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        font-size: 12px !important;
        margin-top: 8px !important;
        width: 100% !important;
        transition: all 0.2s ease !important;
      }

      #reviewai-close-modal:hover {
        background: #f9fafb !important;
        border-color: #374151 !important;
        color: #374151 !important;
      }

      .reviewai-prompt-actions {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        margin-top: 16px !important;
      }

      /* Instructions Box */
      #reviewai-instructions {
        margin-top: 16px !important;
        padding: 12px !important;
        background: #fef3c7 !important;
        border-radius: 8px !important;
        border-left: 4px solid #f59e0b !important;
        font-size: 12px !important;
        color: #92400e !important;
        line-height: 1.4 !important;
      }

      #reviewai-instructions > div {
        margin-bottom: 2px !important;
      }

      #reviewai-instructions > div:first-child {
        font-weight: 600 !important;
        margin-bottom: 6px !important;
      }

      /* Selection Mode Styles - Clean and Professional */
      .reviewai-selection-mode * {
        cursor: crosshair !important;
      }

      #reviewai-selection-prompt,
      #reviewai-selection-prompt * {
        cursor: default !important;
      }

      .reviewai-selection-mode
        *:hover:not(#reviewai-selection-prompt *):not(.reviewai-selected) {
        background-color: rgba(59, 130, 246, 0.08) !important;
        outline: 2px dashed #3b82f6 !important;
        outline-offset: 2px !important;
        transition: all 0.2s ease !important;
      }

      .reviewai-selected {
        background-color: rgba(34, 197, 94, 0.15) !important;
        outline: 3px solid #22c55e !important;
        outline-offset: 2px !important;
        position: relative !important;
        box-shadow: 0 0 15px rgba(34, 197, 94, 0.3) !important;
      }

      .reviewai-selected::before {
        content: "✓" !important;
        position: absolute !important;
        top: -15px !important;
        right: -15px !important;
        background: #22c55e !important;
        color: white !important;
        border-radius: 50% !important;
        width: 28px !important;
        height: 28px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 14px !important;
        font-weight: bold !important;
        z-index: 10000 !important;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4) !important;
        animation: reviewai-checkmark-appear 0.3s ease-out !important;
      }

      @keyframes reviewai-pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.01);
        }
        100% {
          transform: scale(1);
        }
      }

      @keyframes reviewai-checkmark-appear {
        0% {
          transform: scale(0) rotate(-180deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.1) rotate(-90deg);
          opacity: 0.8;
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }

      /* Toast Messages - Professional Style */
      .reviewai-selection-toast {
        position: fixed !important;
        bottom: 30px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: #1f2937 !important;
        color: white !important;
        padding: 12px 20px !important;
        border-radius: 8px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        z-index: 1000000 !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
        max-width: 400px !important;
        text-align: center !important;
        animation: reviewai-toast-appear 0.3s ease-out !important;
      }

      @keyframes reviewai-toast-appear {
        0% {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        100% {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }

      /* Temp Message Style */
      #reviewai-temp-message {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: #1f2937 !important;
        color: white !important;
        padding: 12px 20px !important;
        border-radius: 8px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        z-index: 10001 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        animation: reviewai-temp-message-appear 0.3s ease-out !important;
      }

      @keyframes reviewai-temp-message-appear {
        0% {
          transform: translateY(-10px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .reviewai-settings-section {
        padding: 16px 0;
      }

      .reviewai-setting-item {
        margin-bottom: 20px;
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .reviewai-setting-item:hover {
        border-color: #3b82f6;
        background: #f8faff;
      }

      .reviewai-setting-desc {
        margin: 8px 0 0 0;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.4;
      }

      .reviewai-pattern-status {
        margin-top: 20px;
      }

      .reviewai-status-item {
        padding: 12px;
        border-radius: 6px;
        margin: 8px 0;
        font-size: 13px;
      }

      .reviewai-status-item strong {
        display: block;
        margin-bottom: 4px;
        font-size: 13px;
      }

      .reviewai-status-item small {
        color: #6b7280;
        font-size: 12px;
      }

      .reviewai-status-success {
        background: #dcfce7;
        border: 1px solid #22c55e;
        color: #15803d;
      }

      .reviewai-status-warning {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        color: #a16207;
      }

      .reviewai-status-neutral {
        background: #f3f4f6;
        border: 1px solid #9ca3af;
        color: #374151;
      }

      .reviewai-btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        font-size: 13px;
        transition: transform 0.2s ease;
        width: 100%;
      }

      .reviewai-btn-danger:hover {
        background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
        transform: translateY(-1px);
      }

      #reviewai-mode-status {
        font-weight: 700 !important;
        color: #ef4444 !important;
      }

      #reviewai-mode-status.active {
        color: #10b981 !important;
      }

      #reviewai-selected-count {
        font-weight: 600;
        color: #3b82f6;
      }

      /* Active Controls Styling */
      #reviewai-active-controls {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }

      /* Instructions Styling */
      #reviewai-instructions div:first-child {
        font-weight: 600 !important;
        margin-bottom: 6px !important;
        color: #92400e !important;
      }

      #reviewai-instructions div:not(:first-child) {
        margin-bottom: 2px !important;
        color: #a16207 !important;
      }

      /* Phase Button States */
      #reviewai-finish-selection.saving {
        background: #9ca3af !important;
        cursor: not-allowed !important;
      }

      /* Toast Animation Reverse */
      .reviewai-selection-toast.fadeout {
        animation: reviewai-toast-appear 0.3s ease-out reverse !important;
      }

      .reviewai-account-section {
        padding: 20px;
      }

      /* Login Form Styles */
      .reviewai-login-form h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e3a8a;
      }

      .reviewai-login-desc {
        margin: 0 0 16px 0;
        color: #6b7280;
        font-size: 13px;
        line-height: 1.4;
      }

      .reviewai-form-group {
        margin-bottom: 16px;
      }

      .reviewai-form-group label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
      }

      .reviewai-form-group input {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
      }

      .reviewai-form-group input:focus {
        outline: none;
        border-color: #3b82f6;
      }

      .reviewai-form-actions {
        margin: 20px 0 16px 0;
      }

      .reviewai-login-help {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e5e7eb;
      }

      .reviewai-login-help p {
        margin: 8px 0;
        font-size: 12px;
        color: #6b7280;
      }

      .reviewai-login-help a {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
      }

      .reviewai-login-help a:hover {
        text-decoration: underline;
      }

      /* Account Info Styles */
      .reviewai-account-info h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e3a8a;
      }

      .reviewai-user-details {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8faff;
        border-radius: 8px;
        border: 1px solid #e0e7ff;
      }

      .reviewai-detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .reviewai-detail-row:last-child {
        margin-bottom: 0;
      }

      .reviewai-detail-label {
        font-size: 13px;
        font-weight: 500;
        color: #6b7280;
      }

      .reviewai-detail-value {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }

      .reviewai-account-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 16px;
      }

      .reviewai-account-actions a {
        display: inline-block;
        text-align: center;
        padding: 10px 20px;
        background: #f8f9fa;
        color: #495057;
        text-decoration: none;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .reviewai-account-actions a:hover {
        background: #e9ecef;
        border-color: #1e3a8a;
      }

      .reviewai-account-note {
        margin-top: 16px;
        padding: 12px;
        background: #f0f9ff;
        border-radius: 6px;
        border-left: 4px solid #3b82f6;
      }

      .reviewai-account-note p {
        margin: 0;
        font-size: 12px;
        color: #1e40af;
        line-height: 1.4;
      }

      /* Status Messages */
      .reviewai-status {
        margin-top: 12px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
      }

      .reviewai-status.reviewai-error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
      }

      .reviewai-status.reviewai-success {
        background: #f0fdf4;
        color: #16a34a;
        border: 1px solid #bbf7d0;
      }

      .reviewai-status.reviewai-warning {
        background: #fefce8;
        color: #ca8a04;
        border: 1px solid #fef08a;
      }

      /* Header Login Status Styles */
      .reviewai-user-info {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 8px;
        border-radius: 12px;
        margin-top: 4px;
        display: inline-block;
      }

      .reviewai-login-prompt {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        font-style: italic;
        margin-top: 4px;
      }

      /* Button Loading State */
      .reviewai-btn-primary:disabled {
        background: #9ca3af !important;
        cursor: not-allowed !important;
        transform: none !important;
      }

      /* Responsive adjustments for login form */
      @media (max-width: 480px) {
        .reviewai-account-actions {
          flex-direction: column;
        }
        
        .reviewai-form-group input {
          font-size: 16px;
        }
      }
    `;
  }

  async createAnalysisPanel() {
    // Remove any existing panel
    const existingHost = document.getElementById("reviewai-panel-host");
    if (existingHost) existingHost.remove();

    // Create the shadow host element
    const panelHost = document.createElement("div");
    panelHost.id = "reviewai-panel-host";
    
    // Apply minimal host styles (these won't be isolated)
    panelHost.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      width: 400px !important;
      max-height: 80vh !important;
      pointer-events: auto !important;
    `;

    // Create shadow root with open mode
    const shadow = panelHost.attachShadow({ mode: "open" });

    // Load CSS into shadow DOM
    const style = document.createElement("style");
    style.textContent = await this.loadShadowStyles();

    // Get dynamic content
    const productName = await this.getProductName();
    const displayName = productName.length > 50 
      ? productName.substring(0, 50) + "..." 
      : productName;

    const loginStatusHTML = this.isLoggedIn 
      ? `<div class="reviewai-user-info">👤 ${this.currentUser?.username || 'User'}</div>`
      : `<div class="reviewai-login-prompt">Not logged in</div>`;

    // Create panel HTML inside shadow DOM
    const panelContainer = document.createElement("div");
    panelContainer.innerHTML = `
      <div id="reviewai-panel" class="reviewai-hidden">
        <div class="reviewai-header">
          <div class="reviewai-header-content">
            <h3>ReviewAI</h3>
            <div class="reviewai-product-name" title="${productName}">${displayName}</div>
            ${loginStatusHTML}
          </div>
          <button id="reviewai-close" class="reviewai-close-btn">&times;</button>
        </div>
        <div class="reviewai-content">
          <div class="reviewai-tabs">
            <button class="reviewai-tab active" data-tab="single">Single Review</button>
            <button class="reviewai-tab" data-tab="batch">Batch Analysis</button>
            <button class="reviewai-tab" data-tab="settings">Settings</button>
            <button class="reviewai-tab" data-tab="account">Account</button>
          </div>
          
          <div id="reviewai-single-tab" class="reviewai-tab-content active">
            <div class="reviewai-input-section">
              <textarea id="reviewai-text-input" placeholder="Paste review text here or select text on the page..."></textarea>
              <button id="reviewai-analyze-btn" class="reviewai-btn-primary">Analyze Review</button>
            </div>
            <div id="reviewai-single-result" class="reviewai-result-section"></div>
          </div>
          
          <div id="reviewai-batch-tab" class="reviewai-tab-content">
            <div class="reviewai-batch-controls">
              <button id="reviewai-scrape-btn" class="reviewai-btn-secondary">Scrape Reviews</button>
              <div id="reviewai-scrape-status" class="reviewai-status"></div>
              <div class="reviewai-batch-limit-note" id="reviewai-batch-limit-display">Up to 20 reviews per batch</div>
            </div>
            <div id="reviewai-batch-result" class="reviewai-result-section"></div>
          </div>

          <div id="reviewai-settings-tab" class="reviewai-tab-content">
            <div class="reviewai-settings-section">          
              <div class="reviewai-setting-item">
                <button id="reviewai-teach-btn" class="reviewai-btn-primary">
                  Teach ReviewAI Where Reviews Are
                </button>
                <p class="reviewai-setting-desc">
                  Train ReviewAI to find reviews on this website by selecting them manually.
                </p>
              </div>

              <div class="reviewai-setting-item">
                <button id="reviewai-reset-patterns-btn" class="reviewai-btn-danger">
                  Reset Learned Patterns
                </button>
                <p class="reviewai-setting-desc">
                  Clear all learned patterns for this site and start fresh.
                </p>
              </div>

              <div class="reviewai-setting-item">
                <button id="reviewai-test-detection-btn" class="reviewai-btn-secondary">
                  Test Current Detection
                </button>
                <p class="reviewai-setting-desc">
                  See what reviews are currently detected on this page.
                </p>
              </div>

              <div id="reviewai-pattern-status" class="reviewai-pattern-status">
                <!-- Pattern status will be shown here -->
              </div>
            </div>
          </div>

          <!-- Account Tab -->
          <div id="reviewai-account-tab" class="reviewai-tab-content">
            <div class="reviewai-account-section">
              ${this.isLoggedIn ? this.createLoggedInAccountHTML() : this.createLoginFormHTML()}
            </div>
          </div>
        </div>
        <div class="reviewai-loading" id="reviewai-loading">
          <div class="reviewai-spinner"></div>
          <p>Analyzing with ML models...</p>
        </div>
      </div>
    `;

    // Append styles and content to shadow DOM
    shadow.appendChild(style);
    shadow.appendChild(panelContainer);

    // Append shadow host to document
    document.body.appendChild(panelHost);

    // Store shadow reference for later use
    this.shadow = shadow;
    this.panelHost = panelHost;

    // Setup event listeners with shadow DOM
    this.setupShadowPanelListeners();
  }

  createLoginFormHTML() {
    return `
      <div class="reviewai-login-form">
        <h4>Login to ReviewAI</h4>
        <p class="reviewai-login-desc">Log in to save your review analyses to your account and access them from the web dashboard.</p>
        
        <div class="reviewai-form-group">
          <label for="reviewai-username">Username:</label>
          <input type="text" id="reviewai-username" placeholder="Enter your username" autocomplete="username">
        </div>
        
        <div class="reviewai-form-group">
          <label for="reviewai-password">Password:</label>
          <input type="password" id="reviewai-password" placeholder="Enter your password" autocomplete="current-password">
        </div>
        
        <div class="reviewai-form-actions">
          <button id="reviewai-login-btn" class="reviewai-btn-primary">Login</button>
        </div>
        
        <div id="reviewai-login-status" class="reviewai-status"></div>
        
        <div class="reviewai-login-help">
          <p>Don't have an account? <a href="http://localhost:8000/users/register" target="_blank">Register here</a></p>
          <p>Visit <a href="http://localhost:8000" target="_blank">ReviewAI Dashboard</a></p>
        </div>
      </div>
    `;
  }

  // Create logged in account HTML
  createLoggedInAccountHTML() {
    return `
      <div class="reviewai-account-info">
        <h4>Account Information</h4>
        
        <div class="reviewai-user-details">
          <div class="reviewai-detail-row">
            <span class="reviewai-detail-label">Username:</span>
            <span class="reviewai-detail-value">${this.currentUser?.username || 'N/A'}</span>
          </div>
          <div class="reviewai-detail-row">
            <span class="reviewai-detail-label">Email:</span>
            <span class="reviewai-detail-value">${this.currentUser?.email || 'N/A'}</span>
          </div>
          <div class="reviewai-detail-row">
            <span class="reviewai-detail-label">Full Name:</span>
            <span class="reviewai-detail-value">${
              this.currentUser?.first_name && this.currentUser?.last_name 
                ? `${this.currentUser.first_name} ${this.currentUser.last_name}`
                : 'N/A'
            }</span>
          </div>
        </div>
        
        <div class="reviewai-account-actions">
          <button id="reviewai-logout-btn" class="reviewai-btn-danger">Logout</button>
          <a href="http://localhost:8000/dashboard" target="_blank" class="reviewai-btn-secondary">Open Web Dashboard</a>
        </div>
        
        <div id="reviewai-account-status" class="reviewai-status"></div>
        
        <div class="reviewai-account-note">
          <p>Your extension reviews are being saved to your account and will appear in your web dashboard.</p>
        </div>
      </div>
    `;
  }

  setupShadowPanelListeners() {
    // Use shadow.getElementById instead of document.getElementById
    this.shadow.getElementById("reviewai-close").addEventListener("click", () => {
      this.hidePanel();
    });

    this.shadow.querySelectorAll(".reviewai-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    this.shadow.getElementById("reviewai-analyze-btn").addEventListener("click", () => {
      const text = this.shadow.getElementById("reviewai-text-input").value.trim();
      if (text) {
        this.analyzeSingleReview(text);
      }
    });

    this.shadow.getElementById("reviewai-scrape-btn").addEventListener("click", async () => {
      await this.scrapeBatchReviews();
    });

    this.shadow.getElementById("reviewai-teach-btn")?.addEventListener("click", () => {
      this.startUserSelectionFromUI();
    });

    this.shadow.getElementById("reviewai-reset-patterns-btn")?.addEventListener("click", () => {
      this.resetLearnedPatterns();
    });

    this.shadow.getElementById("reviewai-test-detection-btn")?.addEventListener("click", () => {
      this.testCurrentDetection();
    });

    this.shadow.querySelector('[data-tab="settings"]')?.addEventListener("click", () => {
      this.updatePatternStatus();
    });

    this.setupShadowAccountListeners();
  }

  setupShadowAccountListeners() {
    const loginBtn = this.shadow.getElementById("reviewai-login-btn");
    const logoutBtn = this.shadow.getElementById("reviewai-logout-btn");

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        this.handleLogin();
      });

      const usernameInput = this.shadow.getElementById("reviewai-username");
      const passwordInput = this.shadow.getElementById("reviewai-password");
      
      [usernameInput, passwordInput].forEach(input => {
        if (input) {
          input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              this.handleLogin();
            }
          });
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.handleLogout();
      });
    }
  }

  setupEventListeners() {
    window.addEventListener("message", (event) => {
      if (event.data.type === "REVIEWAI_TOGGLE_PANEL") {
        console.log("Panel toggle received");
        this.togglePanel();
      }
      if (event.data.type === "REVIEWAI_ANALYZE_SELECTION") {
        this.analyzeSingleReview(event.data.text);
        this.showPanel();
      }
    });

    document.addEventListener("mouseup", (e) => {
      setTimeout(() => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText && selectedText.length > 10) {
          this.showQuickAnalyzeOption(selectedText, e.clientX, e.clientY);
        }
      }, 100);
    });
  }

  setupAccountListeners() {
    const loginBtn = this.shadow.getElementById("reviewai-login-btn");
    const logoutBtn = this.shadow.getElementById("reviewai-logout-btn");

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        this.handleLogin();
      });

      // Allow Enter key to submit login
      const usernameInput = this.shadow.getElementById("reviewai-username");
      const passwordInput = this.shadow.getElementById("reviewai-password");

      [usernameInput, passwordInput].forEach(input => {
        if (input) {
          input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              this.handleLogin();
            }
          });
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.handleLogout();
      });
    }
  }

  // Handle login
  async handleLogin() {
    const usernameInput = this.shadow.getElementById("reviewai-username");
    const passwordInput = this.shadow.getElementById("reviewai-password");
    const loginBtn = this.shadow.getElementById("reviewai-login-btn");
    const statusDiv = this.shadow.getElementById("reviewai-login-status");

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      statusDiv.textContent = "Please enter both username and password";
      statusDiv.className = "reviewai-status reviewai-error";
      return;
    }

    // Show loading state
    loginBtn.textContent = "Logging in...";
    loginBtn.disabled = true;
    statusDiv.textContent = "Connecting...";
    statusDiv.className = "reviewai-status";

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: "login",
          username: username,
          password: password
        }, resolve);
      });

      if (response.success) {
        // Login successful
        statusDiv.textContent = "Login successful! Refreshing...";
        statusDiv.className = "reviewai-status reviewai-success";

        // Update local state FIRST
        this.isLoggedIn = true;
        this.currentUser = { 
          username: response.data.username || username // Use returned username or fallback
        };

        // Get complete user info after login
        try {
          const userResponse = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "getUserInfo" }, resolve);
          });
          
          if (userResponse.success) {
            this.currentUser = userResponse.data.user;
          }
        } catch (userInfoError) {
          console.warn("Failed to get user info:", userInfoError);
          // Keep basic user info from login response
        }

        // Refresh the panel with updated state
        setTimeout(() => {
          this.refreshPanel();
          this.switchTab("account");
        }, 1000);

      } else {
        statusDiv.textContent = response.error || "Login failed";
        statusDiv.className = "reviewai-status reviewai-error";
        loginBtn.textContent = "Login";
        loginBtn.disabled = false;
      }
    } catch (error) {
      statusDiv.textContent = "Connection failed. Please try again.";
      statusDiv.className = "reviewai-status reviewai-error";
      loginBtn.textContent = "Login";
      loginBtn.disabled = false;
    }
  }

  // Handle logout
  async handleLogout() {
    const logoutBtn = this.shadow.getElementById("reviewai-logout-btn");
    const statusDiv = this.shadow.getElementById("reviewai-account-status");

    // Show loading state
    logoutBtn.textContent = "Logging out...";
    logoutBtn.disabled = true;
    statusDiv.textContent = "Disconnecting...";
    statusDiv.className = "reviewai-status";

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "logout" }, resolve);
      });

      // Update local state regardless of API response
      this.isLoggedIn = false;
      this.currentUser = null;

      statusDiv.textContent = "Logged out successfully! Refreshing...";
      statusDiv.className = "reviewai-status reviewai-success";

      // Refresh the panel with updated state
      setTimeout(() => {
        this.refreshPanel();
        this.switchTab("account");
      }, 1000);

    } catch (error) {
      // Still logout locally even if API call fails
      this.isLoggedIn = false;
      this.currentUser = null;
      
      statusDiv.textContent = "Logged out (connection error)";
      statusDiv.className = "reviewai-status reviewai-warning";
      
      setTimeout(() => {
        this.refreshPanel();
        this.switchTab("account");
      }, 1000);
    }
  }

  // Refresh panel after login/logout
  async refreshPanel() {
    // Remove the host element instead of just the panel
    if (this.panelHost) {
      this.panelHost.remove();
    }
    
    await this.checkLoginStatus();
    this.createAnalysisPanel();
    this.showPanel();
  }

  // addAnalyzeButtons() {
  //   try {
  //     const reviews = this.detectReviews();
  //     console.log(`ReviewAI: Adding buttons to ${reviews.length} reviews`);

  //     reviews.forEach((review, index) => {
  //       try {
  //         if (!review.querySelector(".reviewai-analyze-quick")) {
  //           const button = document.createElement("button");
  //           button.className = "reviewai-analyze-quick";
  //           button.textContent = "🔍 Analyze";
  //           button.title = "Analyze this review with ReviewAI";

  //           button.addEventListener("click", (e) => {
  //             e.preventDefault();
  //             e.stopPropagation();
  //             const reviewText = this.extractReviewText(review);
  //             if (reviewText && reviewText.length > 10) {
  //               this.analyzeSingleReview(reviewText);
  //               this.showPanel();
  //             } else {
  //               this.showError("Unable to extract review text");
  //             }
  //           });

  //           if (
  //             review.style.position !== "absolute" &&
  //             review.style.position !== "fixed"
  //           ) {
  //             review.style.position = "relative";
  //           }
  //           review.appendChild(button);
  //         }
  //       } catch (error) {
  //         console.warn(
  //           `ReviewAI: Error adding button to review ${index}:`,
  //           error
  //         );
  //       }
  //     });
  //   } catch (error) {
  //     console.error("ReviewAI: Error in addAnalyzeButtons:", error);
  //   }
  // }

  async detectReviews() {
    const hostname = window.location.hostname.toLowerCase();
    console.log(`🔍 === DETECT REVIEWS DEBUG FOR ${hostname} ===`);

    // 1. FIRST: Try user-learned patterns (highest priority)
    const userPatterns = await this.getUserLearnedPatterns(hostname);
    console.log(`🔍 Step 1 - User patterns:`, userPatterns);
    if (userPatterns && userPatterns.selectors.length > 0) {
      const reviews = this.trySelectors(userPatterns.selectors);
      if (reviews.length > 0) {
        console.log(`✅ SUCCESS - USER PATTERNS: ${reviews.length} reviews`);
        return this.removeDuplicateReviews(reviews);
      } else {
        console.log(`⚠️ User patterns found 0 reviews, continuing...`);
      }
    }

    const isSupportedSite =
      hostname.includes("amazon.") ||
      hostname.includes("shopee.") ||
      hostname.includes("lazada.") ||
      hostname.includes("ebay.") ||
      hostname.includes("temu.") ||
      hostname.includes("shein.") ||
      hostname.includes("flipkart.") ||
      hostname.includes("alibaba.") ||
      hostname.includes("newegg.");

    console.log(`🔍 Step 2 - Is supported site:`, isSupportedSite);

    // 2. SECOND: Hardcoded selectors (supported sites)
    if (isSupportedSite) {
      const hardcodedReviews = this.detectReviewsWithHardcodedSelectors();
      console.log(
        `🔍 Step 2 - Hardcoded reviews found:`,
        hardcodedReviews.length
      );
      if (hardcodedReviews.length > 0) {
        console.log(
          `✅ SUCCESS - HARDCODED SELECTORS: ${hardcodedReviews.length} reviews`
        );
        return this.removeDuplicateReviews(hardcodedReviews);
      }
    }

    // 3. THIRD: Try saved intelligent patterns
    const savedPatterns = await this.getSavedPatterns(hostname);
    console.log(`🔍 Step 3 - Saved intelligent patterns:`, savedPatterns);
    if (savedPatterns && savedPatterns.selectors.length > 0) {
      const reviews = this.trySelectors(savedPatterns.selectors);
      if (reviews.length > 0) {
        console.log(
          `✅ SUCCESS - SAVED INTELLIGENT: ${reviews.length} reviews`
        );
        return this.removeDuplicateReviews(reviews);
      }
    }

    // 4. FOURTH: Try general hardcoded selectors for unknown sites
    const hardcodedReviews = this.detectReviewsWithHardcodedSelectors();
    console.log(`🔍 Step 4 - General hardcoded:`, hardcodedReviews.length);
    if (hardcodedReviews.length >= 3) {
      console.log(
        `✅ SUCCESS - GENERAL HARDCODED: ${hardcodedReviews.length} reviews`
      );
      return this.removeDuplicateReviews(hardcodedReviews);
    }

    // 5. FIFTH: LAST RESORT: Intelligent detection (more restrictive)
    console.log(`🔍 Step 5 - Running intelligent detection...`);
    const intelligentReviews = this.findReviewPatterns();
    console.log(
      `🔍 Step 5 - Intelligent detection found:`,
      intelligentReviews.length
    );
    if (intelligentReviews.length >= 3) {
      console.log(
        `✅ SUCCESS - INTELLIGENT DETECTION: ${intelligentReviews.length} reviews`
      );
      console.log(`⚠️ SAVING NEW INTELLIGENT PATTERNS...`);
      await this.saveIntelligentPattern(hostname, intelligentReviews);
      return this.removeDuplicateReviews(intelligentReviews);
    }

    // 6. NO REVIEWS FOUND: Prompt user to teach the system
    console.log(`❌ NO REVIEWS FOUND - All methods failed`);
    this.promptUserSelection(hostname);
    return [];
  }

  detectReviewsWithHardcodedSelectors() {
    const hostname = window.location.hostname.toLowerCase();
    let selectors = this.reviewSelectors.general;

    if (hostname.includes("amazon.com") || hostname.includes("amazon.")) {
      selectors = [...this.reviewSelectors.amazon];
    } else if (hostname.includes("shopee.ph") || hostname.includes("shopee.")) {
      selectors = [...this.reviewSelectors.shopee];
    } else if (
      hostname.includes("lazada.com.ph") ||
      hostname.includes("lazada.")
    ) {
      selectors = [...this.reviewSelectors.lazada];
    } else if (hostname.includes("ebay.com") || hostname.includes("ebay.")) {
      selectors = [...this.reviewSelectors.ebay];
    } else if (hostname.includes("temu.com") || hostname.includes("temu.")) {
      selectors = [...this.reviewSelectors.temu];
    } else if (hostname.includes("shein.com") || hostname.includes("shein.")) {
      selectors = [...this.reviewSelectors.shein];
    } else if (
      hostname.includes("flipkart.com") ||
      hostname.includes("flipkart.")
    ) {
      selectors = [...this.reviewSelectors.flipkart];
    } else if (
      hostname.includes("alibaba.com") ||
      hostname.includes("alibaba.")
    ) {
      selectors = [...this.reviewSelectors.alibaba];
    } else if (
      hostname.includes("newegg.com") ||
      hostname.includes("newegg.")
    ) {
      selectors = [...this.reviewSelectors.newegg];
    } else {
      selectors = this.reviewSelectors.general;
    }

    return this.trySelectors(selectors);
  }

  trySelectors(selectors) {
    const reviews = [];
    const hostname = window.location.hostname.toLowerCase();

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (this.shouldSkipElement(el, hostname)) {
          return;
        }

        const reviewText = this.extractReviewText(el);
        if (this.isValidReview(reviewText, el)) {
          reviews.push(el);
        }
      });
    });

    return reviews;
  }

  shouldSkipElement(el, hostname) {
    const text = el.textContent.trim();

    if (
      el.closest("#reviewai-panel") ||
      text === "Analyzing with ML models..." ||
      text === "Analyzing..." ||
      el.classList.contains("reviewai-loading") ||
      el.closest(
        ".reviewai-header, .reviewai-content, .reviewai-tabs, .reviewai-result-section"
      )
    ) {
      return true;
    }

    if (
      hostname.includes("amazon.") &&
      (el.matches(
        ".review-rating, [data-hook='review-star-rating'], .a-icon-star, #acrPopover, .a-icon-alt, .a-icon-row, .a-expander-prompt"
      ) ||
        /^\d+(\.\d+)? out of 5 stars$/.test(text))
    ) {
      return true;
    }

    if (hostname.includes("lazada.")) {
      const parent = el.closest(".item-content");
      if (!parent) return true;
      if (parent.classList.contains("item-content--seller-reply")) return true;
      if (
        /^\d+(\.\d+)?\s*stars?$/.test(text) ||
        /out of 5 stars/i.test(text) ||
        text.split(/\s+/).length < 2
      )
        return true;
    }

    const style = window.getComputedStyle(el);
    const isVisible =
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      el.offsetParent !== null &&
      el.offsetHeight > 0 &&
      el.offsetWidth > 0;

    if (!isVisible) {
      console.log("ReviewAI: Skipping hidden/unloaded review element:", el);
      return true;
    }

    return false;
  }

  isValidReview(reviewText, element) {
    if (!reviewText || reviewText.length < 10) {
      return false;
    }

    const wordCount = reviewText.split(/\s+/).length;
    if (wordCount < 2) {
      return false;
    }

    const reviewPatterns = [
      /\b(bought|purchased|ordered|received|delivery|shipping|quality|price|recommend|love|hate|good|bad|excellent|terrible|satisfied|disappointed)\b/i,
      /\b(crashes|freezes|works|working|broken|issues|problems|errors|bugs|glitches)\b/i,
      /\b(fast|slow|quick|laggy|smooth|responsive|performance|speed|battery|screen)\b/i,
      /\b(amazing|awesome|terrible|horrible|perfect|useless|worth|waste|money|experience)\b/i,
    ];

    const hasReviewContent = reviewPatterns.some((pattern) =>
      pattern.test(reviewText)
    );
    if (!hasReviewContent && wordCount < 5) {
      return false;
    }

    const nonReviewPatterns = [
      /^(read more|show more|see all|load more|next|previous|page \d+)$/i,
      /^(\d+\.\d+|\d+)(\s*(stars?|out of|\/))$/i,
      /^(helpful|not helpful|yes|no|report)$/i,
      /^(by|from|posted|reviewed)?\s*[a-z\s]+\s*(ago|on)$/i,
    ];

    return !nonReviewPatterns.some((pattern) =>
      pattern.test(reviewText.trim())
    );
  }

  removeDuplicateReviews(reviews) {
    const uniqueReviews = [];
    const seenTexts = new Set();

    reviews.forEach((review) => {
      const text = this.extractReviewText(review);
      const textHash = this.createTextHash(text);

      if (!seenTexts.has(textHash)) {
        seenTexts.add(textHash);
        uniqueReviews.push(review);
      } else {
        console.log(
          "ReviewAI: Skipping duplicate review:",
          text.substring(0, 50) + "..."
        );
      }
    });

    console.log(
      `ReviewAI: Removed ${
        reviews.length - uniqueReviews.length
      } duplicate reviews`
    );
    return uniqueReviews;
  }

  createTextHash(text) {
    return text.trim().toLowerCase().replace(/\s+/g, " ").substring(0, 100);
  }

  findCandidateElements() {
    return Array.from(
      document.querySelectorAll("div, li, article, section")
    ).filter((el) => {
      const text = el.textContent.trim();
      const wordCount = text.split(/\s+/).length;
      return (
        wordCount >= 10 &&
        wordCount <= 500 &&
        el.offsetParent !== null &&
        !el.closest("#reviewai-panel") &&
        !el.querySelector(".reviewai-analyze-quick") &&
        !el.closest(
          ".reviewai-header, .reviewai-content, .reviewai-tabs, .reviewai-result-section"
        )
      );
    });
  }

  findReviewPatterns() {
    const candidates = this.findCandidateElements();

    const scoredCandidates = candidates
      .map((el) => ({
        element: el,
        score: this.calculateReviewScore(el),
      }))
      .filter((item) => item.score > 0.6);

    const groups = this.groupBySimilarStructure(
      scoredCandidates.map((item) => item.element)
    );

    return groups.sort((a, b) => b.length - a.length)[0] || [];
  }

  calculateReviewScore(element) {
    let score = 0;
    const text = element.textContent.trim();
    const wordCount = text.split(/\s+/).length;

    if (wordCount >= 10 && wordCount <= 200) score += 0.3;
    else if (wordCount > 200 && wordCount <= 500) score += 0.2;

    const reviewPatterns = [
      /\b(bought|purchased|ordered|received)\b/i,
      /\b(recommend|love|hate|disappointed|satisfied)\b/i,
      /\b(quality|price|delivery|shipping)\b/i,
      /\b(stars?|rating|review)\b/i,
      /\b(good|bad|excellent|terrible|amazing|awful)\b/i,
    ];

    reviewPatterns.forEach((pattern) => {
      if (pattern.test(text)) score += 0.1;
    });

    if (element.querySelector('time, .date, [class*="date"]')) score += 0.1;
    if (element.querySelector('[class*="star"], [class*="rating"]'))
      score += 0.15;
    if (
      element.querySelector(
        '[class*="user"], [class*="customer"], [class*="author"]'
      )
    )
      score += 0.1;

    const parent = element.parentElement;
    if (
      parent?.className.includes("review") ||
      parent?.className.includes("comment")
    )
      score += 0.1;

    return Math.min(score, 1.0);
  }

  groupBySimilarStructure(elements) {
    const groups = {};
    elements.forEach((el) => {
      const key = this.getStructureKey(el);
      if (!groups[key]) groups[key] = [];
      groups[key].push(el);
    });

    return Object.values(groups).filter((group) => group.length >= 3);
  }

  getStructureKey(element) {
    return [
      element.tagName,
      element.className.split(" ").slice(0, 2).join(" "),
      element.parentElement?.tagName || "",
      element.parentElement?.className.split(" ")[0] || "",
    ].join("|");
  }

  async getSavedPatterns(hostname) {
    return new Promise((resolve) => {
      const key = `reviewai_patterns_${hostname}`;
      chrome.storage.local.get([key], (result) => {
        const savedPattern = result[key];

        if (savedPattern && this.isValidSavedPattern(savedPattern, hostname)) {
          resolve(savedPattern);
        } else {
          if (savedPattern) {
            console.log(
              `ReviewAI: Invalidating saved pattern for ${hostname} (outdated/incorrect)`
            );
            chrome.storage.local.remove([key]);
          }
          resolve(null);
        }
      });
    });
  }
  isValidSavedPattern(pattern, hostname) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (pattern.lastUpdated < thirtyDaysAgo) {
      return false;
    }

    if (pattern.confidence < 0.7) {
      return false;
    }

    const hasHardcodedSelectors =
      hostname.includes("amazon.") ||
      hostname.includes("shopee.") ||
      hostname.includes("lazada.") ||
      hostname.includes("ebay.") ||
      hostname.includes("temu.") ||
      hostname.includes("shein.") ||
      hostname.includes("flipkart.");

    if (hasHardcodedSelectors && pattern.source === "intelligent") {
      return false;
    }

    return true;
  }

  async saveIntelligentPattern(hostname, elements) {
    const patterns = this.extractPatternsFromElements(elements);
    const confidence = this.calculatePatternConfidence(elements, hostname);

    const hasHardcodedSelectors =
      hostname.includes("amazon.") ||
      hostname.includes("shopee.") ||
      hostname.includes("lazada.") ||
      hostname.includes("ebay.") ||
      hostname.includes("temu.") ||
      hostname.includes("shein.") ||
      hostname.includes("flipkart.");

    if (confidence < 0.75 || hasHardcodedSelectors) {
      console.log(
        `ReviewAI: Not saving pattern for ${hostname} (confidence: ${confidence}, has hardcoded: ${hasHardcodedSelectors})`
      );
      return;
    }

    const key = `reviewai_patterns_${hostname}`;
    const data = {
      selectors: patterns,
      lastUpdated: Date.now(),
      confidence: confidence,
      source: "intelligent",
      reviewCount: elements.length,
    };

    chrome.storage.local.set({ [key]: data });
    console.log(
      `ReviewAI: Auto-saved patterns for ${hostname} (confidence: ${confidence})`
    );
  }

  calculatePatternConfidence(elements, hostname) {
    let confidence = 0.5;

    confidence += Math.min(elements.length * 0.05, 0.3);

    const structures = elements.map((el) => this.getStructureKey(el));
    const uniqueStructures = new Set(structures).size;
    if (uniqueStructures === 1) confidence += 0.2;
    else if (uniqueStructures <= 3) confidence += 0.1;

    const reviewLikeCount = elements.filter((el) => {
      const text = el.textContent.toLowerCase();
      return /\b(bought|purchased|quality|recommend|good|bad|excellent|terrible)\b/.test(
        text
      );
    }).length;

    confidence += (reviewLikeCount / elements.length) * 0.2;

    return Math.min(confidence, 1.0);
  }

  // async saveUserSelectionPattern(selectedElements) {
  //   const hostname = window.location.hostname;
  //   const patterns = this.extractPatternsFromElements(selectedElements);
  //   const key = `reviewai_patterns_${hostname}`;
  //   const data = {
  //     selectors: patterns,
  //     lastUpdated: Date.now(),
  //     confidence: 1.0,
  //     source: "user",
  //   };

  //   await chrome.storage.local.set({ [key]: data });
  //   console.log(`ReviewAI: Saved user patterns for ${hostname}:`, patterns);
  // }

  extractPatternsFromElements(elements) {
    console.log("DEBUG: Extracting patterns from", elements.length, "elements");

    const selectors = new Set();

    elements.forEach((el, index) => {
      console.log(`DEBUG: Processing element ${index + 1}:`, el);

      if (el.className && typeof el.className === "string") {
        const fullClassName = el.className.trim();
        console.log(`DEBUG: Full className: "${fullClassName}"`);

        if (fullClassName) {
          // ✅ STRATEGY 1: Try complete class combination first
          const allClassesSelector = `.${fullClassName.replace(/\s+/g, ".")}`;

          try {
            const testElements = document.querySelectorAll(allClassesSelector);
            console.log(
              `DEBUG: Complete selector "${allClassesSelector}" matches ${testElements.length} elements`
            );

            if (
              testElements.length > 0 &&
              testElements.length <= 100 &&
              Array.from(testElements).includes(el)
            ) {
              selectors.add(allClassesSelector);
              console.log(
                `✅ Added COMPLETE class selector: ${allClassesSelector}`
              );
              return;
            }
          } catch (error) {
            console.log(
              `⚠️ Complete selector failed: ${allClassesSelector}`,
              error
            );
          }

          // ✅ STRATEGY 2: If complete selector doesn't work, try individual classes
          const classes = fullClassName.split(/\s+/);
          console.log(`DEBUG: Fallback to individual classes:`, classes);

          let bestClass = null;
          let bestScore = Infinity;

          classes.forEach((className) => {
            if (!className) return;

            const selector = `.${className}`;
            try {
              const testElements = document.querySelectorAll(selector);
              console.log(
                `DEBUG: Class "${className}" matches ${testElements.length} elements`
              );

              if (
                testElements.length > 0 &&
                testElements.length < bestScore &&
                Array.from(testElements).includes(el)
              ) {
                bestScore = testElements.length;
                bestClass = className;
              }
            } catch (error) {
              console.log(`⚠️ Invalid selector: ${selector}`);
            }
          });

          if (bestClass) {
            const selector = `.${bestClass}`;
            selectors.add(selector);
            console.log(
              `✅ Added BEST individual class: ${selector} (${bestScore} matches)`
            );
          } else {
            // ✅ STRATEGY 3: Last resort - use first class
            const selector = `.${classes[0]}`;
            selectors.add(selector);
            console.log(`⚠️ FALLBACK to first class: ${selector}`);
          }
        }
      } else {
        console.log(`⚠️ Element has no className:`, el.tagName);
      }
    });

    const finalSelectors = Array.from(selectors);
    console.log("🔍 DEBUG: Final extracted selectors:", finalSelectors);

    return finalSelectors;
  }

  promptUserToSelectReviews() {
    this.showError(
      "No reviews detected automatically. Try navigating to a product page with visible reviews, or contact support if this persists."
    );

    console.log("ReviewAI: Manual selection UI not implemented yet");
  }

  extractReviewText(reviewElement) {
    const clonedElement = reviewElement.cloneNode(true);

    const buttons = clonedElement.querySelectorAll(".reviewai-analyze-quick");
    buttons.forEach((button) => button.remove());

    const badges = clonedElement.querySelectorAll(".reviewai-badge");
    badges.forEach((badge) => badge.remove());

    return clonedElement.textContent.trim();
  }

  showQuickAnalyzeOption(selectedText) {
    const existing = document.getElementById("reviewai-quick-tooltip");
    if (existing) existing.remove();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const tooltip = document.createElement("div");
    tooltip.id = "reviewai-quick-tooltip";
    tooltip.className = "reviewai-quick-tooltip";
    tooltip.innerHTML = `
    <button id="reviewai-quick-analyze-btn" class="reviewai-analyze-button">
      🔍 Analyze with ReviewAI
    </button>
    <div id="reviewai-quick-results" class="reviewai-quick-results" style="display: none;">
      <div class="reviewai-quick-loading" id="reviewai-quick-loading" style="display: none;">
        <div class="reviewai-spinner-small"></div>
        <span>Analyzing...</span>
      </div>
      <div id="reviewai-quick-result-content" class="reviewai-result-content"></div>
    </div>
  `;

    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;

    document.body.appendChild(tooltip);

    const analyzeBtn = document.getElementById("reviewai-quick-analyze-btn");
    const resultsDiv = document.getElementById("reviewai-quick-results");
    const loadingDiv = document.getElementById("reviewai-quick-loading");
    const resultContent = document.getElementById(
      "reviewai-quick-result-content"
    );

    analyzeBtn.addEventListener("click", () => {
      console.log("Quick analyze button clicked");

      analyzeBtn.style.display = "none";
      resultsDiv.style.display = "block";
      loadingDiv.style.display = "flex";

      // const productLink = window.location.href;

      chrome.runtime.sendMessage(
        {
          action: "analyzeQuickReview",
          reviewText: selectedText.trim(),
          // link: productLink 
        },
        (response) => {
          console.log("Quick analysis response:", response);

          loadingDiv.style.display = "none";

          if (response && response.success) {
            this.displayQuickResult(response.data, resultContent);
          } else {
            const errorMsg = response?.error || "Unknown error occurred";
            resultContent.innerHTML = `
            <div class="reviewai-error">
              <span>❌ Analysis failed</span>
              <small>${errorMsg}</small>
            </div>
          `;
          }
        }
      );
    });

    setTimeout(() => {
      document.addEventListener("mousedown", function removeTooltip(e) {
        if (!tooltip.contains(e.target)) {
          tooltip.remove();
          document.removeEventListener("mousedown", removeTooltip);
          window.getSelection().removeAllRanges();
        }
      });
    }, 100);

    setTimeout(() => {
      if (tooltip.parentNode) tooltip.remove();
    }, 15000);
  }

  displayQuickResult(result, container) {
    if (!result) {
      container.innerHTML = `
      <div class="reviewai-error">
        <span>❌ No result data</span>
      </div>
    `;
      return;
    }

    const prediction = result.prediction;
    const confidence = result.confidence;
    const confidencePercentage = Math.round(confidence * 100);
    const probabilities = result.probabilities;

    const isGenuine = prediction && prediction.toLowerCase() === "genuine";
    const statusIcon = isGenuine ? "✅" : "⚠️";
    const confidenceColor = this.getConfidenceColor(
      prediction.toLowerCase(),
      confidence
    );
    const predictionLabel = this.getPredictionLabel(
      prediction.toLowerCase(),
      confidence
    );
    const confidenceDesc = this.getConfidenceDescription(confidence);

    // Create circular progress
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (confidencePercentage / 100) * circumference;

    container.innerHTML = `
    <div class="reviewai-compact-result">
      <div class="reviewai-compact-circle">
        <svg viewBox="0 0 70 70" class="reviewai-circle-svg">
          <circle cx="35" cy="35" r="30" stroke="#e5e7eb" stroke-width="4" fill="none" />
          <circle 
            cx="35" cy="35" r="30" 
            stroke="${confidenceColor}" 
            stroke-width="4" 
            fill="none"
            stroke-dasharray="${circumference}" 
            stroke-dashoffset="${strokeDashoffset}"
            stroke-linecap="round"
            class="reviewai-progress-circle"
          />
        </svg>
        <div class="reviewai-circle-center">
          <span class="reviewai-percentage" style="color:${confidenceColor}">${confidencePercentage}%</span>
        </div>
      </div>
      
      <div class="reviewai-compact-info">
        <div class="reviewai-prediction-line">
          <span class="reviewai-icon">${statusIcon}</span>
          <span class="reviewai-prediction-text">${predictionLabel}</span>
        </div>
        <div class="reviewai-confidence-line">
          ${confidenceDesc} (${confidencePercentage}%)
        </div>
        <div class="reviewai-probabilities-compact">
          <span class="reviewai-prob-genuine">Genuine: ${(
            probabilities.genuine * 100
          ).toFixed(1)}%</span>
          <span class="reviewai-prob-fake">Fake: ${(
            probabilities.fake * 100
          ).toFixed(1)}%</span>
        </div>
        ${
          confidence < 0.6
            ? `<div class="reviewai-low-confidence-warning" style="color:#6b7280;">⚠️ Low confidence result</div>`
            : ""
        }
      </div>
    </div>
  `;
  }

  togglePanel() {
    const panel = this.shadow?.getElementById("reviewai-panel");
    if (panel) {
      if (panel.classList.contains("reviewai-hidden")) {
        this.showPanel();
        console.log("Panel shown");
      } else {
        this.hidePanel();
        console.log("Panel hidden");
      }
    } else {
      console.log("Panel not found");
    }
  }

  showPanel() {
    const panel = this.shadow.getElementById("reviewai-panel");
    panel.classList.remove("reviewai-hidden");
    this.panelHost.style.pointerEvents = "auto";
  }

  hidePanel() {
    const panel = this.shadow.getElementById("reviewai-panel");
    panel.classList.add("reviewai-hidden");
    this.panelHost.style.pointerEvents = "none";
  }

  switchTab(tabName) {
    this.shadow.querySelectorAll(".reviewai-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    this.shadow.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    this.shadow.querySelectorAll(".reviewai-tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    this.shadow.getElementById(`reviewai-${tabName}-tab`).classList.add("active");
  }

  showLoading() {
    this.shadow.getElementById("reviewai-loading").style.display = "flex";
  }

  hideLoading() {
    this.shadow.getElementById("reviewai-loading").style.display = "none";
  }


  getPlatformCode() {
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes("amazon.")) return "amazon";
    if (hostname.includes("ebay.")) return "ebay";
    if (hostname.includes("shopee.")) return "shopee";
    if (hostname.includes("lazada.")) return "lazada";
    if (hostname.includes("flipkart.")) return "flipkart";
    if (hostname.includes("alibaba.") || hostname.includes("alibaba.")) return "alibaba";
    if (hostname.includes("shein.")) return "shein";
    if (hostname.includes("walmart.")) return "walmart";
    if (hostname.includes("newegg.")) return "newegg";
    if (hostname.includes("temu.")) return "temu";
    if (hostname.includes("zalora.")) return "zalora";
    if (hostname.includes("carousell.")) return "carousell";


    return "extension"; // Default for extension usage
  }

  analyzeSingleReview(reviewText) {
    if (!reviewText || reviewText.trim().length < 5) {
      this.showError(
        "Please provide a valid review text (at least 5 characters)."
      );
      return;
    }

    this.showLoading();

    const originalText = reviewText.trim();
    const inputField = this.shadow.getElementById("reviewai-text-input");
    inputField.value = originalText;

    this.sendAnalysisRequest(originalText);
  }

  // Separate async method
  async sendAnalysisRequest(originalText) {
    const inputField = this.shadow.getElementById("reviewai-text-input");
    const productName = await this.getProductName();
    
    chrome.runtime.sendMessage(
      {
        action: "analyzeReview",
        reviewText: originalText,
        platformName: this.getPlatformCode(),
        productName: productName,
        pageUrl: window.location.href,
        link: window.location.href,
        analysisType: "single"
      },
      (response) => {
        this.hideLoading();

        if (response.success) {
          const cleanedText = response.data.cleaned_text || originalText;

          if (cleanedText !== originalText) {
            inputField.style.background = "#e3f2fd";
            inputField.value = cleanedText;

            const cleanIndicator = document.createElement("small");
            cleanIndicator.textContent = "Text cleaned for analysis";
            cleanIndicator.style.color = "#1976d2";
            cleanIndicator.style.fontSize = "0.8em";
            cleanIndicator.style.marginTop = "4px";
            cleanIndicator.style.display = "block";

            inputField.parentNode.appendChild(cleanIndicator);

            setTimeout(() => {
              inputField.style.background = "";
              if (cleanIndicator.parentNode) {
                cleanIndicator.remove();
              }
            }, 5000);
          } else {
            inputField.value = cleanedText;
          }

          this.displaySingleResult(response.data);

          if (response.data.user_logged_in) {
            this.showTempMessage("✅ Review saved to your account!");
          } else {
            this.showTempMessage("ℹ️ Review analyzed but not saved (not logged in)");
          }
        } else {
          this.showError(`Analysis failed: ${response.error}`);
        }
      }
    );
  }

  async fetchBatchLimit() {
    if (this.batchLimit !== null) return this.batchLimit;

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "getBatchLimit" }, (response) =>
          resolve(response)
        );
      });

      if (response && response.success) {
        this.batchLimit = response.data.batch_limit || 90;
        console.log(`✅ ReviewAI: Fetched batch limit: ${this.batchLimit}`);
        return this.batchLimit;
      } else {
        throw new Error(response?.error || "Failed to fetch batch limit");
      }
    } catch (error) {
      console.warn(
        "ReviewAI: Could not fetch batch limit, using default 20.",
        error
      );
      this.batchLimit = 20;
      return this.batchLimit;
    }
  }

  async updateBatchLimitDisplay() {
    const batchLimit = await this.fetchBatchLimit();
    const displayEl = this.shadow.getElementById("reviewai-batch-limit-display");
    if (displayEl) {
      displayEl.textContent = `Up to ${batchLimit} reviews per batch`;
    }
  }

  async scrapeBatchReviews() {
    const reviews = await this.detectReviews();

    if (reviews.length === 0) {
      this.showError(
        "No reviews found on this page. Please navigate to a product page with reviews."
      );
      return;
    }

    const batchLimit = await this.fetchBatchLimit();

    const reviewObjects = reviews.slice(0, batchLimit).map((review) => {
      const extractedText = this.extractReviewText(review);
      
      if (typeof extractedText !== 'string' || extractedText.trim().length === 0) {
        console.warn("Invalid review text extracted:", extractedText);
        return null;
      }

      return {
        text: extractedText.trim(),
        link: window.location.href
      };
    }).filter(review => review !== null);

    if (reviewObjects.length === 0) {
      this.showError("No valid review text could be extracted from detected reviews.");
      return;
    }

    const statusEl = this.shadow.getElementById("reviewai-scrape-status");
    statusEl.textContent = `Found ${reviewObjects.length} valid reviews. Analyzing...`;

    this.showLoading();

    chrome.runtime.sendMessage(
      {
        action: "analyzeBatchReviews",
        reviews: reviewObjects,
        platformName: this.getPlatformCode(),
        productName: await this.getProductName(),
        pageUrl: window.location.href,
        analysisType: "batch"
      },
      (response) => {
        this.hideLoading();
        statusEl.textContent = "";

        if (response.success) {
          const results = response.data.results || response.data;
          this.displayBatchResults(results);

          // Show save status
          if (response.data.user_logged_in) {
            this.showTempMessage("✅ Batch reviews saved to your account!");
          } else {
            this.showTempMessage("ℹ️ Reviews analyzed but not saved (not logged in)");
          }
        } else {
          this.showError(`Batch analysis failed: ${response.error}`);
        }
      }
    );
  }

  displaySingleResult(result) {
    console.log("Full result object:", result);
    console.log("Prediction:", result.prediction);
    console.log("Confidence:", result.confidence);
    console.log("Probabilities:", result.probabilities);

    const resultEl = this.shadow.getElementById("reviewai-single-result");

    const prediction = result.prediction;
    const confidence = result.confidence;
    const confidencePercentage = Math.round(confidence * 100);
    const probabilities = result.probabilities;

    const isGenuine = prediction.toLowerCase() === "genuine";

    let statusClass;
    if (confidence >= 0.75) {
      statusClass = isGenuine ? "reviewai-genuine" : "reviewai-fake";
    } else if (confidence >= 0.6) {
      statusClass = "reviewai-medium";
    } else {
      statusClass = "reviewai-uncertain";
    }

    const statusIcon = isGenuine ? "✅" : confidence >= 0.5 ? "⚠️" : "❓";

    const predictionLabel = this.getPredictionLabel(
      prediction.toLowerCase(),
      confidence
    );
    const confidenceDesc = this.getConfidenceDescription(confidence);
    const confidenceColor = this.getConfidenceColor(
      prediction.toLowerCase(),
      confidence
    );

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (confidencePercentage / 100) * circumference;

    resultEl.innerHTML = `
    <div class="reviewai-result-card ${statusClass}">
      <div class="reviewai-result-header">
        <span class="reviewai-status-icon">${statusIcon}</span>
        <h4>Review Analysis Result</h4>
      </div>
      
      <div class="reviewai-main-result">
        <div class="reviewai-circular-progress">
          <div class="reviewai-progress-circle">
            <svg class="reviewai-progress-svg" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="60" stroke="#e5e7eb" stroke-width="8" fill="none" />
              <circle 
                cx="72" cy="72" r="60" 
                stroke="${confidenceColor}" 
                stroke-width="8" 
                fill="none"
                stroke-dasharray="${circumference}" 
                stroke-dashoffset="${strokeDashoffset}"
                stroke-linecap="round" 
                class="reviewai-progress-bar" 
              />
            </svg>
            <div class="reviewai-progress-text">
              <div class="reviewai-percentage">${confidencePercentage}%</div>
              <div class="reviewai-conf-label">Confidence</div>
            </div>
          </div>
        </div>
        
        <div class="reviewai-prediction-details">
          <div class="reviewai-prediction">
            <span class="reviewai-value ${statusClass}">${predictionLabel}</span>
          </div>
          <div class="reviewai-confidence-desc">
            <span class="reviewai-value">${confidenceDesc}</span>
          </div>
        </div>
      </div>
      
      ${confidence < 0.6 ? this.createLowConfidenceWarning() : ""}
      
      <div class="reviewai-probabilities">
        <h5>Detailed Probabilities:</h5>
        <div class="reviewai-prob-bar">
          <div class="reviewai-prob-item">
            <span>Genuine: ${(probabilities.genuine * 100).toFixed(1)}%</span>
            <div class="reviewai-bar">
              <div class="reviewai-bar-fill reviewai-genuine" style="width: ${
                probabilities.genuine * 100
              }%"></div>
            </div>
          </div>
          <div class="reviewai-prob-item">
            <span>Fake: ${(probabilities.fake * 100).toFixed(1)}%</span>
            <div class="reviewai-bar">
              <div class="reviewai-bar-fill reviewai-fake" style="width: ${
                probabilities.fake * 100
              }%"></div>
            </div>
          </div>
        </div>
      </div>
      
      ${
        result.individual_predictions
          ? this.renderIndividualPredictions(result.individual_predictions)
          : ""
      }
    </div>
  `;
  }

  createLowConfidenceWarning() {
    return `
    <div class="reviewai-low-confidence-warning">
      <div class="reviewai-warning-content">
        <span class="reviewai-warning-icon">⚠️</span>
        <div>
          <div class="reviewai-warning-title">Low Confidence Result</div>
          <div class="reviewai-warning-text">Consider getting additional opinions or manual review.</div>
        </div>
      </div>
    </div>
  `;
  }

  displayBatchResults(results) {
    const resultEl = this.shadow.getElementById("reviewai-batch-result");

    if (!Array.isArray(results) || results.length === 0) {
      this.showError("No results received from batch analysis.");
      return;
    }

    const fakeCount = results.filter(
      (r) => r.prediction && r.prediction.toLowerCase() === "fake"
    ).length;
    const genuineCount = results.filter(
      (r) => r.prediction && r.prediction.toLowerCase() === "genuine"
    ).length;
    const fakePercentage = ((fakeCount / results.length) * 100).toFixed(1);
    const genuinePercentage = ((genuineCount / results.length) * 100).toFixed(
      1
    );

    let resultsHTML = `
      <div class="reviewai-batch-summary">
        <h4>Batch Analysis Summary</h4>
        <div class="reviewai-summary-stats">
          <div class="reviewai-stat">
            <span class="reviewai-stat-number">${results.length}</span>
            <span class="reviewai-stat-label">Total Reviews</span>
          </div>
          <div class="reviewai-stat reviewai-fake">
            <span class="reviewai-stat-number">${fakeCount}</span>
            <span class="reviewai-stat-label">Fake (${fakePercentage}%)</span>
          </div>
          <div class="reviewai-stat reviewai-genuine">
            <span class="reviewai-stat-number">${genuineCount}</span>
            <span class="reviewai-stat-label">Genuine (${genuinePercentage}%)</span>
          </div>
        </div>
      </div>
      
      <div class="reviewai-batch-results">
        <h5>Individual Results:</h5>
    `;

    results.forEach((result, index) => {
      const prediction = result.prediction
        ? result.prediction.toLowerCase()
        : "";
      const confidence =
        typeof result.confidence === "number"
          ? result.confidence
          : parseFloat(result.confidence);

      let statusClass;
      if (confidence >= 0.75) {
        statusClass =
          prediction === "genuine" ? "reviewai-genuine" : "reviewai-fake";
      } else if (confidence >= 0.6) {
        statusClass = "reviewai-medium";
      } else {
        statusClass = "reviewai-uncertain";
      }

      const statusIcon =
        prediction === "genuine" ? "✅" : confidence >= 0.5 ? "⚠️" : "❓";
      const confidenceDisplay = confidence
        ? (confidence * 100).toFixed(1)
        : "N/A";

      const link = result.link || "N/A";
      const cleanedText = result.cleaned_text || result.text || "N/A"; // ✅ fallback to text
      const preview =
        cleanedText.substring(0, 100) + (cleanedText.length > 100 ? "..." : "");

      const predictionLabel = this.getPredictionLabel(prediction, confidence);

      resultsHTML += `
    <div class="reviewai-batch-item ${statusClass}">
      <div class="reviewai-batch-header">
        <span class="reviewai-status-icon">${statusIcon}</span>
        <span class="reviewai-batch-prediction ${statusClass}">${predictionLabel}</span>
        <span class="reviewai-batch-confidence">${confidenceDisplay}%</span>
      </div>
      <div class="reviewai-batch-preview">${preview}</div>
    </div>
  `;
    });

    resultsHTML += "</div>";
    resultEl.innerHTML = resultsHTML;
  }

  renderIndividualPredictions(predictions) {
    return `
    <div class="reviewai-individual-predictions">
      <h5>Model Breakdown:</h5>
      <div class="reviewai-model-results">
        <div class="reviewai-model-item">
          <span class="reviewai-model-name">SVM:</span>
          <span class="reviewai-model-breakdown">G: ${(
            predictions.svm.genuine * 100
          ).toFixed(1)}% | F: ${(predictions.svm.fake * 100).toFixed(1)}%</span>
        </div>
        <div class="reviewai-model-item">
          <span class="reviewai-model-name">Random Forest:</span>
          <span class="reviewai-model-breakdown">G: ${(
            predictions.rf.genuine * 100
          ).toFixed(1)}% | F: ${(predictions.rf.fake * 100).toFixed(1)}%</span>
        </div>
        <div class="reviewai-model-item">
          <span class="reviewai-model-name">DistilBERT:</span>
          <span class="reviewai-model-breakdown">G: ${(
            predictions.distilbert.genuine * 100
          ).toFixed(1)}% | F: ${(predictions.distilbert.fake * 100).toFixed(
      1
    )}%</span>
        </div>
      </div>
    </div>
  `;
  }

  getPredictionLabel(prediction, confidence) {
    const conf = parseFloat(confidence);
    const isGenuine = prediction === "genuine";

    if (conf >= 0.9) {
      return isGenuine ? "Highly Genuine" : "Definitely Fake";
    } else if (conf >= 0.75) {
      return isGenuine ? "Likely Genuine" : "Likely Fake";
    } else if (conf >= 0.6) {
      return isGenuine ? "Possibly Genuine" : "Possibly Fake";
    } else {
      return isGenuine ? "Uncertain" : "Uncertain";
    }
  }

  getConfidenceDescription(confidence) {
    const conf = parseFloat(confidence);

    if (conf >= 0.9) {
      return "Very high confidence";
    } else if (conf >= 0.75) {
      return "High confidence";
    } else if (conf >= 0.6) {
      return "Medium-high confidence";
    } else if (conf >= 0.5) {
      return "Medium confidence";
    } else {
      return "Low confidence";
    }
  }

  getConfidenceColor(prediction, confidence) {
    const conf = parseFloat(confidence);
    const isGenuine = prediction === "genuine";

    if (conf >= 0.75) {
      return isGenuine ? "#28a745" : "#ef4444";
    } else if (conf >= 0.6) {
      return "#f59e0b";
    } else {
      return "#6b7280";
    }
  }

  showError(message) {
    const existing = document.querySelector(".reviewai-error-toast");
    if (existing) existing.remove();

    const errorEl = document.createElement("div");
    errorEl.className = "reviewai-error-toast";
    errorEl.textContent = message;
    
    document.body.appendChild(errorEl);

    setTimeout(() => {
      errorEl.classList.add("reviewai-show");
    }, 100);

    setTimeout(() => {
      errorEl.classList.remove("reviewai-show");
      setTimeout(() => {
        if (errorEl.parentNode) errorEl.remove();
      }, 300);
    }, 5000);
  }

  async getUserLearnedPatterns(hostname) {
    console.log("🔍 getUserLearnedPatterns called for:", hostname);

    return new Promise((resolve) => {
      const key = `reviewai_user_patterns_${hostname}`;
      console.log("🔍 Looking for key:", key);

      chrome.storage.local.get([key], (result) => {
        console.log("🔍 Storage result:", result);
        const pattern = result[key];

        if (
          pattern &&
          pattern.source === "user" &&
          this.isValidUserPattern(pattern)
        ) {
          console.log("✅ Found valid user pattern:", pattern);
          resolve(pattern);
        } else {
          console.log("❌ No valid user pattern found");
          resolve(null);
        }
      });
    });
  }

  isValidUserPattern(pattern) {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    return pattern.lastUpdated > ninetyDaysAgo && pattern.confidence >= 0.9;
  }

  promptUserSelection(hostname) {
    console.log(
      `ReviewAI: Suggesting user training for better accuracy on ${hostname}`
    );
    this.showTempMessage(
      "Tip: Use Settings > Teach ReviewAI for better review detection"
    );
  }

  startUserSelectionFromUI() {
    const hostname = window.location.hostname;
    this.showUserSelectionPrompt(hostname);
    this.hidePanel();
  }

  async resetLearnedPatterns() {
    const hostname = window.location.hostname;
    const userKey = `reviewai_user_patterns_${hostname}`;
    const intelligentKey = `reviewai_patterns_${hostname}`;

    try {
      await chrome.storage.local.remove([userKey, intelligentKey]);
      this.showSuccessMessage("All learned patterns reset for this site!");
      this.updatePatternStatus();
    } catch (error) {
      this.showError("Failed to reset patterns");
    }
  }

  async testCurrentDetection() {
    this.showSelectionToast("Testing current detection...");

    try {
      const reviews = await this.detectReviews();

      if (reviews.length === 0) {
        this.showError("No reviews detected with current patterns");
      } else {
        reviews.forEach((review, index) => {
          review.style.outline = "3px solid #22c55e";
          review.style.backgroundColor = "rgba(34, 197, 94, 0.1)";

          const badge = document.createElement("div");
          badge.textContent = index + 1;
          badge.className = "reviewai-badge";
          badge.style.cssText = `
          position: absolute;
          top: -10px;
          left: -10px;
          background: #22c55e;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          z-index: 1000;
        `;
          review.style.position = "relative";
          review.appendChild(badge);
        });

        this.showSuccessMessage(
          `Found ${reviews.length} reviews (highlighted in green)`
        );

        setTimeout(() => {
          reviews.forEach((review) => {
            review.style.outline = "";
            review.style.backgroundColor = "";
            const badge = review.querySelector(
              "div[style*='position: absolute']"
            );
            if (badge) badge.remove();
          });
        }, 5000);
      }
    } catch (error) {
      this.showError("Error testing detection");
    }
  }

  async updatePatternStatus() {
    const hostname = window.location.hostname;
    const statusEl = this.shadow.getElementById("reviewai-pattern-status");
    if (!statusEl) return;

    const userPatterns = await this.getUserLearnedPatterns(hostname);
    const savedPatterns = await this.getSavedPatterns(hostname);

    let statusHTML = "<h5>Current Pattern Status:</h5>";

    if (userPatterns) {
      const date = new Date(userPatterns.lastUpdated).toLocaleDateString();
      statusHTML += `
      <div class="reviewai-status-item reviewai-status-success">
        <strong>User-Saved Patterns Active</strong>
        <small>Last updated: ${date} | ${userPatterns.reviewCount} reviews saved</small>
      </div>
    `;
    } else if (savedPatterns) {
      const date = new Date(savedPatterns.lastUpdated).toLocaleDateString();
      const confidence = Math.round(savedPatterns.confidence * 100);
      statusHTML += `
      <div class="reviewai-status-item reviewai-status-warning">
        <strong>Auto-Detected Patterns</strong>
        <small>Confidence: ${confidence}% | Last updated: ${date}</small>
      </div>
    `;
    } else {
      statusHTML += `
      <div class="reviewai-status-item reviewai-status-neutral">
        <strong>Using General Detection</strong>
        <small>No site-specific patterns learned yet</small>
      </div>
    `;
    }

    statusEl.innerHTML = statusHTML;
  }

  showUserSelectionPrompt(hostname) {
    console.log("ShowUserSelectionPrompt called for:", hostname);

    const existingPrompt = document.getElementById("reviewai-selection-prompt");
    if (existingPrompt) existingPrompt.remove();

    const prompt = document.createElement("div");
    prompt.id = "reviewai-selection-prompt";

    prompt.innerHTML = `
    <div class="reviewai-prompt-header">
      <h3>Teach ReviewAI</h3>
      <button id="reviewai-prompt-close">&times;</button>
    </div>
    
    <div class="reviewai-prompt-content">
      <p>Help ReviewAI learn where reviews are on ${hostname}</p>
      
      <div id="reviewai-selection-status">
        <div>Selection Mode: <span id="reviewai-mode-status">Inactive</span></div>
        <div><span id="reviewai-selected-count">0</span> reviews selected</div>
      </div>
      
      <div class="reviewai-prompt-actions">
        <!-- PHASE 1: Start selection -->
        <button id="reviewai-start-selection">Start Selecting Reviews</button>
        
        <!-- PHASE 2: Active selection controls (hidden initially via inline style) -->
        <div id="reviewai-active-controls" style="display: none;">
          <button id="reviewai-finish-selection" disabled>Save Pattern</button>
          <button id="reviewai-cancel-selection">Cancel Selection</button>
        </div>
        
        <!-- PHASE 3: Close button (always visible) -->
        <button id="reviewai-close-modal">Close</button>
      </div>
      
      <!-- Instructions shown only when needed via inline style -->
      <div id="reviewai-instructions" style="display: none;">
        <div>Instructions:</div>
        <div>1. Click directly on review text (not containers)</div>
        <div>2. Look for green checkmarks ✓ on selected reviews</div>
        <div>3. Select a review for best results</div>
        <div>4. Click "Save Pattern" when done</div>
      </div>
    </div>
  `;

    document.body.appendChild(prompt);
    this.setupNewUserSelectionListeners(hostname);
  }
  setupNewUserSelectionListeners(hostname) {
    const startBtn = document.getElementById("reviewai-start-selection");
    const finishBtn = document.getElementById("reviewai-finish-selection");
    const cancelBtn = document.getElementById("reviewai-cancel-selection");
    const closeBtn = document.getElementById("reviewai-close-modal");
    const closeHeaderBtn = document.getElementById("reviewai-prompt-close");

    const countEl = document.getElementById("reviewai-selected-count");
    const modeStatusEl = document.getElementById("reviewai-mode-status");
    const activeControlsEl = document.getElementById("reviewai-active-controls");
    const instructionsEl = document.getElementById("reviewai-instructions");

    let selectedElements = [];

    // PHASE 1 → PHASE 2: Start selection mode
    startBtn.addEventListener("click", () => {
      console.log("Starting selection mode...");

      // Update UI to Phase 2 (Active Selection)
      startBtn.style.display = "none";
      activeControlsEl.style.display = "flex";
      instructionsEl.style.display = "block";

      // Update status
      modeStatusEl.textContent = "Active";
      modeStatusEl.classList.add("active");

      // Enable selection
      document.body.classList.add("reviewai-selection-mode");
      this.addImprovedSelectionStyles();
      this.setupImprovedSelectionHandlers(selectedElements, countEl, finishBtn);

      this.showSelectionToast(
        "Selection mode active! Click on review texts to select them."
      );
    });

    // PHASE 2 → Save: Finish and save pattern
    finishBtn.addEventListener("click", async () => {
      if (selectedElements.length >= 1) {
        console.log("Saving pattern with", selectedElements.length, "elements");

        // Update UI to show saving
        finishBtn.textContent = "Saving...";
        finishBtn.disabled = true;
        finishBtn.classList.add("saving");

        try {
          await this.saveUserLearnedPattern(hostname, selectedElements);

          // Clean up and close
          this.exitSelectionMode();
          this.hideUserSelectionPrompt();

          // Show success and return to main panel
          setTimeout(() => {
            this.showPanel();
            this.switchTab("settings");
            this.updatePatternStatus();
            this.showSuccessMessage(
              `Pattern saved! ReviewAI learned from ${selectedElements.length} reviews.`
            );
          }, 500);
        } catch (error) {
          console.error("Error saving pattern:", error);
          finishBtn.textContent = "Save Pattern";
          finishBtn.disabled = false;
          finishBtn.classList.remove("saving");
          this.showSelectionToast("Error saving pattern. Please try again.");
        }
      }
    });

    // PHASE 2 → PHASE 1: Cancel selection
    cancelBtn.addEventListener("click", () => {
      console.log("Cancelling selection mode...");
      this.exitSelectionMode();

      // Reset UI to Phase 1
      startBtn.style.display = "block";
      activeControlsEl.style.display = "none";
      instructionsEl.style.display = "none";

      // Reset status
      modeStatusEl.textContent = "Inactive";
      modeStatusEl.classList.remove("active");

      // Clear selections
      selectedElements.length = 0;
      countEl.textContent = "0";

      this.showSelectionToast(
        "Selection cancelled. You can start again anytime."
      );
    });

    // Close modal completely
    const closeModal = () => {
      console.log("Closing modal...");
      this.exitSelectionMode();
      this.hideUserSelectionPrompt();
      this.showPanel(); // Return to main panel
    };

    closeBtn.addEventListener("click", closeModal);
    closeHeaderBtn.addEventListener("click", closeModal);
  }

  // Method 12: Setup improved selection handlers (COMPLETELY REWRITTEN)
  setupImprovedSelectionHandlers(selectedElements, countEl, finishBtn) {
    const selectionHandler = (e) => {
      // Skip modal elements
      if (e.target.closest("#reviewai-selection-prompt")) {
        return; // Let modal handle its own clicks
      }

      // Skip already selected elements
      if (e.target.classList.contains("reviewai-selected")) {
        this.showSelectionToast(
          "Already selected! Click on different review text."
        );
        return;
      }

      // Validate selection target
      const element = e.target;
      const text = element.textContent.trim();

      if (text.length < 10) {
        this.showSelectionToast(
          "Text too short. Click on actual review content."
        );
        return;
      }

      if (text.split(/\s+/).length < 8) {
        this.showSelectionToast(
          "Need more substantial text. Click on full review paragraphs."
        );
        return;
      }

      if (!this.isValidSelectionTarget(element)) {
        this.showSelectionToast(
          "Invalid target. Click directly on review text content."
        );
        return;
      }

      // Valid selection - prevent event propagation and add to selection
      e.preventDefault();
      e.stopPropagation();

      // Add to selection with visual feedback
      element.classList.add("reviewai-selected");
      selectedElements.push(element);

      // Update UI
      countEl.textContent = selectedElements.length;

      // Enable save button when we have enough selections
      if (selectedElements.length >= 1) {
        finishBtn.disabled = false;
        finishBtn.textContent = `Save Pattern (${selectedElements.length} reviews)`;
      } else {
        finishBtn.textContent = `Save Pattern`;
      }

      // Success feedback
      this.showSelectionToast(
        `Review ${selectedElements.length} selected! ${
          selectedElements.length >= 1
            ? "Ready to save!"
            : "Need 1 review to save."
        }`
      );

      // Add pulse effect to selected element
      element.style.animation = "reviewai-pulse 0.6s ease-out";
    };

    // Add event listener
    document.addEventListener("click", selectionHandler, true);
    this.currentSelectionHandler = selectionHandler;
  }

  addImprovedSelectionStyles() {
    const style = document.createElement("style");
    style.id = "reviewai-selection-mode-styles";
    style.textContent = `
    /* Dynamic selection mode styles only */
    .reviewai-selection-mode * {
      cursor: crosshair !important;
    }
    
    #reviewai-selection-prompt,
    #reviewai-selection-prompt * {
      cursor: default !important;
    }
  `;

    document.head.appendChild(style);
  }

  isValidSelectionTarget(element) {
    // Skip ReviewAI elements
    if (
      element.closest("#reviewai-selection-prompt") ||
      element.closest("#reviewai-panel") ||
      element.closest(".reviewai-selection-toast")
    ) {
      return false;
    }

    // Skip common UI elements
    if (
      element.matches(
        "button, input, select, textarea, a, nav, header, footer, script, style, img"
      )
    ) {
      return false;
    }

    // Skip if element is too small
    if (element.offsetWidth < 150 || element.offsetHeight < 30) {
      return false;
    }

    // Skip if element has very few text nodes (likely a container)
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode;
    while ((textNode = walker.nextNode())) {
      if (textNode.textContent.trim().length > 10) {
        textNodes.push(textNode);
      }
    }

    return textNodes.length >= 1; // At least one substantial text node
  }

  // Method 15: Better toast messages (NEW)
  showSelectionToast(message) {
    const existing = this.shadow.getElementById("reviewai-selection-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "reviewai-selection-toast";
    toast.className = "reviewai-selection-toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = "reviewai-toast-appear 0.3s ease-out reverse";
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  }

  exitSelectionMode() {
    console.log("Exiting selection mode...");

    document.body.classList.remove("reviewai-selection-mode");
    const style = this.shadow.getElementById("reviewai-selection-mode-styles");
    if (style) style.remove();

    if (this.currentSelectionHandler) {
      document.removeEventListener("click", this.currentSelectionHandler, true);
      this.currentSelectionHandler = null;
    }

    document.querySelectorAll(".reviewai-selected").forEach((el) => {
      el.classList.remove("reviewai-selected");
      el.style.animation = "";
    });

    // Clear toasts
    const toast = this.shadow.getElementById("reviewai-selection-toast");
    if (toast) toast.remove();
  }

  // Method 17: Hide user selection prompt (NEW)
  hideUserSelectionPrompt() {
    const prompt = this.shadow.getElementById("reviewai-selection-prompt");
    if (prompt) {
      prompt.style.animation = "reviewai-modal-disappear 0.3s ease-out";
      setTimeout(() => prompt.remove(), 300);
    }
  }

  // Method 18: Save user-learned patterns (UPDATED)
  async saveUserLearnedPattern(hostname, selectedElements) {
    console.log("🔵 saveUserLearnedPattern called with:", {
      hostname,
      selectedElementsCount: selectedElements.length,
    });

    selectedElements.forEach((el) => {
      el.classList.remove("reviewai-selected");
    });

    const patterns = this.extractPatternsFromElements(selectedElements);
    console.log("🔵 Extracted patterns:", patterns);

    const key = `reviewai_user_patterns_${hostname}`;
    const data = {
      selectors: patterns,
      lastUpdated: Date.now(),
      confidence: 1.0,
      source: "user",
      reviewCount: selectedElements.length,
      userValidated: true,
    };

    console.log("🔵 Saving to key:", key);
    console.log("🔵 Saving data:", data);

    try {
      await chrome.storage.local.set({ [key]: data });
      console.log("✅ Successfully saved user patterns for", hostname);

      chrome.storage.local.get([key], (result) => {
        console.log("🔍 Verification - Retrieved from storage:", result);
      });
    } catch (error) {
      console.error("❌ Error saving user patterns:", error);
      throw error;
    }
  }

  showSuccessMessage(message) {
    const existing = document.querySelector(".reviewai-success-toast");
    if (existing) existing.remove();

    const successEl = document.createElement("div");
    successEl.className = "reviewai-success-toast";
    successEl.textContent = message;

    document.body.appendChild(successEl);

    setTimeout(() => {
      successEl.classList.add("reviewai-show");
    }, 100);

    setTimeout(() => {
      successEl.classList.remove("reviewai-show");
      setTimeout(() => {
        if (successEl.parentNode) successEl.remove();
      }, 300);
    }, 4000);
  }

  showWarningMessage(message) {
    const existing = document.querySelector(".reviewai-warning-toast");
    if (existing) existing.remove();

    const warningEl = document.createElement("div");
    warningEl.className = "reviewai-warning-toast";
    warningEl.textContent = message;

    document.body.appendChild(warningEl);

    setTimeout(() => {
      warningEl.classList.add("reviewai-show");
    }, 100);

    setTimeout(() => {
      warningEl.classList.remove("reviewai-show");
      setTimeout(() => {
        if (warningEl.parentNode) warningEl.remove();
      }, 300);
    }, 4000);
  }

  showTempMessage(message) {
    const existing = this.shadow.getElementById("reviewai-temp-message");
    if (existing) existing.remove();

    const msgEl = document.createElement("div");
    msgEl.id = "reviewai-temp-message";
    msgEl.textContent = message;

    document.body.appendChild(msgEl);

    setTimeout(() => {
      if (msgEl.parentNode) msgEl.remove();
    }, 3000);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new ReviewAIContentScript();
  });
} else {
  new ReviewAIContentScript();
}
