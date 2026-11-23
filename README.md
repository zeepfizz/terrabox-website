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

Some placeholders in square brackets (`[email]`, `[horario de atención]`, `[X]`, `[fecha]`…) still need real values.
Contact data, links and prices live in one file, **`assets/js/config.js`**:

| Setting | What it does |
|---|---|
| `waNumber`, `waDisplay` | WhatsApp number without `+` (17863271803) and how it is written (+1 (786) 327-1803). Every WhatsApp button uses it. |
| `email`, `hours` | Shown in the footer and contact sections. `null` means not published (hours today). |
| `lockerExample`, `advisorName`, `advisorReplyHours`, `legalDate`, `legalName` | Locker format example (TB-300), the commercial advisor, her reply time and the legal-page data. |
| `social` | Instagram / Facebook profile URLs. The footer icons appear only when set. |
| `urls.login`, `urls.register` | Where **Ingresar** and **Registrarse** point (today the site's own pages; later `app.terraboxcargo.com`). |
| `pricing` | Public prices from the owner's onboarding sheet, per destination (`destinations`): Colombia air Courier US$3/lb with a US$30 minimum, Comercial US$5.50/lb with a US$55 minimum, phone US$80 per shipment; México by land US$4.50/lb with a US$45 minimum plus US$10 insurance, phone US$150; Ecuador US$70 per shipment up to 8 lb. Also `roundUp` (4,2 lb is charged as 5 lb) and the Colombia tax-free limit (US$200). The calculator and every `data-price` element use these values. |
| `track(guia)` | What "Rastrea tu envío" does. Until there is a tracking system it opens WhatsApp with the guide number. |
| `endpoints` | URLs that receive the forms as JSON (`registro`, `solicitud`, `contacto`, `compra`, `reclamo`), tracking (`rastreo`) and login (`login`). A Formspree form URL works for `contacto`. Until set, forms validate and then offer to send the same details by WhatsApp. |

## Editing pages

Each page is generated from `_src/pages/<Name>.dc.html` (the design source plus a JSON data block).
To change text, edit that file — or edit the generated `.html` directly for a quick fix — then rebuild:

```bash
python _src/build.py
node scripts/check-contenido.mjs
```

`_src/build.py` also reads the one-line values of `config.js` (WhatsApp, email, …) so the built pages carry them.
`scripts/check-contenido.mjs` fails if a built page shows a `[placeholder]` or a term the owner asked not to publish
(see `docs/handoff-datos-v2.md`, section 5), and checks the consolidation example against the price code.

The build writes every `*.html` page in this folder and `assets/css/interactions.css`. The shared header, footer and FAQ
markup is defined in `_src/build.py`; the price table (`precios`) and the box calculator (`caja`) are shared partials in `_src/partials/`; the prohibited-items
list (used on the home and the Artículos prohibidos page) is `_src/data/prohibidos.json`; icons are inline Lucide SVGs (`_src/icons.py`,
used as `<i data-icon="plane"></i>` in sources).

To preview locally:

```bash
python -m http.server 8000
```

then open http://localhost:8000.

## The 3D homepage

`index.html` runs a WebGL scene (three.js, vendored in `assets/vendor/three.module.min.js`, MIT licence) behind the page:

- `assets/js/home3d.js` builds everything in code (no model files): the TerraBox box with its live price label, the route
  (Miami sign, store, warehouse, plane, customs gate, door), the three price boxes and the "cannot travel" ring.
  Scrolling moves the box and the camera between the states listed in `S` and along `routeState()`.
- The calculator fields resize the 3D box and rewrite its label; prices still come from `TB.quote` and `config.js`.
- `assets/css/home3d.css` lays the text out beside the scene on desktop and under a window onto it on phones.
- Without WebGL the same content shows on plain navy with the drawn SVG box. With "reduce motion" the scene jumps
  between states instead of animating.
- The other 24 pages keep the v2 design.

## Structure

```
index.html, tarifas.html, …   the 25 pages (index.html is the homepage, 404.html the not-found page)
assets/css/tokens.css         design tokens (colours, type, spacing)
assets/css/site.css           components: buttons, fields, header, forms
assets/css/interactions.css   generated hover styles
assets/css/v2.css             redesign v2 system: header, footer, home, Tarifas, Prohibidos, Contacto (see docs/rediseno-v2-brief.md)
assets/js/calculator.js       shipping price math TB.quote (rates from config.js)
assets/js/caja.js             "Arma tu caja" live box calculator (_src/partials/caja.html)
assets/js/motion.js           entrance motion for .rv elements
assets/js/config.js           business settings (see above)
assets/js/site.js             header menus, cookie banner, FAQ, lead forms
assets/js/pages/*.js          page-specific behaviour (calculator, tracking, login, …)
assets/img/                   logos
_src/                         page sources, partials, data and build script
docs/                         handoff notes
```

Photos are free-licensed Unsplash images loaded from Unsplash's CDN (sized and served as WebP/AVIF automatically).
