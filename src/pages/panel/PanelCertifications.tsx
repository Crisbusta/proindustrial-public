import { useState, useEffect, useRef } from 'react'
import { IconPlus, IconPencil, IconTrash, IconX, IconCheck, IconAward, IconUpload } from '../../components/Icons'
import {
  fetchCertifications, createCertification, updateCertification,
  deleteCertification, uploadCertificationDoc,
} from '../../api/client'
import type { CompanyCertification } from '../../types'

interface CertForm {
  name: string
  issuer: string
  issuedAt: string
  expiresAt: string
}
const EMPTY: CertForm = { name: '', issuer: '', issuedAt: '', expiresAt: '' }

export default function PanelCertifications() {
  const [certs, setCerts] = useState<CompanyCertification[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CertForm>(EMPTY)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetId = useRef<string | null>(null)

  useEffect(() => {
    fetchCertifications().then(setCerts).catch(() => {})
  }, [])

  const openAdd = () => { setForm(EMPTY); setEditingId(null); setError(''); setPanelOpen(true) }
  const openEdit = (c: CompanyCertification) => {
    setForm({
      name: c.name,
      issuer: c.issuer ?? '',
      issuedAt: c.issuedAt ? c.issuedAt.slice(0, 10) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
    })
    setEditingId(c.id); setError(''); setPanelOpen(true)
  }
  const closePanel = () => { setPanelOpen(false); setEditingId(null) }

  const set = (field: keyof CertForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true); setError('')
    const payload = {
      name: form.name,
      issuer: form.issuer || undefined,
      issuedAt: form.issuedAt || undefined,
      expiresAt: form.expiresAt || undefined,
    }
    try {
      if (editingId) {
        const updated = await updateCertification(editingId, payload)
        setCerts(prev => prev.map(c => c.id === editingId ? updated : c))
      } else {
        const created = await createCertification(payload)
        setCerts(prev => [...prev, created])
      }
      closePanel(); setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try { await deleteCertification(id); setCerts(prev => prev.filter(c => c.id !== id)) } catch {}
    setDeleteId(null)
  }

  const triggerDocUpload = (certId: string) => {
    uploadTargetId.current = certId
    docInputRef.current?.click()
  }

  const handleDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const id = uploadTargetId.current
    if (!file || !id) return
    setUploadingId(id)
    try {
      const updated = await uploadCertificationDoc(id, file)
      setCerts(prev => prev.map(c => c.id === id ? updated : c))
    } catch {}
    setUploadingId(null)
    e.target.value = ''
  }

  const formatDate = (s: string | null) => {
    if (!s) return null
    try { return new Date(s).toLocaleDateString('es-CL', { year: 'numeric', month: 'short' }) } catch { return s }
  }

  const isExpired = (s: string | null) => {
    if (!s) return false
    return new Date(s) < new Date()
  }

  return (
    <>
      <div className="panel-topbar">
        <span className="panel-topbar-title">Certificaciones</span>
        <div className="panel-topbar-right">
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <IconPlus size={15} />
            Agregar certificación
          </button>
        </div>
      </div>

      <input
        ref={docInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handleDocChange}
      />

      <div className="panel-content">
        {certs.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 'var(--sp-20)' }}>
            <div className="empty-state-icon"><IconAward size={44} /></div>
            <h3>Sin certificaciones registradas</h3>
            <p>Agrega tus certificaciones, normas y acreditaciones para generar más confianza.</p>
            <div style={{ marginTop: 'var(--sp-6)' }}>
              <button className="btn btn-primary" onClick={openAdd}>
                <IconPlus size={16} />
                Agregar primera certificación
              </button>
            </div>
          </div>
        ) : (
          <div className="panel-section">
            <div className="panel-section-header">
              <h2 className="panel-section-title">
                Certificaciones y acreditaciones
                <span style={{ marginLeft: 'var(--sp-3)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-normal)', color: 'var(--color-text-muted)' }}>
                  {certs.length} en total
                </span>
              </h2>
            </div>
            <div className="panel-section-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {certs.map(cert => {
                const expired = isExpired(cert.expiresAt)
                return (
                  <div key={cert.id} className="media-card">
                    <div className="media-card-icon" style={{ background: expired ? '#FEF2F2' : undefined, color: expired ? '#DC2626' : undefined }}>
                      <IconAward size={18} />
                    </div>
                    <div className="media-card-body">
                      <p className="media-card-title">{cert.name}</p>
                      <p className="media-card-meta">
                        {cert.issuer && <span>{cert.issuer}</span>}
                        {cert.issuedAt && <span> · Emitida {formatDate(cert.issuedAt)}</span>}
                        {cert.expiresAt && (
                          <span style={{ color: expired ? '#DC2626' : undefined }}>
                            {' '}· {expired ? 'Venció' : 'Vence'} {formatDate(cert.expiresAt)}
                          </span>
                        )}
                      </p>
                      {cert.documentUrl && (
                        <a
                          href={cert.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 'var(--text-xs)', color: 'var(--color-cta)', marginTop: 'var(--sp-1)', display: 'inline-block' }}
                        >
                          Ver documento →
                        </a>
                      )}
                    </div>
                    <div className="media-card-actions">
                      <button
                        className="icon-btn"
                        onClick={() => triggerDocUpload(cert.id)}
                        disabled={uploadingId === cert.id}
                        title="Subir documento"
                        aria-label="Subir documento"
                      >
                        {uploadingId === cert.id
                          ? <div className="upload-spinner" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'var(--color-cta)', width: 14, height: 14 }} />
                          : <IconUpload size={14} />
                        }
                      </button>
                      <button className="icon-btn" onClick={() => openEdit(cert)} title="Editar" aria-label={`Editar ${cert.name}`}>
                        <IconPencil size={14} />
                      </button>
                      <button className="icon-btn danger" onClick={() => setDeleteId(cert.id)} title="Eliminar" aria-label={`Eliminar ${cert.name}`}>
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit panel ─────────────────────────── */}
      {panelOpen && (
        <>
          <div className="slide-overlay" onClick={closePanel} aria-hidden="true" />
          <div className="slide-panel" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar certificación' : 'Agregar certificación'}>
            <div className="slide-panel-header">
              <h2>{editingId ? 'Editar certificación' : 'Agregar certificación'}</h2>
              <button className="icon-btn" onClick={closePanel} aria-label="Cerrar"><IconX size={16} /></button>
            </div>

            <div className="slide-panel-body">
              <div className="form-group">
                <label htmlFor="cert-name" className="form-label">
                  Nombre <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="cert-name" type="text" className="form-input"
                  value={form.name} onChange={set('name')}
                  placeholder="Ej: ISO 9001:2015, Certificación ANSI, NCh2369"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="cert-issuer" className="form-label">Organismo emisor</label>
                <input
                  id="cert-issuer" type="text" className="form-input"
                  value={form.issuer} onChange={set('issuer')}
                  placeholder="Ej: Bureau Veritas, DICTUC, INN"
                />
              </div>

              <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
                <div className="form-group">
                  <label htmlFor="cert-issued" className="form-label">Fecha de emisión</label>
                  <input id="cert-issued" type="date" className="form-input" value={form.issuedAt} onChange={set('issuedAt')} />
                </div>
                <div className="form-group">
                  <label htmlFor="cert-expires" className="form-label">Fecha de vencimiento</label>
                  <input id="cert-expires" type="date" className="form-input" value={form.expiresAt} onChange={set('expiresAt')} />
                </div>
              </div>

              <p className="form-hint">
                Después de guardar, podrás subir el documento (PDF o imagen) desde la lista.
              </p>

              {error && (
                <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)', fontSize: 'var(--text-sm)', color: '#DC2626' }}>
                  {error}
                </div>
              )}
            </div>

            <div className="slide-panel-footer">
              <button className="btn btn-ghost" onClick={closePanel}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                aria-busy={saving}
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirm ─────────────────────────── */}
      {deleteId && (
        <>
          <div className="slide-overlay" onClick={() => setDeleteId(null)} aria-hidden="true" />
          <div
            className="panel-delete-dialog"
            role="dialog" aria-modal="true"
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-8)', width: 380, zIndex: 101, boxShadow: 'var(--shadow-lg)' }}
          >
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-3)' }}>
              Eliminar certificación
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--sp-6)' }}>
              Esta acción eliminará la certificación y su documento adjunto. No se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button
                className="btn"
                style={{ background: '#DC2626', color: '#fff', borderColor: '#DC2626' }}
                onClick={() => handleDelete(deleteId)}
              >
                <IconTrash size={15} />
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}

      {saved && (
        <div className="save-toast" role="status" aria-live="polite">
          <IconCheck size={16} />
          {editingId ? 'Certificación actualizada' : 'Certificación agregada'}
        </div>
      )}
    </>
  )
}
