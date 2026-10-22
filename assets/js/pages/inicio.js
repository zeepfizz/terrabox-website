// Homepage quick quote.
(function () {
  const { $ } = TB;
  const city = $('#q-city'), weight = $('#q-weight'), text = $('#q-text'), link = $('#q-link');
  function update() {
    const c = city.value, raw = weight.value, w = parseFloat(String(raw).replace(',', '.'));
    let t = 'Elige tu ciudad y escribe el peso para ver tu estimado.';
    if (c && w > 0) t = 'Envío estimado a ' + c + ' para ' + w + ' lb: desde US$[X], entrega a domicilio incluida.';
    else if (raw && !(w > 0)) t = 'Escribe un peso mayor que 0, por ejemplo 2.';
    text.textContent = t;
    const q = new URLSearchParams(); if (c) q.set('ciudad', c); if (w > 0) q.set('peso', w);
    link.href = 'tarifas.html' + (q.toString() ? '?' + q : '') + '#calculadora';
  }
  city.addEventListener('change', update);
  weight.addEventListener('input', update);
  update();
})();
