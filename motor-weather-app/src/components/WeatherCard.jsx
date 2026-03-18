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
  onTriggerTestNotification,
  isSendingTestNotification,
}) {
  const locationText =
    locationSource === "live" ? "Jouw locatie" : "Standaard locatie";

  const notificationStatusText =
    notificationPermission === "unsupported"
      ? "Niet ondersteund"
      : notificationPermission;

  const serviceWorkerStatusText =
    serviceWorkerStatus === "ready"
      ? "Actief"
      : serviceWorkerStatus === "not-registered"
        ? "Niet geregistreerd (normaal tijdens lokaal testen)"
        : serviceWorkerStatus === "unsupported"
          ? "Niet ondersteund"
          : serviceWorkerStatus === "checking"
            ? "Controleren..."
            : "Fout";

  return (
    <section className="weather-card" aria-live="polite">
      <button
        className="test-notification-button"
        type="button"
        onClick={onTriggerTestNotification}
        disabled={isSendingTestNotification}
      >
        {isSendingTestNotification ? "Bezig..." : "Test melding"}
      </button>

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

        {notificationPermission === "denied" ? (
          <p className="notification-status">
            Tip: sta notificaties toe via het slotje naast de URL en laad daarna
            de pagina opnieuw.
          </p>
        ) : null}

        {notificationSupportHint ? (
          <p className="notification-status">Tip: {notificationSupportHint}</p>
        ) : null}

        <p className="notification-status">
          Service worker: {serviceWorkerStatusText}
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
