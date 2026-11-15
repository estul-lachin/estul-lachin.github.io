# uig-home

The home of **https://uig.me**: who I am, what I can do, and where the proof is.

- `/` the home page, with a live "last hour on the honeypot" feed and one live number per project
- `/incidents/` the list of incident reports and investigations (they live on the project sites)
- `/about/` background, experience, certifications
- `/notes/` longer write-ups

The project sites: [honeypot](https://uig.me/honeypot), [detections](https://uig.me/detections),
[guide](https://uig.me/investigations), [lab](https://uig.me/labs).

`site/` is plain HTML, CSS and JS, deployed by GitHub Pages. `style.css` is the shared chrome and the notes; `home.css` styles the home, incidents and about pages.
`app.js` fills the feed from the honeypot's `recent.json` and one live number per project tile from
`https://uig.me/detections/summary.json`, `https://uig.me/investigations/summary.json` and the honeypot's `stats.json` (in the
`uig-honeypot-data` repo on raw.githubusercontent.com); if one fails, that card just shows no number. A
Content-Security-Policy meta tag in `index.html` allows only those origins for `fetch`, so a new data source must be
added there too. `site/.well-known/` is published because the workflow sets `include-hidden-files`.

Local preview with fixtures: put a `recent.json`, a `stats.json`, a `detections.json` and a `guide.json` in `site/data/`, then
`python3 -m http.server -d site 8000` and open `http://127.0.0.1:8000/?local=1`.

Link preview image: `site/og-image.png` (1200x630) is rendered from `assets/og-image.html` with Chrome:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 --screenshot="$PWD/site/og-image.png" \
  "file://$PWD/assets/og-image.html"
```
