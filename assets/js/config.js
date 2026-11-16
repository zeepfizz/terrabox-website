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

  // Public prices (US$) from the owner's onboarding sheet (Tarifas + Cargos, valid 1 Jan to 31 Dec 2026).
  // Used by the calculator and every price on the site (data-price="CO.courier.min" etc.).
  // perLb + min: weight × perLb, never less than min. fixed: one price per shipment (maxLb = heaviest allowed).
  // Negotiated client rates (e.g. AER-COL-CL-1) are not published.
  pricing: {
    minLb: 1,
    roundUp: true,       // 4,2 lb is charged as 5 lb
    volDivisor: 166,     // volumetric weight = L × A × H (in) / 166; the larger of real and volumetric is charged
    taxFreeUpTo: 200,    // Colombia: declared value per box with no import taxes
    lossCoverage: 100,   // Colombia: paid per box in case of loss
    maxSameItems: 6,
    deliveryDays: '5 a 7',
    defaultDest: 'CO',
    destinations: {
      CO: {
        name: 'Colombia', mode: 'Aérea', taxFree: true,
        types: {
          courier:   { label: 'Courier', hint: 'Compras para uso personal.', perLb: 3, min: 30 },          // AER-COL-01
          comercial: { label: 'Comercial', hint: 'Mercancía para vender o para tu negocio.', perLb: 5.5, min: 55 }, // AER-COL-02
          celular:   { label: 'Celular', hint: 'Un celular por envío.', fixed: 80 }                        // AER-COL-03
        }
      },
      MX: {
        name: 'México', mode: 'Terrestre', insurance: 10,  // "Seguro México Base": US$10 on every shipment
        types: {
          base:    { label: 'Paquete', hint: 'Cobramos el peso real o el volumétrico, el que sea mayor.', perLb: 4.5, min: 45 }, // GRD-MEX-01
          celular: { label: 'Celular', hint: 'Un celular por envío.', fixed: 150 }                                              // GRD-MEX-02
        }
      },
      EC: {
        name: 'Ecuador', mode: 'Aérea',
        types: {
          courier: { label: 'Courier', hint: 'Precio por envío hasta 8 libras.', fixed: 70, maxLb: 8 }  // AER-ECU-01
        }
      }
    }
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
  // Countries offered in the sign-up form (Latin America).
  countries: ['Argentina', 'Belice', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Guyana', 'Haití', 'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico', 'República Dominicana', 'Surinam', 'Uruguay', 'Venezuela'],
  wa(text) { return 'https://wa.me/' + (this.waNumber || '') + '?text=' + encodeURIComponent(text || ''); },
  emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim()); },
  phoneOk(v) { const d = (v || '').replace(/[^\d]/g, ''); return d.length >= 10 && d.length <= 13; },
  fmtPhone(v) { const d = (v || '').replace(/[^\d+]/g, ''); if (!d) return ''; const n = d.startsWith('+') ? d : (d.startsWith('57') ? '+' + d : '+57' + d); return n.replace(/^(\+57)(\d{3})(\d{3})(\d+)$/, '$1 $2 $3 $4'); }
};
