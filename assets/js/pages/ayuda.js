// FAQ page search.
(function () {
  const { $, $$ } = TB;
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const input = $('#faq-search'), count = $('#faq-count'), none = $('#faq-none'), waQ = $('#faq-waq');
  function filter() {
    const raw = input.value, q = norm(raw.trim()); let n = 0;
    $$('.faq-group').forEach(g => {
      let shown = 0;
      $$('.faq-item', g).forEach(it => { const on = !q || norm(it.dataset.search).includes(q); it.hidden = !on; if (on) shown++; });
      g.hidden = shown === 0; n += shown;
    });
    count.textContent = q ? n + (n === 1 ? ' pregunta encontrada' : ' preguntas encontradas') : '';
    none.hidden = !(q && n === 0);
    waQ.href = TB.wa('Hola, tengo una pregunta: ' + raw);
  }
  input.addEventListener('input', filter);
  const q0 = new URLSearchParams(location.search).get('q');
  if (q0) input.value = q0;
  filter();
})();
