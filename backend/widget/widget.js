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
    mutationObserver: null,
    isLoading: false,
    currentPlatformProductId: null,
    currentPlatformVariantId: null,
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

    var metaSku = document.querySelector('meta[name="sku"]');
    if (metaSku) {
      pushCandidate(
        metaSku.getAttribute("content"),
        metaSku,
        'meta[name="sku"]'
      );
    }

    return candidates;
  }

  function getSku() {
    var candidates = getSkuCandidates();
    return candidates.length ? candidates[0] : null;
  }

  function getPlatformProductId() {
    var productIdElement = document.querySelector("[data-product-id]");
    if (!productIdElement) return null;

    var value = normalizeText(productIdElement.getAttribute("data-product-id"));

    return value || null;
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

  function resolveContainer(skuInfo) {
    var existing = document.getElementById(WIDGET_ID);
    if (existing) return existing;

    var explicit = document.querySelector("[data-avaliapro-widget]");
    if (explicit) {
      explicit.id = WIDGET_ID;
      return explicit;
    }

    var container = document.createElement("div");
    container.id = WIDGET_ID;

    var anchor =
      document.querySelector("[data-product-sku]") ||
      document.querySelector("h1") ||
      document.querySelector(".product-name") ||
      document.querySelector(".product-title");

    if (anchor && anchor.parentNode) {
      if ((anchor.tagName || "").toLowerCase() === "h1") {
        anchor.insertAdjacentElement("afterend", container);
      } else {
        anchor.parentNode.insertBefore(container, anchor.nextSibling);
      }
      return container;
    }

    if (skuInfo && skuInfo.element && skuInfo.element.parentNode) {
      skuInfo.element.parentNode.insertBefore(
        container,
        skuInfo.element.nextSibling
      );
      return container;
    }

    document.body.appendChild(container);
    return container;
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
          (review && review.comment) || ""
        )}</div>
        ${imageHtml}
      </div>
    `;
  }

  function renderWidget(container, data, sku) {
    var platformProductId = getPlatformProductId();
    var summary = (data && data.summary) || {};
    var reviews = Array.isArray(data && data.reviews) ? data.reviews : [];
    var averageRating = Number(summary.averageRating || 0);
    var totalReviews = Number(summary.totalReviews || reviews.length || 0);

    var reviewListHtml = reviews.length
      ? reviews.map(buildReviewItem).join("")
      : `<div class="avaliapro-empty">Ainda não há avaliações para este produto.</div>`;

    container.innerHTML = `
      <div class="avaliapro-widget" data-sku="${safeText(sku)}">
        <div class="avaliapro-header">
          <h2 class="avaliapro-title">Avaliações</h2>
          <div class="avaliapro-summary">
            <span class="avaliapro-average">${safeText(
              getAverageDisplay(averageRating)
            )}</span>
            <span class="avaliapro-stars">${safeText(
              getStars(averageRating)
            )}</span>
            <span class="avaliapro-count">(${totalReviews} avaliação${
      totalReviews === 1 ? "" : "ões"
    })</span>
    ${
      window.AVALIAPRO_DEBUG
        ? `
            <div class="avaliapro-debug">
        sku: ${safeText(sku || "")} | platformProductId: ${safeText(
            platformProductId || ""
          )} | platformVariantId: ${safeText(getPlatformVariantId() || "")}
      </div>
      `
        : ""
    }
          </div>
        </div>

        <div class="avaliapro-list">${reviewListHtml}</div>

        <form class="avaliapro-form" id="avaliapro-form">
          <h3 class="avaliapro-form-title">Deixe sua avaliação</h3>

          <div id="avaliapro-feedback"></div>

          <div class="avaliapro-field">
            <label class="avaliapro-label" for="avaliapro-author">Seu nome</label>
            <input
              class="avaliapro-input"
              id="avaliapro-author"
              name="authorName"
              type="text"
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div class="avaliapro-field">
            <label class="avaliapro-label" for="avaliapro-rating">Nota</label>
            <select
              class="avaliapro-select"
              id="avaliapro-rating"
              name="rating"
              required
            >
              <option value="">Selecione</option>
              <option value="5">5 - Excelente</option>
              <option value="4">4 - Muito bom</option>
              <option value="3">3 - Bom</option>
              <option value="2">2 - Regular</option>
              <option value="1">1 - Ruim</option>
            </select>
          </div>

          <div class="avaliapro-field">
            <label class="avaliapro-label" for="avaliapro-comment">Comentário</label>
            <textarea
              class="avaliapro-textarea"
              id="avaliapro-comment"
              name="comment"
              placeholder="Conte sua experiência com o produto"
              required
            ></textarea>
          </div>

          <button class="avaliapro-button" type="submit">Enviar avaliação</button>
        </form>
      </div>
    `;

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

    if (sku) {
      params.append("sku", sku);
    }

    var url = apiBase + "/api/widget/reviews?" + params.toString();

    return fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Falha ao carregar avaliações.");
      }
      return response.json();
    });
  }

  function submitReview(payload) {
    return fetch(apiBase + "/api/widget/reviews", {
      method: "POST",
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
          var cacheKey = getProductCacheKey(sku);
          if (cacheKey) {
            delete state.reviewsCache[cacheKey];

            var index = state.reviewsCacheOrder.indexOf(cacheKey);
            if (index !== -1) {
              state.reviewsCacheOrder.splice(index, 1);
            }
          }

          setFeedback(container, "success", "Avaliação enviada com sucesso.");
          form.reset();

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

    var container = resolveContainer({ sku: sku || platformProductId });

    if (!options.silent) {
      renderLoading(container, sku || platformProductId);
    }

    state.isLoading = true;
    state.currentSku = sku;
    state.currentPlatformProductId = platformProductId;
    state.currentPlatformVariantId = platformVariantId;

    var cacheKey = getProductCacheKey(sku);

    if (cacheKey && state.reviewsCache[cacheKey]) {
      var cachedEntry = state.reviewsCache[cacheKey];
      var isCacheValid =
        cachedEntry &&
        cachedEntry.data &&
        cachedEntry.timestamp &&
        Date.now() - cachedEntry.timestamp < state.reviewsCacheTTL;

      if (isCacheValid) {
        renderWidget(container, cachedEntry.data, sku || platformProductId);

        if (options.preserveFeedback && options.feedbackMessage) {
          setFeedback(container, "success", options.feedbackMessage);
        }

        state.isLoading = false;
        return Promise.resolve();
      }

      delete state.reviewsCache[cacheKey];
    }

    return fetchReviews(sku || null)
      .then(function (data) {
        if (
          !data ||
          typeof data !== "object" ||
          !Array.isArray(data.reviews) ||
          !data.summary ||
          typeof data.summary !== "object" ||
          !data.product ||
          typeof data.product !== "object"
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

        renderWidget(container, data, sku || platformProductId);

        if (options.preserveFeedback && options.feedbackMessage) {
          setFeedback(container, "success", options.feedbackMessage);
        }
      })
      .catch(function (error) {
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

  function refreshIfSkuChanged() {
    var skuInfo = getSku();
    var nextSku = skuInfo && skuInfo.sku ? skuInfo.sku : null;
    var nextPlatformProductId = getPlatformProductId();
    var nextPlatformVariantId = getPlatformVariantId();

    if (!nextSku && !nextPlatformProductId) return;
    if (state.isLoading) return;

    if (
      state.currentSku === nextSku &&
      state.lastRenderedSku === (nextSku || nextPlatformProductId) &&
      state.currentPlatformProductId === nextPlatformProductId &&
      state.currentPlatformVariantId === nextPlatformVariantId
    ) {
      return;
    }

    loadAndRenderSku(nextSku);
  }

  function startSkuWatcher() {
    if (!state.observerStarted) {
      state.observerStarted = true;

      try {
        state.mutationObserver = new MutationObserver(function () {
          refreshIfSkuChanged();
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

      setInterval(function () {
        refreshIfSkuChanged();
      }, 1200);
    }

    window.addEventListener("popstate", function () {
      setTimeout(refreshIfSkuChanged, 300);
    });

    window.addEventListener("hashchange", function () {
      setTimeout(refreshIfSkuChanged, 300);
    });
  }

  window.__AVALIAPRO_WIDGET_REFRESH__ = function () {
    refreshIfSkuChanged();
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

    loadAndRenderSku(sku);
    startSkuWatcher();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
