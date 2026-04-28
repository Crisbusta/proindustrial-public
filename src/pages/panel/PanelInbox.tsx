import { useState, useEffect, useRef } from 'react'
import { IconInbox, IconMapPin, IconMail, IconPhone, IconMessageCircle, IconCheck, IconCopy, IconSearch, IconX } from '../../components/Icons'
import { fetchPanelQuotes, fetchPanelProfile, updateQuoteStatus, closeQuote, setQuoteTags, setQuoteFollowUp } from '../../api/client'
import { useToast } from '../../components/Toast'
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


const fmtDateInput = (iso: string | null) => {
  if (!iso) return ''
  return iso.slice(0, 10)
}

const PRESET_TAGS = ['Urgente', 'Seguimiento', 'Gran proyecto', 'Cliente recurrente', 'Sin presupuesto']

export default function PanelInbox() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab]   = useState<typeof TABS[number]['key']>('new')
  const [requests, setRequests]     = useState<QuoteRequestResponse[]>([])
  const [myCompany, setMyCompany]   = useState<Company | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch]         = useState('')

  const [emailCopied, setEmailCopied] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const [tagInput, setTagInput] = useState('')
  const [savingTag, setSavingTag] = useState(false)
  const [savingFollowUp, setSavingFollowUp] = useState(false)

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
      }).catch(() => addToast('No se pudo cargar las solicitudes', 'error'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = (() => {
    const base = (() => {
      if (activeTab === 'all')    return requests
      if (activeTab === 'closed') return requests.filter(r => r.outcome !== null)
      return requests.filter(r => r.status === activeTab && r.outcome === null)
    })()
    if (!search.trim()) return base
    const q = search.toLowerCase()
    return base.filter(r =>
      r.requesterName.toLowerCase().includes(q) ||
      (r.requesterCompany ?? '').toLowerCase().includes(q) ||
      r.service.toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q)
    )
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
        .catch(() => addToast('No se pudo actualizar el estado', 'error'))
    }
  }

  const handleMarkContacted = () => {
    if (!selected) return
    updateQuoteStatus(selected.id, 'responded')
      .then(() => update(selected.id, { status: 'responded' }))
      .catch(() => addToast('No se pudo actualizar el estado', 'error'))
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

  const handleAddTag = async (tag: string) => {
    if (!selected) return
    const trimmed = tag.trim()
    if (!trimmed || selected.tags.includes(trimmed)) return
    const newTags = [...selected.tags, trimmed]
    setSavingTag(true)
    try {
      const updated = await setQuoteTags(selected.id, newTags)
      update(updated.id, { tags: updated.tags })
      setTagInput('')
    } catch {
      addToast('No se pudo guardar la etiqueta', 'error')
    } finally {
      setSavingTag(false)
    }
  }

  const handleRemoveTag = async (tag: string) => {
    if (!selected) return
    const newTags = selected.tags.filter(t => t !== tag)
    setSavingTag(true)
    try {
      const updated = await setQuoteTags(selected.id, newTags)
      update(updated.id, { tags: updated.tags })
    } catch {
      addToast('No se pudo eliminar la etiqueta', 'error')
    } finally {
      setSavingTag(false)
    }
  }

  const handleFollowUp = async (dateStr: string) => {
    if (!selected) return
    setSavingFollowUp(true)
    try {
      const updated = await setQuoteFollowUp(selected.id, dateStr || null)
      update(updated.id, { followUpAt: updated.followUpAt })
    } catch {
      addToast('No se pudo guardar el seguimiento', 'error')
    } finally {
      setSavingFollowUp(false)
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

        {/* Search + Tabs */}
        <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div style={{ padding: 'var(--sp-3) var(--sp-5)', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ position: 'relative', maxWidth: 400 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none', display: 'flex' }}>
                <IconSearch size={14} />
              </span>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar en solicitudes..."
                className="form-input"
                style={{ paddingLeft: 32, paddingTop: '6px', paddingBottom: '6px', fontSize: 'var(--text-sm)' }}
                aria-label="Buscar solicitudes"
              />
            </div>
          </div>
        <div style={{ display: 'flex', padding: '0 var(--sp-8)' }}>
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

              {/* ── Tags ── */}
              <div style={{ padding: 'var(--sp-6) var(--sp-8)', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-3)' }}>
                  Etiquetas
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
                  {selected.tags.map(tag => (
                    <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', padding: '3px 8px', borderRadius: 20, background: 'var(--color-primary)', color: '#fff', fontWeight: 'var(--weight-medium)' }}>
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} disabled={savingTag} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 0, lineHeight: 1, display: 'flex' }}>
                        <IconX size={11} />
                      </button>
                    </span>
                  ))}
                  {selected.tags.length === 0 && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Sin etiquetas</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
                  {PRESET_TAGS.filter(t => !selected.tags.includes(t)).map(t => (
                    <button key={t} onClick={() => handleAddTag(t)} disabled={savingTag}
                      style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, border: '1px dashed var(--color-border)', background: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      + {t}
                    </button>
                  ))}
                </div>
                <form onSubmit={e => { e.preventDefault(); handleAddTag(tagInput) }} style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <input
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="Nueva etiqueta..."
                    className="form-input"
                    style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', flex: 1 }}
                  />
                  <button type="submit" className="btn btn-outline" disabled={savingTag || !tagInput.trim()} style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}>
                    Agregar
                  </button>
                </form>
              </div>

              {/* ── Follow-up ── */}
              <div style={{ padding: 'var(--sp-5) var(--sp-8)', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 'var(--sp-3)' }}>
                  Recordatorio de seguimiento
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <input
                    type="date"
                    className="form-input"
                    style={{ fontSize: 'var(--text-sm)', padding: '6px 10px', maxWidth: 180 }}
                    value={fmtDateInput(selected.followUpAt)}
                    onChange={e => handleFollowUp(e.target.value)}
                    disabled={savingFollowUp}
                    aria-label="Fecha de seguimiento"
                  />
                  {selected.followUpAt && (
                    <button onClick={() => handleFollowUp('')} disabled={savingFollowUp}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 4 }}>
                      <IconX size={14} />
                    </button>
                  )}
                  {savingFollowUp && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Guardando...</span>}
                </div>
              </div>

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
