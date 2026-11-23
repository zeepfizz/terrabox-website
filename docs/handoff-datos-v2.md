# TerraBox Cargo — Web pública: Handoff v2 · Datos reales y textos legales (para Claude Code)

> Preparado el 23 nov 2026. Va en el repo de la **web pública** (GitHub Pages), **no** en `terrabox-os`.
> Copia dos archivos al repo:
> - este archivo como `docs/handoff-datos-v2.md`
> - `terrabox-web-textos-legales.md` como `docs/textos-legales.md`
>
> Al final hay un prompt inicial.

---

## 1. Objetivo

La web ya está rediseñada (handoff v1) y tiene muchas páginas con marcadores pendientes del tipo `[X]`, `[email]`, `[horario]`, `[Dirección de la bodega]`, `[Gratis o US$X]`, `[Condición]`, `[agente de aduanas]`, `[Porcentajes por confirmar]`, `[fecha]`, etc. La dueña respondió el Excel de datos faltantes. Este trabajo consiste en:

1. **Poner los datos reales** donde hoy hay marcadores (sección 4).
2. **Quitar o esconder** lo que la dueña pidió no publicar (sección 5).
3. **Crear las páginas legales** con los textos de `docs/textos-legales.md` y conectarlas al registro, al formulario y al pie de página (sección 6).

**Listo cuando:** no queda ningún marcador entre corchetes en el sitio publicado, nada de la sección 5 aparece en ninguna página, las 4 páginas legales están enlazadas desde el pie de página y las casillas de autorización funcionan.

---

## 2. Antes de tocar nada

1. Lee el repo y ubica el **archivo de configuración central** (WhatsApp, email, URLs, tarifas). Si los datos de contacto están repetidos en el HTML, centralízalos ahí primero.
2. Haz un **inventario de marcadores**: busca en todos los archivos de contenido con
   `grep -rnoE "\[[^]\[]{1,60}\]" --include=*.html --include=*.js --include=*.json --include=*.md .`
   (filtra falsos positivos: arreglos JS, enlaces markdown). Guarda la lista en `docs/inventario-marcadores.md` con archivo, línea y marcador.
3. Asigna cada marcador a una fila de la sección 4 o 5. Si alguno no encaja, anótalo en la sección «Sin resolver» del inventario y **no inventes el dato**.
4. Trabaja en la rama `datos-v2` y abre un PR al terminar. No hagas push a `main`.

---

## 3. Configuración central (valores nuevos)

```js
// valores confirmados por la dueña (Excel, 23 nov 2026)
WHATSAPP_E164      = "17863271803"            // para wa.me/17863271803
WHATSAPP_DISPLAY   = "+1 (786) 327-1803"
EMAIL              = "infoterraboxcargo@gmail.com"
TELEFONO_BODEGA    = WHATSAPP_DISPLAY          // el mismo número
CASILLERO_FORMATO  = "TB-000"                  // ejemplo visible: "TB-300"
HORARIO            = null                      // no se publica
INSTAGRAM_URL      = null                      // vacío = no mostrar ícono
FACEBOOK_URL       = null                      // vacío = no mostrar ícono
DIRECCION_BODEGA   = null                      // no se publica (ver 4.1)
ASESOR_COMERCIAL   = "Maria Jacome"
RESPUESTA_ASESOR_H = 24
LEGAL_FECHA        = "noviembre de 2026"
RAZON_SOCIAL       = "TerraBox Cargo LLC"
```

Regla: cuando un valor sea `null`, el componente que lo usa **no se muestra** (sin dejar el rótulo vacío).

---

## 4. Datos a poner, por tema

### 4.1 Contacto, bodega y casillero

| ID | Dónde | Qué poner |
|---|---|---|
| C01 | Todos los botones de WhatsApp | `wa.me/17863271803` |
| C02 | Pie de página, Inicio, Contacto | infoterraboxcargo@gmail.com |
| C03 | Pie, Inicio, Contacto, Nosotros | **Quitar el horario** en todas partes. Donde decía «Atendemos [horario]», dejar «Escríbenos por WhatsApp». |
| C04–C05 | Pie de página | Sin Instagram ni Facebook por ahora: ocultar los íconos. |
| C06–C08 | Inicio, Casillero virtual, Tiendas, Nosotros | **La dirección de la bodega no se publica.** Cambiar los bloques de dirección por: «Al registrarte te enviamos tu dirección completa en Miami con tu número de casillero». En la guía de **Tiendas**, mostrar el formato de llenado con rótulos genéricos en vez de datos reales: *Nombre:* tu nombre + `TB-300` · *Dirección (línea 1):* la que te damos al registrarte · *Ciudad/Estado/ZIP:* Miami, FL, el ZIP que te damos · *Teléfono:* +1 (786) 327-1803. |
| C09 | Tiendas | Teléfono = el mismo del WhatsApp. |
| C10 | Inicio, Casillero virtual, Tiendas, Registro | Cambiar **todo** `TBX-0000` por el formato `TB-000` (ejemplo: `TB-300`). Revisar también textos alternativos, placeholders de inputs y validaciones (regex) del registro. |
| C11 | Nosotros | Quitar el tiempo de respuesta por WhatsApp. |

### 4.2 Envíos y tiempos

| ID | Dónde | Qué poner |
|---|---|---|
| E01 | Envíos Colombia, Ayuda, Revendedores, Negocios, Empresas | Despachos desde Miami: **«varias veces por semana»** (sin días concretos). |
| E02 | Envíos Colombia | **No nombrar** al aliado de última milla. Quitar cualquier mención o logo. Texto genérico: «Entregamos con transportadoras aliadas». |
| E03 | Envíos Colombia | Cambiar «Más de X municipios» por **«Entregamos en toda Colombia»**. |
| E04–E05 | Envíos Colombia | Tiempos en días hábiles: **ciudades principales 5 a 7** · **otras ciudades y municipios 10 a 12**. Si la página tenía tres filas (Bogotá / otras capitales / municipios), dejar solo estas dos. Donde el sitio dice «5 a 7 días hábiles» de forma general (hero, franja de confianza), añadir «a ciudades principales». |
| E06 | Ayuda, Casillero virtual, Consolidación, Revendedores | **30 días de almacenamiento gratis** en Miami. |
| E07 | Ayuda, Casillero virtual | Después de los 30 días: **US$1 por día**. |
| E08 | Términos | Abandono a los 60 días sin respuesta → donación a organización local (ya está en los términos; no hace falta en otras páginas). |
| E09 | Ayuda, Compramos por ti, Revendedores | Medios de pago: **tarjeta, Zelle y transferencia a Bancolombia**. |

### 4.3 Consolidación y servicios en bodega

| ID | Qué poner |
|---|---|
| X01 | Consolidar: **gratis**. |
| X02 | Límite: «Los límites de cada caja dependen de las reglas para envíos courier del país de destino». Sin cifras. |
| X03 | Retiro de cajas originales: **gratis**. |
| X04 | **Quitar todo lo de «reempaque reforzado»** (ver sección 5). |
| X05 | Retiro de facturas: **gratis, pídelo a atención al cliente**. |
| X06 | Ejemplo de ahorro con 3 paquetes de 3 lb. **Calcularlo con las constantes de tarifas**, no a mano: por separado 3 × US$25 = **US$75**; consolidados (9 lb) = **US$30**; ahorras **US$45**. Ojo: el Excel tenía 3 × US$30, que es incorrecto (3 lb cae en el tramo de 1 a 4 lb = US$25). Añade una prueba para este caso. |

### 4.4 Seguro y reclamos

La página **«Reclamos y seguro»** se simplifica a esto:

- La tarifa **incluye seguro**.
- Cubre la **pérdida total de la caja**, hasta **US$100 por caja**.
- No hay seguro adicional.
- Si crees que tu caja se perdió, escríbenos por WhatsApp o correo con tu número de casillero y tu número de guía.

Quitar: seguro opcional (S01, S02, S04), plazos para reclamar (S05), plazo de respuesta (S06) y forma de compensación (S07). Revisar la página **Ayuda** por las mismas preguntas.

### 4.5 Aduana e impuestos (página «Aduana e impuestos»)

- Quitar el bloque del agente de aduanas y la fecha de revisión (A01, A02).
- **Impuestos (A03):** «En Colombia, los envíos con valor declarado de hasta US$200 no pagan impuestos. Por encima de US$200 se pagan impuestos adicionales (arancel e IVA).» Indicar que la regla es **solo para Colombia**; para otros países, «escríbenos y te contamos». ⚠️ Ver pregunta 1 de la sección 8.
- **Tipo de envío (A04):** quitar la distinción entre «personal» y «comercial». Dejar solo: «Envío courier: hasta 6 unidades iguales por caja y sin fin de venta».
- Quitar cuándo se pagan los impuestos (A05) y el documento de identidad (A06).
- **Celulares (A07):** quitar **todo** lo relacionado con el envío de celulares, para todos los países: preguntas en Ayuda, límites, requisitos de IMEI y el ejemplo 2. ⚠️ Ver pregunta 2 sobre la lista de prohibidos.
- Ejemplos de cálculo (A08–A10): vacíos → **quitar el bloque de ejemplos**.

### 4.6 Compramos por ti

- Tarifa del servicio: **10 % del valor del producto, mínimo US$20**.
- Quitar tiempos de cotización y de compra (P03, P04).

### 4.7 Negocios, revendedores, empresas y carga

**No existen planes «Personal» ni «Revendedor».** Quitar las tarjetas de planes, los rangos de libras, el precio por libra y el volumen mínimo (N01–N04) en Negocios, Revendedores y Solicitar tarifa. En su lugar:

> **¿Envías con frecuencia?** Si eres revendedor o haces varios envíos al mes, puedes acceder a una tarifa preferencial según tu volumen mensual. Escríbenos y un asesor te arma una propuesta en menos de 24 horas.

| ID | Qué poner |
|---|---|
| N05 | Respuesta de un asesor: **24 horas**. |
| N06 | Página Solicitar tarifa: «Te atiende **Maria Jacome**, asesora comercial». ⚠️ Ver pregunta 4 sobre la tilde. |
| N07 | Almacenamiento para empresas y revendedores: **30 días gratis** (igual que todos). |
| N08–N10 | Vacíos y opcionales: quitar puntos de inspección, devoluciones a proveedores y crédito. |
| N11 | Quitar la sección de documentos para empresas (RUT, INVIMA). |
| N12–N18 | Página **Carga**: quitar tiempos, mínimos, unidad de cobro, recogida en EE. UU., coordinación aduanera y cobertura. Dejar la página como presentación general de carga aérea y marítima con el CTA «Solicita tu cotización». |

### 4.8 Nosotros, opiniones y fotos (O01–O11)

La dueña quiere **dejar «Nosotros» para otro momento**:

- Quitar «Nosotros» del menú, del pie de página y del `sitemap.xml`. Dejar el archivo en el repo con `<meta name="robots" content="noindex">` o moverlo a `_borradores/`, sin borrarlo.
- Quitar el testimonio de la página Envíos Colombia (O08–O09).
- Quitar los bloques que esperaban fotos reales de consolidación e inspección (O10–O11), o cambiarlos por una ilustración o ícono sin texto de «antes y después».

### 4.9 Ejemplo de revendedor (R01–R08)

«No pongamos esto ahora»: **quitar** el bloque del ejemplo de costo y ganancia en Mercado Libre de la página Revendedores.

### 4.10 Tiendas

- L07 (fecha de la guía de tiendas): mostrar «Actualizado en 2026» o quitar la línea. No inventar una fecha exacta.

---

## 5. Lo que NO debe aparecer en ninguna página

Después de los cambios, busca en el sitio (sin distinguir mayúsculas ni tildes) y confirma **cero resultados** fuera de `docs/`:

| Buscar | Motivo |
|---|---|
| `[` … `]` (marcadores) | Todo debe estar resuelto u oculto |
| `TBX` | Formato de casillero viejo |
| `reempaque` | Servicio que no se ofrece |
| `seguro opcional`, `seguro adicional` (salvo la frase «No hay seguro adicional») | No existe |
| `celular`, `IMEI`, `teléfono móvil` | No se publica nada de celulares (ver pregunta 2) |
| `Coordinadora` | No se publica el aliado |
| `Plan Personal`, `Plan Revendedor`, `lb al mes` | No existen planes |
| `horario`, `lunes a viernes`, `hora de Miami` | No se publica horario |
| `agente de aduanas` + fecha de revisión | No se publica |
| `INVIMA` en la página Empresas | Sección eliminada (en la lista de prohibidos sí se mantiene) |
| Dirección física de la bodega, ZIP o `Suite` | No se publica |

Agrega esta lista como prueba automática si el repo tiene pruebas (por ejemplo, un script `scripts/check-contenido.mjs` que falle si encuentra alguno en el HTML generado).

---

## 6. Páginas legales

Fuente: `docs/textos-legales.md`. **Copiar los textos tal cual** y reemplazar solo `{{EMAIL}}`, `{{WHATSAPP}}` y `{{FECHA}}` con los valores de configuración. No reescribir ni resumir.

1. Crear cuatro páginas con la plantilla del sitio (header, pie de página, botón de WhatsApp):
   - `/terminos` → sección 1 del documento
   - `/privacidad` → sección 2 (título visible: «Política de tratamiento de datos personales»)
   - `/cookies` → sección 3
   - `/aviso-legal` → sección 4
2. Diseño de lectura: columna de texto de 680–760 px, índice con anclas al inicio (en Términos y Privacidad), títulos numerados, fecha de actualización arriba. No incluyas la sección 6 del documento (tabla de supuestos): es interna.
3. **Pie de página:** reemplazar la línea legal actual por la del punto 5.3 del documento.
4. **Registro:** añadir la casilla del punto 5.1. Obligatoria, **sin marcar por defecto**; el botón de enviar queda desactivado (o muestra un error accesible) hasta que se marque. Los enlaces abren en una pestaña nueva para no perder el formulario.
5. **Formulario de contacto:** añadir la casilla del punto 5.2 con el mismo comportamiento.
6. Si el formulario usa un servicio externo (por ejemplo, Formspree), envía también el valor de la casilla (`autoriza_datos=si`) para que quede registrado.
7. **Cookies:** confirma que el sitio no carga analítica, píxeles ni scripts de publicidad. Si encuentras alguno (Google Analytics, Meta Pixel, etc.), **no lo quites sin preguntar**: avísame, porque la política de cookies dice que no hay. Si las fuentes se cargan desde Google Fonts, mejor alojarlas en el propio sitio.
8. SEO: `<title>` y meta description en cada página legal; las cuatro incluidas en `sitemap.xml`.

---

## 7. Checklist

1. [ ] Leer el repo; ubicar o crear la configuración central.
2. [ ] Inventario de marcadores en `docs/inventario-marcadores.md`.
3. [ ] Rama `datos-v2`.
4. [ ] Configuración central (sección 3) y componentes que se ocultan cuando el valor es `null`.
5. [ ] Contacto, bodega y casillero (4.1), incluido el cambio TBX → TB.
6. [ ] Envíos y tiempos (4.2).
7. [ ] Consolidación (4.3) + prueba del ejemplo 3 × 3 lb.
8. [ ] Seguro y reclamos (4.4).
9. [ ] Aduana (4.5).
10. [ ] Compramos por ti (4.6).
11. [ ] Negocios, revendedores, empresas y carga (4.7).
12. [ ] Esconder Nosotros, testimonios, fotos y el ejemplo de revendedor (4.8–4.9).
13. [ ] Páginas legales, pie de página y casillas (sección 6).
14. [ ] Búsqueda de la sección 5 con cero resultados; enlaces rotos (`/nosotros` ya no enlazado desde ningún sitio).
15. [ ] Revisión en 375, 768 y 1440 px; teclado y lector de pantalla en las casillas.
16. [ ] Capturas antes y después de las páginas cambiadas y PR con: lista de cambios por página, inventario de marcadores resuelto y lo que quedó sin resolver.

---

## 8. Preguntas abiertas (no bloquean: usar el valor por defecto y anotarlas en el PR)

| # | Pregunta | Por defecto |
|---|---|---|
| 1 | Impuestos por encima de US$200 en Colombia: la dueña escribió «se cobra el IVA», pero el texto oficial de tarifas dice «arancel e IVA» (la DIAN también indica arancel 10 % + IVA 19 %). | Mantener «arancel e IVA» en todo el sitio, para que no haya dos versiones. |
| 2 | «No poner nada de celulares». La lista oficial de prohibidos incluye «celulares que no cumplan con la regulación colombiana». | Quitar «celulares» de ese ítem y dejar «Ropa usada». Si la dueña prefiere mantener la advertencia, se restaura. |
| 3 | Almacenamiento después de 30 días: ¿US$1 por día **por paquete**? | Publicar «US$1 por día» sin «por paquete». |
| 4 | Nombre de la asesora: ¿«Maria Jacome» o «María Jácome»? | Como lo escribió la dueña: «Maria Jacome». |
| 5 | Fecha de los textos legales (la dueña escribió solo «2026»). | «noviembre de 2026». |
| 6 | Supuestos ⚠️ de los textos legales (sección 6 de `docs/textos-legales.md`). | Publicar como están; los revisa la dueña y, si es posible, un abogado. |

Nota sobre la regla de US$200: la Corte Constitucional anuló en abril de 2026 la rebaja a US$50 que había hecho el Decreto 1474 de 2025, así que hoy aplica US$200. El nuevo gobierno anunció que revisará estos impuestos. Si cambia, basta con actualizar la constante del umbral y el texto de la página de aduana (los términos ya hablan de «la normativa vigente»).

---

## Prompt inicial para Claude Code

```
Vamos a poner los datos reales y los textos legales en la web pública de TerraBox Cargo.
Este es el repo de la web pública (GitHub Pages), no terrabox-os.
Lee completos docs/handoff-datos-v2.md y docs/textos-legales.md antes de empezar.

Sigue el checklist de la sección 7 en orden. Empieza por los pasos 1 y 2: dime dónde está
la configuración central y genera docs/inventario-marcadores.md con todos los marcadores
entre corchetes que encuentres y la fila de la sección 4 o 5 que resuelve cada uno.
Muéstrame el inventario antes de editar páginas.

Reglas:
- Los textos de docs/textos-legales.md se copian tal cual; solo se reemplazan {{EMAIL}},
  {{WHATSAPP}} y {{FECHA}}.
- No inventes datos: si un marcador no tiene respuesta en el handoff, anótalo como sin resolver.
- Trabaja en la rama datos-v2 y abre un PR al terminar, con las preguntas de la sección 8
  y los valores por defecto que usaste.
- Para y pregúntame antes de borrar páginas, quitar scripts de terceros o tocar la
  configuración de GitHub Pages.
```
