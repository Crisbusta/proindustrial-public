# Plan de Pruebas E2E — ProIndustrial

**App:** `http://localhost:3001`
**Viewports:** Desktop `1280x720` · Mobile `375x812`
**Credenciales provider:** `contacto@acerospacifico.cl` / `demo123`
**Credenciales admin:** `admin@proindustrial.local` / `demo123`
**Herramienta:** Playwright MCP (browser_navigate, browser_snapshot, browser_click, browser_fill_form, browser_console_messages)

---

## Prioridades

| Prioridad | Descripción |
|-----------|-------------|
| P0 | Bloqueante — falla = app inutilizable |
| P1 | Importante — falla = flujo degradado |
| P2 | Menor — calidad / regresión visual |

---

## Suite 1 — Landing Page (público)

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 1.1 | Hero visible con CTA | Desktop | P0 | Heading principal + botón "Solicitar cotización" visibles |
| 1.2 | Navbar desktop | Desktop | P0 | Links Servicios, Cotizar, Registrar visibles. Sin hamburger. |
| 1.3 | Navbar mobile | Mobile | P0 | Solo logo + hamburger. Links ocultos. |
| 1.4 | CTA no duplicado en navbar mobile | Mobile | P1 | `.navbar-actions` oculto — botón CTA no aparece junto al hamburger |
| 1.5 | Menú hamburger despliega links | Mobile | P1 | Click en hamburger → links de navegación visibles |
| 1.6 | Footer visible | Desktop | P2 | Footer con links de categorías y contacto |

---

## Suite 2 — Directorio de Categorías

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 2.1 | Página de categoría carga | Desktop | P0 | `/servicios/termofusion` → lista de empresas visible |
| 2.2 | Subcategoría carga | Desktop | P0 | `/servicios/termofusion/servicios` → empresas filtradas |
| 2.3 | Categoría en mobile | Mobile | P1 | Layout no rompe en 375px, empresas visibles |

---

## Suite 3 — Perfil de Empresa

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 3.1 | Perfil carga correctamente | Desktop | P0 | `/empresas/proveedora-aceros-pacifico` → nombre, tagline, servicios visibles |
| 3.2 | Breadcrumb correcto | Desktop | P1 | Inicio › Termofusión › Nombre empresa |
| 3.3 | Sección Especialidades muestra nombre | Desktop | P1 | Muestra "Termofusión" + "Ver empresas →", no el slug |
| 3.4 | Link "Solicitar cotización" funciona | Desktop | P0 | Redirige a `/cotizar/:slug` |
| 3.5 | Perfil en mobile | Mobile | P1 | Layout sidebar colapsa correctamente |

---

## Suite 4 — Solicitud de Cotización (público)

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 4.1 | Formulario carga | Desktop | P0 | `/cotizar/proveedora-aceros-pacifico` → campos visibles |
| 4.2 | Validación campos requeridos | Desktop | P0 | Submit vacío → errores visibles sin navegar |
| 4.3 | Submit exitoso | Desktop | P0 | Formulario completo → mensaje de confirmación visible |
| 4.4 | Formulario en mobile | Mobile | P1 | Campos apilados, sin overflow horizontal |

---

## Suite 5 — Registro de Proveedor (público)

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 5.1 | Formulario de registro carga | Desktop | P0 | `/registrar` → todos los campos visibles |
| 5.2 | Validación campos requeridos | Desktop | P0 | Submit vacío → errores por campo |
| 5.3 | Submit exitoso | Desktop | P0 | Datos válidos → pantalla de confirmación / estado pendiente |

---

## Suite 6 — Autenticación Provider

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 6.1 | Login con cuenta demo | Desktop | P0 | `/panel/login` → credenciales válidas → redirige a `/panel/dashboard` |
| 6.2 | Error en español | Desktop | P0 | Credenciales inválidas → "Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente." |
| 6.3 | Logout | Desktop | P0 | Clic en "Salir" → redirige a `/panel/login`, token eliminado |
| 6.4 | Ruta protegida sin token | Desktop | P0 | Acceso directo a `/panel/dashboard` sin login → redirige a `/panel/login` |
| 6.5 | mustChangePassword redirect | Desktop | P1 | Login con contraseña inicial → redirige a `/panel/cambiar-contrasena` |

---

## Suite 7 — Panel Dashboard (provider)

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 7.1 | Dashboard carga con datos | Desktop | P0 | Nombre de empresa visible, secciones de stats |
| 7.2 | Bottom nav visible en mobile | Mobile | P0 | `nav[aria-label="Navegación móvil del panel"]` con 5 items: Resumen, Solicitudes, Mis servicios, Perfil, Salir |
| 7.3 | Sidebar visible en desktop | Desktop | P1 | Sidebar con logo, nombre empresa, links de navegación |

---

## Suite 8 — Panel Solicitudes / Inbox (provider)

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 8.1 | Lista de solicitudes carga | Desktop | P0 | `/panel/solicitudes` → al menos un item en inbox |
| 8.2 | Click en solicitud abre detalle | Desktop | P0 | Selección de item → panel de detalle visible a la derecha |
| 8.3 | Back button en mobile | Mobile | P0 | Click en item → detalle visible en pantalla completa. "← Volver" regresa a lista |
| 8.4 | Filtros de estado | Desktop | P1 | Tabs Todas / Pendientes / etc. filtran lista correctamente |

---

## Suite 9 — Panel Servicios CRUD (provider)

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 9.1 | Lista de servicios carga | Desktop | P0 | `/panel/servicios` → servicios de la empresa visibles |
| 9.2 | Agregar servicio | Desktop | P0 | Clic "Agregar servicio" → slide panel abre. Guardar con nombre válido → aparece en lista |
| 9.3 | Sin duplicate key warnings | Desktop | P0 | Abrir slide panel → consola sin errores "duplicate key" |
| 9.4 | Editar servicio | Desktop | P1 | Ícono editar → slide panel con datos precargados → guardar → lista actualizada |
| 9.5 | Eliminar servicio | Desktop | P1 | Ícono eliminar → diálogo confirmar → aceptar → eliminado de lista |
| 9.6 | Toggle estado activo/borrador | Desktop | P1 | Clic en badge de estado → cambia entre Activo y Borrador |
| 9.7 | Servicios en mobile | Mobile | P2 | Cards en lugar de tabla, sin overflow |

---

## Suite 10 — Panel Perfil (provider)

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 10.1 | Perfil carga con datos de empresa | Desktop | P0 | `/panel/perfil` → campos con datos actuales |
| 10.2 | Editar y guardar | Desktop | P1 | Modificar tagline → guardar → toast de éxito visible |

---

## Suite 11 — Admin

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 11.1 | Login admin | Desktop | P0 | `/admin/login` → credenciales válidas → redirige a `/admin/registros` |
| 11.2 | Ruta admin protegida | Desktop | P0 | Acceso a `/admin/registros` sin token → redirige a `/admin/login` |
| 11.3 | Lista de registros carga | Desktop | P0 | Al menos un registro pendiente visible |
| 11.4 | Filtros Pendientes / Aprobados / Rechazados | Desktop | P0 | Cambiar filtro → lista actualiza |
| 11.5 | Detalle de registro | Desktop | P0 | Click en registro → panel detalle con nombre, email, servicios, descripción |
| 11.6 | Bottom nav admin en mobile | Mobile | P0 | `nav[aria-label="Navegación móvil admin"]` con Registros + Salir |
| 11.7 | Master-detail responsive en mobile | Mobile | P0 | Click en registro → detalle en pantalla completa. "← Volver a registros" regresa a lista |
| 11.8 | Aprobar registro | Desktop | P1 | Botón "Aprobar y crear acceso" → respuesta con email/password inicial visible |

---

## Suite 12 — Flujos E2E

| # | Test | Viewport | Prioridad | Verificar |
|---|------|----------|-----------|-----------|
| 12.1 | Flujo público completo | Desktop | P1 | Inicio → categoría → perfil empresa → formulario cotización → confirmación |
| 12.2 | Flujo provider completo | Desktop | P1 | Login → dashboard → servicios → agregar servicio → perfil → logout |
| 12.3 | Flujo admin completo | Desktop | P1 | Login admin → ver pendientes → abrir detalle → aprobar → ver en aprobados |
| 12.4 | Flujo mobile provider | Mobile | P0 | Login → bottom nav → inbox → detalle → back → servicios |

---

## Checklist de regresión rápida (smoke test)

Ejecutar antes de cada deploy o cambio significativo:

- [ ] 1.1 Hero visible
- [ ] 3.1 Perfil empresa carga
- [ ] 6.1 Login provider
- [ ] 6.2 Error login en español
- [ ] 7.2 Bottom nav mobile provider
- [ ] 9.3 Sin duplicate key warnings
- [ ] 11.1 Login admin
- [ ] 11.6 Bottom nav mobile admin
- [ ] 11.7 Master-detail admin en mobile
- [ ] 12.4 Flujo mobile provider

---

## Notas de ejecución

- Siempre limpiar `localStorage` entre suites de autenticación diferentes (provider vs admin)
- Para verificar consola: `browser_console_messages(level: "warning")` — solo deben aparecer los 2 warnings de React Router v6 (esperados, no bugs)
- Bugs conocidos corregidos (v1): ver `CHANGELOG` o historial git
- Al agregar nuevas páginas, agregar suite correspondiente aquí antes de implementar
