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

  const latestCoordinatesRef = useRef(DEFAULT_COORDINATES);

  const sendWeatherNotification = async (weatherData, placeName) => {
    if (typeof Notification === "undefined") {
      return;
    }

    if (Notification.permission !== "granted") {
      return;
    }

    const advice = getRideAdvice(weatherData, false, "");
    const messageBody = `${placeName}: ${weatherData.temperature}°C, ${weatherData.precipitation} mm regen, ${weatherData.cloudCover}% bewolking. ${advice.message}`;

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;

      if (registration.active) {
        registration.active.postMessage({
          type: "SHOW_WEATHER_NOTIFICATION",
          title: "Motor Ride Weather update",
          body: messageBody,
        });
        setLastNotificationAt(new Date().toLocaleString("nl-NL"));
        return;
      }
    }

    new Notification("Motor Ride Weather update", {
      body: messageBody,
    });

    setLastNotificationAt(new Date().toLocaleString("nl-NL"));
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

    navigator.serviceWorker.ready
      .then(() => {
        setServiceWorkerStatus("ready");
      })
      .catch(() => {
        setServiceWorkerStatus("error");
      });
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

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCoordinates(nextCoordinates);
        setLocationSource("live");
        loadWeather(nextCoordinates);
      },
      () => {
        setLocationSource("fallback");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  const handleNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
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
        onRequestNotificationPermission={handleNotificationPermission}
        onNotificationIntervalChange={setNotificationInterval}
        onRefresh={() => loadWeather(coordinates)}
      />
    </main>
  );
}

export default App;
