import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconLogoPipe, IconShield, IconEye, IconEyeOff } from '../../components/Icons'
import { adminLogin } from '../../api/client'

const ADMIN_EMAIL = 'admin@proindustrial.local'
const ADMIN_PASSWORD = 'demo123'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState(ADMIN_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await adminLogin(email.trim().toLowerCase(), password)
      localStorage.setItem('adminToken', response.token)
      navigate('/admin/registros')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-login-layout">
      <div className="panel-login-brand">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-12)' }}>
            <div className="navbar-logo-icon" style={{ width: 40, height: 40 }}>
              <IconLogoPipe size={22} />
            </div>
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: '#fff' }}>
              Pro<span style={{ color: 'var(--color-accent)' }}>Industrial</span>
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 'var(--weight-bold)', color: '#fff', lineHeight: 1.15, marginBottom: 'var(--sp-5)' }}>
            Backoffice de aprobaciones
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
            Revisa registros pendientes, aprueba nuevas empresas proveedoras y habilita su acceso al panel.
          </p>
        </div>
      </div>

      <div className="panel-login-form-area">
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 'var(--sp-8)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '6px 12px', borderRadius: 999, background: '#FFF7ED', color: '#C2410C', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--sp-4)' }}>
              <IconShield size={14} />
              Acceso administrador
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
              Iniciar sesión
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
              Credenciales seed para entorno local.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div className="form-group">
              <label htmlFor="admin-email" className="form-label">Correo</label>
              <input
                id="admin-email"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password" className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)', fontSize: 'var(--text-sm)', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Ingresando...' : 'Entrar al backoffice'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
