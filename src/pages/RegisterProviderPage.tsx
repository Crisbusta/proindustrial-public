import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { IconCheck, IconArrowRight } from '../components/Icons'
import { REGIONS, CATEGORIES } from '../data/mockData'
import type { ProviderRegistration } from '../types'

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

  const set = (field: keyof Omit<ProviderRegistration, 'services'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const toggleService = (slug: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(slug)
        ? prev.services.filter(s => s !== slug)
        : [...prev.services, slug],
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
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
                Nuestro equipo revisará tu registro y te contactará en las próximas 24 horas para activar tu perfil.
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--sp-12)', alignItems: 'start' }}>

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
                        autoComplete="organization"
                      />
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
                          autoComplete="email"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="reg-phone" className="form-label">
                          Teléfono <span className="required" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="reg-phone"
                          type="tel"
                          className="form-input"
                          placeholder="+56 2 xxxx xxxx"
                          value={form.phone}
                          onChange={set('phone')}
                          required
                          autoComplete="tel"
                        />
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
                      >
                        <option value="">Seleccionar región...</option>
                        {REGIONS.slice(1).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)' }}>
                    {CATEGORIES.map(cat => {
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
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleService(cat.slug)}
                            style={{ display: 'none' }}
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
                      rows={4}
                    />
                    <p className="form-hint">Máximo 300 caracteres. Esta descripción aparecerá en tu perfil público.</p>
                  </div>
                </fieldset>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--sp-2)', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
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
