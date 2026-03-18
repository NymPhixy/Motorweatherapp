import WeatherIllustration from "./WeatherIllustration";
import RideAdvice from "./RideAdvice";

function WeatherCard({
  weather,
  isLoading,
  error,
  onRefresh,
  locationSource,
  locationName,
  notificationInterval,
  notificationPermission,
  serviceWorkerStatus,
  fcmToken,
  lastNotificationAt,
  notificationSupportHint,
  onRequestNotificationPermission,
  onNotificationIntervalChange,
}) {
  const locationText =
    locationSource === "live" ? "Jouw locatie" : "Standaard locatie";

  const notificationStatusText =
    notificationPermission === "unsupported"
      ? "Niet ondersteund"
      : notificationPermission;

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

      <div className="notification-settings">
        <p className="notification-title">Notificatie updates</p>

        <label className="notification-label" htmlFor="notification-interval">
          Nieuwe update ontvangen:
        </label>
        <select
          id="notification-interval"
          className="notification-select"
          value={notificationInterval}
          onChange={(event) => onNotificationIntervalChange(event.target.value)}
        >
          <option value="1h">Elke 1 uur</option>
          <option value="3h">Elke 3 uur</option>
          <option value="24h">Elke 24 uur</option>
          <option value="72h">Elke 3 dagen</option>
        </select>

        <button
          className="notification-button"
          type="button"
          onClick={onRequestNotificationPermission}
          disabled={notificationPermission === "granted"}
        >
          {notificationPermission === "granted"
            ? "Notificaties actief"
            : "Notificaties inschakelen"}
        </button>

        <p className="notification-status">
          Status notificaties: {notificationStatusText}
        </p>

        {notificationSupportHint ? (
          <p className="notification-status">Tip: {notificationSupportHint}</p>
        ) : null}

        <p className="notification-status">
          Service worker: {serviceWorkerStatus}
        </p>

        {fcmToken ? (
          <p
            className="notification-status"
            style={{ fontSize: "0.75rem", wordBreak: "break-all" }}
          >
            FCM token: {fcmToken.substring(0, 20)}...
          </p>
        ) : null}

        {lastNotificationAt ? (
          <p className="notification-status">
            Laatste melding: {lastNotificationAt}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default WeatherCard;
