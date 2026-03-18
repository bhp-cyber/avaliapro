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
        border: 1px solid #e5e7eb;
        border-radius: 14px;
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
        display: grid;
        gap: 14px;
        margin: 18px 0 22px;
      }

      .avaliapro-review {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 14px;
        background: #fafafa;
      }

      .avaliapro-review-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 8px;
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
        font-size: 14px;
        margin-bottom: 8px;
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
        border-radius: 10px;
        padding: 12px 16px;
        background: #111827;
        color: #ffffff;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
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
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 14px;
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
    var rounded = Math.max(0, Math.min(5, Math.round(numeric)));
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  }

  function getAverageDisplay(value) {
    var numeric = Number(value) || 0;
    return numeric.toFixed(1);
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
        document.querySelector("[data-avaliapro-widget]");
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

    return `
      <div class="avaliapro-review">
        <div class="avaliapro-review-top">
          <div style="display:grid;gap:4px;">
            <div class="avaliapro-author">${safeText(
              (review && review.authorName) || "Cliente"
            )}</div>
            ${verifiedHtml}
          </div>
          <div class="avaliapro-date">${safeText(
            formatDate(review && review.createdAt)
          )}</div>
        </div>

        <div class="avaliapro-review-stars">${safeText(
          getStars(review && review.rating)
        )}</div>
        ${titleHtml}
        <div class="avaliapro-review-comment">${safeText(
          normalizeText((review && review.comment) || "")
        )}</div>
        ${imageHtml}
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

    var highlightReview = safeReviews.length ? safeReviews[0] : null;

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

    var reviewListHtml = safeReviews.length
      ? highlightHtml + safeReviews.slice(1).map(buildReviewItem).join("")
      : `<div class="avaliapro-empty">Ainda não há avaliações para este produto.</div>`;

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
        <span style="color:#f59e0b;font-weight:700;">${safeText(
          getStars(averageRating)
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
      <div class="avaliapro-widget" data-sku="${safeText(sku)}">
        <div class="avaliapro-header">
          <h2 class="avaliapro-title">Avaliações</h2>
          <div class="avaliapro-summary">
            <div style="display:flex;align-items:center;gap:10px;">
  <span class="avaliapro-average" style="font-size:32px;">
    ${safeText(getAverageDisplay(averageRating))}
  </span>

  <div style="display:flex;flex-direction:column;gap:2px;">
    <span class="avaliapro-stars" style="font-size:16px;">
      ${safeText(getStars(averageRating))}
    </span>

    <span class="avaliapro-count" style="font-size:13px;">
      Baseado em ${totalReviews} avaliação${totalReviews === 1 ? "" : "ões"}
    </span>
  </div>
</div>
    ${debugHtml}
          </div>
        </div>

        <div class="avaliapro-list">${reviewListHtml}</div>

               <div class="avaliapro-form">
          <div id="avaliapro-feedback"></div>

          <button
            class="avaliapro-button"
            type="button"
            id="avaliapro-open-modal"
          >
            Avaliar produto
          </button>
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

              <h3 style="margin:0;font-size:18px;font-weight:700;color:#111827;">
  Deixe sua avaliação
</h3>

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
                <select class="avaliapro-select" name="rating" required>
                    <option value="">Selecione uma nota</option>
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>

                <div class="avaliapro-field">
                  <label class="avaliapro-label">Avaliação</label>
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
        modalRoot.style.display = "none";
        document.body.style.overflow = "";
      };
    }

    if (modalOverlay && modalRoot) {
      modalOverlay.onclick = function (event) {
        if (event.target === modalOverlay) {
          modalRoot.style.display = "none";
          document.body.style.overflow = "";
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

          modalRoot.style.display = "none";
          document.body.style.overflow = "";
        });
      }
    }

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
      var rating = Number(form.rating.value);
      var comment = normalizeText(form.comment.value);
      var platformProductId = getPlatformProductId();

      if (!sku && !platformProductId) {
        setFeedback(container, "error", "Produto não identificado.");
        return;
      }

      if (!authorName || !rating || !comment) {
        setFeedback(
          container,
          "error",
          "Preencha todos os campos obrigatórios."
        );
        return;
      }
      if (submitButton.disabled) return;

      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
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
          form.reset();

          var modalRoot = container.querySelector("#avaliapro-modal-root");
          if (modalRoot) {
            modalRoot.style.display = "none";
            document.body.style.overflow = "";
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
          submitButton.disabled = false;
          submitButton.textContent = "Enviar avaliação";
        });
    });
  }

  function loadAndRenderSku(sku, options) {
    options = options || {};
    var platformProductId = getPlatformProductId();

    var platformVariantId = getPlatformVariantId();

    if (!sku && !platformProductId) return Promise.resolve();

    var renderKey = sku || platformProductId;
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
