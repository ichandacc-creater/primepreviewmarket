// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWezSfXRBRWyRMvoY88trhh8drG96n8AY",
  authDomain: "prime-market.firebaseapp.com",
  projectId: "prime-market",
  storageBucket: "prime-market.firebasestorage.app",
  messagingSenderId: "870687045642",
  appId: "1:870687045642:web:d10c2313ab71971f5307f3",
  measurementId: "G-EWLEJS331J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    alert("Login successful!");
    // Redirect to index2.html
    window.location.href = "index2.html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

// SIGN UP
document.getElementById("signupLink").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    alert("Account created successfully!");
  } catch (error) {
    alert("Signup failed: " + error.message);
  }
});

// PASSWORD RESET
document.getElementById("forgotLink").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Enter your email to reset password.");
    return;
  }

  try {
    await auth.sendPasswordResetEmail(email);
    alert("Password reset email sent!");
  } catch (error) {
    alert("Reset failed: " + error.message);
  }
});
