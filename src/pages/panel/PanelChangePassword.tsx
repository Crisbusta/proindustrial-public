import { FormEvent, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { IconCheck, IconShield, IconEye, IconEyeOff } from '../../components/Icons'
import { changePassword, getMe } from '../../api/client'

function getToken(): string | null {
  return localStorage.getItem('panelToken')
}

export default function PanelChangePassword() {
  const navigate = useNavigate()
  const token = getToken()
  const [currentPassword, setCurrentPassword] = useState('demo123')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)

  useEffect(() => {
    if (!token) return
    getMe().then(me => {
      if (!me.mustChangePassword) {
        navigate('/panel/dashboard', { replace: true })
      }
    }).catch(() => {
      localStorage.removeItem('panelToken')
      navigate('/panel/login', { replace: true })
    })
  }, [token, navigate])

  if (!token) return <Navigate to="/panel/login" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmación no coincide.')
      return
    }

    setLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setSaved(true)
      setTimeout(() => navigate('/panel/dashboard', { replace: true }), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel-login-layout">
      <div className="panel-login-brand">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: '#fff', marginBottom: 'var(--sp-8)' }}>
            <IconShield size={14} />
            Cambio obligatorio
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 'var(--weight-bold)', color: '#fff', lineHeight: 1.15, marginBottom: 'var(--sp-5)' }}>
            Define tu contraseña definitiva
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
            Tu cuenta fue habilitada con una contraseña temporal. Antes de continuar, debes reemplazarla por una nueva clave.
          </p>
        </div>
      </div>

      <div className="panel-login-form-area">
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 'var(--sp-8)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
              Actualizar contraseña
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
              La contraseña nueva debe tener al menos 8 caracteres.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div className="form-group">
              <label htmlFor="current-password" className="form-label">Contraseña actual</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  className="form-input"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} aria-label="Mostrar u ocultar contraseña actual" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}>
                  {showCurrent ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-password" className="form-label">Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  className="form-input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowNew(v => !v)} aria-label="Mostrar u ocultar nueva contraseña" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}>
                  {showNew ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">Confirmar nueva contraseña</label>
              <input
                id="confirm-password"
                type={showNew ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)', fontSize: 'var(--text-sm)', color: '#DC2626' }}>
                {error}
              </div>
            )}

            {saved && (
              <div role="status" style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)', fontSize: 'var(--text-sm)', color: '#166534', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <IconCheck size={16} />
                Contraseña actualizada. Redirigiendo al panel...
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
