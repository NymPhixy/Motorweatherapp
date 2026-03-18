import { useEffect, useRef, useState } from "react";
import WeatherCard from "./components/WeatherCard";
import { getCurrentWeather, getLocationName } from "./weatherApi";
import { getRideAdvice } from "./components/RideAdvice";
import {
  initializeFirebaseMessaging,
  requestNotificationToken,
  onForegroundMessage,
} from "./firebase";
import "./App.css";

const DEFAULT_COORDINATES = {
  latitude: 53.2194,
  longitude: 6.5665,
};

const NOTIFICATION_INTERVALS = {
  "1h": 60 * 60 * 1000,
  "3h": 3 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "72h": 72 * 60 * 60 * 1000,
};

function App() {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES);
  const [locationSource, setLocationSource] = useState("fallback");
  const [locationName, setLocationName] = useState("Groningen");
  const [notificationInterval, setNotificationInterval] = useState(() => {
    return localStorage.getItem("weatherNotificationInterval") || "3h";
  });
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof Notification === "undefined") {
      return "unsupported";
    }

    return Notification.permission;
  });
  const [lastNotificationAt, setLastNotificationAt] = useState("");
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState("checking");
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationSupportHint, setNotificationSupportHint] = useState("");
  const [isSendingTestNotification, setIsSendingTestNotification] =
    useState(false);

  const latestCoordinatesRef = useRef(DEFAULT_COORDINATES);

  const sendWeatherNotification = async (weatherData, placeName) => {
    if (typeof Notification === "undefined") {
      return false;
    }

    if (Notification.permission !== "granted") {
      return false;
    }

    const advice = getRideAdvice(weatherData, false, "");
    const messageBody = `${placeName}: ${weatherData.temperature}°C, ${weatherData.precipitation} mm regen, ${weatherData.cloudCover}% bewolking. ${advice.message}`;

    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();

        if (registration?.active) {
          registration.active.postMessage({
            type: "SHOW_WEATHER_NOTIFICATION",
            title: "Motor Ride Weather update",
            body: messageBody,
          });
          setLastNotificationAt(new Date().toLocaleString("nl-NL"));
          return true;
        }
      } catch {
        // If service worker lookup fails, continue with Notification fallback.
      }
    }

    new Notification("Motor Ride Weather update", {
      body: messageBody,
    });

    setLastNotificationAt(new Date().toLocaleString("nl-NL"));
    return true;
  };

  const handleTriggerTestNotification = async () => {
    setError("");
    setIsSendingTestNotification(true);

    try {
      if (typeof Notification === "undefined") {
        setNotificationPermission("unsupported");
        setError("Deze browser ondersteunt geen notificaties.");
        return;
      }

      const currentPermission = Notification.permission;
      setNotificationPermission(currentPermission);

      if (currentPermission === "denied") {
        setError(
          "Notificaties zijn geblokkeerd in je browser. Sta ze toe via het slotje links van de adresbalk en laad de pagina opnieuw.",
        );
        return;
      }

      if (currentPermission !== "granted") {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission !== "granted") {
          setError(
            "Testmelding niet verzonden. Sta notificaties toe om meldingen te testen.",
          );
          return;
        }
      }

      if (!weather) {
        await loadWeather(latestCoordinatesRef.current, { notify: true });
        return;
      }

      const wasSent = await sendWeatherNotification(
        weather,
        locationName || "Locatie onbekend",
      );

      if (!wasSent) {
        setError(
          "Testmelding niet verzonden. Controleer browserondersteuning en permissies.",
        );
      }
    } catch {
      setError("Testmelding kon niet worden verstuurd. Probeer opnieuw.");
    } finally {
      setIsSendingTestNotification(false);
    }
  };

  const loadWeather = async (
    targetCoordinates = coordinates,
    options = { notify: false },
  ) => {
    setIsLoading(true);
    setError("");

    try {
      const weatherData = await getCurrentWeather(
        targetCoordinates.latitude,
        targetCoordinates.longitude,
      );

      setWeather(weatherData);
      let resolvedLocationName = "Locatie onbekend";

      try {
        const placeName = await getLocationName(
          targetCoordinates.latitude,
          targetCoordinates.longitude,
        );
        resolvedLocationName = placeName;
        setLocationName(placeName);
      } catch {
        setLocationName("Locatie onbekend");
      }

      if (options.notify) {
        await sendWeatherNotification(weatherData, resolvedLocationName);
      }
    } catch {
      setError("Weather data kon niet worden opgehaald. Probeer opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(DEFAULT_COORDINATES);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setServiceWorkerStatus("unsupported");
      return;
    }

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        setServiceWorkerStatus(
          registration?.active ? "ready" : "not-registered",
        );
      })
      .catch(() => {
        setServiceWorkerStatus("error");
      });
  }, []);

  useEffect(() => {
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;

    if (isIOSDevice && !isStandalone) {
      setNotificationSupportHint(
        "Op iPhone werken pushnotificaties alleen als je de app via Safari toevoegt aan je beginscherm (iOS 16.4+). Open de app daarna vanaf het beginscherm.",
      );
      return;
    }

    if (!window.isSecureContext) {
      setNotificationSupportHint(
        "Notificaties werken alleen op een beveiligde verbinding (HTTPS of localhost).",
      );
      return;
    }

    setNotificationSupportHint("");
  }, []);

  useEffect(() => {
    const messaging = initializeFirebaseMessaging();

    if (!messaging) {
      return;
    }

    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground message:", payload);
      setLastNotificationAt(new Date().toLocaleString("nl-NL"));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    localStorage.setItem("weatherNotificationInterval", notificationInterval);
  }, [notificationInterval]);

  useEffect(() => {
    latestCoordinatesRef.current = coordinates;
  }, [coordinates]);

  useEffect(() => {
    const intervalInMs = NOTIFICATION_INTERVALS[notificationInterval];

    if (!intervalInMs) {
      return;
    }

    const timerId = setInterval(() => {
      loadWeather(latestCoordinatesRef.current, { notify: true });
    }, intervalInMs);

    return () => {
      clearInterval(timerId);
    };
  }, [notificationInterval]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(
        "Geolocatie wordt niet ondersteund. Standaard locatie gebruikt.",
      );
      return;
    }

    let watcherId = null;
    let isActive = true;

    const startWatchingPosition = () => {
      watcherId = navigator.geolocation.watchPosition(
        (position) => {
          const nextCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setCoordinates(nextCoordinates);
          setLocationSource("live");
          loadWeather(nextCoordinates);
        },
        (geoError) => {
          setLocationSource("fallback");

          if (geoError?.code === geoError.PERMISSION_DENIED) {
            setError(
              "Geolocatie is geblokkeerd in je browser. Standaard locatie gebruikt.",
            );
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 10000,
        },
      );
    };

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (!isActive) {
            return;
          }

          if (permissionStatus.state === "denied") {
            setLocationSource("fallback");
            setError(
              "Geolocatie is geblokkeerd in je browser. Standaard locatie gebruikt.",
            );
            return;
          }

          startWatchingPosition();
        })
        .catch(() => {
          if (!isActive) {
            return;
          }

          startWatchingPosition();
        });
    } else {
      startWatchingPosition();
    }

    return () => {
      isActive = false;

      if (watcherId !== null) {
        navigator.geolocation.clearWatch(watcherId);
      }
    };
  }, []);

  const handleNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      return;
    }

    const currentPermission = Notification.permission;
    setNotificationPermission(currentPermission);

    if (currentPermission === "denied") {
      setError(
        "Notificaties zijn geblokkeerd in je browser. Sta ze toe via het slotje links van de adresbalk en laad de pagina opnieuw.",
      );
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      const token = await requestNotificationToken();
      setFcmToken(token);
    }
  };

  return (
    <main className="app">
      <header className="app-header">
        <h1>Motor Ride Weather</h1>
        <p>Check snel of dit een goede dag is om te rijden.</p>
      </header>

      <WeatherCard
        weather={weather}
        isLoading={isLoading}
        error={error}
        locationSource={locationSource}
        locationName={locationName}
        notificationInterval={notificationInterval}
        notificationPermission={notificationPermission}
        serviceWorkerStatus={serviceWorkerStatus}
        fcmToken={fcmToken}
        lastNotificationAt={lastNotificationAt}
        notificationSupportHint={notificationSupportHint}
        onRequestNotificationPermission={handleNotificationPermission}
        onNotificationIntervalChange={setNotificationInterval}
        onTriggerTestNotification={handleTriggerTestNotification}
        isSendingTestNotification={isSendingTestNotification}
        onRefresh={() => loadWeather(coordinates)}
      />
    </main>
  );
}

export default App;
