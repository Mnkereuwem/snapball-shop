(function () {
  'use strict';

  const SHOPIFY = {
    store: 'https://j19jbw-rr.myshopify.com',
    variantId: '44323647356979',
    productUrl:
      'https://j19jbw-rr.myshopify.com/products/snapball%E2%84%A2-instant-spiral-feedback',
  };

  const PRODUCTS = {
    single: {
      id: 'snapball-single',
      name: 'SNAPBALL™ — Single',
      variant: 'Single (1×)',
      price: 24.99,
      image: 'assets/snapball-device.svg',
      shopifyUnits: 1,
    },
    coach: {
      id: 'snapball-coach',
      name: 'SNAPBALL™ — Coaches Pack',
      variant: 'Coaches Pack (4×)',
      price: 79.99,
      image: 'assets/snapball-device.svg',
      shopifyUnits: 4,
    },
  };

  let cart = loadCart();
  let selectedVariant = 'single';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('snapball-cart') || '[]');
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem('snapball-cart', JSON.stringify(cart));
    updateCartUI();
  }

  function formatPrice(n) {
    return '$' + n.toFixed(2);
  }

  function getSelectedProduct() {
    return PRODUCTS[selectedVariant];
  }

  function getLinePrice() {
    const product = getSelectedProduct();
    const qty = parseInt($('#quantity').value, 10) || 1;
    return product.price * qty;
  }

  function getShopifyUnitsForLine(productId, lineQty) {
    const product = PRODUCTS[productId === 'snapball-coach' ? 'coach' : 'single'];
    return lineQty * product.shopifyUnits;
  }

  function getShopifyUnitsFromSelection() {
    const product = getSelectedProduct();
    const qty = parseInt($('#quantity').value, 10) || 1;
    return qty * product.shopifyUnits;
  }

  function buildShopifyAddUrl(units, checkout) {
    const params = new URLSearchParams({
      id: SHOPIFY.variantId,
      quantity: String(units),
    });
    if (checkout) {
      params.set('return_to', '/checkout');
    }
    return `${SHOPIFY.store}/cart/add?${params.toString()}`;
  }

  function buildShopifyCartUrl(totalUnits) {
    return `${SHOPIFY.store}/cart/${SHOPIFY.variantId}:${totalUnits}`;
  }

  function redirectToShopify(url) {
    window.location.href = url;
  }

  function totalShopifyUnitsInCart() {
    return cart.reduce(
      (sum, item) => sum + getShopifyUnitsForLine(item.id, item.qty),
      0
    );
  }

  function updateProductUI() {
    const product = getSelectedProduct();
    $('#productPrice').textContent = formatPrice(product.price);
    $('#addPrice').textContent = formatPrice(getLinePrice());

    const note =
      selectedVariant === 'coach'
        ? 'Adds 4 units to Shopify cart · Create a bundle variant in Shopify for $79.99 pricing'
        : 'Single unit · Secure checkout on Shopify';
    $('#priceNote').textContent = note;
  }

  function initVariants() {
    $$('.variant-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        selectedVariant = opt.dataset.variant;
        $$('.variant-option').forEach((o) => o.classList.remove('active'));
        opt.classList.add('active');
        opt.querySelector('input').checked = true;
        updateProductUI();
      });
    });
  }

  function initQuantity() {
    const input = $('#quantity');
    $('#qtyMinus').addEventListener('click', () => {
      const v = Math.max(1, parseInt(input.value, 10) - 1);
      input.value = v;
      updateProductUI();
    });
    $('#qtyPlus').addEventListener('click', () => {
      const v = Math.min(10, parseInt(input.value, 10) + 1);
      input.value = v;
      updateProductUI();
    });
    input.addEventListener('change', () => {
      input.value = Math.max(1, Math.min(10, parseInt(input.value, 10) || 1));
      updateProductUI();
    });
  }

  function initGallery() {
    const main = $('#galleryMain');
    $$('.thumb').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        $$('.thumb').forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');

        if (thumb.dataset.compare === 'good') {
          main.src = 'assets/spiral-perfect.svg';
          main.alt = 'Perfect spiral — SNAPBALL stays attached';
        } else if (thumb.dataset.compare === 'bad') {
          main.src = 'assets/spiral-wobble.svg';
          main.alt = 'Wobbly throw — SNAPBALL detaches';
        } else if (thumb.dataset.src) {
          main.src = thumb.dataset.src;
          main.alt = 'SNAPBALL product view';
        }
      });
    });
  }

  function addToCart(openDrawer = true) {
    const product = getSelectedProduct();
    const qty = parseInt($('#quantity').value, 10) || 1;
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        variant: product.variant,
        price: product.price,
        image: product.image,
        qty,
      });
    }

    saveCart();
    if (openDrawer) openCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((item) => item.id !== id);
    saveCart();
  }

  function cartSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function cartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function updateCartUI() {
    const count = cartCount();
    const countEl = $('#cartCount');
    countEl.textContent = count;
    countEl.style.display = count > 0 ? 'flex' : 'none';

    const itemsEl = $('#cartItems');
    const subtotalEl = $('#cartSubtotal');
    const checkoutBtn = $('#checkoutBtn');

    if (cart.length === 0) {
      itemsEl.innerHTML =
        '<p class="cart-empty">Your cart is empty. Time to hit the field.</p>';
      subtotalEl.textContent = '$0.00';
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;
    subtotalEl.textContent = formatPrice(cartSubtotal());

    itemsEl.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.variant} × ${item.qty}</p>
          <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
          <button type="button" class="cart-item-remove" data-remove="${item.id}">Remove</button>
        </div>
      </div>
    `
      )
      .join('');

    itemsEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
    });
  }

  function openCart() {
    $('#cartDrawer').classList.add('open');
    $('#cartDrawer').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    $('#cartDrawer').classList.remove('open');
    $('#cartDrawer').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initShopifyLinks() {
    $$('[data-shopify="product"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        redirectToShopify(SHOPIFY.productUrl);
      });
    });

    $$('[data-shopify="add"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const units = getShopifyUnitsFromSelection();
        redirectToShopify(buildShopifyAddUrl(units, false));
      });
    });
  }

  function initCart() {
    $('#cartToggle').addEventListener('click', openCart);
    $('#cartClose').addEventListener('click', closeCart);
    $('#cartOverlay').addEventListener('click', closeCart);

    $('#addToCart').addEventListener('click', () => addToCart(true));

    $('#buyNow').addEventListener('click', () => {
      const units = getShopifyUnitsFromSelection();
      redirectToShopify(buildShopifyAddUrl(units, true));
    });

    $('#checkoutBtn').addEventListener('click', () => {
      if (cart.length === 0) return;
      const units = totalShopifyUnitsInCart();
      redirectToShopify(buildShopifyCartUrl(units));
    });

    const aboutCta = $('#aboutShopCta');
    if (aboutCta) {
      aboutCta.addEventListener('click', () => {
        redirectToShopify(buildShopifyAddUrl(1, false));
      });
    }
  }

  function init() {
    initVariants();
    initQuantity();
    initGallery();
    initShopifyLinks();
    initCart();
    updateProductUI();
    updateCartUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
