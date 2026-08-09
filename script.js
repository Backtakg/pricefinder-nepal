let products = [];

// ==========================================
// PRICEFINDER BACKEND API
// ==========================================

const API_URL =
  "https://pricefinder-backend.onrender.com/api/search";


// ==========================================
// LOAD PRODUCTS FROM CSV
// ==========================================

fetch("products.csv")
  .then(response => {

    if (!response.ok) {
      throw new Error("Could not load products.csv");
    }

    return response.text();

  })
  .then(csv => {

    products = parseCSV(csv);

    console.log(
      "CSV products loaded:",
      products.length
    );

  })
  .catch(error => {

    console.error(
      "CSV loading error:",
      error
    );

  });


// ==========================================
// CSV PARSER
// ==========================================

function parseCSV(csv) {

  const rows = [];

  let row = [];
  let value = "";
  let insideQuotes = false;


  for (
    let i = 0;
    i < csv.length;
    i++
  ) {

    const character =
      csv[i];

    const nextCharacter =
      csv[i + 1];


    if (
      character === '"' &&
      insideQuotes &&
      nextCharacter === '"'
    ) {

      value += '"';

      i++;

    }

    else if (
      character === '"'
    ) {

      insideQuotes =
        !insideQuotes;

    }

    else if (
      character === "," &&
      !insideQuotes
    ) {

      row.push(
        value.trim()
      );

      value = "";

    }

    else if (
      (
        character === "\n" ||
        character === "\r"
      ) &&
      !insideQuotes
    ) {

      if (
        character === "\r" &&
        nextCharacter === "\n"
      ) {

        i++;

      }

      row.push(
        value.trim()
      );


      if (
        row.some(
          cell => cell !== ""
        )
      ) {

        rows.push(row);

      }


      row = [];

      value = "";

    }

    else {

      value += character;

    }

  }


  if (
    value !== "" ||
    row.length > 0
  ) {

    row.push(
      value.trim()
    );


    if (
      row.some(
        cell => cell !== ""
      )
    ) {

      rows.push(row);

    }

  }


  if (
    rows.length < 2
  ) {

    return [];

  }


  const headers =
    rows[0].map(
      header =>
        header
          .trim()
          .toLowerCase()
    );


  return rows
    .slice(1)
    .map(row => {

      const item = {};


      headers.forEach(
        (header, index) => {

          item[header] =
            row[index] || "";

        }
      );


      return {

        name:
          item["product"] ||
          item["name"] ||
          "",

        store:
          item["store"] ||
          "",

        price:
          Number(
            String(
              item["price"] ||
              "0"
            )
              .replace(/,/g, "")
              .replace(
                /rs\.?/gi,
                ""
              )
              .replace(
                /₨/g,
                ""
              )
              .trim()
          ) || 0,

        shipping:
          Number(
            String(
              item["shipping"] ||
              "0"
            )
              .replace(/,/g, "")
              .replace(
                /rs\.?/gi,
                ""
              )
              .replace(
                /₨/g,
                ""
              )
              .trim()
          ) || 0,

        currency:
          item["currency"] ||
          "NPR",

        url:
          item["product url"] ||
          item["url"] ||
          "#",

        lastUpdated:
          item["last updated"] ||
          "Not provided",

        image:
          item["image url"] ||
          item["image"] ||
          ""

      };

    })
    .filter(
      product =>
        product.name
    );

}


// ==========================================
// SMART SEARCH - LIVE API
// ==========================================

async function searchProduct() {

  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if (!searchInput) {

    console.error(
      "Search input not found."
    );

    return;

  }


  const search =
    searchInput.value.trim();


  if (!search) {

    alert(
      "Please enter a product name."
    );

    return;

  }


  const resultsBox =
    document.getElementById(
      "results"
    );


  // Show loading

  if (resultsBox) {

    resultsBox.innerHTML = `

      <div class="loading-message">

        <h2>
          🔎 Searching...
        </h2>

        <p>
          Checking live prices from
          available stores.
        </p>

      </div>

    `;

  }


  try {

    console.log(
      "Searching live API for:",
      search
    );


    const response =
      await fetch(
        API_URL +
        "?q=" +
        encodeURIComponent(search)
      );


    if (!response.ok) {

      throw new Error(
        "API error: " +
        response.status
      );

    }


    const data =
      await response.json();


    console.log(
      "Live API response:",
      data
    );


    if (
      !data.success ||
      !Array.isArray(
        data.results
      )
    ) {

      throw new Error(
        "Invalid API response"
      );

    }


    // ======================================
    // CONVERT API RESULTS
    // ======================================

    const liveResults =
      data.results
        .map(product => {

          const price =
            Number(
              product.price
            ) || 0;


          const shipping =
            Number(
              product.shipping
            ) || 0;


          const totalFromAPI =
            Number(
              product.total
            );


          return {

            name:
              product.name ||
              "Unknown Product",

            store:
              product.store ||
              "Unknown Store",

            price:
              price,

            shipping:
              shipping,

            total:
              Number.isFinite(
                totalFromAPI
              )
                ? totalFromAPI
                : price + shipping,

            currency:
              product.currency ||
              "NPR",

            url:
              product.url ||
              "#",

            lastUpdated:
              product.lastUpdated ||
              "Live data",

            image:
              product.image ||
              ""

          };

        })
        .filter(
          product =>
            product.name
        );


    console.log(
      "Live results:",
      liveResults
    );


    // ======================================
    // SHOW LIVE RESULTS
    // ======================================

    if (
      liveResults.length > 0
    ) {

      displayResults(
        liveResults,
        true
      );

      return;

    }


    // ======================================
    // NO LIVE RESULTS
    // ======================================

    displayNoResults(
      search
    );


  }

  catch (error) {

    console.error(
      "Live API search failed:",
      error
    );


    // ======================================
    // FALLBACK TO CSV
    // ======================================

    console.log(
      "Trying local CSV fallback..."
    );


    searchLocalProducts(
      search
    );

  }

}


// ==========================================
// LOCAL CSV SEARCH
// ==========================================

function searchLocalProducts(
  search
) {

  const searchLower =
    search.toLowerCase();


  const searchWords =
    searchLower
      .split(/\s+/)
      .filter(
        word =>
          word.length > 0
      );


  const results =
    products

      .map(product => {

        const productName =
          product.name
            .toLowerCase();


        let score = 0;


        if (
          productName ===
          searchLower
        ) {

          score += 100;

        }


        if (
          productName.includes(
            searchLower
          )
        ) {

          score += 50;

        }


        searchWords.forEach(
          word => {

            if (
              productName.includes(
                word
              )
            ) {

              score += 20;

            }

          }
        );


        if (
          productName.startsWith(
            searchLower
          )
        ) {

          score += 30;

        }


        return {

          product:
            product,

          score:
            score

        };

      })

      .filter(
        item =>
          item.score > 0
      )

      .sort(
        (a, b) =>
          b.score -
          a.score
      )

      .map(
        item =>
          item.product
      );


  displayResults(
    results,
    false
  );

}


// ==========================================
// CATEGORY SEARCH
// ==========================================

function searchCategory(
  category
) {

  const categoryWords = {

    phone: [
      "phone",
      "iphone",
      "samsung",
      "xiaomi",
      "redmi",
      "oneplus",
      "pixel"
    ],

    laptop: [
      "laptop",
      "macbook",
      "dell",
      "hp",
      "lenovo",
      "asus",
      "acer"
    ],

    audio: [
      "headphone",
      "headphones",
      "earphone",
      "earphones",
      "earbuds",
      "speaker",
      "speakers",
      "sony",
      "airpods"
    ],

    tv: [
      "tv",
      "television",
      "smart tv"
    ],

    electronics: [
      "camera",
      "monitor",
      "tablet",
      "watch",
      "electronics"
    ]

  };


  const words =
    categoryWords[
      category
    ] || [];


  const results =
    products.filter(
      product => {

        const name =
          product.name
            .toLowerCase();


        return words.some(
          word =>
            name.includes(word)
        );

      }
    );


  displayResults(
    results,
    false
  );

}


// ==========================================
// NO RESULTS
// ==========================================

function displayNoResults(
  search
) {

  const resultsBox =
    document.getElementById(
      "results"
    );


  if (!resultsBox) {

    return;

  }


  resultsBox.innerHTML = `

    <div class="no-results">

      <h2>
        🔍 No products found
      </h2>

      <p>
        We couldn't find live products
        for
        <strong>
          ${escapeHTML(search)}
        </strong>.
      </p>

      <p>
        Try another product name.
      </p>

    </div>

  `;

}


// ==========================================
// DISPLAY RESULTS
// ==========================================

function displayResults(
  results,
  liveResults = false
) {

  const resultsBox =
    document.getElementById(
      "results"
    );


  if (!resultsBox) {

    console.error(
      "Results container not found."
    );

    return;

  }


  if (
    !Array.isArray(results) ||
    results.length === 0
  ) {

    displayNoResults(
      "your search"
    );

    return;

  }


  // ======================================
  // CALCULATE TOTAL
  // ======================================

  results.forEach(
    product => {

      product.price =
        Number(
          product.price
        ) || 0;


      product.shipping =
        Number(
          product.shipping
        ) || 0;


      const apiTotal =
        Number(
          product.total
        );


      product.total =
        Number.isFinite(
          apiTotal
        )
          ? apiTotal
          : product.price +
            product.shipping;

    }
  );


  // ======================================
  // CHEAPEST FIRST
  // ======================================

  results.sort(
    (a, b) =>
      a.total -
      b.total
  );


  const cheapest =
    results[0];


  const highestPrice =
    Math.max(
      ...results.map(
        product =>
          product.total
      )
    );


  const savings =
    highestPrice -
    cheapest.total;


  // ======================================
  // BEST PRODUCT IMAGE
  // ======================================

  let bestImage = "";


  if (
    cheapest.image
  ) {

    bestImage = `

      <img
        src="${escapeHTML(
          cheapest.image
        )}"
        alt="${escapeHTML(
          cheapest.name
        )}"
        class="best-product-image"
        onerror="
          this.style.display='none'
        "
      >

    `;

  }


  // ======================================
  // LIVE BADGE
  // ======================================

  const liveBadge =
    liveResults
      ? `
        <span class="live-badge">
          🟢 LIVE
        </span>
      `
      : "";


  // ======================================
  // MAIN RESULTS
  // ======================================

  resultsBox.innerHTML = `

    <div class="results-header">

      <h2>
        🥇 Best Price
      </h2>

      ${liveBadge}

      <p>

        Found

        <strong>
          ${results.length}
        </strong>

        product${results.length === 1 ? "" : "s"}

      </p>

    </div>


    <div class="best-price">

      ${bestImage}


      <span class="badge">
        LOWEST TOTAL PRICE
      </span>


      <h2>
        ${escapeHTML(
          cheapest.name
        )}
      </h2>


      <h3>

        Rs.
        ${formatPrice(
          cheapest.total
        )}

      </h3>


      <p>

        🏪
        ${escapeHTML(
          cheapest.store
        )}

      </p>


      <p>

        Product:

        Rs.
        ${formatPrice(
          cheapest.price
        )}

        <br>

        Shipping:

        Rs.
        ${formatPrice(
          cheapest.shipping
        )}

      </p>


      <p class="saving">

        💰 You save

        Rs.
        ${formatPrice(
          savings
        )}

      </p>


      <p class="updated">

        🕐 Last updated:

        ${escapeHTML(
          cheapest.lastUpdated
        )}

      </p>


      ${dealButton(
        cheapest.url,
        "VIEW BEST DEAL"
      )}

    </div>


    <h2>
      Compare All Stores
    </h2>


    <div class="comparison-list">

      ${results
        .map(
          (
            product,
            index
          ) => {

            let imageHTML = "";


            if (
              product.image
            ) {

              imageHTML = `

                <img
                  src="${escapeHTML(
                    product.image
                  )}"
                  alt="${escapeHTML(
                    product.name
                  )}"
                  class="product-image"
                  onerror="
                    this.style.display='none'
                  "
                >

              `;

            }


            return `

              <div class="product">

                <div class="product-info">

                  ${imageHTML}


                  <div>

                    <h3>

                      ${
                        index === 0
                          ? "🥇 "
                          : ""
                      }

                      ${escapeHTML(
                        product.store
                      )}

                    </h3>


                    <p>

                      ${escapeHTML(
                        product.name
                      )}

                    </p>


                    <p>

                      Product:

                      Rs.
                      ${formatPrice(
                        product.price
                      )}

                    </p>


                    <p>

                      Shipping:

                      Rs.
                      ${formatPrice(
                        product.shipping
                      )}

                    </p>


                    <p class="updated">

                      🕐

                      ${escapeHTML(
                        product.lastUpdated
                      )}

                    </p>

                  </div>

                </div>


                <div>

                  <strong>

                    Rs.
                    ${formatPrice(
                      product.total
                    )}

                  </strong>


                  <br>
                  <br>


                  ${dealButton(
                    product.url,
                    "VIEW"
                  )}

                </div>

              </div>

            `;

          }
        )
        .join("")}

    </div>

  `;

}


// ==========================================
// PRICE FORMAT
// ==========================================

function formatPrice(
  price
) {

  return Number(
    price || 0
  )
    .toLocaleString(
      "en-IN"
    );

}


// ==========================================
// DEAL BUTTON
// ==========================================

function dealButton(
  url,
  text
) {

  if (
    !url ||
    url === "#" ||
    url.trim() === ""
  ) {

    return `

      <button
        type="button"
        disabled
      >

        ${text}

      </button>

    `;

  }


  return `

    <a
      href="${escapeHTML(url)}"
      target="_blank"
      rel="noopener noreferrer"
    >

      <button
        type="button"
      >

        ${text}

      </button>

    </a>

  `;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
  value
) {

  return String(
    value || ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
