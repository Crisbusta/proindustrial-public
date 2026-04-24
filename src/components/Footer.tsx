import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategoryGroups } from '../api/client'
import type { CategoryGroup } from '../types'

export default function Footer() {
  const year = new Date().getFullYear()
  const [groups, setGroups] = useState<CategoryGroup[]>([])

  useEffect(() => {
    fetchCategoryGroups().then(setGroups).catch(() => {})
  }, [])

  return (
    <footer className="footer" aria-label="Pie de página">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" style={{ textDecoration: 'none', marginBottom: 0, display: 'inline-block' }}>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: '#fff', letterSpacing: '0.02em' }}>
                PUNTO<span style={{ color: 'var(--color-accent)' }}>FUSIÓN</span>
              </span>
            </Link>
            <p>
              Directorio de servicios industriales especializados para Chile.
              Conectamos compradores con proveedores técnicos calificados.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <p className="footer-col-title">Servicios</p>
            <nav className="footer-links" aria-label="Categorías de servicios">
              {groups.map(group => (
                <span key={group.slug} style={{ display: 'contents' }}>
                  <Link to={`/servicios/${group.slug}`} className="footer-link" style={{ fontWeight: 600 }}>
                    {group.name}
                  </Link>
                  {group.subcategories.map(sub => (
                    <Link key={sub.slug} to={`/servicios/${group.slug}/${sub.slug}`} className="footer-link" style={{ paddingLeft: '0.75rem' }}>
                      {sub.name}
                    </Link>
                  ))}
                </span>
              ))}
            </nav>
          </div>

          {/* Plataforma */}
          <div>
            <p className="footer-col-title">Plataforma</p>
            <nav className="footer-links" aria-label="Secciones de la plataforma">
              <Link to="/" className="footer-link">Inicio</Link>
              <Link to="/cotizar" className="footer-link">Solicitar cotización</Link>
              <Link to="/registrar" className="footer-link">Registrar mi empresa</Link>
              <span className="footer-link" style={{ cursor: 'default', opacity: 0.5 }}>
                Preguntas frecuentes
              </span>
            </nav>
          </div>

          {/* Contacto */}
          <div>
            <p className="footer-col-title">Contacto</p>
            <div className="footer-links">
              <a href="mailto:hola@puntofusion.cl" className="footer-link">
                hola@puntofusion.cl
              </a>
              <span className="footer-link" style={{ cursor: 'default', opacity: 0.5 }}>
                +56 2 2xxx xxxx
              </span>
              <span className="footer-link" style={{ cursor: 'default', opacity: 0.5 }}>
                Santiago, Chile
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} PuntoFusión. Todos los derechos reservados.</p>
          <p>Hecho en Chile para la industria</p>
        </div>
      </div>
    </footer>
  )
}
