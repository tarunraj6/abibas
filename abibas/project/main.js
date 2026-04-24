const STORAGE_KEYS = {
  cart: 'abibas-cart',
  wishlist: 'abibas-wishlist',
  checkout: 'abibas-checkout',
};

const gatewayEmbedScript = document.getElementById('payment-network-embed') || Array.from(document.getElementsByTagName('script')).find((script) =>
  script.src?.includes('/payment.network/pn-embed/')
);

const GATEWAY_SCRIPT_TOKEN = gatewayEmbedScript?.dataset.scriptToken || extractScriptToken(gatewayEmbedScript?.src) || '';
const GATEWAY_BASE = gatewayEmbedScript?.dataset.baseUrl || deriveGatewayBase(gatewayEmbedScript?.src) || 'https://ranvijay.capricorn.online/payment.network';
const GATEWAY_ORIGIN = new URL(GATEWAY_BASE).origin;
const GATEWAY_COMPANY_FALLBACK = gatewayEmbedScript?.dataset.companyId || '1825ef1c-6547-4606-a538-650edac78ccf';
const GATEWAY_SDK_URL = `${GATEWAY_BASE}/js/pn-checkout.js`;
const GATEWAY_ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'abibas-adidas-replic-2y4k.bolt.host'];

function extractScriptToken(src) {
  if (!src) {
    return '';
  }
  const match = src.match(/pn-embed\/([^/?#]+)(?:\.js)?$/);
  return match?.[1] || '';
}

function deriveGatewayBase(src) {
  if (!src) {
    return '';
  }
  const match = src.match(/^(https?:\/\/[^/]+\/payment\.network)/);
  return match?.[1] || '';
}

let paymentSdkPromise = null;

const products = [
  {
    id: 'ultra-fly-elite',
    name: 'Ultrafly Elite',
    subtitle: 'Men Running Shoes',
    category: 'running',
    collection: 'men',
    price: 129,
    originalPrice: 159,
    badge: { text: 'Sale', type: 'sale' },
    image: 'https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#111111', '#f97316', '#ffffff'],
    sizes: ['7', '8', '9', '10', '11'],
    description: 'Responsive daily trainer built for long distance comfort, lightweight support, and standout street-ready styling.',
    isNew: true,
  },
  {
    id: 'court-rush-pro',
    name: 'Court Rush Pro',
    subtitle: 'Women Lifestyle Sneakers',
    category: 'lifestyle',
    collection: 'women',
    price: 104,
    originalPrice: null,
    badge: { text: 'New', type: 'new' },
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#f5f5f4', '#0f172a', '#ef4444'],
    sizes: ['5', '6', '7', '8', '9'],
    description: 'Retro-inspired sneakers with cushioned comfort and a clean silhouette for everyday wear.',
    isNew: true,
  },
  {
    id: 'powerform-trainer',
    name: 'Powerform Trainer',
    subtitle: 'Training Shoes',
    category: 'training',
    collection: 'men',
    price: 118,
    originalPrice: 145,
    badge: { text: 'Hot', type: 'hot' },
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#1d4ed8', '#111827', '#facc15'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    description: 'Stable sole platform, locked-in heel support, and durable grip for hard gym sessions.',
    isNew: false,
  },
  {
    id: 'nmd-velocity',
    name: 'NMD Velocity',
    subtitle: 'Unisex Lifestyle Shoes',
    category: 'lifestyle',
    collection: 'new',
    price: 112,
    originalPrice: null,
    badge: { text: 'New', type: 'new' },
    image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#0f172a', '#14b8a6', '#f8fafc'],
    sizes: ['6', '7', '8', '9', '10'],
    description: 'Soft knit upper and futuristic tooling built for city movement and all-day comfort.',
    isNew: true,
  },
  {
    id: 'marathon-pace-x',
    name: 'Marathon Pace X',
    subtitle: 'Women Running Shoes',
    category: 'running',
    collection: 'women',
    price: 136,
    originalPrice: 169,
    badge: { text: 'Sale', type: 'sale' },
    image: 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#ec4899', '#111827', '#fb7185'],
    sizes: ['5', '6', '7', '8', '9'],
    description: 'High energy return cushioning with a breathable upper for tempo runs and long workouts.',
    isNew: false,
  },
  {
    id: 'streetcore-classic',
    name: 'Streetcore Classic',
    subtitle: 'Lifestyle Sneakers',
    category: 'lifestyle',
    collection: 'sale',
    price: 89,
    originalPrice: 119,
    badge: { text: 'Sale', type: 'sale' },
    image: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#ffffff', '#111111', '#22c55e'],
    sizes: ['6', '7', '8', '9', '10', '11'],
    description: 'Classic low-top silhouette tuned for everyday wear, casual fits, and weekend comfort.',
    isNew: false,
  },
  {
    id: 'lift-lab-6',
    name: 'Lift Lab 6',
    subtitle: 'Training Shoes',
    category: 'training',
    collection: 'men',
    price: 124,
    originalPrice: null,
    badge: { text: 'New', type: 'new' },
    image: 'https://images.pexels.com/photos/4498604/pexels-photo-4498604.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#0f172a', '#a855f7', '#94a3b8'],
    sizes: ['7', '8', '9', '10', '11'],
    description: 'Designed for lifting and conditioning with a grounded platform and flexible forefoot.',
    isNew: true,
  },
  {
    id: 'speedline-kids',
    name: 'Speedline Kids',
    subtitle: 'Kids Running Shoes',
    category: 'running',
    collection: 'kids',
    price: 68,
    originalPrice: 82,
    badge: { text: 'Sale', type: 'sale' },
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#2563eb', '#f43f5e', '#f8fafc'],
    sizes: ['1', '2', '3', '4', '5'],
    description: 'Easy-on comfort and durable traction for fast moving kids with everyday versatility.',
    isNew: false,
  },
  {
    id: 'urban-streetwear',
    name: 'Urban Streetwear',
    subtitle: 'Men Lifestyle Sneakers',
    category: 'lifestyle',
    collection: 'men',
    price: 99,
    originalPrice: null,
    badge: { text: 'New', type: 'new' },
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#000000', '#ffffff', '#ff0000'],
    sizes: ['7', '8', '9', '10', '11'],
    description: 'Sleek urban design with premium materials for city dwellers and street style enthusiasts.',
    isNew: true,
  },
  {
    id: 'aqua-flow',
    name: 'Aqua Flow',
    subtitle: 'Women Water Shoes',
    category: 'lifestyle',
    collection: 'women',
    price: 79,
    originalPrice: 99,
    badge: { text: 'Sale', type: 'sale' },
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#00aaff', '#ffffff', '#ff69b4'],
    sizes: ['5', '6', '7', '8', '9'],
    description: 'Quick-drying water-resistant shoes perfect for beach, pool, and outdoor water activities.',
    isNew: false,
  },
  {
    id: 'elite-runner-pro',
    name: 'Elite Runner Pro',
    subtitle: 'Unisex Performance Shoes',
    category: 'running',
    collection: 'new',
    price: 149,
    originalPrice: null,
    badge: { text: 'Hot', type: 'hot' },
    image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=900',
    colors: ['#1f2937', '#3b82f6', '#10b981'],
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    description: 'Advanced cushioning technology for elite athletes and serious runners seeking peak performance.',
    isNew: true,
  },
];

const state = {
  activeFilter: 'all',
  searchTerm: '',
  cart: readStorage(STORAGE_KEYS.cart, []),
  wishlist: readStorage(STORAGE_KEYS.wishlist, []),
  checkoutForm: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    ...readStorage(STORAGE_KEYS.checkout, {}),
  },
  selectedSizes: {},
  heroIndex: 0,
  heroTimer: null,
  statusTimer: null,
};

const elements = {
  header: document.getElementById('header'),
  hamburger: document.getElementById('hamburger'),
  mainNav: document.getElementById('main-nav'),
  searchBtn: document.getElementById('search-btn'),
  closeSearch: document.getElementById('close-search'),
  searchBar: document.getElementById('search-bar'),
  searchInput: document.getElementById('search-input'),
  productsGrid: document.getElementById('products-grid'),
  arrivalsGrid: document.getElementById('arrivals-grid'),
  filterTabs: document.getElementById('filter-tabs'),
  cartBtn: document.getElementById('cart-btn'),
  cartCount: document.getElementById('cart-count'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartOverlay: document.getElementById('cart-overlay'),
  closeCart: document.getElementById('close-cart'),
  cartItems: document.getElementById('cart-items'),
  cartItemCount: document.getElementById('cart-item-count'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartFooter: document.getElementById('cart-footer'),
  continueShoppingButtons: [
    document.getElementById('continue-shopping-btn'),
    document.getElementById('continue-shopping-btn2'),
  ].filter(Boolean),
  checkoutBtn: document.getElementById('checkout-btn'),
  toast: document.getElementById('toast'),
  modalOverlay: document.getElementById('modal-overlay'),
  productModal: document.getElementById('product-modal'),
  closeModal: document.getElementById('close-modal'),
  modalInner: document.getElementById('modal-inner'),
  checkoutOverlay: document.getElementById('checkout-overlay'),
  checkoutModal: document.getElementById('checkout-modal'),
  closeCheckout: document.getElementById('close-checkout'),
  checkoutForm: document.getElementById('checkout-form'),
  checkoutItems: document.getElementById('checkout-items'),
  checkoutSubtotal: document.getElementById('checkout-subtotal'),
  checkoutShipping: document.getElementById('checkout-shipping'),
  checkoutTotal: document.getElementById('checkout-total'),
  backToCartBtn: document.getElementById('back-to-cart-btn'),
  placeOrderBtn: document.getElementById('place-order-btn'),
  gatewayState: document.getElementById('gateway-state'),
  methodOverlay: document.getElementById('methodOverlay'),
  closeMethod: document.getElementById('closeBtn'),
  methodIframe: document.getElementById('methodIframe'),
  fallbackMethods: document.getElementById('fallback-methods'),
  statusOverlay: document.getElementById('statusOverlay'),
  statusCard: document.getElementById('status-card'),
  statusSpinner: document.getElementById('status-spinner'),
  statusText: document.getElementById('statusText'),
  statusSubtext: document.getElementById('statusSubtext'),
  statusActions: document.getElementById('statusActions'),
  heroSlides: Array.from(document.querySelectorAll('.hero-slide')),
  heroDots: Array.from(document.querySelectorAll('.dot')),
  heroPrev: document.getElementById('hero-prev'),
  heroNext: document.getElementById('hero-next'),
  newsletterForm: document.getElementById('newsletter-form'),
};

window.scrollToSection = function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

init();

function init() {
  hydrateCheckoutForm();
  bindCoreEvents();
  bindInteractiveCards();
  bindCheckoutEvents();
  bindGatewayEvents();
  renderProducts();
  renderArrivals();
  renderCart();
  renderCheckoutSummary();
  updateGatewayState();
  ensurePaymentSdk().catch(() => {
    // The checkout can still open the selector while we keep retrying on demand.
  });
  initHeroSlider();
  handleReturnedTransaction();
}

function loadExternalScript(src, attributes = {}) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    (document.head || document.body || document.documentElement).appendChild(script);
  });
}

function initializePaymentNetwork(paymentNetwork) {
  if (!paymentNetwork?.init && !paymentNetwork?.open) {
    throw new Error('Payment SDK did not expose init() or open().');
  }

  if (!paymentNetwork.__abibasInitialized && paymentNetwork.init) {
    paymentNetwork.init({
      companyId: GATEWAY_COMPANY_FALLBACK,
      basePath: GATEWAY_BASE,
      baseUrl: GATEWAY_BASE,
      scriptToken: GATEWAY_SCRIPT_TOKEN,
    });
    paymentNetwork.__abibasInitialized = true;
  }

  if (!paymentNetwork.companyId && GATEWAY_COMPANY_FALLBACK) {
    paymentNetwork.companyId = GATEWAY_COMPANY_FALLBACK;
  }

  updateGatewayState(true);
  return paymentNetwork;
}

function getCompanyId() {
  return window.PaymentNetwork?.companyId || GATEWAY_COMPANY_FALLBACK;
}

function ensurePaymentSdk() {
  if (window.PaymentNetwork?.open) {
    try {
      return Promise.resolve(initializePaymentNetwork(window.PaymentNetwork));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  if (paymentSdkPromise) {
    return paymentSdkPromise;
  }

  updateGatewayState(false, getGatewayLoadingMessage());

  paymentSdkPromise = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback) => (value) => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener('payment-network-ready', onReady);
      callback(value);
    };

    const resolveSdk = finish((sdk) => resolve(sdk));
    const rejectSdk = finish((error) => reject(error));

    const tryInitialize = () => {
      if (!window.PaymentNetwork?.init) {
        return false;
      }

      try {
        resolveSdk(initializePaymentNetwork(window.PaymentNetwork));
        return true;
      } catch (error) {
        rejectSdk(error);
        return true;
      }
    };

    const onReady = () => {
      tryInitialize();
    };

    window.addEventListener('payment-network-ready', onReady);

    if (tryInitialize()) {
      return;
    }

    loadExternalScript(GATEWAY_SDK_URL, { 'data-pn-manual': 'true' })
      .then(() => {
        window.setTimeout(() => {
          if (!tryInitialize()) {
            rejectSdk(new Error('Payment SDK is still unavailable after loading the checkout library.'));
          }
        }, 250);
      })
      .catch(rejectSdk);
  })
    .catch((error) => {
      paymentSdkPromise = null;
      updateGatewayState(false, buildGatewayErrorMessage(error));
      throw error;
    });

  return paymentSdkPromise;
}

function normalizePaymentMethod(method) {
  const normalized = String(method || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const aliases = {
    upi: 'upi',
    card: 'debit_card',
    debit_card: 'debit_card',
    debitcard: 'debit_card',
    credit_card: 'credit_card',
    creditcard: 'credit_card',
    net_banking: 'net_banking',
    netbanking: 'net_banking',
    wallet: 'wallet',
    wallets: 'wallet',
  };

  return aliases[normalized] || normalized || 'upi';
}

function getGatewayLoadingMessage() {
  if (window.location.protocol === 'file:') {
    return 'Open this site on http://localhost so the payment SDK can initialize correctly.';
  }

  if (!GATEWAY_ALLOWED_HOSTS.includes(window.location.hostname)) {
    return `Loading payment SDK for ${window.location.hostname}...`;
  }

  return 'Loading payment gateway SDK...';
}

function buildGatewayErrorMessage(error) {
  const baseMessage = error?.message || 'Payment SDK failed to initialize.';
  if (window.location.protocol === 'file:') {
    return `${baseMessage} Run the site on http://localhost instead of opening the HTML file directly.`;
  }

  return baseMessage;
}

function bindCoreEvents() {
  window.addEventListener('scroll', () => {
    elements.header?.classList.toggle('scrolled', window.scrollY > 16);
  });

  elements.searchBtn?.addEventListener('click', openSearch);
  elements.closeSearch?.addEventListener('click', closeSearch);
  elements.searchInput?.addEventListener('input', (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderProducts();
    renderArrivals();
  });

  elements.hamburger?.addEventListener('click', () => {
    elements.hamburger.classList.toggle('open');
    elements.mainNav?.classList.toggle('open');
    syncBodyLock();
  });

  document.querySelectorAll('.has-mega > a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (window.innerWidth > 768) {
        return;
      }
      event.preventDefault();
      link.parentElement?.classList.toggle('open');
    });
  });

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
    });
  });

  document.querySelector('.logo')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.querySelector('.sale-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    setFilter('sale');
    window.scrollToSection('featured');
  });

  document.querySelector('.see-all')?.addEventListener('click', (event) => {
    event.preventDefault();
    setFilter('all');
    window.scrollToSection('featured');
  });

  document.querySelectorAll('.cat-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      const label = card.querySelector('.cat-label')?.textContent?.trim().toLowerCase() || 'all';
      const mappedFilter = label === 'sale' ? 'sale' : 'all';
      setFilter(mappedFilter);
      if (label !== 'sale') {
        state.searchTerm = label === 'men' || label === 'women' || label === 'kids' ? label : '';
        if (elements.searchInput) {
          elements.searchInput.value = state.searchTerm;
        }
      }
      renderProducts();
      window.scrollToSection('featured');
    });
  });

  document.querySelector('.promo-banner .btn')?.addEventListener('click', () => {
    showToast('Abibas Club signup preview is ready. Your storefront flow is functional now.');
  });

  document.querySelectorAll('.footer a, .social-links a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('This demo link is intentionally kept inside the storefront preview.');
    });
  });

  elements.newsletterForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('You are subscribed. The demo storefront is responding correctly.');
    elements.newsletterForm.reset();
  });

  elements.filterTabs?.addEventListener('click', (event) => {
    const tab = event.target.closest('.tab');
    if (!tab) {
      return;
    }
    setFilter(tab.dataset.filter || 'all');
    renderProducts();
  });

  elements.cartBtn?.addEventListener('click', openCart);
  elements.cartOverlay?.addEventListener('click', closeCart);
  elements.closeCart?.addEventListener('click', closeCart);
  elements.continueShoppingButtons.forEach((button) => {
    button.addEventListener('click', closeCart);
  });
}

function bindInteractiveCards() {
  [elements.productsGrid, elements.arrivalsGrid].forEach((grid) => {
    grid?.addEventListener('click', (event) => {
      const wishlistButton = event.target.closest('.product-wishlist');
      if (wishlistButton) {
        event.stopPropagation();
        toggleWishlist(wishlistButton.dataset.productId);
        return;
      }

      const quickAddButton = event.target.closest('.quick-add');
      if (quickAddButton) {
        event.stopPropagation();
        addToCart(quickAddButton.dataset.productId);
        return;
      }

      const card = event.target.closest('.product-card');
      if (card) {
        openProductModal(card.dataset.productId);
      }
    });
  });

  elements.closeModal?.addEventListener('click', closeProductModal);
  elements.modalOverlay?.addEventListener('click', closeProductModal);

  elements.modalInner?.addEventListener('click', (event) => {
    const sizeButton = event.target.closest('.size-btn[data-size]');
    if (sizeButton) {
      const productId = sizeButton.dataset.productId;
      state.selectedSizes[productId] = sizeButton.dataset.size;
      openProductModal(productId);
      return;
    }

    const addButton = event.target.closest('[data-action="modal-add"]');
    if (addButton) {
      addToCart(addButton.dataset.productId, getSelectedSize(addButton.dataset.productId));
      return;
    }

    const buyButton = event.target.closest('[data-action="modal-buy"]');
    if (buyButton) {
      addToCart(buyButton.dataset.productId, getSelectedSize(buyButton.dataset.productId));
      closeProductModal();
      openCheckout();
    }
  });

  elements.cartItems?.addEventListener('click', (event) => {
    const cartAction = event.target.closest('[data-cart-action]');
    if (!cartAction) {
      return;
    }

    const productId = cartAction.dataset.productId;
    const size = cartAction.dataset.size;
    const action = cartAction.dataset.cartAction;

    if (action === 'increase') {
      updateCartQuantity(productId, size, 1);
    } else if (action === 'decrease') {
      updateCartQuantity(productId, size, -1);
    } else if (action === 'remove') {
      removeFromCart(productId, size);
    }
  });

  elements.checkoutBtn?.addEventListener('click', openCheckout);
}

function bindCheckoutEvents() {
  elements.closeCheckout?.addEventListener('click', closeCheckout);
  elements.checkoutOverlay?.addEventListener('click', closeCheckout);
  elements.backToCartBtn?.addEventListener('click', () => {
    closeCheckout();
    openCart();
  });

  elements.checkoutForm?.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    state.checkoutForm[target.name] = target.value;
    writeStorage(STORAGE_KEYS.checkout, state.checkoutForm);
  });

  elements.checkoutForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!state.cart.length) {
      showToast('Add a product to cart before testing the payment flow.');
      closeCheckout();
      return;
    }

    if (!validateCheckout()) {
      return;
    }

    elements.placeOrderBtn.disabled = true;
    await openPaymentMethodSelector();
    elements.placeOrderBtn.disabled = false;
  });
}

function bindGatewayEvents() {
  const onReady = () => {
    try {
      initializePaymentNetwork(window.PaymentNetwork);
    } catch (error) {
      updateGatewayState(false, buildGatewayErrorMessage(error));
    }
  };
  if (window.PaymentNetwork?.init) {
    onReady();
  }
  window.addEventListener('payment-network-ready', onReady);

  window.addEventListener('message', (event) => {
    if (event.origin !== GATEWAY_ORIGIN) {
      return;
    }

    const payload = event.data;
    if (!payload?.type) {
      return;
    }

    if (payload.type === 'PAYMENT_SELECTOR_CANCEL') {
      closePaymentMethodSelector();
      showToast('Payment method selection was cancelled.');
      return;
    }

    if (payload.type === 'PAYMENT_METHOD_SELECTED' && payload.method) {
      closePaymentMethodSelector();
      launchPayment(payload.method);
    }
  });

  elements.closeMethod?.addEventListener('click', closePaymentMethodSelector);
  elements.methodOverlay?.addEventListener('click', (event) => {
    if (event.target === elements.methodOverlay) {
      closePaymentMethodSelector();
    }
  });
  elements.methodIframe?.addEventListener('error', showFallbackMethods);

  elements.fallbackMethods?.addEventListener('click', (event) => {
    const button = event.target.closest('.fallback-method');
    if (!button) {
      return;
    }
    closePaymentMethodSelector();
    launchPayment(button.dataset.method);
  });

  elements.statusOverlay?.addEventListener('click', (event) => {
    if (event.target === elements.statusOverlay) {
      hideStatus();
    }
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  elements.productsGrid.innerHTML = visibleProducts.length
    ? visibleProducts.map((product) => buildProductCard(product)).join('')
    : `<div class="empty-state"><h3>No products found</h3><p>Try another filter or search term.</p></div>`;
}

function renderArrivals() {
  const visible = products
    .filter((product) => product.isNew)
    .filter((product) => matchesSearch(product))
    .slice(0, 4);

  elements.arrivalsGrid.innerHTML = visible
    .map((product) => buildProductCard(product))
    .join('');
}

function buildProductCard(product) {
  const likedClass = state.wishlist.includes(product.id) ? 'liked' : '';
  const originalPriceMarkup = product.originalPrice
    ? `<span class="price-original">${formatMoney(product.originalPrice)}</span>`
    : '';
  const priceClass = product.originalPrice ? 'price-current sale' : 'price-current';

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-img-wrap">
        <span class="product-badge badge-${product.badge.type}">${product.badge.text}</span>
        <button class="product-wishlist ${likedClass}" type="button" data-product-id="${product.id}" aria-label="Save ${product.name}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <button class="quick-add" type="button" data-action="quick-add" data-product-id="${product.id}">Quick Add</button>
      </div>
      <div class="product-info">
        <div class="product-tag">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-sub">${product.subtitle}</p>
        <div class="product-price">
          <span class="${priceClass}">${formatMoney(product.price)}</span>
          ${originalPriceMarkup}
        </div>
        <div class="product-colors">
          ${product.colors
            .map((color) => `<span class="color-dot" style="background:${color}" aria-hidden="true"></span>`)
            .join('')}
        </div>
      </div>
    </article>
  `;
}

function openProductModal(productId) {
  const product = findProduct(productId);
  if (!product) {
    return;
  }

  const selectedSize = getSelectedSize(product.id);
  const originalPriceMarkup = product.originalPrice
    ? `<span class="modal-price-original">${formatMoney(product.originalPrice)}</span>`
    : '';

  elements.modalInner.innerHTML = `
    <div class="modal-img">
      <img src="${product.image}" alt="${product.name}" />
    </div>
    <div class="modal-details">
      <p class="modal-tag">${product.category} / ${product.collection}</p>
      <h3 class="modal-name">${product.name}</h3>
      <p class="modal-sub">${product.subtitle}</p>
      <div class="modal-price">${formatMoney(product.price)} ${originalPriceMarkup}</div>
      <p class="modal-label">Select Size</p>
      <div class="size-grid">
        ${product.sizes
          .map((size) => {
            const selected = size === selectedSize ? 'selected' : '';
            return `<button class="size-btn ${selected}" type="button" data-size="${size}" data-product-id="${product.id}">${size}</button>`;
          })
          .join('')}
      </div>
      <button class="btn btn-black modal-add-btn" type="button" data-action="modal-add" data-product-id="${product.id}">
        Add To Cart - ${formatMoney(product.price)}
      </button>
      <button class="btn btn-outline btn-full modal-buy-btn" type="button" data-action="modal-buy" data-product-id="${product.id}">
        Buy Now
      </button>
      <div class="modal-desc">
        <p>${product.description}</p>
      </div>
    </div>
  `;

  elements.modalOverlay.classList.add('open');
  elements.productModal.classList.add('open');
  syncBodyLock();
}

function closeProductModal() {
  elements.modalOverlay.classList.remove('open');
  elements.productModal.classList.remove('open');
  syncBodyLock();
}

function openCart() {
  elements.cartOverlay.classList.add('open');
  elements.cartDrawer.classList.add('open');
  syncBodyLock();
}

function closeCart() {
  elements.cartOverlay.classList.remove('open');
  elements.cartDrawer.classList.remove('open');
  syncBodyLock();
}

function openCheckout() {
  if (!state.cart.length) {
    showToast('Your cart is empty. Add products before testing the payment flow.');
    return;
  }

  closeCart();
  renderCheckoutSummary();
  elements.checkoutOverlay.classList.add('open');
  elements.checkoutModal.classList.add('open');
  elements.checkoutModal.setAttribute('aria-hidden', 'false');
  syncBodyLock();
}

function closeCheckout() {
  elements.checkoutOverlay.classList.remove('open');
  elements.checkoutModal.classList.remove('open');
  elements.checkoutModal.setAttribute('aria-hidden', 'true');
  syncBodyLock();
}

function addToCart(productId, size) {
  const product = findProduct(productId);
  if (!product) {
    return;
  }

  const itemSize = size || getSelectedSize(productId);
  const existing = state.cart.find((item) => item.productId === productId && item.size === itemSize);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      productId,
      size: itemSize,
      quantity: 1,
    });
  }

  persistCart();
  renderCart();
  renderCheckoutSummary();
  showToast(`${product.name} added to cart.`);
}

function updateCartQuantity(productId, size, change) {
  const item = state.cart.find((entry) => entry.productId === productId && entry.size === size);
  if (!item) {
    return;
  }

  item.quantity += change;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => !(entry.productId === productId && entry.size === size));
  }

  persistCart();
  renderCart();
  renderCheckoutSummary();
}

function removeFromCart(productId, size) {
  const product = findProduct(productId);
  state.cart = state.cart.filter((item) => !(item.productId === productId && item.size === size));
  persistCart();
  renderCart();
  renderCheckoutSummary();
  if (product) {
    showToast(`${product.name} removed from cart.`);
  }
}

function renderCart() {
  const totals = getCartTotals();
  const hasItems = state.cart.length > 0;

  elements.cartCount.textContent = String(totals.count);
  elements.cartCount.classList.toggle('visible', totals.count > 0);
  elements.cartItemCount.textContent = String(totals.count);
  elements.cartSubtotal.textContent = formatMoney(totals.subtotal);
  elements.cartFooter.classList.toggle('visible', hasItems);

  if (!hasItems) {
    elements.cartItems.innerHTML = `
      <div class="empty-cart" id="empty-cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <p>Your cart is empty</p>
        <button class="btn btn-black" id="continue-shopping-btn-inline" type="button">Continue Shopping</button>
      </div>
    `;

    document.getElementById('continue-shopping-btn-inline')?.addEventListener('click', closeCart);
    return;
  }

  elements.cartItems.innerHTML = state.cart
    .map((item) => {
      const product = findProduct(item.productId);
      if (!product) {
        return '';
      }

      return `
        <div class="cart-item">
          <div class="cart-item-img">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="cart-item-info">
            <h4 class="cart-item-name">${product.name}</h4>
            <p class="cart-item-sub">${product.subtitle} / Size ${item.size}</p>
            <div class="cart-item-controls">
              <div class="qty-controls">
                <button class="qty-btn" type="button" data-cart-action="decrease" data-product-id="${product.id}" data-size="${item.size}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" type="button" data-cart-action="increase" data-product-id="${product.id}" data-size="${item.size}">+</button>
              </div>
              <span class="cart-item-price">${formatMoney(product.price * item.quantity)}</span>
            </div>
            <button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}" data-size="${item.size}">Remove</button>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderCheckoutSummary() {
  const totals = getCartTotals();

  elements.checkoutItems.innerHTML = state.cart.length
    ? state.cart
        .map((item) => {
          const product = findProduct(item.productId);
          if (!product) {
            return '';
          }

          return `
            <div class="checkout-item">
              <img src="${product.image}" alt="${product.name}" />
              <div>
                <h5>${product.name}</h5>
                <p>${item.quantity} x ${formatMoney(product.price)} / Size ${item.size}</p>
              </div>
              <strong>${formatMoney(product.price * item.quantity)}</strong>
            </div>
          `;
        })
        .join('')
    : `<div class="checkout-empty">Your order summary will appear here after you add products.</div>`;

  elements.checkoutSubtotal.textContent = formatMoney(totals.subtotal);
  elements.checkoutShipping.textContent = totals.shipping === 0 ? 'Free' : formatMoney(totals.shipping);
  elements.checkoutTotal.textContent = formatMoney(totals.total);
}

function setFilter(filter) {
  state.activeFilter = filter;
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
}

function getVisibleProducts() {
  return products.filter((product) => {
    if (state.activeFilter === 'sale' && !product.originalPrice) {
      return false;
    }

    if (state.activeFilter !== 'all' && state.activeFilter !== 'sale' && product.category !== state.activeFilter) {
      return false;
    }

    return matchesSearch(product);
  });
}

function matchesSearch(product) {
  if (!state.searchTerm) {
    return true;
  }

  const haystack = [product.name, product.subtitle, product.category, product.collection, product.description]
    .join(' ')
    .toLowerCase();
  return haystack.includes(state.searchTerm);
}

function toggleWishlist(productId) {
  if (state.wishlist.includes(productId)) {
    state.wishlist = state.wishlist.filter((id) => id !== productId);
    showToast('Removed from wishlist.');
  } else {
    state.wishlist.push(productId);
    showToast('Saved to wishlist.');
  }

  writeStorage(STORAGE_KEYS.wishlist, state.wishlist);
  renderProducts();
  renderArrivals();
}

async function openPaymentMethodSelector() {
  const totals = getCartTotals();
  const amount = Number(totals.total.toFixed(2));
  const companyId = getCompanyId();
  const email = state.checkoutForm.email.trim().toLowerCase();
  let selectorUrl = `${GATEWAY_BASE}/site/pay?amount=${encodeURIComponent(amount)}&currency=INR`;

  if (companyId) {
    selectorUrl += `&companyId=${encodeURIComponent(companyId)}`;
  }

  try {
    const userKey = await hashString(email);
    if (userKey) {
      selectorUrl += `&userKey=${encodeURIComponent(userKey)}`;
    }
  } catch (error) {
    console.warn('Unable to hash selector user key.', error);
  }

  elements.fallbackMethods.hidden = true;
  elements.methodIframe.hidden = false;
  elements.methodIframe.src = selectorUrl;
  elements.methodOverlay.classList.add('open');
  syncBodyLock();

  ensurePaymentSdk().catch(() => {
    showFallbackMethods();
  });
}

function closePaymentMethodSelector() {
  elements.methodOverlay.classList.remove('open');
  elements.methodIframe.src = 'about:blank';
  elements.methodIframe.hidden = false;
  elements.fallbackMethods.hidden = true;
  syncBodyLock();
}

function showFallbackMethods() {
  elements.methodIframe.hidden = true;
  elements.fallbackMethods.hidden = false;
  updateGatewayState(false, 'Selector loaded. Final gateway launch will start as soon as the payment SDK is ready.');
}

async function launchPayment(method) {
  const totals = getCartTotals();
  const [firstName, ...rest] = state.checkoutForm.fullName.trim().split(/\s+/);
  const normalizedMethod = normalizePaymentMethod(method);

  showStatus({
    mode: 'loading',
    title: 'Processing payment...',
    subtitle: `Preparing ${normalizedMethod.replace(/_/g, ' ')} payment for INR ${totals.total.toFixed(2)}.`,
  });

  try {
    const paymentNetwork = await ensurePaymentSdk();

    paymentNetwork.open({
      amount: Number(totals.total.toFixed(2)),
      currency: 'INR',
      paymentMethod: normalizedMethod,
      customer: {
        first_name: firstName || 'Guest',
        last_name: rest.join(' ') || 'Customer',
        email: state.checkoutForm.email.trim(),
        phone: state.checkoutForm.phone.trim(),
      },
      returnUrl: window.location.href,
      onSuccess: (transaction) => {
        handlePaymentSuccess(transaction);
      },
      onFailure: (error) => {
        handlePaymentFailure(error);
      },
      onCancel: () => {
        hideStatus();
        showToast('Payment was cancelled.');
      },
      onStatusUpdate: (update) => {
        showStatus({
          mode: 'loading',
          title: update?.message || 'Processing payment...',
          subtitle: 'The gateway is responding. Please keep this tab open.',
        });
      },
      onFailover: (info) => {
        showStatus({
          mode: 'loading',
          title: `Switching gateway (${info?.attempt || 1}/${info?.max || 1})...`,
          subtitle: 'Automatic failover is running so you can verify the integration safely.',
        });
      },
    });
  } catch (error) {
    handlePaymentFailure({ reason: buildGatewayErrorMessage(error) });
  }
}

function handlePaymentSuccess(transaction) {
  const transactionId = transaction?.id || transaction?.txnId || 'Unknown';

  state.cart = [];
  persistCart();
  renderCart();
  renderCheckoutSummary();
  closeCheckout();

  showStatus({
    mode: 'success',
    title: 'Payment successful',
    subtitle: `Transaction ID: ${transactionId}. Your storefront can now be used to verify gateway callbacks and UI flow.`,
    actions: [
      { label: 'Close', action: hideStatus, style: 'btn btn-black' },
      {
        label: 'Start Another Test',
        action: () => {
          hideStatus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        style: 'btn btn-outline',
      },
    ],
  });

  showToast(`Payment successful. Transaction: ${transactionId}`);
}

function handlePaymentFailure(error) {
  showStatus({
    mode: 'failure',
    title: 'Payment failed',
    subtitle: error?.reason || 'The gateway returned an error during the test attempt.',
    actions: [
      { label: 'Try Again', action: () => hideStatus(), style: 'btn btn-black' },
      { label: 'Close', action: hideStatus, style: 'btn btn-outline' },
    ],
  });

  showToast('Payment failed. Check the gateway response and try again.');
}

function handleReturnedTransaction() {
  const params = new URLSearchParams(window.location.search);
  const txnId = params.get('txnId');
  if (!txnId) {
    return;
  }

  const pollStatus = async () => {
    showStatus({
      mode: 'loading',
      title: 'Checking payment status...',
      subtitle: `Verifying transaction ${txnId}.`,
    });

    try {
      const paymentNetwork = await ensurePaymentSdk();
      paymentNetwork.pollStatus(
      txnId,
      (transaction) => {
        cleanupTransactionParam();
        handlePaymentSuccess(transaction);
      },
      (error) => {
        cleanupTransactionParam();
        handlePaymentFailure({
          reason: typeof error === 'string' ? error : error?.reason || 'Status check failed.',
        });
      },
      );
    } catch (error) {
      cleanupTransactionParam();
      handlePaymentFailure({ reason: buildGatewayErrorMessage(error) });
    }
  };

  pollStatus();
}

function cleanupTransactionParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete('txnId');
  window.history.replaceState({}, '', url);
}

function showStatus({ mode, title, subtitle, actions = [] }) {
  elements.statusOverlay.classList.add('open');
  elements.statusCard.dataset.mode = mode;
  elements.statusText.textContent = title;
  elements.statusSubtext.textContent = subtitle;
  elements.statusSpinner.hidden = mode !== 'loading';
  elements.statusActions.innerHTML = '';

  actions.forEach((actionConfig) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = actionConfig.style;
    button.textContent = actionConfig.label;
    button.addEventListener('click', actionConfig.action);
    elements.statusActions.appendChild(button);
  });

  syncBodyLock();
}

function hideStatus() {
  elements.statusOverlay.classList.remove('open');
  elements.statusActions.innerHTML = '';
  syncBodyLock();
}

function validateCheckout() {
  if (!elements.checkoutForm.reportValidity()) {
    return false;
  }

  if (!state.checkoutForm.fullName.trim().split(/\s+/)[0]) {
    showToast('Please enter your full name before proceeding.');
    return false;
  }

  if (!state.checkoutForm.email.trim()) {
    showToast('Please enter your email before proceeding.');
    return false;
  }

  return true;
}

function hydrateCheckoutForm() {
  Object.entries(state.checkoutForm).forEach(([key, value]) => {
    const input = elements.checkoutForm?.querySelector(`[name="${key}"]`);
    if (input) {
      input.value = value;
    }
  });
}

function updateGatewayState(ready = Boolean(window.PaymentNetwork), message) {
  if (!elements.gatewayState) {
    return;
  }

  elements.gatewayState.classList.remove('ready', 'error');

  if (ready) {
    elements.gatewayState.textContent = 'Payment gateway connected. Checkout is ready for live integration testing.';
    elements.gatewayState.classList.add('ready');
    return;
  }

  const nextMessage = message || 'Connecting to payment gateway...';
  elements.gatewayState.textContent = nextMessage;
  if (/failed|error|localhost|unavailable|authorized/i.test(nextMessage)) {
    elements.gatewayState.classList.add('error');
  }
}

function initHeroSlider() {
  if (!elements.heroSlides.length) {
    return;
  }

  const goToSlide = (index) => {
    state.heroIndex = (index + elements.heroSlides.length) % elements.heroSlides.length;
    elements.heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === state.heroIndex);
    });
    elements.heroDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === state.heroIndex);
    });
  };

  const queueAutoPlay = () => {
    window.clearInterval(state.heroTimer);
    state.heroTimer = window.setInterval(() => {
      goToSlide(state.heroIndex + 1);
    }, 5000);
  };

  elements.heroPrev?.addEventListener('click', () => {
    goToSlide(state.heroIndex - 1);
    queueAutoPlay();
  });

  elements.heroNext?.addEventListener('click', () => {
    goToSlide(state.heroIndex + 1);
    queueAutoPlay();
  });

  elements.heroDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(Number(dot.dataset.index || 0));
      queueAutoPlay();
    });
  });

  queueAutoPlay();
}

function openSearch() {
  elements.searchBar?.classList.add('open');
  window.setTimeout(() => elements.searchInput?.focus(), 150);
}

function closeSearch() {
  elements.searchBar?.classList.remove('open');
}

function syncBodyLock() {
  const shouldLock = [
    elements.cartDrawer?.classList.contains('open'),
    elements.productModal?.classList.contains('open'),
    elements.checkoutModal?.classList.contains('open'),
    elements.methodOverlay?.classList.contains('open'),
    elements.statusOverlay?.classList.contains('open'),
    elements.mainNav?.classList.contains('open') && window.innerWidth <= 768,
  ].some(Boolean);

  document.body.style.overflow = shouldLock ? 'hidden' : '';
}

function getSelectedSize(productId) {
  const product = findProduct(productId);
  if (!product) {
    return '';
  }

  if (!state.selectedSizes[productId]) {
    state.selectedSizes[productId] = product.sizes[0];
  }

  return state.selectedSizes[productId];
}

function getCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => {
    const product = findProduct(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 9.99;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    count,
  };
}

function findProduct(productId) {
  return products.find((product) => product.id === productId);
}

function persistCart() {
  writeStorage(STORAGE_KEYS.cart, state.cart);
}

function showToast(message) {
  if (!elements.toast) {
    return;
  }

  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.clearTimeout(state.statusTimer);
  state.statusTimer = window.setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2400);
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
}

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Unable to read storage key: ${key}`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to write storage key: ${key}`, error);
  }
}

async function hashString(value) {
  if (!value || !window.crypto?.subtle) {
    return '';
  }

  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
