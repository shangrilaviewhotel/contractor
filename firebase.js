// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Load the marketplace presentation directly so it does not depend on the
// optional enhancement chain or Firebase timing. It is presentation-only.
import "./jiji-reference-marketplace.js?v=20260820-2";

// IMPORTANT: Native browser ES modules cannot import a CSS file with a normal
// JavaScript import. Loading the CSS this way previously prevented this whole
// Firebase module from evaluating, which made the storefront show
// "Firebase could not be loaded". Load the stylesheet through a normal link
// instead so Firebase initialization is never blocked by the visual layer.
if (typeof document !== "undefined" && !document.querySelector('link[data-akeem-background]')) {
  const backgroundStyle = document.createElement("link");
  backgroundStyle.rel = "stylesheet";
  backgroundStyle.href = "./marketplace-background-restore.css?v=20260820-2";
  backgroundStyle.dataset.akeemBackground = "true";
  document.head.appendChild(backgroundStyle);
}

const firebaseConfig = {
  apiKey: "AIzaSyDhwIAmuZrY5Xqo6Ql7LDKxrPiklpG5GTE",
  authDomain: "shangrila-booking.firebaseapp.com",
  projectId: "shangrila-booking",
  storageBucket: "shangrila-booking.firebasestorage.app",
  messagingSenderId: "981170210173",
  appId: "1:981170210173:web:4d74cb3f6109fe1c0a3814",
  measurementId: "G-ZYB3J8BW72"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* Additive storefront/admin enhancements. */
if (typeof window !== "undefined") {
  import("./store-enhancements.js?v=20260820-2").catch(error => {
    console.warn("Optional storefront enhancements unavailable:", error);
  });
  import("./admin-product-upgrade.js?v=20260820-1").catch(error => {
    console.warn("Optional admin product form enhancement unavailable:", error);
  });
}
