// TerraBox shared behaviour: header, cookie banner, FAQ accordions, WhatsApp links, lead forms.
(function () {
  'use strict';
  const TB = window.TB || {};
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isDesktop = () => window.innerWidth >= 1024;

  // Shared helpers for page scripts.
  TB.$ = $; TB.$$ = $$; TB.esc = esc;
  TB.pageData = () => { const el = $('script[data-page]'); try { return el ? JSON.parse(el.textContent) : {}; } catch (e) { return {}; } };
  TB.toast = function (title) {
    let host = $('#toast-host');
    if (!host) {
      host = document.createElement('div'); host.id = 'toast-host'; host.setAttribute('aria-live', 'polite');
      host.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:150;width:min(360px,calc(100% - 32px))';
      document.body.appendChild(host);
    }
    host.innerHTML = '<div class="tb-toast" role="status"><span class="tb-toast__dot"></span><div style="flex:1;min-width:0"><div class="tb-toast__title">' + esc(title) + '</div></div></div>';
    clearTimeout(TB._toastT); TB._toastT = setTimeout(() => { host.innerHTML = ''; }, 2500);
  };
  TB.copy = function (text, okMsg) {
    const fail = 'No pudimos copiar. Selecciona el texto y cópialo.';
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => TB.toast(okMsg), () => TB.toast(fail));
  };

  // WhatsApp links are built without a number; add it once config.js has one.
  function patchWhatsApp() {
    if (!TB.waNumber) return;
    $$('a[href^="https://wa.me/?"]').forEach(a => { a.href = a.href.replace('https://wa.me/?', 'https://wa.me/' + TB.waNumber + '?'); });
  }

  // ---------------------------------------------------------------- header
  function initHeader() {
    const header = $('#site-header'); if (!header) return;
    let open = null, timer = null;
    const groups = $$('.nav-group', header);
    const setOpen = id => {
      open = id;
      groups.forEach(g => { const on = g.dataset.group === id; $('.nav-btn', g).setAttribute('aria-expanded', on ? 'true' : 'false'); $('.nav-dd', g).hidden = !on; });
    };
    groups.forEach(g => {
      const id = g.dataset.group, btn = $('.nav-btn', g), dd = $('.nav-dd', g);
      g.addEventListener('mouseenter', () => { clearTimeout(timer); timer = setTimeout(() => setOpen(id), 150); });
      g.addEventListener('mouseleave', () => { clearTimeout(timer); if (open === id) timer = setTimeout(() => setOpen(null), 150); });
      btn.addEventListener('click', e => {
        const kb = e.detail === 0; const wasOpen = open === id;
        setOpen(wasOpen ? null : id);
        if (kb && !wasOpen) setTimeout(() => { const a = $('a', dd); a && a.focus(); }, 0);
      });
      const onKey = e => {
        if (e.key === 'Tab') setTimeout(() => { if (!g.contains(document.activeElement) && open === id) setOpen(null); }, 0);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const links = $$('a', dd); if (!links.length || dd.hidden) return; e.preventDefault();
          const i = links.indexOf(document.activeElement);
          const n = e.key === 'ArrowDown' ? (i + 1) % links.length : (i <= 0 ? links.length - 1 : i - 1);
          links[n].focus();
        }
      };
      btn.addEventListener('keydown', onKey); dd.addEventListener('keydown', onKey);
    });
    document.addEventListener('click', e => { if (open && !e.target.closest('header')) setOpen(null); });

    // Mobile menu
    const menuBtn = $('#menu-btn'), panel = $('#menu-movil');
    const closeMobile = () => { panel.hidden = true; document.body.style.overflow = ''; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); updateFloating(); };
    const openMobile = () => { panel.hidden = false; document.body.style.overflow = 'hidden'; menuBtn.setAttribute('aria-expanded', 'true'); updateFloating(); setTimeout(() => { const f = $('button,a', panel); f && f.focus(); }, 0); };
    if (menuBtn && panel) {
      menuBtn.addEventListener('click', openMobile);
      $('#menu-close').addEventListener('click', closeMobile);
      $$('.m-group-btn', panel).forEach(b => b.addEventListener('click', () => {
        const sub = document.getElementById(b.getAttribute('aria-controls')); const on = sub.hidden;
        sub.hidden = !on; b.setAttribute('aria-expanded', on ? 'true' : 'false'); $('.m-sign', b).textContent = on ? '−' : '+';
      }));
      panel.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const els = $$('a[href],button', panel).filter(el => el.offsetParent !== null); const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (panel && !panel.hidden) closeMobile();
      else if (open) { const id = open; setOpen(null); const b = document.getElementById('nav-' + id); b && b.focus(); }
    });

    // Hide header on scroll down (mobile), sticky CTA bar and floating WhatsApp button
    const stickyBar = $('#sticky-bar'), floatWa = $('#float-wa');
    let lastY = 0;
    function kbOpen() { return window.visualViewport ? window.visualViewport.height < window.innerHeight * 0.75 : false; }
    function updateFloating() {
      const y = window.scrollY; const menuOpen = panel && !panel.hidden;
      header.classList.toggle('is-hidden', !isDesktop() && y > 120 && y > lastY && !menuOpen);
      lastY = y;
      const sticky = !!stickyBar && !isDesktop() && y > 480 && !kbOpen();
      if (stickyBar) stickyBar.hidden = !sticky;
      if (floatWa) floatWa.hidden = sticky || menuOpen;
    }
    window.addEventListener('scroll', updateFloating, { passive: true });
    window.addEventListener('resize', updateFloating);
    window.visualViewport && window.visualViewport.addEventListener('resize', updateFloating);
    updateFloating();
  }

  // ---------------------------------------------------------------- cookies
  function initCookies() {
    const banner = $('#cookie-banner'); if (!banner) return;
    const cfg = $('#cookie-cfg'), analytics = $('#cookie-analytics'), cfgBtn = $('[data-cookie="configure"]', banner);
    let consent = null; try { consent = localStorage.getItem('tb_cookie_consent'); } catch (e) {}
    const setCfg = on => { cfg.hidden = !on; cfgBtn.textContent = on ? 'Guardar selección' : 'Configurar'; };
    const save = v => { try { localStorage.setItem('tb_cookie_consent', v); } catch (e) {} consent = v; banner.hidden = true; setCfg(false); };
    banner.hidden = !!consent;
    $('[data-cookie="accept"]', banner).addEventListener('click', () => save('all'));
    $('[data-cookie="reject"]', banner).addEventListener('click', () => save('necessary'));
    cfgBtn.addEventListener('click', () => { if (!cfg.hidden) save(analytics.checked ? 'all' : 'necessary'); else setCfg(true); });
    const reopen = $('#cookie-reopen');
    reopen && reopen.addEventListener('click', () => { analytics.checked = consent === 'all'; setCfg(true); banner.hidden = false; });
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  // ---------------------------------------------------------------- FAQ
  function initFaqs() {
    $$('.faq').forEach(faq => {
      const single = faq.hasAttribute('data-single');
      const set = (item, on) => {
        const btn = $('.faq-btn', item); btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        $('[role="region"]', item).hidden = !on; $('.faq-sign', item).textContent = on ? '−' : '+';
      };
      $$('.faq-item', faq).forEach(item => {
        $('.faq-btn', item).addEventListener('click', () => {
          const on = $('.faq-btn', item).getAttribute('aria-expanded') !== 'true';
          if (single) $$('.faq-item', faq).forEach(o => o !== item && set(o, false));
          set(item, on);
          if (on) history.replaceState(null, '', '#' + item.id);
        });
      });
      faq._set = set;
    });
    const fromHash = () => {
      const id = decodeURIComponent((location.hash || '').slice(1)); if (!id) return;
      const item = document.getElementById(id); if (!item || !item.classList.contains('faq-item')) return;
      item.closest('.faq')._set(item, true);
      setTimeout(() => window.scrollTo({ top: item.getBoundingClientRect().top + window.scrollY - 96 }), 50);
    };
    fromHash(); window.addEventListener('hashchange', fromHash);
  }

  // ---------------------------------------------------------------- lead form
  function LeadForm(host) {
    const P = JSON.parse(host.dataset.config || '{}');
    const fid = P.formId || 'f';
    const fields = (P.fields || []).map(f => ({ ...f, options: f.options === '@cities' ? (TB.cities || []) : f.options }));
    const v = { ...(P.initial || {}) };
    fields.forEach(f => { if (v[f.name] === undefined || v[f.name] === '') v[f.name] = f.type === 'multi' ? [] : f.type === 'check' ? false : (v[f.name] !== undefined ? v[f.name] : (f.default || '')); });
    const touched = {}, errs = {};
    const visible = f => { if (!f.showIf) return true; const x = v[f.showIf.field]; return f.showIf.value === undefined ? !!x : x === f.showIf.value; };
    const idOf = f => fid + '-' + f.name;

    function validate(f) {
      const x = v[f.name];
      if (!visible(f)) return '';
      if (f.type === 'check') return f.required && !x ? (f.reqMsg || 'Marca esta casilla para continuar.') : '';
      if (f.type === 'multi') return f.required && !(x && x.length) ? 'Elige al menos una opción.' : '';
      const s = (x || '').toString().trim();
      if (!s) return f.required ? (f.reqMsg || 'Completa este campo.') : '';
      if (f.type === 'email' && !TB.emailOk(s)) return 'Escribe un email válido, por ejemplo nombre@correo.com';
      if (f.type === 'tel' && !TB.phoneOk(s)) return 'Escribe un número con indicativo, por ejemplo +57 300 123 4567';
      if (f.type === 'password' && (s.length < 8 || !/\d/.test(s))) return 'Usa al menos 8 caracteres y un número.';
      if (f.pattern && !new RegExp(f.pattern).test(s)) return f.patternMsg || 'Revisa el formato.';
      if (f.type === 'number' && !(parseFloat(s) > 0)) return 'Escribe un número mayor que 0.';
      return '';
    }

    function fieldHtml(f) {
      const t = f.type || 'text', id = idOf(f), d = id + '-d';
      const label = esc(f.label + (f.required && t !== 'check' ? ' (obligatorio)' : ''));
      const span = f.full || ['textarea', 'multi', 'check', 'radio'].includes(t) ? '1 / -1' : 'auto';
      const hint = '<span id="' + d + '" class="tb-hint" data-hint="' + esc(f.hint || '') + '">' + esc(f.hint || '') + '</span>';
      let inner = '';
      if (['text', 'email', 'tel', 'password', 'number'].includes(t)) {
        const type = t === 'number' ? 'text' : t; const im = t === 'number' ? 'decimal' : t === 'tel' ? 'tel' : t === 'email' ? 'email' : '';
        inner = '<label class="tb-field"><span class="tb-label">' + label + '</span><span class="tb-input tb-input--lg">' +
          (f.prefix ? '<span class="tb-affix">' + esc(f.prefix) + '</span>' : '') +
          '<input id="' + id + '" name="' + esc(f.name) + '" type="' + type + '"' + (im ? ' inputmode="' + im + '"' : '') +
          ' autocomplete="' + esc(f.autocomplete || 'off') + '" placeholder="' + esc(f.placeholder || '') + '"' +
          (f.required ? ' aria-required="true"' : '') + ' aria-describedby="' + d + '"></span>' + hint + '</label>';
        if (t === 'password') inner += '<button type="button" class="lf-pw" aria-pressed="false" style="align-self:flex-start;min-height:32px;border:0;background:transparent;padding:0;font:600 13px/1 var(--font-sans);color:var(--blue-600);cursor:pointer">Mostrar contraseña</button>';
      } else if (t === 'select') {
        inner = '<label for="' + id + '" class="tb-label">' + label + '</label><select id="' + id + '" name="' + esc(f.name) + '" class="lf-control" aria-describedby="' + d + '" autocomplete="' + esc(f.autocomplete || 'off') + '"><option value="">Elige una opción</option>' +
          (f.options || []).map(o => '<option value="' + esc(o) + '">' + esc(o) + '</option>').join('') + '</select>' + hint;
      } else if (t === 'textarea') {
        inner = '<label for="' + id + '" class="tb-label">' + label + '</label><textarea id="' + id + '" name="' + esc(f.name) + '" rows="5" class="lf-control" aria-describedby="' + d + '" placeholder="' + esc(f.placeholder || '') + '"></textarea>' + hint;
      } else if (t === 'multi' || t === 'radio') {
        const radio = t === 'radio';
        inner = '<fieldset id="' + id + '"' + (radio ? '' : ' aria-describedby="' + d + '"') + ' style="margin:0;padding:0;border:0;display:flex;flex-direction:column;gap:var(--space-2)"><legend style="font:600 13px/1.25 var(--font-sans);color:var(--fg-1);margin-bottom:var(--space-2);padding:0">' + label + '</legend><div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">' +
          (f.options || []).map(o => '<label class="lf-chip' + (radio ? ' lf-chip--radio' : '') + '"><input type="' + (radio ? 'radio' : 'checkbox') + '" name="' + (radio ? id : esc(f.name)) + '" value="' + esc(o) + '">' + esc(o) + '</label>').join('') +
          '</div>' + hint + '</fieldset>';
      } else if (t === 'check') {
        inner = '<label style="display:flex;gap:10px;align-items:flex-start;min-height:44px;font:500 14px/1.45 var(--font-sans);color:var(--fg-1);cursor:pointer"><input id="' + id + '" type="checkbox" aria-describedby="' + d + '" style="width:18px;height:18px;margin:2px 0 0;flex-shrink:0;accent-color:var(--tb-navy)"><span>' + esc(f.label) +
          (f.linkHref ? ' <a href="' + esc(f.linkHref) + '" target="_blank" rel="noopener">' + esc(f.linkLabel) + ' (se abre en una pestaña nueva)</a>' : '') + '</span></label>' + hint;
      } else if (t === 'file') {
        inner = '<label for="' + id + '" class="tb-label">' + label + '</label><input id="' + id + '" type="file" accept="' + esc(f.accept || '') + '" aria-describedby="' + d + '" style="font:400 14px var(--font-sans);min-height:44px">' + hint;
      }
      return '<div class="lf-row" data-name="' + esc(f.name) + '" style="grid-column:' + span + ';display:flex;flex-direction:column;gap:6px;min-width:0">' + inner + '</div>';
    }

    host.innerHTML =
      '<form novalidate aria-label="' + esc(P.ariaLabel || 'Formulario') + '" style="display:flex;flex-direction:column;gap:var(--space-5)">' +
      '<div class="lf-summary" tabindex="-1" role="alert" hidden style="padding:var(--space-4) var(--space-5);background:var(--status-danger-bg);border:1px solid var(--red-500);border-radius:var(--radius-md);outline:none"><h3 style="margin:0 0 var(--space-2);font:600 15px/1.4 var(--font-sans);color:#a82b2b"></h3><ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px"></ul></div>' +
      '<div class="lf-fail" role="alert" hidden style="padding:var(--space-4) var(--space-5);background:var(--status-danger-bg);border-radius:var(--radius-md);font:500 14px/1.5 var(--font-sans);color:#a82b2b"></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:var(--space-5) var(--space-4)">' + fields.map(fieldHtml).join('') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)"><div style="flex:0 1 auto;min-width:min(100%,240px)"><button type="submit" class="tb-btn tb-btn--primary tb-btn--lg tb-btn--full">' + esc(P.submitLabel || 'Enviar') + '</button></div></div>' +
      '</form>' +
      '<div class="lf-success" tabindex="-1" role="status" hidden style="padding:var(--space-8);background:var(--status-success-bg);border-radius:var(--radius-lg);flex-direction:column;gap:var(--space-3);outline:none">' +
      '<h3 style="margin:0;font:700 22px/1.25 var(--font-display);color:var(--navy-800)">' + esc(P.successTitle || 'Recibimos tu solicitud') + '</h3>' +
      '<p style="margin:0;font:400 15px/1.6 var(--font-sans);color:var(--fg-1)">' + esc(P.successBody || '') + '</p>' +
      '<p style="margin:0;font:500 15px/1.4 var(--font-mono);color:var(--navy-800)">Referencia: <span class="lf-ref"></span></p>' +
      '<a href="' + esc(TB.wa(P.waIntro || 'Hola')) + '" target="_blank" rel="noopener" style="align-self:flex-start;display:inline-flex;align-items:center;height:44px;padding:0 18px;border-radius:var(--radius-md);background:#fff;border:1px solid var(--border-strong);color:var(--tb-navy);font:600 14px/1 var(--font-sans)">Escribir por WhatsApp</a></div>' +
      '<div class="lf-offline" tabindex="-1" role="alert" hidden style="padding:var(--space-8);background:#fff;border:1px solid var(--amber-500);border-radius:var(--radius-lg);flex-direction:column;gap:var(--space-3);outline:none">' +
      '<span style="align-self:flex-start;font:600 12px/1 var(--font-sans);padding:5px 8px;border-radius:var(--radius-sm);background:var(--status-warning-bg);color:#99600a">Formulario sin conexión</span>' +
      '<h3 style="margin:0;font:700 20px/1.3 var(--font-display);color:var(--navy-800)">Tus datos están completos, pero este formulario aún no envía solicitudes</h3>' +
      '<p style="margin:0;font:400 15px/1.6 var(--font-sans);color:var(--fg-2)">No hemos recibido nada todavía. Mientras conectamos el sistema, envía la misma información por WhatsApp y te respondemos desde allí.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:var(--space-3)"><a class="lf-wa-summary" href="#" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;height:48px;padding:0 20px;border-radius:var(--radius-md);background:var(--action-primary);color:#fff;font:600 15px/1 var(--font-sans)">Enviar por WhatsApp</a>' +
      '<button type="button" class="lf-back tb-btn tb-btn--outline tb-btn--lg">Volver al formulario</button></div></div>';

    const form = $('form', host), summary = $('.lf-summary', host), fail = $('.lf-fail', host), submitBtn = $('button[type="submit"]', form);
    const panels = { success: $('.lf-success', host), offline: $('.lf-offline', host) };
    $$('.lf-success,.lf-offline', host).forEach(el => { el.style.display = ''; });
    const showPanel = name => {
      form.hidden = !!name; Object.keys(panels).forEach(k => { panels[k].hidden = k !== name; panels[k].style.display = k === name ? 'flex' : ''; });
      if (name) panels[name].focus();
    };

    // Seed controls with initial values
    fields.forEach(f => {
      const id = idOf(f), x = v[f.name];
      if (f.type === 'check') { $('#' + CSS.escape(id), host).checked = !!x; return; }
      if (f.type === 'multi') { $$('input', $('#' + CSS.escape(id), host)).forEach(i => { i.checked = x.includes(i.value); }); return; }
      if (f.type === 'radio') { $$('input', $('#' + CSS.escape(id), host)).forEach(i => { i.checked = i.value === x; }); return; }
      if (f.type === 'file') return;
      const el = $('#' + CSS.escape(id), host); if (el && typeof x === 'string') el.value = x;
    });

    function paint(f) {
      const row = $('.lf-row[data-name="' + CSS.escape(f.name) + '"]', host); if (!row) return;
      row.hidden = !visible(f);
      const err = errs[f.name] || '', hint = $('.tb-hint', row);
      hint.textContent = err || hint.dataset.hint; hint.classList.toggle('is-error', !!err);
      const ctl = $('.tb-input', row) || $('.lf-control', row); ctl && ctl.classList.toggle('is-error', !!err);
      const input = $('#' + CSS.escape(idOf(f)), row);
      if (input && input.tagName !== 'FIELDSET') { if (err) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    }
    const paintAll = () => fields.forEach(paint);

    function setVal(f, val) {
      v[f.name] = val;
      if (errs[f.name] !== undefined && touched[f.name]) errs[f.name] = validate(f);
      fields.forEach(o => { if (o.showIf && o.showIf.field === f.name) paint(o); });
      paint(f);
      if (P.redirectOn && f.name === P.redirectOn.field && val === P.redirectOn.value) location.href = P.redirectOn.href;
    }

    fields.forEach(f => {
      const row = $('.lf-row[data-name="' + CSS.escape(f.name) + '"]', host), id = idOf(f), t = f.type || 'text';
      if (t === 'check') {
        $('#' + CSS.escape(id), row).addEventListener('change', e => { touched[f.name] = true; setVal(f, e.target.checked); });
      } else if (t === 'multi') {
        $$('input', row).forEach(i => i.addEventListener('change', () => setVal(f, $$('input:checked', row).map(c => c.value))));
      } else if (t === 'radio') {
        $$('input', row).forEach(i => i.addEventListener('change', () => setVal(f, i.value)));
      } else if (t === 'file') {
        $('#' + CSS.escape(id), row).addEventListener('change', e => {
          const file = e.target.files && e.target.files[0];
          if (file && f.maxMb && file.size > f.maxMb * 1048576) { errs[f.name] = 'El archivo supera ' + f.maxMb + ' MB. Usa uno más liviano.'; e.target.value = ''; paint(f); return; }
          errs[f.name] = ''; setVal(f, file ? file.name : '');
        });
      } else {
        const el = $('#' + CSS.escape(id), row);
        el.addEventListener(t === 'select' ? 'change' : 'input', e => setVal(f, e.target.value));
      }
      if (t === 'password') {
        const b = $('.lf-pw', row), inp = $('#' + CSS.escape(id), row);
        b.addEventListener('click', () => { const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', show ? 'true' : 'false'); b.textContent = show ? 'Ocultar contraseña' : 'Mostrar contraseña'; });
      }
      row.addEventListener('focusout', e => {
        if (row.contains(e.relatedTarget)) return;
        if (t === 'tel' && v[f.name]) { v[f.name] = TB.fmtPhone(v[f.name]); $('#' + CSS.escape(id), row).value = v[f.name]; }
        if (!(v[f.name] || '').toString().trim() && !touched[f.name] && t !== 'check') return;
        touched[f.name] = true; errs[f.name] = validate(f); paint(f);
      });
    });
    paintAll();

    function summaryText() {
      return (P.waIntro || 'Hola, quiero enviar esta solicitud:') + '\n' + fields
        .filter(f => visible(f) && !['check', 'password', 'file'].includes(f.type))
        .map(f => { const x = v[f.name]; const s = Array.isArray(x) ? x.join(', ') : x; return s ? f.label + ': ' + s : null; })
        .filter(Boolean).join('\n');
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      fields.forEach(f => { errs[f.name] = validate(f); touched[f.name] = true; });
      paintAll();
      const bad = fields.filter(f => errs[f.name]);
      if (bad.length) {
        $('h3', summary).textContent = 'Revisa ' + (bad.length === 1 ? '1 campo' : bad.length + ' campos') + ' antes de enviar';
        $('ul', summary).innerHTML = bad.map(f => '<li><a href="#' + idOf(f) + '" data-go="' + idOf(f) + '" style="font:500 14px/1.4 var(--font-sans);color:#a82b2b;text-decoration:underline">' + esc((f.short || f.label.replace(/[.:]$/, '')) + ': ' + errs[f.name]) + '</a></li>').join('');
        summary.hidden = false; summary.focus();
        return;
      }
      summary.hidden = true; fail.hidden = true;
      const url = TB.endpoints && TB.endpoints[P.endpoint];
      submitBtn.disabled = true; submitBtn.setAttribute('aria-busy', 'true'); submitBtn.textContent = 'Procesando…';
      const done = () => { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.textContent = P.submitLabel || 'Enviar'; };
      if (!url) {
        setTimeout(() => { done(); $('.lf-wa-summary', host).href = TB.wa(summaryText()); showPanel('offline'); }, 400);
        return;
      }
      try {
        if (!navigator.onLine) throw new Error('offline');
        const body = { ...v }; if (P.omitPasswords) fields.filter(f => f.type === 'password').forEach(f => delete body[f.name]);
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ form: P.formId, ...body }) });
        if (!r.ok) throw new Error('http');
        const j = await r.json().catch(() => ({}));
        done(); $('.lf-ref', host).textContent = j.reference || j.id || '—'; showPanel('success');
        host.dispatchEvent(new CustomEvent('leadform:success', { detail: { response: j, values: { ...v } }, bubbles: true }));
      } catch (err) {
        done();
        fail.textContent = err.message === 'offline' ? 'Sin conexión. Revisa tu internet e intenta de nuevo; tus datos siguen aquí.' : 'No pudimos enviar tu solicitud. Tus datos siguen aquí; intenta de nuevo o escríbenos por WhatsApp.';
        fail.hidden = false;
      }
    });
    summary.addEventListener('click', e => {
      const a = e.target.closest('[data-go]'); if (!a) return; e.preventDefault();
      const el = document.getElementById(a.dataset.go); if (!el) return;
      const t = el.matches('fieldset') ? $('input', el) : el; t && t.focus();
    });
    $('.lf-back', host).addEventListener('click', () => showPanel(null));
  }

  // ---------------------------------------------------------------- config-driven content
  // Links, contact details and prices marked in the HTML are filled from config.js.
  function applyConfig() {
    const urls = TB.urls || {};
    $$('[data-tb-url]').forEach(a => { const u = urls[a.dataset.tbUrl]; if (u) a.href = u; });
    if (TB.email) $$('[data-tb="email"]').forEach(a => { a.textContent = TB.email; a.href = 'mailto:' + TB.email; });
    if (TB.hours) $$('[data-tb="hours"]').forEach(el => { el.textContent = TB.hours; });
    $$('[data-social]').forEach(a => { const u = (TB.social || {})[a.dataset.social]; if (u) { a.href = u; a.hidden = false; } });
    const P = TB.pricing;
    if (P) {
      const fill = (key, val) => $$('[data-price="' + key + '"]').forEach(el => { el.textContent = val; });
      P.tiers.forEach((t, i) => fill('tier' + i, 'US$' + t.price));
      fill('extra', 'US$' + P.extraPerLb);
      fill('taxFree', 'US$' + P.taxFreeUpTo);
      fill('loss', 'US$' + P.lossCoverage);
      fill('days', P.deliveryDays);
    }
  }

  // "Rastrea tu envío" forms: behaviour lives in TB.track (config.js).
  function initTrack() {
    $$('form.track').forEach(form => form.addEventListener('submit', e => {
      e.preventDefault();
      const input = $('input', form), msg = $('.track__msg', form), g = input.value.trim().toUpperCase();
      if (!g) { msg.textContent = 'Escribe tu número de guía.'; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
      msg.textContent = ''; input.removeAttribute('aria-invalid');
      TB.track(g);
    }));
  }

  // Elements with .reveal fade in once they scroll into view (skipped with reduced motion).
  function initReveal() {
    const els = $$('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
    els.forEach(el => io.observe(el));
  }

  // ---------------------------------------------------------------- boot
  document.documentElement.classList.add('js');
  applyConfig();
  initTrack();
  initReveal();
  patchWhatsApp();
  initHeader();
  initCookies();
  initFaqs();
  TB.initLeadForms = () => $$('.lead-form').forEach(LeadForm);
  // Lead forms start after page scripts had a chance to adjust their config.
  document.addEventListener('DOMContentLoaded', () => { TB.initLeadForms(); patchWhatsApp(); });
})();
