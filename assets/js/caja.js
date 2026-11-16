// "Arma tu caja": the live box calculator (partial _src/partials/caja.html).
// All prices come from TB.quote (calculator.js, rates in config.js); this file only draws and writes the result.
(function () {
  'use strict';
  const TB = window.TB;
  if (!TB || !TB.quote) return;

  const num = s => parseFloat(String(s == null ? '' : s).replace(/\s/g, '').replace(',', '.'));
  const lb = n => (Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')) + ' lb';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Box size steps: small up to 4 lb, medium up to 10 lb, then large (growing a little per pound, capped).
  function size(billed) {
    if (billed <= 4) return ['s', 0.62];
    if (billed <= 10) return ['m', 0.8];
    return ['l', Math.min(1, 0.88 + (billed - 10) * 0.012)];
  }

  function init(form) {
    const P = TB.pricing;
    const wIn = form.querySelector('[name="peso"]'), vIn = form.querySelector('[name="valor"]');
    const dSel = form.querySelector('[name="destino"]'), tSel = form.querySelector('[name="tipo"]');
    const stage = form.querySelector('.caja__stage'), box = form.querySelector('.caja__box');
    const $ = k => form.querySelector('[data-caja="' + k + '"]');
    const out = { price: $('price'), billed: $('billed'), tax: $('tax'), lPrice: $('l-price'), lLb: $('l-lb'), lTax: $('l-tax') };

    const p = new URLSearchParams(location.search);
    if (p.get('peso')) wIn.value = p.get('peso');
    if (p.get('valor')) vIn.value = p.get('valor');

    dSel.innerHTML = Object.entries(P.destinations).map(([k, d]) => '<option value="' + k + '">' + esc(d.name) + '</option>').join('');
    dSel.value = P.destinations[p.get('destino')] ? p.get('destino') : P.defaultDest;

    // Type options, hints and the price list follow the destination.
    function fillTypes() {
      const d = P.destinations[dSel.value], keep = tSel.value;
      tSel.innerHTML = Object.entries(d.types).map(([k, r]) => '<option value="' + k + '">' + esc(r.label) + '</option>').join('');
      tSel.value = d.types[keep] ? keep : (d.types[p.get('tipo')] ? p.get('tipo') : Object.keys(d.types)[0]);
      tSel.closest('.caja__field').hidden = Object.keys(d.types).length < 2;
      $('mode').textContent = 'Envío ' + d.mode.toLowerCase() + '.';
      $('valor-hint').textContent = d.taxFree ? 'Hasta US$' + P.taxFreeUpTo + ' por caja: cero pago de impuestos.' : 'Lo usamos para la guía y la aduana.';
      $('includes').textContent = d.taxFree ? 'Incluye seguro y transporte nacional a ciudades principales.' : 'Entrega a domicilio en ' + d.name + '.';
    }
    function fillRate() {
      const r = P.destinations[dSel.value].types[tSel.value];
      $('type-hint').textContent = r.hint || '';
      $('list').innerHTML = TB.rateLines(dSel.value, tSel.value).map(([a, b]) => '<li><span>' + esc(a) + '</span><span>' + esc(b) + '</span></li>').join('');
    }

    function setBox(key, scale) {
      stage.dataset.size = key;
      box.style.setProperty('--s', scale);
    }
    function blank(msg, isError) {
      form.classList.toggle('is-error', !!isError);
      out.price.textContent = '—'; out.billed.textContent = msg; out.tax.hidden = true;
      out.lPrice.textContent = 'US$—'; out.lLb.textContent = '— lb'; out.lTax.textContent = '';
      setBox('m', 0.8);
    }

    function update() {
      const raw = wIn.value.trim();
      form.classList.remove('is-error');
      wIn.removeAttribute('aria-invalid');
      if (!raw) return blank('Escribe el peso para ver tu precio.');
      const w = num(raw);
      const q = TB.quote(w, vIn.value.trim() === '' ? '' : num(vIn.value), dSel.value, tSel.value);
      if (!q.ok) { wIn.setAttribute('aria-invalid', 'true'); return blank(q.error, true); }
      const money = TB.money(q.price);
      const notes = [];
      if (P.roundUp && q.billedLb !== w && w >= P.minLb) notes.push('redondeamos a la libra siguiente');
      if (q.minApplied) notes.push('cobro mínimo');
      if (q.insurance) notes.push('incluye ' + TB.money(q.insurance) + ' de seguro');
      out.price.textContent = money;
      out.billed.textContent = (q.fixed ? 'Precio por envío · ' + lb(q.billedLb) : 'Peso cobrado: ' + lb(q.billedLb)) + (notes.length ? ' (' + notes.join(', ') + ')' : '');
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
    dSel.addEventListener('change', () => { fillTypes(); fillRate(); update(); });
    tSel.addEventListener('change', () => { fillRate(); update(); });
    form.addEventListener('input', update);
    form.addEventListener('submit', e => { e.preventDefault(); update(); });
    fillTypes(); fillRate();
    form.classList.add('is-live');
    update();
  }

  document.querySelectorAll('form.caja').forEach(init);
})();
