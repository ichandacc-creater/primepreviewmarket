// checkout.js

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
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + DELIVERY_FEE;

  return { subtotal, tax, total, items: entries };
}

// Render order summary
function renderOrderSummary() {
  const { subtotal, tax, total, items } = calculateTotals();

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
  document.getElementById('summaryTax').textContent = format(tax);
  document.getElementById('summaryTotal').textContent = format(total);
}

// Payment method switching
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    // Hide all forms
    document.querySelectorAll('.payment-form').forEach(form => {
      form.style.display = 'none';
    });

    // Show selected form
    const method = e.target.value;
    if (method === 'airtel') document.getElementById('airtelForm').style.display = 'block';
    if (method === 'mtn') document.getElementById('mtnForm').style.display = 'block';
    if (method === 'dpo') document.getElementById('dpoForm').style.display = 'block';
    if (method === 'card') document.getElementById('cardForm').style.display = 'block';
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
  const { subtotal, tax, total, items } = calculateTotals();

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
    items: items,
    subtotal: subtotal,
    tax: tax,
    deliveryFee: DELIVERY_FEE,
    total: total,
    paymentMethod: paymentMethod,
    status: 'pending'
  };

  // Simulate payment processing
  return new Promise((resolve) => {
    // Add slight delay for realism
    setTimeout(() => {
      console.log('Processing payment...', orderData);

      // Save order to localStorage
      let orders = JSON.parse(localStorage.getItem('orders')) || [];
      orders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart
      localStorage.removeItem('cart');

      resolve({
        success: true,
        orderId: orderData.orderId,
        message: `Payment of ${format(total)} via ${getPaymentMethodName(paymentMethod)} processed successfully!`
      });
    }, 2000);
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

// Show success modal
function showSuccessModal(orderId, message) {
  document.getElementById('orderId').textContent = orderId;
  document.getElementById('orderMessage').textContent = message;
  const modal = document.getElementById('successModal');
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

// Close success modal
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.setAttribute('hidden', '');
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
document.getElementById('placeOrderBtn').addEventListener('click', async () => {
  if (!validateCheckoutForm()) return;

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    const result = await processPayment();
    
    if (result.success) {
      showSuccessModal(result.orderId, result.message);
    }
  } catch (error) {
    alert('Error processing payment: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
});

// Continue shopping after successful order
document.getElementById('continueShoppingBtn').addEventListener('click', () => {
  closeSuccessModal();
  window.location.href = 'phones.html';
});

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
  renderOrderSummary();

  // Check if cart is empty
  const cart = getCart();
  if (Object.keys(cart).length === 0) {
    alert('Your cart is empty. Redirecting to store...');
    window.location.href = 'phones.html';
  }
});
