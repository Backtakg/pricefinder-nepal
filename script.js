let products = [];


// Load products from CSV
fetch("products.csv")
  .then(response => response.text())
  .then(csv => {
    products = parseCSV(csv);
    console.log("Products loaded:", products);
  })
  .catch(error => {
    console.error("Could not load products.csv:", error);
  });


// Convert CSV into products
function parseCSV(csv) {

  const lines = csv.trim().split("\n");

  return lines.slice(1).map(line => {

    const values = line.split(",");

    return {
      name: values[0]?.trim() || "",
      store: values[1]?.trim() || "",
      price: Number(values[2]) || 0,
      shipping: Number(values[3]) || 0,
      currency: values[4]?.trim() || "NPR",
      url: values[5]?.trim() || "#",
      lastUpdated: values[6]?.trim() || "Not provided",
      image: values[7]?.trim() || ""
    };

  }).filter(product => product.name);
}


// Search products
function searchProduct() {

  const searchInput =
    document.getElementById("searchInput");

  const search =
    searchInput.value.trim().toLowerCase();

  if (!search) {
    alert("Please enter a product name.");
    return;
  }

  const results = products.filter(product =>
    product.name.toLowerCase().includes(search)
  );

  displayResults(results);
}


// Search by category
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
      "earphone",
      "earbuds",
      "speaker",
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
      "watch"
    ]

  };

  const words = categoryWords[category] || [];

  const results = products.filter(product => {

    const name = product.name.toLowerCase();

    return words.some(word =>
      name.includes(word)
    );

  });

  displayResults(results);
}


// Display results
function displayResults(results) {

  const resultsBox =
    document.getElementById("results");

  if (!resultsBox) {
    return;
  }


  if (results.length === 0) {

    resultsBox.innerHTML = `
      <h2>No products found</h2>
      <p>Try another product or category.</p>
    `;

    return;
  }


  // Calculate total price
  results.forEach(product => {

    product.total =
      product.price + product.shipping;

  });


  // Cheapest first
  results.sort((a, b) =>
    a.total - b.total
  );


  const cheapest = results[0];

  const highestPrice =
    Math.max(...results.map(product => product.total));

  const savings =
    highestPrice - cheapest.total;


  // Best product image
  const bestImage = cheapest.image
    ? `<img
         src="${cheapest.image}"
         alt="${cheapest.name}"
         class="best-product-image"
         onerror="this.style.display='none'"
       >`
    : "";


  resultsBox.innerHTML = `

    <h2>🥇 Best Price</h2>

    <div class="best-price">

      ${bestImage}

      <span class="badge">
        LOWEST TOTAL PRICE
      </span>

      <h2>
        ${cheapest.name}
      </h2>

      <h3>
        Rs. ${cheapest.total.toLocaleString()}
      </h3>

      <p>
        🏪 ${cheapest.store}
      </p>

      <p>
        Product:
        Rs. ${cheapest.price.toLocaleString()}
        <br>

        Shipping:
        Rs. ${cheapest.shipping.toLocaleString()}
      </p>

      <p class="saving">
        💰 You save
        Rs. ${savings.toLocaleString()}
      </p>

      <p class="updated">
        🕐 Last updated:
        ${cheapest.lastUpdated}
      </p>

      <a
        href="${cheapest.url}"
        target="_blank"
      >
        <button>
          VIEW BEST DEAL
        </button>
      </a>

    </div>


    <h2>
      Compare All Stores
    </h2>


    ${results.map((product, index) => `

      <div class="product">

        <div class="product-info">

          ${
            product.image
            ? `<img
                 src="${product.image}"
                 alt="${product.name}"
                 class="product-image"
                 onerror="this.style.display='none'"
               >`
            : ""
          }

          <div>

            <h3>
              ${index === 0 ? "🥇 " : ""}
              ${product.store}
            </h3>

            <p>
              ${product.name}
            </p>

            <p>
              Product:
              Rs. ${product.price.toLocaleString()}
            </p>

            <p>
              Shipping:
              Rs. ${product.shipping.toLocaleString()}
            </p>

            <p class="updated">
              🕐 ${product.lastUpdated}
            </p>

          </div>

        </div>


        <div>

          <strong>
            Rs. ${product.total.toLocaleString()}
          </strong>

          <br><br>

          <a
            href="${product.url}"
            target="_blank"
          >
            <button>
              VIEW
            </button>
          </a>

        </div>

      </div>

    `).join("")}

  `;
}
