// TerraBox site config — the one file to edit for contact data, links and prices.
// Values set to '' / null are business data not yet supplied.
window.TB = window.TB || {
  // WhatsApp business number in international format without "+" (e.g. 13055551234). NOT SUPPLIED.
  waNumber: '',
  // Contact details shown in the footer and contact sections. NOT SUPPLIED.
  email: '',
  hours: '', // e.g. 'Lunes a viernes, 9:00 a. m. a 6:00 p. m. (hora de Colombia)'
  social: { instagram: '', facebook: '' }, // full profile URLs; icons appear once set
  // Ingresar / Registrarse buttons. Later (TerraBox OS, F3): 'https://app.terraboxcargo.com/...'
  urls: { login: 'ingresar.html', register: 'registro.html' },

  // Official Colombia prices (US$). Used by the calculator and the price cards.
  pricing: {
    tiers: [
      { upToLb: 4, price: 25 },  // 1 a 4 libras
      { upToLb: 10, price: 30 }  // 5 a 10 libras
    ],
    extraPerLb: 3,       // each pound above the last tier
    minLb: 1,
    roundUp: true,       // 4,2 lb is charged as 5 lb. Pending confirmation with the owner.
    taxFreeUpTo: 200,    // declared value per box with no import taxes
    lossCoverage: 100,   // paid per box in case of loss
    maxSameItems: 6,
    deliveryDays: '5 a 7'
  },

  // Form, tracking and login endpoints (URLs that accept JSON POST, e.g. a Formspree form URL).
  // NOT SUPPLIED: forms validate, then offer to send the same details by WhatsApp.
  endpoints: { registro: null, solicitud: null, contacto: null, compra: null, reclamo: null, rastreo: null, login: null },

  // What the "Rastrea tu envío" buttons do. Until there is a tracking system, open WhatsApp with the guide number.
  track(guia) {
    if (this.endpoints.rastreo) { location.href = 'rastreo.html?guia=' + encodeURIComponent(guia); return; }
    window.open(this.wa('Hola, quiero rastrear mi envío. Mi número de guía es: ' + guia), '_blank', 'noopener');
  },

  cities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Santa Marta', 'Cúcuta', 'Ibagué', 'Villavicencio', 'Pasto', 'Montería', 'Neiva', 'Armenia', 'Popayán', 'Valledupar', 'Tunja', 'Otro municipio'],
  wa(text) { return 'https://wa.me/' + (this.waNumber || '') + '?text=' + encodeURIComponent(text || ''); },
  emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim()); },
  phoneOk(v) { const d = (v || '').replace(/[^\d]/g, ''); return d.length >= 10 && d.length <= 13; },
  fmtPhone(v) { const d = (v || '').replace(/[^\d+]/g, ''); if (!d) return ''; const n = d.startsWith('+') ? d : (d.startsWith('57') ? '+' + d : '+57' + d); return n.replace(/^(\+57)(\d{3})(\d{3})(\d+)$/, '$1 $2 $3 $4'); }
};
