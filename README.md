# TerraBox Cargo — website

Static website for TerraBox Cargo (casillero en Miami y envíos a Colombia), built from the Claude Design handoff.
Plain HTML, CSS and JavaScript: no frameworks and no build step is needed to host it.

## Publish on GitHub Pages

1. Create a new repository on GitHub (for example `terrabox-website`).
2. Upload **everything inside this `website` folder** to the root of the repository
   (on github.com: *Add file → Upload files*, drag the folder contents in, then *Commit changes*).
   Or from a terminal inside this folder:
   ```bash
   git init
   git add .
   git commit -m "TerraBox website"
   git branch -M main
   git remote add origin https://github.com/<your-user>/terrabox-website.git
   git push -u origin main
   ```
3. In the repository go to **Settings → Pages**, set *Source* to **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
4. After a minute the site is live at `https://<your-user>.github.io/terrabox-website/`.
   To use your own domain (e.g. `terraboxcargo.com`), enter it under *Settings → Pages → Custom domain* and follow GitHub's DNS instructions.

The `_src` folder is ignored by GitHub Pages; it only holds the sources used to regenerate the pages.

## Before going live: fill in the business data

Placeholders in square brackets (`[X]`, `[teléfono]`, `[Dirección completa]`, `[fecha]`…) come from the design and still need real values.
The connections live in one file, **`assets/js/config.js`**:

| Setting | What it does |
|---|---|
| `waNumber` | WhatsApp number in international format without `+` (e.g. `13055551234`). Every WhatsApp button uses it. |
| `endpoints` | URLs that receive the forms as JSON (`registro`, `solicitud`, `contacto`, `compra`, `reclamo`), shipment tracking (`rastreo`) and login (`login`). Until they are set, forms validate and then offer to send the same details by WhatsApp. |
| `rates` | Price per lb and minimum per city, e.g. `{ 'Bogotá': { perLb: 4.5, min: 10 } }`. Turns on real totals in the calculator. |
| `volumetricDivisorIn` | Volumetric divisor in in³/lb (e.g. `166`). |

## Editing pages

Each page is generated from `_src/pages/<Name>.dc.html` (the design source plus a JSON data block).
To change text, edit that file — or edit the generated `.html` directly for a quick fix — then rebuild:

```bash
python _src/build.py
```

The build writes every `*.html` page in this folder and `assets/css/interactions.css`. The shared header, footer and FAQ
markup is defined in `_src/build.py`.

To preview locally:

```bash
python -m http.server 8000
```

then open http://localhost:8000.

## Structure

```
index.html, tarifas.html, …   the 25 pages (index.html is the homepage, 404.html the not-found page)
assets/css/tokens.css         design tokens (colours, type, spacing)
assets/css/site.css           components: buttons, fields, header, forms
assets/css/interactions.css   generated hover styles
assets/js/config.js           business settings (see above)
assets/js/site.js             header menus, cookie banner, FAQ, lead forms
assets/js/pages/*.js          page-specific behaviour (calculator, tracking, login, …)
assets/img/                   logos
_src/                         page sources and build script
```
