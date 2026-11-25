// Content check for the built pages (handoff datos v2, section 5). Run after `python _src/build.py`:
//   node scripts/check-contenido.mjs
// Fails (exit 1) when a published page shows a bracketed placeholder or a term the owner asked not to publish,
// and checks the consolidation example (3 boxes of 3 lb) against the real price code in assets/js.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Pages that are still published but deliberately left out of the check:
// nosotros.html is parked (noindex, not linked).
const PARKED = { 'nosotros.html': 'parked (noindex)' };

const FORBIDDEN = [
  { label: 'old locker format TBX', re: /\btbx\b/ },
  { label: 'reempaque', re: /reempaque/ },
  { label: 'seguro opcional', re: /seguro opcional/ },
  { label: 'seguro adicional', re: /(?<!no hay )seguro adicional/ },
  { label: 'celular', re: /celular/ },
  { label: 'IMEI', re: /\bimei\b/ },
  { label: 'teléfono móvil', re: /telefono movil/ },
  { label: 'Coordinadora', re: /coordinadora/ },
  { label: 'planes Personal / Revendedor', re: /plan (personal|revendedor)/ },
  { label: 'lb al mes', re: /lb al mes/ },
  { label: 'horario', re: /horario/ },
  { label: 'lunes a viernes', re: /lunes a viernes/ },
  { label: 'hora de Miami', re: /hora de miami/ },
  { label: 'agente de aduanas', re: /agente de aduanas/ },
  { label: 'warehouse address', re: /\bsuite\b|direccion de la bodega|codigo postal/ },
  { label: 'comercial rate', re: /tarifa comercial|(?<!asesora )\bcomercial[,:]/ },
];

const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// Visible text, attribute values people can see (alt, placeholder, aria-label, title) and the FAQ data for search engines.
function pageText(html) {
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]).join(' ');
  const attrs = [...html.matchAll(/\s(?:alt|placeholder|aria-label|title|content)="([^"]*)"/g)].map(m => m[1]).join(' ');
  // Lead forms: every text in their JSON config (labels, hints, options, messages), without the JSON brackets.
  const strings = v => typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
  const forms = [...html.matchAll(/\sdata-config="([^"]*)"/g)].flatMap(m => strings(JSON.parse(decode(m[1]))));
  const body = html.replace(/<script\b[\s\S]*?<\/script>/g, ' ').replace(/<style\b[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  return decode([body, attrs, ld].join(' ')).concat(' ', forms.join(' ')).replace(/\s+/g, ' ');
}

const problems = [], warnings = [];
for (const file of readdirSync(ROOT).filter(f => f.endsWith('.html')).sort()) {
  if (PARKED[file]) { warnings.push(`${file}: not checked, ${PARKED[file]}`); continue; }
  const text = pageText(readFileSync(join(ROOT, file), 'utf8'));
  const markers = [...text.matchAll(/\[[^\[\]]{1,200}\]/g)].map(m => m[0]);
  if (markers.length) {
    problems.push(`${file}: placeholders ${markers.slice(0, 4).join(' ')}${markers.length > 4 ? ` (+${markers.length - 4})` : ''}`);
  }
  const t = norm(text);
  for (const f of FORBIDDEN) {
    const m = t.match(f.re);
    if (m) {
      const i = m.index;
      problems.push(`${file}: "${f.label}" … ${t.slice(Math.max(0, i - 40), i + 40).trim()} …`);
    }
  }
}

// Consolidation example (X06): computed with TB.quote from config.js, never by hand.
const ctx = { window: {}, document: { addEventListener() {}, querySelectorAll: () => [] }, location: { search: '' }, URLSearchParams };
ctx.window.document = ctx.document;
vm.createContext(ctx);
for (const f of ['assets/js/config.js', 'assets/js/calculator.js']) vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), ctx);
const TB = ctx.window.TB;
const one = TB.quote(3, '', 'CO', 'courier'), all = TB.quote(9, '', 'CO', 'courier');
const sep = 3 * one.price, save = sep - all.price;
const expect = { each: `3 × ${TB.money(one.price)}`, one: TB.money(all.price), sep: TB.money(sep), tot: TB.money(all.price), save: TB.money(save) };
const consol = readFileSync(join(ROOT, 'consolidacion.html'), 'utf8');
for (const [k, v] of Object.entries(expect)) {
  const m = consol.match(new RegExp(`data-consol="${k}">([^<]*)<`));
  if (!m || decode(m[1]) !== v) problems.push(`consolidacion.html: example "${k}" shows "${m ? decode(m[1]) : 'nothing'}", the price code gives "${v}"`);
}
if (!(save > 0)) problems.push(`consolidation example saves nothing (${TB.money(sep)} separately vs ${TB.money(all.price)} consolidated)`);

warnings.forEach(w => console.log('note  ' + w));
console.log(`consolidation example: 3 × 3 lb = ${TB.money(sep)} separately, 9 lb = ${TB.money(all.price)} consolidated, saves ${TB.money(save)}`);
if (problems.length) {
  problems.forEach(p => console.log('FAIL  ' + p));
  console.log(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log('OK: no placeholders or unpublished terms on the checked pages.');
