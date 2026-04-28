import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CompanyCard from '../components/CompanyCard'
import { fetchCompanies } from '../api/client'
import { IconSearch } from '../components/Icons'
import type { Company } from '../types'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') ?? ''
  const [inputVal, setInputVal] = useState(q)
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    fetchCompanies({ q: q.trim() })
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [q])

  useEffect(() => {
    setInputVal(q)
  }, [q])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = inputVal.trim()
    if (v) navigate(`/buscar?q=${encodeURIComponent(v)}`)
  }

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--color-primary)', padding: 'var(--sp-12) 0 var(--sp-10)' }}>
          <div className="container">
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: '#fff', marginBottom: 'var(--sp-6)' }}>
              Buscar empresas y servicios
            </h1>
            <form onSubmit={handleSubmit} role="search" aria-label="Buscar empresas">
              <div style={{ position: 'relative', maxWidth: 560 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none', display: 'flex' }}>
                  <IconSearch size={18} />
                </span>
                <input
                  ref={inputRef}
                  type="search"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Ej: termofusión, geomembrana, válvulas..."
                  style={{
                    width: '100%', padding: '14px 48px 14px 44px', fontSize: 'var(--text-base)',
                    borderRadius: 'var(--radius-md)', border: 'none', outline: 'none',
                    background: '#fff', color: 'var(--color-text)', boxSizing: 'border-box',
                  }}
                  autoFocus
                  aria-label="Término de búsqueda"
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    background: 'var(--color-cta)', color: '#fff', border: 'none',
                    borderRadius: 'var(--radius-sm)', padding: '8px 16px',
                    fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer',
                  }}
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="container" style={{ padding: 'var(--sp-10) var(--sp-4)' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : q.trim() ? (
            <>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-6)' }}>
                {results.length === 0
                  ? `Sin resultados para "${q}"`
                  : `${results.length} empresa${results.length !== 1 ? 's' : ''} encontrada${results.length !== 1 ? 's' : ''} para "${q}"`}
              </p>
              {results.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
                  {results.map(c => <CompanyCard key={c.id} company={c} />)}
                </div>
              ) : (
                <div className="empty-state" style={{ marginTop: 'var(--sp-16)' }}>
                  <div className="empty-state-icon"><IconSearch size={40} /></div>
                  <h3>Sin resultados</h3>
                  <p>Intenta con otras palabras clave o navega por categorías.</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ marginTop: 'var(--sp-16)' }}>
              <div className="empty-state-icon"><IconSearch size={40} /></div>
              <h3>Escribe para buscar</h3>
              <p>Busca por nombre de empresa, servicio o categoría.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
