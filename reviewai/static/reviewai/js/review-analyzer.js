class ReviewAnalyzer {
  constructor() {
    this.textarea = document.getElementById("reviewText");
    this.form = document.getElementById("reviewForm");
    this.resultDiv = document.getElementById("result");
    this.analyzeBtn = document.getElementById("analyzeBtn");

    // Get URLs from global variables set in template
    this.predictUrl = window.djangoUrls?.predict || "/predict/";
    this.csrfToken = window.csrfToken;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Auto-resize textarea
    this.textarea.addEventListener("input", () => {
      this.textarea.style.height = "auto";
      this.textarea.style.height =
        Math.min(this.textarea.scrollHeight, 120) + "px";
    });

    // Form submission
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    // const isAuthenticated = document.body.dataset.authenticated === "true";
    // if (!isAuthenticated) {
    //   this.showAuthRequired();
    //   return;
    // }

    const reviewText = this.textarea.value.trim();
    if (!reviewText) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "warning",
        title: "Please enter a review text",
      });
      return;
    }

    this.setLoadingState(true);

    try {
      const response = await fetch(this.predictUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": this.csrfToken,
        },
        body: JSON.stringify({ review_text: reviewText }),
      });

      const data = await response.json();

      // Handle clean format only
      if (data.prediction) {
        this.displayResult(data, reviewText);
      } else if (data.error) {
        this.displayError(data.error);
      } else {
        this.displayError("Invalid response format");
      }
    } catch (error) {
      this.displayError(`Network error: ${error.message}`);
    } finally {
      this.setLoadingState(false);
    }
  }

  showAuthRequired() {
    this.resultDiv.innerHTML = `
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-yellow-600 mb-4">
                <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-yellow-800 mb-2">Login Required</h3>
            <p class="text-yellow-700 mb-4">You need to be logged in to analyze reviews.</p>
            <div class="space-x-3">
                <a href="/users/login/" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Login
                </a>
                <a href="/users/register/" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Sign Up
                </a>
            </div>
        </div>
    `;
    this.resultDiv.classList.remove("hidden");
  }

  setLoadingState(loading) {
    this.analyzeBtn.disabled = loading;
    this.analyzeBtn.textContent = loading ? "Analyzing..." : "Analyze";
    this.analyzeBtn.className = loading
      ? "bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed whitespace-nowrap"
      : "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap";
  }

  displayResult(result, reviewText) {
    const prediction = result.prediction.toLowerCase().trim();
    const isGenuine = prediction === "genuine";
    const confidence = result.confidence;
    const confidencePercentage = Math.round(confidence * 100);

    const predictionLabel = this.getPredictionLabel(
      result.prediction,
      confidence
    );
    const confidenceDesc = this.getConfidenceDescription(confidence);
    const colors = this.getConfidenceColors(result.prediction, confidence);

    const displayText = result.cleaned_text || reviewText;
    const justification = result.justification || {};

    // Create result HTML
    this.resultDiv.innerHTML = this.createResultHTML(
      displayText,
      predictionLabel,
      confidenceDesc,
      colors,
      confidence,
      confidencePercentage,
      isGenuine,
      result,
      justification
    );

    // Initialize interactive components
    this.initializeCircularProgress(
      confidencePercentage,
      isGenuine,
      confidence
    );
    this.initializeProbabilityBars(result.probabilities);
    this.initializeModelBreakdown(result.individual_predictions);

    this.resultDiv.classList.remove("hidden");
    this.resultDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  createResultHTML(
    reviewText,
    predictionLabel,
    confidenceDesc,
    colors,
    confidence,
    confidencePercentage,
    isGenuine,
    result,
    justification
  ) {
    return `
            <div class="bg-white rounded-xl shadow-lg border-2 ${
              colors.border
            } p-8 ${colors.bg} mb-8">
                <div class="flex items-center justify-center gap-8">
                    <div class="flex-shrink-0">
                        <div id="circularProgress" class="relative w-40 h-40"></div>
                    </div>
                    
                    <div class="flex-1 max-w-md">
                        <div class="text-sm ${
                          colors.accent
                        } italic mb-4 line-clamp-3">
                            "${
                              reviewText.length > 150
                                ? reviewText.substring(0, 150) + "..."
                                : reviewText
                            }"
                        </div>
                        <div class="text-2xl font-bold ${colors.text} mb-2">
                            ${predictionLabel}
                        </div>
                        <div class="text-sm ${colors.accent} font-medium">
                            ${confidenceDesc}
                        </div>
                    </div>
                </div>

                ${confidence < 0.6 ? this.createLowConfidenceWarning() : ""}
                
                ${this.createJustificationSection(justification, colors)}
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 class="font-bold text-gray-800 mb-4 text-lg">Probability Breakdown</h4>
                    <div id="probabilityBreakdown" class="space-y-4"></div>
                </div>
                
                ${
                  result.individual_predictions
                    ? `
                <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h4 class="font-bold text-gray-800 mb-4 text-lg">Model Breakdown</h4>
                    <div id="modelBreakdown" class="space-y-3 text-sm"></div>
                </div>
                `
                    : ""
                }
            </div>
        `;
  }

 createJustificationSection(justification, colors) {
    if (!justification || !justification.overall_summary) {
      return '';
    }

    const reasons = justification.reasons || [];
    const sentiment = justification.sentiment_analysis || {};
    const flags = justification.flags || {};

    return `
      <div class="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
        <h4 class="text-base font-bold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Why This Classification?
        </h4>
        
        <div class="mb-3 p-3 bg-white rounded-md border border-gray-200 text-sm">
          <p class="text-gray-700 leading-relaxed">${justification.overall_summary}</p>
        </div>

        ${sentiment.polarity !== undefined ? `
        <div class="mb-3 p-3 bg-white rounded-md border border-gray-200">
          <h5 class="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Sentiment Analysis</h5>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">Tone:</span>
            <span class="text-sm font-semibold text-gray-800 capitalize">
              ${sentiment.polarity_label || 'neutral'}
            </span>
          </div>
        </div>
      ` : ''}

        <div class="mb-3 p-3 bg-white rounded-md border border-gray-200">
          <h5 class="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Detection Flags</h5>
          <div class="space-y-1.5">
            ${Object.entries(flags).map(([flag, value]) => {
              const label = this.formatFlagLabel(flag);
              
              if (value) {
                return `
                  <div class="flex items-center justify-between px-2 py-1 bg-yellow-50 rounded text-xs">
                    <span class="text-yellow-700 font-medium">${label}</span>
                    <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                `;
              } else {
                return `
                  <div class="flex items-center justify-between px-2 py-1 bg-gray-50 rounded text-xs">
                    <span class="text-gray-500 font-medium">${label}</span>
                    <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                `;
              }
            }).join('')}
          </div>
        </div>

        ${reasons.length > 0 ? `
          <div class="p-3 bg-white rounded-md border border-gray-200">
            <h5 class="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Key Indicators</h5>
            <ul class="space-y-1">
              ${reasons.slice(0, 4).map(reason => `
                <li class="flex items-start text-sm">
                  <span class="text-red-500 mr-2 mt-0.5">•</span>
                  <span class="text-gray-700 flex-1">${reason}</span>
                </li>
              `).join('')}
              ${reasons.length > 4 ? `
                <li class="text-xs text-gray-500 italic mt-1">
                  +${reasons.length - 4} more indicator${reasons.length - 4 > 1 ? 's' : ''}
                </li>
              ` : ''}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
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

  createLowConfidenceWarning() {
    return `
            <div class="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                <div class="flex items-center">
                    <span class="text-yellow-600 text-lg mr-2">⚠️</span>
                    <div>
                        <div class="font-semibold text-yellow-800">Low Confidence Result</div>
                        <div class="text-sm text-yellow-700">Consider getting additional opinions or manual review.</div>
                    </div>
                </div>
            </div>
        `;
  }

  initializeCircularProgress(percentage, isGenuine, confidence) {
    const container = document.getElementById("circularProgress");
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let color;
    if (confidence >= 0.75) {
      color = isGenuine ? "#10b981" : "#ef4444";
    } else if (confidence >= 0.6) {
      color = isGenuine ? "#f59e0b" : "#f97316";
    } else {
      color = "#6b7280";
    }

    container.innerHTML = `
            <svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="60" stroke="#e5e7eb" stroke-width="8" fill="none" />
                <circle 
                    cx="72" cy="72" r="60" stroke="${color}" stroke-width="8" fill="none"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"
                    stroke-linecap="round" class="transition-all duration-1000 ease-out"
                />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900">${percentage}%</div>
                </div>
            </div>
        `;
  }

  initializeProbabilityBars(probabilities) {
    const container = document.getElementById("probabilityBreakdown");
    container.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-green-700 font-medium">Genuine:</span>
                    <span class="font-bold text-green-700 text-lg">${(
                      probabilities.genuine * 100
                    ).toFixed(1)}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-green-500 h-3 rounded-full transition-all duration-1000" style="width: ${
                      probabilities.genuine * 100
                    }%"></div>
                </div>
            </div>
            <div>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-red-700 font-medium">Fake:</span>
                    <span class="font-bold text-red-700 text-lg">${(
                      probabilities.fake * 100
                    ).toFixed(1)}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-red-500 h-3 rounded-full transition-all duration-1000" style="width: ${
                      probabilities.fake * 100
                    }%"></div>
                </div>
            </div>
        `;
  }

  initializeModelBreakdown(individualPredictions) {
    if (!individualPredictions) return;

    const container = document.getElementById("modelBreakdown");
    container.innerHTML = `
            <div class="flex justify-between">
                <span class="font-medium">SVM:</span>
                <span>G: ${(individualPredictions.svm.genuine * 100).toFixed(
                  1
                )}% | F: ${(individualPredictions.svm.fake * 100).toFixed(
      1
    )}%</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium">Random Forest:</span>
                <span>G: ${(individualPredictions.rf.genuine * 100).toFixed(
                  1
                )}% | F: ${(individualPredictions.rf.fake * 100).toFixed(
      1
    )}%</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium">DistilBERT:</span>
                <span>G: ${(
                  individualPredictions.distilbert.genuine * 100
                ).toFixed(1)}% | F: ${(
      individualPredictions.distilbert.fake * 100
    ).toFixed(1)}%</span>
            </div>
        `;
  }

  // Helper methods
  getPredictionLabel(prediction, confidence) {
    const confidenceLevel = confidence * 100;
    const isGenuine = prediction.toLowerCase().trim() === "genuine";

    if (confidenceLevel >= 90) {
      return isGenuine ? "Highly Genuine" : "Definitely Fake";
    } else if (confidenceLevel >= 75) {
      return isGenuine ? "Likely Genuine" : "Likely Fake";
    } else if (confidenceLevel >= 60) {
      return isGenuine ? "Possibly Genuine" : "Possibly Fake";
    } else {
      return "Uncertain Result";
    }
  }

  getConfidenceDescription(confidence) {
    const confidenceLevel = confidence * 100;

    if (confidenceLevel >= 90) {
      return "Very High Confidence";
    } else if (confidenceLevel >= 75) {
      return "High Confidence";
    } else if (confidenceLevel >= 60) {
      return "Moderate Confidence";
    } else {
      return "Low Confidence - Manual Review Recommended";
    }
  }

  getConfidenceColors(prediction, confidence) {
    const confidenceLevel = confidence * 100;
    const isGenuine = prediction.toLowerCase().trim() === "genuine";

    if (confidenceLevel >= 75) {
      return isGenuine
        ? {
            bg: "bg-green-50",
            border: "border-green-200",
            text: "text-green-800",
            accent: "text-green-600",
          }
        : {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-800",
            accent: "text-red-600",
          };
    } else if (confidenceLevel >= 60) {
      return isGenuine
        ? {
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            text: "text-yellow-800",
            accent: "text-yellow-600",
          }
        : {
            bg: "bg-orange-50",
            border: "border-orange-200",
            text: "text-orange-800",
            accent: "text-orange-600",
          };
    } else {
      return {
        bg: "bg-gray-50",
        border: "border-gray-300",
        text: "text-gray-800",
        accent: "text-gray-600",
      };
    }
  }

  displayError(errorMessage) {
    this.resultDiv.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg border-2 border-red-200 p-8 bg-red-50">
                <div class="text-center">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h3 class="text-2xl font-bold text-red-800 mb-4">Analysis Error</h3>
                    <p class="text-red-700 text-lg">${errorMessage}</p>
                </div>
            </div>
        `;
    this.resultDiv.classList.remove("hidden");
    this.resultDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ReviewAnalyzer();
});
