import WeatherIllustration from "./WeatherIllustration";
import RideAdvice from "./RideAdvice";

function WeatherCard({
  weather,
  isLoading,
  error,
  onRefresh,
  locationSource,
  locationName,
}) {
  const locationText =
    locationSource === "live" ? "Jouw locatie" : "Standaard locatie";

  return (
    <section className="weather-card" aria-live="polite">
      <WeatherIllustration weather={weather} />

      <p className="location-label">
        {locationText}: {locationName}
      </p>

      <div className="weather-data">
        <p>Temperature: {weather ? `${weather.temperature}°C` : "--"}</p>
        <p>Rain: {weather ? `${weather.precipitation} mm` : "--"}</p>
        <p>Cloud cover: {weather ? `${weather.cloudCover}%` : "--"}</p>
      </div>

      <RideAdvice weather={weather} isLoading={isLoading} error={error} />

      <button
        className="refresh-button"
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? "Checking..." : "Check Weather"}
      </button>
    </section>
  );
}

export default WeatherCard;
