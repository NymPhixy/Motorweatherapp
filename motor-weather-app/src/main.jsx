import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Firebase SW registered:", registration);
        })
        .catch((error) => {
          console.error("Firebase SW registration failed:", error);
        });

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Main SW registered:", registration);
        })
        .catch((error) => {
          console.error("Main SW registration failed:", error);
        });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
