// supplier-dashboard.js

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Optional Firestore persistence for products (best-effort)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWezSfXRBRWyRMvoY88trhh8drG96n8AY",
  authDomain: "prime-market.firebaseapp.com",
  projectId: "prime-market",
  storageBucket: "prime-market.firebasestorage.app",
  messagingSenderId: "870687045642",
  appId: "1:870687045642:web:d10c2313ab71971f5307f3",
  measurementId: "G-EWLEJS331J"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn('Firestore init failed (continuing with localStorage):', e);
}

// Check authentication
function checkAuth() {
  const user = getCurrentUser();
  if (!user || user.role !== 'supplier') {
    window.location.href = 'auth.html';
  }
  return user;
}

// Update current user display
function updateUserDisplay() {
  const user = getCurrentUser();
  if (user) {
    document.getElementById('currentBusiness').textContent = `${user.name} (Supplier)`;
  }
}

// Get supplier products from localStorage
function getSupplierProducts() {
  const products = JSON.parse(localStorage.getItem('supplierProducts')) || [];
  return products;
}

// Get supplier orders
function getSupplierOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  return orders;
}

// Section navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.getAttribute('data-section');
    showSection(section);
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sectionEl = document.getElementById(`${section}-section`);
  if (sectionEl) {
    sectionEl.classList.add('active');
    document.getElementById('pageTitle').textContent = 
      document.querySelector(`[data-section="${section}"]`).textContent.trim();
    
    // Load section data
    loadSectionData(section);
  }
}

// Load section data
function loadSectionData(section) {
  switch(section) {
    case 'dashboard':
      loadDashboardData();
      import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
      import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
      break;
    case 'products':
      loadProducts();
      break;
    case 'orders':
      loadOrders();
        storage = getStorage(app);
      break;
    case 'sales':
      loadSales();
      break;
    case 'customers':
      break;
    case 'profile':
        // Try to load from Firestore if available, otherwise fallback to localStorage
        (async () => {
          let products = [];
          const current = getCurrentUser();
          if (db && current && current.uid) {
            try {
              const q = query(collection(db, 'products'), where('supplierId', '==', current.uid));
              const snap = await getDocs(q);
              products = snap.docs.map(d => ({ id: d.data().id || d.id, firestoreId: d.id, ...d.data() }));
            } catch (e) {
              console.warn('Error loading products from Firestore, using local copy', e);
              products = getSupplierProducts();
            }
          } else {
            products = getSupplierProducts();
          }

          if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No products yet. <a href="#" onclick="addProduct()">Add one now</a></td></tr>';
            return;
          }

          tbody.innerHTML = products.map(p => `
            <tr>
              <td>
                ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" style="height:48px; width:48px; object-fit:cover; margin-right:8px; vertical-align:middle;">` : ''}
                ${p.name}
              </td>
              <td>${p.category}</td>
              <td>
                ZMW ${(p.price || 0).toFixed(2)}
                ${p.deliveryFee ? `<div class="muted small">Delivery: ZMW ${Number(p.deliveryFee).toFixed(2)}</div>` : ''}
              </td>
              <td>${p.stock}</td>
              <td>${p.sales || 0}</td>
              <td>
                <button class="btn btn-small" onclick="editProduct('${p.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
              </td>
            </tr>
          `).join('');
        })();
      loadProfile();
      break;
  }
}

// Load dashboard data
function loadDashboardData() {
  const products = getSupplierProducts();
  const orders = getSupplierOrders();

  document.getElementById('totalProducts').textContent = products.length;
  document.getElementById('totalOrders').textContent = orders.length;

  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  document.getElementById('totalSales').textContent = `ZMW ${totalSales.toFixed(2)}`;

  // Load recent orders
  const recentOrders = document.getElementById('recentOrders');
  if (orders.length > 0) {
    recentOrders.innerHTML = orders.slice(-5).map(order => `
      <div class="order-item">
        <strong>${order.orderId}</strong>
        <p>ZMW ${order.total.toFixed(2)}</p>
        <small>${new Date(order.timestamp).toLocaleDateString()} - ${order.status}</small>
      </div>
    `).join('');
  }

  // Load low stock products
  const lowStockList = document.getElementById('lowStockList');
  const lowStockProducts = products.filter(p => p.stock < 10);
  if (lowStockProducts.length > 0) {
    lowStockList.innerHTML = lowStockProducts.map(p => `
      <div class="order-item">
        <strong>${p.name}</strong>
        <p>Stock: ${p.stock} units</p>
      </div>
    `).join('');
  }
}

// Load products
function loadProducts() {
  const products = getSupplierProducts();
  const tbody = document.getElementById('productsTableBody');
  
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">No products yet. <a href="#" onclick="addProduct()">Add one now</a></td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>
        ZMW ${p.price.toFixed(2)}
        ${p.deliveryFee ? `<div class="muted small">Delivery: ZMW ${Number(p.deliveryFee).toFixed(2)}</div>` : ''}
      </td>
      <td>${p.stock}</td>
      <td>${p.sales || 0}</td>
      <td>
        <button class="btn btn-small" onclick="editProduct('${p.id}')">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Load orders
function loadOrders() {
  const orders = getSupplierOrders();
  const tbody = document.getElementById('ordersTableBody');
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.orderId}</td>
      <td>${order.customer.name}</td>
      <td>${order.items.length} items</td>
      <td>ZMW ${order.total.toFixed(2)}</td>
      <td><span class="badge badge-pending">${order.status}</span></td>
      <td>${new Date(order.timestamp).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-small" onclick="viewOrder('${order.orderId}')">View</button>
      </td>
    </tr>
  `).join('');
}

// Load sales
function loadSales() {
  const orders = getSupplierOrders();
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  document.getElementById('monthSales').textContent = `ZMW ${(totalSales * 0.3).toFixed(2)}`;
  document.getElementById('weekSales').textContent = `ZMW ${(totalSales * 0.1).toFixed(2)}`;
  document.getElementById('totalAllTimeSales').textContent = `ZMW ${totalSales.toFixed(2)}`;

  const topProducts = document.getElementById('topProducts');
  const products = getSupplierProducts();
  if (products.length > 0) {
    topProducts.innerHTML = products.slice(0, 5).map(p => `
      <div class="order-item">
        <strong>${p.name}</strong>
        <p>${p.sales || 0} sales - ZMW ${((p.sales || 0) * p.price).toFixed(2)}</p>
      </div>
    `).join('');
  }
}

// Load customers
function loadCustomers() {
  const tbody = document.getElementById('customersTableBody');
  tbody.innerHTML = `
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>+260 97 XXXXXX</td>
      <td>5</td>
      <td>ZMW 25,000.00</td>
      <td><button class="btn btn-small">View</button></td>
    </tr>
  `;
}

// Load profile
function loadProfile() {
  const user = getCurrentUser();
  if (user) {
    document.getElementById('businessName').value = user.name;
  }
}

// Add product modal
window.addProduct = function() {
  document.getElementById('productForm').reset();
  document.getElementById('productModal').removeAttribute('hidden');
};

window.closeProductModal = function() {
  document.getElementById('productModal').setAttribute('hidden', '');
};

document.getElementById('productForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const weight = parseFloat(document.getElementById('productWeight').value) || 0;
  const length = parseFloat(document.getElementById('productLength').value) || 0;
  const width = parseFloat(document.getElementById('productWidth').value) || 0;
  const height = parseFloat(document.getElementById('productHeight').value) || 0;

  function computeDeliveryFee(lengthCm, widthCm, heightCm, weightKg) {
    // volumetric weight using divisor 5000 (cm & kg)
    const volumetricKg = (lengthCm * widthCm * heightCm) / 5000;
    const chargeableKg = Math.max(volumetricKg || 0, weightKg || 0, 0.1);
    const ratePerKg = 12.0; // ZMW per kg — configurable later
    const baseFee = 10.0; // base handling fee
    return Number((chargeableKg * ratePerKg + baseFee).toFixed(2));
  }

  const product = {
    id: 'prod-' + Date.now(),
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    price: parseFloat(document.getElementById('productPrice').value) || 0,
    stock: parseInt(document.getElementById('productStock').value) || 0,
    description: document.getElementById('productDescription').value,
    sales: 0,
    weight: weight,
    dimensions: { length, width, height },
    deliveryFee: computeDeliveryFee(length, width, height, weight)
  };

  // attach image if provided
  const imageInput = document.getElementById('productImage');
  const imageFile = imageInput?.files?.[0] || null;

  if (imageFile && storage) {
    try {
      const current = getCurrentUser();
      const uploadPath = `products/${current?.uid || 'anon'}/${product.id}/${imageFile.name}`;
      const sRef = storageRef(storage, uploadPath);
      await uploadBytes(sRef, imageFile);
      const url = await getDownloadURL(sRef);
      product.imageUrl = url;
    } catch (e) {
      console.warn('Image upload failed, continuing without image', e);
    }
  }

  let products = getSupplierProducts();
  products.push(product);
  localStorage.setItem('supplierProducts', JSON.stringify(products));

  // Try to persist product to Firestore (non-blocking)
  (async () => {
    try {
      if (!db) return;
      const current = getCurrentUser();
      const payload = { ...product, supplierId: current?.uid || null, createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'products'), payload);
      // store firestore id for reference
      const list = JSON.parse(localStorage.getItem('supplierProducts') || '[]');
      const idx = list.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        list[idx].firestoreId = docRef.id;
        localStorage.setItem('supplierProducts', JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Could not persist product to Firestore, saved locally instead', e);
    }
  })();

  alert('Product added successfully!');
  closeProductModal();
  loadProducts();
});

// Edit/Delete/View functions
window.editProduct = function(productId) {
  alert('Edit product: ' + productId);
};

window.deleteProduct = function(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    let products = getSupplierProducts();
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('supplierProducts', JSON.stringify(products));
    loadProducts();
  }
};

window.viewOrder = function(orderId) {
  alert('View order: ' + orderId);
};

// Save profile
window.saveProfile = function() {
  const profileData = {
    businessName: document.getElementById('businessName').value,
    businessType: document.getElementById('businessType').value,
    businessAddress: document.getElementById('businessAddress').value,
    businessPhone: document.getElementById('businessPhone').value,
    businessEmail: document.getElementById('businessEmail').value,
    taxId: document.getElementById('taxId').value,
    bankAccount: document.getElementById('bankAccount').value
  };

  localStorage.setItem('supplierProfile', JSON.stringify(profileData));
  alert('Profile saved successfully!');
};

// Logout
window.logout = function() {
  localStorage.removeItem('currentUser');
  window.location.href = 'auth.html';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  updateUserDisplay();
  loadDashboardData();
  loadProducts();

  // Register service worker for PWA (best-effort)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service worker registered', reg.scope);
    }).catch(err => console.warn('Service worker registration failed', err));
  }
});
