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

/* Run the standalone blue boot layer before the marketplace presentation
   layer. This prevents the old green palette from being painted first. */
if (typeof document !== "undefined") {
  import("./blue-theme-boot.js?v=20260821-1").catch(error => {
    console.warn("Blue theme boot layer unavailable:", error);
  });
}

/*
 * Apply the blue brand layer as early as this module can execute. The original
 * index page contains inline green marketplace CSS, so waiting for the visual
 * marketplace module would create a noticeable green/old-style flash.
 */
const installBlueThemeEarly = () => {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-akeem-blue-theme]')) return;

  document.querySelectorAll("style").forEach(style => {
    if (!style.textContent || style.dataset.akeemBlueProcessed) return;
    const source = style.textContent;
    if (!/(#059669|#10B981|#047857|#F0FDF4|#064E3B|#A7F3D0|5,150,105|16,185,129)/i.test(source)) return;
    style.textContent = source
      .replace(/#059669/gi, "#2563EB")
      .replace(/#10B981/gi, "#3B82F6")
      .replace(/#047857/gi, "#1D4ED8")
      .replace(/#F0FDF4/gi, "#EFF6FF")
      .replace(/#064E3B/gi, "#1E3A8A")
      .replace(/#A7F3D0/gi, "#93C5FD")
      .replace(/5,150,105/g, "37,99,235")
      .replace(/16,185,129/g, "59,130,246");
    style.dataset.akeemBlueProcessed = "true";
  });

  const preload = document.createElement("style");
  preload.dataset.akeemBluePreload = "true";
  preload.textContent = `
    :root{--primary:#2563EB!important;--primary-light:#3B82F6!important;--primary-dark:#1D4ED8!important;--success:#3B82F6!important;--light:#EFF6FF!important;--card-fg:#1E3A8A!important;--border:#93C5FD!important}
    nav{border-bottom-color:rgba(37,99,235,.3)!important}.hamburger{background:linear-gradient(135deg,#2563EB,var(--accent))!important;box-shadow:0 5px 20px rgba(37,99,235,.3)!important}.mobile-menu{border-left-color:#2563EB!important}.menu-item{border-color:rgba(37,99,235,.3)!important}.menu-item:hover{background:linear-gradient(135deg,#2563EB,var(--accent))!important}.nav-title,.page-header h1{background:linear-gradient(135deg,#2563EB,var(--accent))!important}
    body:before{background:radial-gradient(circle at 20% 50%,rgba(37,99,235,.12),transparent 50%),radial-gradient(circle at 80% 80%,rgba(234,88,12,.1),transparent 50%),radial-gradient(circle at 40% 20%,rgba(59,130,246,.08),transparent 50%)!important}
    body:after{background-image:linear-gradient(0deg,transparent 24%,rgba(37,99,235,.03) 25%,rgba(37,99,235,.03) 26%,transparent 27%,transparent 74%,rgba(37,99,235,.03) 75%,rgba(37,99,235,.03) 76%,transparent 77%),linear-gradient(90deg,transparent 24%,rgba(37,99,235,.03) 25%,rgba(37,99,235,.03) 26%,transparent 27%,transparent 74%,rgba(37,99,235,.03) 75%,rgba(37,99,235,.03) 76%,transparent 77%)!important}
    .activity-feed{background:linear-gradient(135deg,rgba(37,99,235,.15),rgba(234,88,12,.1))!important;border-color:rgba(37,99,235,.4)!important}.activity-header,.stat-value{color:#60A5FA!important}.stat-card{background:linear-gradient(135deg,rgba(37,99,235,.1),rgba(234,88,12,.05))!important;border-color:rgba(37,99,235,.3)!important}.search-box,.sort-select{border-color:rgba(37,99,235,.5)!important}.search-box:focus{border-color:#2563EB!important;box-shadow:0 5px 20px rgba(37,99,235,.25)!important}.category-btn{border-color:rgba(37,99,235,.35)!important}.category-btn:hover,.category-btn.active{background:linear-gradient(135deg,#2563EB,var(--accent))!important}.product{border-color:rgba(37,99,235,.2)!important;background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(239,246,255,.95))!important}.product:hover{box-shadow:0 16px 40px rgba(37,99,235,.2)!important;border-color:#2563EB!important}.as-section-title,.as-price,.as-category,.as-accent{color:#2563EB!important}.as-chip.active,.as-filter.active,.as-btn-primary{background:#2563EB!important;border-color:#2563EB!important}
  `;
  document.head.appendChild(preload);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./blue-theme.css?v=20260821-2";
  link.dataset.akeemBlueTheme = "true";
  document.head.appendChild(link);
};

installBlueThemeEarly();

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

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

  import("./public-seller-link.js?v=20260820-3").catch(error => console.warn("Public seller link module unavailable:", error));
  import("./store-enhancements.js?v=20260820-4").catch(error => console.warn("Optional storefront enhancements unavailable:", error));

  if (location.pathname === "/" || /index\.html$/i.test(location.pathname) || /Contractor-\/?$/i.test(location.pathname)) {
    import("./main-category-filter.js?v=20260820-7").catch(error => console.warn("Marketplace category controller unavailable:", error));
  }

  if (/sell\.html$/i.test(location.pathname)) {
    import("./public-category-options.js?v=20260820-1").catch(error => console.warn("Public seller category compatibility layer unavailable:", error));
    import("./public-seller-upload-fix.js?v=20260820-2").catch(error => console.warn("Public seller upload runtime unavailable:", error));
  }

  import("./admin-product-upgrade.js?v=20260820-2").catch(error => console.warn("Optional admin product form enhancement unavailable:", error));

  if (location.pathname.toLowerCase().includes("admindashboard")) {
    import("./admin-public-submissions.js?v=20260820-2").catch(error => console.warn("Public submission review module unavailable:", error));
    import("./admin-data-recovery.js?v=20260820-1").catch(error => console.warn("Admin data recovery module unavailable:", error));
  }
}
