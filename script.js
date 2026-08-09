let products = [];


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

    console.log("Products loaded:", products);
  })
  .catch(error => {
    console.error("CSV loading error:", error);

    const resultsBox = document.getElementById("results");

    if (resultsBox) {
      resultsBox.innerHTML = `
        <div class="error-message">
          <h2>⚠️ Unable to load products</h2>
          <p>Please try refreshing the page.</p>
        </div>
      `;
    }
  });


// ==========================================
// CSV PARSER
// ==========================================

function parseCSV(csv) {

  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {

    const character = csv[i];
    const nextCharacter = csv[i + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {

      value += '"';
      i++;

    } else if (character === '"') {

      insideQuotes = !insideQuotes;

    } else if (character === "," && !insideQuotes) {

      row.push(value.trim());
      value = "";

    } else if (
      (character === "\n" || character === "\r") &&
      !insideQuotes
    ) {

      if (character === "\r" && nextCharacter === "\n") {
        i++;
      }

      row.push(value.trim());

      if (row.some(cell => cell !== "")) {
        rows.push(row);
      }

      row = [];
      value = "";

    } else {

      value += character;

    }
  }


  // Add final row
  if (value !== "" || row.length > 0) {

    row.push(value.trim());

    if (row.some(cell => cell !== "")) {
      rows.push(row);
    }
  }


  if (rows.length < 2) {
    return [];
  }


  const headers = rows[0].map(header =>
    header.trim().toLowerCase()
  );


  return rows.slice(1).map(row => {

    const item = {};

    headers.forEach((header, index) => {
      item[header] = row[index] || "";
    });


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
          String(item["price"] || "0")
            .replace(/,/g, "")
            .replace(/rs\.?/gi, "")
            .trim()
        ) || 0,

      shipping:
        Number(
          String(item["shipping"] || "0")
            .replace(/,/g, "")
            .replace(/rs\.?/gi, "")
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

  }).filter(product => product.name);

}


// ==========================================
// SEARCH PRODUCT
// ==========================================

function searchProduct() {

  const searchInput =
    document.getElementById("searchInput");


  if (!searchInput) {
    console.error("Search input not found.");
    return;
  }


  const search =
    searchInput.value.trim().toLowerCase();


  if (!search) {

    alert("Please enter a product name.");

    return;
  }


  const results = products.filter(product =>
    product.name
      .toLowerCase()
      .includes(search)
  );


  displayResults(results);
}


// ==========================================
// CATEGORY SEARCH
// ==========================================

function searchCategory(category) {

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
    categoryWords[category] || [];


  const results = products.filter(product => {

    const name =
      product.name.toLowerCase();


    return words.some(word =>
      name.includes(word)
    );

  });


  displayResults(results);
}


// ==========================================
// DISPLAY RESULTS
// ==========================================

function displayResults(results) {

  const resultsBox =
    document.getElementById("results");


  if (!resultsBox) {
    console.error("Results container not found.");
    return;
  }


  // ----------------------------------------
  // NO RESULTS
  // ----------------------------------------

  if (results.length === 0) {

    resultsBox.innerHTML = `

      <div class="no-results">

        <h2>🔍 No products found</h2>

        <p>
          Try another product or category.
        </p>

      </div>

    `;

    return;
  }


  // ----------------------------------------
  // CALCULATE TOTAL PRICE
  // ----------------------------------------

  results.forEach(product => {

    product.total =
      product.price +
      product.shipping;

  });


  // ----------------------------------------
  // CHEAPEST FIRST
  // ----------------------------------------

  results.sort((a, b) =>
    a.total - b.total
  );


  const cheapest =
    results[0];


  // ----------------------------------------
  // HIGHEST PRICE
  // ----------------------------------------

  const highestPrice =
    Math.max(
      ...results.map(product =>
        product.total
      )
    );


  // ----------------------------------------
  // SAVINGS
  // ----------------------------------------

  const savings =
    highestPrice -
    cheapest.total;


  // ----------------------------------------
  // BEST PRODUCT IMAGE
  // ----------------------------------------

  let bestImage = "";


  if (cheapest.image) {

    bestImage = `

      <img
        src="${escapeHTML(cheapest.image)}"
        alt="${escapeHTML(cheapest.name)}"
        class="best-product-image"
        onerror="this.style.display='none'"
      >

    `;

  }


  // ----------------------------------------
  // BEST DEAL
  // ----------------------------------------

  resultsBox.innerHTML = `

    <h2>🥇 Best Price</h2>


    <div class="best-price">

      ${bestImage}


      <span class="badge">
        LOWEST TOTAL PRICE
      </span>


      <h2>
        ${escapeHTML(cheapest.name)}
      </h2>


      <h3>
        Rs. ${formatPrice(cheapest.total)}
      </h3>


      <p>
        🏪 ${escapeHTML(cheapest.store)}
      </p>


      <p>

        Product:
        Rs. ${formatPrice(cheapest.price)}

        <br>

        Shipping:
        Rs. ${formatPrice(cheapest.shipping)}

      </p>


      <p class="saving">

        💰 You save
        Rs. ${formatPrice(savings)}

      </p>


      <p class="updated">

        🕐 Last updated:
        ${escapeHTML(cheapest.lastUpdated)}

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

      ${results.map((product, index) => {

        let imageHTML = "";


        if (product.image) {

          imageHTML = `

            <img
              src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              class="product-image"
              onerror="this.style.display='none'"
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

                  ${escapeHTML(product.store)}

                </h3>


                <p>
                  ${escapeHTML(product.name)}
                </p>


                <p>

                  Product:
                  Rs. ${formatPrice(product.price)}

                </p>


                <p>

                  Shipping:
                  Rs. ${formatPrice(product.shipping)}

                </p>


                <p class="updated">

                  🕐
                  ${escapeHTML(product.lastUpdated)}

                </p>

              </div>

            </div>


            <div>

              <strong>

                Rs.
                ${formatPrice(product.total)}

              </strong>


              <br><br>


              ${dealButton(
                product.url,
                "VIEW"
              )}

            </div>


          </div>

        `;

      }).join("")}

    </div>

  `;

}


// ==========================================
// FORMAT PRICE
// ==========================================

function formatPrice(price) {

  return Number(price || 0)
    .toLocaleString("en-IN");

}


// ==========================================
// DEAL BUTTON
// ==========================================

function dealButton(url, text) {

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

      <button type="button">
        ${text}
      </button>

    </a>

  `;

}


// ==========================================
// BASIC HTML ESCAPING
// ==========================================

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
