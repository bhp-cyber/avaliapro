(async function () {
  function getSku() {
    const dataSkuElement = document.querySelector("[data-product-sku]");
    const dataSku = dataSkuElement?.getAttribute("data-product-sku");
    if (dataSku) {
      return {
        sku: dataSku,
        element: dataSkuElement,
      };
    }

    const selectors = [
      "[data-sku]",
      "[data-product-id]",
      "[data-variant-sku]",
      ".product-sku",
      "#product-sku",
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (!element) continue;

      const value =
        element.getAttribute("data-sku") ||
        element.getAttribute("data-product-id") ||
        element.getAttribute("data-variant-sku") ||
        element.textContent?.trim();

      if (value) {
        return {
          sku: value,
          element,
        };
      }
    }

    const metaSku =
      document
        .querySelector('meta[property="product:retailer_item_id"]')
        ?.getAttribute("content") ||
      document.querySelector('meta[name="sku"]')?.getAttribute("content");

    if (metaSku) {
      return {
        sku: metaSku,
        element: document.body,
      };
    }

    return null;
  }

  const skuData = getSku();

  if (!skuData) {
    console.error("SKU não encontrado na página");
    return;
  }

  const { sku, element: skuElement } = skuData;
  const currentScript = document.currentScript;
  const apiKey = currentScript?.getAttribute("data-api-key");

  if (!apiKey) {
    console.error("apiKey não encontrada no script");
    return;
  }

  async function loadWidget() {
    const oldWidget = skuElement.querySelector(".avaliapro-widget");
    if (oldWidget) oldWidget.remove();

    const response = await fetch(
      `https://avaliapro-api.onrender.com/api/widget/reviews?apiKey=${encodeURIComponent(
        apiKey
      )}&sku=${encodeURIComponent(sku)}`
    );

    if (!response.ok) {
      console.error("Erro ao carregar reviews do widget");
      return;
    }

    const data = await response.json();
    const { summary, reviews } = data;

    const container = document.createElement("div");
    container.className = "avaliapro-widget";
    container.style.border = "1px solid #e5e7eb";
    container.style.padding = "16px";
    container.style.marginTop = "16px";
    container.style.borderRadius = "10px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.background = "#ffffff";

    const average = summary?.averageRating || 0;
    const totalReviews = summary?.totalReviews || 0;

    const stars =
      "★".repeat(Math.round(average)) + "☆".repeat(5 - Math.round(average));

    const reviewItems = reviews
      .map((review) => {
        const reviewDate = new Date(review.createdAt).toLocaleDateString(
          "pt-BR"
        );

        return `
      <div style="border-top:1px solid #eee; padding-top:14px; margin-top:14px;">

        <div style="font-size:15px; color:#f5a623;">
          ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
        </div>

        <div style="font-size:14px; color:#888; margin-top:4px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span>${review.authorName || "Cliente"}</span>
          <span>•</span>
          <span>${reviewDate}</span>
          ${
            review.verifiedPurchase
              ? `<span style="background:#e8f7ee; color:#15803d; font-size:12px; padding:2px 8px; border-radius:999px;">Compra verificada</span>`
              : ""
          }
        </div>

        <div style="font-size:14px; margin-top:10px; color:#333; line-height:1.5;">
          ${review.comment || ""}
        </div>

      </div>
    `;
      })
      .join("");

    container.innerHTML = `
      <div style="font-size:22px; font-weight:bold; color:#111;">
        ${stars} ${average.toFixed(1)} / 5
      </div>
      <div style="margin-top:4px; color:#666;">
        ${totalReviews} avaliação${totalReviews !== 1 ? "ões" : ""}
      </div>

      <div style="margin-top:16px;">
        ${
          reviewItems ||
          "<div style='color:#666;'>Ainda não há avaliações para este produto.</div>"
        }
      </div>

      <form id="avaliapro-review-form" style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
        <h3 style="margin:0; font-size:18px;">Deixe sua avaliação</h3>
        <input
          type="text"
          name="authorName"
          placeholder="Seu nome"
          style="padding:10px; border:1px solid #ddd; border-radius:8px;"
        />

        <select name="rating" required style="padding:10px; border:1px solid #ddd; border-radius:8px;">
          <option value="">Selecione a nota</option>
          <option value="5">5 estrelas</option>
          <option value="4">4 estrelas</option>
          <option value="3">3 estrelas</option>
          <option value="2">2 estrelas</option>
          <option value="1">1 estrela</option>
        </select>

        <textarea
          name="comment"
          placeholder="Conte como foi sua experiência"
          rows="4"
          style="padding:10px; border:1px solid #ddd; border-radius:8px; resize:vertical;"
        ></textarea>

        <button
          type="submit"
          style="padding:12px; border:none; border-radius:8px; background:#111; color:#fff; cursor:pointer;"
        >
          Enviar avaliação
        </button>

        <div id="avaliapro-form-message" style="font-size:14px; color:#444;"></div>
      </form>
    `;

    skuElement.appendChild(container);

    const form = container.querySelector("#avaliapro-review-form");
    const message = container.querySelector("#avaliapro-form-message");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(form);

      const payload = {
        apiKey,
        sku,
        authorName: formData.get("authorName"),
        rating: Number(formData.get("rating")),
        comment: formData.get("comment"),
      };

      const submitResponse = await fetch(
        "https://avaliapro-api.onrender.com/api/widget/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!submitResponse.ok) {
        message.textContent = "Erro ao enviar avaliação.";
        return;
      }

      message.textContent = "Avaliação enviada com sucesso!";
      form.reset();

      await loadWidget();
    });
  }

  await loadWidget();
})();
