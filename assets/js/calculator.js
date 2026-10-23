// Shipping price calculator for Colombia. Rates come from TB.pricing in config.js.
(function () {
  'use strict';

  // quote(weightLb, declaredUsd) -> { ok, billedLb, price, taxFree, error }
  function quote(weightLb, declaredUsd) {
    const P = window.TB.pricing;
    const w = Number(weightLb), v = Number(declaredUsd);
    if (!(w > 0)) return { ok: false, error: 'Escribe un peso mayor que 0.' };
    let billed = Math.max(P.minLb, w);
    if (P.roundUp) billed = Math.ceil(billed - 1e-9);
    let price;
    const tier = P.tiers.find(t => billed <= t.upToLb);
    if (tier) price = tier.price;
    else {
      const last = P.tiers[P.tiers.length - 1];
      price = last.price + (billed - last.upToLb) * P.extraPerLb;
    }
    const hasValue = declaredUsd !== '' && declaredUsd != null && v >= 0;
    return { ok: true, billedLb: billed, price: Math.round(price * 100) / 100, taxFree: hasValue ? v <= P.taxFreeUpTo : null };
  }

  const num = s => parseFloat(String(s == null ? '' : s).replace(/\s/g, '').replace(',', '.'));
  const money = n => 'US$' + (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ','));
  const lb = n => (Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')) + ' lb';

  // Wires every <form class="calc"> on the page.
  function initCalculators() {
    document.querySelectorAll('form.calc').forEach(form => {
      const wIn = form.querySelector('[name="peso"]'), vIn = form.querySelector('[name="valor"]');
      const out = form.querySelector('.calc__result');
      const price = out.querySelector('.calc__price'), detail = out.querySelector('.calc__detail'), tax = out.querySelector('.calc__tax');
      const P = window.TB.pricing;
      function update() {
        const raw = wIn.value.trim();
        out.classList.remove('is-error', 'is-ready');
        if (!raw) { price.textContent = '—'; detail.textContent = 'Escribe el peso para ver tu precio.'; tax.hidden = true; return; }
        const q = quote(num(raw), vIn.value.trim() === '' ? '' : num(vIn.value));
        if (!q.ok) { out.classList.add('is-error'); price.textContent = '—'; detail.textContent = q.error; tax.hidden = true; return; }
        out.classList.add('is-ready');
        price.textContent = money(q.price);
        detail.textContent = 'Peso cobrado: ' + lb(q.billedLb) + (P.roundUp && q.billedLb !== num(raw) && num(raw) >= P.minLb ? ' (redondeamos a la libra siguiente)' : '');
        tax.hidden = q.taxFree === null;
        if (q.taxFree !== null) {
          tax.classList.toggle('is-warn', !q.taxFree);
          tax.textContent = q.taxFree ? 'Cero pago de impuestos.' : 'Paga impuestos adicionales (arancel e IVA).';
        }
      }
      form.addEventListener('input', update);
      form.addEventListener('submit', e => { e.preventDefault(); update(); out.focus(); });
      const p = new URLSearchParams(location.search);
      if (p.get('peso') && !wIn.value) wIn.value = p.get('peso');
      if (p.get('valor') && !vIn.value) vIn.value = p.get('valor');
      update();
    });
  }

  window.TB.quote = quote;
  window.TB.money = money;
  document.addEventListener('DOMContentLoaded', initCalculators);
})();
