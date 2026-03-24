import { useEffect, useMemo, useState } from 'react'
import { IconCheck, IconShield, IconX } from '../../components/Icons'
import { approveRegistration, deleteApprovedCompany, fetchAdminRegistrations, rejectRegistration } from '../../api/client'
import type { AdminApprovalResponse, AdminRegistration } from '../../types'

type Filter = 'pending' | 'approved' | 'rejected'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'rejected', label: 'Rechazados' },
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function AdminRegistrationsPage() {
  const [filter, setFilter] = useState<Filter>('pending')
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [approval, setApproval] = useState<AdminApprovalResponse | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    setApproval(null)
    fetchAdminRegistrations(filter)
      .then(data => {
        setRegistrations(data)
        setSelectedId(current => current && data.some(reg => reg.id === current) ? current : data[0]?.id ?? null)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'No fue posible cargar los registros'))
      .finally(() => setLoading(false))
  }, [filter])

  const selected = useMemo(
    () => registrations.find(reg => reg.id === selectedId) ?? null,
    [registrations, selectedId],
  )

  const runAction = async (action: 'approve' | 'reject' | 'delete-approved') => {
    if (!selected) return
    if (action === 'delete-approved') {
      const confirmed = window.confirm(`Eliminar por completo la empresa aprobada ${selected.companyName}? Esta acción borra empresa, usuario, solicitudes asociadas y el registro.`)
      if (!confirmed) return
    }
    setWorkingId(selected.id)
    setError('')
    try {
      if (action === 'approve') {
        const result = await approveRegistration(selected.id)
        setApproval(result)
      } else if (action === 'delete-approved') {
        await deleteApprovedCompany(selected.id)
        setApproval(null)
      } else {
        await rejectRegistration(selected.id)
      }

      const next = await fetchAdminRegistrations(filter)
      setRegistrations(next)
      setSelectedId(next[0]?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible procesar el registro')
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <>
      <div className="panel-topbar">
        <span className="panel-topbar-title">Registros de empresas</span>
      </div>

      <div className="panel-content">
        <div style={{ marginBottom: 'var(--sp-7)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
            Revisión de proveedores
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
            Aprueba registros pendientes para crear la empresa y habilitar su acceso al panel.
          </p>
        </div>

        {approval && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-4) var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: '#166534' }}>
              Registro aprobado: {approval.company.name}
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: '#166534', marginTop: 4 }}>
              Login habilitado para <strong>{approval.user.email}</strong> con contraseña inicial <strong>{approval.initialPassword}</strong>.
            </p>
            {approval.emailNote && (
              <p style={{ fontSize: 'var(--text-sm)', color: '#166534', marginTop: 4 }}>
                Estado del correo: <strong>{approval.emailStatus}</strong>. {approval.emailNote}
              </p>
            )}
          </div>
        )}

        {error && (
          <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-4) var(--sp-5)', marginBottom: 'var(--sp-6)', color: '#B91C1C', fontSize: 'var(--text-sm)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-6)', flexWrap: 'wrap' }}>
          {FILTERS.map(item => (
            <button
              key={item.key}
              type="button"
              className={`btn ${filter === item.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={`inbox-panels${selectedId ? ' detail-open' : ''}`}>
          <section className="card inbox-list" style={{ padding: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {loading && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Cargando registros...</p>}
              {!loading && registrations.length === 0 && (
                <div style={{ padding: 'var(--sp-5)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No hay registros en este estado.
                </div>
              )}
              {registrations.map(reg => (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => setSelectedId(reg.id)}
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${selectedId === reg.id ? 'var(--color-cta)' : 'var(--color-border)'}`,
                    background: selectedId === reg.id ? 'var(--color-cta-light)' : 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--sp-4)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>{reg.companyName}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{reg.email}</p>
                    </div>
                    <span className={`status-badge ${reg.status}`}>{reg.status}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--sp-3)' }}>
                    {reg.region ?? 'Sin región'} · {formatDate(reg.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="card inbox-detail" style={{ padding: 'var(--sp-6)' }}>
            {selected ? (
              <>
                <button className="inbox-back-btn" onClick={() => setSelectedId(null)}>
                  ← Volver a registros
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-4)', alignItems: 'flex-start', marginBottom: 'var(--sp-6)' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '6px 12px', borderRadius: 999, background: '#EFF6FF', color: '#1D4ED8', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--sp-3)' }}>
                      <IconShield size={13} />
                      Registro {selected.status}
                    </div>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>{selected.companyName}</h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>{selected.email}</p>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {formatDate(selected.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-2)' }}>Teléfono</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{selected.phone ?? 'No informado'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-2)' }}>Región</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{selected.region ?? 'No informada'}</p>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-6)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-3)' }}>Servicios solicitados</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                    {selected.services.length > 0 ? selected.services.map(service => (
                      <span key={service} className="service-chip">{service}</span>
                    )) : (
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Sin servicios seleccionados</span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-7)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-3)' }}>Descripción</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                    {selected.description ?? 'No se incluyó descripción.'}
                  </p>
                </div>

                {selected.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => runAction('approve')}
                      disabled={workingId === selected.id}
                    >
                      <IconCheck size={16} />
                      Aprobar y crear acceso
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => runAction('reject')}
                      disabled={workingId === selected.id}
                    >
                      <IconX size={16} />
                      Rechazar
                    </button>
                  </div>
                )}

                {selected.status === 'approved' && (
                  <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => runAction('delete-approved')}
                      disabled={workingId === selected.id}
                      style={{ background: '#FEF2F2', borderColor: '#FCA5A5', color: '#B91C1C' }}
                    >
                      <IconX size={16} />
                      Eliminar empresa aprobada
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Selecciona un registro para revisar su detalle.
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
