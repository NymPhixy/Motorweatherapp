# Motor Ride Weather

Mobile-first React app die motorrijders snel laat zien of het weer geschikt is om te rijden.

## Wat werkt nu

- MVP interface met duidelijke volgorde: header, weer-illustratie, weerdata, ride advice, refresh knop.
- Live weerdata via Open-Meteo (`temperature`, `precipitation`, `cloud cover`).
- Ride advice met duidelijke status:
  - 🟢 Perfect weather to ride
  - 🟡 Good weather but be careful
  - 🔴 Not recommended today
- Locatie via browser geolocation (`watchPosition`) zodat de data actueel blijft.
- Stad/dorp weergave via reverse geocoding.
- Fallbacks voor robuust gedrag:
  - Geen geolocatie toestemming → standaardlocatie
  - Plaatsnaam-service faalt → weerdata blijft zichtbaar

## Tech stack

- React + Vite
- Open-Meteo Forecast API
- OpenStreetMap Nominatim (reverse geocoding)

## Run lokaal

```bash
npm install
npm run dev
```

Open daarna de URL uit je terminal (meestal `http://localhost:5173` of `http://localhost:5174`).

## Build

```bash
npm run build
```

## Korte release note

Deze release vervangt de standaard Vite-startpagina door een complete Motor Ride Weather MVP met component-architectuur, live locatieverversing, plaatsnaamweergave en verbeterde foutafhandeling rondom API-calls.
