// Shipment tracking. Results appear once TB.endpoints.rastreo is set in config.js.
(function () {
  const { $$, esc } = TB;
  const el = id => document.getElementById(id);
  const stages = ['Recibido en Miami', 'Consolidado', 'En vuelo o en buque', 'En aduana', 'En reparto', 'Entregado'];
  const input = el('guia'), btn = el('track-btn');
  const box = input.closest('.tb-input'), hint = input.closest('.tb-field').querySelector('.tb-hint');
  const errs = {
    nc: ['El rastreo en línea aún no está disponible', 'Todavía no conectamos este buscador con nuestro sistema de envíos. Escríbenos con tu número de guía y te damos el estado.'],
    off: ['Sin conexión', 'Revisa tu internet e intenta de nuevo.'],
    err: ['No pudimos consultar tu envío', 'Intenta de nuevo en unos minutos o escríbenos.']
  };

  function setErr(msg) {
    box.classList.toggle('is-error', !!msg); hint.classList.toggle('is-error', !!msg);
    hint.textContent = msg || hint.dataset.hint;
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  function show(status, data, kind) {
    ['loading', 'result', 'notfound', 'error', 'idle'].forEach(k => { el('t-' + k).hidden = k !== status; });
    btn.disabled = status === 'loading'; btn.textContent = status === 'loading' ? 'Buscando…' : 'Rastrear';
    if (status === 'error') { const e = errs[kind] || errs.err; el('t-err-title').textContent = e[0]; el('t-err-body').textContent = e[1]; }
    if (status === 'result') {
      const d = data || {}; const cur = d.current != null ? d.current : -1;
      el('t-guia').textContent = input.value.trim().toUpperCase();
      el('t-current').textContent = stages[cur] || '';
      el('t-steps').innerHTML = stages.map((label, i) => {
        const ev = (d.events || [])[i] || {}; const done = i <= cur, now = i === cur;
        const state = now ? '(estado actual)' : done ? '(completado)' : '';
        return '<li' + (now ? ' aria-current="step"' : '') + ' style="display:grid;grid-template-columns:24px 1fr;gap:var(--space-4);padding-bottom:var(--space-5)">' +
          '<span aria-hidden="true" style="width:20px;height:20px;border-radius:10px;margin-top:2px;background:' + (done ? 'var(--tb-navy)' : '#fff') + ';border:2px solid ' + (done ? 'var(--tb-navy)' : 'var(--border-strong)') + '"></span>' +
          '<div><div style="font:' + (now ? '700 16px/1.4 var(--font-sans)' : '500 15px/1.4 var(--font-sans)') + ';color:' + (done ? 'var(--navy-800)' : 'var(--fg-3)') + '">' + esc(label) +
          ' <span style="font:500 13px var(--font-sans);color:var(--fg-3)">' + state + '</span></div><div style="font:400 13px/1.4 var(--font-mono);color:var(--fg-3)">' + esc(ev.date || '') + '</div></div></li>';
      }).join('');
      const partner = el('t-partner'); partner.hidden = !d.partnerUrl; if (d.partnerUrl) partner.href = d.partnerUrl;
    }
  }

  async function lookup() {
    const g = input.value.trim().toUpperCase();
    if (!g) { setErr('Escribe tu número de guía.'); return; }
    if (g.length < 6) { setErr('El número parece incompleto. Revisa tu correo de despacho.'); return; }
    setErr(''); show('loading');
    history.replaceState(null, '', '?guia=' + encodeURIComponent(g));
    $$('.t-wahelp').forEach(a => { a.href = TB.wa('Hola, quiero saber el estado de mi guía ' + input.value); });
    const url = TB.endpoints && TB.endpoints.rastreo;
    if (!url) { setTimeout(() => show('error', null, 'nc'), 500); return; }
    try {
      if (!navigator.onLine) throw new Error('offline');
      const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'guia=' + encodeURIComponent(g));
      if (r.status === 404) { show('notfound'); return; }
      if (!r.ok) throw new Error('http');
      show('result', await r.json());
    } catch (e) { show('error', null, e.message === 'offline' ? 'off' : 'err'); }
  }

  el('track-form').addEventListener('submit', e => { e.preventDefault(); lookup(); });
  el('t-retry').addEventListener('click', lookup);
  input.addEventListener('input', () => setErr(''));
  const g0 = new URLSearchParams(location.search).get('guia');
  if (g0) { input.value = g0; lookup(); }
})();
