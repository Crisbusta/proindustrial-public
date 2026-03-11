import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CategoryCard from '../components/CategoryCard'
import CompanyCard from '../components/CompanyCard'
import { CATEGORIES, COMPANIES } from '../data/mockData'
import { IconArrowRight, IconSearch, IconBuilding, IconCheck } from '../components/Icons'

const STEPS = [
  {
    number: '1',
    title: 'Busca el servicio',
    description: 'Navega por categorías como termofusión, geomembranas o servicios hidráulicos y encuentra lo que necesitas para tu proyecto.',
  },
  {
    number: '2',
    title: 'Encuentra proveedores',
    description: 'Revisa perfiles de empresas especializadas con su ubicación, servicios y experiencia en proyectos industriales.',
  },
  {
    number: '3',
    title: 'Solicita cotización',
    description: 'Envía tu solicitud directamente a la empresa con los detalles del proyecto. Rápido, sin intermediarios.',
  },
]

const STATS = [
  { value: '98+', label: 'Empresas registradas' },
  { value: '6', label: 'Categorías de servicio' },
  { value: '15', label: 'Regiones de cobertura' },
]

export default function LandingPage() {
  const featuredCompanies = COMPANIES.filter(c => c.featured)

  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ─────────────────────────────── */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="container">
            <div className="hero-content">
              <div className="hero-label">
                <IconBuilding size={12} />
                Directorio industrial de Chile
              </div>

              <h1 className="hero-title" id="hero-title">
                Directorio de{' '}
                <em>servicios industriales</em>{' '}
                especializados
              </h1>

              <p className="hero-subtitle">
                Encuentra empresas de termofusión, geomembranas y servicios técnicos
                para tu proyecto de construcción, minería o infraestructura.
              </p>

              <div className="hero-actions">
                <Link to="/#categorias" className="btn btn-primary btn-lg" onClick={e => {
                  e.preventDefault()
                  document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })
                }}>
                  Explorar servicios
                  <IconArrowRight size={18} />
                </Link>
                <Link to="/cotizar" className="btn btn-lg"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Solicitar cotización
                </Link>
              </div>

              <div className="hero-stats" aria-label="Estadísticas de la plataforma">
                {STATS.map(s => (
                  <div key={s.label}>
                    <p className="hero-stat-value">{s.value}</p>
                    <p className="hero-stat-label">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Categories ───────────────────────── */}
        <section className="section" id="categorias" aria-labelledby="categories-title">
          <div className="container">
            <div style={{ marginBottom: 'var(--sp-8)' }}>
              <p className="label-sm">Servicios disponibles</p>
              <h2 className="section-title" id="categories-title" style={{ marginTop: 'var(--sp-2)' }}>
                Categorías de servicio
              </h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-3)', maxWidth: 520 }}>
                Selecciona la categoría que necesitas para ver las empresas especializadas disponibles en tu región.
              </p>
            </div>

            <div className="grid-3" style={{ '--gap': 'var(--sp-5)' } as React.CSSProperties}>
              {CATEGORIES.map(cat => (
                <CategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────── */}
        <section className="section section-sm" id="como-funciona"
          style={{ background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
          aria-labelledby="steps-title"
        >
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
              <p className="label-sm">Simple y rápido</p>
              <h2 className="section-title" id="steps-title" style={{ marginTop: 'var(--sp-2)' }}>
                ¿Cómo funciona?
              </h2>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-3)' }}>
                Desde buscar hasta cotizar en menos de 2 minutos.
              </p>
            </div>

            <div className="steps-grid">
              {STEPS.map(step => (
                <div key={step.number} className="step-item">
                  <div className="step-number" aria-hidden="true">{step.number}</div>
                  <div>
                    <p className="step-title">{step.title}</p>
                    <p className="step-description" style={{ marginTop: 'var(--sp-2)' }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Companies ────────────────── */}
        <section className="section" aria-labelledby="featured-title">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--sp-8)', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <div>
                <p className="label-sm">Proveedores destacados</p>
                <h2 className="section-title" id="featured-title" style={{ marginTop: 'var(--sp-2)' }}>
                  Empresas destacadas
                </h2>
              </div>
              <Link to="/servicios/termofusion" className="btn btn-outline btn-sm">
                Ver todas
                <IconArrowRight size={14} />
              </Link>
            </div>

            <div className="grid-2">
              {featuredCompanies.slice(0, 4).map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust Section ─────────────────────── */}
        <section className="section-sm"
          style={{ background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
          aria-label="Garantías de la plataforma"
        >
          <div className="container">
            <div className="trust-grid">
              {[
                { title: 'Proveedores verificados', desc: 'Empresas con historial y referencias comprobables en la industria chilena.' },
                { title: 'Contacto directo', desc: 'Sin intermediarios. Contacta directamente al proveedor que necesitas.' },
                { title: 'Cobertura nacional', desc: 'Empresas en todo Chile, desde Arica hasta Punta Arenas.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-cta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-cta)' }}>
                    <IconCheck size={18} />
                  </div>
                  <p style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', fontSize: 'var(--text-base)' }}>{item.title}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Provider CTA ─────────────────────── */}
        <section className="section">
          <div className="container">
            <div className="cta-banner">
              <div className="cta-banner-text">
                <h2>¿Eres proveedor de servicios industriales?</h2>
                <p>
                  Registra tu empresa y llega a compradores de todo Chile que buscan servicios como los tuyos.
                  Es gratis y toma menos de 5 minutos.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link to="/registrar" className="btn btn-primary btn-lg">
                  Registrar mi empresa
                  <IconArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick Search CTA ──────────────────── */}
        <section className="section-sm"
          style={{ borderTop: '1px solid var(--color-border)' }}
          aria-label="Búsqueda rápida"
        >
          <div className="container" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-4)' }}>
              ¿No encontraste lo que buscabas?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <Link to="/cotizar" className="btn btn-primary">
                <IconSearch size={16} />
                Enviar solicitud abierta
              </Link>
              <a href="mailto:hola@proindustrial.cl" className="btn btn-ghost">
                Contactar al equipo
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
