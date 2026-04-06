(function () {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");
  const closeBtn = document.getElementById("cart-drawer-close");
  const cartTriggers = document.querySelectorAll("[data-cart-trigger]");

  // ── Open / Close ──
  function openCart() {
    drawer.classList.remove("translate-x-full");
    backdrop.classList.remove("opacity-0", "pointer-events-none");
    backdrop.classList.add("opacity-100", "pointer-events-auto");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeCart() {
    drawer.classList.add("translate-x-full");
    backdrop.classList.remove("opacity-100", "pointer-events-auto");
    backdrop.classList.add("opacity-0", "pointer-events-none");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeCart);
  if (backdrop) backdrop.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCart();
  });

  cartTriggers.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openCart();
    });
  });

  // ── Remove item ──
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".cart-remove");
    if (!btn) return;
    fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: btn.dataset.key, quantity: 0 }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (cart) {
        refreshCart(cart);
      });
  });

  // ── Save gift note on blur ──
  var noteField = document.getElementById("cart-gift-message");
  if (noteField) {
    noteField.addEventListener("blur", function () {
      fetch("/cart/update.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: this.value }),
      });
    });
  }

  // ── Money formatter ──
  function formatMoney(cents) {
    return "$" + (cents / 100).toFixed(2);
  }

  // ── Build a single item row — mirrors the Liquid template exactly ──
  function buildItemHTML(item) {
    // Safely get image URL — never null
    var imageHTML = "";
    if (item.featured_image && item.featured_image.url) {
      imageHTML =
        '<img src="' +
        item.featured_image.url +
        '"' +
        ' alt="' +
        (item.featured_image.alt || item.product_title) +
        '"' +
        ' width="300" height="300" loading="lazy"' +
        ' class="w-full h-full object-cover">';
    }

    // Only show variant if it is not "Default Title" and not null/empty
    var variantHTML = "";
    if (item.variant_title && item.variant_title !== "Default Title") {
      variantHTML =
        '<p class="text-xs text-black-secondary">' +
        item.variant_title +
        "</p>";
    }

    return (
      "" +
      '<div class="flex flex-col md:flex-row gap-4 relative" data-key="' +
      item.key +
      '">' +
      // Image
      '<a href="' +
      item.url +
      '" class="shrink-0 w-fit">' +
      '<div class="w-28 md:w-36 aspect-square border border-black-primary overflow-hidden bg-white">' +
      imageHTML +
      "</div>" +
      "</a>" +
      // Info
      '<div class="flex flex-col justify-center gap-2 flex-1 w-fit">' +
      '<a href="' +
      item.url +
      '" class="text-lg poppins-medium text-black-primary hover:opacity-70 transition-opacity duration-200 leading-snug">' +
      item.product_title +
      "</a>" +
      variantHTML +
      '<p class="text-base text-black-primary">Quantity (' +
      item.quantity +
      ")</p>" +
      '<p class="text-lg poppins-medium text-black-primary">' +
      formatMoney(item.final_line_price) +
      "</p>" +
      "</div>" +
      // Remove button
      '<button class="cart-remove poppins-semibold absolute right-0 bottom-6 text-sm lg:text-lg text-gray-400 hover:text-black-primary transition-colors cursor-pointer duration-200"' +
      ' data-key="' +
      item.key +
      '"' +
      ' aria-label="Remove ' +
      item.product_title +
      '">' +
      "Remove" +
      "</button>" +
      "</div>"
    );
  }

  // ── Refresh entire cart drawer after any change ──
  function refreshCart(cart) {
    // Badge counts
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = cart.item_count;
      el.style.display = cart.item_count === 0 ? "none" : "";
    });

    // Subtotal
    var subtotalEl = document.getElementById("cart-subtotal");
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    // Items
    var itemsContainer = document.getElementById("cart-items");
    if (!itemsContainer) return;

    if (cart.items.length === 0) {
      itemsContainer.innerHTML =
        '<div class="text-center text-sm md:text-base text-black-primary" id="cart-empty-msg">Your cart is empty</div>';
    } else {
      itemsContainer.innerHTML = cart.items.map(buildItemHTML).join("");
    }
  }

  // ── Listen for cart:open event (fired from product page after add) ──
  document.addEventListener("cart:open", openCart);
})();
