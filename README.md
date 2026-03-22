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

## Backoffice admin (`/admin`)

Backoffice interno para revisar registros de nuevas empresas proveedoras.

| Ruta | Descripción |
|------|-------------|
| `/admin/login` | Acceso admin seed |
| `/admin/registros` | Revisión y aprobación/rechazo de registros |

## Correr en local

```bash
npm install
npm run dev
# → http://localhost:3001
```

API local esperada por defecto: `http://localhost:8080`.

Si necesitas apuntar a otra API, define `VITE_API_URL` antes de iniciar Vite.

## Deploy

El proyecto está configurado para deploy en **Vercel** y **Railway**.

**Vercel** (recomendado):
```bash
npx vercel
```

Producción web:

- El frontend mantiene llamadas relativas a `/api`.
- `vercel.json` hace rewrite de `/api/*` hacia `https://proindustrial-backend-production.up.railway.app/api/*`.
- No hace falta definir `VITE_API_URL` en Vercel mientras uses este rewrite.

**Railway**: conecta el repositorio y Railway detecta automáticamente la configuración en `nixpacks.toml`.

Para que funcione online, el backend en Railway debe tener:

- `CORS_ORIGIN=https://TU-FRONTEND.vercel.app`
- `APP_BASE_URL=https://TU-FRONTEND.vercel.app`

## Cuentas demo (panel)

| Empresa | Email |
|---------|-------|
| Proveedora Aceros del Pacífico | `contacto@acerospacifico.cl` |
| Tuberías del Sur S.A. | `proyectos@tuberiasdelsur.cl` |
| Electro Industrial SpA | `info@electroindustrial.cl` |

La contraseña de las cuentas demo es `demo123`.

## Credenciales admin

- Email: `admin@proindustrial.local`
- Contraseña: `demo123`

## Aprobación y acceso inicial

- Al aprobar un registro desde `/admin/registros`, se crea la empresa y el usuario proveedor.
- La contraseña inicial del proveedor es `demo123`.
- En el primer login, el proveedor debe cambiar la contraseña antes de entrar al panel.
- Si el backend tiene SMTP configurado, se envía un correo automático con el acceso inicial.

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

## Nota de repositorio

Dentro del monorepo, el flujo principal está organizado alrededor de `frontend-public` y `backend-public`. Los directorios bajo `deprecated/` se mantienen solo como referencia.
