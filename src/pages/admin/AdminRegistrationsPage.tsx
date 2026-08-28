import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconCheck, IconCopy, IconSend, IconShield, IconX } from '../../components/Icons'
import {
  approveRegistration,
  deleteApprovedCompany,
  fetchAdminRegistrations,
  rejectRegistration,
  resendCredentials,
} from '../../api/client'
import { LIMITS } from '../../constants/limits'
import type { AdminApprovalResponse, AdminRegistration, EmailDeliveryStatus } from '../../types'

type Filter = 'pending' | 'approved' | 'rejected'
type Action = 'approve' | 'reject' | 'delete-approved' | 'resend'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'rejected', label: 'Rechazados' },
]

const STATUS_LABELS: Record<Filter, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

const EMAIL_LABELS: Record<EmailDeliveryStatus, string> = {
  sent: 'Enviado',
  failed: 'No enviado',
  logged: 'Sin proveedor de correo configurado',
  pending: 'Envío en curso',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/** Copy de la confirmación de cada acción irreversible. */
const CONFIRMATIONS: Record<Action, (name: string, email: string) => { title: string; body: string; cta: string }> = {
  approve: (name, email) => ({
    title: `¿Aprobar a ${name}?`,
    body: `Se creará la empresa en el directorio público, se generará un usuario para ${email} y se le enviará su contraseña inicial por correo. Deshacerlo requiere eliminar la empresa.`,
    cta: 'Sí, aprobar y crear acceso',
  }),
  reject: name => ({
    title: `¿Rechazar a ${name}?`,
    body: 'El registro saldrá de la cola de pendientes. Si dejas activado el aviso, el proveedor recibirá un correo con el motivo que escribas.',
    cta: 'Sí, rechazar',
  }),
  'delete-approved': name => ({
    title: `¿Eliminar por completo a ${name}?`,
    body: 'Se borrará la empresa, su usuario, las solicitudes de cotización asociadas y el registro. Esta acción no se puede deshacer.',
    cta: 'Sí, eliminar todo',
  }),
  resend: (name, email) => ({
    title: `¿Generar un acceso nuevo para ${name}?`,
    body: `Se creará una contraseña inicial nueva y se enviará a ${email}. La contraseña anterior dejará de funcionar.`,
    cta: 'Sí, reenviar acceso',
  }),
}

export default function AdminRegistrationsPage() {
  const [filter, setFilter] = useState<Filter>('pending')
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [approval, setApproval] = useState<AdminApprovalResponse | null>(null)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [pending, setPending] = useState<Action | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [notifyOnReject, setNotifyOnReject] = useState(true)

  // El filtro vigente se guarda en una ref para poder descartar respuestas
  // rezagadas: sin esto, una petición lenta lanzada bajo "Pendientes" podía
  // pisar la lista después de que el admin ya había cambiado de pestaña.
  const filterRef = useRef(filter)
  filterRef.current = filter

  const load = useCallback((target: Filter, signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    return fetchAdminRegistrations(target, signal)
      .then(data => {
        if (filterRef.current !== target) return
        setRegistrations(data)
        // No saltar a otro registro: si el que estaba abierto ya no está en
        // la lista, se cierra el detalle. Antes se seleccionaba data[0], y el
        // botón "Aprobar" quedaba sobre una empresa que nadie había revisado.
        setSelectedId(current => (current && data.some(reg => reg.id === current) ? current : null))
      })
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'No fue posible cargar los registros')
      })
      .finally(() => {
        if (filterRef.current === target) setLoading(false)
      })
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    load(filter, ctrl.signal)
    return () => ctrl.abort()
  }, [filter, load])

  const selected = useMemo(
    () => registrations.find(reg => reg.id === selectedId) ?? null,
    [registrations, selectedId],
  )

  useEffect(() => {
    setDescExpanded(false)
  }, [selectedId])

  const runAction = async (action: Action) => {
    if (!selected || busy) return
    setBusy(true)
    setError('')
    try {
      if (action === 'approve') {
        setApproval(await approveRegistration(selected.id))
        setPasswordVisible(false)
      } else if (action === 'resend') {
        setApproval(await resendCredentials(selected.id))
        setPasswordVisible(false)
      } else if (action === 'delete-approved') {
        await deleteApprovedCompany(selected.id)
        setApproval(null)
      } else {
        const rejected = await rejectRegistration(selected.id, rejectReason.trim(), notifyOnReject)
        if (notifyOnReject && rejected.emailStatus && rejected.emailStatus !== 'sent') {
          setError(
            `Se rechazó el registro, pero el aviso por correo no salió (${rejected.emailStatus}). ` +
            `Contacta a ${selected.email} por otro medio si corresponde.`,
          )
        }
      }
      await load(filterRef.current)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible procesar el registro')
      // Un 409 significa que el estado real ya cambió (otro admin, o un
      // reintento): recargar deja la lista consistente con el servidor.
      if (typeof err === 'object' && err !== null && (err as { status?: number }).status === 409) {
        await load(filterRef.current)
      }
    } finally {
      setBusy(false)
    }
  }

  const confirmAndRun = (action: Action) => {
    if (!selected || busy) return
    if (action === 'reject') {
      setRejectReason('')
      setNotifyOnReject(true)
    }
    setPending(action)
  }

  const copyPassword = async () => {
    if (!approval) return
    try {
      await navigator.clipboard.writeText(approval.initialPassword)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setPasswordVisible(true)
    }
  }

  const services = selected?.services ?? []
  const description = selected?.description ?? ''
  const descriptionIsLong = description.length > LIMITS.description.max
  const emailStatus = approval?.emailStatus
  const emailOk = emailStatus === 'sent'
  const dialog = pending && selected ? CONFIRMATIONS[pending](selected.companyName, selected.email) : null

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
          <div
            role="status"
            style={{
              background: emailOk ? '#F0FDF4' : '#FFFBEB',
              border: `1px solid ${emailOk ? '#86EFAC' : '#FCD34D'}`,
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--sp-4) var(--sp-5)',
              marginBottom: 'var(--sp-6)',
              color: emailOk ? '#166534' : '#92400E',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>
                Acceso generado para {approval.company.name}
              </p>
              <button
                type="button"
                onClick={() => setApproval(null)}
                aria-label="Cerrar aviso"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
              >
                <IconX size={16} />
              </button>
            </div>

            <p style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>
              Usuario: <strong>{approval.user.email}</strong>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-sm)' }}>Contraseña inicial:</span>
              <code style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', letterSpacing: '0.04em' }}>
                {passwordVisible ? approval.initialPassword : '••••••••••••'}
              </code>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPasswordVisible(v => !v)}>
                {passwordVisible ? 'Ocultar' : 'Mostrar'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={copyPassword}>
                <IconCopy size={14} />
                {copied ? 'Copiada' : 'Copiar'}
              </button>
            </div>

            {emailStatus && (
              <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--sp-3)' }}>
                Correo de acceso: <strong>{EMAIL_LABELS[emailStatus]}</strong>
                {approval.emailNote ? ` — ${approval.emailNote}` : ''}
                {!emailOk && ' Entrega la contraseña por otro medio o usa "Reenviar acceso".'}
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
              disabled={busy}
            >
              {item.label}
              {filter === item.key && !loading ? ` (${registrations.length})` : ''}
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
                  disabled={busy}
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${selectedId === reg.id ? 'var(--color-cta)' : 'var(--color-border)'}`,
                    background: selectedId === reg.id ? 'var(--color-cta-light)' : 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--sp-4)',
                    cursor: busy ? 'default' : 'pointer',
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>{reg.companyName}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>{reg.email}</p>
                    </div>
                    <span className={`status-badge ${reg.status}`}>{STATUS_LABELS[reg.status]}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-3)' }}>
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
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)', padding: '6px 12px', borderRadius: 999, background: '#EFF6FF', color: '#1D4ED8', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--sp-3)' }}>
                      <IconShield size={13} />
                      Registro {STATUS_LABELS[selected.status].toLowerCase()}
                    </div>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>{selected.companyName}</h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>{selected.email}</p>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDate(selected.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)' }}>Teléfono</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{selected.phone ?? 'No informado'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)' }}>Región</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{selected.region ?? 'No informada'}</p>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-6)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-3)' }}>Servicios solicitados</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                    {services.length > 0 ? services.map(service => (
                      <span key={service} className="service-chip">{service}</span>
                    )) : (
                      <span style={{ fontSize: 'var(--text-sm)', color: '#92400E', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: 'var(--sp-2) var(--sp-3)' }}>
                        Sin servicios seleccionados: si la apruebas así, la empresa no aparecerá en ninguna categoría del directorio.
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--sp-6)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-3)' }}>
                    Descripción
                    <span style={{ textTransform: 'none', letterSpacing: 0, marginLeft: 'var(--sp-2)' }}>
                      ({description.length} caracteres)
                    </span>
                  </p>
                  <p
                    className={descExpanded ? undefined : 'registration-description'}
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
                  >
                    {description || 'No se incluyó descripción.'}
                  </p>
                  {description.length > 400 && (
                    <button
                      type="button"
                      onClick={() => setDescExpanded(v => !v)}
                      style={{ background: 'none', border: 'none', padding: 0, marginTop: 'var(--sp-2)', color: 'var(--color-cta)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}
                    >
                      {descExpanded ? 'Contraer descripción' : 'Ver descripción completa'}
                    </button>
                  )}
                  {descriptionIsLong && selected.status === 'pending' && (
                    <p style={{ fontSize: 'var(--text-sm)', color: '#92400E', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3)', marginTop: 'var(--sp-3)' }}>
                      Esta descripción supera el límite de {LIMITS.description.max} caracteres. Al aprobar se recortará automáticamente a los primeros {LIMITS.description.max} en la ficha pública.
                    </p>
                  )}
                </div>

                {selected.status === 'pending' && (
                  <div className="registration-actions">
                    <button type="button" className="btn btn-primary" onClick={() => confirmAndRun('approve')} disabled={busy}>
                      <IconCheck size={16} />
                      Aprobar y crear acceso
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => confirmAndRun('reject')} disabled={busy}>
                      <IconX size={16} />
                      Rechazar
                    </button>
                  </div>
                )}

                {selected.status === 'approved' && (
                  <div className="registration-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => confirmAndRun('resend')} disabled={busy}>
                      <IconSend size={16} />
                      Reenviar acceso
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => confirmAndRun('delete-approved')}
                      disabled={busy}
                      style={{ background: '#FEF2F2', borderColor: '#FCA5A5', color: '#B91C1C' }}
                    >
                      <IconX size={16} />
                      Eliminar empresa aprobada
                    </button>
                  </div>
                )}

                {selected.status === 'rejected' && (
                  <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-4)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)' }}>
                      Motivo del rechazo
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      {selected.rejectionReason ?? 'No se registró un motivo.'}
                    </p>
                    {selected.rejectedAt && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)' }}>
                        Rechazado el {formatDate(selected.rejectedAt)}
                      </p>
                    )}
                  </div>
                )}

                {selected.emailStatus && selected.status === 'approved' && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-3)' }}>
                    Último envío del correo de acceso: {EMAIL_LABELS[selected.emailStatus]}
                    {selected.emailNote ? ` — ${selected.emailNote}` : ''}
                  </p>
                )}
              </>
            ) : (
              <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Selecciona un registro para revisar su detalle.
              </div>
            )}
          </section>
        </div>
      </div>

      {dialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dialog.title}
          onClick={() => setPending(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-4)', zIndex: 100 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 460, padding: 'var(--sp-6)' }}
          >
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-3)' }}>
              {dialog.title}
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--sp-5)' }}>
              {dialog.body}
            </p>

            {pending === 'reject' && (
              <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
                <label htmlFor="reject-reason" className="form-label">Motivo del rechazo (opcional)</label>
                <textarea
                  id="reject-reason"
                  className="form-textarea"
                  rows={3}
                  autoFocus
                  maxLength={LIMITS.rejectionReason.max}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Ej: la empresa no opera en las categorías del directorio; datos de contacto no verificables."
                />
                <p className="form-hint">{rejectReason.length}/{LIMITS.rejectionReason.max} caracteres</p>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifyOnReject}
                    onChange={e => setNotifyOnReject(e.target.checked)}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <span>
                    Avisar al proveedor por correo
                    <span style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', marginTop: 2 }}>
                      Se enviará a {selected?.email} e incluirá el motivo si escribiste uno.
                    </span>
                  </span>
                </label>
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPending(null)} disabled={busy}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => {
                  const action = pending
                  setPending(null)
                  if (action) void runAction(action)
                }}
              >
                {dialog.cta}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
