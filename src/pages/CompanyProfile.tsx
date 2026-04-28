import { useState, useEffect, useCallback } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import {
  CATEGORY_ICONS, IconMapPin, IconPhone, IconMail, IconGlobe,
  IconCheck, IconArrowRight, IconAward, IconFolderOpen, IconX, IconImage,
} from '../components/Icons'
import {
  fetchCompanyBySlug, fetchCategoryGroups, fetchCompanyServices,
  fetchCompanyCertifications, fetchCompanyProjects,
} from '../api/client'
import { track } from '../lib/analytics'
import type { Company, CategoryGroup, CompanyService, CompanyCertification, CompanyProject } from '../types'

type Tab = 'info' | 'services' | 'projects' | 'certs'

function initials(name: string): string {
  return name.split(' ').filter(w => w.length > 3).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

interface Lightbox { images: string[]; index: number }

export default function CompanyProfile() {
  const { slug } = useParams<{ slug: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [services, setServices] = useState<CompanyService[]>([])
  const [certs, setCerts] = useState<CompanyCertification[]>([])
  const [projects, setProjects] = useState<CompanyProject[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [lightbox, setLightbox] = useState<Lightbox | null>(null)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      fetchCompanyBySlug(slug),
      fetchCategoryGroups(),
      fetchCompanyServices(slug),
      fetchCompanyCertifications(slug),
      fetchCompanyProjects(slug),
    ]).then(([c, g, svcs, certList, projList]) => {
      setCompany(c)
      setGroups(g)
      setServices(svcs)
      setCerts(certList)
      setProjects(projList)
      track(c.id, 'profile_view')
    }).catch(() => setCompany(null)).finally(() => setLoading(false))
  }, [slug])

  const closeLightbox = useCallback(() => setLightbox(null), [])
  const moveLightbox = useCallback((dir: 1 | -1) => {
    setLightbox(prev => {
      if (!prev) return null
      const next = (prev.index + dir + prev.images.length) % prev.images.length
      return { ...prev, index: next }
    })
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') moveLightbox(1)
      if (e.key === 'ArrowLeft') moveLightbox(-1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, closeLightbox, moveLightbox])

  if (loading) return null
  if (!company) return <Navigate to="/" replace />

  const allCategoryMeta = groups.flatMap(g => [
    { slug: g.slug, name: g.name, icon: g.icon },
    ...g.subcategories.map(s => ({ slug: s.slug, name: s.name, icon: s.icon })),
  ])
  const categories = company.categories.map(catSlug => allCategoryMeta.find(c => c.slug === catSlug)).filter(Boolean)
  const primaryCategory = categories[0]

  const serviceImgCount = services.reduce((n, s) => n + (s.images?.length ?? 0), 0)
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Información' },
    { id: 'services', label: 'Servicios', count: services.filter(s => s.status === 'active').length },
    ...(projects.length > 0 ? [{ id: 'projects' as Tab, label: 'Casos destacados', count: projects.length }] : []),
    ...(certs.length > 0 ? [{ id: 'certs' as Tab, label: 'Certificaciones', count: certs.length }] : []),
  ]

  const formatDate = (s: string | null) => {
    if (!s) return null
    try { return new Date(s).toLocaleDateString('es-CL', { year: 'numeric', month: 'short' }) } catch { return s }
  }

  const activeServices = services.filter(s => s.status === 'active')

  return (
    <>
      <Navbar />

      {/* ── Cover strip ───────────────────────────── */}
      {company.coverUrl && (
        <div style={{ width: '100%', height: 220, overflow: 'hidden', background: 'var(--color-primary)' }}>
          <img src={company.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        </div>
      )}

      {/* ── Profile Hero ──────────────────────────── */}
      <div className="profile-hero" style={{ paddingTop: company.coverUrl ? 'var(--sp-6)' : undefined }} aria-label={`Perfil de ${company.name}`}>
        <div className="container">
          <div style={{ marginBottom: 'var(--sp-5)' }}>
            <Breadcrumb crumbs={[
              { label: 'Inicio', to: '/' },
              ...(primaryCategory ? [{ label: primaryCategory.name, to: `/servicios/${primaryCategory.slug}` }] : []),
              { label: company.name },
            ]} />
          </div>

          <div className="profile-hero-inner">
            {/* Logo or initials */}
            {company.logoUrl
              ? <img src={company.logoUrl} alt={`Logo de ${company.name}`} className="profile-avatar" style={{ objectFit: 'cover', padding: 0, background: '#fff' }} />
              : <div className="profile-avatar" aria-hidden="true">{initials(company.name)}</div>
            }

            <div style={{ flex: 1 }}>
              <h1 className="profile-hero-name">{company.name}</h1>
              <p className="profile-hero-tagline">{company.tagline}</p>
              <div className="profile-hero-meta">
                {(company.location || company.region) && (
                  <span className="profile-hero-meta-item">
                    <IconMapPin size={14} />
                    {[company.location, company.region].filter(Boolean).join(', ')}
                  </span>
                )}
                {company.yearsActive && (
                  <span className="profile-hero-meta-item">{company.yearsActive} años de experiencia</span>
                )}
                {serviceImgCount > 0 && (
                  <span className="profile-hero-meta-item">
                    <IconImage size={14} />
                    {serviceImgCount} {serviceImgCount === 1 ? 'foto' : 'fotos'}
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
              <Link to={`/cotizar/${company.slug}`} className="btn btn-primary btn-lg">
                Solicitar cotización
                <IconArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────── */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: 'var(--sp-4) var(--sp-5)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: activeTab === t.id ? 'var(--weight-semibold)' : 'var(--weight-normal)',
                  color: activeTab === t.id ? 'var(--color-cta)' : 'var(--color-text-secondary)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === t.id ? '2px solid var(--color-cta)' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color var(--ease-fast)',
                }}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span style={{ marginLeft: 'var(--sp-2)', background: activeTab === t.id ? 'var(--color-cta-light)' : 'var(--color-surface-2)', color: activeTab === t.id ? 'var(--color-cta)' : 'var(--color-text-muted)', borderRadius: 100, padding: '1px 7px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main>
        <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-16)' }}>

          {/* ── Información tab ─────────────────────── */}
          {activeTab === 'info' && (
            <div className="profile-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>

                {company.description && (
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
                )}

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
                          <Link key={cat.slug} to={`/servicios/${cat.slug}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-4) var(--sp-5)', textDecoration: 'none' }}>
                            <div className="category-card-icon" style={{ width: 36, height: 36 }} aria-hidden="true">
                              <Icon size={18} />
                            </div>
                            <div>
                              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>{cat.name}</p>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>Ver empresas →</p>
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
                <div className="card" style={{ padding: 'var(--sp-6)' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--sp-5)', color: 'var(--color-primary)' }}>
                    Información de contacto
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    {company.phone && (
                      <a href={`tel:${(company.phone ?? '').replace(/\s/g, '')}`} onClick={() => track(company.id, 'contact_click')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', textDecoration: 'none' }}>
                        <span style={{ color: 'var(--color-cta)', flexShrink: 0 }}><IconPhone size={16} /></span>
                        {company.phone}
                      </a>
                    )}
                    {company.email && (
                      <a href={`mailto:${company.email}`} onClick={() => track(company.id, 'contact_click')} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', textDecoration: 'none', wordBreak: 'break-all' }}>
                        <span style={{ color: 'var(--color-cta)', flexShrink: 0 }}><IconMail size={16} /></span>
                        {company.email}
                      </a>
                    )}
                    {company.website && (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', textDecoration: 'none', wordBreak: 'break-word' }}>
                        <span style={{ color: 'var(--color-cta)', flexShrink: 0 }}><IconGlobe size={16} /></span>
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    {(company.location || company.region) && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        <span style={{ color: 'var(--color-cta)', flexShrink: 0, marginTop: 1 }}><IconMapPin size={16} /></span>
                        {[company.location, company.region && `Región de ${company.region}`].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-5)', marginTop: 'var(--sp-5)' }}>
                    <Link to={`/cotizar/${company.slug}`} onClick={() => track(company.id, 'quote_form_open')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Solicitar cotización
                    </Link>
                  </div>
                </div>

                {(company.yearsActive || services.length > 0 || certs.length > 0) && (
                  <div className="card" style={{ padding: 'var(--sp-6)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--sp-5)', color: 'var(--color-primary)' }}>
                      Datos de la empresa
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                      {company.yearsActive && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>Años de experiencia</span>
                          <span style={{ fontWeight: 'var(--weight-semibold)' }}>{company.yearsActive}</span>
                        </div>
                      )}
                      {services.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>Servicios activos</span>
                          <span style={{ fontWeight: 'var(--weight-semibold)' }}>{activeServices.length}</span>
                        </div>
                      )}
                      {certs.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>Certificaciones</span>
                          <span style={{ fontWeight: 'var(--weight-semibold)' }}>{certs.length}</span>
                        </div>
                      )}
                      {projects.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>Casos destacados</span>
                          <span style={{ fontWeight: 'var(--weight-semibold)' }}>{projects.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}

          {/* ── Servicios tab ────────────────────────── */}
          {activeTab === 'services' && (
            <div>
              {activeServices.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Esta empresa no tiene servicios publicados.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                  {activeServices.map(svc => {
                    const imgs = svc.images ?? []
                    return (
                      <div key={svc.id} className="card" style={{ padding: 'var(--sp-6)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', marginBottom: imgs.length > 0 ? 'var(--sp-4)' : 0 }}>
                          <span style={{ color: 'var(--color-cta)', marginTop: 2, flexShrink: 0 }}><IconCheck size={16} /></span>
                          <div>
                            <p style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', fontSize: 'var(--text-base)' }}>{svc.name}</p>
                            {svc.description && (
                              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--sp-1)', lineHeight: 1.6 }}>{svc.description}</p>
                            )}
                          </div>
                        </div>
                        {imgs.length > 0 && (
                          <div className="img-grid" style={{ marginTop: 'var(--sp-2)' }}>
                            {imgs.map((img, idx) => (
                              <button
                                key={img.id}
                                className="img-thumb"
                                style={{ cursor: 'pointer', border: 'none' }}
                                onClick={() => setLightbox({ images: imgs.map(i => i.url), index: idx })}
                                aria-label={`Ver imagen ${idx + 1}`}
                              >
                                <img src={img.url} alt={img.altText ?? ''} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ marginTop: 'var(--sp-10)', display: 'flex', justifyContent: 'center' }}>
                <Link to={`/cotizar/${company.slug}`} className="btn btn-primary btn-lg">
                  Solicitar cotización
                  <IconArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

          {/* ── Casos tab ───────────────────────────── */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
              {projects.map(proj => {
                const imgs = proj.images ?? []
                return (
                  <div key={proj.id} className="card" style={{ padding: 'var(--sp-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-cta-light)', color: 'var(--color-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconFolderOpen size={18} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', fontSize: 'var(--text-base)' }}>{proj.title}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {[proj.clientName, proj.year].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    {proj.description && (
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: imgs.length > 0 ? 'var(--sp-4)' : 0 }}>
                        {proj.description}
                      </p>
                    )}
                    {imgs.length > 0 && (
                      <div className="img-grid">
                        {imgs.map((img, idx) => (
                          <button
                            key={img.id}
                            className="img-thumb"
                            style={{ cursor: 'pointer', border: 'none' }}
                            onClick={() => setLightbox({ images: imgs.map(i => i.url), index: idx })}
                            aria-label={`Ver imagen ${idx + 1}`}
                          >
                            <img src={img.url} alt={img.altText ?? ''} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Certificaciones tab ─────────────────── */}
          {activeTab === 'certs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', maxWidth: 640 }}>
              {certs.map(cert => {
                const expired = cert.expiresAt ? new Date(cert.expiresAt) < new Date() : false
                return (
                  <div key={cert.id} className="media-card">
                    <div className="media-card-icon" style={{ background: expired ? '#FEF2F2' : undefined, color: expired ? '#DC2626' : undefined }}>
                      <IconAward size={18} />
                    </div>
                    <div className="media-card-body">
                      <p className="media-card-title">{cert.name}</p>
                      <p className="media-card-meta">
                        {cert.issuer && <span>{cert.issuer}</span>}
                        {cert.issuedAt && <span> · Emitida {formatDate(cert.issuedAt)}</span>}
                        {cert.expiresAt && (
                          <span style={{ color: expired ? '#DC2626' : undefined }}>
                            {' '}· {expired ? 'Venció' : 'Vence'} {formatDate(cert.expiresAt)}
                          </span>
                        )}
                      </p>
                      {cert.documentUrl && (
                        <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-cta)', marginTop: 'var(--sp-1)', display: 'inline-block' }}>
                          Ver documento →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Lightbox ──────────────────────────────── */}
      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imágenes"
        >
          <button
            onClick={closeLightbox}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Cerrar"
          >
            <IconX size={18} />
          </button>

          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
          />

          {lightbox.images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); moveLightbox(-1) }}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                onClick={e => { e.stopPropagation(); moveLightbox(1) }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}
                aria-label="Siguiente"
              >
                ›
              </button>
              <p style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', fontSize: 'var(--text-sm)' }}>
                {lightbox.index + 1} / {lightbox.images.length}
              </p>
            </>
          )}
        </div>
      )}

      <Footer />
    </>
  )
}
