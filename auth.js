// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCWezSfXRBRWyRMvoY88trhh8drG96n8AY",
  authDomain: "prime-market.firebaseapp.com",
  projectId: "prime-market",
  storageBucket: "prime-market.firebasestorage.app",
  messagingSenderId: "870687045642",
  appId: "1:870687045642:web:d10c2313ab71971f5307f3",
  measurementId: "G-EWLEJS331J"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // LOGIN
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log("Logged in:", user);
      alert("Login successful!");

      // ✅ Redirect to index2.html after successful login
      window.location.href = "index2.html";
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    }
  });

  // SIGN UP (optional)
  const signupLink = document.querySelector(".footer .link");
  if (signupLink) {
    signupLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        alert("Enter email and password to sign up.");
        return;
      }

      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log("User created:", userCredential.user);
        alert("Account created successfully!");
      } catch (error) {
        console.error("Signup error:", error);
        alert(error.message);
      }
    });
  }

  // PASSWORD RESET
  const forgotLink = document.querySelector(".row .link");
  if (forgotLink) {
    forgotLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      if (!email) {
        alert("Enter your email to reset password.");
        return;
      }

      try {
        await auth.sendPasswordResetEmail(email);
        alert("Password reset email sent!");
      } catch (error) {
        console.error("Reset error:", error);
        alert(error.message);
      }
    });
  }
});
