# Inventario de marcadores — handoff datos v2

Generado el 23 nov 2026 en la rama `datos-v2`, antes de editar páginas (pasos 1 y 2 del checklist).

## 1. Configuración central

- **Archivo:** `assets/js/config.js` (objeto `window.TB`). Hoy guarda WhatsApp (`waNumber`), email, horario
  (`hours`), redes (`social`), URLs de Ingresar/Registro (`urls`), tarifas (`pricing`) y endpoints de formularios.
  Lo leen `site.js`, `calculator.js`, `caja.js` y `home3d.js`.
- **Cómo llega al HTML:** los enlaces de WhatsApp se generan en el build (`_src/build.py`, función `wa()`) sin número,
  y `site.js` les añade `TB.waNumber` al cargar. Email y horario se pintan en elementos `data-tb="email|hours"`;
  las redes en `data-social`; los precios en `data-price`.
- **Datos de contacto repetidos fuera de la configuración:**
  - El pie de página (plantilla en `_src/build.py`) escribe `[email]` y `[horario de atención]` como texto de relleno.
  - Inicio y Contacto repiten esos mismos dos rellenos en sus bloques de contacto.
  - Tiendas, Casillero virtual, Inicio y Nosotros escriben la dirección de la bodega y el casillero a mano.
  - El ejemplo de casillero `TBX-0000` está escrito a mano en las páginas y en `home3d.js` (la etiqueta de la caja
    3D y el letrero de Miami).
- **Faltan en la configuración:** `WHATSAPP_DISPLAY`, `TELEFONO_BODEGA`, `CASILLERO_FORMATO`, `ASESOR_COMERCIAL`,
  `RESPUESTA_ASESOR_H`, `LEGAL_FECHA`, `RAZON_SOCIAL` y la dirección de la bodega (que queda en `null`).

## 2. Marcadores entre corchetes por página

Búsqueda en `_src/pages`, `_src/partials`, `_src/data`, `_src/build.py` y `assets/js` (fuente: los `.html` de la raíz
se generan desde ahí). Se descartaron 45 falsos positivos en JavaScript y Python (arreglos, índices, expresiones
regulares). Total: **162 marcadores reales**; Ayuda repite cada respuesta dos veces (la lista visible y los datos
estructurados para Google), así que la misma corrección resuelve las dos.

| Página (fuente) | Línea | Marcador | Resuelve | Acción prevista |
|---|---|---|---|---|
| Pie de página (`_src/build.py`) | 378 | `[email]` · `[horario de atención]` | C02, C03 | Email real; quitar horario y su rótulo |
| Inicio | 80–81 | `[Dirección de la bodega]` · `[código postal]` | C06–C08 | Texto «Al registrarte te enviamos tu dirección completa…» |
| Inicio | 125–126 | `[email]` · `[horario de atención]` | C02, C03 | Email real; horario → «Escríbenos por WhatsApp» |
| Contacto | 31–32 | `[email]` · `[horario de atención]` | C02, C03 | Ídem |
| Casillero virtual | 29–30 | `[Dirección de la bodega]` · `[código postal]` | C06–C08 | Texto genérico de dirección |
| Casillero virtual | 65 | `TBX-[número]-0001` · `[Foto real del paquete, pendiente.]` | C10, O10–O11 | `TB-300`; quitar el aviso de foto |
| Casillero virtual | 82, 137 | `[X]` días de almacenamiento | E06 | 30 días gratis |
| Casillero virtual | 84 | Consolidación `[condición]` | X01 | Gratis |
| Casillero virtual | 93, 137 | Después de `[X]` días: US$`[X]` por `[periodo]` | E07 | US$1 por día |
| Tiendas | 20 | Actualizado el `[fecha]` | L07 | «Actualizado en 2026» |
| Tiendas | 56–60 | `TBX-[número]` · `[Dirección de la bodega]` · `[código postal]` · `[teléfono de la bodega]` | C06–C10 | Formato de llenado con rótulos genéricos y +1 (786) 327-1803 |
| Tiendas | 123 | `TBX-[número]` | C10 | `TB-300` |
| Envíos Colombia | 51 | `[Más de X]` municipios | E03 | «Entregamos en toda Colombia» |
| Envíos Colombia | 52 | `[días de despacho]` · `[nombre del aliado de última milla]` | E01, E02 | «varias veces por semana»; «transportadoras aliadas» |
| Envíos Colombia | 92 | Testimonio `[Nombre]`, `[ciudad]` | O08–O09 | Quitar el testimonio |
| Envíos Colombia | 128–129 | `[X–Y]` días (otras capitales, municipios) | E04–E05 | Dos filas: principales 5 a 7 · otras 10 a 12 |
| Ayuda | 86/227 | Almacenamiento después de `[X]` días: US$`[X]` | E06, E07 | 30 días; US$1 por día |
| Ayuda | 106/247 | `[días de despacho]` | E01 | «varias veces por semana» |
| Ayuda | 132/273 | Celulares `[Respuesta confirmada…]` | A07 | Quitar la pregunta |
| Ayuda | 152/293 | Consolidamos sin costo `[o: por US$X]` | X01 | Gratis |
| Ayuda | 159/300 | `[X]` días sin costo | E06 | 30 días |
| Ayuda | 172/313 | `[medios confirmados]` | E09 | Tarjeta, Zelle y transferencia a Bancolombia |
| Ayuda | 185/326 | Reclamo en `[X]` días hábiles | 4.4 (S06) | Respuesta de 4.4 sin plazos |
| Consolidación | 54–57 | Tabla de ejemplo `[X]` lb, US$`[X]` | X06 | Calcular con las constantes (ver conflicto 1) |
| Consolidación | 56, 103 | `[Gratis o US$X]` | X01, X03 | Gratis |
| Consolidación | 61 | `[Fotos reales de antes y después…]` | O10–O11 | Quitar el bloque |
| Consolidación | 104 | Reempaque reforzado US$`[X]` | X04 | Quitar |
| Consolidación | 105 | Retiro de facturas `[Condición]` | X05 | Gratis, pídelo a atención al cliente |
| Consolidación | 108 | `[Límite confirmado de paquetes…]` | X02 | Frase de reglas courier del destino |
| Consolidación | 109 | `[X]` días sin costo | E06 | 30 días |
| Consolidación | 110 | `[Respuesta confirmada por el agente de aduanas]` | — | **Sin resolver** (ver 4.3) |
| Aduana e impuestos | 21 | `[fecha]` · `[agente de aduanas]` | A01, A02 | Quitar el bloque |
| Aduana e impuestos | 38–39 | `[Personal]` · `[Personal o comercial]` · `[Porcentajes por confirmar]` | A03, A04 | Texto A03; sin distinción personal/comercial |
| Aduana e impuestos | 75, 113–115 | Ejemplos US$`[X]` (incluye «Un celular») | A08–A10, A07 | Quitar el bloque de ejemplos |
| Aduana e impuestos | 90 | `[Documento de identidad…]` | A06 | Quitar |
| Aduana e impuestos | 119 | Sin factura: `[Respuesta confirmada…]` | — | **Sin resolver** (ver 4.3) |
| Compramos por ti | 47 | `[X]` % del valor, mínimo US$`[X]` | 4.6 | 10 %, mínimo US$20 |
| Compramos por ti | 50 | `[medios de pago confirmados]` | E09 | Tarjeta, Zelle y transferencia a Bancolombia |
| Compramos por ti | 74 | Cotización en `[X]` horas hábiles (mensaje de éxito) | P03 | Quitar el plazo |
| Compramos por ti | 95 | Devoluciones `[Política confirmada…]` | — | **Sin resolver** (ver 4.3) |
| Compramos por ti | 96 | `[X]` días para comprar | P04 | Quitar la pregunta |
| Reclamos y seguro | 19, 40–42, 76, 88–90 | `[X]` % seguro opcional, límites, condiciones, plazos, `[fecha]`, compensación | 4.4 | Página simplificada a los 4 puntos de 4.4 |
| Negocios | 111–113 | Planes Personal / Revendedor / Empresa con `[X]`, `[Y]`, `[días]`, `[condiciones]` | N01–N04, N07, E01 | Quitar planes; bloque «¿Envías con frecuencia?» |
| Revendedores | 110, 112 | `[Otros puntos de inspección…]` · `[Fotos reales de inspección…]` | N08, O10–O11 | Quitar |
| Revendedores | 167 | Almacenamiento gratuito por `[X]` días | E06, N07 | 30 días |
| Revendedores | 171, 278 | `[días]` · `[días de despacho]` | E01 | «varias veces por semana» |
| Revendedores | 182–224 | Ejemplo de costo y ganancia en Mercado Libre (US$`[X]`, COP `[X]`) | R01–R08 | Quitar el bloque |
| Revendedores | 232–242, 312–314 | Tramos `[X]`–`[Y]` lb y US$`[X]` por libra | N01–N04 | Quitar planes y opciones de volumen en lb |
| Revendedores | 250 | `[Volumen mínimo…]` | N04 | Quitar la pregunta |
| Revendedores | 257 | Retiramos facturas y reempacamos `[Condiciones]` | X04, X05 | Retiro gratis; sin reempaque |
| Revendedores | 264 | `[Proceso confirmado de devoluciones a proveedores]` | N09 | Quitar |
| Revendedores | 271 | `[Medios de pago y condiciones…]` | E09, N10 | Medios de pago; sin crédito |
| Empresas | 54, 91 | Almacenamiento `[condiciones]` · `[Condiciones]` | N07 | 30 días gratis |
| Empresas | 90 | Salidas fijas `[días]` | E01 | «varias veces por semana» |
| Empresas | 98–99 | RUT `[confirmar]` · `[Registros o permisos…]` | N11 | Quitar la sección de documentos |
| Solicitar tarifa | 40 | Respuesta en `[24]` h · `[nombre del asesor…]` | N05, N06 | 24 horas · Maria Jacome |
| Solicitar tarifa | 123–125 | Volumen `[X]`–`[Y]` lb | N01–N04 | Quitar las opciones en libras |
| Carga | 59–62, 70, 95–98 | Recogida, almacenamiento, aduana, cobertura, documentos, tiempos, mínimos, unidad de cobro | N12–N18 | Página general con «Solicita tu cotización» |
| Nosotros | 29, 42, 49, 64–69, 84 | Fundadora, dirección, horario, opiniones de Google, respuesta en `[X]` h | 4.8, C03, C11 | Página fuera de menú, pie y sitemap (no se borra) |
| Plantilla legal (`Legal-Page`) | 18 | Última actualización: `[fecha]` | 6, LEGAL_FECHA | «noviembre de 2026» |
| Términos, Datos, Cookies | 21–24 | Resúmenes de relleno | 6 | **Bloqueado**: falta `docs/textos-legales.md` |

## 3. Búsqueda de la sección 5 en las páginas publicadas (antes de cambiar nada)

Búsqueda sin mayúsculas ni tildes en los 25 `.html` generados (texto visible y datos para Google).

| Término | Dónde aparece hoy | Resuelve |
|---|---|---|
| `TBX` | Casillero virtual (3), Inicio (1), Tiendas (3); en JS: `home3d.js` (2 líneas) | C10 |
| `reempaque` | Consolidación (4), Negocios (1), Revendedores (2) | X04 |
| `seguro opcional` | Casillero virtual (1), Reclamos y seguro (3) | 4.4 |
| `celular` | Aduana (2), Ayuda (5), Envíos Colombia (2), Inicio (4), Productos restringidos (3), Tarifas (3); en JS: 8 | A07 + **conflicto 2** |
| `Plan Personal`, `Plan Revendedor` | Negocios, Revendedores | N01–N04 |
| `horario` | Las 25 páginas: está en el pie de página. En Solicitar tarifa además es el campo «Horario para la llamada» | C03 + **conflicto 4** |
| `lunes a viernes`, `hora de Miami` | Nosotros | 4.8 |
| `agente de aduanas` | Aduana (2), Carga (1), Consolidación (1) | A01, N12–N18, sin resolver 4.3 |
| `INVIMA` | Inicio y Productos restringidos (lista de prohibidos: se mantiene). No aparece en Empresas | ok |
| `código postal`, `Dirección de la bodega` | Casillero virtual, Inicio, Nosotros, Tiendas | C06–C08 |
| `IMEI`, `teléfono móvil`, `Coordinadora`, `seguro adicional`, `lb al mes`, `Suite` | 0 | ok |

## 4. Decisiones (respuestas del 23 nov 2026) y estado final

| # | Punto | Decisión | Cómo quedó |
|---|---|---|---|
| 1 | Tarifa Colombia | US$3 por libra (no los tramos de US$25 del handoff) | Se mantiene `config.js`: Courier US$3/lb, mínimo US$30. Ejemplo de consolidación calculado con `TB.quote`: 3 × 3 lb = US$90 por separado, 9 lb consolidados = US$30, ahorras US$60 |
| 2 | Tarifas de celular | No mencionar | Quitadas de `config.js` (Colombia US$80, México US$150), de la calculadora, de Tarifas, de Envíos y de la caja 3D. En la lista de prohibidos queda «Ropa usada» (pregunta 2 del handoff) |
| 3 | Courier y Comercial | Solo Courier | Tarifa Comercial quitada de `config.js` y de todas las páginas; el selector de tipo se oculta porque queda una sola tarifa |
| 4 | Horario | No publicar | Quitado del pie de página, Inicio, Contacto, Ayuda; el campo «Horario para la llamada» de Solicitar tarifa también se quitó |
| 5 | Preguntas sin respuesta | Quitarlas | Quitadas: sin factura y cuándo se pagan los impuestos (Aduana), consolidar e impuestos (Consolidación), devoluciones y tiempo de compra (Compramos por ti) |
| 6 | Reclamos | Sin formulario ni proceso | La página «Reclamos y seguro» pasó a «Seguro incluido» con los 4 puntos de 4.4; quitados el formulario, los pasos, el seguro opcional y el endpoint `reclamo`. En el menú y el pie se llama «Seguro» |
| 7 | Textos legales | Para una actualización posterior | Sin cambios en Términos, Tratamiento de datos y Cookies: siguen con sus marcadores. El chequeo automático los reporta como nota, no como error |
| 8 | Analítica | No hay | Confirmado: no hay analítica, píxeles ni publicidad. Google Fonts sigue cargándose desde Google |

**Otros cambios fuera de la lista original:**
- La imagen `compra-celular` se renombró a `compra-online` y se quitaron los textos alternativos que decían «celular».
- Tiendas tenía 10 marcadores de más de 60 caracteres que la búsqueda del handoff no encontraba (`[Consejo verificado para comprar en … con dirección en Miami]`). No hay consejos confirmados: se muestran solo los nombres de las tiendas.
- Nosotros queda publicada pero fuera del menú y del pie, con `noindex`; no existía `sitemap.xml`, así que no hubo que quitarla de ahí.
- El chequeo automático `scripts/check-contenido.mjs` busca marcadores de cualquier largo y los términos de la sección 5 en el texto, los textos alternativos, los formularios y los datos para Google.
