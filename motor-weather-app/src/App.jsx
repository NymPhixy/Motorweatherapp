import { useEffect, useState } from "react";
import WeatherCard from "./components/WeatherCard";
import { getCurrentWeather, getLocationName } from "./weatherApi";
import "./App.css";

const DEFAULT_COORDINATES = {
  latitude: 53.2194,
  longitude: 6.5665,
};

function App() {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES);
  const [locationSource, setLocationSource] = useState("fallback");
  const [locationName, setLocationName] = useState("Groningen");

  const loadWeather = async (targetCoordinates = coordinates) => {
    setIsLoading(true);
    setError("");

    try {
      const weatherData = await getCurrentWeather(
        targetCoordinates.latitude,
        targetCoordinates.longitude,
      );

      setWeather(weatherData);

      try {
        const placeName = await getLocationName(
          targetCoordinates.latitude,
          targetCoordinates.longitude,
        );
        setLocationName(placeName);
      } catch {
        setLocationName("Locatie onbekend");
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
        onRefresh={() => loadWeather(coordinates)}
      />
    </main>
  );
}

export default App;
