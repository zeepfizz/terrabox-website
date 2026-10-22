// Solicitar tarifa: title and preselected account type come from ?tipo= (and ?llamada=1).
(function () {
  const p = new URLSearchParams(location.search);
  const map = { revendedor: ['Solicitar tarifa de revendedor', 'Revendedor'], empresa: ['Solicitar tarifa de empresa', 'Empresa o importador'], carga: ['Solicitar tarifa de carga', 'Carga aérea o marítima'] };
  const m = map[p.get('tipo') || ''] || ['Solicitar tarifa para tu negocio', ''];
  document.getElementById('h1').textContent = m[0];
  document.title = m[0] + ' | TerraBox';
  const host = document.querySelector('.lead-form');
  const cfg = JSON.parse(host.dataset.config);
  cfg.initial = { tipo: m[1], llamada: p.get('llamada') === '1' };
  host.dataset.config = JSON.stringify(cfg);
})();
