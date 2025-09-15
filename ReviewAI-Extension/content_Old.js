class ReviewAIContentScript {
  constructor() {
    if (window.reviewAIInitialized) {
      console.log("ReviewAI: Already initialized globally");
      return;
    }

    this.isInitialized = false;
    this.reviewSelectors = {
      amazon: [
        'div[data-hook="review-collapsed"]',
        // ".cr-original-review-content",
        ".review-text-content",
      ],
      ebay: [
        // ".reviews .ebay-review-text",
        // ".review-item-content",
        ".fdbk-container__details__comment",
      ],
      flipkart: ["._6K-7Co", ".review-text"],
      shopee: [
        // '[data-testid="review-content"]',
        // ".review-text",
        // '[class*="review"]',
        // ".comment-content",
        // ".A7MThp",
        ".YNedDV",
      ],
      lazada: [
        ".content",
        // ".item"
      ],
      temu: ["._2EO0yd2j"],
      general: [
        ".review-text",
        ".review-content",
        ".review-body",
        '[class*="review"]',
        '[class*="comment"]',
        ".content",
        '[class*="content"]',
      ],
    };

    this.batchLimit = null;
    window.reviewAIInitialized = true;
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    console.log("ReviewAI: Initializing on", window.location.hostname);

    this.createAnalysisPanel();
    this.setupEventListeners();
    this.addAnalyzeButtons();
    this.isInitialized = true;

    console.log("ReviewAI Content Script initialized");
  }

  getProductName() {
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
        "h1.vR6K3w",
        ".vR6K3w",
        'h1[class*="vR6K3w"]',
        'h1[class*="R6K3w"]',
        '[data-testid="pdp-product-title"]',
        ".items-center h1",
        ".product-briefing h1",
        'h1[class*="title"]',
        'h1[class*="v"]',
        'div[class*="product"] h1',
        'div[class*="title"] h1',
        'div[class*="vR6K3w"] h1',
        'div[class*="WBVL_7"]',
        "h1",
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          return element.textContent.trim();
        }
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

  createAnalysisPanel() {
    const productName = this.getProductName();
    const displayName =
      productName.length > 50
        ? productName.substring(0, 50) + "..."
        : productName;

    const panel = document.createElement("div");
    panel.id = "reviewai-panel";
    panel.className = "reviewai-hidden";
    panel.innerHTML = `
      <div class="reviewai-header">
        <div class="reviewai-header-content">
          <h3>ReviewAI Analysis</h3>
          <div class="reviewai-product-name" title="${productName}">${displayName}</div>
        </div>
        <button id="reviewai-close" class="reviewai-close-btn">&times;</button>
      </div>
      <div class="reviewai-content">
        <div class="reviewai-tabs">
          <button class="reviewai-tab active" data-tab="single">Single Review</button>
          <button class="reviewai-tab" data-tab="batch">Batch Analysis</button>
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
            <div class="reviewai-batch-limit-note">Up to 20 reviews per batch</div>
          </div>
          <div id="reviewai-batch-result" class="reviewai-result-section"></div>
        </div>
      </div>
      <div class="reviewai-loading" id="reviewai-loading">
        <div class="reviewai-spinner"></div>
        <p>Analyzing with ML models...</p>
      </div>
    `;

    document.body.appendChild(panel);
    this.setupPanelListeners();
  }

  setupPanelListeners() {
    document.getElementById("reviewai-close").addEventListener("click", () => {
      this.hidePanel();
    });

    document.querySelectorAll(".reviewai-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    document
      .getElementById("reviewai-analyze-btn")
      .addEventListener("click", () => {
        const text = document
          .getElementById("reviewai-text-input")
          .value.trim();
        if (text) {
          this.analyzeSingleReview(text);
        }
      });

    document
      .getElementById("reviewai-scrape-btn")
      .addEventListener("click", async () => {
        await this.scrapeBatchReviews();
      });
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

  addAnalyzeButtons() {
    try {
      const reviews = this.detectReviews();
      console.log(`ReviewAI: Adding buttons to ${reviews.length} reviews`);

      reviews.forEach((review, index) => {
        try {
          if (!review.querySelector(".reviewai-analyze-quick")) {
            const button = document.createElement("button");
            button.className = "reviewai-analyze-quick";
            button.textContent = "🔍 Analyze";
            button.title = "Analyze this review with ReviewAI";

            button.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const reviewText = this.extractReviewText(review);
              if (reviewText && reviewText.length > 10) {
                this.analyzeSingleReview(reviewText);
                this.showPanel();
              } else {
                this.showError("Unable to extract review text");
              }
            });

            if (
              review.style.position !== "absolute" &&
              review.style.position !== "fixed"
            ) {
              review.style.position = "relative";
            }
            review.appendChild(button);
          }
        } catch (error) {
          console.warn(
            `ReviewAI: Error adding button to review ${index}:`,
            error
          );
        }
      });
    } catch (error) {
      console.error("ReviewAI: Error in addAnalyzeButtons:", error);
    }
  }

  detectReviews() {
    const hostname = window.location.hostname.toLowerCase();
    let selectors = this.reviewSelectors.general;

    if (hostname.includes("amazon.com") || hostname.includes("amazon.")) {
      selectors = [
        ...this.reviewSelectors.amazon,
        // no general selectors for amazon
      ];
      console.log("ReviewAI: Detected Amazon site");
    } else if (hostname.includes("shopee.ph") || hostname.includes("shopee.")) {
      selectors = [
        ...this.reviewSelectors.shopee,
        // no general selectors for shopee
      ];
      console.log("ReviewAI: Detected Shopee site");
    } else if (
      hostname.includes("lazada.com.ph") ||
      hostname.includes("lazada.")
    ) {
      selectors = [
        ...this.reviewSelectors.lazada,
        // no general selectors for Lazada
      ];
      console.log("ReviewAI: Detected Lazada site");
    } else if (hostname.includes("ebay.com") || hostname.includes("ebay.")) {
      selectors = [
        ...this.reviewSelectors.ebay,
        // no general selectors for ebay
      ];
      console.log("ReviewAI: Detected eBay site");
    } else if (hostname.includes("temu.com") || hostname.includes("temu.")) {
      selectors = [
        ...this.reviewSelectors.temu,
        // no general selectors for Temu
      ];
      console.log("ReviewAI: Detected Temu site");
    } else {
      selectors = this.reviewSelectors.general;
      console.log("ReviewAI: Using general selectors for:", hostname);
    }

    const reviews = [];
    const skipKeywords = [
      "ratings & reviews",
      "reviewai analysis",
      "batch analysis",
      "single review",
      "analyze review",
      "result",
      "reviewai",
      "analysis result",
      "flash express",
      "ratings",
      "review",
      "analysis",
      "summary",
      "model breakdown",
      "genuine",
      "fake",
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const text = el.textContent.trim();

        // AMAZON: Skip star ratings
        if (
          hostname.includes("amazon.") &&
          (el.matches(
            ".review-rating, [data-hook='review-star-rating'], .a-icon-star, #acrPopover, .a-icon-alt, .a-icon-row, .a-expander-prompt"
          ) ||
            /^\d+(\.\d+)? out of 5 stars$/.test(text))
        ) {
          return;
        }

        if (
          el.closest("#reviewai-panel") ||
          text === "Analyzing with ML models..." ||
          text === "Analyzing..." ||
          el.classList.contains("reviewai-loading")
        ) {
          return;
        }

        // LAZADA: Skip ratings
        if (hostname.includes("lazada.")) {
          const parent = el.closest(".item-content");
          if (!parent) return;
          if (parent.classList.contains("item-content--seller-reply")) return;
          if (
            /^\d+(\.\d+)?\s*stars?$/.test(text) ||
            /out of 5 stars/i.test(text) ||
            text.split(/\s+/).length < 2
          )
            return;
        }

        const reviewText = this.extractReviewText(el);
        const style = window.getComputedStyle(el);
        const isVisible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          el.offsetParent !== null &&
          el.offsetHeight > 0 &&
          el.offsetWidth > 0;

        if (!isVisible) {
          console.log(
            "ReviewAI: Skipping hidden/unloaded review element:",
            el,
            reviewText
          );
          return;
        }

        if (
          reviewText &&
          reviewText.length >= 2 &&
          !reviews.some((r) => this.extractReviewText(r) === reviewText) &&
          !el.closest(
            ".reviewai-header, .reviewai-content, .reviewai-tabs, .reviewai-result-section"
          )
        ) {
          reviews.push(el);
        }
      });
    });

    console.log(`ReviewAI: Found ${reviews.length} filtered reviews`);

    return reviews;
  }

  extractReviewText(reviewElement) {
    const clonedElement = reviewElement.cloneNode(true);

    const buttons = clonedElement.querySelectorAll(".reviewai-analyze-quick");
    buttons.forEach((button) => button.remove());

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

      chrome.runtime.sendMessage(
        {
          action: "analyzeReview",
          reviewText: selectedText.trim(),
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
    const panel = document.getElementById("reviewai-panel");
    if (panel) {
      if (panel.classList.contains("reviewai-hidden")) {
        panel.classList.remove("reviewai-hidden");
        console.log("Panel shown");
      } else {
        panel.classList.add("reviewai-hidden");
        console.log("Panel hidden");
      }
    } else {
      console.log("Panel not found");
    }
  }

  showPanel() {
    const panel = document.getElementById("reviewai-panel");
    panel.classList.remove("reviewai-hidden");
  }

  hidePanel() {
    const panel = document.getElementById("reviewai-panel");
    panel.classList.add("reviewai-hidden");
  }

  switchTab(tabName) {
    document.querySelectorAll(".reviewai-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    document.querySelectorAll(".reviewai-tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(`reviewai-${tabName}-tab`).classList.add("active");
  }

  showLoading() {
    document.getElementById("reviewai-loading").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("reviewai-loading").style.display = "none";
  }

  analyzeSingleReview(reviewText) {
    if (!reviewText || reviewText.trim().length < 5) {
      this.showError(
        "Please provide a valid review text (at least 5 characters)."
      );
      return;
    }

    this.showLoading();
    document.getElementById("reviewai-text-input").value = reviewText;

    // Send message to background script
    chrome.runtime.sendMessage(
      {
        action: "analyzeReview",
        reviewText: reviewText.trim(),
      },
      (response) => {
        this.hideLoading();

        if (response.success) {
          this.displaySingleResult(response.data);
        } else {
          this.showError(`Analysis failed: ${response.error}`);
        }
      }
    );
  }

  async fetchBatchLimit() {
    if (this.batchLimit !== null) return this.batchLimit;
    try {
      const response = await fetch("/api/get_batch_limit/", { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch batch limit");
      const data = await response.json();
      this.batchLimit = data.batch_limit || 90;
      return this.batchLimit;
    } catch (error) {
      console.warn(
        "ReviewAI: Could not fetch batch limit, using default 20.",
        error
      );
      this.batchLimit = 20;
      return this.batchLimit;
    }
  }

  async scrapeBatchReviews() {
    const reviews = this.detectReviews();

    if (reviews.length === 0) {
      this.showError(
        "No reviews found on this page. Please navigate to a product page with reviews."
      );
      return;
    }
    // const MAX_BATCH_REVIEWS = 20;
    // const reviewTexts = reviews
    //   .slice(0, MAX_BATCH_REVIEWS)
    //   .map((review) => this.extractReviewText(review));
    const batchLimit = await this.fetchBatchLimit();
    const reviewTexts = reviews
      .slice(0, batchLimit)
      .map((review) => this.extractReviewText(review));
    const statusEl = document.getElementById("reviewai-scrape-status");
    statusEl.textContent = `Found ${reviewTexts.length} reviews. Analyzing...`;

    this.showLoading();

    // Send batch analysis request
    chrome.runtime.sendMessage(
      {
        action: "analyzeBatchReviews",
        reviews: reviewTexts,
      },
      (response) => {
        this.hideLoading();
        statusEl.textContent = "";

        if (response.success) {
          const results = response.data.results || response.data;
          this.displayBatchResults(results, reviewTexts);
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

    const resultEl = document.getElementById("reviewai-single-result");

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

  displayBatchResults(results, originalTexts) {
    const resultEl = document.getElementById("reviewai-batch-result");

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
      const preview = originalTexts[index]
        ? originalTexts[index].substring(0, 100) + "..."
        : "N/A";

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
}

// Initialize when DOM is ready
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", () => {
//     new ReviewAIContentScript();
//   });
// } else {
//   new ReviewAIContentScript();
// }

// Re-initialize on dynamic content changes (for SPAs)
// let lastUrl = location.href;
// new MutationObserver(() => {
//   const url = location.href;
//   if (url !== lastUrl) {
//     lastUrl = url;
//     setTimeout(() => {
//       new ReviewAIContentScript();
//     }, 1000);
//   }
// }).observe(document, { subtree: true, childList: true });

// NEW Initialize ReviewAI instance
// let reviewAIInstance = null;

// function initializeReviewAI() {
//   if (reviewAIInstance && reviewAIInstance.isInitialized) {
//     console.log("ReviewAI: Already initialized, skipping...");
//     return;
//   }

//   try {
//     reviewAIInstance = new ReviewAIContentScript();
//     console.log("ReviewAI: New instance created");
//   } catch (error) {
//     console.error("ReviewAI: Failed to initialize:", error);
//   }
// }

// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", initializeReviewAI);
// } else {
//   initializeReviewAI();
// }

// let lastUrl = location.href;
// new MutationObserver(() => {
//   const url = location.href;
//   if (url !== lastUrl) {
//     lastUrl = url;
//     console.log("ReviewAI: URL changed to", url);

//     setTimeout(() => {
//       const panelExists = document.getElementById("reviewai-panel");
//       if (
//         !panelExists &&
//         (!reviewAIInstance || !reviewAIInstance.isInitialized)
//       ) {
//         console.log("ReviewAI: Panel missing, reinitializing...");
//         initializeReviewAI();
//       } else {
//         console.log("ReviewAI: Panel exists, skipping reinitialization");
//       }
//     }, 1000);
//   }
// }).observe(document, { subtree: true, childList: true });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new ReviewAIContentScript();
  });
} else {
  new ReviewAIContentScript();
}
