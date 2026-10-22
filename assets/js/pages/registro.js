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
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:10px 14px;border-bottom:1px solid var(--border-subtle)">' +
      '<div style="min-width:0"><dt style="font:400 12px/1.3 var(--font-sans);color:var(--fg-3)">' + esc(k) + '</dt><dd style="margin:0;font:500 15px/1.4 var(--font-mono);color:var(--fg-1);overflow-wrap:anywhere">' + esc(val) + '</dd></div>' +
      '<button type="button" class="tb-btn tb-btn--outline" data-line="' + i + '" aria-label="Copiar ' + esc(k) + '" style="flex-shrink:0;min-width:44px;height:44px;padding:0 12px;font-size:13px">Copiar</button></div>').join('');
    el('reg-lines').onclick = ev => { const b = ev.target.closest('[data-line]'); if (b) TB.copy(lines[+b.dataset.line][1], 'Dirección copiada'); };
    el('reg-copy-all').onclick = () => TB.copy(lines.map(l => l[1]).join('\n'), 'Dirección copiada');
    el('reg-form').hidden = true; el('reg-done').hidden = false; el('reg-done').focus();
  });
})();
