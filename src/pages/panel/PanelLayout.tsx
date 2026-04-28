import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom'
import {
  IconLayoutDashboard, IconUser,
  IconPackage, IconLogOut, IconInbox, IconAward, IconFolderOpen
} from '../../components/Icons'
import { getMe } from '../../api/client'
import type { Company } from '../../types'

function getToken(): string | null {
  return localStorage.getItem('panelToken')
}

export default function PanelLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = getToken()
  const [company, setCompany] = useState<Company | null>(null)
  const [mustChangePassword, setMustChangePassword] = useState(false)

  useEffect(() => {
    if (!token) return
    getMe().then(me => {
      setCompany(me.company)
      setMustChangePassword(me.mustChangePassword)
      if (me.mustChangePassword && location.pathname !== '/panel/cambiar-contrasena') {
        navigate('/panel/cambiar-contrasena', { replace: true })
      }
    }).catch(() => {
      localStorage.removeItem('panelToken')
      navigate('/panel/login', { replace: true })
    })
  }, [token, navigate, location.pathname])

  if (!token) return <Navigate to="/panel/login" replace />
  if (mustChangePassword && location.pathname !== '/panel/cambiar-contrasena') {
    return <Navigate to="/panel/cambiar-contrasena" replace />
  }

  const logout = () => {
    localStorage.removeItem('panelToken')
    navigate('/panel/login')
  }

  const navItems = [
    { to: '/panel/dashboard', label: 'Resumen', Icon: IconLayoutDashboard },
    { to: '/panel/solicitudes', label: 'Solicitudes', Icon: IconInbox },
    { to: '/panel/servicios', label: 'Mis servicios', Icon: IconPackage },
    { to: '/panel/certificaciones', label: 'Certificaciones', Icon: IconAward },
    { to: '/panel/casos', label: 'Casos destacados', Icon: IconFolderOpen },
    { to: '/panel/perfil', label: 'Perfil de empresa', Icon: IconUser },
  ]

  return (
    <div className="panel-layout">
      {/* Sidebar */}
      <nav className="panel-sidebar" aria-label="Panel de gestión">
        {/* Logo */}
        <div className="panel-sidebar-logo">
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#fff', letterSpacing: '0.02em' }}>
            PUNTO<span style={{ color: 'var(--color-accent)' }}>FUSIÓN</span>
          </span>
        </div>

        {/* Company info */}
        {company && (
          <div className="panel-sidebar-company">
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: '#fff', marginBottom: 'var(--sp-2)' }}>
              {company.name.charAt(0)}
            </div>
            <p className="panel-sidebar-company-name">{company.name}</p>
            <p className="panel-sidebar-company-role">Proveedor</p>
          </div>
        )}

        {/* Nav */}
        <div className="panel-nav">
          <p className="panel-nav-section">Gestión</p>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `panel-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="panel-nav-footer">
          <NavLink
            to="/"
            className="panel-nav-item"
            style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}
          >
            ← Ver sitio público
          </NavLink>
          <button className="panel-nav-item" onClick={logout} style={{ marginTop: 'var(--sp-1)' }}>
            <IconLogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="panel-main">
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ─────────────────────────── */}
      <nav className="panel-bottom-nav" aria-label="Navegación móvil del panel">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `panel-bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={20} />
            {label.replace('Perfil de empresa', 'Perfil')}
          </NavLink>
        ))}
        <button className="panel-bottom-nav-item" onClick={logout}>
          <IconLogOut size={20} />
          Salir
        </button>
      </nav>

    </div>
  )
}
