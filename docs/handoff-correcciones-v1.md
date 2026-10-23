# TerraBox Cargo — Web pública: Handoff de correcciones v1 (para Claude Code)

> Preparado en Cowork el 23 oct 2026. Pega este archivo en el repo de la **web pública** (la que está en GitHub Pages, NO el repo `terrabox-os`) como `docs/handoff-correcciones-v1.md`. Al final hay un prompt inicial.

---

## 1. Objetivo

La dueña pidió dos cosas:

1. **Rediseño visual** para que la web se parezca en estructura y sensación a la de un competidor directo: **https://skyboxcargo.com/**.
2. **Actualizar los textos** con su información oficial de precios, condiciones y artículos prohibidos (sección 5, texto literal).

Referencias adicionales de Juan:

| Sitio | Para qué usarlo |
|---|---|
| https://skyboxcargo.com/ | **Referencia principal**: estructura de la home, orden de secciones, CTAs (rastreo, calculadora, registro) |
| https://www.freezpak.com/ | Gráficos y **storytelling**: el recorrido del paquete contado paso a paso |
| https://www.manuport-logistics.com/ | **Identidad visual**: secciones a ancho completo, fotografía real, tarjetas con foto, tono de copy directo y seguro |

**Regla:** tomar estructura e ideas, **no copiar** imágenes, textos, logos ni código de ningún competidor. Todo el contenido visual debe ser propio, con licencia libre (Unsplash/Pexels) o generado.

---

## 2. Antes de tocar nada

1. Lee el repo completo e identifica stack (¿HTML/CSS estático, framework?), estructura de páginas y tokens de marca existentes.
2. Colores de marca de referencia: navy `#15369c`, azul `#228ecf`, cian `#4dd1f3`. Confirma contra el repo y **reutiliza los tokens y la tipografía actuales**; si no hay tokens, créalos como variables CSS.
3. Respeta el despliegue actual en GitHub Pages (sin build server-side). Si propones cambiar de stack, pregunta antes.
4. Trabaja en una rama `rediseno-v1` y abre PR. No hagas push directo a `main`.
5. Abre las tres referencias en el navegador (o toma capturas con Playwright) para ver el diseño real; la descripción de abajo es un resumen.

---

## 3. Estructura objetivo de la home (basada en Skybox)

Orden de arriba a abajo:

1. **Header fijo**: logo · Inicio · ¿Cómo funciona? · Tarifas · Calculadora · Artículos prohibidos · Contacto · botones **Ingresar** y **Registrarse** (destacado). Menú hamburguesa en móvil.
   - Ingresar/Registrarse: por ahora apuntan a lo que haya hoy (WhatsApp o formulario). Dejarlos centralizados en una constante; en la F3 de TerraBox OS apuntarán a `app.terraboxcargo.com`.
2. **Hero**: titular grande orientado al beneficio (p. ej. «Compra en EE. UU. y recíbelo en Colombia en 5 a 7 días hábiles»), subtítulo con «desde US$25, seguro incluido», CTA primario «Regístrate gratis» y secundario «Calcula tu envío». Foto de persona con compras/caja TerraBox a un lado.
   - **Widget «Rastrea tu envío»** dentro del hero (input + botón). Si aún no hay sistema de rastreo, el botón abre WhatsApp con el número de guía prellenado. Deja el comportamiento en una función fácil de cambiar.
3. **Franja de confianza** (4 cifras/íconos): 5–7 días hábiles · Seguro incluido · Envío a ciudades principales · Atención personalizada por WhatsApp.
4. **¿Cómo funciona?** — estilo storytelling de Freezpak, como **línea de tiempo visual** con íconos (no solo texto):
   1. Regístrate y recibe tu dirección en Miami
   2. Compra en tus tiendas favoritas de EE. UU.
   3. Recibimos y revisamos tu paquete en bodega
   4. Lo enviamos a Colombia (aduana incluida en el proceso)
   5. Lo recibes en tu puerta en 5 a 7 días hábiles
   Animación suave al hacer scroll (aparecer paso a paso). Respetar `prefers-reduced-motion`.
5. **Ventajas** (grid de 6 tarjetas con ícono): seguro incluido, transporte nacional incluido a ciudades principales, sin impuestos hasta US$200 declarados, precio claro por libra, hasta 6 productos iguales por caja, atención personalizada.
6. **Tarifas Colombia** (sección 5.1): tabla/tarjetas de precio grandes y legibles + condiciones debajo. CTA «Calcula tu envío».
7. **Calculadora** (sección 4).
8. **Artículos prohibidos** (sección 5.2): resumen visual en la home (grid de íconos por categoría, ~10 tarjetas) con enlace a la página/sección completa. En la vista completa usar acordeón por categoría.
9. **Contacto**: formulario funcional (Formspree o similar, o `mailto:` si no hay backend; preguntar), WhatsApp, email, horario, dirección de bodega si la dueña la quiere pública (preguntar).
10. **Footer**: logo, enlaces, redes, términos y condiciones, © 2026.
11. **Botón flotante de WhatsApp** en todas las páginas (Skybox no lo tiene; es una mejora clara para este negocio).

Opcional (preguntar antes): grid de «Tiendas recomendadas» con logos (Amazon, etc.). Si se hace, usar logos con cuidado de marcas y sin repetir.

---

## 4. Calculadora de envío

Lógica con los precios oficiales (en JS puro, en un solo módulo con las tarifas como constantes):

| Peso | Precio |
|---|---|
| 1–4 lb | US$25 |
| 5–10 lb | US$30 |
| > 10 lb | US$30 + US$3 por cada libra adicional sobre 10 |

- Ejemplo: 12 lb → 30 + 2 × 3 = **US$36**.
- Entradas: peso (lb) y valor declarado (US$).
- Si el valor declarado > US$200 → mostrar aviso: «Paga impuestos adicionales (arancel e IVA)». Si ≤ 200 → «Cero pago de impuestos».
- Mostrar siempre: «Incluye seguro y transporte nacional a ciudades principales».
- Texto pequeño: «Valor de referencia. El precio final se confirma al recibir el paquete en bodega».
- **Pendiente de confirmar con la dueña (dejar como constante configurable):** ¿se redondea el peso hacia arriba a la libra entera? (p. ej. 4,2 lb → 5 lb). Por defecto: redondear hacia arriba.

---

## 5. Textos oficiales (usar tal cual, solo con las correcciones ortográficas indicadas)

Correcciones menores aplicadas: «Articulos» → «Artículos»; «USD $2,000y» → «USD 2.000 y»; precios normalizados a **US$** (antes «U$»). Si la dueña prefiere «U$», es un reemplazo global.

### 5.1 Precios Colombia

- **1 a 4 libras:** US$25
- **5 a 10 libras:** US$30
- **Libra adicional:** US$3

Incluye seguro y transporte nacional a ciudades principales.

**Condiciones**
- Se responde por US$100 en caso de pérdida de caja.
- Declarado por caja hasta US$200: cero pago de impuestos.
- Declarado superior a US$200: paga impuestos adicionales (arancel e IVA).
- Hasta 6 productos iguales por caja.
- Tiempo de entrega: 5 a 7 días hábiles.

### 5.2 Artículos prohibidos Colombia

El envío de paquetes y mercancías por courier o tráfico postal a Colombia tiene prohibiciones estrictas según la DIAN y las principales empresas de transporte.

**Artículos y sustancias prohibidas**

- **Armas y explosivos:** armas de fuego, municiones, réplicas, juguetes bélicos, granadas y material explosivo.
- **Dinero y valores:** efectivo, monedas, joyas, metales preciosos, títulos al portador, tarjetas de crédito o débito.
- **Drogas y estupefacientes:** sustancias psicoactivas, marihuana, CBD, THC y precursores químicos ilegales.
- **Electrónicos y baterías peligrosas:** drones de cualquier tamaño, patinetas eléctricas o scooters, y baterías de litio que excedan los 100 Wh.
- **Celulares y ropa:** celulares que no cumplan con la regulación colombiana vigente y ropa usada.
- **Químicos y materiales peligrosos:** gases comprimidos, cilindros, aerosoles, químicos corrosivos, materiales radiactivos y encendedores.
- **Alimentos y perecederos:** alimentos que requieran refrigeración o que no cuenten con registro sanitario.
- **Plantas y animales:** plantas vivas, semillas, animales vivos o muertos, y artículos de piel.
- **Medicamentos:** fármacos sin receta médica o que no estén en su empaque original con aprobación del INVIMA.
- **Material sensible:** material pornográfico, tabaco, cigarrillos y cigarrillos electrónicos.

**Límites de cantidad y valor**

- **Límite de unidades:** no se pueden enviar más de 6 unidades del mismo artículo en un envío comercial o de carácter no personal.
- **Tope de valor:** los envíos urgentes por tráfico postal tienen un valor máximo permitido de USD 2.000 y un peso de hasta 50 kg. Los envíos con exención de IVA (Ley 2155 de 2021) aplican hasta USD 200.

Añadir al final una nota pequeña: «Esta lista es informativa y puede cambiar según la normativa vigente. Si tienes dudas sobre un artículo, escríbenos antes de comprar.» + botón WhatsApp.

---

## 6. Dirección visual

- **Paleta:** fondo blanco y gris muy claro alternando secciones; navy `#15369c` para títulos y header/footer; azul `#228ecf` para CTAs primarios; cian `#4dd1f3` como acento (íconos, subrayados, flechas). Skybox usa un esquema azul + amarillo; aquí el acento es el cian de TerraBox, no el amarillo.
- **Tipografía:** la actual de la marca. Si no hay, una sans geométrica moderna (Poppins/Montserrat para títulos, Inter para texto) vía Google Fonts. Titulares grandes y con peso (estilo Manuport).
- **Imágenes:** fotografía real (personas recibiendo cajas, bodega, avión de carga) en lugar de clip-art. Tarjetas con foto para secciones clave (estilo «We're different because» de Manuport).
- **Íconos:** un solo set consistente (Lucide o Heroicons, SVG inline) para pasos, ventajas y prohibidos.
- **Componentes:** esquinas redondeadas, sombras suaves, botones con flecha (como los CTA de Skybox), mucho espacio en blanco.
- **Movimiento:** solo sutil: fade/slide al hacer scroll, hover en tarjetas. Nada de pantallas de carga.
- **Copy:** directo y cercano, en español de Colombia, tuteo.

---

## 7. Requisitos técnicos

- Mobile-first; probar a 375, 768 y 1440 px. Sin scroll horizontal.
- Accesibilidad: contraste AA, `alt` en imágenes, foco visible, navegación por teclado en menú, acordeón y calculadora.
- Rendimiento: imágenes optimizadas (WebP, `loading="lazy"`, tamaños explícitos); Lighthouse ≥ 90 en móvil.
- SEO básico: `<title>` y meta description por página, Open Graph, `lang="es"`.
- Números de WhatsApp, email, URLs de Ingresar/Registro y tarifas en **un solo archivo de configuración**.

---

## 8. Checklist

1. [ ] Leer repo, stack y tokens; reportar a Juan qué hay.
2. [ ] Capturas de las 3 referencias y de la web actual (antes).
3. [ ] Rama `rediseno-v1`.
4. [ ] Tokens de diseño + header/footer + botón flotante WhatsApp.
5. [ ] Hero con rastreo.
6. [ ] Cómo funciona (timeline) + ventajas.
7. [ ] Tarifas con textos de 5.1.
8. [ ] Calculadora (sección 4) con pruebas de casos: 1, 4, 5, 10, 11, 12 lb; valor 150 y 250.
9. [ ] Artículos prohibidos (resumen en home + vista completa) con textos de 5.2.
10. [ ] Contacto + footer.
11. [ ] Revisión responsive, accesibilidad, Lighthouse.
12. [ ] Capturas «después» y PR con resumen para Juan.

**Listo cuando:** la home sigue la estructura de la sección 3, todos los textos de la sección 5 están publicados sin cambios de contenido, la calculadora da los precios correctos y la preview se ve bien en móvil.

---

## 9. Preguntas abiertas para Juan / la dueña (no bloquean; usar el valor por defecto y anotar)

| Pregunta | Por defecto |
|---|---|
| ¿«US$» o «U$»? | US$ |
| ¿Se redondea el peso hacia arriba? | Sí |
| ¿Qué ciudades son «ciudades principales»? | No listar; texto genérico |
| ¿Los US$100 de respuesta por pérdida son el seguro incluido o algo aparte? | Mostrar como condición, sin interpretar |
| ¿Dirección de bodega en Miami pública? | No mostrar |
| ¿Horario de atención? | Pedir; dejar placeholder |
| ¿Grid de tiendas recomendadas? | No incluir |
| ¿Sistema de rastreo real? | Rastreo abre WhatsApp |

Nota: los datos de la sección 5.2 (topes USD 2.000/50 kg, exención hasta USD 200, límite de 6 unidades) los entregó la dueña; conviene que su agente de aduana los valide antes de publicar.

---

## Prompt inicial para Claude Code

```
Vamos a rediseñar la web pública de TerraBox Cargo. Lee docs/handoff-correcciones-v1.md
completo antes de empezar. Este es el repo de la web pública (GitHub Pages), no terrabox-os.
Sigue el checklist de la sección 8 en orden. Empieza por el paso 1: dime el stack, cómo
está organizado el repo y qué tokens de marca ya existen. Luego toma capturas de las
referencias y de la web actual. Trabaja en la rama rediseno-v1 y abre un PR al terminar.
Los textos de la sección 5 son oficiales: no cambies su contenido.
Para y pregúntame antes de cambiar de stack o de tocar la configuración de GitHub Pages.
```
