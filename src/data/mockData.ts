import type { Category, Company } from '../types'

export const CATEGORIES: Category[] = [
  {
    slug: 'termofusion',
    name: 'Termofusión',
    description: 'Unión de tuberías PEAD y polipropileno mediante calor. Para proyectos de agua potable, riego y minería.',
    companyCount: 18,
    icon: 'pipe',
  },
  {
    slug: 'geomembranas',
    name: 'Geomembranas',
    description: 'Instalación de liners y geomembranas HDPE para impermeabilización de tranques, piscinas y rellenos.',
    companyCount: 12,
    icon: 'layers',
  },
  {
    slug: 'tuberias-industriales',
    name: 'Tuberías Industriales',
    description: 'Montaje, mantención e instalación de sistemas de tuberías para procesos industriales y mineros.',
    companyCount: 24,
    icon: 'network',
  },
  {
    slug: 'servicios-hidraulicos',
    name: 'Servicios Hidráulicos',
    description: 'Diseño y ejecución de sistemas hidráulicos, bombas, válvulas y control de fluidos.',
    companyCount: 15,
    icon: 'droplet',
  },
  {
    slug: 'montaje-industrial',
    name: 'Montaje Industrial',
    description: 'Montaje estructural, mecánico y electromecánico para plantas industriales y proyectos mineros.',
    companyCount: 20,
    icon: 'wrench',
  },
  {
    slug: 'obras-civiles',
    name: 'Obras Civiles',
    description: 'Excavaciones, movimiento de tierras, fundaciones y obras de hormigón para proyectos industriales.',
    companyCount: 9,
    icon: 'building',
  },
]

export const COMPANIES: Company[] = [
  {
    id: 'sup-1',
    slug: 'proveedora-aceros-pacifico',
    name: 'Proveedora Aceros del Pacífico',
    tagline: 'Especialistas en termofusión y tuberías PEAD desde 1998',
    description:
      'Empresa con más de 25 años de experiencia en instalación y mantención de sistemas de tuberías PEAD mediante termofusión. Trabajamos con proyectos de agua potable, riego tecnificado y minería en todo el norte de Chile.',
    location: 'Antofagasta',
    region: 'Antofagasta',
    categories: ['termofusion', 'tuberias-industriales'],
    services: [
      'Termofusión de tuberías PEAD',
      'Instalación de tuberías a presión',
      'Reparación de redes de agua potable',
      'Proyectos mineros de transporte de pulpa',
    ],
    phone: '+56 55 234 5678',
    email: 'contacto@acerospacifico.cl',
    yearsActive: 25,
    featured: true,
  },
  {
    id: 'sup-2',
    slug: 'tuberias-del-sur',
    name: 'Tuberías del Sur S.A.',
    tagline: 'Geomembranas e impermeabilización para proyectos de gran escala',
    description:
      'Líderes en instalación de geomembranas HDPE en la zona sur de Chile. Ejecutamos impermeabilización de tranques de relave, piscinas de proceso, rellenos sanitarios y proyectos de acuicultura.',
    location: 'Puerto Montt',
    region: 'Los Lagos',
    categories: ['geomembranas', 'obras-civiles'],
    services: [
      'Instalación de geomembranas HDPE',
      'Impermeabilización de tranques',
      'Liners para piscinas industriales',
      'Rellenos sanitarios',
      'Proyectos de acuicultura',
    ],
    phone: '+56 65 221 8900',
    email: 'proyectos@tuberiasdelsur.cl',
    yearsActive: 18,
    featured: true,
  },
  {
    id: 'sup-3',
    slug: 'electro-industrial-spa',
    name: 'Electro Industrial SpA',
    tagline: 'Montaje electromecánico e industrial para minería y energía',
    description:
      'Empresa especializada en montaje industrial, instalaciones electromecánicas y servicios de mantención para la industria minera y energética. Operamos en las regiones de Atacama y Coquimbo.',
    location: 'Copiapó',
    region: 'Atacama',
    categories: ['montaje-industrial', 'servicios-hidraulicos'],
    services: [
      'Montaje electromecánico',
      'Instalación de bombas y válvulas',
      'Sistemas hidráulicos industriales',
      'Mantención de plantas',
      'Servicios de turnaround',
    ],
    phone: '+56 52 261 3344',
    email: 'info@electroindustrial.cl',
    yearsActive: 12,
    featured: true,
  },
  {
    id: 'sup-4',
    slug: 'hormigonsur',
    name: 'HormigonSur Ltda.',
    tagline: 'Obras civiles y fundaciones para proyectos industriales del sur',
    description:
      'Contratista de obras civiles con foco en fundaciones, pavimentos industriales y hormigón para proyectos de infraestructura. Trabajamos con constructoras, salmoneras y mineras en la zona sur.',
    location: 'Temuco',
    region: 'La Araucanía',
    categories: ['obras-civiles', 'montaje-industrial'],
    services: [
      'Fundaciones industriales',
      'Pavimentos de hormigón',
      'Movimiento de tierras',
      'Estructuras de hormigón',
    ],
    phone: '+56 45 244 7711',
    email: 'obras@hormigonsur.cl',
    yearsActive: 9,
    featured: false,
  },
  {
    id: 'sup-5',
    slug: 'hidro-norte',
    name: 'Hidro Norte Ingeniería',
    tagline: 'Soluciones hidráulicas y de tuberías para el norte minero',
    description:
      'Empresa de ingeniería especializada en sistemas hidráulicos para la minería del norte grande. Diseño, suministro e instalación de sistemas de bombeo, tuberías y control de fluidos.',
    location: 'Calama',
    region: 'Antofagasta',
    categories: ['servicios-hidraulicos', 'tuberias-industriales'],
    services: [
      'Diseño de sistemas de bombeo',
      'Instalación de cañerías industriales',
      'Control de válvulas y actuadores',
      'Estudios de golpe de ariete',
    ],
    phone: '+56 55 278 9900',
    email: 'contacto@hidronorte.cl',
    yearsActive: 14,
    featured: false,
  },
  {
    id: 'sup-6',
    slug: 'geomembranas-atacama',
    name: 'Geomembranas Atacama',
    tagline: 'Instalación de geomembranas y soluciones de contención minera',
    description:
      'Especialistas en instalación de geomembranas para la industria minera en la Región de Atacama y Antofagasta. Proyectos de impermeabilización de pilas de lixiviación, tranques y botaderos.',
    location: 'Antofagasta',
    region: 'Antofagasta',
    categories: ['geomembranas'],
    services: [
      'Geomembranas HDPE para pilas de lixiviación',
      'Impermeabilización de tranques de relave',
      'Liners para botaderos',
      'Reparación y mantención de geomembranas',
    ],
    phone: '+56 55 291 4433',
    email: 'ventas@geomembranasatacama.cl',
    yearsActive: 16,
    featured: false,
  },
  {
    id: 'sup-7',
    slug: 'fusiones-pacifico',
    name: 'Fusiones Pacífico',
    tagline: 'Termofusión certificada para agua potable y riego',
    description:
      'Empresa certificada en termofusión de tuberías PEAD y PP-R para proyectos de agua potable rural, riego tecnificado y redes urbanas. Operamos en la Región del Maule y O\'Higgins.',
    location: 'Talca',
    region: 'Maule',
    categories: ['termofusion'],
    services: [
      'Termofusión PEAD a tope y electrofusión',
      'Redes de agua potable rural',
      'Sistemas de riego tecnificado',
      'Instalación en zanjas y microtunel',
    ],
    phone: '+56 71 224 6622',
    email: 'info@fusionespacifico.cl',
    yearsActive: 11,
    featured: false,
  },
  {
    id: 'sup-8',
    slug: 'montajes-valparaiso',
    name: 'Montajes Valparaíso S.A.',
    tagline: 'Montaje industrial y mantenimiento en la zona central',
    description:
      'Empresa de montaje industrial con base en Valparaíso. Especialistas en instalaciones mecánicas, estructuras metálicas y servicios de mantención para la industria portuaria, química y energética.',
    location: 'Valparaíso',
    region: 'Valparaíso',
    categories: ['montaje-industrial', 'tuberias-industriales'],
    services: [
      'Montaje de estructuras metálicas',
      'Instalación de cañerías industriales',
      'Mantención de plantas industriales',
      'Servicios portuarios',
    ],
    phone: '+56 32 255 1199',
    email: 'licitaciones@montajesvalparaiso.cl',
    yearsActive: 22,
    featured: true,
  },
]

export const REGIONS = [
  'Todas las regiones',
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  "O'Higgins",
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
]

export const getCategoryBySlug = (slug: string): Category | undefined =>
  CATEGORIES.find(c => c.slug === slug)

export const getCompaniesByCategory = (slug: string): Company[] =>
  COMPANIES.filter(c => c.categories.includes(slug))

export const getCompanyBySlug = (slug: string): Company | undefined =>
  COMPANIES.find(c => c.slug === slug)
