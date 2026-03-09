function getRideAdvice(weather, isLoading, error) {
  if (isLoading) {
    return {
      level: "neutral",
      message: "Checking current weather...",
      icon: "ℹ️",
    };
  }

  if (error) {
    return {
      level: "neutral",
      message: error,
      icon: "⚠️",
    };
  }

  if (!weather) {
    return {
      level: "neutral",
      message: "Geen weerdata beschikbaar.",
      icon: "ℹ️",
    };
  }

  const perfectRide =
    weather.temperature >= 12 &&
    weather.temperature <= 28 &&
    weather.precipitation <= 0.5 &&
    weather.cloudCover <= 60;

  if (perfectRide) {
    return {
      level: "good",
      message: "Perfect weather to ride",
      icon: "🟢",
    };
  }

  const carefulRide =
    weather.temperature >= 7 &&
    weather.temperature <= 32 &&
    weather.precipitation <= 2.0 &&
    weather.cloudCover <= 85;

  if (carefulRide) {
    return {
      level: "careful",
      message: "Good weather but be careful",
      icon: "🟡",
    };
  }

  return {
    level: "bad",
    message: "Not recommended today",
    icon: "🔴",
  };
}

function RideAdvice({ weather, isLoading, error }) {
  const advice = getRideAdvice(weather, isLoading, error);

  return (
    <div className={`ride-advice ride-advice-${advice.level}`} role="status">
      <span>{advice.icon}</span>
      <strong>{advice.message}</strong>
    </div>
  );
}

export default RideAdvice;
