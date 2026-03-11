import { useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import {
  IconLogoPipe, IconLayoutDashboard, IconUser,
  IconPackage, IconLogOut, IconInbox
} from '../../components/Icons'
import { COMPANIES } from '../../data/mockData'

function getPanelAuth() {
  try {
    const raw = localStorage.getItem('panelAuth')
    return raw ? JSON.parse(raw) as { companyId: string; companySlug: string } : null
  } catch {
    return null
  }
}

export function usePanelCompany() {
  const auth = getPanelAuth()
  return auth ? COMPANIES.find(c => c.id === auth.companyId) ?? null : null
}

export default function PanelLayout() {
  const navigate = useNavigate()
  const auth = getPanelAuth()
  const company = auth ? COMPANIES.find(c => c.id === auth.companyId) : null

  useEffect(() => {
    if (!auth) navigate('/panel/login', { replace: true })
  }, [auth, navigate])

  if (!auth) return <Navigate to="/panel/login" replace />

  const logout = () => {
    localStorage.removeItem('panelAuth')
    navigate('/panel/login')
  }

  const navItems = [
    { to: '/panel/dashboard', label: 'Resumen', Icon: IconLayoutDashboard },
    { to: '/panel/solicitudes', label: 'Solicitudes', Icon: IconInbox },
    { to: '/panel/servicios', label: 'Mis servicios', Icon: IconPackage },
    { to: '/panel/perfil', label: 'Perfil de empresa', Icon: IconUser },
  ]

  return (
    <div className="panel-layout">
      {/* Sidebar */}
      <nav className="panel-sidebar" aria-label="Panel de gestión">
        {/* Logo */}
        <div className="panel-sidebar-logo">
          <div className="navbar-logo-icon" style={{ width: 30, height: 30 }}>
            <IconLogoPipe size={16} />
          </div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#fff', letterSpacing: '-0.01em' }}>
            Pro<span style={{ color: 'var(--color-accent)' }}>Industrial</span>
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
    </div>
  )
}
