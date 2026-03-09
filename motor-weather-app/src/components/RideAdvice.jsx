export function getRideAdvice(weather, isLoading, error) {
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

  const isDry = weather.precipitation <= 0.2;
  const isWetRoad = weather.precipitation > 0.2;
  const isSunny = weather.cloudCover <= 35;
  const isVeryCloudy = weather.cloudCover >= 85;
  const isCold = weather.temperature < 5;
  const isVeryCold = weather.temperature <= -5;
  const isFoggy = weather.weatherCode === 45 || weather.weatherCode === 48;

  if (isVeryCold && (isVeryCloudy || isFoggy)) {
    return {
      level: "bad",
      message: "Gevaarlijk weer om te rijden",
      icon: "🔴",
    };
  }

  if (weather.temperature >= 15 && isDry && isSunny) {
    return {
      level: "good",
      message: "Lekker motorrijweer",
      icon: "🟢",
    };
  }

  if (isDry && isCold) {
    return {
      level: "careful",
      message: "Droog, maar koud. Kleed je warm aan",
      icon: "🟡",
    };
  }

  if (isWetRoad && weather.temperature <= 10) {
    return {
      level: "careful",
      message: "Matig rijweer: koud, regen en nat wegdek",
      icon: "🟡",
    };
  }

  if (isWetRoad) {
    return {
      level: "careful",
      message: "Matig weer om te rijden door nat wegdek",
      icon: "🟡",
    };
  }

  if (isDry) {
    return {
      level: "good",
      message: "Droog weer, prima om te rijden",
      icon: "🟢",
    };
  }

  return {
    level: "careful",
    message: "Wisselende omstandigheden, rij extra voorzichtig",
    icon: "🟡",
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
