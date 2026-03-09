function WeatherIllustration({ weather }) {
  if (!weather) {
    return <div className="weather-illustration">⛅</div>;
  }

  let icon = "☀️";

  if (weather.precipitation > 0.2) {
    icon = "🌧️";
  } else if (weather.cloudCover >= 55) {
    icon = "☁️";
  }

  return <div className="weather-illustration">{icon}</div>;
}

export default WeatherIllustration;
