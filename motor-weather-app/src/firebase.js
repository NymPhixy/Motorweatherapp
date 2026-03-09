import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Vervang deze configuratie met jouw Firebase project config
// Ga naar Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// TODO: Vervang met jouw VAPID key (Web Push certificates)
// Ga naar Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = "YOUR_VAPID_PUBLIC_KEY";

let messaging = null;

export function initializeFirebaseMessaging() {
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
