export const TEST_ACCOUNTS = {
  primary: {
    email: 'contacto@acerospacifico.cl',
    password: 'demo123',
    companySlug: 'proveedora-aceros-pacifico',
    companyName: 'Proveedora Aceros del Pacífico',
  },
  secondary: {
    email: 'proyectos@tuberiasdelsur.cl',
    password: 'demo123',
    companySlug: 'tuberias-del-sur',
    companyName: 'Tuberías del Sur S.A.',
  },
  // Used for CRUD write tests — starts with 0 services
  writeAccount: {
    email: 'info@electroindustrial.cl',
    password: 'demo123',
    companySlug: 'electro-industrial-spa',
    companyName: 'Electro Industrial SpA',
  },
  noQuotes: {
    email: 'licitaciones@montajesvalparaiso.cl',
    password: 'demo123',
    companySlug: 'montajes-valparaiso',
    companyName: 'Montajes Valparaíso S.A.',
  },
}

export const SEED_COMPANY_SLUGS = [
  'proveedora-aceros-pacifico',
  'tuberias-del-sur',
  'electro-industrial-spa',
  'hormigonsur',
  'hidro-norte',
  'geomembranas-atacama',
  'fusiones-pacifico',
  'montajes-valparaiso',
]

// Category slugs that exist in the backend's static category data
export const CATEGORY_SLUGS = {
  termofusion: 'termofusion',
  geomembranas: 'geomembranas',
  montajeIndustrial: 'montaje-industrial',
}

export const API_BASE_URL = 'http://localhost:8080/api'
