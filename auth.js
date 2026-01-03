import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, setDoc, doc } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Replace with your Firebase config
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
// 🔹 Sign Up
window.signUp = async function() {
  const firstname = document.getElementById("signup-firstname").value;
  const surname = document.getElementById("signup-surname").value;
  const phone = document.getElementById("signup-phone").value;
  const address = document.getElementById("signup-address").value;
  const province = document.getElementById("signup-province").value;
  const district = document.getElementById("signup-district").value;
  const country = document.getElementById("signup-country").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extra details in Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstname,
      surname,
      phone,
      address,
      province,
      district,
      country,
      email
    });

    // ✅ Show success message
    document.getElementById("auth-message").innerText = 
      "Account successfully created! Redirecting to login...";

    // ✅ Redirect back to login after 1 second
    setTimeout(() => {
      window.location.href = "auth.html"; // adjust if your login page has a different filename
    }, 2000);

  } catch (error) {
    let message = error.message;
    if (error.code === "auth/email-already-in-use") {
      message = "This email is already registered. Please login instead.";
    } else if (error.code === "auth/weak-password") {
      message = "Password is too weak. Please use at least 6 characters.";
    }
    document.getElementById("auth-message").innerText = message;
  }
};


// 🔹 Login
window.login = async function() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("auth-message").innerText = "Login successful!";
    window.location.href = "../index.html"; // redirect to main app
  } catch (error) {
    let message = error.message;
    if (error.code === "auth/wrong-password") {
      message = "Incorrect password. Please try again.";
    } else if (error.code === "auth/user-not-found") {
      message = "No account found with this email.";
    }
    document.getElementById("auth-message").innerText = message;
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
    document.getElementById("auth-message").innerText = "Password reset email sent! Check your inbox.";
  } catch (error) {
    let message = error.message;
    if (error.code === "auth/user-not-found") {
      message = "No account found with this email.";
    }
    document.getElementById("auth-message").innerText = message;
  }
};
