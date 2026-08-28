import { useState, useEffect, useCallback, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { IconCheck, IconArrowRight } from '../components/Icons'
import { fetchRegions, fetchCategoryGroups, submitRegistration } from '../api/client'
import { LIMITS } from '../constants/limits'
import type { CategoryGroup, ProviderRegistration } from '../types'

type FieldErrors = Partial<Record<keyof ProviderRegistration, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Ancla de cada campo, para llevar el foco al primero que falle.
const FIELD_IDS: Record<keyof ProviderRegistration, string> = {
  companyName: 'companyName',
  email: 'reg-email',
  phone: 'reg-phone',
  region: 'reg-region',
  services: 'services-group',
  description: 'description',
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="form-hint" style={{ color: '#DC2626', fontWeight: 'var(--weight-medium)' }}>
      {message}
    </p>
  )
}

const EMPTY: ProviderRegistration = {
  companyName: '',
  email: '',
  phone: '',
  region: '',
  services: [],
  description: '',
}

const BENEFITS = [
  'Perfil visible para compradores de toda Chile',
  'Recibe solicitudes de cotización directamente',
  'Sin comisiones ni intermediarios',
  'Registro gratuito, sin compromisos',
]

export default function RegisterProviderPage() {
  const [form, setForm] = useState<ProviderRegistration>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [metaLoading, setMetaLoading] = useState(true)
  const [metaError, setMetaError] = useState(false)

  // Antes ambos fetch tenían .catch(() => {}): si la API fallaba, el usuario
  // veía el selector de región vacío y ni un solo checkbox de categoría, sin
  // ninguna explicación, y enviaba el formulario incompleto.
  const loadMeta = useCallback(() => {
    setMetaLoading(true)
    setMetaError(false)
    Promise.all([fetchRegions(), fetchCategoryGroups()])
      .then(([r, g]) => {
        setRegions(r.filter(x => x !== 'Todas las regiones'))
        setGroups(g)
      })
      .catch(() => setMetaError(true))
      .finally(() => setMetaLoading(false))
  }, [])

  useEffect(() => { loadMeta() }, [loadMeta])

  const set = (field: keyof Omit<ProviderRegistration, 'services'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { value } = e.target
    setForm(prev => ({ ...prev, [field]: value }))
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const toggleService = (slug: string) => {
    setFieldErrors(prev => (prev.services ? { ...prev, services: undefined } : prev))
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(slug)
        ? prev.services.filter(s => s !== slug)
        : [...prev.services, slug],
    }))
  }

  // El <form> lleva noValidate para poder mostrar los mensajes en español y
  // junto a cada campo. Eso exige validar aquí: antes no había ninguna
  // validación, así que los required eran decorativos y se podía enviar el
  // formulario casi vacío.
  const validate = (): FieldErrors => {
    const errs: FieldErrors = {}
    const name = form.companyName.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()
    const description = form.description.trim()

    if (name.length < LIMITS.companyName.min) {
      errs.companyName = `Ingresa el nombre de la empresa (mínimo ${LIMITS.companyName.min} caracteres).`
    } else if (name.length > LIMITS.companyName.max) {
      errs.companyName = `El nombre no puede superar los ${LIMITS.companyName.max} caracteres.`
    }

    if (!EMAIL_RE.test(email)) errs.email = 'Ingresa un correo electrónico válido.'
    else if (email.length > LIMITS.email.max) errs.email = `El correo no puede superar los ${LIMITS.email.max} caracteres.`

    if (phone.length < LIMITS.phone.min) errs.phone = 'Ingresa un teléfono de contacto.'
    else if (phone.length > LIMITS.phone.max) errs.phone = `El teléfono no puede superar los ${LIMITS.phone.max} caracteres.`

    if (!form.region) errs.region = 'Selecciona tu región principal.'

    if (form.services.length === 0) {
      errs.services = 'Selecciona al menos una categoría: es lo que permite que te encuentren en el directorio.'
    }

    if (description.length < LIMITS.description.min) {
      errs.description = `Cuéntanos un poco más: al menos ${LIMITS.description.min} caracteres.`
    } else if (description.length > LIMITS.description.max) {
      errs.description = `La descripción no puede superar los ${LIMITS.description.max} caracteres.`
    }

    return errs
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) {
      setError('')
      const firstField = (['companyName', 'email', 'phone', 'region', 'services', 'description'] as const)
        .find(f => errs[f])
      const anchor = firstField === 'services' ? 'services-group' : FIELD_IDS[firstField ?? 'companyName']
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById(anchor)?.focus?.()
      return
    }

    setLoading(true)
    setError('')
    try {
      await submitRegistration({
        companyName: form.companyName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        region: form.region,
        services: form.services,
        description: form.description.trim(),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el registro')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main>
          <div className="container" style={{ maxWidth: 560, paddingTop: 'var(--sp-16)', paddingBottom: 'var(--sp-16)' }}>
            <div className="success-card">
              <div className="success-icon" aria-hidden="true">
                <IconCheck size={28} />
              </div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-3)' }}>
                ¡Registro recibido!
              </h1>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                Hemos recibido la información de <strong>{form.companyName}</strong>.
                Tu empresa quedó en estado <strong>pendiente de revisión</strong>. Un administrador revisará el registro y, al aprobarlo, habilitará tu acceso inicial al panel.
              </p>
              <div style={{ marginTop: 'var(--sp-8)' }}>
                <Link to="/" className="btn btn-primary">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <div className="page-header">
        <div className="container">
          <div className="page-header-top">
            <Breadcrumb crumbs={[
              { label: 'Inicio', to: '/' },
              { label: 'Registrar empresa' },
            ]} />
          </div>
          <h1 className="page-title" style={{ marginTop: 'var(--sp-4)' }}>
            Registra tu empresa
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
            Llega a compradores industriales de todo Chile. Gratis, sin compromisos.
          </p>
        </div>
      </div>

      <main>
        <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-16)' }}>
          <div className="register-layout">

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate aria-label="Formulario de registro de proveedor">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-5)', display: 'block' }}>
                    Datos de la empresa
                  </legend>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                    <div className="form-group">
                      <label htmlFor="companyName" className="form-label">
                        Nombre de la empresa <span className="required" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        className="form-input"
                        placeholder="Ej: Tuberías del Sur S.A."
                        value={form.companyName}
                        onChange={set('companyName')}
                        required
                        maxLength={LIMITS.companyName.max}
                        autoComplete="organization"
                        aria-invalid={!!fieldErrors.companyName}
                        aria-describedby={fieldErrors.companyName ? 'err-companyName' : undefined}
                      />
                      <FieldError id="err-companyName" message={fieldErrors.companyName} />
                    </div>

                    <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
                      <div className="form-group">
                        <label htmlFor="reg-email" className="form-label">
                          Correo electrónico <span className="required" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          className="form-input"
                          placeholder="contacto@empresa.cl"
                          value={form.email}
                          onChange={set('email')}
                          required
                          maxLength={LIMITS.email.max}
                          autoComplete="email"
                          aria-invalid={!!fieldErrors.email}
                          aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                        />
                        <FieldError id="err-email" message={fieldErrors.email} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="reg-phone" className="form-label">
                          Teléfono <span className="required" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="reg-phone"
                          type="tel"
                          className="form-input"
                          placeholder="+56 9 1234 5678"
                          value={form.phone}
                          onChange={set('phone')}
                          required
                          maxLength={LIMITS.phone.max}
                          autoComplete="tel"
                          aria-invalid={!!fieldErrors.phone}
                          aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
                        />
                        <FieldError id="err-phone" message={fieldErrors.phone} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reg-region" className="form-label">
                        Región principal <span className="required" aria-hidden="true">*</span>
                      </label>
                      <select
                        id="reg-region"
                        className="form-select"
                        value={form.region}
                        onChange={set('region')}
                        required
                        disabled={metaLoading || metaError}
                        aria-invalid={!!fieldErrors.region}
                        aria-describedby={fieldErrors.region ? 'err-region' : undefined}
                      >
                        <option value="">{metaLoading ? 'Cargando regiones...' : 'Seleccionar región...'}</option>
                        {regions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <FieldError id="err-region" message={fieldErrors.region} />
                    </div>
                  </div>
                </fieldset>

                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-2)', display: 'block' }}>
                    Servicios que ofrece
                  </legend>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-5)' }}>
                    Selecciona todas las categorías que apliquen a tu empresa.
                  </p>

                  {metaError && (
                    <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)', fontSize: 'var(--text-sm)', color: '#B91C1C' }}>
                      No pudimos cargar las regiones y categorías.{' '}
                      <button
                        type="button"
                        onClick={loadMeta}
                        style={{ background: 'none', border: 'none', padding: 0, color: '#B91C1C', fontWeight: 'var(--weight-semibold)', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Reintentar
                      </button>
                    </div>
                  )}

                  <div id="services-group" tabIndex={-1} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)' }}>
                    {metaLoading && !metaError && (
                      <p style={{ gridColumn: '1 / -1', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        Cargando categorías...
                      </p>
                    )}
                    {!metaLoading && !metaError && groups.length === 0 && (
                      <p style={{ gridColumn: '1 / -1', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        No hay categorías disponibles en este momento.
                      </p>
                    )}
                    {groups.map(cat => {
                      const selected = form.services.includes(cat.slug)
                      return (
                        <label
                          key={cat.slug}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--sp-3)',
                            padding: 'var(--sp-4)',
                            border: `1.5px solid ${selected ? 'var(--color-cta)' : 'var(--color-border)'}`,
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            background: selected ? 'var(--color-cta-light)' : 'var(--color-surface)',
                            transition: 'border-color var(--ease-fast), background var(--ease-fast)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--weight-medium)',
                            color: selected ? 'var(--color-cta)' : 'var(--color-text)',
                            userSelect: 'none',
                          }}
                        >
                          {/* display:none sacaba el input del orden de tabulación
                              y del árbol de accesibilidad: la categoría no se
                              podía seleccionar con teclado ni con lector. */}
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleService(cat.slug)}
                            style={{ position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0 }}
                            aria-label={cat.name}
                          />
                          <span style={{
                            width: 18,
                            height: 18,
                            border: `2px solid ${selected ? 'var(--color-cta)' : 'var(--color-border)'}`,
                            borderRadius: 4,
                            background: selected ? 'var(--color-cta)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'background var(--ease-fast), border-color var(--ease-fast)',
                          }}>
                            {selected && <IconCheck size={12} />}
                          </span>
                          {cat.name}
                        </label>
                      )
                    })}
                  </div>
                  <FieldError id="err-services" message={fieldErrors.services} />
                </fieldset>

                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-5)', display: 'block' }}>
                    Presentación
                  </legend>
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Descripción breve de la empresa <span className="required" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="description"
                      className="form-textarea"
                      placeholder="Describe tu empresa: años de experiencia, tipos de proyectos, zonas de cobertura, certificaciones, etc."
                      value={form.description}
                      onChange={set('description')}
                      required
                      rows={5}
                      maxLength={LIMITS.description.max}
                      aria-invalid={!!fieldErrors.description}
                      aria-describedby={fieldErrors.description ? 'err-description' : 'hint-description'}
                    />
                    <p id="hint-description" className="form-hint">
                      {form.description.length}/{LIMITS.description.max} caracteres
                      {form.description.trim().length < LIMITS.description.min
                        ? ` · mínimo ${LIMITS.description.min}`
                        : ''}
                      . Esta descripción aparecerá en tu perfil público.
                    </p>
                    <FieldError id="err-description" message={fieldErrors.description} />
                  </div>
                </fieldset>

                {error && (
                  <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)', fontSize: 'var(--text-sm)', color: '#DC2626' }}>
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--sp-2)', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || metaLoading || metaError}
                    aria-busy={loading}
                  >
                    {loading ? 'Enviando...' : (
                      <>
                        Registrar empresa
                        <IconArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Sidebar */}
            <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + var(--sp-6))' }}>
              <div className="card" style={{ padding: 'var(--sp-6)', background: 'var(--color-primary)', border: 'none' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: '#fff', marginBottom: 'var(--sp-5)' }}>
                  ¿Por qué registrarse?
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                  {BENEFITS.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
                      <span style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 1 }}>
                        <IconCheck size={15} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="info-box" style={{ marginTop: 'var(--sp-4)' }}>
                <span style={{ flexShrink: 0 }}><IconCheck size={16} /></span>
                <p>
                  Una vez aprobado tu registro, nuestro equipo te contactará para completar tu perfil.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
