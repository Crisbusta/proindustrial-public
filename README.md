# ProIndustrial — Directorio de Servicios Industriales

Plataforma web para encontrar y contactar empresas especializadas en servicios industriales en Chile: termofusión, geomembranas, tuberías, hidráulica, montaje y obras civiles.

## Stack

- **React 18** + **Vite 5** + **TypeScript**
- **React Router v6** — SPA con rutas client-side
- CSS custom properties — sin framework UI externo
- SVG icons inline — sin dependencias de íconos

## Páginas públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con hero, categorías, cómo funciona y empresas destacadas |
| `/servicios/:slug` | Listado de empresas por categoría con filtro de región |
| `/empresas/:slug` | Perfil completo de empresa con servicios y contacto |
| `/cotizar/:companySlug?` | Formulario de solicitud de cotización |
| `/registrar` | Registro de nuevas empresas proveedoras |

## Panel de gestión (`/panel`)

Panel privado para que las empresas proveedoras administren su presencia en el directorio.

| Ruta | Descripción |
|------|-------------|
| `/panel/login` | Acceso con cuenta de empresa |
| `/panel/dashboard` | Resumen: KPIs, solicitudes recientes, accesos rápidos |
| `/panel/solicitudes` | Bandeja de solicitudes de cotización recibidas |
| `/panel/servicios` | Gestión de servicios publicados (agregar, editar, eliminar) |
| `/panel/perfil` | Configuración del perfil público de la empresa |

## Correr en local

```bash
npm install
npm run dev
# → http://localhost:3001
```

## Deploy

El proyecto está configurado para deploy en **Vercel** y **Railway**.

**Vercel** (recomendado):
```bash
npx vercel
```

**Railway**: conecta el repositorio y Railway detecta automáticamente la configuración en `nixpacks.toml`.

## Cuentas demo (panel)

| Empresa | Email |
|---------|-------|
| Proveedora Aceros del Pacífico | `contacto@acerospacifico.cl` |
| Tuberías del Sur S.A. | `proyectos@tuberiasdelsur.cl` |
| Electro Industrial SpA | `info@electroindustrial.cl` |

Cualquier contraseña funciona en modo demo.

## Estructura

```
src/
├── components/       # Navbar, Footer, Cards, Icons, Breadcrumb
├── pages/
│   ├── LandingPage.tsx
│   ├── CategoryPage.tsx
│   ├── CompanyProfile.tsx
│   ├── QuoteFormPage.tsx
│   ├── RegisterProviderPage.tsx
│   └── panel/        # Panel de gestión de empresas
├── data/mockData.ts  # 6 categorías, 8 empresas, regiones
├── types/index.ts
└── index.css         # Design system completo con CSS variables
```
