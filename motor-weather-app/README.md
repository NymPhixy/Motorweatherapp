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

## Deploy naar Netlify

Omdat deze app in de submap `motor-weather-app/` staat, moet Netlify de juiste base directory gebruiken.

### Aanbevolen: `netlify.toml` in repo root

Plaats in de repo root een `netlify.toml` met:

```toml
[build]
  base = "motor-weather-app"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Netlify UI instellingen (als check)

- Base directory: `motor-weather-app`
- Build command: `npm run build`
- Publish directory: `dist`

De redirect zorgt dat SPA-routes geen 404 geven bij refresh of direct openen van een URL.

## Korte release note

Deze release vervangt de standaard Vite-startpagina door een complete Motor Ride Weather MVP met component-architectuur, live locatieverversing, plaatsnaamweergave en verbeterde foutafhandeling rondom API-calls.
