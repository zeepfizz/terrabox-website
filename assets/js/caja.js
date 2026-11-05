// "Arma tu caja": the live box calculator (partial _src/partials/caja.html).
// All prices come from TB.quote (calculator.js, rates in config.js); this file only draws and writes the result.
(function () {
  'use strict';
  const TB = window.TB;
  if (!TB || !TB.quote) return;

  const num = s => parseFloat(String(s == null ? '' : s).replace(/\s/g, '').replace(',', '.'));
  const lb = n => (Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')) + ' lb';

  // Box size steps with the price tier: small, medium, large (growing a little per extra pound, capped).
  function size(billed) {
    const tiers = TB.pricing.tiers;
    if (billed <= tiers[0].upToLb) return ['s', 0.62];
    const last = tiers[tiers.length - 1].upToLb;
    if (billed <= last) return ['m', 0.8];
    return ['l', Math.min(1, 0.88 + (billed - last) * 0.012)];
  }

  function init(form) {
    const wIn = form.querySelector('[name="peso"]'), vIn = form.querySelector('[name="valor"]');
    const stage = form.querySelector('.caja__stage'), box = form.querySelector('.caja__box');
    const $ = k => form.querySelector('[data-caja="' + k + '"]');
    const out = { price: $('price'), billed: $('billed'), tax: $('tax'), lPrice: $('l-price'), lLb: $('l-lb'), lTax: $('l-tax') };

    const p = new URLSearchParams(location.search);
    if (p.get('peso')) wIn.value = p.get('peso');
    if (p.get('valor')) vIn.value = p.get('valor');

    function setBox(key, scale) {
      stage.dataset.size = key;
      box.style.setProperty('--s', scale);
    }

    function update() {
      const raw = wIn.value.trim();
      const P = TB.pricing;
      form.classList.remove('is-error');
      wIn.removeAttribute('aria-invalid');
      if (!raw) {
        out.price.textContent = '—'; out.billed.textContent = 'Escribe el peso para ver tu precio.'; out.tax.hidden = true;
        out.lPrice.textContent = 'US$—'; out.lLb.textContent = '— lb'; out.lTax.textContent = '';
        setBox('m', 0.8);
        return;
      }
      const w = num(raw);
      const q = TB.quote(w, vIn.value.trim() === '' ? '' : num(vIn.value));
      if (!q.ok) {
        form.classList.add('is-error'); wIn.setAttribute('aria-invalid', 'true');
        out.price.textContent = '—'; out.billed.textContent = q.error; out.tax.hidden = true;
        out.lPrice.textContent = 'US$—'; out.lLb.textContent = '— lb'; out.lTax.textContent = '';
        setBox('m', 0.8);
        return;
      }
      const money = TB.money(q.price);
      out.price.textContent = money;
      out.billed.textContent = 'Peso cobrado: ' + lb(q.billedLb) +
        (P.roundUp && q.billedLb !== w && w >= P.minLb ? ' (redondeamos a la libra siguiente)' : '');
      out.tax.hidden = q.taxFree === null;
      if (q.taxFree !== null) {
        out.tax.classList.toggle('is-warn', !q.taxFree);
        out.tax.textContent = q.taxFree ? 'Cero pago de impuestos.' : 'Paga impuestos adicionales (arancel e IVA).';
      }
      out.lPrice.textContent = money;
      out.lLb.textContent = lb(q.billedLb);
      out.lTax.textContent = q.taxFree === null ? '' : (q.taxFree ? 'Cero impuestos' : 'Paga impuestos');
      const s = size(q.billedLb);
      setBox(s[0], s[1]);
    }

    // Arrow keys step the value (1 lb, US$10); the inputs stay plain text fields for decimal commas.
    [[wIn, 1], [vIn, 10]].forEach(([input, step]) => {
      input.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault();
        const cur = num(input.value) || 0;
        const next = Math.max(0, Math.round((cur + (e.key === 'ArrowUp' ? step : -step)) * 10) / 10);
        input.value = String(next).replace('.', ',');
        update();
      });
      input.addEventListener('focus', () => { if (input.value) input.select(); });
    });
    form.addEventListener('input', update);
    form.addEventListener('submit', e => { e.preventDefault(); update(); });
    form.classList.add('is-live');
    update();
  }

  document.querySelectorAll('form.caja').forEach(init);
})();
