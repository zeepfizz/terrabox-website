// Shipping price math. Rates come from TB.pricing.destinations in config.js.
(function () {
  'use strict';

  const P = () => window.TB.pricing;

  // rate(dest, type) -> { dest, type, d, r } with defaults (Colombia, its first type).
  function rate(dest, type) {
    const all = P().destinations;
    const dk = all[dest] ? dest : P().defaultDest;
    const d = all[dk];
    const tk = d.types[type] ? type : Object.keys(d.types)[0];
    return { dest: dk, type: tk, d, r: d.types[tk] };
  }

  // quote(weightLb, declaredUsd, dest, type)
  //   -> { ok, billedLb, price, freight, insurance, minApplied, fixed, taxFree, error }
  // taxFree is null when the destination has no tax-free rule or no value was given.
  function quote(weightLb, declaredUsd, dest, type) {
    const C = P(), { d, r } = rate(dest, type);
    const w = Number(weightLb), v = Number(declaredUsd);
    if (!(w > 0)) return { ok: false, error: 'Escribe un peso mayor que 0.' };
    let billed = Math.max(C.minLb, w);
    if (C.roundUp) billed = Math.ceil(billed - 1e-9);
    if (r.maxLb && billed > r.maxLb) {
      return { ok: false, error: 'Esta tarifa es hasta ' + r.maxLb + ' lb. Para más peso escríbenos por WhatsApp.' };
    }
    let freight, minApplied = false;
    if (r.fixed != null) freight = r.fixed;
    else {
      freight = billed * r.perLb;
      if (r.min && freight < r.min) { freight = r.min; minApplied = true; }
    }
    const insurance = d.insurance || 0;
    const round = n => Math.round(n * 100) / 100;
    const hasValue = declaredUsd !== '' && declaredUsd != null && v >= 0;
    return {
      ok: true, billedLb: billed, freight: round(freight), insurance, minApplied, fixed: r.fixed != null,
      price: round(freight + insurance),
      taxFree: d.taxFree && hasValue ? v <= C.taxFreeUpTo : null
    };
  }

  const money = n => 'US$' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));

  // Pounds a per-pound rate covers with its minimum (US$30 at US$3/lb -> 10 lb).
  const minLbCovered = r => (r.perLb && r.min ? Math.floor(r.min / r.perLb + 1e-9) : 0);

  // Short price lines for one rate, e.g. [['Hasta 10 libras', 'US$30'], ['Cada libra adicional', 'US$3']].
  function rateLines(dest, type) {
    const { d, r } = rate(dest, type), lines = [];
    if (r.fixed != null) lines.push([r.maxLb ? 'Por envío, hasta ' + r.maxLb + ' libras' : 'Por envío', money(r.fixed)]);
    else {
      const n = minLbCovered(r);
      if (n > 1) lines.push(['Hasta ' + n + ' libras', money(r.min)]);
      lines.push([n > 1 ? 'Cada libra adicional' : 'Por libra', money(r.perLb)]);
    }
    if (d.insurance) lines.push(['Seguro por envío', money(d.insurance)]);
    return lines;
  }

  // Value for a data-price key: "CO.courier.min", "CO.courier.perLb", "EC.courier.fixed", "MX.insurance",
  // "CO.courier.minLb" (pounds covered by the minimum, as a number), "from" (cheapest public starting price).
  function priceFor(key) {
    const C = P();
    if (key === 'from') {
      const r = rate(C.defaultDest).r;
      return money(r.fixed != null ? r.fixed : r.min || r.perLb);
    }
    const [dk, a, b] = key.split('.');
    const d = C.destinations[dk];
    if (!d) return null;
    if (!b) return d[a] != null ? money(d[a]) : null;
    const r = d.types[a];
    if (!r) return null;
    if (b === 'minLb') return String(minLbCovered(r));
    return r[b] != null ? money(r[b]) : null;
  }

  window.TB.rate = rate;
  window.TB.quote = quote;
  window.TB.money = money;
  window.TB.rateLines = rateLines;
  window.TB.priceFor = priceFor;
})();
