import { Link } from 'react-router-dom'
import { IconLogoPipe } from './Icons'
import { CATEGORIES } from '../data/mockData'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" aria-label="Pie de página">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="navbar-logo" style={{ marginBottom: 0 }}>
              <div className="navbar-logo-icon">
                <IconLogoPipe size={18} />
              </div>
              <span className="navbar-logo-text" style={{ color: '#fff' }}>
                Pro<span>Industrial</span>
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
              {CATEGORIES.slice(0, 5).map(cat => (
                <Link key={cat.slug} to={`/servicios/${cat.slug}`} className="footer-link">
                  {cat.name}
                </Link>
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
              <a href="mailto:hola@proindustrial.cl" className="footer-link">
                hola@proindustrial.cl
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
          <p>© {year} ProIndustrial. Todos los derechos reservados.</p>
          <p>Hecho en Chile para la industria</p>
        </div>
      </div>
    </footer>
  )
}
