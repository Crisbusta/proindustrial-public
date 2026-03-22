import { useState, useEffect } from 'react'
import { IconInbox, IconMapPin, IconMail } from '../../components/Icons'
import { fetchPanelQuotes, updateQuoteStatus } from '../../api/client'
import type { QuoteRequestResponse } from '../../types'

type Status = QuoteRequestResponse['status']

const STATUS_LABELS: Record<Status, string> = {
  new: 'Nueva',
  read: 'Vista',
  responded: 'Respondida',
}

const TABS: { key: Status | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'new', label: 'Nuevas' },
  { key: 'read', label: 'Vistas' },
  { key: 'responded', label: 'Respondidas' },
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

export default function PanelInbox() {
  const [activeTab, setActiveTab] = useState<Status | 'all'>('all')
  const [requests, setRequests] = useState<QuoteRequestResponse[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchPanelQuotes().then(qs => {
      setRequests(qs)
      if (qs.length > 0) setSelectedId(qs[0].id)
    }).catch(() => {})
  }, [])

  const filtered = activeTab === 'all'
    ? requests
    : requests.filter(r => r.status === activeTab)

  const selected = requests.find(r => r.id === selectedId) ?? null

  const markAs = async (id: string, status: Status) => {
    try {
      await updateQuoteStatus(id, status)
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {}
  }

  const newCount = requests.filter(r => r.status === 'new').length

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
        <div className="inbox-tabs" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', gap: 0, padding: '0 var(--sp-8)' }}>
          {TABS.map(tab => {
            const count = tab.key === 'all' ? requests.length : requests.filter(r => r.status === tab.key).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: 'var(--sp-4) var(--sp-5)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid var(--color-cta)' : '2px solid transparent',
                  color: activeTab === tab.key ? 'var(--color-cta)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'color var(--ease-fast), border-color var(--ease-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-2)',
                  marginBottom: -1,
                }}
              >
                {tab.label}
                <span style={{ fontSize: 'var(--text-xs)', background: activeTab === tab.key ? 'var(--color-cta-light)' : 'var(--color-surface-2)', color: activeTab === tab.key ? 'var(--color-cta)' : 'var(--color-text-muted)', padding: '1px 6px', borderRadius: 10, fontWeight: 'var(--weight-semibold)' }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Two-panel layout */}
        <div className={`inbox-panels${selectedId ? ' detail-open' : ''}`} style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, overflow: 'hidden' }}>
          {/* List */}
          <div className="inbox-list" style={{ borderRight: '1px solid var(--color-border)', overflowY: 'auto', background: 'var(--color-surface)' }}>
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-10)' }}>
                <div className="empty-state-icon"><IconInbox size={40} /></div>
                <h3>Sin solicitudes</h3>
                <p>No hay solicitudes en esta categoría.</p>
              </div>
            ) : (
              filtered.map(req => (
                <button
                  key={req.id}
                  onClick={() => {
                    setSelectedId(req.id)
                    if (req.status === 'new') markAs(req.id, 'read')
                  }}
                  style={{
                    width: '100%',
                    background: selectedId === req.id ? 'var(--color-cta-light)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    borderLeft: req.status === 'new' ? '3px solid var(--color-cta)' : '3px solid transparent',
                    padding: 'var(--sp-4) var(--sp-5)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background var(--ease-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: req.status === 'new' ? 'var(--weight-semibold)' : 'var(--weight-medium)', color: 'var(--color-primary)', lineHeight: 1.3 }}>
                      {req.requesterCompany ?? req.requesterName}
                    </p>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {new Date(req.createdAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-2)', lineHeight: 1.4 }}>
                    {req.service}
                  </p>
                  <span className={`status-badge ${req.status}`} style={{ fontSize: '0.65rem' }}>
                    {STATUS_LABELS[req.status]}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Detail */}
          {selected ? (
            <div className="inbox-detail" style={{ overflowY: 'auto', padding: 'var(--sp-8)', background: 'var(--color-bg)' }}>
              <div style={{ maxWidth: 640 }}>
                {/* Back button — mobile only */}
                <button className="inbox-back-btn" onClick={() => setSelectedId(null)}>
                  ← Volver a solicitudes
                </button>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--sp-6)', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                  <div>
                    <span className={`status-badge ${selected.status}`} style={{ marginBottom: 'var(--sp-3)', display: 'inline-flex' }}>
                      {STATUS_LABELS[selected.status]}
                    </span>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', lineHeight: 1.2 }}>
                      {selected.requesterCompany ?? selected.requesterName}
                    </h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-1)' }}>
                      Recibida el {formatDate(selected.createdAt)}
                    </p>
                  </div>
                  {selected.status !== 'responded' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => markAs(selected.id, 'responded')}
                    >
                      Marcar como respondida
                    </button>
                  )}
                </div>

                {/* Contact info */}
                <div className="panel-section" style={{ marginBottom: 'var(--sp-6)' }}>
                  <div className="panel-section-header" style={{ background: 'var(--color-surface-2)' }}>
                    <h3 className="panel-section-title" style={{ fontSize: 'var(--text-sm)' }}>Datos de contacto</h3>
                  </div>
                  <div className="panel-section-body" style={{ display: 'flex', gap: 'var(--sp-8)', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Nombre</p>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text)' }}>{selected.requesterName}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Correo</p>
                      <a href={`mailto:${selected.requesterEmail}`} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-cta)', fontWeight: 'var(--weight-medium)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                        <IconMail size={14} />
                        {selected.requesterEmail}
                      </a>
                    </div>
                    {selected.location && (
                      <div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Ubicación</p>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 'var(--sp-1)' }}>
                          <IconMapPin size={13} />
                          {selected.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service */}
                <div className="panel-section" style={{ marginBottom: 'var(--sp-6)' }}>
                  <div className="panel-section-header" style={{ background: 'var(--color-surface-2)' }}>
                    <h3 className="panel-section-title" style={{ fontSize: 'var(--text-sm)' }}>Servicio solicitado</h3>
                  </div>
                  <div className="panel-section-body">
                    <span className="badge badge-blue">{selected.service}</span>
                  </div>
                </div>

                {/* Description */}
                {selected.description && (
                  <div className="panel-section">
                    <div className="panel-section-header" style={{ background: 'var(--color-surface-2)' }}>
                      <h3 className="panel-section-title" style={{ fontSize: 'var(--text-sm)' }}>Descripción del proyecto</h3>
                    </div>
                    <div className="panel-section-body">
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        {selected.description}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 'var(--sp-6)', display: 'flex', gap: 'var(--sp-3)' }}>
                  <a
                    href={`mailto:${selected.requesterEmail}?subject=Cotización para ${selected.service}&body=Estimado ${selected.requesterName},%0D%0A%0D%0AHemos recibido su solicitud de cotización para ${selected.service}.%0D%0A`}
                    className="btn btn-primary"
                    onClick={() => markAs(selected.id, 'responded')}
                  >
                    <IconMail size={15} />
                    Responder por correo
                  </a>
                </div>
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
