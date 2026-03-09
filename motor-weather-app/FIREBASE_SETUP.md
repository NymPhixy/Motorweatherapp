# Firebase Cloud Messaging Setup

Deze app is voorbereid voor Firebase Cloud Messaging (FCM) voor push notificaties die werken ook als de app gesloten is.

## Stappen om Firebase in te schakelen

### 1. Maak een Firebase project

1. Ga naar [Firebase Console](https://console.firebase.google.com/)
2. Klik op **Add project**
3. Geef je project een naam (bijv. "motor-weather-app")
4. Volg de wizard en creëer het project

### 2. Registreer de web app

1. In Firebase Console, ga naar **Project Overview** > **Add app** > **Web** (</> icon)
2. Geef de app een nickname (bijv. "Motor Weather Web")
3. Vink **"Also set up Firebase Hosting"** NIET aan (tenzij je hosting wilt)
4. Klik **Register app**
5. Kopieer de `firebaseConfig` object

### 3. Genereer Web Push certificaat (VAPID key)

1. In Firebase Console, ga naar **Project Settings** (tandwiel icoon)
2. Ga naar het tabblad **Cloud Messaging**
3. Scroll naar **Web Push certificates**
4. Klik **Generate key pair**
5. Kopieer de **Key pair** (VAPID public key)

### 4. Update configuratie in de code

#### In `src/firebase.js`:

Vervang de volgende waardes:

```javascript
const firebaseConfig = {
  apiKey: "JOUW_API_KEY",
  authDomain: "JOUW_PROJECT_ID.firebaseapp.com",
  projectId: "JOUW_PROJECT_ID",
  storageBucket: "JOUW_PROJECT_ID.appspot.com",
  messagingSenderId: "JOUW_SENDER_ID",
  appId: "JOUW_APP_ID",
};

const VAPID_KEY = "JOUW_VAPID_PUBLIC_KEY";
```

#### In `public/firebase-messaging-sw.js`:

Vervang met dezelfde `firebaseConfig`:

```javascript
const firebaseConfig = {
  // Exact dezelfde waardes als in src/firebase.js
};
```

### 5. Service worker aanpassen

In `src/main.jsx`, registreer de Firebase messaging service worker:

```javascript
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/firebase-messaging-sw.js");
  });
}
```

### 6. Test notificaties

Open de browser console en zoek naar:

```
FCM Token: [een lange string]
```

Dit is je device token. Je kunt deze gebruiken om test notificaties te sturen via de Firebase Console:

1. Ga naar **Engage** > **Messaging**
2. Klik **Create your first campaign** > **Firebase Notification messages**
3. Vul titel en tekst in
4. Klik **Send test message**
5. Plak je FCM token
6. Klik **Test**

## Productie: Server-side notificaties sturen

Voor automatische weerupdates moet je server-side code schrijven die:

1. De FCM tokens van gebruikers opslaat (bijv. in een database)
2. Periodiek weerdata ophaalt
3. FCM Admin SDK gebruikt om notificaties te sturen

Voorbeeld met Node.js:

```javascript
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

const message = {
  notification: {
    title: "Motor Ride Weather",
    body: "Groningen: 18°C, droog weer, prima om te rijden",
  },
  token: usersFcmToken,
};

admin.messaging().send(message);
```

## Troubleshooting

- **"Firebase Messaging not initialized"**: Check of firebaseConfig correct is
- **"Failed to get FCM token"**: Controleer VAPID key en notificatie permissies
- **Geen notificaties**: Check browser console voor errors en verifieer service worker is geregistreerd

## Privacy & GDPR

Let op: FCM tokens zijn persoonlijke data. Je moet:

- Toestemming vragen voordat je tokens opslaat
- Gebruikers de mogelijkheid geven om notificaties uit te schakelen
- Tokens verwijderen als gebruiker uitschrijft
