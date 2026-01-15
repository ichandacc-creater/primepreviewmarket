import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc, collection, getDocs, query, where } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Firebase config
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

console.log("Firebase initialized:", app);

// Security: disable offline admin auto-login by default in production.
// Set to `true` during local development only if you understand the risk.
const ALLOW_OFFLINE_ADMIN = false;

// 🔹 Sign Up with User Roles
window.signUp = async function() {
  const userRole = document.querySelector('input[name="userRole"]:checked').value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const country = document.getElementById("signup-country").value;

  let userData = {
    email,
    userRole,
    country,
    createdAt: new Date().toISOString(),
    status: userRole === 'admin' ? 'pending_approval' : 'active'
  };

  // Customer data
  if (userRole === 'customer') {
    const firstname = document.getElementById("signup-firstname").value;
    const surname = document.getElementById("signup-surname").value;
    const phone = document.getElementById("signup-phone").value;
    const address = document.getElementById("signup-address").value;
    const province = document.getElementById("signup-province").value;
    const district = document.getElementById("signup-district").value;

    userData = {
      ...userData,
      firstname,
      surname,
      phone,
      address,
      province,
      district,
      orderCount: 0
    };
  }
  
  // Supplier data
  else if (userRole === 'supplier') {
    const businessname = document.getElementById("signup-businessname").value;
    const businesstype = document.getElementById("signup-businesstype").value;
    const businessaddress = document.getElementById("signup-businessaddress").value;
    const businessphone = document.getElementById("signup-businessphone").value;
    const businessprovince = document.getElementById("signup-businessprovince").value;
    const taxid = document.getElementById("signup-taxid").value;

    userData = {
      ...userData,
      businessname,
      businesstype,
      businessaddress,
      businessphone,
      businessprovince,
      taxid,
      status: 'pending_approval',
      productCount: 0,
      verified: false
    };
  }

  // Admin data
  else if (userRole === 'admin') {
    // Admin requires verification from main admin
    userData = {
      ...userData,
      userRole: 'admin',
      permissions: ['view_reports', 'view_users'],
      // For convenience during local testing allow immediate admin activation.
      // Change to 'pending_approval' in production if manual approval is required.
      status: 'active'
    };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), userData);
    // Cache profile locally so login can work offline or if Firestore is unreachable
    try {
      const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
      cache[user.uid] = { ...userData, uid: user.uid, email };
      localStorage.setItem('users-cache', JSON.stringify(cache));
    } catch (e) {
      console.warn('Could not write users-cache', e);
    }

    document.getElementById("auth-message").innerText = 
      userRole === 'admin' 
        ? "Admin account created! Please wait for approval from administrators."
        : "Account successfully created! Redirecting to login...";

    setTimeout(() => {
      if (userRole === 'admin') {
        window.location.href = "auth.html";
      } else {
        window.location.href = "auth.html";
      }
    }, 2000);

  } catch (error) {
    console.error('Sign up error:', error);
    let message = error.message;
    if (error.code === "auth/email-already-in-use") {
      message = "This email is already registered. Please login instead.";
    } else if (error.code === "auth/weak-password") {
      message = "Password too weak. Use at least 6 characters.";
    }
    document.getElementById("auth-message").innerText = message;
  }
};

// 🔹 Login
window.login = async function() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data to determine role
    let userData = null;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        console.warn('User document missing for uid:', user.uid);
        // try to find a profile by email as a best-effort recovery
        try {
          const q = query(collection(db, 'users'), where('email', '==', email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0];
            userData = { ...d.data(), uid: d.id };
            console.info('Recovered profile by email from Firestore for', email);
          } else {
            document.getElementById("auth-message").innerText = "User profile not found. Contact support.";
            return;
          }
        } catch (qErr) {
          console.warn('Email lookup failed:', qErr);
          document.getElementById("auth-message").innerText = "User profile not found. Contact support.";
          return;
        }
      } else {
        userData = userDoc.data();

        // update local cache with latest profile
        try {
          const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
          cache[user.uid] = { ...userData, uid: user.uid, email: user.email };
          localStorage.setItem('users-cache', JSON.stringify(cache));
        } catch (e) { console.warn('Could not update users-cache', e); }
      }

    } catch (err) {
      console.warn('Could not fetch user profile from Firestore (getDoc failed):', err && err.message);
      // Try local cache as fallback
      try {
        const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
        // Prefer matching by uid then fallback to email match
        userData = cache[user?.uid] || Object.values(cache).find(u => u && (u.email === email)) || null;
        if (userData) {
          console.info('Using cached profile for', userData.uid || email);
        }
        console.debug('users-cache keys:', Object.keys(cache || {}));
      } catch (e) {
        console.warn('users-cache read error', e);
      }
    }

    if (!userData) {
      document.getElementById("auth-message").innerText = "Unable to load profile (offline). Try again when online.";
      return;
    }

    if (userData.status === 'pending_approval') {
      document.getElementById("auth-message").innerText = 
        "Your account is pending approval. Please try again later.";
      return;
    }

    document.getElementById("auth-message").innerText = "Login successful! Redirecting...";

    // Store user role in localStorage
    localStorage.setItem('currentUser', JSON.stringify({
      uid: user.uid,
      email: user.email,
      role: userData.userRole,
      name: userData.firstname || userData.businessname || 'User'
    }));

    // Redirect based on role
    setTimeout(() => {
      const redirectUrl = userData.userRole === 'admin' 
        ? 'admin-dashboard.html'
        : userData.userRole === 'supplier'
        ? 'supplier-dashboard.html'
        : '../index2.html';
      
      window.location.href = redirectUrl;
    }, 1500);

  } catch (error) {
    console.error('Login error', error);
    // If network error or offline, allow a development fallback for admin accounts
    const isNetworkErr = !navigator.onLine || error.code === 'auth/network-request-failed' || error.message?.toLowerCase().includes('offline');
    if (isNetworkErr) {
      try {
        const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
        const cachedByEmail = Object.values(cache).find(u => u && u.email === email) || null;
        const cached = cachedByEmail || null;
        if (ALLOW_OFFLINE_ADMIN && cached && cached.userRole === 'admin') {
          // development convenience: allow offline admin login using cached profile
          localStorage.setItem('currentUser', JSON.stringify({ uid: cached.uid || 'local-'+Date.now(), email: cached.email, role: 'admin', name: cached.businessname || cached.firstname || 'Admin' }));
          document.getElementById('auth-message').innerText = 'Offline — signed in using cached admin profile.';
          setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 800);
          return;
        }
      } catch (e) {
        console.warn('users-cache read failed during offline login fallback', e);
      }
    }

    let message = error.message || String(error);
    if (error.code === "auth/wrong-password") message = "Incorrect password. Please try again.";
    else if (error.code === "auth/user-not-found") message = "No account found with this email.";
    else if (error.code === 'auth/network-request-failed') message = "Network error — check your connection.";
    document.getElementById("auth-message").innerText = `${message} (${error.code || 'error'})`;
  }
};

// 🔹 Admin-only login (separate page)
window.adminLogin = async function() {
  const email = document.getElementById("admin-login-email").value;
  const password = document.getElementById("admin-login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // fetch profile
    let userData = null;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        console.warn('Admin user document missing for uid:', user.uid);
        try {
          const q = query(collection(db, 'users'), where('email', '==', email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0];
            userData = { ...d.data(), uid: d.id };
            console.info('Recovered admin profile by email from Firestore for', email);
          } else {
            document.getElementById("admin-auth-message").innerText = "User profile not found. Contact support.";
            return;
          }
        } catch (qErr) {
          console.warn('Admin email lookup failed:', qErr);
          document.getElementById("admin-auth-message").innerText = "User profile not found. Contact support.";
          return;
        }
      } else {
        userData = userDoc.data();
        try {
          const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
          cache[user.uid] = { ...userData, uid: user.uid, email: user.email };
          localStorage.setItem('users-cache', JSON.stringify(cache));
        } catch (e) { console.warn('Could not update users-cache for admin', e); }
      }

    } catch (err) {
      // fallback to cache by uid then email
      try {
        const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
        userData = cache[user.uid] || Object.values(cache).find(u => u && u.email === email) || null;
      } catch (e) { console.warn('cache read error', e); }
    }

    if (!userData) {
      document.getElementById("admin-auth-message").innerText = "Unable to load profile. Try again when online.";
      return;
    }

    if (userData.userRole !== 'admin') {
      document.getElementById("admin-auth-message").innerText = "This account is not an admin.";
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, email: user.email, role: 'admin', name: userData.firstname || userData.businessname || 'Admin' }));
    document.getElementById("admin-auth-message").innerText = "Login successful! Redirecting...";
    setTimeout(() => window.location.href = 'admin-dashboard.html', 800);
  } catch (error) {
    console.error('Admin login error', error);
    document.getElementById("admin-auth-message").innerText = error.message || String(error);
  }
};

// 🔹 Supplier-only login (separate page)
window.supplierLogin = async function() {
  const email = document.getElementById("supplier-login-email").value;
  const password = document.getElementById("supplier-login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // fetch profile
    let userData = null;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        console.warn('Supplier user document missing for uid:', user.uid);
        try {
          const q = query(collection(db, 'users'), where('email', '==', email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0];
            userData = { ...d.data(), uid: d.id };
            console.info('Recovered supplier profile by email from Firestore for', email);
          } else {
            document.getElementById("supplier-auth-message").innerText = "User profile not found. Contact support.";
            return;
          }
        } catch (qErr) {
          console.warn('Supplier email lookup failed:', qErr);
          document.getElementById("supplier-auth-message").innerText = "User profile not found. Contact support.";
          return;
        }
      } else {
        userData = userDoc.data();
        try {
          const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
          cache[user.uid] = { ...userData, uid: user.uid, email: user.email };
          localStorage.setItem('users-cache', JSON.stringify(cache));
        } catch (e) { console.warn('Could not update users-cache for supplier', e); }
      }

    } catch (err) {
      // fallback to cache by uid then email
      try {
        const cache = JSON.parse(localStorage.getItem('users-cache') || '{}');
        userData = cache[user.uid] || Object.values(cache).find(u => u && u.email === email) || null;
      } catch (e) { console.warn('cache read error', e); }
    }

    if (!userData) {
      document.getElementById("supplier-auth-message").innerText = "Unable to load profile. Try again when online.";
      return;
    }

    if (userData.userRole !== 'supplier') {
      document.getElementById("supplier-auth-message").innerText = "This account is not a supplier.";
      return;
    }

    if (userData.status === 'pending_approval') {
      document.getElementById("supplier-auth-message").innerText = "Your supplier account is pending approval.";
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, email: user.email, role: 'supplier', name: userData.businessname || userData.firstname || 'Supplier' }));
    document.getElementById("supplier-auth-message").innerText = "Login successful! Redirecting...";
    setTimeout(() => window.location.href = 'supplier-dashboard.html', 800);
  } catch (error) {
    console.error('Supplier login error', error);
    document.getElementById("supplier-auth-message").innerText = error.message || String(error);
  }
};

// 🔹 Forgot Password
window.resetPassword = async function() {
  const email = document.getElementById("login-email").value;
  if (!email) {
    document.getElementById("auth-message").innerText = "Please enter your email above first.";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    document.getElementById("auth-message").innerText = 
      "Password reset email sent! Check your inbox.";
  } catch (error) {
    let message = error.message;
    if (error.code === "auth/user-not-found") {
      message = "No account found with this email.";
    }
    document.getElementById("auth-message").innerText = message;
  }
};

// 🔹 Logout
window.logout = function() {
  auth.signOut().then(() => {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
  });
};

// 🔹 Check auth state
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  // If user is on an auth page, fetch latest profile from Firestore and redirect
  (async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        console.warn('Logged-in user has no Firestore profile:', user.uid);
        return;
      }
      const userData = userDoc.data();
      const redirectUrl = userData.userRole === 'admin'
        ? 'admin-dashboard.html'
        : userData.userRole === 'supplier'
        ? 'supplier-dashboard.html'
        : '../index2.html';

      if (window.location.pathname.includes('auth.html')) {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      console.error('Error fetching user profile on auth state change:', err);
    }
  })();
});
