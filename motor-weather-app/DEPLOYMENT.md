# Deployment naar Firebase Hosting

Deze app is klaar voor deployment naar Firebase Hosting.

## Eenmalige setup

### 1. Installeer Firebase CLI globaal (alleen eerste keer)

```bash
npm install -g firebase-tools
```

### 2. Login bij Firebase

```bash
firebase login
```

Er opent een browser waarin je inlogt met je Google account.

### 3. Initialiseer Firebase project

```bash
firebase init hosting
```

Kies:

- "Use an existing project" → selecteer je Firebase project
- Public directory: `dist`
- Single-page app: `Yes`
- Automatic builds with GitHub: `No` (of Yes als je GitHub Actions wilt)

**LET OP**: Als je al een `firebase.json` hebt (zoals nu), kun je deze stap overslaan.

## Deployment

### Stap 1: Build de productie-versie

```bash
npm run build
```

Dit maakt een `dist/` folder met geoptimaliseerde bestanden.

### Stap 2: Deploy naar Firebase

```bash
firebase deploy --only hosting
```

Je krijgt een URL zoals: `https://jouw-project-id.web.app`

## Scripts toevoegen aan package.json (optioneel)

Voeg toe voor snellere workflows:

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting",
    "serve:firebase": "firebase serve"
  }
}
```

Dan kun je deployen met:

```bash
npm run deploy
```

## Lokaal testen met Firebase Hosting emulator

Test de productie-build lokaal voordat je deploy:

```bash
npm run build
firebase serve
```

Open http://localhost:5000

## Custom domein koppelen

1. Ga naar Firebase Console → Hosting
2. Klik "Add custom domain"
3. Voer je domeinnaam in (bijv. motorweather.nl)
4. Volg de DNS-instructies

Firebase geeft automatisch gratis SSL certificaat.

## Automatische deploys met GitHub Actions (optioneel)

Bij `firebase init hosting` kun je GitHub Actions inschakelen.

Dan wordt je app automatisch gedeployed bij elke push naar main.

## Troubleshooting

**"Project not found"**

- Run `firebase use --add` en selecteer je project

**"dist folder not found"**

- Zorg dat je eerst `npm run build` hebt gedraaid

**Service worker errors**

- Check of alle paden correct zijn in `firebase.json`
- Verifieer dat `sw.js` en `firebase-messaging-sw.js` in `public/` staan

## Monitoring

Na deployment kun je je app monitoren:

```bash
firebase hosting:channel:list     # Alle deploy channels
firebase hosting:channel:deploy preview  # Deploy naar preview channel
```

Performance & analytics zie je in Firebase Console onder "Hosting".
