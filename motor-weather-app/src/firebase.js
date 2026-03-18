import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = env.VITE_FIREBASE_VAPID_KEY;

let hasWarnedMissingFirebaseConfig = false;
let hasWarnedMissingVapidKey = false;

function isValidFirebaseConfigValue(value) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  return !trimmedValue.startsWith("YOUR_");
}

function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every((value) =>
    isValidFirebaseConfigValue(value),
  );
}

function isValidVapidKey(value) {
  if (typeof value !== "string") {
    return false;
  }

  const trimmedValue = value.trim();
  const isPlaceholder = trimmedValue === "YOUR_VAPID_PUBLIC_KEY";
  const looksLikeBase64Url = /^[A-Za-z0-9_-]+$/.test(trimmedValue);

  return trimmedValue.length > 0 && !isPlaceholder && looksLikeBase64Url;
}

let messaging = null;

export function initializeFirebaseMessaging() {
  if (!hasFirebaseConfig()) {
    if (!hasWarnedMissingFirebaseConfig) {
      console.warn(
        "Firebase config ontbreekt. Stel VITE_FIREBASE_* variabelen in je .env-bestand in en herstart de dev server.",
      );
      hasWarnedMissingFirebaseConfig = true;
    }
    return null;
  }

  try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
}

export async function requestNotificationToken() {
  if (!messaging) {
    console.warn("Firebase Messaging not initialized");
    return null;
  }

  if (!isValidVapidKey(VAPID_KEY)) {
    if (!hasWarnedMissingVapidKey) {
      console.warn(
        "Ongeldige of ontbrekende VAPID key. Stel VITE_FIREBASE_VAPID_KEY in met je Web Push public key.",
      );
      hasWarnedMissingVapidKey = true;
    }
    return null;
  }

  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
}

export function onForegroundMessage(callback) {
  if (!messaging) {
    console.warn("Firebase Messaging not initialized");
    return () => {};
  }

  return onMessage(messaging, callback);
}
