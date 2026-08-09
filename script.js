const products = [
  {
    name: "Samsung Galaxy S25 256GB",
    store: "Daraz Nepal",
    price: 109999,
    shipping: 0,
    url: "https://www.daraz.com.np/"
  },
  {
    name: "Samsung Galaxy S25 256GB",
    store: "Nepali Online Store",
    price: 112000,
    shipping: 200,
    url: "#"
  },
  {
    name: "Samsung Galaxy S25 256GB",
    store: "Local Online Store",
    price: 108500,
    shipping: 1500,
    url: "#"
  },
  {
    name: "iPhone 15 128GB",
    store: "Daraz Nepal",
    price: 82000,
    shipping: 0,
    url: "https://www.daraz.com.np/"
  },
  {
    name: "iPhone 15 128GB",
    store: "Nepali Online Store",
    price: 79999,
    shipping: 500,
    url: "#"
  }
];

function searchProduct() {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) {
    return;
  }

  const search = searchInput.value.trim().toLowerCase();

  if (!search) {
    alert("Please enter a product name.");
    return;
  }

  const results = products.filter(product =>
    product.name.toLowerCase().includes(search)
  );

  displayResults(results);
}

function displayResults(results) {
  const resultsBox = document.getElementById("results");

  if (!resultsBox) {
    return;
  }

  if (results.length === 0) {
    resultsBox.innerHTML = `
      <h2>No products found</h2>
      <p>Try searching for another product.</p>
    `;
    return;
  }

  results.forEach(product => {
    product.total = product.price + product.shipping;
  });

  results.sort((a, b) => a.total - b.total);

  const cheapest = results[0];

  resultsBox.innerHTML = `
    <h2>🥇 Best Price</h2>

    <div class="best-price">
      <span class="badge">LOWEST TOTAL PRICE</span>

      <h2>${cheapest.name}</h2>

      <h3>
        Rs. ${cheapest.total.toLocaleString()}
      </h3>

      <p>
        🏪 ${cheapest.store}
      </p>

      <p>
        Product: Rs. ${cheapest.price.toLocaleString()}<br>
        Shipping: Rs. ${cheapest.shipping.toLocaleString()}
      </p>

      <a href="${cheapest.url}" target="_blank">
        <button>VIEW DEAL</button>
      </a>
    </div>

    <h2>All Prices</h2>

    ${results.map(product => `
      <div class="product">

        <div>
          <h3>${product.name}</h3>

          <p>
            🏪 ${product.store}
          </p>

          <p>
            Product: Rs. ${product.price.toLocaleString()}
          </p>

          <p>
            Shipping: Rs. ${product.shipping.toLocaleString()}
          </p>
        </div>

        <div>
          <strong>
            Rs. ${product.total.toLocaleString()}
          </strong>

          <br><br>

          <a href="${product.url}" target="_blank">
            <button>VIEW</button>
          </a>
        </div>

      </div>
    `).join("")}
  `;
}
