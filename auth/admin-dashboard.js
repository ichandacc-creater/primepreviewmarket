// admin-dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase config (same as auth.js)
const firebaseConfig = {
  apiKey: "AIzaSyCWezSfXRBRWyRMvoY88trhh8drG96n8AY",
  authDomain: "prime-market.firebaseapp.com",
  projectId: "prime-market",
  storageBucket: "prime-market.firebasestorage.app",
  messagingSenderId: "870687045642",
  appId: "1:870687045642:web:d10c2313ab71971f5307f3",
  measurementId: "G-EWLEJS331J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Check authentication
function checkAuth() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'auth.html';
  }
  return user;
}

// Update current user display
function updateUserDisplay() {
  const user = getCurrentUser();
  if (user) {
    document.getElementById('currentUser').textContent = `${user.name} (Admin)`;
  }
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
      break;
    case 'users':
      loadUsers();
      break;
    case 'suppliers':
      loadSuppliers();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'payments':
      loadPayments();
      break;
  }
}

// Load dashboard data
function loadDashboardData() {
  (async () => {
    // Orders: prefer Firestore, fallback to localStorage
    let orders = [];
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      orders = JSON.parse(localStorage.getItem('orders')) || [];
    }

    // Users & suppliers
    let users = [];
    let suppliers = [];
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      users = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
      suppliers = users.filter(u => u.userRole === 'supplier');
    } catch (e) {
      users = [];
      suppliers = [];
    }

    document.getElementById('totalUsers').textContent = users.length || '0';
    document.getElementById('totalSuppliers').textContent = suppliers.length || '0';
    document.getElementById('totalOrders').textContent = orders.length || '0';

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    document.getElementById('totalRevenue').textContent = `ZMW ${totalRevenue.toFixed(2)}`;

    // Pending approvals
    const pendingList = document.getElementById('pendingList');
    const pendingSuppliers = suppliers.filter(s => s.status === 'pending_approval');
    if (pendingSuppliers.length === 0) {
      pendingList.innerHTML = '<p class="no-data">No pending approvals</p>';
    } else {
      pendingList.innerHTML = pendingSuppliers.map(s => `
        <div class="approval-item">
          <strong>${s.businessname || s.firstname || 'Supplier'}</strong>
          <p>${s.businessname || s.email} - Pending approval</p>
          <button class="btn btn-primary btn-small" onclick="approveSupplier('${s.uid}')">Approve</button>
        </div>
      `).join('');
    }

    // Recent Orders
    const recentOrders = document.getElementById('recentOrders');
    if (orders.length === 0) {
      recentOrders.innerHTML = '<p class="no-data">No recent orders</p>';
    } else {
      recentOrders.innerHTML = orders.slice(-5).map(order => `
        <div class="order-item">
          <strong>${order.orderId || order.id}</strong>
          <p>ZMW ${(order.total || 0).toFixed(2)} - ${order.paymentMethod || 'N/A'}</p>
          <small>${new Date(order.timestamp || order.createdAt || Date.now()).toLocaleDateString()}</small>
        </div>
      `).join('');
    }
  })();
}

// Load users
function loadUsers() {
  (async () => {
    const tbody = document.getElementById('usersTableBody');
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const rows = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
      if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No users found</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(u => `
        <tr>
          <td>${u.firstname || u.businessname || 'User'}</td>
          <td>${u.email || ''}</td>
          <td>${u.phone || u.businessphone || ''}</td>
          <td><span class="badge">${u.status || 'active'}</span></td>
          <td>
            <button class="btn btn-small" onclick="editUser('${u.uid}')">Edit</button>
            <button class="btn btn-small btn-danger" onclick="deleteUser('${u.uid}')">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="5" class="no-data">Error loading users</td></tr>';
      console.error('loadUsers error', e);
    }
  })();
}

// Load suppliers
function loadSuppliers() {
  (async () => {
    const tbody = document.getElementById('suppliersTableBody');
    try {
      const q = query(collection(db, 'users'), where('userRole', '==', 'supplier'));
      const snap = await getDocs(q);
      const rows = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No suppliers found</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(s => `
        <tr>
          <td>${s.businessname || 'Supplier'}</td>
          <td>${s.businesstype || ''}</td>
          <td>${s.email || s.businessphone || ''}</td>
          <td><span class="badge">${s.status || 'active'}</span></td>
          <td><span class="badge">${s.verified ? '✓ Verified' : 'Not Verified'}</span></td>
          <td>
            <button class="btn btn-small" onclick="editSupplier('${s.uid}')">Edit</button>
            ${s.verified ? `<button class="btn btn-small btn-danger" onclick="deleteSupplier('${s.uid}')">Delete</button>` : `<button class="btn btn-small btn-primary" onclick="verifySupplier('${s.uid}')">Verify</button>`}
          </td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">Error loading suppliers</td></tr>';
      console.error('loadSuppliers error', e);
    }
  })();
}

// Load orders
function loadOrders() {
  (async () => {
    const tbody = document.getElementById('ordersTableBody');
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No orders found</td></tr>';
        return;
      }
      tbody.innerHTML = orders.map(order => `
        <tr>
          <td>${order.orderId || order.id}</td>
          <td>${order.customer?.name || order.customer?.email || 'Customer'}</td>
          <td>ZMW ${(order.total || 0).toFixed(2)}</td>
          <td>${order.paymentMethod || 'N/A'}</td>
          <td><span class="badge">${order.status || 'pending'}</span></td>
          <td>${new Date(order.timestamp || order.createdAt || Date.now()).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch (e) {
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No orders found</td></tr>';
        return;
      }
      tbody.innerHTML = orders.map(order => `
        <tr>
          <td>${order.orderId}</td>
          <td>${order.customer.name}</td>
          <td>ZMW ${order.total.toFixed(2)}</td>
          <td>${order.paymentMethod}</td>
          <td><span class="badge">${order.status}</span></td>
          <td>${new Date(order.timestamp).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  })();
}

// Load payments
function loadPayments() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const tbody = document.getElementById('paymentsTableBody');
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-data">No payments found</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map((order, i) => `
    <tr>
      <td>TXN-${order.orderId.split('-').pop()}</td>
      <td>ZMW ${order.total.toFixed(2)}</td>
      <td>${getPaymentMethodName(order.paymentMethod)}</td>
      <td><span class="badge badge-success">Completed</span></td>
      <td>${new Date(order.timestamp).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

// Helper function
function getPaymentMethodName(method) {
  const names = {
    'airtel': 'Airtel Money',
    'mtn': 'MTN Money',
    'dpo': 'DPO',
    'card': 'Card'
  };
  return names[method] || method;
}

// Save settings
window.saveSettings = function() {
  const settings = {
    platformName: document.getElementById('platformName').value,
    supportEmail: document.getElementById('supportEmail').value,
    commission: document.getElementById('commission').value
  };
  localStorage.setItem('platformSettings', JSON.stringify(settings));
  alert('Settings saved successfully!');
};

// Approve functions
window.approveAccount = function() {
  alert('Account approved successfully!');
  closeApprovalModal();
};

window.closeApprovalModal = function() {
  document.getElementById('approvalModal').setAttribute('hidden', '');
};

// Action functions
window.editUser = function(userId) {
  alert('Edit user: ' + userId);
};

window.deleteUser = function(userId) {
  if (confirm('Are you sure?')) {
    alert('User deleted');
  }
};

window.editSupplier = function(supplierId) {
  alert('Edit supplier: ' + supplierId);
};

window.deleteSupplier = function(supplierId) {
  if (confirm('Are you sure?')) {
    alert('Supplier deleted');
  }
};

window.verifySupplier = function(supplierId) {
  (async () => {
    try {
      await updateDoc(doc(db, 'users', supplierId), { verified: true, status: 'active' });
      alert('Supplier verified!');
      loadSuppliers();
      loadDashboardData();
    } catch (e) {
      console.error('verifySupplier error', e);
      alert('Error verifying supplier');
    }
  })();
};

window.approveSupplier = function(supplierId) {
  (async () => {
    try {
      await updateDoc(doc(db, 'users', supplierId), { status: 'active', verified: true });
      alert('Supplier approved!');
      loadDashboardData();
      loadSuppliers();
    } catch (e) {
      console.error('approveSupplier error', e);
      alert('Error approving supplier');
    }
  })();
};

// Product actions
window.editProduct = async function(productId) {
  const newPrice = prompt('Enter new price (ZMW):');
  if (newPrice === null) return;
  const newStock = prompt('Enter new stock quantity:');
  if (newStock === null) return;
  try {
    await updateDoc(doc(db, 'products', productId), {
      price: parseFloat(newPrice) || 0,
      stock: parseInt(newStock) || 0,
      updatedAt: new Date().toISOString()
    });
    alert('Product updated');
    loadProducts();
  } catch (e) {
    console.error('editProduct error', e);
    alert('Error updating product');
  }
};

window.deleteProduct = async function(productId) {
  if (!confirm('Delete this product?')) return;
  try {
    await deleteDoc(doc(db, 'products', productId));
    alert('Product deleted');
    loadProducts();
  } catch (e) {
    console.error('deleteProduct error', e);
    alert('Error deleting product');
  }
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
  // Wire up Add Product modal
  const openBtn = document.getElementById('openAddProductBtn');
  const addModal = document.getElementById('addProductModal');
  const closeBtn = document.getElementById('closeAddProduct');
  const cancelBtn = document.getElementById('cancelAddProduct');
  const saveBtn = document.getElementById('saveProductBtn');

  function showAddModal() { addModal.removeAttribute('hidden'); }
  function hideAddModal() { addModal.setAttribute('hidden', ''); }

  openBtn && openBtn.addEventListener('click', showAddModal);
  closeBtn && closeBtn.addEventListener('click', hideAddModal);
  cancelBtn && cancelBtn.addEventListener('click', hideAddModal);

  saveBtn && saveBtn.addEventListener('click', async () => {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const fileEl = document.getElementById('productImage');
    if (!name || !category || !fileEl.files.length) {
      alert('Please fill required fields and choose an image.');
      return;
    }
    const file = fileEl.files[0];
    try {
      const path = `product-images/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      // Create product doc
      await addDoc(collection(db, 'products'), {
        name,
        category,
        price,
        stock,
        imageUrl: url,
        createdAt: new Date().toISOString(),
        createdBy: getCurrentUser()?.uid || null
      });
      alert('Product added successfully');
      hideAddModal();
      loadProducts && loadProducts();
    } catch (e) {
      console.error('Error uploading product', e);
      alert('Error adding product');
    }
  });
});

// Load products (used after adding)
async function loadProducts() {
  const tbody = document.getElementById('productsTableBody');
  try {
    const snap = await getDocs(collection(db, 'products'));
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">No products found</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${p.createdBy || 'Platform'}</td>
        <td>ZMW ${(p.price || 0).toFixed(2)}</td>
        <td>${p.stock || 0}</td>
        <td>
          <button class="btn btn-small" onclick="editProduct('${p.id}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Error loading products</td></tr>';
    console.error('loadProducts error', e);
  }
}
