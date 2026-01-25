class ReviewAIContentScript {
  constructor() {
    if (window.reviewAIInitialized) {
      console.log("ReviewAI: Already initialized globally");
      return;
    }

    this.isInitialized = false;
    this.currentUser = null;
    this.isLoggedIn = false;
    this.currentBatchResults = [];

    window.reviewAIInstance = this;

    this.reviewSelectors = {
      amazon: ['div[data-hook="review-collapsed"]', ".review-text-content"],
      ebay: [
        ".fdbk-container__details__comment > span:first-child", 
        ".x-review-section__content"
      ],
      flipkart: [".ZmyHeo", ".review-text"],
      shopee: [
        // ".YNedDV",
        ".meQyXP",
        // ".item"
      ],
      lazada: [
        // ".item-content-main-content",
        // ".item-content-main-content-reviews",
        ".item-content:not(:has(.seller-reply-wrapper-v2)) .item-content-main-content-reviews"

      ],
      temu: ["._2EO0yd2j"],
      shein: [
        // ".rate-des",
        // ".comment-tag-box",
        ".common-reviews-new__middle-text",
      ],
      alibaba: [
        "div.r-relative.r-mt-\\[4px\\].r-overflow-hidden.r-whitespace-normal.r-text-\\[14px\\].r-font-normal.r-leading-\\[18px\\].r-tracking-\\[0\\%\\].r-text-\\[\\#222\\].r-mb-\\[12px\\]",
      ],
      aliexpress: [
        ".list--itemReview--d9Z9Z5Z",
      ],
      newegg: [".comments-content"],
      tiktok: [
        ".H4-Regular.text-color-UIText1"
      ],
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
          const panel = document.getElementById("reviewai-panel");
          if (panel) {
            const productName = await this.getProductName();
            const displayName = productName.length > 50 
              ? productName.substring(0, 50) + "..." 
              : productName;
              
            const productNameEl = panel.querySelector(".reviewai-product-name");
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

    if (hostname.includes("aliexpress.com") || hostname.includes("aliexpress.")) {
      const aliSelectors = [
        "h1.product-title",
        ".product-title",
        "title"
      ];

      for (const selector of aliSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          let title = element.textContent.trim();
          title = title.replace(/\s*[-|]\s*.*/g, "");
          if (title.length > 10) {
            return title;
          }
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

  async createAnalysisPanel() {
    const productName = await this.getProductName(); 
    const displayName =
      productName.length > 50
        ? productName.substring(0, 50) + "..."
        : productName;

    // Create login status indicator
    const loginStatusHTML = this.isLoggedIn 
      ? `<div class="reviewai-user-info">👤 ${this.currentUser?.username || 'User'}</div>`
      : `<div class="reviewai-login-prompt">Not logged in</div>`;

    const panel = document.createElement("div");
    panel.id = "reviewai-panel";
    panel.className = "reviewai-hidden";
    panel.innerHTML = `
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
              Teach ReviewAI
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
  `;

    document.body.appendChild(panel);
    this.setupPanelListeners();
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
          <p>Don't have an account? <a href="https://wawuri07.pythonanywhere.com/users/register/" target="_blank">Register here</a></p>
          <p>Visit <a href="https://wawuri07.pythonanywhere.com" target="_blank">ReviewAI Dashboard</a></p>
        </div>
      </div>
    `;
  }

  // Create logged in account
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
          <a href="https://wawuri07.pythonanywhere.com/dashboard" target="_blank" class="reviewai-btn-secondary">Open Web Dashboard</a>
        </div>
        
        <div id="reviewai-account-status" class="reviewai-status"></div>
        
        <div class="reviewai-account-note">
          <p>Your extension reviews are being saved to your account and will appear in your web dashboard.</p>
        </div>
      </div>
    `;
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

    document.addEventListener('click', (e) => {
      if (e.target.id === 'reviewai-single-toggle') {
        const simpleDiv = document.getElementById('reviewai-single-simple');
        const technicalDiv = document.getElementById('reviewai-single-technical');
        const button = e.target;
        
        if (!simpleDiv || !technicalDiv) {
          console.error("Toggle divs not found");
          return;
        }
        
        if (simpleDiv.style.display === 'none') {
          simpleDiv.style.display = 'block';
          technicalDiv.style.display = 'none';
          button.textContent = 'Show Technical';
        } else {
          simpleDiv.style.display = 'none';
          technicalDiv.style.display = 'block';
          button.textContent = 'Show Simple';
        }
      }
    });

    document
      .getElementById("reviewai-teach-btn")
      ?.addEventListener("click", () => {
        this.startUserSelectionFromUI();
      });

    document
      .getElementById("reviewai-reset-patterns-btn")
      ?.addEventListener("click", () => {
        this.resetLearnedPatterns();
      });

    document
      .getElementById("reviewai-test-detection-btn")
      ?.addEventListener("click", () => {
        this.testCurrentDetection();
      });

    document
      .querySelector('[data-tab="settings"]')
      ?.addEventListener("click", () => {
        this.updatePatternStatus();
      });


    this.setupAccountListeners();
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
    const loginBtn = document.getElementById("reviewai-login-btn");
    const logoutBtn = document.getElementById("reviewai-logout-btn");

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        this.handleLogin();
      });

      // Allow Enter key to submit login
      const usernameInput = document.getElementById("reviewai-username");
      const passwordInput = document.getElementById("reviewai-password");
      
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
    const usernameInput = document.getElementById("reviewai-username");
    const passwordInput = document.getElementById("reviewai-password");
    const loginBtn = document.getElementById("reviewai-login-btn");
    const statusDiv = document.getElementById("reviewai-login-status");

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
        statusDiv.textContent = "Login successful! Refreshing...";
        statusDiv.className = "reviewai-status reviewai-success";

        this.isLoggedIn = true;
        this.currentUser = { 
          username: response.data.username || username
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
    const logoutBtn = document.getElementById("reviewai-logout-btn");
    const statusDiv = document.getElementById("reviewai-account-status");

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
    const panel = document.getElementById("reviewai-panel");
    if (panel) {
      panel.remove();
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
      hostname.includes("newegg.") ||
      hostname.includes("tiktok."); 

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

    // 5. FIFTH: LAST RESORT: Intelligent detection (restrictive)
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
      hostname.includes("aliexpress.com") ||
      hostname.includes("aliexpress.")
    ) {
      selectors = [...this.reviewSelectors.aliexpress];
    } else if (
      hostname.includes("newegg.com") ||
      hostname.includes("newegg.")
    ) {
      selectors = [...this.reviewSelectors.newegg];
      } else if (
      hostname.includes("tiktok.com") ||
      hostname.includes("tiktok.")
    ) {
      selectors = [...this.reviewSelectors.tiktok];
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
      // Skip if it's inside seller reply wrapper
      if (el.closest(".seller-reply-wrapper-v2")) {
        console.log("Skipping Lazada seller reply (wrapper-v2):", text.substring(0, 50));
        return true;
      }

      // Skip if element itself is the wrapper
      if (el.classList.contains("seller-reply-wrapper-v2")) {
        console.log("Skipping Lazada seller reply container:", text.substring(0, 50));
        return true;
      }

      // Skip legacy class names (just in case)
      if (
        el.classList.contains("item-content--seller-reply") ||
        el.closest(".item-content--seller-reply")
      ) {
        console.log("Skipping Lazada seller reply (legacy):", text.substring(0, 50));
        return true;
      }

      // Skip if parent has seller reply indicator
      const parent = el.closest(".item-content");
      if (parent && parent.querySelector(".seller-reply-wrapper-v2")) {
        console.log("Skipping Lazada element with seller reply sibling:", text.substring(0, 50));
        return true;
      }

      // Skip if it contains seller response keywords
      const sellerIndicators = [
        "seller response",
        "seller reply",
        "response from seller",
        "seller's response",
        "seller:",
        "store response",
        "merchant reply",
        "seller feedback"
      ];

      const lowerText = text.toLowerCase();
      if (sellerIndicators.some(indicator => lowerText.includes(indicator))) {
        console.log("Skipping Lazada seller response (text match):", text.substring(0, 50));
        return true;
      }

      // Skip if it's too short
      if (
        /^\d+(\.\d+)?\s*stars?$/.test(text) ||
        /out of 5 stars/i.test(text) ||
        text.split(/\s+/).length < 3
      ) {
        return true;
      }

      // Only accept elements that are actual review content
      if (!el.classList.contains("item-content-main-content-reviews") &&
          !el.closest(".item-content-main-content-reviews")) {
        console.log("Skipping non-review Lazada element:", text.substring(0, 50));
        return true;
      }
    }

    if (hostname.includes("shein.")) {
      if (
        /^(translate|show original|translated by|see original|original review)$/i.test(text) ||
        el.matches('button, a[class*="translate"], [class*="translation"]') ||
        el.closest('[class*="translate"], [class*="translation"]') ||
        (el.tagName === 'SPAN' && /^(Translate|Show original)$/i.test(text)) ||
        el.parentElement?.className.toLowerCase().includes('translate') ||
        el.classList.contains('rate-translate') ||
        el.closest('.rate-translate')
      ) {
        return true;
      }

      if (text.length < 15 && /^(Translate|Show original|show|see|more)$/i.test(text)) {
        return true;
      }

      if (
        el.matches('button, a, span[role="button"]') &&
        text.split(/\s+/).length <= 3
      ) {
        return true;
      }
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
    if (!reviewText || reviewText.length < 3) {
      return false;
    }

    const wordCount = reviewText.split(/\s+/).length;
    if (wordCount < 1) {
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
    
    if (wordCount < 2 && !hasReviewContent) {
      return false;
    }

    const nonReviewPatterns = [
      /^(read more|show more|see all|load more|next|previous|page \d+)$/i,
      /^(\d+\.\d+|\d+)(\s*(stars?|out of|\/))$/i,
      /^(helpful|not helpful|yes|no|report)$/i,
      /^(by|from|posted|reviewed)?\s*[a-z\s]+\s*(ago|on)$/i,
      /^(translate|translated|show original|see original|original review|translation by)$/i,
      /^(translate this|show original text|see original review)$/i,
      /^(google translate|bing translate|auto translate)$/i,
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
        wordCount >= 2 &&
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
          // 1: Try complete class combination first
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

          // 2: If complete selector doesn't work, try individual classes
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
            // 3: Last resort - use first class
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
    
    const iconType = this.getIconType(prediction, confidence);
    const statusIcon = this.getStatusIcon(iconType, 16);
    
    const confidenceColor = this.getConfidenceColor(
      prediction.toLowerCase(),
      confidence
    );
    const predictionLabel = this.getPredictionLabel(
      prediction.toLowerCase(),
      confidence
    );
    const confidenceDesc = this.getConfidenceDescription(confidence);

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
            ? `<div class="reviewai-low-confidence-warning" style="color:#6b7280;">${this.getStatusIcon('warning', 14)} Low confidence result</div>`
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

  async showPanel() {
    const panel = document.getElementById("reviewai-panel");
    
    const productName = await this.getProductName();
    const displayName = productName.length > 50 
      ? productName.substring(0, 50) + "..." 
      : productName;
      
    const productNameEl = panel.querySelector(".reviewai-product-name");
    if (productNameEl) {
      productNameEl.textContent = displayName;
      productNameEl.title = productName;
    }
    
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

  getPlatformCode() {
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes("amazon.")) return "amazon";
    if (hostname.includes("ebay.")) return "ebay";
    if (hostname.includes("shopee.")) return "shopee";
    if (hostname.includes("lazada.")) return "lazada";
    if (hostname.includes("flipkart.")) return "flipkart";
    if (hostname.includes("alibaba.") || hostname.includes("alibaba.")) return "alibaba";
    if (hostname.includes("aliexpress.")) return "aliexpress";
    if (hostname.includes("shein.")) return "shein";
    if (hostname.includes("walmart.")) return "walmart";
    if (hostname.includes("newegg.")) return "newegg";
    if (hostname.includes("temu.")) return "temu";
    if (hostname.includes("zalora.")) return "zalora";
    if (hostname.includes("carousell.")) return "carousell";
    if (hostname.includes("tiktok.")) return "tiktok"; 


    return "extension";
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
    const inputField = document.getElementById("reviewai-text-input");
    inputField.value = originalText;

    this.sendAnalysisRequest(originalText);
  }

  // Separate async method
  async sendAnalysisRequest(originalText) {
    const inputField = document.getElementById("reviewai-text-input");
    
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

          // Show save status
          if (response.data.user_logged_in) {
            this.showTempMessage("✅ Review saved to your account!");
          } else {
            this.showTempMessage("ℹ️ Review analyzed but not saved (not logged in)");
          }
        } else {
          if (response.error) {
            this.showError(response.error);
          } else {
            this.showError("Analysis failed. Please try again.");
          }
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
    const displayEl = document.getElementById("reviewai-batch-limit-display");
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

    const statusEl = document.getElementById("reviewai-scrape-status");
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

          if (results.length === 0 && response.data.skipped && response.data.skipped.length > 0) {
            const firstSkipped = response.data.skipped[0];
            this.showError(`All reviews were skipped: ${firstSkipped.reason}`);
            return;
          }

          if (response.data.skipped && response.data.skipped.length > 0) {
            const skippedCount = response.data.skipped.length;
            const firstReason = response.data.skipped[0].reason;
            this.showWarningMessage(
              `⚠️ ${skippedCount} review(s) skipped: ${firstReason}`
            );
          }

          this.displayBatchResults(results);

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

  createJustificationSection(justification, statusClass) {
    if (!justification || !justification.overall_summary) {
      return '';
    }

    const reasons = justification.reasons || [];
    const sentiment = justification.sentiment_analysis || {};
    const flags = justification.flags || {};

    return `
      <div class="reviewai-justification-section">
        <h5 class="reviewai-justification-title">
          <svg class="reviewai-info-icon" width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#3b82f6" stroke="#2563eb" stroke-width="1"/>
            <path d="M10 10v4M10 6h.01" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Why This Classification?
        </h5>
        
        <div class="reviewai-justification-summary">
          <p>${justification.overall_summary}</p>
        </div>

        ${sentiment.polarity !== undefined ? `
          <div class="reviewai-sentiment-box">
            <div class="reviewai-sentiment-label">Sentiment Tone:</div>
            <div class="reviewai-sentiment-value" style="text-transform: capitalize;">${sentiment.polarity_label || 'neutral'}</div>
          </div>
        ` : ''}

        ${Object.keys(flags).length > 0 ? `
          <div class="reviewai-flags-box">
            <div class="reviewai-flags-label">Detection Flags:</div>
            <div class="reviewai-flags-list-detailed">
              ${this.createDetailedFlagsList(flags)}
            </div>
          </div>
        ` : ''}

        ${reasons.length > 0 ? `
          <div class="reviewai-indicators-box">
            <div class="reviewai-indicators-label">Key Indicators:</div>
            <ul class="reviewai-indicators-list">
              ${reasons.slice(0, 4).map(reason => `
                <li><span class="reviewai-bullet">•</span>${reason}</li>
              `).join('')}
              ${reasons.length > 4 ? `
                <li class="reviewai-more-indicators">+${reasons.length - 4} more indicator${reasons.length - 4 > 1 ? 's' : ''}</li>
              ` : ''}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  createDetailedFlagsList(flags) {
    return Object.entries(flags).map(([flag, value]) => {
      const label = this.formatFlagLabel(flag);
      
      if (value) {
        return `
          <div class="reviewai-flag-item-detected">
            <svg class="reviewai-flag-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span class="reviewai-flag-label">${label}</span>
          </div>
        `;
      } else {
        return `
          <div class="reviewai-flag-item-not-detected">
            <svg class="reviewai-flag-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="reviewai-flag-label">${label}</span>
          </div>
        `;
      }
    }).join('');
  }

  formatFlagLabel(flag) {
    const acronyms = {
      'rf': 'RF',
      'svm': 'SVM'
    };
    
    return flag
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => {
        const lowerWord = word.toLowerCase();
        if (acronyms[lowerWord]) {
          return acronyms[lowerWord];
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  displaySingleResult(result) {
    console.log("Full result object:", result);
    console.log("Prediction:", result.prediction);
    console.log("Confidence:", result.confidence);
    console.log("Probabilities:", result.probabilities);

    const resultEl = document.getElementById("reviewai-single-result");
    const displayText = result.original_text || result.cleaned_text || result.text || '';

    const prediction = result.prediction;
    const confidence = result.confidence;
    const confidencePercentage = Math.round(confidence * 100);
    const probabilities = result.probabilities;
    const justification = result.justification || {};
    const justificationSimple = result.justification_simple || {};
    const overallSummary = justificationSimple.overall_summary || justification.overall_summary || '';
    const simpleReasons = justificationSimple.reasons || justification.simple_reasons || [];
    const technicalReasons = justification.reasons || [];

    const isGenuine = prediction.toLowerCase() === "genuine";

    let statusClass;
    if (confidence >= 0.75) {
      statusClass = isGenuine ? "reviewai-genuine" : "reviewai-fake";
    } else if (confidence >= 0.6) {
      statusClass = "reviewai-medium";
    } else {
      statusClass = "reviewai-uncertain";
    }

    const iconType = this.getIconType(prediction, confidence);
    const statusIcon = this.getStatusIcon(iconType, 24);

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

    const genuineWidth = (probabilities.genuine * 100).toFixed(1);
    const fakeWidth = (probabilities.fake * 100).toFixed(1);

    resultEl.innerHTML = `
      <div class="reviewai-result-card ${statusClass}">
        <div class="reviewai-result-header">
          <span class="reviewai-status-icon">${statusIcon}</span>
          <h4>Review Analysis Result</h4>
        </div>

        ${displayText ? `
          <div class="reviewai-review-display">
            <p class="reviewai-review-text">${this.escapeHtml(displayText)}</p>
          </div>
        ` : ''}
        
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
        
        ${this.createSingleJustificationSection(overallSummary, simpleReasons, technicalReasons, justification.sentiment_analysis, justification.flags, statusClass)}
        
        <div class="reviewai-probabilities">
          <h5>Probability Breakdown:</h5>
          <div class="reviewai-prob-bars-compact">
            <div class="reviewai-prob-item-compact">
              <span class="reviewai-prob-label-compact">Genuine</span>
              <div class="reviewai-prob-bar-compact">
                <div class="reviewai-prob-fill-compact reviewai-genuine-fill" style="width: ${genuineWidth}%"></div>
              </div>
              <span class="reviewai-prob-value-compact">${genuineWidth}%</span>
            </div>
            <div class="reviewai-prob-item-compact">
              <span class="reviewai-prob-label-compact">Fake</span>
              <div class="reviewai-prob-bar-compact">
                <div class="reviewai-prob-fill-compact reviewai-fake-fill" style="width: ${fakeWidth}%"></div>
              </div>
              <span class="reviewai-prob-value-compact">${fakeWidth}%</span>
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

  createSingleJustificationSection(overallSummary, simpleReasons, technicalReasons, sentiment, flags, statusClass) {
    if (!overallSummary && simpleReasons.length === 0 && technicalReasons.length === 0) {
      return '';
    }

    const confidenceColor = statusClass === 'reviewai-genuine' ? '#22c55e' : 
                           statusClass === 'reviewai-fake' ? '#ef4444' : '#f59e0b';

    return `
      <div class="reviewai-justification-section">
        <h5 class="reviewai-justification-title">
          <svg class="reviewai-info-icon" width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#3b82f6" stroke="#2563eb" stroke-width="1"/>
            <path d="M10 10v4M10 6h.01" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Why This Classification?
          
          ${technicalReasons.length > 0 && simpleReasons.length > 0 ? `
            <button id="reviewai-single-toggle" style="
              font-size: 11px;
              color: #2563eb;
              background: none;
              border: 1px solid #2563eb;
              border-radius: 4px;
              padding: 4px 8px;
              cursor: pointer;
              margin-left: auto;
            ">
              Show Technical
            </button>
          ` : ''}
        </h5>
        
        ${overallSummary ? `
          <div style="
            background: linear-gradient(to right, #eff6ff, #dbeafe);
            border-left: 4px solid ${confidenceColor};
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 8px;
            font-size: 13px;
            color: #1e40af;
            font-weight: 500;
          ">
            💡 ${overallSummary}
          </div>
        ` : ''}

        <!-- Simple Reasons (Default) -->
        <div id="reviewai-single-simple" style="${simpleReasons.length === 0 ? 'display: none;' : ''}">
          ${simpleReasons.map(reason => `
            <div style="margin: 8px 0; display: flex; align-items: start; font-size: 12px;">
              <span style="color: ${confidenceColor}; margin-right: 8px; flex-shrink: 0;">•</span>
              <span style="flex: 1; color: #374151;">${reason}</span>
            </div>
          `).join('')}
        </div>
        
        <!-- Technical Reasons (Hidden) -->
        <div id="reviewai-single-technical" style="display: none;">
          ${technicalReasons.map(reason => `
            <div style="margin: 8px 0; display: flex; align-items: start; font-size: 12px;">
              <span style="color: ${confidenceColor}; margin-right: 8px; flex-shrink: 0;">•</span>
              <span style="flex: 1; color: #374151;">${reason}</span>
            </div>
          `).join('')}
        </div>

        ${sentiment && sentiment.polarity !== undefined ? `
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <div style="font-size: 11px; color: #6b7280;">
              <strong>Sentiment:</strong> ${sentiment.polarity_label || 'N/A'} (${(sentiment.polarity || 0).toFixed(2)})
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  createLowConfidenceWarning() {
    const warningIcon = this.getStatusIcon('warning', 20);
    return `
    <div class="reviewai-low-confidence-warning">
      <div class="reviewai-warning-content">
        <span class="reviewai-warning-icon">${warningIcon}</span>
        <div>
          <div class="reviewai-warning-title">Low Confidence Result</div>
          <div class="reviewai-warning-text">Consider getting additional opinions or manual review.</div>
        </div>
      </div>
    </div>
  `;
  }

  toggleBatchDetails(reviewIndex, buttonElement) {
    console.log(`toggleBatchDetails called for index: ${reviewIndex}`);
    
    const detailsSection = document.getElementById(`reviewai-batch-details-${reviewIndex}`);
    const icon = buttonElement.querySelector('.reviewai-expand-icon');
    const text = buttonElement.querySelector('.reviewai-expand-text');
    
    console.log('Details section found:', detailsSection);
    console.log('Current display:', detailsSection?.style.display);
    
    if (!detailsSection) {
      console.error('Details section not found for index:', reviewIndex);
      return;
    }
    
    if (detailsSection.style.display === 'none' || detailsSection.style.display === '') {
      detailsSection.style.display = 'block';
      icon.textContent = '▲';
      text.textContent = 'Hide';
      buttonElement.classList.add('expanded');
      
      setTimeout(() => {
        detailsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      detailsSection.style.display = 'none';
      icon.textContent = '▼';
      text.textContent = 'View Details';
      buttonElement.classList.remove('expanded');
    }
  }

  createBatchJustificationSection(justification, statusClass) {
    if (!justification || !justification.overall_summary) {
      return '<div class="reviewai-details-section"><p class="reviewai-no-details">No additional analysis available</p></div>';
    }

    const reasons = justification.reasons || [];
    const sentiment = justification.sentiment_analysis || {};
    const flags = justification.flags || {};

    return `
      <div class="reviewai-details-section">
        <h6>Why This Classification?</h6>
        
        <div class="reviewai-justification-summary-compact">
          <p>${justification.overall_summary}</p>
        </div>

        <div class="reviewai-details-grid">
          ${sentiment.polarity !== undefined ? `
            <div class="reviewai-detail-box">
              <div class="reviewai-detail-label">Sentiment Tone</div>
              <div class="reviewai-detail-value" style="text-transform: capitalize;">${sentiment.polarity_label || 'neutral'}</div>
            </div>
          ` : ''}

          ${Object.keys(flags).length > 0 ? `
            <div class="reviewai-detail-box">
              <div class="reviewai-detail-label">Detection Flags</div>
              <div class="reviewai-flags-compact-batch">
                ${this.createBatchFlagsList(flags)}
              </div>
            </div>
          ` : ''}
        </div>

        ${reasons.length > 0 ? `
          <div class="reviewai-indicators-compact">
            <div class="reviewai-detail-label">Key Indicators:</div>
            <ul>
              ${reasons.slice(0, 3).map(reason => `<li>${reason}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  createBatchFlagsList(flags) {
    const activeFlags = Object.entries(flags)
      .filter(([flag, value]) => value)
      .map(([flag, value]) => this.formatFlagLabel(flag));
    
    if (activeFlags.length === 0) {
      return '<span style="color: #9ca3af; font-size: 11px;">No flags detected</span>';
    }
    
    return activeFlags.map(label => 
      `<span class="reviewai-flag-mini">${label}</span>`
    ).join('');
  }

  displayBatchResults(results) {
    const resultEl = document.getElementById("reviewai-batch-result");

    if (!Array.isArray(results) || results.length === 0) {
      this.showError("No results received from batch analysis.");
      return;
    }

    this.currentBatchResults = results;
    console.log('Stored batch results:', this.currentBatchResults.length);

    const fakeCount = results.filter(
      (r) => r.prediction && r.prediction.toLowerCase() === "fake"
    ).length;
    const genuineCount = results.filter(
      (r) => r.prediction && r.prediction.toLowerCase() === "genuine"
    ).length;
    const fakePercentage = ((fakeCount / results.length) * 100).toFixed(1);
    const genuinePercentage = ((genuineCount / results.length) * 100).toFixed(1);

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
      const prediction = result.prediction ? result.prediction.toLowerCase() : "";
      const confidence = typeof result.confidence === "number" ? result.confidence : parseFloat(result.confidence);

      let statusClass;
      if (confidence >= 0.75) {
        statusClass = prediction === "genuine" ? "reviewai-genuine" : "reviewai-fake";
      } else if (confidence >= 0.6) {
        statusClass = "reviewai-medium";
      } else {
        statusClass = "reviewai-uncertain";
      }

      const iconType = this.getIconType(prediction, confidence);
      const statusIcon = this.getStatusIcon(iconType, 18);
      const confidenceDisplay = confidence ? (confidence * 100).toFixed(1) : "N/A";

      const displayText = result.original_text || result.cleaned_text || result.text || "N/A";
      const preview = displayText.substring(0, 100) + (displayText.length > 100 ? "..." : "");

      const predictionLabel = this.getPredictionLabel(prediction, confidence);
      
      // GET BOTH JUSTIFICATIONS
      const justification = result.justification || {};
      const justificationSimple = result.justification_simple || {};
      const overallSummary = justificationSimple.overall_summary || justification.overall_summary || '';
      const simpleReasons = justificationSimple.reasons || justification.simple_reasons || [];
      const technicalReasons = justification.reasons || [];
      const sentiment = justificationSimple.sentiment_analysis || justification.sentiment_analysis || {};

      const genuineWidth = (result.probabilities.genuine * 100).toFixed(1);
      const fakeWidth = (result.probabilities.fake * 100).toFixed(1);

      const confidenceColor = this.getConfidenceColor(prediction, confidence);
  
      resultsHTML += `
        <div class="reviewai-batch-item ${statusClass}">
          <div class="reviewai-batch-header">
            <span class="reviewai-status-icon">${statusIcon}</span>
            <span class="reviewai-batch-prediction ${statusClass}">${predictionLabel}</span>
            <span class="reviewai-batch-confidence">${confidenceDisplay}%</span>
          </div>
          <div class="reviewai-batch-preview">${preview}</div>
          
          <div class="reviewai-expand-section">
            <button class="reviewai-expand-btn" data-index="${index}">
              <span class="reviewai-expand-icon">▼</span>
              <span class="reviewai-expand-text">View Details</span>
            </button>
            
            <div class="reviewai-batch-details" id="reviewai-batch-details-${index}" style="display: none;">
              <!-- Full Review -->
              <div class="reviewai-details-section">
                <h6>Full Review:</h6>
                <div class="reviewai-full-review-text">${displayText}</div>
              </div>

              <!-- OVERALL SUMMARY -->
              ${overallSummary ? `
                <div class="reviewai-details-section">
                  <div style="
                    background: linear-gradient(to right, #eff6ff, #dbeafe);
                    border-left: 4px solid ${confidenceColor};
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    color: #1e40af;
                    font-weight: 500;
                  ">
                    💡 ${overallSummary}
                  </div>
                </div>
              ` : ''}

              <!-- KEY FINDINGS WITH TOGGLE -->
              ${simpleReasons.length > 0 || technicalReasons.length > 0 ? `
                <div class="reviewai-details-section">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h6 style="margin: 0;">Key Findings:</h6>
                    ${technicalReasons.length > 0 && simpleReasons.length > 0 ? `
                      <button class="reviewai-batch-toggle" data-index="${index}" style="
                        font-size: 11px;
                        color: #2563eb;
                        background: none;
                        border: 1px solid #2563eb;
                        border-radius: 4px;
                        padding: 4px 8px;
                        cursor: pointer;
                      ">
                        Show Technical
                      </button>
                    ` : ''}
                  </div>
                  
                  <!-- Simple Reasons (Default) -->
                  <div id="reviewai-batch-simple-${index}" class="reviewai-reasons-list">
                    ${simpleReasons.map(reason => `
                      <div style="margin: 8px 0; display: flex; align-items: start; font-size: 12px;">
                        <span style="color: ${confidenceColor}; margin-right: 8px; flex-shrink: 0;">•</span>
                        <span style="flex: 1; color: #374151;">${reason}</span>
                      </div>
                    `).join('')}
                  </div>
                  
                  <!-- Technical Reasons (Hidden) -->
                  <div id="reviewai-batch-technical-${index}" class="reviewai-reasons-list" style="display: none;">
                    ${technicalReasons.map(reason => `
                      <div style="margin: 8px 0; display: flex; align-items: start; font-size: 12px;">
                        <span style="color: ${confidenceColor}; margin-right: 8px; flex-shrink: 0;">•</span>
                        <span style="flex: 1; color: #374151;">${reason}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Sentiment Analysis -->
              ${sentiment.polarity !== undefined ? `
                <div class="reviewai-details-section">
                  <h6>Sentiment Analysis:</h6>
                  <div style="font-size: 12px; color: #6b7280;">
                    <strong>${sentiment.polarity_label || 'N/A'}</strong> (score: ${(sentiment.polarity || 0).toFixed(2)})
                  </div>
                </div>
              ` : ''}

              <!-- Probability Breakdown -->
              <div class="reviewai-details-section">
                <h6>Probability Breakdown:</h6>
                <div class="reviewai-prob-bars-compact">
                  <div class="reviewai-prob-item-compact">
                    <span class="reviewai-prob-label-compact">Genuine</span>
                    <div class="reviewai-prob-bar-compact">
                      <div class="reviewai-prob-fill-compact reviewai-genuine-fill" style="width: ${genuineWidth}%"></div>
                    </div>
                    <span class="reviewai-prob-value-compact">${genuineWidth}%</span>
                  </div>
                  <div class="reviewai-prob-item-compact">
                    <span class="reviewai-prob-label-compact">Fake</span>
                    <div class="reviewai-prob-bar-compact">
                      <div class="reviewai-prob-fill-compact reviewai-fake-fill" style="width: ${fakeWidth}%"></div>
                    </div>
                    <span class="reviewai-prob-value-compact">${fakeWidth}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    resultsHTML += "</div>";
    resultEl.innerHTML = resultsHTML;

    setTimeout(() => {
      this.setupBatchExpandButtons();
      this.setupBatchToggleButtons();
    }, 100);
  }

  setupBatchExpandButtons() {
    console.log('Setting up batch expand buttons...');
    
    const buttons = document.querySelectorAll('.reviewai-expand-btn');
    console.log(`Found ${buttons.length} expand buttons`);
    
    buttons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const index = parseInt(button.getAttribute('data-index'));
        console.log(`Button clicked for index: ${index}`);
        
        this.toggleBatchDetails(index, button);
      });
    });
  }

  setupBatchToggleButtons() {
    const toggleButtons = document.querySelectorAll('.reviewai-batch-toggle');
    console.log(`Found ${toggleButtons.length} batch toggle buttons`);
    
    toggleButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const index = button.getAttribute('data-index');
        const simpleDiv = document.getElementById(`reviewai-batch-simple-${index}`);
        const technicalDiv = document.getElementById(`reviewai-batch-technical-${index}`);
        
        if (!simpleDiv || !technicalDiv) {
          console.error(`Toggle divs not found for batch index ${index}`);
          return;
        }
        
        if (simpleDiv.style.display === 'none') {
          simpleDiv.style.display = 'block';
          technicalDiv.style.display = 'none';
          button.textContent = 'Show Technical';
        } else {
          simpleDiv.style.display = 'none';
          technicalDiv.style.display = 'block';
          button.textContent = 'Show Simple';
        }
      });
    });
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
        return;
      }

      // Filter out non-English reviews
      const validReviews = [];
      
      for (const review of reviews) {
        const reviewText = this.extractReviewText(review);
        
        // Skip if text is too short
        if (!reviewText || reviewText.trim().length < 20) {
          console.warn("Skipping review with short text:", reviewText.substring(0, 50));
          continue;
        }
        
        try {
          const isValid = await this.checkIfEnglish(reviewText);
          if (isValid) {
            validReviews.push(review);
          } else {
            console.log("Filtered Non-English review:", reviewText.substring(0, 50));
          }
        } catch (error) {
          console.error("Language check failed, skipping review:", error);
        }
      }

      if (validReviews.length === 0) {
        this.showError("No English reviews detected. All reviews on this page are in other languages.");
        return;
      }

      // Highlight only valid English reviews
      validReviews.forEach((review, index) => {
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

      // Show accurate count with filtering info
      const filteredCount = reviews.length - validReviews.length;
      if (filteredCount > 0) {
        this.showSuccessMessage(
          `Found ${validReviews.length} English reviews (${filteredCount} non-english reviews filtered out)`
        );
      } else {
        this.showSuccessMessage(
          `Found ${validReviews.length} English reviews`
        );
      }

      setTimeout(() => {
        validReviews.forEach((review) => {
          review.style.outline = "";
          review.style.backgroundColor = "";
          const badge = review.querySelector(".reviewai-badge");
          if (badge) badge.remove();
        });
      }, 5000);

    } catch (error) {
      this.showError("Error testing detection");
    }
  }

  async checkIfEnglish(text) {
    if (!text || text.trim().length < 20) {
      return false;
    }

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            action: "checkLanguage",
            text: text.trim()
          },
          resolve
        );
      });

      return response.success && response.isEnglish;
    } catch (error) {
      console.error("Language check error:", error);
      return false; // skip if check fails
    }
  }

  async updatePatternStatus() {
    const hostname = window.location.hostname;
    const statusEl = document.getElementById("reviewai-pattern-status");
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
    const activeControlsEl = document.getElementById(
      "reviewai-active-controls"
    );
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

    const closeModal = () => {
      console.log("Closing modal...");
      this.exitSelectionMode();
      this.hideUserSelectionPrompt();
      this.showPanel();
    };

    closeBtn.addEventListener("click", closeModal);
    closeHeaderBtn.addEventListener("click", closeModal);
  }

  // Setup improved selection handlers
  setupImprovedSelectionHandlers(selectedElements, countEl, finishBtn) {
    const selectionHandler = (e) => {
      if (e.target.closest("#reviewai-selection-prompt")) {
        return;
      }

      if (e.target.classList.contains("reviewai-selected")) {
        this.showSelectionToast(
          "Already selected! Click on different review text."
        );
        return;
      }

      const element = e.target;
      const text = element.textContent.trim();

      if (text.length < 8) {
        this.showSelectionToast(
          "Text too short. Click on actual review content."
        );
        return;
      }

      if (text.split(/\s+/).length < 5) {
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

      e.preventDefault();
      e.stopPropagation();

      element.classList.add("reviewai-selected");
      selectedElements.push(element);

      countEl.textContent = selectedElements.length;

      if (selectedElements.length >= 1) {
        finishBtn.disabled = false;
        finishBtn.textContent = `Save Pattern (${selectedElements.length} reviews)`;
      } else {
        finishBtn.textContent = `Save Pattern`;
      }

      this.showSelectionToast(
        `Review ${selectedElements.length} selected! ${
          selectedElements.length >= 1
            ? "Ready to save!"
            : "Need 1 review to save."
        }`
      );

      element.style.animation = "reviewai-pulse 0.6s ease-out";
    };

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

    return textNodes.length >= 1;
  }

  // Toast messages
  showSelectionToast(message) {
    const existing = document.getElementById("reviewai-selection-toast");
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
    const style = document.getElementById("reviewai-selection-mode-styles");
    if (style) style.remove();

    if (this.currentSelectionHandler) {
      document.removeEventListener("click", this.currentSelectionHandler, true);
      this.currentSelectionHandler = null;
    }

    document.querySelectorAll(".reviewai-selected").forEach((el) => {
      el.classList.remove("reviewai-selected");
      el.style.animation = "";
    });

    const toast = document.getElementById("reviewai-selection-toast");
    if (toast) toast.remove();
  }

  // Hide user selection prompt
  hideUserSelectionPrompt() {
    const prompt = document.getElementById("reviewai-selection-prompt");
    if (prompt) {
      prompt.style.animation = "reviewai-modal-disappear 0.3s ease-out";
      setTimeout(() => prompt.remove(), 300);
    }
  }

  // Save user-learned patterns (UPDATED)
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
    const existing = document.getElementById("reviewai-temp-message");
    if (existing) existing.remove();

    const msgEl = document.createElement("div");
    msgEl.id = "reviewai-temp-message";
    msgEl.textContent = message;

    document.body.appendChild(msgEl);

    setTimeout(() => {
      if (msgEl.parentNode) msgEl.remove();
    }, 3000);
  }

  // get status icon based on type and size
  getStatusIcon(type, size = 20) {
    const icons = {
      genuine: `
        <svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="9" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
          <path d="M6 10L9 13L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
      warning: `
        <svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L2 17h16L10 2z" fill="#f59e0b" stroke="#d97706" stroke-width="1"/>
          <path d="M10 8v4M10 14h.01" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `,
      error: `
        <svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="9" fill="#ef4444" stroke="#dc2626" stroke-width="1"/>
          <path d="M7 7l6 6M13 7l-6 6" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
      uncertain: `
        <svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="9" fill="#6b7280" stroke="#4b5563" stroke-width="1"/>
          <path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2c0 1.1-.9 2-2 2v1M10 14h.01" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `,
      info: `
        <svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="9" fill="#3b82f6" stroke="#2563eb" stroke-width="1"/>
          <path d="M10 10v4M10 6h.01" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `,
    };
    
    return icons[type] || icons.uncertain;
  }

  // get icon type based on prediction and confidence
  getIconType(prediction, confidence) {
    const pred = prediction.toLowerCase();
    const conf = parseFloat(confidence);
    
    if (pred === "genuine" && conf >= 0.75) return "genuine";
    if (pred === "fake" && conf >= 0.75) return "error";
    if (conf >= 0.6) return "warning";
    return "uncertain";
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
