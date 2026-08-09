// ==========================================================
// PRICEFINDER NEPAL — GEN Z FRONTEND
// ==========================================================

const API_URL = "https://pricfinder-nepal.onrender.com/api/search";
const CSV_URL = "products.csv";

let lastResults = [];

// ==========================================================
// SEARCH
// ==========================================================

async function searchProduct() {
  const input = document.getElementById("searchInput");
  const results = document.getElementById("results");

  if (!input || !results) return;

  const query = String(input.value || "").trim();

  if (!query) {
    showMessage(
      "Type a product first 👀",
      "Try iPhone, laptop, headphones or tripod."
    );
    return;
  }

  setLoading(results, query);

  try {
    const response = await fetch(
      `${API_URL}?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (data?.success && Array.isArray(data.results)) {
      const liveResults = normalizeResults(data.results);

      if (liveResults.length) {
        lastResults = liveResults;
        renderResults(liveResults, query);
        return;
      }
    }

    const fallback = await searchCSV(query);

    if (fallback.length) {
      lastResults = fallback;
      renderResults(fallback, query, true);
      return;
    }

    showNoResults(query);

  } catch (error) {
    console.error("Search error:", error);

    try {
      const fallback = await searchCSV(query);

      if (fallback.length) {
        lastResults = fallback;
        renderResults(fallback, query, true);
      } else {
        showMessage(
          "Couldn't fetch live prices 😵",
          "The store servers may be temporarily unavailable."
        );
      }

    } catch (fallbackError) {
      console.error("CSV fallback error:", fallbackError);

      showMessage(
        "Something went wrong 😵",
        "Please try again."
      );
    }
  }
}


// ==========================================================
// CATEGORY SEARCH
// ==========================================================

function searchCategory(category) {
  const input = document.getElementById("searchInput");

  if (!input) return;

  input.value = category;
  searchProduct();
}


// ==========================================================
// CSV FALLBACK
// ==========================================================

async function searchCSV(query) {
  const response = await fetch(
    CSV_URL,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`CSV returned ${response.status}`);
  }

  const text = await response.text();
  const rows = parseCSV(text);

  const search = query.toLowerCase().trim();

  return rows
    .filter(product => {
      const searchable = [
        product.name,
        product.store,
        product.category
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(search);
    })
    .map(normalizeProduct)
    .filter(product => product.name)
    .sort((a, b) => a.total - b.total);
}


// ==========================================================
// CSV PARSER
// ==========================================================

function parseCSV(text) {
  const lines = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      current += char;
      continue;
    }

    if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {
      if (current.trim()) {
        lines.push(current);
      }

      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    lines.push(current);
  }

  if (!lines.length) return [];

  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const object = {};

    headers.forEach((header, index) => {
      object[header] = values[index] || "";
    });

    return object;
  });
}


function parseCSVLine(line) {
  const values = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (
      char === '"' &&
      insideQuotes &&
      next === '"'
    ) {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(value.trim());
      value = "";
      continue;
    }

    value += char;
  }

  values.push(value.trim());

  return values;
}


// ==========================================================
// NORMALIZATION
// ==========================================================

function normalizeResults(results) {
  return results
    .map(normalizeProduct)
    .filter(product => product.name)
    .sort((a, b) => a.total - b.total);
}


function normalizeProduct(product) {
  const price = toNumber(
    product.price ??
    product.productPrice ??
    product.amount
  );

  const shipping = toNumber(
    product.shipping ??
    product.delivery ??
    0
  );

  const suppliedTotal = toNumber(
    product.total
  );

  const total =
    suppliedTotal > 0
      ? suppliedTotal
      : price + shipping;

  return {
    name: String(
      product.name || ""
    ).trim(),

    store: String(
      product.store ||
      product.source ||
      "Unknown Store"
    ).trim(),

    price,
    shipping,
    total,

    availability: String(
      product.availability ||
      product.stock ||
      "Check store"
    ).trim(),

    url: String(
      product.url ||
      product.link ||
      "#"
    ).trim(),

    image: String(
      product.image ||
      product.imageUrl ||
      ""
    ).trim(),

    source: String(
      product.source ||
      product.store ||
      ""
    ).trim(),

    lastUpdated: String(
      product.lastUpdated ||
      "Recently"
    ).trim()
  };
}


function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  const number = Number(
    String(value ?? "")
      .replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(number)
    ? number
    : 0;
}


// ==========================================================
// RENDER RESULTS
// ==========================================================

function renderResults(
  results,
  query,
  fromCSV = false
) {
  const container =
    document.getElementById("results");

  if (!container) return;

  const sorted = [...results]
    .sort((a, b) => a.total - b.total);

  const cheapest = sorted[0];

  const highest =
    sorted[sorted.length - 1];

  const savings =
    sorted.length > 1
      ? Math.max(
          0,
          highest.total - cheapest.total
        )
      : 0;

  const storeCount =
    new Set(
      sorted.map(item => item.store)
    ).size;

  container.innerHTML = `

    <div class="results-header">

      <div>

        <div class="results-kicker">

          <span class="live-dot"></span>

          ${
            fromCSV
              ? "FALLBACK RESULTS"
              : "LIVE PRICE CHECK"
          }

        </div>

        <h2>
          Results for
          <strong>
            “${escapeHTML(query)}”
          </strong>
        </h2>

        <p>
          ${sorted.length}
          ${sorted.length === 1 ? "deal" : "deals"}
          found across
          ${storeCount}
          ${storeCount === 1 ? "store" : "stores"}.
        </p>

      </div>

      <div class="results-count">

        ${sorted.length}

        <small>
          DEALS
        </small>

      </div>

    </div>


    <!-- BEST DEAL -->

    <article class="best-price-card">

      <div class="best-deal-badge">
        ⚡ BEST DEAL
      </div>

      <div class="best-price-grid">

        <div class="best-product-image">

          ${
            getImageHTML(cheapest) ||
            `<div class="image-placeholder">₨</div>`
          }

        </div>


        <div class="best-product-info">

          <div class="store-chip">

            🏪
            ${escapeHTML(cheapest.store)}

          </div>


          <h3>
            ${escapeHTML(cheapest.name)}
          </h3>


          <div class="best-price-row">

            <div>

              <span class="price-label">
                LOWEST TOTAL
              </span>

              <div class="best-price">
                Rs. ${formatPrice(cheapest.total)}
              </div>

            </div>


            ${
              savings > 0
                ? `
                  <div class="savings-pill">
                    SAVE Rs. ${formatPrice(savings)}
                  </div>
                `
                : ""
            }

          </div>


          <div class="deal-meta">

            <span>
              🚚 Shipping:
              Rs. ${formatPrice(cheapest.shipping)}
            </span>

            <span>
              📦
              ${escapeHTML(
                cheapest.availability
              )}
            </span>

          </div>


          <div class="best-deal-actions">

            ${dealButton(
              cheapest.url,
              "GET THIS DEAL ↗",
              "primary-deal-button"
            )}

          </div>

        </div>

      </div>

    </article>


    <!-- COMPARISON -->

    <div class="comparison-heading">

      <div>

        <div class="section-label">
          PRICE CHECK
        </div>

        <h2>
          Compare all stores
        </h2>

      </div>

      <span class="store-count">

        ${storeCount}
        ${storeCount === 1 ? "store" : "stores"}

      </span>

    </div>


    <div class="comparison-list">

      ${sorted
        .map(
          (product, index) =>
            renderProductCard(
              product,
              index,
              cheapest
            )
        )
        .join("")}

    </div>


    <div class="results-footnote">

      <span>⚡</span>

      Prices can change.
      Always confirm the final price
      and availability at the store.

    </div>

  `;
}


// ==========================================================
// PRODUCT CARD
// ==========================================================

function renderProductCard(
  product,
  index,
  cheapest
) {
  const isBest =
    index === 0 ||
    product.total === cheapest.total;

  const difference =
    Math.max(
      0,
      product.total - cheapest.total
    );

  return `

    <article class="
      comparison-card
      ${isBest ? "is-best" : ""}
    ">

      <div class="rank-number">
        ${index + 1}
      </div>


      <div class="comparison-image">

        ${
          getImageHTML(product) ||
          `<div class="image-placeholder small">₨</div>`
        }

      </div>


      <div class="comparison-info">

        <div class="store-line">

          <span class="store-name">
            ${escapeHTML(product.store)}
          </span>

          ${
            isBest
              ? `
                <span class="best-mini-badge">
                  BEST PRICE
                </span>
              `
              : ""
          }

        </div>


        <h3>
          ${escapeHTML(product.name)}
        </h3>


        <div class="availability">

          <span class="${
            isAvailable(
              product.availability
            )
              ? "available"
              : "check-stock"
          }">
            ●
          </span>

          ${escapeHTML(
            product.availability
          )}

        </div>

      </div>


      <div class="comparison-price">

        <span class="price-label">
          TOTAL
        </span>

        <strong>
          Rs. ${formatPrice(product.total)}
        </strong>

        ${
          difference > 0
            ? `
              <small>
                +Rs. ${formatPrice(difference)}
              </small>
            `
            : `
              <small class="saving-small">
                Lowest price
              </small>
            `
        }

      </div>


      <div class="comparison-action">

        ${dealButton(
          product.url,
          "VIEW DEAL ↗",
          "deal-button"
        )}

      </div>

    </article>

  `;
}


// ==========================================================
// IMAGE
// ==========================================================

function getImageHTML(product) {
  if (!product.image) {
    return "";
  }

  const image =
    escapeHTML(product.image);

  const name =
    escapeHTML(product.name);

  return `
    <img
      src="${image}"
      alt="${name}"
      loading="lazy"
      class="result-product-image"
      onerror="
        this.style.display='none';
        this.parentElement.innerHTML='<div class=\\'image-placeholder\\'>₨</div>';
      "
    >
  `;
}


// ==========================================================
// AVAILABILITY
// ==========================================================

function isAvailable(value) {
  const text =
    String(value || "")
      .toLowerCase();

  if (
    text.includes("out of stock") ||
    text.includes("unavailable")
  ) {
    return false;
  }

  return (
    text.includes("available") ||
    text.includes("in stock") ||
    text.includes("stock")
  );
}


// ==========================================================
// DEAL LINK
// ==========================================================

function dealButton(
  url,
  text,
  className = ""
) {
  if (
    !url ||
    url === "#" ||
    !url.trim()
  ) {
    return `
      <button
        class="${className} disabled-deal-button"
        type="button"
        disabled
      >
        ${escapeHTML(text)}
      </button>
    `;
  }

  return `
    <a
      class="${className}"
      href="${escapeHTML(url)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      ${escapeHTML(text)}
    </a>
  `;
}


// ==========================================================
// LOADING
// ==========================================================

function setLoading(
  container,
  query
) {
  container.innerHTML = `

    <div class="loading-state">

      <div class="loading-orbit">
        <span>₨</span>
      </div>

      <h2>
        Hunting the best price...
      </h2>

      <p>
        Checking stores for
        “${escapeHTML(query)}”
      </p>

      <div class="loading-bars">
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>

  `;
}


// ==========================================================
// NO RESULTS
// ==========================================================

function showNoResults(query) {
  const container =
    document.getElementById("results");

  if (!container) return;

  container.innerHTML = `

    <div class="no-results">

      <div class="no-results-icon">
        🔍
      </div>

      <h2>
        No deals found.
      </h2>

      <p>
        We couldn't find
        “${escapeHTML(query)}”
        right now.
      </p>

      <div class="no-results-tips">

        <span>
          Try fewer words
        </span>

        <span>
          Check spelling
        </span>

        <span>
          Try a category
        </span>

      </div>

    </div>

  `;
}


// ==========================================================
// MESSAGE
// ==========================================================

function showMessage(
  title,
  message
) {
  const container =
    document.getElementById("results");

  if (!container) return;

  container.innerHTML = `

    <div class="no-results">

      <div class="no-results-icon">
        ⚡
      </div>

      <h2>
        ${escapeHTML(title)}
      </h2>

      <p>
        ${escapeHTML(message)}
      </p>

    </div>

  `;
}


// ==========================================================
// HELPERS
// ==========================================================

function formatPrice(price) {
  return Number(
    price || 0
  ).toLocaleString("en-IN");
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
