// TerraBox site config — edit this file to go live. Values set to null/'' are business data not yet supplied.
window.TB = window.TB || {
  // WhatsApp business number in international format without "+" (e.g. 13055551234). NOT SUPPLIED.
  waNumber: '',
  // Form/registration/tracking endpoints (URLs that accept JSON POST). NOT SUPPLIED: forms validate,
  // then offer to send the same details by WhatsApp instead.
  endpoints: { registro: null, solicitud: null, contacto: null, compra: null, reclamo: null, rastreo: null, login: null },
  // Rate logic for the calculator. NOT SUPPLIED: calculator shows billable weight only.
  rates: null, // e.g. { 'Bogotá': { perLb: 0, min: 0 }, ... }
  volumetricDivisorIn: null, // in³ per lb, e.g. 166 — to confirm with TerraBox
  cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Santa Marta', 'Cúcuta', 'Ibagué', 'Villavicencio', 'Pasto', 'Montería', 'Neiva', 'Armenia', 'Popayán', 'Valledupar', 'Tunja', 'Otro municipio'],
  wa(text) { return 'https://wa.me/' + (this.waNumber || '') + '?text=' + encodeURIComponent(text || ''); },
  emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim()); },
  phoneOk(v) { const d = (v || '').replace(/[^\d]/g, ''); return d.length >= 10 && d.length <= 13; },
  fmtPhone(v) { const d = (v || '').replace(/[^\d+]/g, ''); if (!d) return ''; const n = d.startsWith('+') ? d : (d.startsWith('57') ? '+' + d : '+57' + d); return n.replace(/^(\+57)(\d{3})(\d{3})(\d+)$/, '$1 $2 $3 $4'); }
};
