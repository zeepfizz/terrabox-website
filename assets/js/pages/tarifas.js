// Rate calculator. Prices appear once TB.rates / TB.volumetricDivisorIn are set in config.js.
(function () {
  const { $, $$, esc } = TB;
  const el = id => document.getElementById(id);
  const s = { city: '', weight: '', unit: 'lb', more: false, L: '', W: '', H: '', value: '', pk: '1', cat: '', ins: false, loading: false, calc: null };
  const inputs = { city: el('calc-city'), weight: el('calc-weight'), L: el('calc-L'), W: el('calc-W'), H: el('calc-H'), value: el('calc-value'), pk: el('calc-pk'), cat: el('calc-cat') };
  const num = v => parseFloat(String(v || '').replace(',', '.'));
  const f2 = n => n.toFixed(2).replace('.', ',');
  let t = null;

  // Prefill from a shared link
  const p = new URLSearchParams(location.search);
  ['ciudad:city', 'peso:weight', 'unidad:unit', 'largo:L', 'ancho:W', 'alto:H', 'valor:value', 'paquetes:pk', 'categoria:cat'].forEach(m => { const [a, b] = m.split(':'); if (p.get(a)) s[b] = p.get(a); });
  if (p.get('seguro') === '1') s.ins = true;
  if (s.L || s.value) s.more = true;
  Object.keys(inputs).forEach(k => { if (s[k]) inputs[k].value = s[k]; });
  el('calc-ins').checked = s.ins;

  function compute() {
    const raw = num(s.weight); const lb = s.unit === 'kg' ? raw * 2.20462 : raw;
    const L = num(s.L), W = num(s.W), H = num(s.H); const vol = L > 0 && W > 0 && H > 0 ? L * W * H : null;
    const div = TB.volumetricDivisorIn; const volLb = vol && div ? vol / div : null;
    const bill = Math.max(lb, volLb || 0); const r = TB.rates && TB.rates[s.city];
    const freight = r ? Math.max(r.min || 0, bill * r.perLb) : null;
    return { lb, vol, volLb, bill, freight, byVol: volLb && volLb > lb };
  }
  const usd = n => 'US$' + n.toFixed(2);

  function recalc() {
    clearTimeout(t);
    if (!s.city || !(num(s.weight) > 0)) { s.calc = null; s.loading = false; render(); return; }
    s.loading = true; render();
    t = setTimeout(() => { s.loading = false; s.calc = compute(); render(); }, 300);
  }

  function shareQuery() {
    const q = new URLSearchParams(); const raw = num(s.weight);
    if (s.city) q.set('ciudad', s.city); if (raw > 0) q.set('peso', s.weight); if (s.unit !== 'lb') q.set('unidad', s.unit);
    [['largo', 'L'], ['ancho', 'W'], ['alto', 'H'], ['valor', 'value'], ['categoria', 'cat']].forEach(([a, b]) => s[b] && q.set(a, s[b]));
    if (s.pk && s.pk !== '1') q.set('paquetes', s.pk); if (s.ins) q.set('seguro', '1');
    return q;
  }
  const shareLink = () => { const q = shareQuery(); return location.href.split('?')[0].split('#')[0] + (q.toString() ? '?' + q : '') + '#calculadora'; };

  function render() {
    const c = s.calc, raw = num(s.weight);
    // unit toggle + conversion hint
    $$('.seg-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.unit === s.unit ? 'true' : 'false'));
    const suffix = inputs.weight.closest('.tb-input').querySelector('.tb-affix--suffix'); if (suffix) suffix.textContent = s.unit;
    el('calc-conv').textContent = raw > 0 ? (s.unit === 'lb' ? f2(raw) + ' lb = ' + f2(raw / 2.20462) + ' kg' : f2(raw) + ' kg = ' + f2(raw * 2.20462) + ' lb') : 'Usamos libras para cobrar; puedes escribir en kg.';
    // more options
    el('calc-more').hidden = !s.more; el('calc-more-btn').setAttribute('aria-expanded', s.more ? 'true' : 'false'); el('calc-more-sign').textContent = s.more ? '−' : '+';
    // result
    const total = c && c.freight != null ? usd(c.freight) : 'US$[X]';
    el('r-empty').hidden = !(!c && !s.loading);
    el('r-loading-bar').hidden = el('r-loading').hidden = !s.loading;
    const isResult = !!c && !s.loading;
    el('r-total').hidden = el('r-sub').hidden = el('r-body').hidden = !isResult;
    if (isResult) {
      el('r-total').textContent = total;
      el('r-sub').textContent = 'Envío a ' + s.city + ' · ' + f2(c.bill) + ' lb cobradas';
      const lines = [
        ['Peso real', f2(c.lb) + ' lb'],
        ['Peso volumétrico', c.vol ? (c.volLb ? f2(c.volLb) + ' lb' : '[divisor por confirmar]') : 'Sin medidas'],
        ['Peso cobrado', f2(c.bill) + ' lb'],
        ['Flete y manejo', c.freight != null ? usd(c.freight) : 'US$[X]'],
        ['Seguro opcional', s.ins ? 'US$[X]' : 'No agregado'],
        ['Impuestos (estimado)', s.value ? 'US$[X]' : 'Agrega el valor declarado'],
        ['Total en COP (aprox.)', 'COP [X]'],
        ['Entrega', '[3–5] días hábiles']
      ];
      el('r-lines').innerHTML = lines.map(([k, v]) => '<div style="display:flex;justify-content:space-between;gap:var(--space-4);padding:12px 0;border-bottom:1px solid var(--border-subtle)"><dt style="font:400 14px/1.4 var(--font-sans);color:var(--fg-2)">' + esc(k) + '</dt><dd style="margin:0;font:500 14px/1.4 var(--font-mono);color:var(--fg-1);text-align:right">' + esc(v) + '</dd></div>').join('');
      el('r-bill').textContent = c.byVol ? 'Cobramos el peso volumétrico porque es mayor que el real.' : 'Cobramos el peso real porque es mayor o igual al volumétrico.';
    }
    el('r-rates-missing').hidden = !!TB.rates;
    const q = shareQuery();
    el('r-reg').href = 'registro.html' + (q.toString() ? '?' + q : '');
    el('r-wa').href = TB.wa('Hola, quiero confirmar esta cotización: ' + (c ? s.city + ', ' + f2(c.bill) + ' lb, total ' + total : 'aún sin datos') + '. ' + shareLink());
    el('calc-bar-total').textContent = total;
    updateBar();
  }

  function updateBar() { el('calc-bar').hidden = !(window.innerWidth < 1024 && !!s.calc && window.scrollY > 900); }

  const set = (k, v) => { s[k] = v; recalc(); };
  inputs.city.addEventListener('change', e => set('city', e.target.value));
  inputs.cat.addEventListener('change', e => set('cat', e.target.value));
  ['weight', 'L', 'W', 'H', 'value', 'pk'].forEach(k => inputs[k].addEventListener('input', e => set(k, e.target.value)));
  el('calc-ins').addEventListener('change', e => set('ins', e.target.checked));
  $$('.seg-btn').forEach(b => b.addEventListener('click', () => set('unit', b.dataset.unit)));
  el('calc-more-btn').addEventListener('click', () => { s.more = !s.more; render(); });
  el('calc-form').addEventListener('submit', e => e.preventDefault());
  el('r-copy').addEventListener('click', () => {
    const msg = el('r-copymsg');
    const done = m => { msg.textContent = m; setTimeout(() => { msg.textContent = ''; }, 2500); };
    const fail = 'No pudimos copiar. Copia la dirección de la barra del navegador.';
    navigator.clipboard ? navigator.clipboard.writeText(shareLink()).then(() => done('Enlace copiado'), () => done(fail)) : done(fail);
  });
  window.addEventListener('scroll', updateBar, { passive: true });
  window.addEventListener('resize', updateBar);
  recalc();
})();
