(function () {
  "use strict";

  if (window.__AVALIAPRO_WIDGET_LOADED__) {
    if (typeof window.__AVALIAPRO_WIDGET_REFRESH__ === "function") {
      window.__AVALIAPRO_WIDGET_REFRESH__();
    }
    return;
  }
  window.__AVALIAPRO_WIDGET_LOADED__ = true;

  var SCRIPT_SELECTOR = 'script[src*="/widget/widget.js"]';
  var STYLE_ID = "avaliapro-widget-styles";
  var WIDGET_ID = "avaliapro-widget";

  var state = {
    currentSku: null,
    lastRenderedSku: null,
    observerStarted: false,
    pollStarted: false,
    pollInterval: null,
    historyListenersStarted: false,
    mutationObserver: null,
    isLoading: false,
    currentPlatformProductId: null,
    currentPlatformVariantId: null,
    requestToken: 0,
    refreshTimer: null,
    reviewsCache: {},
    reviewsCacheOrder: [],
    reviewsCacheLimit: 20,
    reviewsCacheTTL: 60000,
    activeInsightFilter: null,
    reviewsPerPage: 5,
    currentPage: 1,
  };

  function getCurrentScript() {
    if (document.currentScript) return document.currentScript;
    var scripts = document.querySelectorAll(SCRIPT_SELECTOR);
    return scripts[scripts.length - 1] || null;
  }

  var currentScript = getCurrentScript();

  var apiKey = currentScript
    ? currentScript.getAttribute("data-api-key")
    : null;

  if (!apiKey && currentScript && currentScript.src) {
    try {
      var scriptUrl = new URL(currentScript.src, window.location.href);
      apiKey = scriptUrl.searchParams.get("apiKey");
    } catch (error) {}
  }

  var apiBase =
    (currentScript && currentScript.getAttribute("data-api-base")) ||
    "https://avaliapro-api.onrender.com";

  if (!apiKey) {
    console.error("[AvaliaPro] data-api-key não informado no script.");
    return;
  }

  function safeText(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizeSku(value) {
    return normalizeText(value).replace(/\s+/g, " ");
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .avaliapro-widget {
  font-family: Arial, sans-serif;
  margin: 24px 0;
  padding: 20px;
  border: none;
  border-radius: 0;
  background: #ffffff;
  color: #111827;
  box-sizing: border-box;
}

      .avaliapro-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
      }

      .avaliapro-title {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #111827;
      }

      .avaliapro-summary {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      .avaliapro-average {
        font-size: 28px;
        line-height: 1;
        font-weight: 700;
      }

      .avaliapro-stars,
      .avaliapro-review-stars {
        color: #f59e0b;
        letter-spacing: 1px;
      }

      .avaliapro-stars {
        font-size: 18px;
      }

      .avaliapro-count {
        color: #6b7280;
        font-size: 14px;
      }

      .avaliapro-loading,
      .avaliapro-empty {
        font-size: 14px;
        color: #6b7280;
      }

      .avaliapro-empty {
        padding: 16px;
        border: 1px dashed #d1d5db;
        border-radius: 12px;
        background: #fcfcfc;
      }

      .avaliapro-list {
        display: block;
        margin: 18px 0 22px;
      }

    .avaliapro-review {
  padding: 18px 0;
  background: transparent;
}

      .avaliapro-author {
        font-weight: 600;
        font-size: 14px;
        color: #111827;
      }

      .avaliapro-date {
        font-size: 12px;
        color: #6b7280;
      }

      .avaliapro-review-stars {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  margin-bottom: 6px;
}

      .avaliapro-review-title {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 6px;
        color: #111827;
      }

      .avaliapro-review-comment {
        font-size: 14px;
        line-height: 1.5;
        color: #374151;
        white-space: pre-wrap;
      }

      .avaliapro-verified {
        font-size: 12px;
        color: #059669;
        font-weight: 600;
      }

      .avaliapro-form {
        border-top: 1px solid #e5e7eb;
        padding-top: 20px;
        display: grid;
        gap: 12px;
      }

      .avaliapro-form-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #111827;
      }

      .avaliapro-field {
        display: grid;
        gap: 6px;
      }

      .avaliapro-label {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
      }

      .avaliapro-input,
      .avaliapro-textarea,
      .avaliapro-select {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        background: #fff;
        color: #111827;
        outline: none;
      }

      .avaliapro-input:focus,
      .avaliapro-textarea:focus,
      .avaliapro-select:focus {
        border-color: #111827;
      }

      .avaliapro-textarea {
        min-height: 110px;
        resize: vertical;
      }

     .avaliapro-button {
  border: 0;
  border-radius: 12px;
  padding: 12px 18px;
  background: #111827;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  width: fit-content;
  min-width: 180px;
}

      .avaliapro-button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .avaliapro-feedback {
        font-size: 13px;
        border-radius: 10px;
        padding: 10px 12px;
      }

      .avaliapro-feedback.success {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }

      .avaliapro-feedback.error {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }

      .avaliapro-debug {
        margin-top: 10px;
        font-size: 12px;
        color: #9ca3af;
      }

      .avaliapro-review-image {
        margin-top: 10px;
      }

         .avaliapro-review-image img {
        max-width: 120px;
        border-radius: 10px;
        border: 1px solid #e5e7eb;
        display: block;
      }

      #avaliapro-modal-root {
        position: fixed;
        inset: 0;
        z-index: 999999;
      }

      #avaliapro-modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }

#avaliapro-modal-box {
  position: relative;
  background: #fff;
  padding: 28px;
  border-radius: 20px;
  width: calc(100% - 32px);
  max-width: 560px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,0.22);
}

#avaliapro-modal-box .avaliapro-form {
  display: grid;
  gap: 16px;
  width: 100%;
  border-top: 0;
  padding-top: 0;
  margin-top: 18px;
}

#avaliapro-modal-box .avaliapro-field {
  display: grid;
  gap: 8px;
  width: 100%;
}

#avaliapro-modal-box .avaliapro-input,
#avaliapro-modal-box .avaliapro-textarea,
#avaliapro-modal-box .avaliapro-button {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

#avaliapro-modal-box .avaliapro-input,
#avaliapro-modal-box .avaliapro-textarea {
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  border: 1px solid #cfd5df;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

#avaliapro-modal-box .avaliapro-input:focus,
#avaliapro-modal-box .avaliapro-textarea:focus {
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
}

#avaliapro-modal-box .avaliapro-textarea {
  min-height: 170px;
}

#avaliapro-modal-box .avaliapro-button {
  min-height: 52px;
  border-radius: 12px;
  font-size: 15px;
}

#avaliapro-stars-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

       #avaliapro-close-modal {
        position: absolute;
        top: 12px;
        right: 14px;
        border: none;
        background: transparent;
        font-size: 22px;
        cursor: pointer;
        color: #6b7280;
      }

      #avaliapro-modal-box .avaliapro-form {
        width: 100%;
        box-sizing: border-box;
      }

      #avaliapro-modal-box .avaliapro-field {
        width: 100%;
        box-sizing: border-box;
      }

      #avaliapro-modal-box .avaliapro-input,
      #avaliapro-modal-box .avaliapro-textarea,
      #avaliapro-modal-box .avaliapro-select,
      #avaliapro-modal-box .avaliapro-button {
        width: 100%;
        box-sizing: border-box;
        display: block;
      }

      #avaliapro-stars-input {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
      }

      #avaliapro-stars-input span {
        transition: transform 0.12s ease, opacity 0.12s ease;
        transform-origin: center;
      }

      #avaliapro-stars-input span:hover {
  transform: scale(1.12);
}

.avaliapro-stars,
.avaliapro-review-stars {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1;
  vertical-align: middle;
}

/* padrão (reviews) */
.avaliapro-star-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}

.avaliapro-star-svg svg {
  display: block;
  width: 18px;
  height: 18px;
  overflow: visible;
}

.avaliapro-stars .avaliapro-star-svg {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
}

.avaliapro-stars .avaliapro-star-svg svg {
  width: 26px;
  height: 26px;
}

@keyframes avaliapro-spin {
  to { transform: rotate(360deg); }
}

.avaliapro-review:last-child div[style*="border-bottom"] {
  border-bottom: none !important;
}

    `;
    document.head.appendChild(style);
  }

  function formatDate(value) {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString("pt-BR");
    } catch (error) {
      return "";
    }
  }

  function getStars(rating) {
    var numeric = Number(rating) || 0;

    var full = Math.floor(numeric);
    var hasHalf = numeric - full >= 0.5;
    var empty = 5 - full - (hasHalf ? 1 : 0);

    function buildStar(type, index) {
      var gradientId =
        "avaliapro-star-half-" +
        index +
        "-" +
        Math.random().toString(36).slice(2, 8);
      var fillColor = "#f5a623";
      var emptyFill = "#ffffff";
      var emptyStroke = "#f5a623";

      if (type === "full") {
        return `
          <span class="avaliapro-star-svg" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M12 2.35l2.91 5.9 6.51.95-4.71 4.59 1.11 6.49L12 17.77l-5.82 3.06 1.11-6.49L2.58 9.2l6.51-.95L12 2.35z"
                fill="${fillColor}"
                stroke="${fillColor}"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        `;
      }

      if (type === "half") {
        return `
          <span class="avaliapro-star-svg" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <defs>
                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="50%" stop-color="${fillColor}"></stop>
                  <stop offset="50%" stop-color="${emptyFill}"></stop>
                  <stop offset="100%" stop-color="${emptyFill}"></stop>
                </linearGradient>
              </defs>
              <path
                d="M12 2.35l2.91 5.9 6.51.95-4.71 4.59 1.11 6.49L12 17.77l-5.82 3.06 1.11-6.49L2.58 9.2l6.51-.95L12 2.35z"
                fill="url(#${gradientId})"
                stroke="${fillColor}"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        `;
      }

      return `
        <span class="avaliapro-star-svg" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M12 2.35l2.91 5.9 6.51.95-4.71 4.59 1.11 6.49L12 17.77l-5.82 3.06 1.11-6.49L2.58 9.2l6.51-.95L12 2.35z"
              fill="${emptyFill}"
              stroke="${emptyStroke}"
              stroke-width="1.7"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      `;
    }

    var html = "";

    for (var i = 0; i < full; i++) {
      html += buildStar("full", i);
    }

    if (hasHalf) {
      html += buildStar("half", full);
    }

    for (var j = 0; j < empty; j++) {
      html += buildStar("empty", full + (hasHalf ? 1 : 0) + j);
    }

    return html;
  }

  function getAverageDisplay(value) {
    var numeric = Number(value) || 0;
    return numeric.toFixed(1);
  }

  function getRatingLabel(value) {
    var rating = Number(value) || 0;

    if (rating >= 4.5) return "Excelente";
    if (rating >= 4) return "Muito bom";
    if (rating >= 3) return "Bom";
    if (rating >= 2) return "Regular";
    if (rating > 0) return "Ruim";
    return "";
  }

  function getRatingBreakdown(reviews) {
    var list = Array.isArray(reviews) ? reviews : [];
    var counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    for (var i = 0; i < list.length; i++) {
      var review = list[i];
      var rating = Math.floor(Number(review && review.rating) || 0);

      if (counts[rating] != null) {
        counts[rating]++;
      }
    }

    var total = list.length || 0;

    return [5, 4, 3, 2, 1].map(function (star) {
      var count = counts[star] || 0;
      var percentage = total > 0 ? Math.round((count / total) * 100) : 0;

      return {
        star: star,
        count: count,
        percentage: percentage,
      };
    });
  }

  function getRecommendationRate(reviews) {
    var list = Array.isArray(reviews) ? reviews : [];

    if (!list.length) return 0;

    var positive = 0;

    for (var i = 0; i < list.length; i++) {
      var rating = Number(list[i] && list[i].rating) || 0;

      if (rating >= 4) {
        positive++;
      }
    }

    return Math.round((positive / list.length) * 100);
  }

  function getReviewInsights(reviews) {
    var list = Array.isArray(reviews) ? reviews : [];
    var joined = list
      .map(function (review) {
        return normalizeText(review && review.comment).toLowerCase();
      })
      .join(" ");

    var patterns = [
      {
        label: "Natural",
        keywords: ["natural", "naturais", "naturalidade", "realista"],
      },
      {
        label: "Macio",
        keywords: ["macio", "macia", "maciez", "suave"],
      },
      {
        label: "Confortável",
        keywords: [
          "confortável",
          "confortavel",
          "leve",
          "ajuste",
          "ajustável",
          "ajustavel",
        ],
      },
      {
        label: "Entrega rápida",
        keywords: [
          "entrega rápida",
          "entrega rapida",
          "chegou rápido",
          "chegou rapido",
          "rápida",
          "rapida",
        ],
      },
      {
        label: "Visual bonito",
        keywords: [
          "lindo",
          "linda",
          "bonito",
          "bonita",
          "perfeito",
          "perfeita",
        ],
      },
      {
        label: "Bem embalado",
        keywords: ["bem embalado", "bem embalada", "embalado", "embalada"],
      },
      {
        label: "Ótimo atendimento",
        keywords: [
          "atendimento",
          "atencioso",
          "atenciosa",
          "me atenderam bem",
          "atendeu super bem",
        ],
      },
      {
        label: "Veio com brinde",
        keywords: ["brinde", "brindes", "veio com brinde", "mandaram brinde"],
      },
    ];

    var results = [];

    for (var i = 0; i < patterns.length; i++) {
      var found = false;

      for (var j = 0; j < patterns[i].keywords.length; j++) {
        if (joined.indexOf(patterns[i].keywords[j]) !== -1) {
          found = true;
          break;
        }
      }

      if (found) {
        results.push(patterns[i].label);
      }

      if (results.length >= 4) {
        break;
      }
    }

    return results;
  }

  function filterReviewsByInsight(reviews, insightLabel) {
    var list = Array.isArray(reviews) ? reviews : [];
    var label = normalizeText(insightLabel).toLowerCase();

    if (!label) return list;

    var keywordMap = {
      natural: ["natural", "naturais", "naturalidade", "realista"],
      macio: ["macio", "macia", "maciez", "suave"],
      confortável: [
        "confortável",
        "confortavel",
        "leve",
        "ajuste",
        "ajustável",
        "ajustavel",
      ],
      "entrega rápida": [
        "entrega rápida",
        "entrega rapida",
        "chegou rápido",
        "chegou rapido",
        "rápida",
        "rapida",
      ],
      "visual bonito": [
        "lindo",
        "linda",
        "bonito",
        "bonita",
        "perfeito",
        "perfeita",
      ],
      "bem embalado": ["bem embalado", "bem embalada", "embalado", "embalada"],
      "ótimo atendimento": [
        "atendimento",
        "atencioso",
        "atenciosa",
        "me atenderam bem",
        "atendeu super bem",
      ],
      "veio com brinde": [
        "brinde",
        "brindes",
        "veio com brinde",
        "mandaram brinde",
      ],
    };

    var keywords = keywordMap[label] || [label];

    return list.filter(function (review) {
      var comment = normalizeText(review && review.comment).toLowerCase();

      for (var i = 0; i < keywords.length; i++) {
        if (comment.indexOf(keywords[i]) !== -1) {
          return true;
        }
      }

      return false;
    });
  }

  function getSkuCandidates() {
    var candidates = [];

    function pushCandidate(value, element, source) {
      var sku = normalizeSku(value);
      if (!sku) return;
      candidates.push({
        sku: sku,
        element: element || null,
        source: source || "unknown",
      });
    }

    var dataProductSkuEl = document.querySelector("[data-product-sku]");
    if (dataProductSkuEl) {
      pushCandidate(
        dataProductSkuEl.getAttribute("data-product-sku"),
        dataProductSkuEl,
        "data-product-sku"
      );
    }

    var selectors = [
      "[data-sku]",
      "[data-variant-sku]",
      ".product-sku",
      "#product-sku",
    ];

    for (var i = 0; i < selectors.length; i++) {
      var element = document.querySelector(selectors[i]);
      if (!element) continue;

      pushCandidate(
        element.getAttribute("data-sku"),
        element,
        selectors[i] + ":data-sku"
      );

      // data-product-id agora é tratado separadamente como platformProductId

      pushCandidate(
        element.getAttribute("data-variant-sku"),
        element,
        selectors[i] + ":data-variant-sku"
      );
      pushCandidate(element.textContent, element, selectors[i] + ":text");
    }

    var metaRetailer = document.querySelector(
      'meta[property="product:retailer_item_id"]'
    );
    if (metaRetailer) {
      pushCandidate(
        metaRetailer.getAttribute("content"),
        metaRetailer,
        'meta[property="product:retailer_item_id"]'
      );
    }

    var metaVariantSku = document.querySelector('meta[name="variant-sku"]');
    if (metaVariantSku) {
      pushCandidate(
        metaVariantSku.getAttribute("content"),
        metaVariantSku,
        'meta[name="variant-sku"]'
      );
    }

    var metaProductSku = document.querySelector('meta[name="product-sku"]');
    if (metaProductSku) {
      pushCandidate(
        metaProductSku.getAttribute("content"),
        metaProductSku,
        'meta[name="product-sku"]'
      );
    }

    var variantsElement =
      document.querySelector(".js-product-container[data-variants]") ||
      document.querySelector("[data-store='product-detail'][data-variants]");

    if (variantsElement) {
      try {
        var variantsRaw = variantsElement.getAttribute("data-variants");
        var variants = JSON.parse(variantsRaw || "[]");

        if (Array.isArray(variants) && variants.length > 0) {
          for (var j = 0; j < variants.length; j++) {
            pushCandidate(
              variants[j] && variants[j].sku,
              variantsElement,
              "data-variants:sku"
            );
          }
        }
      } catch (error) {
        console.warn("[AvaliaPro] Não foi possível ler data-variants.");
      }
    }

    return candidates;
  }

  function getSku() {
    var candidates = getSkuCandidates();

    if (!candidates || !candidates.length) {
      return null;
    }

    for (var i = 0; i < candidates.length; i++) {
      if (
        candidates[i] &&
        candidates[i].source &&
        candidates[i].source.indexOf("data-variants") !== -1
      ) {
        return candidates[i];
      }
    }

    return candidates[0];
  }

  function getPlatformProductId() {
    var productIdElement = document.querySelector("[data-product-id]");
    if (productIdElement) {
      var dataValue = normalizeText(
        productIdElement.getAttribute("data-product-id")
      );

      if (dataValue) return dataValue;
    }

    var metaName = document.querySelector('meta[name="platform-product-id"]');
    if (metaName) {
      var metaNameValue = normalizeText(metaName.getAttribute("content"));
      if (metaNameValue) return metaNameValue;
    }

    var metaProperty = document.querySelector(
      'meta[property="platform-product-id"]'
    );
    if (metaProperty) {
      var metaPropertyValue = normalizeText(
        metaProperty.getAttribute("content")
      );
      if (metaPropertyValue) return metaPropertyValue;
    }

    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      var canonicalHref = normalizeText(canonical.getAttribute("href"));
      var canonicalMatch = canonicalHref.match(/\/produtos\/[^/]+\/(\d+)/i);
      if (canonicalMatch && canonicalMatch[1]) return canonicalMatch[1];
    }

    var pathnameMatch = window.location.pathname.match(/\/produtos\/([^/]+)/i);
    if (pathnameMatch && pathnameMatch[1]) {
      return pathnameMatch[1];
    }

    return null;
  }

  function getPlatformVariantId() {
    var variantIdElement =
      document.querySelector("[data-platform-variant-id]") ||
      document.querySelector("[data-variant-id]");

    if (variantIdElement) {
      var dataValue = normalizeText(
        variantIdElement.getAttribute("data-platform-variant-id") ||
          variantIdElement.getAttribute("data-variant-id")
      );

      if (dataValue) return dataValue;
    }

    var metaName = document.querySelector('meta[name="platform-variant-id"]');
    if (metaName) {
      var metaNameValue = normalizeText(metaName.getAttribute("content"));
      if (metaNameValue) return metaNameValue;
    }

    var metaProperty = document.querySelector(
      'meta[property="platform-variant-id"]'
    );
    if (metaProperty) {
      var metaPropertyValue = normalizeText(
        metaProperty.getAttribute("content")
      );
      if (metaPropertyValue) return metaPropertyValue;
    }

    return null;
  }

  function getProductCacheKey(sku) {
    var platformProductId = getPlatformProductId();
    var platformVariantId = getPlatformVariantId();

    if (platformProductId && platformVariantId) {
      return (
        "platformProductId:" +
        platformProductId +
        "|platformVariantId:" +
        platformVariantId
      );
    }

    if (platformProductId) {
      return "platformProductId:" + platformProductId;
    }

    if (sku && platformVariantId) {
      return "sku:" + sku + "|platformVariantId:" + platformVariantId;
    }

    if (sku) {
      return "sku:" + sku;
    }

    return null;
  }

  function removeReviewsCacheKey(cacheKey) {
    if (!cacheKey || !state.reviewsCache[cacheKey]) return;

    delete state.reviewsCache[cacheKey];

    var index = state.reviewsCacheOrder.indexOf(cacheKey);
    if (index !== -1) {
      state.reviewsCacheOrder.splice(index, 1);
    }
  }

  function invalidateReviewsCache(sku, platformProductId, platformVariantId) {
    if (platformProductId && platformVariantId) {
      removeReviewsCacheKey(
        "platformProductId:" +
          platformProductId +
          "|platformVariantId:" +
          platformVariantId
      );
    }

    if (platformProductId) {
      removeReviewsCacheKey("platformProductId:" + platformProductId);
    }

    if (sku && platformVariantId) {
      removeReviewsCacheKey(
        "sku:" + sku + "|platformVariantId:" + platformVariantId
      );
    }

    if (sku) {
      removeReviewsCacheKey("sku:" + sku);
    }
  }

  function resolveContainer(skuInfo) {
    var existing = document.getElementById(WIDGET_ID);
    if (existing) {
      if (document.body.contains(existing)) {
        return existing;
      }

      existing.remove();
    }

    var script = getCurrentScript();
    var targetSelector = script
      ? normalizeText(script.getAttribute("data-target"))
      : "";

    var explicit = null;

    if (targetSelector) {
      try {
        explicit = document.querySelector(targetSelector);
      } catch (error) {
        console.warn(
          "[AvaliaPro] data-target inválido no script:",
          targetSelector
        );
      }
    }

    if (!explicit) {
      explicit =
        document.getElementById("avaliapro-widget") ||
        document.querySelector("[data-avaliapro-widget]") ||
        document.querySelector("main") ||
        document.body;
    }

    if (!explicit) {
      var productForm =
        document.querySelector('form[action*="/comprar"]') ||
        document.querySelector('form[action*="/cart"]') ||
        document.querySelector(".js-product-form") ||
        document.querySelector("[data-store='product-form']");

      var productSection =
        document.querySelector("[data-store='product-page']") ||
        document.querySelector(".js-product-container") ||
        document.querySelector(".product-detail") ||
        document.querySelector(".product-form");

      var parent = productSection || productForm;

      if (parent) {
        explicit = document.createElement("div");
        explicit.id = WIDGET_ID;
        parent.appendChild(explicit);
        return explicit;
      }

      console.warn(
        "AvaliaPro: container explícito não encontrado. Use #avaliapro-widget, [data-avaliapro-widget] ou data-target no script."
      );
      return null;
    }

    explicit.id = WIDGET_ID;

    /* container de resumo perto do título do produto */

    var summaryId = "avaliapro-summary";
    var existingSummary = document.getElementById(summaryId);

    if (!existingSummary) {
      var title =
        document.querySelector("h1") ||
        document.querySelector(".product-name") ||
        document.querySelector(".product-title");

      if (title && title.parentElement) {
        if (!title.parentElement.querySelector("#" + summaryId)) {
          var summary = document.createElement("div");
          summary.id = summaryId;
          summary.style.marginTop = "6px";

          title.parentElement.insertBefore(summary, title.nextSibling);
        }
      }
    }

    return explicit;
  }

  function renderLoading(container, sku) {
    container.innerHTML = `
      <div class="avaliapro-widget" data-sku="${safeText(sku || "")}">
        <div class="avaliapro-loading">Carregando avaliações...</div>
      </div>
    `;
  }

  function renderError(container, message, sku) {
    container.innerHTML = `
      <div class="avaliapro-widget" data-sku="${safeText(sku || "")}">
        <div class="avaliapro-feedback error">${safeText(
          message || "Erro ao carregar avaliações."
        )}</div>
      </div>
    `;
  }

  function buildReviewItem(review) {
    var titleHtml =
      review && review.title
        ? `<div class="avaliapro-review-title">${safeText(review.title)}</div>`
        : "";

    var verifiedHtml =
      review && review.verifiedPurchase
        ? `<div class="avaliapro-verified">Compra verificada</div>`
        : "";

    var imageHtml =
      review && review.imageUrl
        ? `
        <div class="avaliapro-review-image">
          <img src="${safeText(review.imageUrl)}" alt="Imagem da avaliação">
        </div>
      `
        : "";

    var authorName = safeText((review && review.authorName) || "Cliente");
    var authorInitial = safeText(
      normalizeText((review && review.authorName) || "C")
        .charAt(0)
        .toUpperCase()
    );

    return `
      <div class="avaliapro-review">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="
  width:40px;
  height:40px;
  min-width:40px;
  border-radius:999px;
  background:#f3f4f6;
  color:#111827;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:14px;
  font-weight:700;
  border:1px solid #e5e7eb;
  margin-top:2px;
">
            ${authorInitial}
          </div>

          <div style="flex:1;min-width:0;border-bottom:1px solid #e5e7eb;padding-bottom:18px;">
            <div class="avaliapro-review-top">
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;line-height:1;">
    <div class="avaliapro-author">${authorName}</div>

    <div style="font-size:12px;color:#9ca3af;">
      ${safeText(formatDate(review && review.createdAt))}
    </div>
  </div>

  ${verifiedHtml}
</div>

            <div class="avaliapro-review-stars" style="margin-top:6px;margin-bottom:6px;">
  ${getStars(review && review.rating)}
</div>
            ${titleHtml}
            <div class="avaliapro-review-comment">${safeText(
              normalizeText((review && review.comment) || "")
            )}</div>
            ${imageHtml}
          </div>
        </div>
      </div>
    `;
  }
  function renderWidget(container, data, sku) {
    var platformProductId = state.currentPlatformProductId;
    var platformVariantId = state.currentPlatformVariantId;
    var summary = (data && data.summary) || {};
    var reviews = Array.isArray(data && data.reviews) ? data.reviews : [];
    var averageRating = Number(summary.averageRating);

    if (!Number.isFinite(averageRating)) {
      averageRating = 0;
    }

    var totalReviews = Number(summary.totalReviews || reviews.length || 0);

    var safeReviews = reviews
      .filter(function (r) {
        return r && typeof r === "object";
      })
      .sort(function (a, b) {
        return (b.rating || 0) - (a.rating || 0);
      });

    var filteredReviews = state.activeInsightFilter
      ? filterReviewsByInsight(safeReviews, state.activeInsightFilter)
      : safeReviews;

    var recommendationRate = getRecommendationRate(safeReviews);
    var reviewInsights = getReviewInsights(safeReviews);
    var highlightReview = safeReviews.length ? safeReviews[0] : null;
    var hasHighlightSlot = !!highlightReview && !state.activeInsightFilter;

    var listReviews = filteredReviews.filter(function (review) {
      return !highlightReview || review !== highlightReview;
    });

    var totalListReviews = listReviews.length;

    var totalPages = hasHighlightSlot
      ? Math.max(
          1,
          1 +
            Math.ceil(
              Math.max(0, totalListReviews - (state.reviewsPerPage - 1)) /
                state.reviewsPerPage
            )
        )
      : Math.max(1, Math.ceil(totalListReviews / state.reviewsPerPage));

    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    if (state.currentPage < 1) {
      state.currentPage = 1;
    }

    var shouldShowHighlight = hasHighlightSlot && state.currentPage === 1;

    var pageStart = 0;
    var pageEnd = 0;

    if (hasHighlightSlot) {
      if (state.currentPage === 1) {
        pageStart = 0;
        pageEnd = Math.max(0, state.reviewsPerPage - 1);
      } else {
        pageStart =
          state.reviewsPerPage -
          1 +
          (state.currentPage - 2) * state.reviewsPerPage;
        pageEnd = pageStart + state.reviewsPerPage;
      }
    } else {
      pageStart = (state.currentPage - 1) * state.reviewsPerPage;
      pageEnd = pageStart + state.reviewsPerPage;
    }

    var paginatedReviews = listReviews.slice(pageStart, pageEnd);

    var reviewInsightsHtml =
      Array.isArray(reviewInsights) && reviewInsights.length
        ? `
  <div style="display:grid;gap:8px;margin-top:14px;">
    <div style="font-size:12px;color:#9ca3af;font-weight:600;">
      Principais características percebidas nas avaliações
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:10px;">
      ${reviewInsights
        .slice(0, 4)
        .map(function (item) {
          var normalizedItem = safeText(item).toLowerCase();
          var isActive = state.activeInsightFilter === normalizedItem;

          return `
            <span
              data-avaliapro-filter="${normalizedItem}"
              style="
                display:inline-flex;
                align-items:center;
                gap:6px;
                padding:4px 15px;
                border-radius:999px;
                background:${isActive ? "#111827" : "#f9fafb"};
                border:1px solid ${isActive ? "#111827" : "#e5e7eb"};
                font-size:13px;
                font-weight:500;
                color:${isActive ? "#ffffff" : "#374151"};
                line-height:1;
                cursor:pointer;
                transition:all 0.2s ease;
              "
            >
              <span style="font-size:11px;color:${
                isActive ? "rgba(255,255,255,0.7)" : "#9ca3af"
              };">✦</span>
              ${safeText(item)}
            </span>
          `;
        })
        .join("")}
    </div>
  </div>
`
        : "";

    var socialProofLabel =
      totalReviews === 0
        ? "Ainda sem avaliações suficientes"
        : recommendationRate >= 95
        ? "Aprovação praticamente unânime"
        : recommendationRate >= 85
        ? "Altamente recomendado pelos clientes"
        : recommendationRate >= 70
        ? "Boa avaliação geral"
        : "Percepções variadas entre as avaliações";

    var socialProofHtml = `
      <div style="display:grid;gap:6px;align-content:start;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span style="font-size:26px;font-weight:800;line-height:1;color:#111827;">
            ${recommendationRate}%
          </span>
          <span style="font-size:14px;color:#111827;">
            recomendam este produto
          </span>
        </div>

        <div style="font-size:13px;line-height:1.5;color:#6b7280;">
          ${socialProofLabel}
        </div>
      </div>
    `;

    var highlightHtml = highlightReview
      ? `
          <div style="
            border: 2px solid #f59e0b;
            background: #fff8e1;
            border-radius: 14px;
            padding: 16px;
            margin-bottom: 16px;
          ">
            <div style="font-weight:700;margin-bottom:6px;">
              ⭐ Avaliação em destaque
            </div>

            ${buildReviewItem(highlightReview)}
          </div>
        `
      : "";

    var reviewListHtml =
      (shouldShowHighlight ? highlightHtml : "") +
      (paginatedReviews.length
        ? paginatedReviews.map(buildReviewItem).join("")
        : shouldShowHighlight
        ? ""
        : `<div class="avaliapro-empty">Nenhuma avaliação encontrada para esta característica.</div>`);

    var paginationHtml =
      totalPages > 1
        ? `
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:18px;flex-wrap:wrap;">
            <button
              type="button"
              data-avaliapro-page="prev"
              class="avaliapro-button"
              style="min-width:auto;padding:10px 14px;"
              ${state.currentPage === 1 ? "disabled" : ""}
            >
              ← Anterior
            </button>

            <span style="font-size:13px;color:#6b7280;">
              Página ${state.currentPage} de ${totalPages}
            </span>

            <button
              type="button"
              data-avaliapro-page="next"
              class="avaliapro-button"
              style="min-width:auto;padding:10px 14px;"
              ${state.currentPage === totalPages ? "disabled" : ""}
            >
              Próxima →
            </button>
          </div>
        `
        : "";

    var debugHtml = "";

    if (window.AVALIAPRO_DEBUG) {
      debugHtml = `
        <div class="avaliapro-debug">
          sku: ${safeText(sku || "")} | platformProductId: ${safeText(
        platformProductId || ""
      )} | platformVariantId: ${safeText(platformVariantId || "")}
        </div>
      `;
    }

    var summaryContainer = document.getElementById("avaliapro-summary");
    if (summaryContainer) {
      summaryContainer.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;">
        <span style="color:#f59e0b;font-weight:700;">${getStars(
          averageRating
        )}</span>
        <span style="font-weight:600;color:#111827;">${safeText(
          getAverageDisplay(averageRating)
        )}</span>
        <span style="color:#6b7280;">(${totalReviews} avaliação${
        totalReviews === 1 ? "" : "ões"
      })</span>
        <a
          href="#avaliapro-widget"
          id="avaliapro-summary-link"
          style="color:#111827;text-decoration:underline;font-weight:600;"
        >
          Ver avaliações
        </a>
      </div>
    `;
    }

    container.innerHTML = `
  <h2 class="avaliapro-title" style="margin:0 0 14px 0;">Avaliações</h2>

  <div class="avaliapro-widget" data-sku="${safeText(sku)}">
    <div class="avaliapro-header">
      <div class="avaliapro-summary" style="display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;width:100%;">
        <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,280px);align-items:start;column-gap:28px;row-gap:12px;">
          <div style="display:grid;row-gap:8px;">
            <div style="display:grid;grid-template-columns:auto auto;align-items:center;column-gap:16px;width:max-content;">
              <span class="avaliapro-average" style="font-size:34px;font-weight:800;letter-spacing:-0.5px;line-height:1;display:block;">
                ${safeText(getAverageDisplay(averageRating))}
              </span>

              <div style="display:grid;align-content:center;row-gap:6px;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <span class="avaliapro-stars" style="font-size:18px;line-height:1;">
                    ${getStars(averageRating)}
                  </span>

                  <span style="font-size:14px;font-weight:600;color:#111827;">
                    ${safeText(getRatingLabel(averageRating))}
                  </span>
                </div>

                <span class="avaliapro-count" style="font-size:13px;line-height:1.3;display:block;">
                  ${
                    totalReviews === 0
                      ? "Ainda sem avaliações"
                      : `Baseado em ${totalReviews} ${
                          totalReviews === 1 ? "avaliação" : "avaliações"
                        }`
                  }
                </span>
              </div>
            </div>

            ${reviewInsightsHtml}
          </div>

          <div>
            ${socialProofHtml}
          </div>
        </div>

        <button
          class="avaliapro-button"
          type="button"
          id="avaliapro-open-modal"
          aria-label="Abrir formulário para avaliar produto"
        >
          ✍️ Escrever avaliação
        </button>

        ${debugHtml}
      </div>
    </div>

    <div style="margin: 18px 0 16px 0; border-top: 1px solid #e5e7eb;"></div>

    <div class="avaliapro-list">${reviewListHtml}${paginationHtml}</div>

    <div class="avaliapro-form">
      <div id="avaliapro-feedback"></div>
    </div>

    <div id="avaliapro-modal-root" style="display:none;">
      <div id="avaliapro-modal-overlay">
        <div id="avaliapro-modal-box">
          <button
            type="button"
            id="avaliapro-close-modal"
            aria-label="Fechar modal"
          >
            &times;
          </button>

          <div style="display:grid;gap:6px;padding-right:28px;">
            <h3 style="margin:0;font-size:18px;font-weight:700;color:#111827;">
              Deixe sua avaliação
            </h3>
            <p style="margin:0;font-size:14px;line-height:1.4;color:#6b7280;">
              Sua opinião ajuda outros clientes a comprarem com mais segurança.
            </p>
          </div>

          <form id="avaliapro-form" class="avaliapro-form">
            <div class="avaliapro-field">
              <label class="avaliapro-label">Seu nome</label>
              <input
                class="avaliapro-input"
                type="text"
                name="authorName"
                placeholder="Seu nome"
                required
              />
            </div>

            <div class="avaliapro-field">
              <label class="avaliapro-label">Nota</label>

              <div
                id="avaliapro-stars-input"
                style="font-size:22px;line-height:1;color:#f59e0b;display:flex;gap:10px;cursor:pointer;user-select:none;"
              >
                <span data-value="1" aria-label="1 estrela" title="1 estrela">★</span>
                <span data-value="2" aria-label="2 estrelas" title="2 estrelas">★</span>
                <span data-value="3" aria-label="3 estrelas" title="3 estrelas">★</span>
                <span data-value="4" aria-label="4 estrelas" title="4 estrelas">★</span>
                <span data-value="5" aria-label="5 estrelas" title="5 estrelas">★</span>

                <select
                  class="avaliapro-select"
                  name="rating"
                  required
                  style="display:none;"
                >
                  <option value="">Selecione uma nota</option>
                  <option value="5" selected>5</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1</option>
                </select>
              </div>
            </div>

            <div class="avaliapro-field">
              <textarea
                class="avaliapro-textarea"
                name="comment"
                placeholder="Escreva sua avaliação"
                required
              ></textarea>
            </div>

            <button class="avaliapro-button" type="submit">
              Enviar avaliação
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
    `;

    var summaryLink = document.getElementById("avaliapro-summary-link");
    if (summaryLink) {
      summaryLink.onclick = function (event) {
        event.preventDefault();

        if (container && typeof container.scrollIntoView === "function") {
          container.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      };
    }

    var openModalButton = container.querySelector("#avaliapro-open-modal");
    var closeModalButton = container.querySelector("#avaliapro-close-modal");
    var modalRoot = container.querySelector("#avaliapro-modal-root");
    var modalOverlay = container.querySelector("#avaliapro-modal-overlay");

    if (modalRoot) {
      modalRoot.style.display = "none";
    }

    if (openModalButton && modalRoot) {
      openModalButton.onclick = function () {
        modalRoot.style.display = "block";
        modalRoot.style.opacity = "0";

        setTimeout(function () {
          modalRoot.style.opacity = "1";
        }, 10);

        document.body.style.overflow = "hidden";

        var feedback = container.querySelector("#avaliapro-feedback");
        if (feedback) {
          feedback.innerHTML = "";
        }

        var inputName = container.querySelector('[name="authorName"]');
        if (inputName) {
          setTimeout(function () {
            inputName.focus();
          }, 50);
        }
      };
    }

    if (closeModalButton && modalRoot) {
      closeModalButton.onclick = function () {
        modalRoot.style.opacity = "0";
        modalRoot.style.transition = "opacity 0.2s ease";

        setTimeout(function () {
          modalRoot.style.display = "none";
          modalRoot.style.opacity = "1";
          document.body.style.overflow = "";
        }, 200);
      };
    }

    if (modalOverlay && modalRoot) {
      modalOverlay.onclick = function (event) {
        if (event.target === modalOverlay) {
          modalRoot.style.opacity = "0";
          modalRoot.style.transition = "opacity 0.2s ease";

          setTimeout(function () {
            modalRoot.style.display = "none";
            modalRoot.style.opacity = "1";
            document.body.style.overflow = "";
          }, 200);
        }
      };

      var modalBox = container.querySelector("#avaliapro-modal-box");
      if (modalBox) {
        modalBox.onclick = function (event) {
          event.stopPropagation();
        };
      }
    }

    if (!window.__AVALIAPRO_MODAL_ESC_BOUND__) {
      window.__AVALIAPRO_MODAL_ESC_BOUND__ = true;

      if (!window.__AVALIAPRO_ESC_BOUND__) {
        window.__AVALIAPRO_ESC_BOUND__ = true;

        document.addEventListener("keydown", function (event) {
          if (event.key !== "Escape") return;

          var modalRoot = document.getElementById("avaliapro-modal-root");
          if (!modalRoot || modalRoot.style.display !== "block") return;

          modalRoot.style.opacity = "0";
          modalRoot.style.transition = "opacity 0.2s ease";

          setTimeout(function () {
            modalRoot.style.display = "none";
            modalRoot.style.opacity = "1";
            document.body.style.overflow = "";
          }, 200);
        });
      }
    }

    var starsContainer = container.querySelector("#avaliapro-stars-input");
    var select = container.querySelector(
      '#avaliapro-form select[name="rating"]'
    );

    if (starsContainer && select) {
      var stars = starsContainer.querySelectorAll("span");

      var initialValue = Number(select.value || 5);
      select.value = initialValue;

      stars.forEach(function (s) {
        var v = Number(s.getAttribute("data-value"));
        s.textContent = v <= initialValue ? "★" : "☆";
      });

      stars.forEach(function (star) {
        var value = Number(star.getAttribute("data-value"));

        star.onclick = function () {
          star.style.transform = "scale(1.25)";

          setTimeout(function () {
            star.style.transform = "";
          }, 120);

          select.value = value;

          stars.forEach(function (s) {
            var v = Number(s.getAttribute("data-value"));
            s.textContent = v <= value ? "★" : "☆";
          });
        };

        star.onmouseenter = function () {
          stars.forEach(function (s) {
            var v = Number(s.getAttribute("data-value"));
            s.textContent = v <= value ? "★" : "☆";
          });
        };

        star.onmouseleave = function () {
          var selected = Number(select.value || 5);

          stars.forEach(function (s) {
            var v = Number(s.getAttribute("data-value"));
            s.textContent = v <= selected ? "★" : "☆";
          });
        };
      });
    }

    var insightFilters = container.querySelectorAll("[data-avaliapro-filter]");

    insightFilters.forEach(function (chip) {
      chip.onclick = function () {
        var value = normalizeText(chip.getAttribute("data-avaliapro-filter"));

        if (state.activeInsightFilter === value) {
          state.activeInsightFilter = null;
        } else {
          state.activeInsightFilter = value;
        }

        state.currentPage = 1;
        renderWidget(container, data, sku);
      };
    });

    var paginationButtons = container.querySelectorAll("[data-avaliapro-page]");

    paginationButtons.forEach(function (button) {
      button.onclick = function () {
        var action = button.getAttribute("data-avaliapro-page");

        if (action === "prev" && state.currentPage > 1) {
          state.currentPage--;
        }

        if (action === "next" && state.currentPage < totalPages) {
          state.currentPage++;
        }

        renderWidget(container, data, sku);

        if (container && typeof container.scrollIntoView === "function") {
          container.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      };
    });

    bindForm(container, state.currentSku);
    state.lastRenderedSku = sku;
  }

  function setFeedback(container, type, message) {
    var feedback = container.querySelector("#avaliapro-feedback");
    if (!feedback) return;

    if (!message) {
      feedback.innerHTML = "";
      return;
    }

    feedback.innerHTML = `
      <div class="avaliapro-feedback ${safeText(type)}">
        ${safeText(message)}
      </div>
    `;
  }

  function fetchReviews(sku) {
    var platformProductId = getPlatformProductId();
    var platformVariantId = getPlatformVariantId();

    var params = new URLSearchParams();
    params.append("apiKey", apiKey);

    if (platformVariantId) {
      params.append("platformVariantId", platformVariantId);
    }

    if (platformProductId) {
      params.append("platformProductId", platformProductId);
    }

    if (sku) {
      params.append("sku", sku);
    }

    params.append("_ts", Date.now());

    var url = apiBase + "/api/widget/reviews?" + params.toString();

    var controller = new AbortController();

    var timeout = setTimeout(function () {
      controller.abort();
    }, 8000);

    return fetch(url, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })
      .then(function (response) {
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error("Falha ao carregar avaliações.");
        }
        return response.json();
      })
      .catch(function (error) {
        clearTimeout(timeout);

        if (error && error.name === "AbortError") {
          throw new Error("Tempo limite excedido ao carregar avaliações.");
        }

        throw error;
      });
  }

  function submitReview(payload) {
    return fetch(apiBase + "/api/widget/reviews", {
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) {
          throw new Error(
            (data && (data.error || data.message)) ||
              "Erro ao enviar avaliação."
          );
        }
        return data;
      });
    });
  }

  function bindForm(container, sku) {
    var form = container.querySelector("#avaliapro-form");
    if (!form) return;

    if (form.__AVALIAPRO_BOUND__) return;
    form.__AVALIAPRO_BOUND__ = true;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var submitButton = form.querySelector('button[type="submit"]');
      var authorName = normalizeText(form.authorName.value);
      var rating = Number(form.querySelector('[name="rating"]').value);
      var comment = normalizeText(form.comment.value);
      var platformProductId = getPlatformProductId();

      if (!sku && !platformProductId) {
        setFeedback(container, "error", "Produto não identificado.");
        return;
      }

      // limpa estados anteriores
      var inputNameEl = form.querySelector('[name="authorName"]');
      var ratingEl = form.querySelector('[name="rating"]');
      var commentEl = form.querySelector('[name="comment"]');

      [inputNameEl, ratingEl, commentEl].forEach(function (el) {
        if (el) el.style.borderColor = "#d1d5db";
      });

      var hasError = false;

      if (!authorName) {
        if (inputNameEl) inputNameEl.style.borderColor = "#dc2626";
        hasError = true;
      }

      if (!rating) {
        if (ratingEl) ratingEl.style.outline = "2px solid #dc2626";
        hasError = true;
      }

      if (!comment) {
        if (commentEl) commentEl.style.borderColor = "#dc2626";
        hasError = true;
      }

      if (hasError) {
        setFeedback(
          container,
          "error",
          "Preencha todos os campos obrigatórios."
        );
        return;
      }
      if (submitButton.disabled) return;

      submitButton.disabled = true;

      submitButton.innerHTML = `
  <span style="display:inline-flex;align-items:center;gap:8px;">
    <span style="
      width:14px;
      height:14px;
      border:2px solid #fff;
      border-top-color: transparent;
      border-radius:50%;
      display:inline-block;
      animation:avaliapro-spin 0.6s linear infinite;
    "></span>
    Enviando...
  </span>
`;

      setFeedback(container, "", "");

      (function () {
        var platformProductId = getPlatformProductId();

        return submitReview({
          apiKey: apiKey,
          sku: sku || null,
          platformProductId: platformProductId || null,
          platformVariantId: getPlatformVariantId() || null,
          authorName: authorName,
          rating: rating,
          comment: comment,
          verifiedPurchase: false,
        });
      })()
        .then(function () {
          invalidateReviewsCache(
            sku,
            getPlatformProductId(),
            getPlatformVariantId()
          );

          setFeedback(container, "success", "Avaliação enviada com sucesso.");

          submitButton.innerHTML = "✔ Avaliação enviada";
          submitButton.style.background = "#059669";

          form.reset();

          var modalRoot = container.querySelector("#avaliapro-modal-root");
          if (modalRoot) {
            modalRoot.style.opacity = "0";
            modalRoot.style.transition = "opacity 0.2s ease";

            setTimeout(function () {
              modalRoot.style.display = "none";
              modalRoot.style.opacity = "1";
              document.body.style.overflow = "";
            }, 200);
          }

          return loadAndRenderSku(state.currentSku || sku, {
            preserveFeedback: true,
            feedbackMessage: "Avaliação enviada com sucesso.",
          });
        })
        .catch(function (error) {
          setFeedback(
            container,
            "error",
            (error && error.message) || "Não foi possível enviar a avaliação."
          );
        })
        .finally(function () {
          setTimeout(function () {
            submitButton.disabled = false;
            submitButton.innerHTML = "Enviar avaliação";
            submitButton.style.background = "";
          }, 1200);
        });
    });
  }

  function loadAndRenderSku(sku, options) {
    options = options || {};
    var platformProductId = getPlatformProductId();

    var platformVariantId = getPlatformVariantId();

    if (!sku && !platformProductId) return Promise.resolve();

    var renderKey = sku || platformProductId;

    if (
      state.currentSku !== sku ||
      state.currentPlatformProductId !== platformProductId ||
      state.currentPlatformVariantId !== platformVariantId
    ) {
      state.currentPage = 1;
    }
    var cacheKey = getProductCacheKey(sku);
    var hasCacheEntry = !!(cacheKey && state.reviewsCache[cacheKey]);
    var isSameIdentity =
      state.currentSku === sku &&
      state.currentPlatformProductId === platformProductId &&
      state.currentPlatformVariantId === platformVariantId;

    if (
      !options.force &&
      !options.preserveFeedback &&
      !hasCacheEntry &&
      state.lastRenderedSku === renderKey &&
      isSameIdentity
    ) {
      return Promise.resolve();
    }

    var container = resolveContainer({ sku: sku || platformProductId });

    if (!container) {
      return Promise.resolve();
    }

    if (!options.silent) {
      renderLoading(container, sku || platformProductId);
    }

    if (state.isLoading) {
      state.requestToken++;
    }

    state.isLoading = true;
    state.currentSku = sku || null;
    state.currentPlatformProductId = platformProductId || null;
    state.currentPlatformVariantId = platformVariantId || null;
    state.lastRenderedSku = sku || platformProductId || null;

    var requestToken = ++state.requestToken;
    cacheKey = getProductCacheKey(sku);

    if (cacheKey && state.reviewsCache[cacheKey]) {
      var cachedEntry = state.reviewsCache[cacheKey];
      var isCacheValid =
        cachedEntry &&
        cachedEntry.data &&
        cachedEntry.timestamp &&
        Date.now() - cachedEntry.timestamp < state.reviewsCacheTTL;

      if (isCacheValid) {
        if (requestToken !== state.requestToken) {
          state.isLoading = false;
          return Promise.resolve();
        }

        if (!container || !document.body.contains(container)) {
          state.isLoading = false;
          return Promise.resolve();
        }

        renderWidget(container, cachedEntry.data, sku || platformProductId);

        if (options.preserveFeedback && options.feedbackMessage) {
          setFeedback(container, "success", options.feedbackMessage);
        }

        state.isLoading = false;
        return Promise.resolve();
      }

      delete state.reviewsCache[cacheKey];

      var expiredIndex = state.reviewsCacheOrder.indexOf(cacheKey);
      if (expiredIndex !== -1) {
        state.reviewsCacheOrder.splice(expiredIndex, 1);
      }
    }

    return fetchReviews(sku || null)
      .then(function (data) {
        var latestSku = state.currentSku;
        var latestPlatformProductId = state.currentPlatformProductId;
        var latestPlatformVariantId = state.currentPlatformVariantId;

        if (
          latestSku !== sku &&
          latestPlatformProductId !== getPlatformProductId() &&
          latestPlatformVariantId !== getPlatformVariantId()
        ) {
          return;
        }

        if (
          !data ||
          typeof data !== "object" ||
          !Array.isArray(data.reviews) ||
          !data.summary ||
          typeof data.summary !== "object"
        ) {
          throw new Error("Resposta inválida da API.");
        }
        if (cacheKey) {
          if (!state.reviewsCache[cacheKey]) {
            state.reviewsCacheOrder.push(cacheKey);
          }

          state.reviewsCache[cacheKey] = {
            data: data,
            timestamp: Date.now(),
          };

          if (state.reviewsCacheOrder.length > state.reviewsCacheLimit) {
            var oldestCacheKey = state.reviewsCacheOrder.shift();
            if (oldestCacheKey) {
              delete state.reviewsCache[oldestCacheKey];
            }
          }
        }

        if (requestToken !== state.requestToken) {
          return;
        }

        if (!container || !document.body.contains(container)) {
          return;
        }

        renderWidget(container, data, sku || platformProductId);

        if (options.preserveFeedback && options.feedbackMessage) {
          setFeedback(container, "success", options.feedbackMessage);
        }
      })
      .catch(function (error) {
        if (requestToken !== state.requestToken) {
          return;
        }

        console.error("[AvaliaPro] erro ao carregar avaliações:", error);

        renderError(
          container,
          (error && error.message) ||
            "Não foi possível carregar as avaliações.",
          sku || platformProductId
        );
      })
      .finally(function () {
        state.isLoading = false;
      });
  }

  function scheduleRefresh(delay) {
    if (state.refreshTimer) {
      clearTimeout(state.refreshTimer);
    }

    state.refreshTimer = setTimeout(
      function () {
        state.refreshTimer = null;

        if (!document.body) {
          return;
        }

        refreshIfSkuChanged();
      },
      typeof delay === "number" ? delay : 0
    );
  }

  function refreshIfSkuChanged() {
    var skuInfo = getSku();
    var nextSku = skuInfo && skuInfo.sku ? skuInfo.sku : null;
    var nextPlatformProductId = getPlatformProductId();
    var nextPlatformVariantId = getPlatformVariantId();

    if (!nextSku && !nextPlatformProductId) {
      var existing = document.getElementById(WIDGET_ID);
      if (existing) {
        existing.remove();
      }

      var existingSummary = document.getElementById("avaliapro-summary");
      if (existingSummary) {
        existingSummary.innerHTML = "";
      }

      if (state.refreshTimer) {
        clearTimeout(state.refreshTimer);
        state.refreshTimer = null;
      }

      if (state.pollInterval) {
        clearInterval(state.pollInterval);
        state.pollInterval = null;
        state.pollStarted = false;
      }

      state.requestToken++;
      state.isLoading = false;
      state.currentSku = null;
      state.lastRenderedSku = null;
      state.currentPlatformProductId = null;
      state.currentPlatformVariantId = null;

      return;
    }

    if (state.isLoading) return;

    var productChanged =
      (state.currentSku || null) !== (nextSku || null) ||
      (state.currentPlatformProductId || null) !==
        (nextPlatformProductId || null) ||
      (state.currentPlatformVariantId || null) !==
        (nextPlatformVariantId || null);

    if (!productChanged) {
      return;
    }

    var summaryContainer = document.getElementById("avaliapro-summary");
    if (summaryContainer) {
      summaryContainer.innerHTML = "";
    }

    if (!state.pollStarted) {
      startSkuWatcher();
    }

    loadAndRenderSku(nextSku || null);
  }

  function startSkuWatcher() {
    if (!document.body) return;

    if (state.observerStarted && state.pollStarted) {
      return;
    }

    if (!state.observerStarted) {
      try {
        state.mutationObserver = new MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var target = mutations[i].target;
            var insideWidget = false;

            if (target && target.nodeType === 1 && target.closest) {
              insideWidget = !!target.closest("#" + WIDGET_ID);
            } else if (
              target &&
              target.parentElement &&
              target.parentElement.closest
            ) {
              insideWidget = !!target.parentElement.closest("#" + WIDGET_ID);
            }

            var mutation = mutations[i];
            var changedInsideWidget = false;

            if (mutation.addedNodes && mutation.addedNodes.length) {
              for (var j = 0; j < mutation.addedNodes.length; j++) {
                var addedNode = mutation.addedNodes[j];

                if (
                  addedNode &&
                  addedNode.nodeType === 1 &&
                  (addedNode.id === WIDGET_ID ||
                    (addedNode.closest && addedNode.closest("#" + WIDGET_ID)))
                ) {
                  changedInsideWidget = true;
                  break;
                }
              }
            }

            if (
              !changedInsideWidget &&
              mutation.removedNodes &&
              mutation.removedNodes.length
            ) {
              for (var k = 0; k < mutation.removedNodes.length; k++) {
                var removedNode = mutation.removedNodes[k];

                if (
                  removedNode &&
                  removedNode.nodeType === 1 &&
                  (removedNode.id === WIDGET_ID ||
                    (removedNode.querySelector &&
                      removedNode.querySelector("#" + WIDGET_ID)))
                ) {
                  changedInsideWidget = true;
                  break;
                }
              }
            }

            if (
              insideWidget ||
              (target && target.id === WIDGET_ID) ||
              changedInsideWidget
            ) {
              continue;
            }

            scheduleRefresh(100);
            return;
          }
        });

        state.mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
          attributeFilter: [
            "data-product-sku",
            "data-sku",
            "data-product-id",
            "data-variant-sku",
            "data-platform-variant-id",
            "data-variant-id",
            "content",
            "value",
          ],
        });
      } catch (error) {
        console.warn(
          "[AvaliaPro] Não foi possível iniciar MutationObserver.",
          error
        );
      }
    }

    if (!state.pollStarted) {
      state.pollStarted = true;

      state.pollInterval = setInterval(function () {
        scheduleRefresh(0);
      }, 1200);
    }

    if (!state.historyListenersStarted) {
      state.historyListenersStarted = true;

      window.addEventListener("popstate", function () {
        scheduleRefresh(300);
      });

      window.addEventListener("hashchange", function () {
        scheduleRefresh(300);
      });
    }

    if (!window.__AVALIAPRO_HISTORY_PATCHED__) {
      window.__AVALIAPRO_HISTORY_PATCHED__ = true;

      var originalPushState = history.pushState;
      var originalReplaceState = history.replaceState;

      history.pushState = function () {
        var result = originalPushState.apply(this, arguments);
        scheduleRefresh(300);
        return result;
      };

      history.replaceState = function () {
        var result = originalReplaceState.apply(this, arguments);
        scheduleRefresh(300);
        return result;
      };
    }
  }

  window.__AVALIAPRO_WIDGET_REFRESH__ = function () {
    var skuInfo = getSku();
    var sku = skuInfo && skuInfo.sku ? skuInfo.sku : null;
    var platformProductId = getPlatformProductId();
    var platformVariantId = getPlatformVariantId();

    console.log("[AvaliaPro REFRESH]", {
      sku: sku,
      platformProductId: platformProductId,
      platformVariantId: platformVariantId,
      debug: !!window.AVALIAPRO_DEBUG,
    });

    loadAndRenderSku(sku, { force: true });
  };

  function init() {
    injectStyles();

    var skuInfo = getSku();
    var sku = skuInfo && skuInfo.sku ? skuInfo.sku : null;
    var platformProductId = getPlatformProductId();

    if (!sku && !platformProductId) {
      console.warn(
        "[AvaliaPro] SKU e platformProductId não encontrados na página."
      );
      startSkuWatcher();
      return;
    }

    startSkuWatcher();
    loadAndRenderSku(sku || null);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
