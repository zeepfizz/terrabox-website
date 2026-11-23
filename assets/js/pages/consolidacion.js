// Consolidación: the "separados o consolidados" example, computed with TB.quote so it follows config.js.
(function () {
  'use strict';
  const TB = window.TB, body = document.querySelector('[data-consol]');
  if (!TB || !TB.quote || !body) return;
  const n = Number(body.dataset.n), lb = Number(body.dataset.lb);
  const one = TB.quote(lb, '', 'CO', 'courier'), all = TB.quote(n * lb, '', 'CO', 'courier');
  if (!one.ok || !all.ok) return;
  const set = (k, v) => { const el = body.querySelector('[data-consol="' + k + '"]'); if (el) el.textContent = v; };
  set('each', n + ' × ' + TB.money(one.price));
  set('one', TB.money(all.price));
  set('sep', TB.money(n * one.price));
  set('tot', TB.money(all.price));
  set('save', TB.money(n * one.price - all.price));
})();
