import { useState, FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { IconCheck, IconSend } from '../components/Icons'
import { getCompanyBySlug, CATEGORIES } from '../data/mockData'
import type { QuoteRequest } from '../types'

const EMPTY: QuoteRequest = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  description: '',
  location: '',
}

export default function QuoteFormPage() {
  const { companySlug } = useParams<{ companySlug?: string }>()
  const company = companySlug ? getCompanyBySlug(companySlug) : undefined

  const [form, setForm] = useState<QuoteRequest>({
    ...EMPTY,
    service: company?.services[0] ?? '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field: keyof QuoteRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate async (no real backend endpoint yet)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  const crumbs = [
    { label: 'Inicio', to: '/' },
    ...(company ? [{ label: company.name, to: `/empresas/${company.slug}` }] : []),
    { label: 'Solicitar cotización' },
  ]

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
                Solicitud enviada
              </h1>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                Tu solicitud de cotización fue recibida correctamente.{company ? ` ${company.name}` : ' La empresa'} se pondrá en contacto contigo a la brevedad.
              </p>
              <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', marginTop: 'var(--sp-8)', flexWrap: 'wrap' }}>
                <Link to="/" className="btn btn-primary">
                  Volver al inicio
                </Link>
                {company && (
                  <Link to={`/empresas/${company.slug}`} className="btn btn-outline">
                    Ver perfil de la empresa
                  </Link>
                )}
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
            <Breadcrumb crumbs={crumbs} />
          </div>
          <h1 className="page-title" style={{ marginTop: 'var(--sp-4)' }}>
            Solicitar cotización
          </h1>
          {company && (
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
              Enviando solicitud a <strong>{company.name}</strong>
            </p>
          )}
        </div>
      </div>

      <main>
        <div className="container" style={{ maxWidth: 720, paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-16)' }}>
          <form onSubmit={handleSubmit} noValidate aria-label="Formulario de cotización">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

              {/* Contact section */}
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-5)', display: 'block' }}>
                  Datos de contacto
                </legend>
                <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Nombre <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="form-input"
                      placeholder="Juan Pérez"
                      value={form.name}
                      onChange={set('name')}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company-name" className="form-label">
                      Empresa <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="company-name"
                      type="text"
                      className="form-input"
                      placeholder="Constructora Norte S.A."
                      value={form.company}
                      onChange={set('company')}
                      required
                      autoComplete="organization"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Correo electrónico <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      placeholder="juan@empresa.cl"
                      value={form.email}
                      onChange={set('email')}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Teléfono
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="form-input"
                      placeholder="+56 9 xxxx xxxx"
                      value={form.phone}
                      onChange={set('phone')}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Project section */}
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-5)', display: 'block' }}>
                  Detalle del proyecto
                </legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
                  <div className="form-group">
                    <label htmlFor="service" className="form-label">
                      Servicio requerido <span className="required" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="service"
                      className="form-select"
                      value={form.service}
                      onChange={set('service')}
                      required
                    >
                      <option value="">Seleccionar servicio...</option>
                      {company
                        ? company.services.map(svc => (
                            <option key={svc} value={svc}>{svc}</option>
                          ))
                        : CATEGORIES.map(cat => (
                            <option key={cat.slug} value={cat.name}>{cat.name}</option>
                          ))
                      }
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="location" className="form-label">
                      Ubicación del proyecto <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="location"
                      type="text"
                      className="form-input"
                      placeholder="Ej: Antofagasta, Región de Antofagasta"
                      value={form.location}
                      onChange={set('location')}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      Descripción del proyecto <span className="required" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="description"
                      className="form-textarea"
                      placeholder="Describe brevemente el trabajo a realizar: tipo de instalación, materiales, cantidades aproximadas, plazo estimado, etc."
                      value={form.description}
                      onChange={set('description')}
                      required
                      rows={5}
                    />
                    <p className="form-hint">
                      Mientras más detalle, más precisa será la cotización que recibas.
                    </p>
                  </div>
                </div>
              </fieldset>

              {/* Submit */}
              <div className="form-actions">
                <Link to={company ? `/empresas/${company.slug}` : '/'} className="btn btn-ghost">
                  Cancelar
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? 'Enviando...' : (
                    <>
                      Enviar solicitud
                      <IconSend size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  )
}
