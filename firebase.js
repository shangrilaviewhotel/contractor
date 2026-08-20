// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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

/*
 * Wait for Firebase Auth to restore the existing browser session before
 * allowing pages that immediately query Firestore (especially the admin
 * dashboard) to continue. Without this, a refresh can briefly look like
 * there is no authenticated admin and the protected Firestore reads fail.
 *
 * The timeout keeps public pages from being held indefinitely if Auth is
 * temporarily unavailable. The normal Auth callback resolves immediately
 * once Firebase knows the current user (including null for signed-out users).
 */
await new Promise(resolve => {
  let settled = false;
  let unsubscribe = () => {};
  const finish = () => {
    if (settled) return;
    settled = true;
    try { unsubscribe(); } catch (_) {}
    resolve();
  };
  unsubscribe = onAuthStateChanged(auth, finish);
  setTimeout(finish, 4000);
});

export { auth, db, storage };

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const loadStyles = () => {
    if (!document.querySelector('link[data-akeem-background]')) {
      const backgroundStyle = document.createElement("link");
      backgroundStyle.rel = "stylesheet";
      backgroundStyle.href = "./marketplace-background-restore.css?v=20260820-5";
      backgroundStyle.dataset.akeemBackground = "true";
      document.head.appendChild(backgroundStyle);
    }
  };

  const loadMarketplaceDesign = () => {
    import("./jiji-reference-marketplace.js?v=20260820-5")
      .then(() => loadStyles())
      .catch(error => {
        console.warn("Marketplace visual layer unavailable:", error);
        loadStyles();
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => loadMarketplaceDesign(), { once: true });
  } else {
    loadMarketplaceDesign();
  }

  import("./public-seller-link.js?v=20260820-2").catch(error => {
    console.warn("Public seller link module unavailable:", error);
  });

  import("./store-enhancements.js?v=20260820-4").catch(error => {
    console.warn("Optional storefront enhancements unavailable:", error);
  });

  if (location.pathname === "/" || /index\.html$/i.test(location.pathname) || /Contractor-\/?$/i.test(location.pathname)) {
    import("./main-category-filter.js?v=20260820-7").catch(error => {
      console.warn("Marketplace category controller unavailable:", error);
    });
  }

  if (/sell\.html$/i.test(location.pathname)) {
    import("./public-category-options.js?v=20260820-1").catch(error => {
      console.warn("Public seller category compatibility layer unavailable:", error);
    });
    import("./public-seller-upload-fix.js?v=20260820-1").catch(error => {
      console.warn("Public seller upload compatibility layer unavailable:", error);
    });
  }

  import("./admin-product-upgrade.js?v=20260820-2").catch(error => {
    console.warn("Optional admin product form enhancement unavailable:", error);
  });

  if (location.pathname.toLowerCase().includes("admindashboard")) {
    import("./admin-public-submissions.js?v=20260820-2").catch(error => {
      console.warn("Public submission review module unavailable:", error);
    });
  }
}
