import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Register Firebase messaging service worker for push notifications
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Firebase SW registered:", registration);
      })
      .catch((error) => {
        console.error("Firebase SW registration failed:", error);
      });

    // Also register main service worker for offline caching
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Main SW registered:", registration);
      })
      .catch((error) => {
        console.error("Main SW registration failed:", error);
      });
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
