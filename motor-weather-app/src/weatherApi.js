const buildApiUrl = (latitude, longitude) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,cloud_cover,weather_code&timezone=auto`;

const buildReverseGeocodeUrl = (latitude, longitude) =>
  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&accept-language=nl`;

export async function getCurrentWeather(latitude, longitude) {
  const apiUrl = buildApiUrl(latitude, longitude);
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();
  const current = data.current;

  if (!current) {
    throw new Error("No current weather data available");
  }

  return {
    temperature: Math.round(current.temperature_2m),
    precipitation: Number(current.precipitation.toFixed(1)),
    cloudCover: Math.round(current.cloud_cover),
    weatherCode: current.weather_code,
  };
}

export async function getLocationName(latitude, longitude) {
  const reverseGeocodeUrl = buildReverseGeocodeUrl(latitude, longitude);
  const response = await fetch(reverseGeocodeUrl);

  if (!response.ok) {
    throw new Error("Location request failed");
  }

  const data = await response.json();
  const address = data.address;

  if (!address) {
    return "Locatie onbekend";
  }

  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    "Locatie onbekend"
  );
}
