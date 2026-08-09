function searchProduct() {

  const search = document
    .getElementById("searchInput")
    .value
    .trim();

  if (search === "") {
    alert("Please enter a product name.");
    return;
  }

  alert(
    "Searching for: " + search +
    "\n\nOur product comparison system will be connected here."
  );
}
