import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { IconShield, IconInbox, IconLogOut } from '../../components/Icons'
import { getAdminMe } from '../../api/client'
import type { AdminMeResponse } from '../../types'

function getToken(): string | null {
  return localStorage.getItem('adminToken')
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const token = getToken()
  const [admin, setAdmin] = useState<AdminMeResponse | null>(null)

  useEffect(() => {
    if (!token) return
    getAdminMe().then(setAdmin).catch(() => {
      localStorage.removeItem('adminToken')
      navigate('/admin/login', { replace: true })
    })
  }, [token, navigate])

  if (!token) return <Navigate to="/admin/login" replace />

  const logout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  return (
    <div className="panel-layout">
      <nav className="panel-sidebar" aria-label="Backoffice admin">
        <div className="panel-sidebar-logo">
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#fff', letterSpacing: '0.02em' }}>
            PUNTO<span style={{ color: 'var(--color-accent)' }}>FUSIÓN</span>
          </span>
        </div>

        {admin && (
          <div className="panel-sidebar-company">
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 'var(--sp-2)' }}>
              <IconShield size={15} />
            </div>
            <p className="panel-sidebar-company-name">Administrador</p>
            <p className="panel-sidebar-company-role">{admin.email}</p>
          </div>
        )}

        <div className="panel-nav">
          <p className="panel-nav-section">Moderación</p>
          <NavLink to="/admin/registros" className={({ isActive }) => `panel-nav-item${isActive ? ' active' : ''}`}>
            <IconInbox size={17} />
            Registros
          </NavLink>
          <NavLink to="/admin/cambiar-contrasena" className={({ isActive }) => `panel-nav-item${isActive ? ' active' : ''}`}>
            <IconShield size={17} />
            Cambiar contraseña
          </NavLink>
        </div>

        <div className="panel-nav-footer">
          <NavLink to="/" className="panel-nav-item" style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>
            ← Ver sitio público
          </NavLink>
          <button className="panel-nav-item" onClick={logout} style={{ marginTop: 'var(--sp-1)' }}>
            <IconLogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main className="panel-main">
        <Outlet />
      </main>

      <nav className="panel-bottom-nav" aria-label="Navegación móvil admin">
        <NavLink to="/admin/registros" className={({ isActive }) => `panel-bottom-nav-item${isActive ? ' active' : ''}`}>
          <IconInbox size={20} />
          Registros
        </NavLink>
        <button className="panel-bottom-nav-item" onClick={logout}>
          <IconLogOut size={20} />
          Salir
        </button>
      </nav>
    </div>
  )
}
