// Solicitar tarifa: title and preselected account type come from ?tipo= (and ?llamada=1).
(function () {
  const p = new URLSearchParams(location.search);
  // [h1 (fits two lines at display size), document title, account type]
  const map = { revendedor: ['Tarifa de revendedor.', 'Solicitar tarifa de revendedor', 'Revendedor'], empresa: ['Tarifa de empresa.', 'Solicitar tarifa de empresa', 'Empresa o importador'], carga: ['Tarifa de carga.', 'Solicitar tarifa de carga', 'Carga aérea o marítima'] };
  const m = map[p.get('tipo') || ''] || ['Tarifa para tu negocio.', 'Solicitar tarifa para tu negocio', ''];
  document.getElementById('h1').textContent = m[0];
  document.title = m[1] + ' | TerraBox';
  const host = document.querySelector('.lead-form');
  const cfg = JSON.parse(host.dataset.config);
  cfg.initial = { tipo: m[2], llamada: p.get('llamada') === '1' };
  host.dataset.config = JSON.stringify(cfg);
})();
