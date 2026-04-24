import { useState, useEffect } from 'react'
import { IconInbox, IconMapPin, IconMail, IconPhone, IconMessageCircle, IconCheck, IconCopy } from '../../components/Icons'
import { fetchPanelQuotes, fetchPanelProfile, updateQuoteStatus, closeQuote } from '../../api/client'
import type { Company, QuoteRequestResponse } from '../../types'

type Status  = QuoteRequestResponse['status']
type Outcome = NonNullable<QuoteRequestResponse['outcome']>

const STATUS_LABELS: Record<Status, string> = {
  new: 'Nueva', read: 'Pendiente', responded: 'Contactada',
}
const STATUS_COLORS: Record<Status, { bg: string; color: string }> = {
  new:       { bg: '#EFF6FF', color: '#1D4ED8' },
  read:      { bg: '#FFF7ED', color: '#C2410C' },
  responded: { bg: '#F0FDF4', color: '#15803D' },
}

type OutcomeMeta = { label: string; description: string; color: string; bg: string }
const OUTCOMES: Record<Outcome, OutcomeMeta> = {
  won:         { label: 'Trabajo adjudicado',          description: 'El cliente aceptó nuestra propuesta',          color: '#15803D', bg: '#F0FDF4' },
  negotiating: { label: 'En negociación',              description: 'Estamos en conversaciones activas',            color: '#1D4ED8', bg: '#EFF6FF' },
  lost_price:  { label: 'Perdida por precio',          description: 'El cliente eligió una oferta más económica',   color: '#B45309', bg: '#FFFBEB' },
  lost_other:  { label: 'Adj. a otro proveedor',       description: 'El cliente eligió a otro proveedor',           color: '#9333EA', bg: '#FAF5FF' },
  no_response: { label: 'Sin respuesta del cliente',   description: 'El cliente no respondió después del contacto', color: '#6B7280', bg: '#F9FAFB' },
  cancelled:   { label: 'Proyecto cancelado',          description: 'El cliente canceló el proyecto',               color: '#DC2626', bg: '#FEF2F2' },
  no_capacity: { label: 'Sin capacidad disponible',    description: 'No pudimos tomar el trabajo',                  color: '#D97706', bg: '#FFFBEB' },
}

const TABS = [
  { key: 'all'       as const, label: 'Todas'      },
  { key: 'new'       as const, label: 'Nuevas'     },
  { key: 'read'      as const, label: 'Pendientes' },
  { key: 'responded' as const, label: 'Contactadas'},
  { key: 'closed'    as const, label: 'Cerradas'   },
]

const fmtDate  = (iso: string) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtShort = (iso: string) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })

function toWhatsAppNumber(phone: string): string {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('56') ? d : '56' + d
}

function buildWhatsApp(req: QuoteRequestResponse, companyName: string): string {
  if (!req.requesterPhone) return ''
  const msg = `Hola ${req.requesterName}, le contactamos de ${companyName} por su solicitud de cotización para ${req.service}${req.location ? ` en ${req.location}` : ''}. ¿Tiene disponibilidad para conversar?`
  return `https://wa.me/${toWhatsAppNumber(req.requesterPhone)}?text=${encodeURIComponent(msg)}`
}


export default function PanelInbox() {
  const [activeTab, setActiveTab]   = useState<typeof TABS[number]['key']>('new')
  const [requests, setRequests]     = useState<QuoteRequestResponse[]>([])
  const [myCompany, setMyCompany]   = useState<Company | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [emailCopied, setEmailCopied] = useState(false)

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    })
  }

  // close outcome state
  const [showClose,    setShowClose]    = useState(false)
  const [closeOutcome, setCloseOutcome] = useState<Outcome | ''>('')
  const [closeNote,    setCloseNote]    = useState('')
  const [closing,      setClosing]      = useState(false)
  const [closeError,   setCloseError]   = useState('')

  useEffect(() => {
    Promise.all([fetchPanelQuotes(), fetchPanelProfile()])
      .then(([qs, company]) => {
        setRequests(qs)
        setMyCompany(company)
        if (qs.length > 0) setSelectedId(qs[0].id)
      }).catch(() => {})
  }, [])

  const filtered = (() => {
    if (activeTab === 'all')    return requests
    if (activeTab === 'closed') return requests.filter(r => r.outcome !== null)
    return requests.filter(r => r.status === activeTab && r.outcome === null)
  })()

  const selected = filtered.find(r => r.id === selectedId) ?? null

  const update = (id: string, patch: Partial<QuoteRequestResponse>) =>
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))

  const handleSelect = (req: QuoteRequestResponse) => {
    setSelectedId(req.id)
    setEmailCopied(false)
    setShowClose(false)
    setCloseOutcome('')
    setCloseNote('')
    setCloseError('')
    if (req.status === 'new') {
      updateQuoteStatus(req.id, 'read')
        .then(() => update(req.id, { status: 'read' }))
        .catch(() => {})
    }
  }

  const handleMarkContacted = () => {
    if (!selected) return
    updateQuoteStatus(selected.id, 'responded')
      .then(() => update(selected.id, { status: 'responded' }))
      .catch(() => {})
  }

  const handleClose = async () => {
    if (!selected || !closeOutcome) return
    setClosing(true); setCloseError('')
    try {
      const updated = await closeQuote(selected.id, closeOutcome, closeNote)
      update(updated.id, updated)
      setShowClose(false)
    } catch (err) {
      setCloseError(err instanceof Error ? err.message : 'Error al cerrar')
    } finally {
      setClosing(false)
    }
  }

  const newCount    = requests.filter(r => r.status === 'new').length
  const closedCount = requests.filter(r => r.outcome !== null).length
  const companyName = myCompany?.name ?? 'nuestra empresa'

  return (
    <>
      <div className="panel-topbar">
        <span className="panel-topbar-title">
          Solicitudes de cotización
          {newCount > 0 && (
            <span style={{ marginLeft: 'var(--sp-3)', fontSize: 'var(--text-xs)', background: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: 20, fontWeight: 'var(--weight-semibold)' }}>
              {newCount} nuevas
            </span>
          )}
        </span>
      </div>

      <div className="panel-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', padding: '0 var(--sp-8)' }}>
          {TABS.map(tab => {
            const count = tab.key === 'all' ? requests.length
              : tab.key === 'closed' ? closedCount
              : requests.filter(r => r.status === tab.key && r.outcome === null).length
            const isActive = activeTab === tab.key
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: 'var(--sp-4) var(--sp-5)', fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)', background: 'none', border: 'none',
                borderBottom: isActive ? '2px solid var(--color-cta)' : '2px solid transparent',
                color: isActive ? 'var(--color-cta)' : 'var(--color-text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: -1,
              }}>
                {tab.label}
                <span style={{ fontSize: 'var(--text-xs)', background: isActive ? 'var(--color-cta-light)' : 'var(--color-surface-2)', color: isActive ? 'var(--color-cta)' : 'var(--color-text-muted)', padding: '1px 6px', borderRadius: 10, fontWeight: 'var(--weight-semibold)' }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className={`inbox-panels${selectedId ? ' detail-open' : ''}`} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1, overflow: 'hidden' }}>

          {/* List */}
          <div className="inbox-list" style={{ borderRight: '1px solid var(--color-border)', overflowY: 'auto', background: 'var(--color-surface)' }}>
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-10)' }}>
                <div className="empty-state-icon"><IconInbox size={40} /></div>
                <h3>Sin solicitudes</h3>
                <p>No hay solicitudes en esta categoría.</p>
              </div>
            ) : filtered.map(req => {
              const sc  = STATUS_COLORS[req.status]
              const oc  = req.outcome ? OUTCOMES[req.outcome] : null
              return (
                <button key={req.id} onClick={() => handleSelect(req)} style={{
                  width: '100%',
                  background: selectedId === req.id ? 'var(--color-cta-light)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  borderLeft: req.status === 'new' && !req.outcome ? '3px solid var(--color-cta)' : '3px solid transparent',
                  padding: 'var(--sp-4) var(--sp-5)',
                  textAlign: 'left', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)', marginBottom: 4 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: req.status === 'new' && !req.outcome ? 'var(--weight-semibold)' : 'var(--weight-medium)', color: 'var(--color-primary)', lineHeight: 1.3 }}>
                      {req.requesterCompany ?? req.requesterName}
                    </p>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {fmtShort(req.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
                    {req.service}
                  </p>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: oc ? oc.bg : sc.bg, color: oc ? oc.color : sc.color }}>
                    {oc ? oc.label : STATUS_LABELS[req.status]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Detail */}
          {selected ? (
            <div className="inbox-detail" style={{ overflowY: 'auto', background: 'var(--color-bg)' }}>
              <button className="inbox-back-btn" onClick={() => setSelectedId(null)}>← Volver</button>

              {/* ── Header ── */}
              <div style={{ padding: 'var(--sp-8)', paddingBottom: 'var(--sp-6)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap' }}>
                  {(() => { const sc = STATUS_COLORS[selected.status]; return (
                    <span style={{ fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: sc.bg, color: sc.color }}>
                      {STATUS_LABELS[selected.status]}
                    </span>
                  )})()}
                  {selected.outcome && (() => { const oc = OUTCOMES[selected.outcome!]; return (
                    <span style={{ fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: oc.bg, color: oc.color }}>
                      {oc.label}
                    </span>
                  )})()}
                </div>

                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', lineHeight: 1.2, marginBottom: 4 }}>
                  {selected.requesterCompany ?? selected.requesterName}
                </h2>
                {selected.requesterCompany && (
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-3)' }}>
                    {selected.requesterName}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', background: 'var(--color-surface-2)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 'var(--radius-sm)' }}>
                    {selected.service}
                  </span>
                  {selected.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      <IconMapPin size={14} />{selected.location}
                    </span>
                  )}
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {fmtDate(selected.createdAt)}
                  </span>
                </div>
              </div>

              {/* ── Description ── */}
              {selected.description && (
                <div style={{ padding: 'var(--sp-8)', paddingBottom: 'var(--sp-6)', borderBottom: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-3)' }}>
                    Descripción del proyecto
                  </p>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1.8 }}>
                    {selected.description}
                  </p>
                </div>
              )}

              {/* ── Contact actions ── */}
              <div style={{ padding: 'var(--sp-8)', paddingBottom: 'var(--sp-6)', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-5)' }}>
                  Contactar al solicitante
                </p>

                {/* Contact data */}
                <div style={{ display: 'flex', gap: 'var(--sp-6)', flexWrap: 'wrap', marginBottom: 'var(--sp-6)' }}>
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Correo</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      <span style={{ color: 'var(--color-cta)', flexShrink: 0, display: 'inline-flex' }}><IconMail size={14} /></span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text)' }}>
                        {selected.requesterEmail}
                      </span>
                      <button
                        onClick={() => copyEmail(selected.requesterEmail)}
                        title="Copiar correo"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                          borderRadius: 4, color: emailCopied ? '#15803D' : 'var(--color-text-muted)',
                          display: 'inline-flex', alignItems: 'center', transition: 'color 0.15s',
                          flexShrink: 0,
                        }}
                      >
                        {emailCopied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </button>
                    </div>
                  </div>
                  {selected.requesterPhone && (
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Teléfono</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: 'var(--color-cta)', display: 'inline-flex' }}><IconPhone size={14} /></span>
                        {selected.requesterPhone}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                  {selected.requesterPhone && (
                    <a
                      href={buildWhatsApp(selected, companyName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => selected.status !== 'responded' && handleMarkContacted()}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
                        padding: '10px 18px', borderRadius: 'var(--radius-md)',
                        background: '#25D366', color: '#fff',
                        fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
                        textDecoration: 'none',
                      }}
                    >
                      <IconMessageCircle size={16} />
                      WhatsApp
                    </a>
                  )}

                  <a
                    href={`mailto:${selected.requesterEmail}`}
                    onClick={() => selected.status !== 'responded' && handleMarkContacted()}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)',
                      padding: '10px 18px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface)', color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
                      textDecoration: 'none',
                    }}
                  >
                    <IconMail size={16} />
                    Enviar correo
                  </a>
                </div>

                {selected.status !== 'responded' && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--sp-4)' }}>
                    Al hacer clic en WhatsApp o Correo se marcará automáticamente como contactada. ·{' '}
                    <button onClick={handleMarkContacted} style={{ background: 'none', border: 'none', color: 'var(--color-cta)', fontSize: 'inherit', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                      Marcar como contactada manualmente
                    </button>
                  </p>
                )}
              </div>

              {/* ── Outcome ── */}
              <div style={{ padding: 'var(--sp-8)' }}>
                {selected.outcome && !showClose ? (
                  <div style={{ border: `1px solid ${OUTCOMES[selected.outcome].color}30`, borderRadius: 'var(--radius-md)', padding: 'var(--sp-5)', background: OUTCOMES[selected.outcome].bg }}>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: OUTCOMES[selected.outcome].color, marginBottom: 'var(--sp-2)' }}>
                      Resultado registrado · {selected.closedAt ? fmtDate(selected.closedAt) : ''}
                    </p>
                    <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: OUTCOMES[selected.outcome].color }}>
                      {OUTCOMES[selected.outcome].label}
                    </p>
                    {selected.outcomeNote && (
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-2)', lineHeight: 1.65 }}>
                        {selected.outcomeNote}
                      </p>
                    )}
                    <button
                      onClick={() => { setShowClose(true); setCloseOutcome(selected.outcome!); setCloseNote(selected.outcomeNote ?? '') }}
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 'var(--sp-3)', padding: 0, textDecoration: 'underline' }}
                    >
                      Modificar resultado
                    </button>
                  </div>
                ) : !showClose ? (
                  <div>
                    <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowClose(true)}>
                      Cerrar solicitud y registrar resultado
                    </button>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--sp-2)', textAlign: 'center' }}>
                      Registra el resultado para llevar métricas de conversión
                    </p>
                  </div>
                ) : null}

                {showClose && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>¿Cómo terminó esta cotización?</p>
                      <button onClick={() => setShowClose(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 20, lineHeight: 1 }}>×</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
                      {(Object.entries(OUTCOMES) as [Outcome, OutcomeMeta][]).map(([key, meta]) => (
                        <label key={key} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)',
                          padding: 'var(--sp-4)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          border: `2px solid ${closeOutcome === key ? meta.color : 'var(--color-border)'}`,
                          background: closeOutcome === key ? meta.bg : 'transparent',
                          transition: 'all 0.12s',
                        }}>
                          <input type="radio" name="outcome" value={key} checked={closeOutcome === key} onChange={() => setCloseOutcome(key)} style={{ marginTop: 3, accentColor: meta.color }} />
                          <div>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: closeOutcome === key ? meta.color : 'var(--color-text)' }}>{meta.label}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{meta.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div style={{ marginBottom: 'var(--sp-4)' }}>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text)', marginBottom: 'var(--sp-2)', display: 'block' }}>
                        Nota interna <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(opcional)</span>
                      </label>
                      <textarea rows={2} className="form-textarea" placeholder="Ej: Acordamos inicio en mayo, monto $4.2M..." value={closeNote} onChange={e => setCloseNote(e.target.value)} style={{ resize: 'none' }} />
                    </div>

                    {closeError && <p style={{ fontSize: 'var(--text-sm)', color: '#DC2626', marginBottom: 'var(--sp-3)' }}>{closeError}</p>}

                    <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                      <button className="btn btn-primary" onClick={handleClose} disabled={closing || !closeOutcome} aria-busy={closing}>
                        {closing ? 'Guardando...' : 'Confirmar resultado'}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setShowClose(false)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="inbox-detail empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="empty-state-icon"><IconInbox size={40} /></div>
              <h3>Selecciona una solicitud</h3>
              <p>Haz clic en una solicitud para ver el detalle.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
