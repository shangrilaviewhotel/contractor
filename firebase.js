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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

/* Presentation modules are optional and must never block Firebase exports. */
if (typeof window !== "undefined" && typeof document !== "undefined") {
  const safeImport = (path) => import(path).catch(error => {
    console.warn(`Optional module unavailable: ${path}`, error);
    return null;
  });

  safeImport("./blue-theme-final.js?v=20260831-2");
  safeImport("./blue-theme-boot.js?v=20260821-3");

  const loadBackground = () => {
    if (!document.querySelector('link[data-akeem-background]')) {
      const backgroundStyle = document.createElement("link");
      backgroundStyle.rel = "stylesheet";
      backgroundStyle.href = "./marketplace-background-restore.css?v=20260820-6";
      backgroundStyle.dataset.akeemBackground = "true";
      document.head.appendChild(backgroundStyle);
    }
  };

  const loadMarketplaceDesign = () => {
    safeImport("./jiji-reference-marketplace.js?v=20260821-7").then(() => {
      loadBackground();
      safeImport("./blue-theme-final.js?v=20260831-2");
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadMarketplaceDesign, { once: true });
  } else {
    loadMarketplaceDesign();
  }

  safeImport("./public-seller-link.js?v=20260821-5");
  safeImport("./store-enhancements.js?v=20260820-4");

  if (location.pathname === "/" || /index\.html$/i.test(location.pathname) || /Contractor-\/?$/i.test(location.pathname)) {
    safeImport("./main-category-filter.js?v=20260820-8");
  }

  if (/sell\.html$/i.test(location.pathname)) {
    safeImport("./public-category-options.js?v=20260820-1");
    safeImport("./public-seller-upload-fix.js?v=20260820-3");
  }

  safeImport("./admin-product-upgrade.js?v=20260820-2");

  if (location.pathname.toLowerCase().includes("admindashboard")) {
    safeImport("./admin-public-submissions.js?v=20260820-3");
    safeImport("./admin-data-recovery.js?v=20260820-2");
    safeImport("./admin-product-editor.js?v=20260823-1");
  }
}
