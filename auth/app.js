// app.js

function format(n){ return `ZMW ${n.toFixed(2)}`; }

// Try alternate filenames when an image fails to load.
window.handleImgError = function(imgEl, origPath){
  if (!imgEl || imgEl._tried) return imgEl && (imgEl.src = 'assets/hero-banner.jpg');
  imgEl._tried = imgEl._tried || 0;

  const parts = origPath.split('/');
  const filename = parts.pop();
  const dir = parts.join('/') + '/';

  // attempt strategy list
  const tries = [];
  // 1) insert hyphen before first digit group: iphone12.jpg -> iphone-12.jpg
  tries.push(filename.replace(/([a-zA-Z]+)(\d+)/, '$1-$2'));
  // 2) remove hyphens: iphone-12.jpg -> iphone12.jpg
  tries.push(filename.replace(/-/g,''));
  // 3) lowercased
  tries.push(filename.toLowerCase());
  // 4) try removing 'mini' / 'pro' suffixes
  tries.push(filename.replace(/mini/i, ''));
  tries.push(filename.replace(/promax/i, 'promax'));

  // pick next try
  const next = tries[imgEl._tried] || 'hero-banner.jpg';
  imgEl._tried += 1;
  const nextPath = next === 'hero-banner.jpg' ? 'assets/hero-banner.jpg' : dir + next;
  imgEl.src = nextPath;
};

// ---------- Product catalogs ----------
const phoneProducts = [
  { id:'ip8', brand:'apple', title:'iPhone 8', price: 5000, img:'assets/iphone8.jpg' },
  { id:'ip8plus', brand:'apple', title:'iPhone 8 Plus', price: 5500, img:'assets/iphone8plus.jpg' },
  { id:'ipx', brand:'apple', title:'iPhone X', price: 6000, img:'assets/iphonex.jpg' },
  { id:'ipxs', brand:'apple', title:'iPhone XS', price: 6500, img:'assets/iphonexs.jpg' },
  { id:'ipxsmax', brand:'apple', title:'iPhone XS Max', price: 7000, img:'assets/iphonexsmax.jpg' },
  { id:'ipxr', brand:'apple', title:'iPhone XR', price: 6200, img:'assets/iphonexr.jpg' },
  { id:'ip11', brand:'apple', title:'iPhone 11', price: 7000, img:'assets/iphone11.jpg' },
  { id:'ip11pro', brand:'apple', title:'iPhone 11 Pro', price: 8000, img:'assets/iphone11pro.jpg' },
  { id:'ip11promax', brand:'apple', title:'iPhone 11 Pro Max', price: 9000, img:'assets/iphone11promax.jpg' },
  { id:'ip12', brand:'apple', title:'iPhone 12', price: 9500, img:'assets/iphone-12.jpg' },
  { id:'ip12mini', brand:'apple', title:'iPhone 12 Mini', price: 8800, img:'assets/iphone-12.jpg' },
  { id:'ip12pro', brand:'apple', title:'iPhone 12 Pro', price: 10500, img:'assets/iphone12pro.jpg' },
  { id:'ip12promax', brand:'apple', title:'iPhone 12 Pro Max', price: 11500, img:'assets/iphone12promax.jpg' },
  { id:'ip13', brand:'apple', title:'iPhone 13', price: 10000, img:'assets/iphone13.jpg' },
  { id:'ip13mini', brand:'apple', title:'iPhone 13 Mini', price: 9200, img:'assets/iphone13.jpg' },
  { id:'ip13pro', brand:'apple', title:'iPhone 13 Pro', price: 11000, img:'assets/iphone13pro.jpg' },
  { id:'ip13promax', brand:'apple', title:'iPhone 13 Pro Max', price: 12000, img:'assets/iphone13promax.jpg' },
  { id:'ip14', brand:'apple', title:'iPhone 14', price: 11500, img:'assets/iphone14.jpg' },
  { id:'ip14plus', brand:'apple', title:'iPhone 14 Plus', price: 12500, img:'assets/iphone14.jpg' },
  { id:'ip14pro', brand:'apple', title:'iPhone 14 Pro', price: 13500, img:'assets/iphone14pro.jpg' },
  { id:'ip14promax', brand:'apple', title:'iPhone 14 Pro Max', price: 14500, img:'assets/iphone14promax.jpg' },
  { id:'ip15', brand:'apple', title:'iPhone 15', price: 12000, img:'assets/iphone15.jpg' },
  { id:'ip15plus', brand:'apple', title:'iPhone 15 Plus', price: 13000, img:'assets/iphone15.jpg' },
  { id:'ip15pro', brand:'apple', title:'iPhone 15 Pro', price: 14000, img:'assets/iphone15pro.jpg' },
  { id:'ip15promax', brand:'apple', title:'iPhone 15 Pro Max', price: 15000, img:'assets/iphone15pro.jpg' },
  { id:'ip16', brand:'apple', title:'iPhone 16', price: 12500, img:'assets/iphone16plus.jpg' },
  { id:'ip16plus', brand:'apple', title:'iPhone 16 Plus', price: 13500, img:'assets/iphone16plus.jpg' },
  { id:'ip16pro', brand:'apple', title:'iPhone 16 Pro', price: 14500, img:'assets/iphone16pro.jpg' },
  { id:'ip16promax', brand:'apple', title:'iPhone 16 Pro Max', price: 15500, img:'assets/iphone16promax.jpg' },
  { id:'ip17', brand:'apple', title:'iPhone 17', price: 13000, img:'assets/iphone17.jpg' },
  { id:'ip17pro', brand:'apple', title:'iPhone 17 Pro', price: 15000, img:'assets/iphone17pro.jpg' },
  { id:'ip17promax', brand:'apple', title:'iPhone 17 Pro Max', price: 16000, img:'assets/iphone17promax.jpg' },
];

// Stanley Cup with multiple color variants
const stanleyProducts = [
  {
    id:'stanley40',
    brand:'stanley',
    title:'Stanley Cup 40oz',
    price: 650,
    variants: [
      { color:'Black', img:'assets/stanley-black.jpg' },
      { color:'orange', img:'assets/stanley-orange.jpg' },
      { color:'Green', img:'assets/stanley-green.jpg' },
      { color:'Pink', img:'assets/stanley-pink.jpg' },
      { color:'purple', img:'assets/stanley-purple.jpg' },
      { color:'Gray', img:'assets/stanley-gray.jpg' },
    ]
  }
];

const clothingProducts = [
  { id:'shirt1', brand:'clothing&Shoes', title:'Prime Preview T‑Shirt', price: 1000, img:'assets/asics.jpg' },
  { id:'hoodie1', brand:'clothing&Shoes', title:'Prime Hoodie', price: 1000, img:'assets/TN.jpg' },
];

const accessoriesProducts = [
  { id:'case1', brand:'accessory', title:'iPhone 14 Case', price: 150, img:'assets/1.jpg' },
  { id:'charger1', brand:'accessory', title:'Fast Charger', price: 500, img:'assets/dd.png' },
];

const jewelryProducts = [
  { id:'necklace1', brand:'jewelry', title:'Gold Necklace', price: 2000, img:'assets/1.jpg' },
  { id:'ring1', brand:'jewelry', title:'Silver Ring', price: 1200, img:'assets/1.jpg' },
];

// ---------- State ----------
const state = { cart: {}, filter: 'all' };

// Ensure an image modal exists on the page (inject for pages that don't include it)
if (!document.getElementById('imageModal')) {
  const modalHtml = `
  <div class="modal" id="imageModal" data-modal hidden>
    <div class="modal-content">
      <button id="closeModal" class="modal-close">✕</button>
      <div class="modal-body" style="text-align:center;">
        <img id="modalImage" src="" alt="" style="max-width:90vw;max-height:90vh;transform:scale(1);transition:transform .12s;cursor:zoom-in">
      </div>
      <div class="modal-actions" style="display:flex;gap:.5rem;justify-content:center;padding:.5rem 0;">
        <button id="zoomOut" class="btn">−</button>
        <button id="resetZoom" class="btn">Reset</button>
        <button id="zoomIn" class="btn">+</button>
      </div>
    </div>
  </div>`;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper.firstElementChild);
}

const els = {
  grid: document.getElementById('productGrid'),
  count: document.querySelector('[data-cart-count]'),
  drawer: document.querySelector('[data-cart-drawer]'),
  items: document.querySelector('[data-cart-items]'),
  itemsPage: document.querySelector('[data-cart-items-page]'),
  subtotal: document.querySelector('[data-cart-subtotal]'),
  tax: document.querySelector('[data-cart-tax]'),
  total: document.querySelector('[data-cart-total]'),
  scrim: document.querySelector('[data-scrim]'),
  modal: document.getElementById('imageModal'),
  modalImage: document.getElementById('modalImage'),
  closeModalBtn: document.getElementById('closeModal'),
  checkoutBtn: document.getElementById('checkout-btn'),
};

// Inject account details modal if missing
if (!document.getElementById('accountModal')) {
  const accHtml = `
  <div class="modal" id="accountModal" data-modal hidden>
    <div class="modal-content" style="max-width:520px;padding:16px;background:var(--surface);border-radius:12px;">
      <button id="closeAccountModal" class="modal-close">✕</button>
      <h3 style="margin-top:0;">Account Details</h3>
      <div id="accountDetails" style="color:var(--text);font-size:0.95rem;line-height:1.4"></div>
      <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end;">
        <a href="auth.html" class="btn btn-secondary">Manage Account</a>
        <button id="signOutBtn" class="btn btn-danger">Sign Out</button>
      </div>
    </div>
  </div>`;
  const w = document.createElement('div'); w.innerHTML = accHtml; document.body.appendChild(w.firstElementChild);
}

function getStoredProfile() {
  const cur = localStorage.getItem('currentUser');
  let profile = cur ? JSON.parse(cur) : null;
  try {
    const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
    if (profile && cache[profile.uid]) {
      profile = { ...profile, ...cache[profile.uid] };
    } else if (profile && profile.email) {
      const found = Object.values(cache).find(u => u && u.email === profile.email);
      if (found) profile = { ...profile, ...found };
    }
    // If no currentUser but a single cached profile exists, use it as a fallback (dev convenience)
    if (!profile) {
      const keys = Object.keys(cache || {});
      if (keys.length === 1) {
        const only = cache[keys[0]];
        profile = { uid: only.uid || keys[0], email: only.email, name: only.firstname || only.businessname || only.name || '', ...only };
        console.info('Using sole users-cache entry as profile fallback');
      }
    }
  } catch (e) {
    console.warn('users-cache read failed', e);
  }
  return profile;
}

function showAccountModal() {
  const modal = document.getElementById('accountModal');
  const details = document.getElementById('accountDetails');
  const profile = getStoredProfile();
  if (!modal || !details) return;
  if (!profile) {
    details.innerHTML = `<p class="muted">Not signed in. <a href="auth.html">Sign in</a> or create an account.</p>`;
  } else {
    details.innerHTML = `
      <p><strong>Name:</strong> ${profile.firstname || profile.businessname || profile.name || ''}</p>
      <p><strong>Email:</strong> ${profile.email || ''}</p>
      <p><strong>Phone:</strong> ${profile.phone || profile.businessphone || ''}</p>
      <p><strong>Address:</strong> ${profile.address || profile.businessaddress || (profile.province ? profile.province + (profile.district ? ', ' + profile.district : '') : '')}</p>
      <p><strong>Role:</strong> ${profile.role || profile.userRole || ''}</p>
    `;
  }
  modal.removeAttribute('hidden'); document.body.style.overflow = 'hidden';
}

function closeAccountModal() {
  const modal = document.getElementById('accountModal'); if (!modal) return; modal.setAttribute('hidden', ''); document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {
  const t = e.target;
  // Intercept Account links (commonly linking to auth/index2.html or having data-account)
  const a = t.closest('a');
  if (a && (a.getAttribute('href') || '').includes('auth/index2.html') || t.closest('[data-account]')) {
    e.preventDefault(); showAccountModal(); return;
  }
  if (t.id === 'closeAccountModal') closeAccountModal();
  if (t.id === 'signOutBtn') { localStorage.removeItem('currentUser'); closeAccountModal(); window.location.href = 'auth.html'; }
});

// Load cart from localStorage
function loadCart() {
  const saved = localStorage.getItem('cart');
  if (saved) state.cart = JSON.parse(saved);
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

// ---------- Render products ----------
function renderProducts(){
  if (!els.grid) return;

  const category = document.body.getAttribute('data-category') || 'phones';

  let list = [];
  if (category === 'phones') list = phoneProducts;
  if (category === 'stanley') list = stanleyProducts;
  if (category === 'clothing') list = clothingProducts;
  if (category === 'accessories') list = accessoriesProducts;
  if (category === 'jewelry') list = jewelryProducts;

  els.grid.innerHTML = list.map(p => {
    // Special handling for Stanley Cup with variants
    if (p.variants) {
      return `
        <article class="product-card" data-id="${p.id}">
          <div class="product-media clickable-image" data-img="${p.variants[0].img}" style="cursor:pointer"><img src="${p.variants[0].img}" alt="${p.title}" onerror="handleImgError(this,'${p.variants[0].img}')" style="cursor:pointer"></div>
          <div class="product-meta">
            <div class="product-title">${p.title}</div>
            <div class="price">${format(p.price)}</div>
          </div>
          <label class="muted">Choose color:</label>
          <select data-color="${p.id}">
            ${p.variants.map(v => `<option value="${v.color}" data-img="${v.img}">${v.color}</option>`).join('')}
          </select>
          <button class="btn btn-primary" data-add="${p.id}">Add to cart</button>
        </article>
      `;
    }

    // Normal products
    return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-media clickable-image" data-img="${p.img}" style="cursor:pointer"><img src="${p.img}" alt="${p.title}" onerror="handleImgError(this,'${p.img}')" style="cursor:pointer"></div>
        <div class="product-meta">
          <div class="product-title">${p.title}</div>
          <div class="price">${format(p.price)}</div>
        </div>
        <button class="btn btn-primary" data-add="${p.id}">Add to cart</button>
      </article>
    `;
  }).join('');
}

// ---------- Render cart (drawer version) ----------
function renderCart(){
  if (!els.items) return;
  
  const entries = Object.values(state.cart);
  els.items.innerHTML = entries.length ? entries.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.title}" class="clickable-image" data-img="${item.img}" onerror="handleImgError(this,'${item.img}')">
      <div class="cart-item-content">
        <strong>${item.title}</strong>
        ${item.color ? `<div class="muted">Color: ${item.color}</div>` : ''}
        <div class="muted">${format(item.price)} × ${item.qty}</div>
      </div>
      <div><strong>${format(item.price * item.qty)}</strong></div>
    </div>
  `).join('') : `<p class="muted">Your cart is empty.</p>`;

  updateCartTotals();
}

// ---------- Render cart page (full page version) ----------
function renderCartPage(){
  if (!els.itemsPage) return;
  
  const entries = Object.values(state.cart);
  
  if (entries.length === 0) {
    els.itemsPage.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty.</p>
        <a href="phones.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;
    if (els.checkoutBtn) els.checkoutBtn.disabled = true;
    return;
  }

  els.itemsPage.innerHTML = `
    <div class="cart-items-table">
      <div class="cart-header">
        <div>Product</div>
        <div>Price</div>
        <div>Qty</div>
        <div>Total</div>
        <div>Action</div>
      </div>
      ${entries.map(item => `
        <div class="cart-row" data-item-id="${item.id}">
            <div class="cart-product">
            <img src="${item.img}" alt="${item.title}" class="clickable-image" data-img="${item.img}" onerror="handleImgError(this,'${item.img}')">
            <div>
              <div class="product-name">${item.title}</div>
              ${item.color ? `<div class="muted">Color: ${item.color}</div>` : ''}
            </div>
          </div>
          <div>${format(item.price)}</div>
          <div class="qty-control">
            <button class="qty-btn" data-remove="${item.id}">−</button>
            <input type="number" class="qty-input" value="${item.qty}" data-qty="${item.id}" min="1">
            <button class="qty-btn" data-add-qty="${item.id}">+</button>
          </div>
          <div><strong>${format(item.price * item.qty)}</strong></div>
          <div>
            <button class="btn btn-small btn-danger" data-delete="${item.id}">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  updateCartTotals();
  
  if (els.checkoutBtn) els.checkoutBtn.disabled = entries.length === 0;
}

// ---------- Update cart totals ----------
function updateCartTotals(){
  const entries = Object.values(state.cart);
  const subtotal = entries.reduce((a, c) => a + c.qty * c.price, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (els.count) {
    const totalQty = entries.reduce((a, c) => a + c.qty, 0);
    els.count.textContent = totalQty;
  }

  if (els.subtotal) els.subtotal.textContent = format(subtotal);
  if (els.tax) els.tax.textContent = format(tax);
  if (els.total) els.total.textContent = format(total);
}

// ---------- Image Modal ----------
function openImageModal(imgSrc) {
  if (els.modal) {
    // reset zoom state
    els.modalImage.style.transform = 'scale(1)';
    els.modalImage.dataset.scale = 1;
    els.modalImage.src = imgSrc;
    // keep modal image within viewport
    els.modalImage.style.maxWidth = '90vw';
    els.modalImage.style.maxHeight = '90vh';
    els.modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeImageModal() {
  if (els.modal) {
    els.modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    // remove image-active state from any product cards
    document.querySelectorAll('.product-card.image-active').forEach(c => c.classList.remove('image-active'));
  }
}

// Image zoom helpers
function setImageScale(imgEl, scale) {
  scale = Math.max(0.5, Math.min(4, scale));
  imgEl.style.transform = `scale(${scale})`;
  imgEl.dataset.scale = scale;
}

// Wire zoom controls when modal exists
document.addEventListener('DOMContentLoaded', () => {
  const img = document.getElementById('modalImage');
  const modal = document.getElementById('imageModal');
  if (!img || !modal) return;

  // Wheel to zoom
  img.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const cur = parseFloat(img.dataset.scale || '1');
    const delta = ev.deltaY < 0 ? 0.1 : -0.1;
    setImageScale(img, cur + delta);
  }, { passive: false });

  // Buttons
  const zin = document.getElementById('zoomIn');
  const zout = document.getElementById('zoomOut');
  const rset = document.getElementById('resetZoom');
  zin && zin.addEventListener('click', () => setImageScale(img, parseFloat(img.dataset.scale || '1') + 0.2));
  zout && zout.addEventListener('click', () => setImageScale(img, parseFloat(img.dataset.scale || '1') - 0.2));
  rset && rset.addEventListener('click', () => setImageScale(img, 1));

  // Double-click to toggle reset/2x
  img.addEventListener('dblclick', () => {
    const cur = parseFloat(img.dataset.scale || '1');
    setImageScale(img, cur > 1.5 ? 1 : 2);
  });
});

// ---------- Drawer ----------
function openCart(open=true){
  if (!els.drawer) return;
  els.drawer.classList.toggle('is-open', open);
  els.drawer.setAttribute('aria-hidden', (!open).toString());
  if (els.scrim) els.scrim.hidden = !open;
}

// ---------- Events ----------
document.addEventListener('click', e => {
  const t = e.target;

  // Cart toggle
  if(t.matches('[data-cart-toggle]')) openCart(!els.drawer?.classList.contains('is-open'));

  // Image modal click
  if(t.closest('.clickable-image')) {
    const container = t.closest('.clickable-image');
    const imgSrc = container.dataset.img;

    // Clear previous active states and mark this card active
    document.querySelectorAll('.product-card.image-active').forEach(c => c.classList.remove('image-active'));
    const card = container.closest('.product-card');
    if (card) card.classList.add('image-active');

    openImageModal(imgSrc);
  }

  // Modal close button
  if(t.id === 'closeModal') closeImageModal();

  // Close modal on scrim click
  if(t.id === 'imageModal') closeImageModal();

  // Add to cart
  if(t.matches('[data-add]')){
    const id = t.getAttribute('data-add');
    const allProducts = [...phoneProducts, ...stanleyProducts, ...clothingProducts, ...accessoriesProducts, ...jewelryProducts];
    const p = allProducts.find(x=>x.id===id);

    // Determine chosen color / image for variants (Stanley cup)
    let chosenColor = null, chosenImg = (p && p.img) || '';
    const select = document.querySelector(`select[data-color="${id}"]`);
    if (select) {
      chosenColor = select.value;
      chosenImg = select.selectedOptions[0].dataset.img;
    }

    // Use a composite cart key for variant-specific items so each color is separate
    const cartKey = chosenColor ? `${id}::${chosenColor}` : id;

    if (!state.cart[cartKey]) {
      // Create a new cart entry tailored for the variant or normal product
      const item = {
        id: cartKey,
        originalId: p.id,
        title: p.title + (chosenColor ? ` — ${chosenColor}` : ''),
        price: p.price,
        qty: 0,
        img: chosenImg || p.img || '',
        color: chosenColor || null
      };
      state.cart[cartKey] = item;
    }

    state.cart[cartKey].qty++;

    saveCart();
    renderProducts();
    renderCart();
    renderCartPage();
    openCart(true);
  }

  // Remove item from cart
  if(t.matches('[data-delete]')){
    const id = t.getAttribute('data-delete');
    delete state.cart[id];
    saveCart();
    renderCart();
    renderCartPage();
  }

  // Add quantity
  if(t.matches('[data-add-qty]')){
    const id = t.getAttribute('data-add-qty');
    if(state.cart[id]) {
      state.cart[id].qty++;
      saveCart();
      renderCart();
      renderCartPage();
    }
  }

  // Remove quantity
  if(t.matches('[data-remove]')){
    const id = t.getAttribute('data-remove');
    if(state.cart[id]) {
      state.cart[id].qty--;
      if(state.cart[id].qty <= 0) delete state.cart[id];
      saveCart();
      renderCart();
      renderCartPage();
    }
  }

  // Checkout
  if(t.id === 'checkout-btn'){
    const entries = Object.values(state.cart);
    if(entries.length > 0) {
      window.location.href = 'checkout.html';
    }
  }
});

// Close modal when clicking outside modal-content (extra guard)
document.addEventListener('click', (e) => {
  const modal = document.getElementById('imageModal');
  if (!modal || modal.hasAttribute('hidden')) return;
  const content = modal.querySelector('.modal-content');
  if (e.target === modal) return closeImageModal();
  if (content && !content.contains(e.target) && modal.contains(e.target)) closeImageModal();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeImageModal();
});

// ---------- Handle quantity input change ----------
document.addEventListener('change', e => {
  const input = e.target.closest('input[data-qty]');
  if(input) {
    const id = input.getAttribute('data-qty');
    const qty = parseInt(input.value);
    if(qty > 0) {
      state.cart[id].qty = qty;
      saveCart();
      renderCart();
      renderCartPage();
    }
  }

  // Color selection
  const select = e.target.closest('select[data-color]');
  if(select){
    const id = select.getAttribute('data-color');
    const chosenImg = select.selectedOptions[0].dataset.img;

    const card = document.querySelector(`article[data-id="${id}"]`);
    if (card) {
      const container = card.querySelector('.product-media');
      const imgEl = card.querySelector('.product-media img');
      // update both the container dataset and the img src so modal and UI use the selected color
      if (container) container.dataset.img = chosenImg;
      if (imgEl) {
        imgEl.src = chosenImg;
        imgEl.dataset.img = chosenImg;
      }
    }
  }
});

// ---------- Init ----------
loadCart();
renderProducts();
renderCart();
renderCartPage();

// Header controls: ensure logo navigates home and show logout when signed in
function ensureHeaderControls() {
  // Make all brand links go to the site home
  document.querySelectorAll('.brand').forEach(b => {
    try {
      b.setAttribute('href', 'index.html');
      b.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'index.html'; });
    } catch (e) { /* ignore */ }
  });

  // Inject logout button if missing
  document.querySelectorAll('.site-header').forEach(header => {
    if (header.querySelector('#headerLogoutBtn')) return;
    const nav = header.querySelector('.nav') || header;
    const btn = document.createElement('button');
    btn.id = 'headerLogoutBtn';
    btn.className = 'btn btn-secondary';
    btn.textContent = 'Logout';
    btn.style.marginLeft = '12px';
    btn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      // update UI then redirect to auth page
      updateHeaderLogoutVisibility();
      window.location.href = 'auth.html';
    });
    // place after nav so it appears on the right
    nav && nav.parentNode ? nav.parentNode.insertBefore(btn, nav.nextSibling) : header.appendChild(btn);
  });

  updateHeaderLogoutVisibility();
}

function updateHeaderLogoutVisibility() {
  const cur = localStorage.getItem('currentUser');
  const btn = document.getElementById('headerLogoutBtn');
  if (btn) btn.style.display = cur ? 'inline-flex' : 'none';

  // Optionally show user's name next to the nav
  const existing = document.querySelector('.header-username');
  if (cur) {
    const user = JSON.parse(cur);
    if (!existing) {
      const el = document.createElement('span');
      el.className = 'header-username';
      el.textContent = user.name || user.email || '';
      el.style.marginLeft = '8px';
      el.style.fontWeight = '600';
      // insert near nav
      const header = document.querySelector('.site-header');
      const nav = header && header.querySelector('.nav');
      if (nav && nav.parentNode) nav.parentNode.insertBefore(el, nav.nextSibling);
      else header && header.appendChild(el);
    }
  } else if (existing) {
    existing.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ensureHeaderControls();
  // update visibility if localStorage changes in another tab
  window.addEventListener('storage', () => updateHeaderLogoutVisibility());
});

