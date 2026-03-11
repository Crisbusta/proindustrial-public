import { useParams, Navigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import { CATEGORY_ICONS, IconMapPin, IconPhone, IconMail, IconGlobe, IconCheck, IconArrowRight } from '../components/Icons'
import { getCompanyBySlug, getCategoryBySlug } from '../data/mockData'

function initials(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 3)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export default function CompanyProfile() {
  const { slug } = useParams<{ slug: string }>()
  const company = slug ? getCompanyBySlug(slug) : undefined

  if (!company) return <Navigate to="/" replace />

  const categories = company.categories.map(getCategoryBySlug).filter(Boolean)
  const primaryCategory = categories[0]

  return (
    <>
      <Navbar />

      {/* Profile Hero */}
      <div className="profile-hero" aria-label={`Perfil de ${company.name}`}>
        <div className="container">
          <div style={{ marginBottom: 'var(--sp-6)' }}>
            <Breadcrumb crumbs={[
              { label: 'Inicio', to: '/' },
              ...(primaryCategory ? [{ label: primaryCategory.name, to: `/servicios/${primaryCategory.slug}` }] : []),
              { label: company.name },
            ]} />
          </div>

          <div className="profile-hero-inner">
            <div className="profile-avatar" aria-hidden="true">
              {initials(company.name)}
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="profile-hero-name">{company.name}</h1>
              <p className="profile-hero-tagline">{company.tagline}</p>
              <div className="profile-hero-meta">
                <span className="profile-hero-meta-item">
                  <IconMapPin size={14} />
                  {company.location}, {company.region}
                </span>
                {company.yearsActive && (
                  <span className="profile-hero-meta-item">
                    {company.yearsActive} años de experiencia
                  </span>
                )}
                {categories.map(cat => cat && (
                  <span key={cat.slug} className="badge badge-blue" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              <Link
                to={`/cotizar/${company.slug}`}
                className="btn btn-primary btn-lg"
              >
                Solicitar cotización
                <IconArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main>
        <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-16)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--sp-8)', alignItems: 'start' }}>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>

              {/* Description */}
              <section aria-labelledby="about-title">
                <h2 id="about-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-4)' }}>
                  Acerca de la empresa
                </h2>
                <div className="card" style={{ padding: 'var(--sp-6)' }}>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', lineHeight: 1.75 }}>
                    {company.description}
                  </p>
                </div>
              </section>

              {/* Services */}
              <section aria-labelledby="services-title">
                <h2 id="services-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-4)' }}>
                  Servicios ofrecidos
                </h2>
                <div className="card" style={{ padding: 'var(--sp-6)' }}>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                    {company.services.map(svc => (
                      <li key={svc} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                        <span style={{ color: 'var(--color-cta)', marginTop: '2px', flexShrink: 0 }}>
                          <IconCheck size={16} />
                        </span>
                        {svc}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Specialties */}
              {categories.length > 0 && (
                <section aria-labelledby="specialties-title">
                  <h2 id="specialties-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-4)' }}>
                    Especialidades
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
                    {categories.map(cat => {
                      if (!cat) return null
                      const Icon = CATEGORY_ICONS[cat.icon] ?? CATEGORY_ICONS['building']
                      return (
                        <Link
                          key={cat.slug}
                          to={`/servicios/${cat.slug}`}
                          className="card"
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-4) var(--sp-5)', textDecoration: 'none', cursor: 'pointer' }}
                        >
                          <div className="category-card-icon" style={{ width: 36, height: 36 }} aria-hidden="true">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>{cat.name}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{cat.companyCount} empresas</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

              {/* Contact Card */}
              <div className="card" style={{ padding: 'var(--sp-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--sp-5)', color: 'var(--color-primary)' }}>
                  Información de contacto
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                  <a
                    href={`tel:${company.phone.replace(/\s/g, '')}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', textDecoration: 'none' }}
                  >
                    <span style={{ color: 'var(--color-cta)', flexShrink: 0 }}><IconPhone size={16} /></span>
                    {company.phone}
                  </a>
                  <a
                    href={`mailto:${company.email}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    <span style={{ color: 'var(--color-cta)', flexShrink: 0 }}><IconMail size={16} /></span>
                    {company.email}
                  </a>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', textDecoration: 'none' }}
                    >
                      <span style={{ color: 'var(--color-cta)', flexShrink: 0 }}><IconGlobe size={16} /></span>
                      {company.website}
                    </a>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-cta)', flexShrink: 0, marginTop: 1 }}><IconMapPin size={16} /></span>
                    {company.location}, Región de {company.region}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-5)', marginTop: 'var(--sp-5)' }}>
                  <Link
                    to={`/cotizar/${company.slug}`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Solicitar cotización
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              {company.yearsActive && (
                <div className="card" style={{ padding: 'var(--sp-6)' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--sp-5)', color: 'var(--color-primary)' }}>
                    Datos de la empresa
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Años de experiencia</span>
                      <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text)' }}>{company.yearsActive}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Región base</span>
                      <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text)' }}>{company.region}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Servicios</span>
                      <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text)' }}>{company.services.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
