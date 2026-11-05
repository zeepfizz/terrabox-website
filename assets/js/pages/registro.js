// Registration: carries a quote from the calculator and shows the Miami address after sign-up.
(function () {
  const { esc } = TB;
  const el = id => document.getElementById(id);
  const p = new URLSearchParams(location.search); const city = p.get('ciudad'), peso = p.get('peso');

  if (city || peso) {
    el('reg-quote').hidden = false;
    el('reg-quote-text').textContent = 'US$[X] a ' + (city || '[ciudad]') + (peso ? ' · ' + peso + ' ' + (p.get('unidad') || 'lb') : '');
    el('reg-quote-back').href = 'tarifas.html' + location.search + '#calculadora';
  }

  const host = document.querySelector('.lead-form');
  const cfg = JSON.parse(host.dataset.config);
  cfg.initial = { ciudad: city || '', whatsapp: '+57 ', uso: p.get('tipo') ? 'Para mi negocio' : '', cotizacion: location.search };
  host.dataset.config = JSON.stringify(cfg);

  host.addEventListener('leadform:success', e => {
    const j = e.detail.response, v = e.detail.values;
    const a = { name: v.nombre, locker: j.locker || '', line1: j.line1 || '', city: j.city || 'Miami, FL', phone: j.phone || '' };
    const lines = [['Nombre (Full name)', a.name + ' ' + a.locker], ['Dirección (Address line 1)', a.line1], ['Línea 2 (Address line 2)', a.locker], ['Ciudad, estado, código postal', a.city], ['Teléfono', a.phone]];
    el('reg-locker').textContent = a.locker;
    el('reg-lines').innerHTML = lines.map(([k, val], i) =>
      '<div class="addr__row"><div><dt>' + esc(k) + '</dt><dd>' + esc(val) + '</dd></div>' +
      '<button type="button" class="btn" data-line="' + i + '" aria-label="Copiar ' + esc(k) + '">Copiar</button></div>').join('');
    el('reg-lines').onclick = ev => { const b = ev.target.closest('[data-line]'); if (b) TB.copy(lines[+b.dataset.line][1], 'Dirección copiada'); };
    el('reg-copy-all').onclick = () => TB.copy(lines.map(l => l[1]).join('\n'), 'Dirección copiada');
    el('reg-form').hidden = true; el('reg-done').hidden = false; el('reg-done').focus();
  });
})();
