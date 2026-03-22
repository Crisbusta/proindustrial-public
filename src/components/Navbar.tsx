import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { IconLogoPipe, IconMenu, IconX } from './Icons'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const navLinks = [
    { to: '/#categorias', label: 'Servicios' },
    { to: '/#como-funciona', label: '¿Cómo funciona?' },
    { to: '/registrar', label: 'Registrar empresa' },
  ]

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="ProIndustrial — inicio">
          <div className="navbar-logo-icon">
            <IconLogoPipe size={18} />
          </div>
          <span className="navbar-logo-text">
            Pro<span>Industrial</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-nav" aria-label="Navegación principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Inicio
          </NavLink>
          <span
            className="nav-link"
            onClick={() => {
              navigate('/')
              setTimeout(() => {
                document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
          >
            Servicios
          </span>
          <span
            className="nav-link"
            onClick={() => {
              navigate('/')
              setTimeout(() => {
                document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}
          >
            ¿Cómo funciona?
          </span>
          <NavLink
            to="/registrar"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Registrar empresa
          </NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          <Link to="/cotizar" className="btn btn-primary btn-sm">
            Solicitar cotización
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-menu-btn"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--nav-height)',
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--sp-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-1)',
            zIndex: 40,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block' }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--sp-2)' }}>
            <Link to="/cotizar" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>
              Solicitar cotización
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
