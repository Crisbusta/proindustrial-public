import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { IconLogoPipe, IconCheck, IconEye, IconEyeOff } from '../../components/Icons'
import { login } from '../../api/client'

const DEMO_ACCOUNTS = [
  { email: 'contacto@acerospacifico.cl', label: 'Proveedora Aceros del Pacífico' },
  { email: 'proyectos@tuberiasdelsur.cl', label: 'Tuberías del Sur S.A.' },
  { email: 'info@electroindustrial.cl', label: 'Electro Industrial SpA' },
]

const FEATURES = [
  'Gestiona el perfil público de tu empresa',
  'Publica y administra tus servicios',
  'Recibe solicitudes de cotización directo',
  'Visibilidad ante compradores de todo Chile',
]

export default function PanelLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    try {
      const response = await login(email.trim().toLowerCase(), password)
      localStorage.setItem('panelToken', response.token)
      navigate(response.mustChangePassword ? '/panel/cambiar-contrasena' : '/panel/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-login-layout">
      {/* Brand side */}
      <div className="panel-login-brand">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-12)' }}>
            <div className="navbar-logo-icon" style={{ width: 40, height: 40 }}>
              <IconLogoPipe size={22} />
            </div>
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: '#fff', letterSpacing: '-0.01em' }}>
              Pro<span style={{ color: 'var(--color-accent)' }}>Industrial</span>
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 'var(--weight-bold)', color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 'var(--sp-5)' }}>
            Panel de gestión para proveedores
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: 'var(--sp-10)' }}>
            Administra el perfil de tu empresa, publica tus servicios y recibe solicitudes de cotización de compradores industriales de todo Chile.
          </p>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ color: 'var(--color-accent)', flexShrink: 0 }}><IconCheck size={16} /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form side */}
      <div className="panel-login-form-area">
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 'var(--sp-8)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
              Acceder al panel
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
              Ingresa con tu cuenta de proveedor
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="contacto@empresa.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
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

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              aria-busy={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Verificando...' : 'Acceder al panel'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 'var(--sp-8)', padding: 'var(--sp-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-4)' }}>
              Cuentas de demo (contraseña: demo123)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  data-testid="demo-account-btn"
                  onClick={() => { setEmail(acc.email); setPassword('demo123') }}
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)', cursor: 'pointer', textAlign: 'left', transition: 'border-color var(--ease-fast), background var(--ease-fast)' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-cta)' }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)' }}
                >
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>{acc.label}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{acc.email}</p>
                </button>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 'var(--sp-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            ¿Tu empresa no está registrada?{' '}
            <Link to="/registrar" style={{ color: 'var(--color-cta)', fontWeight: 'var(--weight-medium)' }}>
              Regístrala aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
