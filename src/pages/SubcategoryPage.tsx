import { useState, useMemo } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import CompanyCard from '../components/CompanyCard'
import { CATEGORY_ICONS } from '../components/Icons'
import { getCategoryGroup, getSubcategory, getCompaniesByCategory, REGIONS } from '../data/mockData'

export default function SubcategoryPage() {
  const { groupSlug, subSlug } = useParams<{ groupSlug: string; subSlug: string }>()
  const [selectedRegion, setSelectedRegion] = useState('Todas las regiones')

  const group = groupSlug ? getCategoryGroup(groupSlug) : undefined
  const sub = groupSlug && subSlug ? getSubcategory(groupSlug, subSlug) : undefined

  const allCompanies = groupSlug ? getCompaniesByCategory(groupSlug) : []

  const filtered = useMemo(() => {
    if (selectedRegion === 'Todas las regiones') return allCompanies
    return allCompanies.filter(c => c.region === selectedRegion)
  }, [allCompanies, selectedRegion])

  if (!group || !sub) return <Navigate to="/" replace />

  const SubIcon = CATEGORY_ICONS[sub.icon] ?? CATEGORY_ICONS['building']

  return (
    <>
      <Navbar />

      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <div className="page-header-top">
            <Breadcrumb crumbs={[
              { label: 'Inicio', to: '/' },
              { label: group.name, to: '/#categorias' },
              { label: sub.name },
            ]} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-5)', marginTop: 'var(--sp-5)' }}>
            <div className="category-card-icon" style={{ width: 52, height: 52, flexShrink: 0 }} aria-hidden="true">
              <SubIcon size={26} />
            </div>
            <div>
              <p className="label-sm" style={{ marginBottom: 'var(--sp-1)' }}>{group.name}</p>
              <h1 className="page-title">{sub.name}</h1>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)', maxWidth: 600, lineHeight: 1.65 }}>
                {sub.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main>
        <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-16)' }}>

          {/* Filter Bar */}
          <div className="filter-bar">
            <label htmlFor="region-filter" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
              Filtrar por región:
            </label>
            <select
              id="region-filter"
              className="filter-select"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              aria-label="Filtrar empresas por región"
            >
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span className="filter-count">
              {filtered.length} {filtered.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}
            </span>
          </div>

          {/* Company Grid */}
          {filtered.length > 0 ? (
            <div className="grid-2" style={{ marginTop: 'var(--sp-6)' }}>
              {filtered.map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: 'var(--sp-6)' }}>
              <div className="empty-state-icon">
                <SubIcon size={48} />
              </div>
              <h3>No hay empresas en esta región</h3>
              <p>Prueba seleccionando "Todas las regiones" o envía una solicitud abierta.</p>
              <div style={{ marginTop: 'var(--sp-6)' }}>
                <Link to="/cotizar" className="btn btn-primary">
                  Solicitar cotización abierta
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
