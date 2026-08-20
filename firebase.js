// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
  import("./main-category-filter.js?v=20260820-4").catch(error => {
    console.warn("Optional marketplace category filter unavailable:", error);
  });
  import("./admin-product-upgrade.js?v=20260820-1").catch(error => {
    console.warn("Optional admin product form enhancement unavailable:", error);
  });
}
