# HSR Station Lookup (GitHub Pages)

Static frontend app where user selects:
- from station
- to station

The app then shows all other values from the matching CSV row.

## Features

- Works fully in browser (no backend)
- Auto-loads bundled `data/HsrTimeDist.csv`
- Handles semicolon-separated CSV with quoted values
- Optional reverse-route lookup when exact row is missing

## Files

- `index.html`
- `styles.css`
- `script.js`
- `data/HsrTimeDist.csv`
- `.github/workflows/pages.yml`

## Local run

You can open `index.html` directly in a browser.

Or run a simple static server:

```powershell
npx --yes serve .
```

## Publish as standalone GitHub repository

1. Create a new empty GitHub repository (for example `hsr-station-pages`).
2. Copy these files into that repository.
3. Push your code.
4. In GitHub: **Settings -> Pages** and set source to **GitHub Actions**.
5. The included workflow deploys automatically on pushes to `main`.

## Notes

- The app loads `./data/HsrTimeDist.csv` on startup.

