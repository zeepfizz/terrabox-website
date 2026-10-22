// Restricted products: search and collapsible groups.
(function () {
  const { $, $$ } = TB;
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const input = $('#pr-search'), count = $('#pr-count'), none = $('#pr-none'), waQ = $('#pr-waq');
  const closed = {};
  function render() {
    const raw = input.value, q = norm(raw.trim()); let n = 0;
    $$('.pr-group').forEach(g => {
      const id = g.dataset.group; let shown = 0;
      $$('.pr-item', g).forEach(it => { const on = !q || norm(it.dataset.search).includes(q); it.hidden = !on; if (on) shown++; });
      n += shown; g.hidden = shown === 0;
      const open = q ? true : !closed[id];
      $('.pr-toggle', g).setAttribute('aria-expanded', open ? 'true' : 'false');
      $('.pr-sign', g).textContent = open ? '−' : '+';
      $('#pr-list-' + id).hidden = !open;
    });
    count.textContent = q ? n + (n === 1 ? ' resultado' : ' resultados') : '';
    none.hidden = !(q && n === 0);
    $('#pr-q').textContent = raw;
    waQ.href = TB.wa('Quiero confirmar si puedo enviar este producto: ' + raw);
  }
  $$('.pr-group').forEach(g => $('.pr-toggle', g).addEventListener('click', () => {
    const id = g.dataset.group; closed[id] = $('.pr-toggle', g).getAttribute('aria-expanded') === 'true'; render();
  }));
  input.addEventListener('input', render);
  render();
})();
