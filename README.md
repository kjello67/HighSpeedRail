# HSR Stasjonssøk (GitHub Pages)

Statisk frontend-app der brukeren velger:
- fra stasjon
- til stasjon

Appen viser deretter alle andre verdier fra den matchende CSV-raden.

## Funksjoner

- Fungerer helt i nettleseren (ingen backend)
- Laster automatisk vedlagt `data/HsrTimeDist.csv`
- Håndterer semikolonseparert CSV med siterte verdier

## Filer

- `index.html`
- `styles.css`
- `script.js`
- `data/HsrTimeDist.csv`
- `.github/workflows/pages.yml`

## Lokal kjøring

Du kan åpne `index.html` direkte i en nettleser.

Eller kjør en enkel statisk server:

```powershell
npx --yes serve .
```

## Publiser som frittstående GitHub-repositorium

1. Opprett et nytt tomt GitHub-repositorium (for eksempel `hsr-station-pages`).
2. Kopier disse filene inn i repositoriet.
3. Push koden din.
4. I GitHub: **Settings -> Pages** og sett kilde til **GitHub Actions**.
5. Den medfølgende workflowen publiserer automatisk ved push til `main`.

## Merknader

- Appen laster `./data/HsrTimeDist.csv` ved oppstart.

