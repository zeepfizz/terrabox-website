#!/usr/bin/env python3
"""Build the TerraBox static site.

Reads the page sources in _src/pages/*.dc.html (the Claude Design prototypes, with their
JavaScript data replaced by a JSON block) and writes plain, ready-to-host HTML files to the
website root. Run from anywhere:  python _src/build.py

Source page format
  <helmet>        title, meta description and optional <style> blocks
  <x-dc> ... </x-dc>   page markup. Supports {{ path }}, <sc-for list= as=>, <sc-if value=>,
                  <dc-import name="Site-Header|Site-Footer|Faq|Legal-Page|Lead-Form" ...>,
                  <x-import component-from-global-scope="...Input|Select|Button" ...>,
                  style-hover="..." / style-focus="..." (turned into CSS classes)
  <script type="application/json" data-page>   data for the {{ }} expressions
  anything else after </x-dc> (e.g. <script src=...>) is copied before </body>
"""
import hashlib
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from icons import ICONS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / '_src' / 'pages'
SITE_NAME = 'TerraBox Cargo'

# ---------------------------------------------------------------- helpers

def slug(name):
    return 'index' if name == 'Inicio' else name.lower()


def rewrite_links(s):
    return re.sub(r'\b([A-Z0-9][\w-]*)\.dc\.html', lambda m: slug(m.group(1)) + '.html', s)


def esc(v):
    return html.escape('' if v is None else str(v), quote=True)


def wa(text):
    # The number is filled in at runtime from assets/js/config.js (see site.js).
    from urllib.parse import quote
    return 'https://wa.me/?text=' + quote(text or '', safe='')


ATTR_RE = re.compile(r'([\w:.-]+)(?:\s*=\s*"([^"]*)")?')


def parse_attrs(s):
    return [(m.group(1), m.group(2)) for m in ATTR_RE.finditer(s or '')]


def camel(k):
    return re.sub(r'-(\w)', lambda m: m.group(1).upper(), k)


class Missing(Exception):
    pass


def lookup(expr, ctx):
    expr = expr.strip()
    if expr == 'true':
        return True
    if expr == 'false':
        return False
    if re.fullmatch(r'-?\d+(\.\d+)?', expr):
        return float(expr) if '.' in expr else int(expr)
    cur = ctx
    for part in expr.split('.'):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            raise Missing(expr)
    return cur


EXPR_RE = re.compile(r'\{\{\s*(.*?)\s*\}\}')


def eval_attr_value(raw, ctx, where):
    """Returns (keep, value). A lone {{ x }} that is None/False drops the attribute."""
    m = EXPR_RE.fullmatch(raw.strip())
    if m:
        v = lookup(m.group(1), ctx)
        if v is None or v is False:
            return False, None
        if v is True:
            return True, 'true'
        return True, v
    return True, EXPR_RE.sub(lambda mm: str(lookup(mm.group(1), ctx)), raw)


def prop_value(raw, ctx):
    if raw is None:
        return True
    m = EXPR_RE.fullmatch(raw.strip())
    if m:
        return lookup(m.group(1), ctx)
    return html.unescape(raw)


# ---------------------------------------------------------------- template engine

OPEN_RE = re.compile(r'<sc-(for|if)\b([^>]*)>')


def find_close(tpl, tag, start):
    depth = 1
    pat = re.compile(r'<(/?)sc-' + tag + r'\b[^>]*>')
    for m in pat.finditer(tpl, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return m.start(), m.end()
    raise ValueError('unclosed sc-' + tag)


def render(tpl, ctx, page):
    out, pos = [], 0
    while True:
        m = OPEN_RE.search(tpl, pos)
        if not m:
            break
        out.append(subst(tpl[pos:m.start()], ctx, page))
        kind = m.group(1)
        attrs = dict(parse_attrs(m.group(2)))
        cstart, cend = find_close(tpl, kind, m.end())
        inner = tpl[m.end():cstart]
        if kind == 'for':
            items = prop_value(attrs['list'], ctx) or []
            for it in items:
                out.append(render(inner, {**ctx, attrs['as']: it}, page))
        else:
            if prop_value(attrs['value'], ctx):
                out.append(render(inner, ctx, page))
        pos = cend
    out.append(subst(tpl[pos:], ctx, page))
    return ''.join(out)


TAG_RE = re.compile(r'<([a-zA-Z][\w-]*)(\s[^<>]*?)?(/?)>')
COMP_RE = re.compile(r'<(dc-import|x-import)\b([^>]*)>(.*?)</\1>', re.S)


def subst(chunk, ctx, page):
    chunk = COMP_RE.sub(lambda m: component(m.group(1), m.group(2), m.group(3), ctx, page), chunk)

    def tag(m):
        name, attrs, selfclose = m.group(1), m.group(2) or '', m.group(3)
        if '{{' not in attrs and 'hint-' not in attrs:
            return m.group(0)
        parts = []
        for k, v in parse_attrs(attrs):
            if k.startswith('hint-'):
                continue
            if v is None:
                parts.append(k)
                continue
            if '{{' in v:
                if k.lower().startswith('on'):
                    raise ValueError(f'{page}: unhandled event attribute {k}="{v}" on <{name}>')
                keep, val = eval_attr_value(v, ctx, page)
                if not keep:
                    continue
                parts.append(f'{k}="{esc(val)}"')
            else:
                parts.append(f'{k}="{v}"')
        return '<' + name + (' ' + ' '.join(parts) if parts else '') + selfclose + '>'

    chunk = TAG_RE.sub(tag, chunk)
    return EXPR_RE.sub(lambda m: esc(lookup(m.group(1), ctx)), chunk)


# ---------------------------------------------------------------- components

def component(kind, attrs_s, children, ctx, page):
    attrs = parse_attrs(attrs_s)
    props = {}
    for k, v in attrs:
        if k.startswith('hint-') or k == 'component-from-global-scope' or k == 'name':
            continue
        props[camel(k) if kind == 'dc-import' else k] = prop_value(v, ctx)
    if kind == 'dc-import':
        name = dict(attrs)['name']
        fn = {'Site-Header': site_header, 'Site-Footer': site_footer, 'Faq': faq,
              'Legal-Page': legal_page, 'Lead-Form': lead_form, 'Include': include}[name]
        return fn(props, ctx, page)
    comp = dict(attrs)['component-from-global-scope'].split('.')[-1]
    children = subst(children, ctx, page)
    return {'Input': ds_input, 'Select': ds_select, 'Button': ds_button}[comp](props, children)


PASSTHRU = ('id', 'name', 'type', 'placeholder', 'inputmode', 'autocomplete', 'min', 'step', 'value',
            'aria-label', 'aria-invalid', 'aria-describedby', 'aria-required', 'required', 'pattern')


def input_attrs(p):
    out = []
    for k in PASSTHRU:
        v = p.get(k)
        if v is None or v is False or v == '':
            continue
        out.append(f'{k}="{esc(v)}"')
    for k, v in p.items():
        if k.startswith('data-'):
            out.append(f'{k}="{esc(v)}"')
    return ' '.join(out)


def ds_input(p, _children):
    size = p.get('size') or 'md'
    err, hint = p.get('error') or '', p.get('hint') or ''
    style = f' style="{esc(p["style"])}"' if p.get('style') else ''
    h = [f'<label class="tb-field"{style}>']
    if p.get('label'):
        h.append(f'<span class="tb-label">{esc(p["label"])}</span>')
    h.append(f'<span class="tb-input tb-input--{size}{" is-error" if err else ""}">')
    if p.get('prefix'):
        h.append(f'<span class="tb-affix">{esc(p["prefix"])}</span>')
    h.append(f'<input {input_attrs(p)}>')
    if p.get('suffix'):
        h.append(f'<span class="tb-affix tb-affix--suffix">{esc(p["suffix"])}</span>')
    h.append('</span>')
    if err or hint or p.get('data-hint-slot'):
        h.append(f'<span class="tb-hint{" is-error" if err else ""}" data-hint="{esc(hint)}">{esc(err or hint)}</span>')
    h.append('</label>')
    return ''.join(h)


CHEVRON = ('<svg class="tb-select-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">'
           '<path d="M2 4l4 4 4-4" fill="none" stroke="var(--fg-2)" stroke-width="1.6" '
           'stroke-linecap="round" stroke-linejoin="round"></path></svg>')


def ds_select(p, _children):
    opts = p.get('options') or []
    value = p.get('value') or ''
    h = ['<label class="tb-field">']
    if p.get('label'):
        h.append(f'<span class="tb-label">{esc(p["label"])}</span>')
    attrs = ' '.join(f'{k}="{esc(p[k])}"' for k in ('id', 'name', 'autocomplete', 'aria-label') if p.get(k))
    h.append(f'<span class="tb-select"><select {attrs}>')
    if p.get('placeholder'):
        h.append(f'<option value="">{esc(p["placeholder"])}</option>')
    for o in opts:
        sel = ' selected' if o == value else ''
        h.append(f'<option value="{esc(o)}"{sel}>{esc(o)}</option>')
    h.append('</select>' + CHEVRON + '</span></label>')
    return ''.join(h)


def ds_button(p, children):
    cls = f'tb-btn tb-btn--{p.get("variant") or "primary"} tb-btn--{p.get("size") or "md"}'
    if p.get('full-width'):
        cls += ' tb-btn--full'
    attrs = [f'type="{esc(p.get("type") or "button")}"', f'class="{cls}"']
    for k in ('id', 'style', 'aria-label'):
        if p.get(k):
            attrs.append(f'{k}="{esc(p[k])}"')
    if p.get('disabled') is True:
        attrs.append('disabled')
    return f'<button {" ".join(attrs)}>{children}</button>'


# ---------------------------------------------------------------- shared site chrome

# (id, label, link). Ingresar / Registrarse live in the header actions; their URLs come from TB.urls in config.js.
NAV = [
    ('inicio', 'Inicio', 'Inicio.dc.html'),
    ('como', '¿Cómo funciona?', 'Casillero-Virtual.dc.html'),
    ('tarifas', 'Tarifas', 'Tarifas.dc.html'),
    ('calculadora', 'Calculadora', 'Tarifas.dc.html#calculadora'),
    ('prohibidos', 'Artículos prohibidos', 'Productos-Restringidos.dc.html'),
    ('contacto', 'Contacto', 'Contacto.dc.html'),
]
NAV_MORE = [('Rastrear envío', 'Rastreo'), ('Preguntas frecuentes', 'Ayuda'), ('Consolidación', 'Consolidacion'),
            ('Compramos por ti', 'Compramos-Por-Ti'), ('Negocios y revendedores', 'Negocios'), ('Carga aérea y marítima', 'Carga')]

ARROW = '<i data-icon="arrow-right" class="btn__arrow"></i>'
WA_ICON = '<i data-icon="message-circle"></i>'


def site_header(p, ctx, page):
    active = p.get('active') or ''
    wa_href = wa('Hola, vengo de la página ' + (p.get('waPage') or 'de inicio'))
    sticky = bool(p.get('stickyCta'))
    sticky_href = p.get('stickyHref') or 'Registro.dc.html'
    sticky_label = p.get('stickyLabel') or 'Regístrate gratis'

    desk = ''.join(
        f'<a class="hdr__link{" is-current" if gid == active else ""}" href="{href}"'
        f'{" aria-current=\"page\"" if gid == active else ""}>{esc(label)}</a>' for gid, label, href in NAV)
    mob = ''.join(f'<a class="mnav__link" href="{href}">{esc(label)}</a>' for gid, label, href in NAV)
    more = ''.join(f'<a class="mnav__sublink" href="{h}.dc.html">{esc(t)}</a>' for t, h in NAV_MORE)
    sticky_bar = '' if not sticky else (
        f'<div id="sticky-bar" class="sticky-bar" hidden><a class="btn btn--primary" href="{esc(sticky_href)}"'
        f'{" data-tb-url=\"register\"" if sticky_href == "Registro.dc.html" else ""}>{esc(sticky_label)}</a>'
        f'<a class="btn btn--outline" href="{wa_href}" target="_blank" rel="noopener">WhatsApp</a></div>')
    return HEADER_TPL.format(desk=desk, mob=mob, more=more, wa=wa_href, sticky_bar=sticky_bar, arrow=ARROW, wa_icon=WA_ICON)


HEADER_TPL = '''<a href="#main" class="skip-link">Saltar al contenido</a>
<header id="site-header" class="hdr">
  <div class="hdr__bar">
    <a class="hdr__logo" href="Inicio.dc.html" aria-label="TerraBox Cargo, inicio"><img src="assets/img/logo-horizontal.svg" alt="TerraBox Cargo" width="178" height="30"></a>
    <nav class="hdr__nav" aria-label="Principal">{desk}</nav>
    <div class="hdr__actions">
      <a class="btn btn--outline btn--sm" href="Ingresar.dc.html" data-tb-url="login">Ingresar</a>
      <a class="btn btn--primary btn--sm" href="Registro.dc.html" data-tb-url="register">Registrarse {arrow}</a>
    </div>
    <button type="button" id="menu-btn" class="hdr__menu" aria-expanded="false" aria-controls="menu-movil"><i data-icon="menu"></i>Menú</button>
  </div>
</header>
<div id="menu-movil" class="mnav" role="dialog" aria-modal="true" aria-label="Menú" hidden>
  <div class="mnav__top">
    <img src="assets/img/logo-horizontal.svg" alt="TerraBox Cargo" width="166" height="28">
    <button type="button" id="menu-close" class="mnav__close" aria-label="Cerrar menú"><i data-icon="x"></i></button>
  </div>
  <nav class="mnav__list" aria-label="Principal">{mob}
    <div class="mnav__group">
      <button type="button" class="m-group-btn mnav__link" aria-expanded="false" aria-controls="m-mas">Más servicios y ayuda<span aria-hidden="true" class="m-sign">+</span></button>
      <div id="m-mas" class="mnav__sub" hidden>{more}</div>
    </div>
  </nav>
  <div class="mnav__actions">
    <a class="btn btn--outline" href="Ingresar.dc.html" data-tb-url="login">Ingresar</a>
    <a class="btn btn--primary" href="Registro.dc.html" data-tb-url="register">Registrarse</a>
    <a class="btn btn--whatsapp mnav__wa" href="{wa}" target="_blank" rel="noopener">{wa_icon}Escribir por WhatsApp</a>
  </div>
</div>
<a href="{wa}" target="_blank" rel="noopener" id="float-wa" class="float-wa" aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)">{wa_icon}<span>WhatsApp</span></a>
{sticky_bar}'''

FOOTER_COLS = [
    ('Navegación', [('Inicio', 'Inicio'), ('¿Cómo funciona?', 'Casillero-Virtual'), ('Tarifas', 'Tarifas'),
                    ('Calculadora', 'Tarifas.dc.html#calculadora'), ('Artículos prohibidos', 'Productos-Restringidos'), ('Contacto', 'Contacto')]),
    ('Servicios', [('Consolidación', 'Consolidacion'), ('Compramos por ti', 'Compramos-Por-Ti'), ('Carga aérea y marítima', 'Carga'),
                   ('Negocios', 'Negocios'), ('Revendedores', 'Revendedores'), ('Empresas', 'Empresas')]),
    ('Ayuda', [('Rastrear envío', 'Rastreo'), ('Preguntas frecuentes', 'Ayuda'), ('Aduana e impuestos', 'Aduana-Impuestos'),
               ('Reclamos y seguro', 'Reclamos-Seguro'), ('Tiendas recomendadas', 'Tiendas'), ('Nosotros', 'Nosotros')]),
]


def site_footer(p, ctx, page):
    wa_href = wa('Hola, vengo de la página ' + (p.get('waPage') or 'de inicio'))
    cols = ''.join(
        f'<nav class="ftr__col" aria-label="{esc(t)}"><h2 class="ftr__title">{esc(t)}</h2>'
        + ''.join(f'<a href="{h if ".dc.html" in h else h + ".dc.html"}">{esc(l)}</a>' for l, h in links)
        + '</nav>' for t, links in FOOTER_COLS)
    return FOOTER_TPL.format(cols=cols, wa=wa_href, wa_icon=WA_ICON)


FOOTER_TPL = '''<footer class="ftr">
  <div class="ftr__inner">
    <div class="ftr__grid">
      <div class="ftr__brand">
        <img src="assets/img/logo-horizontal-reversed.svg" alt="TerraBox Cargo" width="190" height="32">
        <p>Compra en Estados Unidos y recíbelo en Colombia en 5 a 7 días hábiles, con seguro incluido.</p>
        <div class="ftr__social">
          <a href="#" data-social="instagram" hidden aria-label="Instagram de TerraBox (se abre en una pestaña nueva)" target="_blank" rel="noopener"><i data-icon="instagram"></i></a>
          <a href="#" data-social="facebook" hidden aria-label="Facebook de TerraBox (se abre en una pestaña nueva)" target="_blank" rel="noopener"><i data-icon="facebook"></i></a>
        </div>
      </div>
      {cols}
      <div class="ftr__col">
        <h2 class="ftr__title">Contacto</h2>
        <a href="{wa}" target="_blank" rel="noopener" class="ftr__wa">{wa_icon}WhatsApp</a>
        <p><span class="ftr__label">Email</span><a data-tb="email" href="Contacto.dc.html">[email]</a></p>
        <p><span class="ftr__label">Horario</span><span data-tb="hours">[horario de atención]</span></p>
      </div>
    </div>
    <div class="ftr__bottom">
      <div class="ftr__legal">
        <a href="Legal-Terminos.dc.html">Términos y condiciones</a>
        <a href="Legal-Datos.dc.html">Tratamiento de datos</a>
        <a href="Legal-Cookies.dc.html">Cookies</a>
        <button type="button" id="cookie-reopen">Preferencias de cookies</button>
      </div>
      <span>© <span id="year">2026</span> TerraBox Cargo</span>
    </div>
  </div>
</footer>
<div id="cookie-banner" class="cookie" role="region" aria-label="Aviso de cookies" hidden>
  <p>Usamos cookies necesarias para que el sitio funcione. Con tu permiso, usamos también cookies de medición. <a href="Legal-Cookies.dc.html">Ver política de cookies</a></p>
  <div id="cookie-cfg" class="cookie__cfg" hidden>
    <label><input type="checkbox" checked disabled>Necesarias (siempre activas)</label>
    <label><input type="checkbox" id="cookie-analytics">Medición y análisis</label>
  </div>
  <div class="cookie__actions">
    <button type="button" class="tb-btn tb-btn--outline tb-btn--md tb-btn--full" data-cookie="reject">Rechazar</button>
    <button type="button" class="tb-btn tb-btn--outline tb-btn--md tb-btn--full" data-cookie="configure">Configurar</button>
    <button type="button" class="tb-btn tb-btn--outline tb-btn--md tb-btn--full" data-cookie="accept">Aceptar</button>
  </div>
</div>'''


def faq(p, ctx, page):
    items = p.get('items') or []
    rows = []
    for i in items:
        link = (f'<a href="{esc(i["href"])}" style="font:600 14px/1.4 var(--font-sans);align-self:flex-start;min-height:32px;display:flex;'
                f'align-items:center">{esc(i.get("linkLabel") or "Ver más")}</a>') if i.get('href') else ''
        rows.append(
            f'<div id="{esc(i["id"])}" class="faq-item" data-search="{esc(i["q"] + " " + i["a"])}" style="border-bottom:1px solid var(--border-default)">'
            f'<h3 style="margin:0"><button type="button" class="faq-btn" id="q-{esc(i["id"])}" aria-expanded="false" aria-controls="a-{esc(i["id"])}" '
            f'style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);min-height:60px;'
            f'padding:var(--space-4) 0;border:0;background:transparent;text-align:left;cursor:pointer;font:600 17px/1.35 var(--font-sans);'
            f'color:var(--navy-800)" style-hover="color:var(--tb-navy)"><span>{esc(i["q"])}</span><span aria-hidden="true" class="faq-sign" '
            f'style="flex-shrink:0;width:28px;height:28px;border-radius:var(--radius-md);background:var(--navy-50);display:flex;'
            f'align-items:center;justify-content:center;font:500 18px/1 var(--font-sans);color:var(--tb-navy)">+</span></button></h3>'
            f'<div id="a-{esc(i["id"])}" role="region" aria-labelledby="q-{esc(i["id"])}" hidden style="padding:0 var(--space-10) '
            f'var(--space-5) 0;flex-direction:column;gap:var(--space-2)"><p style="margin:0;font:400 15px/1.6 var(--font-sans);'
            f'color:var(--fg-2);max-width:68ch;text-wrap:pretty">{esc(i["a"])}</p>{link}</div></div>')
    single = ' data-single' if p.get('single') else ''
    return (f'<div class="faq"{single} style="display:flex;flex-direction:column;border-top:1px solid var(--border-default)">'
            + ''.join(rows) + '</div>')


def legal_page(p, ctx, page):
    src = (SRC / 'Legal-Page.dc.html').read_text(encoding='utf-8')
    tpl = src[src.index('</helmet>') + len('</helmet>'):src.index('</x-dc>')]
    tpl = tpl.replace('onClick="{{ print }}"', 'onclick="window.print()"')
    return render(tpl, {'title': p.get('title'), 'summary': p.get('summary') or []}, page)


def include(p, ctx, page):
    """<dc-import name="Include" file="x"> renders _src/partials/x.html with the page data."""
    tpl = (ROOT / '_src' / 'partials' / (p['file'] + '.html')).read_text(encoding='utf-8')
    tpl = re.sub(r'^<!--.*?-->\n', '', tpl, flags=re.S)
    return render(tpl, {**ctx, **p}, page)


def lead_form(p, ctx, page):
    cfg = {k: v for k, v in p.items() if k not in ('onChange', 'onSuccess')}
    return f'<div class="lead-form" data-config="{esc(json.dumps(cfg, ensure_ascii=False))}"></div>'


# ---------------------------------------------------------------- page assembly

HOVER = {}


def hover_classes(s):
    def rep(m):
        kind, decl = m.group(1), html.unescape(m.group(2))
        key = (kind, decl)
        if key not in HOVER:
            HOVER[key] = ('h' if kind == 'hover' else 'f') + hashlib.md5(decl.encode()).hexdigest()[:6]
        return f'data-x="{HOVER[key]}"'
    s = re.sub(r'style-(hover|focus)="([^"]*)"', rep, s)

    # merge data-x into class attribute
    def merge(m):
        tag = m.group(0)
        xs = re.findall(r' data-x="([^"]+)"', tag)
        if not xs:
            return tag
        tag = re.sub(r' data-x="[^"]+"', '', tag)
        if ' class="' in tag:
            return tag.replace(' class="', ' class="' + ' '.join(xs) + ' ', 1)
        return re.sub(r'^<([\w-]+)', lambda mm: f'<{mm.group(1)} class="{" ".join(xs)}"', tag)
    return re.sub(r'<[a-zA-Z][^<>]*data-x="[^<>]*>', merge, s)


def write_hover_css():
    lines = ['/* Generated by _src/build.py from style-hover / style-focus attributes. Do not edit. */']
    for (kind, decl), cls in sorted(HOVER.items(), key=lambda x: x[1]):
        rules = ';'.join(d.strip() + '!important' for d in decl.split(';') if d.strip())
        sel = f'.{cls}:hover' if kind == 'hover' else f'.{cls}:focus'
        lines.append(f'{sel}{{{rules}}}')
    (ROOT / 'assets' / 'css' / 'interactions.css').write_text('\n'.join(lines) + '\n', encoding='utf-8')


PAGE_TPL = '''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_CO">
<meta property="og:site_name" content="{site}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="theme-color" content="#15369c">
<script>document.documentElement.classList.add('js')</script>
<link rel="icon" type="image/svg+xml" href="assets/img/logo-symbol.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap">
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/site.css">
<link rel="stylesheet" href="assets/css/interactions.css">
<link rel="stylesheet" href="assets/css/redesign.css">
{head_extra}</head>
<body>
{body}
<script src="assets/js/config.js"></script>
<script src="assets/js/calculator.js"></script>
<script src="assets/js/site.js"></script>
{scripts}</body>
</html>
'''


def build_page(path):
    name = path.name[:-len('.dc.html')]
    src = path.read_text(encoding='utf-8')
    helmet = src[src.index('<helmet>'):src.index('</helmet>')]
    title = re.search(r'<title>(.*?)</title>', helmet).group(1)
    desc_m = re.search(r'<meta name="description" content="([^"]*)"', helmet)
    styles = ''.join(m.group(0) + '\n' for m in re.finditer(r'<style>.*?</style>', helmet, re.S))
    body_tpl = src[src.index('</helmet>') + len('</helmet>'):src.index('</x-dc>')]
    tail = src[src.index('</x-dc>') + len('</x-dc>'):]
    data_m = re.search(r'<script type="application/json" data-page>(.*?)</script>', tail, re.S)
    ctx = json.loads(data_m.group(1)) if data_m else {}
    ctx = expand_wa(ctx)
    if re.search(r'data-dc-script', tail):
        raise ValueError(f'{name}: still has the prototype script; convert it to a data-page JSON block')
    tail = re.sub(r'<script type="application/json" data-page>.*?</script>', '', tail, flags=re.S)
    scripts = ''.join(m.group(0) + '\n' for m in re.finditer(r'<script\b[^>]*>.*?</script>', tail, re.S))
    head_extra = styles + ''.join(m.group(0) + '\n' for m in re.finditer(r'<script type="application/ld\+json">.*?</script>', helmet, re.S))
    if ctx.get('faqLd'):
        head_extra += '<script type="application/ld+json">' + json.dumps(faq_ld(ctx['faqLd']), ensure_ascii=False) + '</script>\n'

    body = render(body_tpl, ctx, name).strip()
    out = PAGE_TPL.format(title=esc(html.unescape(title)), desc=esc(html.unescape(desc_m.group(1))) if desc_m else '',
                          site=SITE_NAME, head_extra=head_extra, body=body, scripts=scripts)
    out = inline_icons(hover_classes(rewrite_links(out)))
    leftover = re.findall(r'\{\{.*?\}\}|<sc-|<dc-import|<x-import|style-hover', out)
    if leftover:
        raise ValueError(f'{name}: unrendered template code: {leftover[:5]}')
    (ROOT / (slug(name) + '.html')).write_text(out, encoding='utf-8')
    return slug(name) + '.html'


ICON_RE = re.compile(r'<i data-icon="([\w-]+)"(?: class="([^"]*)")?></i>')


def inline_icons(s):
    """<i data-icon="plane" class="x"></i> becomes the inline Lucide SVG."""
    def rep(m):
        name, cls = m.group(1), m.group(2)
        if name not in ICONS:
            raise ValueError('unknown icon: ' + name)
        return (f'<svg class="icon{" " + cls if cls else ""}" width="24" height="24" viewBox="0 0 24 24" fill="none" '
                f'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" '
                f'focusable="false">{ICONS[name]}</svg>')
    return ICON_RE.sub(rep, s)


def expand_wa(v):
    """{"$wa": "text"} in page data becomes a WhatsApp link; {"$data": "name"} loads _src/data/name.json."""
    if isinstance(v, dict):
        if set(v) == {'$wa'}:
            return wa(v['$wa'])
        if set(v) == {'$data'}:
            return expand_wa(json.loads((ROOT / '_src' / 'data' / (v['$data'] + '.json')).read_text(encoding='utf-8')))
        return {k: expand_wa(x) for k, x in v.items()}
    if isinstance(v, list):
        return [expand_wa(x) for x in v]
    return v


def faq_ld(groups):
    items = [i for g in groups for i in g['items']]
    return {'@context': 'https://schema.org', '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': i['q'], 'acceptedAnswer': {'@type': 'Answer', 'text': i['a']}} for i in items]}


def main():
    built = []
    for path in sorted(SRC.glob('*.dc.html')):
        if path.name == 'Legal-Page.dc.html':
            continue
        built.append(build_page(path))
    write_hover_css()
    print(f'Built {len(built)} pages, {len(HOVER)} interaction styles.')


if __name__ == '__main__':
    main()
