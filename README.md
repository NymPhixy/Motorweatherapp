# Motorweatherapp

Motor Ride Weather — How it works
Architecture overview
The app is a React Single Page Application (SPA) built with Vite. All the logic lives in the browser — there is no backend server. It talks to two external APIs and uses browser APIs for location, notifications, and caching.

Browser
  └── App.jsx (brain / state manager)
        ├── weatherApi.js  ──► Open-Meteo API (weather)
        ├── weatherApi.js  ──► Nominatim API (location name)
        ├── firebase.js    ──► Firebase FCM (push tokens)
        ├── components/WeatherCard.jsx   (renders everything)
        ├── components/RideAdvice.jsx    (calculates ride advice)
        └── components/WeatherIllustration.jsx (icon)
        Data flow step by step
1. App starts → default location loads
On mount, App.jsx calls loadWeather() with a hardcoded fallback coordinate (Groningen: 53.2194, 6.5665). This ensures the user sees data immediately, even before GPS kicks in.

2. GPS activates → live coordinates replace the fallback
navigator.geolocation.watchPosition() continuously watches the device position. Every time the position updates, it:

Saves the new {latitude, longitude} to React state
Calls loadWeather() again with the fresh coordinates
The locationSource state switches from "fallback" to "live" to indicate GPS is active.

3. loadWeather() → two parallel API calls
Call 1 — Open-Meteo (weather data)
GET https://api.open-meteo.com/v1/forecast
    ?latitude=...&longitude=...
    &current=temperature_2m,precipitation,cloud_cover,weather_code
    &timezone=auto
   Returns → { temperature, precipitation, cloudCover, weatherCode }

temperature = °C, rounded to integer
precipitation = mm of rain in the current hour, 1 decimal
cloudCover = % of sky covered, 0–100
weatherCode = WMO code (45/48 = fog, 0 = clear, 61–67 = rain, etc.)
Call 2 — OpenStreetMap Nominatim (location name)
GET https://nominatim.openstreetmap.org/reverse
    ?lat=...&lon=...&format=jsonv2&accept-language=nl

    Returns the address object. The app picks the best available label in this order: city → town → village → municipality → county. This is what shows as the location heading in the UI.

The two calls are decoupled — if geocoding fails, the weather data still shows. The location label falls back to "Locatie onbekend".

4. Ride advice — how weather data turns into a verdict
getRideAdvice() in src/components/RideAdvice.jsx takes { temperature, precipitation, cloudCover, weatherCode } and applies these thresholds:

Variable	Rule
isDry	precipitation ≤ 0.2 mm
isCold	temperature < 5°C
isVeryCold	temperature ≤ −5°C
isSunny	cloudCover ≤ 35%
isWetRoad	precipitation > 0.2 mm
isVeryCloudy	cloudCover ≥ 80%
isFoggy	weatherCode is 45 or 48
The conditions are checked top to bottom, first match wins:

isVeryCold && (isVeryCloudy || isFoggy) → 🔴 Dangerous
temp ≥ 15 && isDry && isSunny → 🟢 Ideal
isDry && isCold → 🟡 Dry but cold
isWetRoad && temp ≤ 10 → 🟡 Cold + rain
isWetRoad → 🟡 Wet road
isDry (default) → 🟢 Fine
5. Notifications — interval timer
The user picks an interval: 1h / 3h / 24h / 72h. This is stored in localStorage so it persists across sessions.

A setInterval runs in the background at that interval. When it fires, it calls loadWeather({ notify: true }). This triggers sendWeatherNotification(), which:

Calculates the ride advice for the current conditions
Builds a message string: "Groningen: 8°C, 0.0 mm regen, 45% bewolking. Droog weer, prima om te rijden"
Posts it to the service worker via postMessage({ type: "SHOW_WEATHER_NOTIFICATION" })
The service worker in public/sw.js calls self.registration.showNotification() — this works even when the browser tab is in the background
If the service worker is not available (dev mode), it falls back to new Notification() directly.

6. PWA — installable on iPhone/Android
public/manifest.webmanifest tells the browser this is an installable app:

display: standalone — hides the browser bar when installed
theme_color: #111827 — dark header color matches the app
Icons link to /vite.svg (can be replaced with a motorcycle icon)
public/sw.js caches static assets on install so the app loads offline.

7. Firebase FCM — background push (requires setup)
src/firebase.js initialises Firebase Cloud Messaging. When the user grants notification permission:

requestNotificationToken() gets a unique FCM token for the device
That token could be sent to a server, which can then push messages at any time — even when the app is closed
public/firebase-messaging-sw.js handles those background messages
Note: This currently has placeholder keys (YOUR_API_KEY etc.) — it needs a real Firebase project configured to work.

8. Service workers — production only
Service workers are only registered in production builds (import.meta.env.PROD). In development (npm run dev), any existing service workers are automatically unregistered. This prevents Vite's Hot Module Replacement (HMR) websocket from being intercepted by a stale cached service worker — which was the root cause of the previous useState null crash.

Summary diagram
GPS (watchPosition)
    │ coordinates
    ▼
loadWeather()
    ├──► Open-Meteo API ──► temperature, precipitation, cloudCover, weatherCode
    │                              │
    │                              ▼
    │                       getRideAdvice() ──► colored verdict + message
    │
    └──► Nominatim API ──► city/town name

setInterval (every 1h/3h/24h/72h)
    └──► loadWeather({ notify: true })
              └──► sw.js ──► showNotification()

