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

// Firebase must initialize independently of every optional visual enhancement.
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/*
 * Presentation-only files are loaded after Firebase has initialized.
 * A styling failure can therefore never make the storefront report that
 * Firebase is unavailable.
 */
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const loadStyles = () => {
    if (!document.querySelector('link[data-akeem-background]')) {
      const backgroundStyle = document.createElement("link");
      backgroundStyle.rel = "stylesheet";
      backgroundStyle.href = "./marketplace-background-restore.css?v=20260820-3";
      backgroundStyle.dataset.akeemBackground = "true";
      document.head.appendChild(backgroundStyle);
    }
  };

  const loadMarketplaceDesign = () => {
    import("./jiji-reference-marketplace.js?v=20260820-3")
      .catch(error => console.warn("Marketplace visual layer unavailable:", error));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      loadStyles();
      loadMarketplaceDesign();
    }, { once: true });
  } else {
    loadStyles();
    loadMarketplaceDesign();
  }

  import("./store-enhancements.js?v=20260820-3").catch(error => {
    console.warn("Optional storefront enhancements unavailable:", error);
  });

  import("./admin-product-upgrade.js?v=20260820-1").catch(error => {
    console.warn("Optional admin product form enhancement unavailable:", error);
  });
}
