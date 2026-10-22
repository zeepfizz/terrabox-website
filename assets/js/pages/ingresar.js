// Login / password recovery. Works once TB.endpoints.login is set in config.js.
(function () {
  const el = id => document.getElementById(id);
  const email = el('login-email'), pw = el('login-pw'), submit = el('login-submit'), msg = el('login-msg');
  let mode = 'login';
  const tones = { warn: ['var(--status-warning-bg)', '#7a4c08'], ok: ['var(--status-success-bg)', '#15734e'], err: ['var(--status-danger-bg)', '#a82b2b'] };

  function fieldErr(input, text) {
    const field = input.closest('.tb-field'), hint = field.querySelector('.tb-hint');
    field.querySelector('.tb-input').classList.toggle('is-error', !!text);
    hint.classList.toggle('is-error', !!text); hint.textContent = text || '';
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  function say(text, tone) {
    loading(false);
    if (!text) { msg.hidden = true; return; }
    const t = tones[tone] || tones.err;
    msg.style.background = t[0]; msg.style.color = t[1]; msg.textContent = text; msg.hidden = false; msg.focus();
  }
  function loading(on) { submit.disabled = on; submit.textContent = on ? 'Procesando…' : (mode === 'login' ? 'Ingresar' : 'Enviar enlace'); }
  function setMode(m) {
    mode = m; say('');
    document.getElementById('h1').textContent = m === 'login' ? 'Ingresar' : 'Recuperar contraseña';
    el('login-pw-wrap').hidden = m !== 'login';
    el('login-forgot-note').hidden = el('login-to-login').hidden = m !== 'forgot';
    fieldErr(pw, ''); loading(false);
  }

  el('login-pw-toggle').addEventListener('click', e => {
    const show = pw.type === 'password'; pw.type = show ? 'text' : 'password';
    e.target.setAttribute('aria-pressed', show ? 'true' : 'false'); e.target.textContent = show ? 'Ocultar contraseña' : 'Mostrar contraseña';
  });
  el('login-to-forgot').addEventListener('click', () => setMode('forgot'));
  el('login-to-login').addEventListener('click', () => setMode('login'));
  email.addEventListener('input', () => fieldErr(email, ''));
  pw.addEventListener('input', () => fieldErr(pw, ''));

  el('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const eErr = !email.value.trim() ? 'Escribe tu email.' : (!TB.emailOk(email.value) ? 'Escribe un email válido, por ejemplo nombre@correo.com' : '');
    const pErr = mode === 'login' && !pw.value ? 'Escribe tu contraseña.' : '';
    fieldErr(email, eErr); fieldErr(pw, pErr); say('');
    if (eErr || pErr) return;
    const url = TB.endpoints && TB.endpoints.login; loading(true);
    if (!url) { setTimeout(() => say('El portal de clientes aún no está conectado a este sitio, así que no podemos verificar tu cuenta aquí. Escríbenos por WhatsApp para consultar tus paquetes.', 'warn'), 400); return; }
    try {
      const r = await fetch(url + (mode === 'forgot' ? '/recuperar' : ''), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.value, password: mode === 'login' ? pw.value : undefined }) });
      if (mode === 'forgot') { say('Si ese email tiene una cuenta, te enviamos un enlace. Revisa también la carpeta de spam.', 'ok'); return; }
      if (r.status === 401) { say('El email o la contraseña no coinciden. Revisa e intenta de nuevo.', 'err'); return; }
      if (!r.ok) throw new Error();
      const j = await r.json().catch(() => ({})); loading(false); if (j.redirect) location.href = j.redirect;
    } catch (err) { say('No pudimos conectar. Intenta de nuevo en unos minutos.', 'err'); }
  });
})();
