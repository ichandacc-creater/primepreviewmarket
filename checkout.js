// checkout.js
console.log('checkout.js loaded');

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function format(n){ return `ZMW ${n.toFixed(2)}`; }

const DELIVERY_FEE = 50;
const TAX_RATE = 0.1; // 10%

// Get cart from localStorage
function getCart() {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : {};
}

// Calculate totals
function calculateTotals() {
  const cart = getCart();
  const entries = Object.values(cart);
  const subtotal = entries.reduce((a, c) => a + c.qty * c.price, 0);
  const deliveryMethod = document.querySelector('input[name="delivery"]:checked')?.value || 'delivery';
  const deliveryFee = deliveryMethod === 'pickup' ? 0 : DELIVERY_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + deliveryFee;

  return { subtotal, tax, total, items: entries, deliveryFee, deliveryMethod };
}

// Render order summary
function renderOrderSummary() {
  const { subtotal, tax, total, items, deliveryFee } = calculateTotals();

  // Items list
  const summaryItems = document.getElementById('summaryItems');
  summaryItems.innerHTML = items.map(item => `
    <div class="summary-item">
      <div class="summary-item-info">
        <strong>${item.title}</strong>
        ${item.color ? `<div class="muted">Color: ${item.color}</div>` : ''}
      </div>
      <div class="summary-item-qty">×${item.qty}</div>
      <div class="summary-item-price">${format(item.price * item.qty)}</div>
    </div>
  `).join('');

  // Totals
  document.getElementById('summarySubtotal').textContent = format(subtotal);
  document.getElementById('deliveryFee').textContent = format(deliveryFee);
  document.getElementById('summaryTax').textContent = format(tax);
  document.getElementById('summaryTotal').textContent = format(total);
}

// Delivery method switching
document.querySelectorAll('input[name="delivery"]').forEach(radio => {
  radio.addEventListener('change', () => {
    renderOrderSummary();
  });
});

// Validate form
function validateCheckoutForm() {
  const required = [
    'fullName', 'phone', 'email', 'address', 'city', 'district', 'province', 'zipcode'
  ];

  for (let id of required) {
    const input = document.getElementById(id);
    if (!input.value.trim()) {
      alert(`Please fill in ${input.previousElementSibling.textContent}`);
      return false;
    }
  }

  if (!document.getElementById('terms').checked) {
    alert('Please agree to the terms and conditions');
    return false;
  }

  return true;
}

// Process payment
async function processPayment() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const { subtotal, tax, total, items, deliveryFee, deliveryMethod } = calculateTotals();

  const orderData = {
    orderId: generateOrderId(),
    timestamp: new Date().toISOString(),
    customer: {
      name: document.getElementById('fullName').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      district: document.getElementById('district').value,
      province: document.getElementById('province').value,
      zipcode: document.getElementById('zipcode').value,
    },
    deliveryAddress: deliveryMethod === 'delivery' ? document.getElementById('address').value : 'Pick up in person',
    deliveryMethod: deliveryMethod,
    items: items,
    subtotal: subtotal,
    tax: tax,
    deliveryFee: deliveryFee,
    total: total,
    paymentMethod: paymentMethod,
    status: 'pending'
  };

  // Show payment confirmation modal
  showPaymentModal(orderData);

  return { success: true, orderId: orderData.orderId, message: 'Order prepared. Please send payment.' };
});
}

// Generate order ID
function generateOrderId() {
  const timestamp = Date.now();
  return `ORD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

// Get payment method display name
function getPaymentMethodName(method) {
  const names = {
    'airtel': 'Airtel Money',
    'mtn': 'MTN Money',
    'dpo': 'DPO Payment',
    'card': 'Credit/Debit Card'
  };
  return names[method] || method;
}

// Show payment confirmation modal
function showPaymentModal(orderData) {
  document.getElementById('confirmOrderId').textContent = orderData.orderId;
  document.getElementById('confirmAmount').textContent = format(orderData.total);
  const modal = document.getElementById('paymentModal');
  modal.removeAttribute('hidden');
  document.querySelector('[data-scrim]').removeAttribute('hidden');
  document.body.style.overflow = 'hidden';

  // Store order data for later
  window.pendingOrder = orderData;
}

// Close payment modal
function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  modal.setAttribute('hidden', '');
  document.querySelector('[data-scrim]').setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// Show success modal
function showSuccessModal(orderId, message) {
  document.getElementById('orderId').textContent = orderId;
  document.getElementById('orderMessage').textContent = message;
  const modal = document.getElementById('successModal');
  modal.removeAttribute('hidden');
  document.querySelector('[data-scrim]').removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

// Close success modal
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.setAttribute('hidden', '');
  document.querySelector('[data-scrim]').setAttribute('hidden', '');
  document.body.style.overflow = '';
}

// Apply promo code
document.getElementById('applyPromo').addEventListener('click', () => {
  const promoCode = document.getElementById('promoCode').value.toUpperCase();
  const { subtotal, tax, total } = calculateTotals();

  // Simple promo code validation
  const promoCodes = {
    'SAVE10': 0.10,
    'SAVE20': 0.20,
    'WELCOME': 0.15
  };

  if (promoCodes[promoCode]) {
    const discount = subtotal * promoCodes[promoCode];
    const newSubtotal = subtotal - discount;
    const newTax = newSubtotal * TAX_RATE;
    const newTotal = newSubtotal + newTax + DELIVERY_FEE;

    alert(`✓ Promo code applied! You saved ${format(discount)}`);
    document.getElementById('summarySubtotal').textContent = format(newSubtotal);
    document.getElementById('summaryTax').textContent = format(newTax);
    document.getElementById('summaryTotal').textContent = format(newTotal);
  } else {
    alert('Invalid promo code');
  }
});

// Place order
window.placeOrder = async () => {
  alert('Place order clicked');
  if (!validateCheckoutForm()) return;

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    await processPayment();
  } catch (error) {
    alert('Error preparing order: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
};

// Continue shopping after successful order
window.continueShopping = () => {
  closeSuccessModal();
  window.location.href = 'phones.html';
};

// Confirm payment sent
window.confirmPaymentSent = async () => {
  const orderData = window.pendingOrder;
  if (!orderData) return;

  // Save order to localStorage
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Save order to Firestore
  try {
    await addDoc(collection(db, 'orders'), orderData);
    console.log('Order saved to Firestore:', orderData.orderId);
  } catch (fireErr) {
    console.warn('Could not sync order to Firestore', fireErr);
  }

  // Clear cart
  localStorage.removeItem('cart');

  closePaymentModal();
  showSuccessModal(orderData.orderId, 'Your order is now pending confirmation.');
};

// Cancel order
window.cancelOrder = () => {
  // Clear pending order
  delete window.pendingOrder;
  closePaymentModal();
  alert('Order cancelled.');
  window.location.href = 'cart.html';
};

// Format card input
document.getElementById('cardNumber').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
});

document.getElementById('expiry').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substr(0, 5);
});

document.getElementById('cardExp').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substr(0, 5);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('checkout DOMContentLoaded');
  renderOrderSummary();

  // Check if cart is empty
  const cart = getCart();
  if (Object.keys(cart).length === 0) {
    alert('Your cart is empty. Redirecting to store...');
    window.location.href = 'phones.html';
  }
});
