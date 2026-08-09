const products = [
  {
    name: "Samsung Galaxy S25 256GB",
    store: "Store A",
    price: 109999,
    shipping: 0,
    url: "#"
  },
  {
    name: "Samsung Galaxy S25 256GB",
    store: "Store B",
    price: 112000,
    shipping: 200,
    url: "#"
  },
  {
    name: "Samsung Galaxy S25 256GB",
    store: "Store C",
    price: 108500,
    shipping: 1500,
    url: "#"
  },
  {
    name: "iPhone 15 128GB",
    store: "Store A",
    price: 82000,
    shipping: 0,
    url: "#"
  },
  {
    name: "iPhone 15 128GB",
    store: "Store B",
    price: 79999,
    shipping: 500,
    url: "#"
  },
  {
    name: "iPhone 15 128GB",
    store: "Store C",
    price: 84500,
    shipping: 0,
    url: "#"
  }
];

function searchProduct() {

  const search = document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();

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

  if (results.length === 0) {

    resultsBox.innerHTML = `
      <h2>No products found</h2>
      <p>Try searching for another product.</p>
    `;

    return;
  }

  // Calculate total price
  results.forEach(product => {
    product.total = product.price + product.shipping;
  });

  // Cheapest first
  results.sort((a, b) => a.total - b.total);

  const cheapest = results[0];

  resultsBox.innerHTML = `
    <h2>Best Prices</h2>

    <div class="best-price">
      🥇 BEST PRICE

      <h2>${cheapest.name}</h2>

      <h3>
        Rs. ${cheapest.total.toLocaleString()}
      </h3>

      <p>
        ${cheapest.store}
      </p>

      <p>
        Product: Rs. ${cheapest.price.toLocaleString()}<br>
        Shipping: Rs. ${cheapest.shipping.toLocaleString()}
      </p>

      <a href="${cheapest.url}">
        <button>VIEW DEAL</button>
      </a>
    </div>

    <h2>Other Prices</h2>

    ${results.map((product, index) => `

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

          <a href="${product.url}">
            <button>VIEW</button>
          </a>

        </div>

      </div>

    `).join("")}
  `;
}    price: 79999,
    shipping: 500,
    url: "#"
  }
];  {
    name: "iPhone 15 128GB",
    store: "Store C",
    price: 84500,
    shipping: 0,
    url: "#"
  }
];

function searchProduct() {

  const search = document
    .getElementById("searchInput")
    .value
    .trim()
    .toLowerCase();

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

  if (results.length === 0) {

    resultsBox.innerHTML = `
      <h2>No products found</h2>
      <p>Try searching for another product.</p>
    `;

    return;
  }

  // Calculate total price
  results.forEach(product => {
    product.total = product.price + product.shipping;
  });

  // Cheapest first
  results.sort((a, b) => a.total - b.total);

  const cheapest = results[0];

  resultsBox.innerHTML = `
    <h2>Best Prices</h2>

    <div class="best-price">
      🥇 BEST PRICE

      <h2>${cheapest.name}</h2>

      <h3>
        Rs. ${cheapest.total.toLocaleString()}
      </h3>

      <p>
        ${cheapest.store}
      </p>

      <p>
        Product: Rs. ${cheapest.price.toLocaleString()}<br>
        Shipping: Rs. ${cheapest.shipping.toLocaleString()}
      </p>

      <a href="${cheapest.url}">
        <button>VIEW DEAL</button>
      </a>
    </div>

    <h2>Other Prices</h2>

    ${results.map((product, index) => `

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

          <a href="${product.url}">
            <button>VIEW</button>
          </a>

        </div>

      </div>

    `).join("")}
  `;
}
