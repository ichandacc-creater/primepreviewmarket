import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

// Sign Up
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

    document.getElementById("auth-message").innerText = "Account created successfully!";
  } catch (error) {
    document.getElementById("auth-message").innerText = error.message;
  }
};

// Login
window.login = async function() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("auth-message").innerText = "Login successful!";
    window.location.href = "../index.html"; // redirect to main app
  } catch (error) {
    document.getElementById("auth-message").innerText = error.message;
  }
};
