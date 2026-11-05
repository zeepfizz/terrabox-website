# TerraBox Cargo — Rediseño v2: brief de dirección de arte

Branch: `rediseno-v2`. Stack unchanged: static HTML built by `python _src/build.py` from `_src/pages/*.dc.html`,
shared chrome in `_src/build.py`, partials in `_src/partials/`, data in `_src/data/`, icons via `<i data-icon="name">`
(Lucide, `_src/icons.py`). GitHub Pages serves the repo root. Never hand-edit the generated `*.html` at the root:
edit sources and rebuild.

The goal: a user-friendly site that does not look AI-generated. Fewer boxes, no labels above headings, no stock
names ("Ventajas", "¿Cómo funciona?" as decoration), no rows of identical cards. Large type, whole fields of
colour, real photographs of the world the boxes travel through, and one live thing.

## 1. Inventory (things only TerraBox has)

1. **The name.** Terra + box: land and the box. The logo is an isometric cube with stacked bands (a box).
2. **The box itself**: cardboard, tape, the label. The customer's purchase becomes a box.
3. **The TBX address.** Every customer gets a line like `Tu nombre TBX-0000` to write in the store's checkout,
   plus the Miami warehouse address. This printed line is the customer's key to the service.
4. **The route**: an American store → TerraBox warehouse in Miami → flight → Colombian customs → the customer's door.
5. **The official numbers**: US$25 (1–4 lb), US$30 (5–10 lb), US$3 each extra pound, 5 to 7 business days,
   insurance included, national transport to main cities included, zero tax up to US$200 declared per box,
   up to 6 identical items per box, US$100 paid per box if it is lost.
6. **The rule set**: ten categories that cannot travel (DIAN rules).
7. **The people**: a Colombian company in Miami; customers in Bogotá, Medellín, Cali, Barranquilla; WhatsApp as
   the way people actually talk to it.
8. **The brand colours**: navy `#15369c`, deep navy `#0a1a4d`, cargo blue `#228ecf`, cube cyan `#4dd1f3`.

## 2. Argument (one claim per section, in this order)

| # | Section (`id`) | Claim | Proof on the page |
|---|---|---|---|
| 1 | Hero | You get a Miami address and your US purchases arrive home in 5–7 days, from US$25. | Headline, price, a large photo of a box arriving at a door, the "Regístrate gratis" button. |
| 2 | `#caja` (live thing) | You know the price before you buy. | The box calculator: type the weight and value, the drawn TerraBox box grows and its label shows the price and the tax line. |
| 3 | `#ruta` | We take care of every step from the store to your door. | The route told as a sequence of five places with real photographs (store → Miami → flight → customs → your door). |
| 4 | `#precios` | The price is simple and includes insurance. | The three numbers set very large as a typographic price table, the five official conditions beside it. |
| 5 | `#direccion` | Using it is as easy as writing one line at checkout. | The customer's Miami address as a printed shipping label with the TBX line; "Regístrate y recibe la tuya". |
| 6 | `#prohibidos` | We tell you what cannot travel before you buy. | The ten categories as a two-column typographic list (name + one line), link to the full page. |
| 7 | `#contacto` | A real person answers you. | WhatsApp as the big action, email and hours from config, the short contact form. |
| 8 | Footer | Closing: the name at full width. | Wordmark large, links, legal, photo credits line. |

No "ventajas" grid: the advantages live inside the claims above (insurance in the prices, transport in the route,
WhatsApp in contact). No trust strip of icons.

## 3. Direction (chosen by hand; the skill's draw script is not installed)

**"Cargo poster"**: huge sentence-case type, whole fields of flat brand colour, full-bleed photography placed
asymmetrically inside a strict grid. Borrowed ideas, not copies:
- Cargokite: whole screens of one flat colour with a very large statement; photos offset against them.
- Lodisna: the headline set enormous, light weight, directly with the photograph.
- Freezpak: the life of a shipment told in order as the page scrolls.
- Emons: the company draws its own world (its trucks, its warehouse) — we draw only the TerraBox box.
- MVP Logistics: plain, direct copy.

Why this one: TerraBox's selling points are numbers (US$25, 5–7 días, US$200) and a route. Numbers set huge and
a route told in photographs carry them better than cards.

## 4. The idea and the live thing

> On this page, **the TerraBox cube (the logo is a box)** becomes **the customer's own box**: the calculator draws
> their box growing with the pounds, and its label carries their price.

Competitor test: Skybox or any other casillero cannot use it: the cube is TerraBox's mark.

**Live thing — "Arma tu caja"** (`#caja`, right after the hero, also on `tarifas.html`):
- Inputs: weight in lb, declared value in US$ (big, thumb-sized fields).
- Output: an isometric box drawn in SVG in the logo's language (cyan top, blue left, navy right faces, the
  stacked bands of the logo as tape lines). Its size steps with the price tier: small (1–4 lb), medium (5–10 lb),
  large (>10 lb, growing a little per extra pound up to a cap). A white label on the right face shows
  `US$30`, `7 lb` and the tax line.
- Text beside it (live region): price, "Peso cobrado", "Cero pago de impuestos." or "Paga impuestos adicionales
  (arancel e IVA).", "Incluye seguro y transporte nacional a ciudades principales", fine print "Valor de
  referencia. El precio final se confirma al recibir el paquete en bodega.", button "Regístrate gratis".
- Logic stays in `assets/js/calculator.js` (`TB.quote`); rates in `assets/js/config.js`. Keep the existing
  behaviour (rounding up, `?peso=&valor=` prefill) and its tested results: 1→25, 4→25, 5→30, 10→30, 11→33,
  12→36; value 150 → no tax, 250 → tax.
- Fallback without JS: the static price list stays readable next to it; the box shows the medium size.
- Motion: the box scales between sizes with a 240ms ease; none with `prefers-reduced-motion`.

## 5. Tokens

```
--ground:      #ffffff
--ground-2:    #f2f4f8   (tone step for alternate sections; no lines between sections)
--ink:         #0a1a4d   (all running text and headings on light grounds)
--field:       #15369c   (whole-section colour fields; text on it #ffffff)
--field-deep:  #0a1a4d   (footer, hero field)
--accent:      #4dd1f3   (cyan: on navy fields only — button fill with navy text, the box's top face, one highlight)
--action:      #15369c   (primary button on light grounds, white text)
--link:        #1a74ab   (inline links on light grounds, underlined)
--wa:          #15803d   (WhatsApp action only)
```
Type: **Instrument Sans only** (already loaded). Sizes (desktop / phone):
- Display: clamp(56px, 9vw, 152px), weight 600, tracking -0.045em, leading 0.92.
- Heading (section h2): clamp(36px, 5vw, 72px), weight 600, tracking -0.03em, leading 1.0.
- Statement (`<p class="statement">`): clamp(22px, 2.4vw, 34px), weight 400, leading 1.25, ≤ 25 words.
- Body: 18px / 1.55 (17px phone), full ink colour. Small: 15px for notes only.
Five sizes maximum.

Space: one grid of 12 columns, outer margin `clamp(20px, 4vw, 56px)` both sides, max width 1440px.
Sections 160px apart on desktop (96px phone) — use colour fields to separate, not lines.

Buttons: square corners (radius 0), flat fill, 56px tall, label + arrow icon. Primary on light: navy fill,
white text. Primary on navy: cyan fill, navy text. Secondary: text link with arrow, underlined on hover.
Inputs: 64px tall, square, 2px solid ink border only on focus-capable inputs (form fields may have borders).

Media: square corners, `object-fit: cover`, same treatment everywhere (no filters, no rounded photos, no shadows).

## 6. House rules (no exceptions)

- Headlines ≤ 2 lines at every width (1440, 768, 390). Cut words before shrinking type.
- One `h1` per page on the first screen; every section opens with an `h2` that names it plainly.
- No eyebrows / small labels above headings. No pill badges. No tiny uppercase tracked labels anywhere
  (footer column titles too: sentence case, normal size).
- No monospace (the TBX label uses Instrument Sans with tabular figures).
- No "01/02/Paso 1" numbering. Order shown by position and words; a real `<ol>` where order matters.
- No thin rules, hairline dividers or 1px outlined boxes (form fields and real tables excepted).
- No gradients (a flat neutral scrim under text on a photo is allowed). No shadows except on what floats
  (the mobile menu, the WhatsApp button, the cookie banner). No glass / backdrop blur (remove it from the header).
- No icon-topped cards, no rows of identical cards, no icons in tinted circles/squares. Icons only inline in
  buttons/links, at text size, in `currentColor`.
- No emoji, no decorative blobs/circles (remove the hero circle), no styled accent word in headlines.
- Equal outer margins; no section huddled on one side with the other half empty.
- No blank stretch taller than half a screen.
- At least 4 real photographs on the home (we have 12 in `assets/img/photos/`, credits in
  `assets/img/photos/credits.json`; credit line goes in the footer, small).

## 7. Home copy deck (Spanish, Colombia, tuteo)

**Header**: wordmark · Cómo funciona (`#ruta`) · Tarifas (`tarifas.html`) · Prohibidos (`productos-restringidos.html`)
· Rastrear (`rastreo.html`) · Contacto (`#contacto` / `contacto.html`) · Ingresar (link) · **Registrarse** (button).
URLs for Ingresar/Registrarse keep `data-tb-url="login|register"`.

**Hero** (field-deep navy left 7 columns, photo `entrega-puerta` right 5 columns, full height on desktop; on phone
the photo goes under the text, full width, 4:3):
- h1: **Tu casillero en Miami.** (22 chars)
- Statement: Compra en tiendas de Estados Unidos y recíbelo en tu casa en Colombia en 5 a 7 días hábiles.
- Price line (large, cyan): Desde US$25, con seguro incluido.
- Button: Regístrate gratis →  · link: Calcula tu envío ↓ (`#caja`)
- Below the hero, same field: the tracking form "¿Ya enviaste? Rastrea tu guía" (one input + button), behaviour
  from `TB.track` (form class `track`, existing JS).

**#caja** — h2: **Arma tu caja y mira el precio.** Statement: Escribe cuánto pesa y cuánto vale. El precio
incluye seguro y transporte nacional. → the live thing (section 4).

**#ruta** — h2: **De la tienda a tu puerta.** Five stops in an `<ol>`, each a photo + a heading + one sentence
(official texts):
1. *Te registras* — Regístrate y recibe tu dirección en Miami. (photo `compra-portatil`)
2. *Compras* — Compra en tus tiendas favoritas de EE. UU. (photo `compra-celular`)
3. *Lo recibimos en Miami* — Recibimos y revisamos tu paquete en bodega. (photo `bodega-equipo`)
4. *Vuela a Colombia* — Lo enviamos a Colombia (aduana incluida en el proceso). (photo `avion-carga`)
5. *Llega a tu puerta* — Lo recibes en tu puerta en 5 a 7 días hábiles. (photo `caja-puerta`)
Composition: a horizontal track on desktop (large photos, staggered heights, text under each), a vertical
sequence on phone. Not cards: no borders, no backgrounds behind the text.

**#precios** (whole navy field, white text) — h2: **Lo que pagas.** Typographic table, the numbers huge:
- 1 a 4 libras — **US$25**
- 5 a 10 libras — **US$30**
- Cada libra adicional — **US$3**
Line under it: Incluye seguro y transporte nacional a ciudades principales.
Beside it (h3 "Condiciones", list, official text): Se responde por US$100 en caso de pérdida de caja. ·
Declarado por caja hasta US$200: cero pago de impuestos. · Declarado superior a US$200: paga impuestos
adicionales (arancel e IVA). · Hasta 6 productos iguales por caja. · Tiempo de entrega: 5 a 7 días hábiles.
Amounts keep `data-price="tier0|tier1|extra"`. Link: Ver todas las tarifas → `tarifas.html`.

**#direccion** — h2: **Tu dirección en Miami.** Statement: Al registrarte recibes una dirección en nuestra
bodega con tu número de casillero. La escribes al pagar en cualquier tienda y nosotros hacemos el resto.
The label: a white shipping label drawn in HTML/CSS (not a card: the label object itself, slightly rotated is
not allowed — keep it straight), lines: `Full name: Tu nombre TBX-0000` · `Address: [Dirección de la bodega]` ·
`City: Miami · State: FL · ZIP: [código postal]`. Next to it photo `caja-carton` large. Button: Regístrate gratis.

**#prohibidos** — h2: **Lo que no puede viajar.** Statement (official): El envío de paquetes y mercancías por
courier o tráfico postal a Colombia tiene prohibiciones estrictas según la DIAN y las principales empresas de
transporte. Then the ten categories from `_src/data/prohibidos.json` as a two-column list: category name in
bold, its official text after it. Link: Ver los límites y la lista completa → `productos-restringidos.html`.

**#contacto** (ground-2) — h2: **Habla con una persona.** Statement: Te respondemos por WhatsApp en horario de
atención. Big WhatsApp button (green) + email + hours (`data-tb="email|hours"`), and the short contact form
(existing Lead-Form, fields nombre, email, whatsapp, mensaje, consent). Photo `entrega-caja` or `bodega-estantes`.

**Footer** (field-deep): `terrabox` wordmark set at full width (SVG reversed logo scaled to the container width),
three short link groups with sentence-case titles, legal links, © 2026 TerraBox Cargo, and one small line:
"Fotografías: Unsplash (Vitaly Gariev, rupixen, …)". Floating WhatsApp button stays (round, green, shadow ok).

## 8. Inner pages

Same system everywhere. Each inner page: a navy hero field with `h1` (≤2 lines) + statement + breadcrumb as plain
text link, then its sections from the system (statement + photo split, typographic lists, the box calculator
on Tarifas, the typographic price table, accordions for long lists, forms). Strip legacy inline styles that break
the house rules (11px uppercase labels, monospace, hairline borders, cards, `[X]` placeholders may stay as
content). Keep every form, id, anchor and JS behaviour working (lead forms, rastreo, ingresar, registro,
ayuda search, FAQ accordions, cookie banner, mobile menu, sticky bar).

## 9. Definition of done

- `python _src/build.py` runs clean; no template leftovers; all local links/anchors resolve.
- No JS errors on any of the 25 pages; no horizontal scroll at 390/768/1440.
- House rules hold on home, tarifas, productos-restringidos, contacto and the shared chrome everywhere.
- Calculator results unchanged (see §4).

## 10. Component reference (v2.css)

Everything lives in `assets/css/v2.css` (loaded on every page after tokens/site/interactions). Type uses five
classes only: `.display` (h1), `.heading` (section h2), `.statement`, body (default), `.small`. A bare `h3` is set at
statement size, semibold. Add `rv` to headings, statements, photos and list items to get the entrance motion
(`assets/js/motion.js`; only elements below the first screen are hidden, so pages stay readable without JS).
Inline links inside `p`, `dd`, `li` are underlined automatically; never style links with inline CSS.

**Section shells.** `.section` (160px/96px vertical), `.section--tone` (ground-2), `.field` (navy, white text).
Inside, `.wrap` gives the 1440px max width and the outer margins. `.head` is the section opening: h2 left (7 cols),
statement right (5 cols) on desktop, stacked below 1024px.
```html
<section class="section section--tone" aria-labelledby="x-h">
  <div class="wrap">
    <div class="head">
      <h2 id="x-h" class="heading rv">Lo que pagas.</h2>
      <p class="statement rv">Una frase de hasta 25 palabras.</p>
    </div>
    …
  </div>
</section>
```

**Inner-page hero** (navy field, one h1 ≤ 2 lines: keep it ≤ ~26 characters, ≤ 13 per line at 390px).
```html
<section class="phero" aria-labelledby="h1">
  <div class="wrap">
    <nav class="phero__crumb" aria-label="Ruta de navegación"><a href="Inicio.dc.html">Inicio</a> / <span aria-current="page">Tarifas</span></nav>
    <h1 id="h1" class="display">Tarifas de envío.</h1>
    <p class="statement">Frase corta.</p>
    <div class="actions"><a class="btn btn--accent" href="Registro.dc.html" data-tb-url="register">Regístrate gratis <i data-icon="arrow-right" class="btn__arrow"></i></a></div>
  </div>
</section>
```

**Statement + photo split** (text 6 cols, photo 5 cols right; photo 4:5 desktop, 4:3 phone).
```html
<div class="wrap split">
  <div class="split__text">
    <h2 class="heading rv">…</h2>
    <p class="statement rv">…</p>
    <div class="tblock rv"><h3>Subtítulo</h3><p>Texto.</p></div>
    <div class="actions rv">…buttons…</div>
  </div>
  <figure class="split__photo rv"><img src="assets/img/photos/x-800.webp" srcset="… 800w, … 1600w" sizes="(min-width:1024px) 40vw, 100vw" width="800" height="1000" alt="…" loading="lazy" decoding="async"></figure>
</div>
```

**Typographic list** (name + one line, two columns from 768px; no cards, no icons).
```html
<ul class="tlist tlist--2">
  <li class="rv"><strong>Armas y explosivos:</strong> armas de fuego, municiones…</li>
</ul>
```

**Price table** (navy field: `.ptable`, numbers at display size; the official version is the `precios` partial:
`<dc-import name="Include" file="precios" link-href="Tarifas.dc.html" link-label="Ver todas las tarifas">`).
Light grounds: `.ptable--light` (numbers at heading size, row rules allowed because it is a real table).
```html
<table class="ptable ptable--light">
  <caption class="sr-only">…</caption>
  <tbody><tr><th scope="row">Unos tenis, 3 libras<span>Rango de 1 a 4 libras.</span></th><td>US$25</td></tr></tbody>
</table>
```

**Accordion** (site.js drives `.faq/.faq-item/.faq-btn/.faq-sign` + `role=region`; the `Faq` component in
build.py already emits this). `.acc--lg` sets the questions at statement size (short titles only). Pair it with a
heading column using `.aside`:
```html
<div class="wrap aside">
  <div class="aside__head"><h2 class="heading rv">…</h2><p class="rv">…</p></div>
  <div class="faq acc">
    <div id="item" class="faq-item acc__item">
      <h3 class="acc__h"><button type="button" class="faq-btn acc__btn" id="q-item" aria-expanded="false" aria-controls="a-item"><span>Pregunta</span><span aria-hidden="true" class="faq-sign acc__sign">+</span></button></h3>
      <div id="a-item" role="region" aria-labelledby="q-item" hidden class="acc__panel"><p>Respuesta.</p></div>
    </div>
  </div>
</div>
```

**Form layout** (contact data left, Lead-Form right; fields are restyled globally: 64px, square, 2px ink border).
```html
<div class="wrap contact">
  <div class="contact__text">
    <h2 class="heading rv">Escríbenos.</h2>
    <dl class="contact__data"><div><dt>Email</dt><dd><a data-tb="email" href="#">[email]</a></dd></div></dl>
    <figure class="contact__photo"><img …></figure>
  </div>
  <div class="contact__form"><dc-import name="Lead-Form" …></dc-import></div>
</div>
```

**Buttons and links.** All square, 56px. `.btn--primary` (navy, on light grounds), `.btn--accent` (cyan, on navy
only), `.btn--wa` (WhatsApp only), `.btn--tone` (quiet secondary), `.btn--big` (72px), `.btn--compact` (48px,
header). Secondary action: `<a class="link-arrow" href="…">Texto <i data-icon="arrow-right" class="btn__arrow"></i></a>`.
Group them in `<div class="actions">`. Icons only inside buttons/links, at text size.

**Box calculator.** `<dc-import name="Include" file="caja"></dc-import>` inside a section, plus
`<script src="assets/js/caja.js"></script>` after `</x-dc>`. One per page (fixed ids).
