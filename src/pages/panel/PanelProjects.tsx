import { useState, useEffect, useRef } from 'react'
import { IconPlus, IconPencil, IconTrash, IconX, IconCheck, IconFolderOpen, IconImage } from '../../components/Icons'
import {
  fetchProjects, createProject, updateProject, deleteProject,
  uploadProjectImage, deleteProjectImage,
} from '../../api/client'
import type { CompanyProject } from '../../types'

interface ProjectForm {
  title: string
  description: string
  clientName: string
  year: string
}
const EMPTY: ProjectForm = { title: '', description: '', clientName: '', year: '' }

export default function PanelProjects() {
  const [projects, setProjects] = useState<CompanyProject[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(EMPTY)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  // Gallery per project
  const [openGalleryId, setOpenGalleryId] = useState<string | null>(null)
  const [uploadingImgId, setUploadingImgId] = useState<string | null>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const imgUploadTarget = useRef<string | null>(null)

  useEffect(() => {
    fetchProjects().then(setProjects).catch(() => {})
  }, [])

  const openAdd = () => { setForm(EMPTY); setEditingId(null); setError(''); setPanelOpen(true) }
  const openEdit = (p: CompanyProject) => {
    setForm({ title: p.title, description: p.description ?? '', clientName: p.clientName ?? '', year: p.year ? String(p.year) : '' })
    setEditingId(p.id); setError(''); setPanelOpen(true)
  }
  const closePanel = () => { setPanelOpen(false); setEditingId(null) }

  const set = (field: keyof ProjectForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true); setError('')
    const payload = {
      title: form.title,
      description: form.description || undefined,
      clientName: form.clientName || undefined,
      year: form.year ? Number(form.year) : undefined,
    }
    try {
      if (editingId) {
        const updated = await updateProject(editingId, payload)
        setProjects(prev => prev.map(p => p.id === editingId ? updated : p))
      } else {
        const created = await createProject(payload)
        setProjects(prev => [...prev, created])
      }
      closePanel(); setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try { await deleteProject(id); setProjects(prev => prev.filter(p => p.id !== id)) } catch {}
    setDeleteId(null)
  }

  const triggerImgUpload = (projectId: string) => {
    imgUploadTarget.current = projectId
    imgInputRef.current?.click()
  }

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const id = imgUploadTarget.current
    if (!file || !id) return
    setUploadingImgId(id)
    try {
      const img = await uploadProjectImage(id, file)
      setProjects(prev => prev.map(p =>
        p.id === id ? { ...p, images: [...p.images, { id: img.id, projectId: id, url: img.url, altText: null, sortOrder: p.images.length }] } : p
      ))
    } catch {}
    setUploadingImgId(null)
    e.target.value = ''
  }

  const handleImgDelete = async (projectId: string, imgId: string) => {
    try {
      await deleteProjectImage(projectId, imgId)
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, images: p.images.filter(i => i.id !== imgId) } : p
      ))
    } catch {}
  }

  const currentYear = new Date().getFullYear()

  return (
    <>
      <div className="panel-topbar">
        <span className="panel-topbar-title">Casos destacados</span>
        <div className="panel-topbar-right">
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <IconPlus size={15} />
            Agregar caso
          </button>
        </div>
      </div>

      <input
        ref={imgInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleImgChange}
      />

      <div className="panel-content">
        {projects.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 'var(--sp-20)' }}>
            <div className="empty-state-icon"><IconFolderOpen size={44} /></div>
            <h3>Sin casos destacados</h3>
            <p>Muestra proyectos realizados para demostrar tu experiencia a potenciales clientes.</p>
            <div style={{ marginTop: 'var(--sp-6)' }}>
              <button className="btn btn-primary" onClick={openAdd}>
                <IconPlus size={16} />
                Agregar primer caso
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {projects.map(proj => (
              <div key={proj.id} className="panel-section" style={{ marginBottom: 0 }}>
                <div className="panel-section-header">
                  <div>
                    <h2 className="panel-section-title" style={{ fontSize: 'var(--text-base)' }}>{proj.title}</h2>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--sp-1)' }}>
                      {[proj.clientName, proj.year].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <button
                      className="icon-btn"
                      onClick={() => setOpenGalleryId(openGalleryId === proj.id ? null : proj.id)}
                      title="Imágenes del proyecto"
                      aria-label="Imágenes"
                    >
                      <IconImage size={14} />
                    </button>
                    <button className="icon-btn" onClick={() => openEdit(proj)} title="Editar" aria-label={`Editar ${proj.title}`}>
                      <IconPencil size={14} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeleteId(proj.id)} title="Eliminar" aria-label={`Eliminar ${proj.title}`}>
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>

                {proj.description && (
                  <div className="panel-section-body" style={{ paddingTop: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                      {proj.description}
                    </p>
                  </div>
                )}

                {/* Inline image gallery */}
                {(openGalleryId === proj.id || proj.images.length > 0) && (
                  <div className="panel-section-body" style={{ paddingTop: proj.description ? 0 : undefined }}>
                    <div className="img-grid">
                      {proj.images.map(img => (
                        <div key={img.id} className="img-thumb">
                          <img src={img.url} alt={img.altText ?? ''} />
                          <button
                            className="img-thumb-delete"
                            onClick={() => handleImgDelete(proj.id, img.id)}
                            aria-label="Eliminar imagen"
                          >
                            <IconX size={10} />
                          </button>
                        </div>
                      ))}
                      {proj.images.length < 8 && (
                        <button
                          className="img-thumb-add"
                          onClick={() => triggerImgUpload(proj.id)}
                          disabled={uploadingImgId === proj.id}
                          aria-label="Agregar imagen"
                        >
                          {uploadingImgId === proj.id
                            ? <div className="upload-spinner" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'var(--color-cta)', width: 16, height: 16 }} />
                            : <><IconPlus size={18} /><span>Agregar</span></>
                          }
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--sp-2)' }}>
                      {proj.images.length}/8 imágenes
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit panel ─────────────────────────── */}
      {panelOpen && (
        <>
          <div className="slide-overlay" onClick={closePanel} aria-hidden="true" />
          <div className="slide-panel" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar caso' : 'Agregar caso'}>
            <div className="slide-panel-header">
              <h2>{editingId ? 'Editar caso' : 'Agregar caso destacado'}</h2>
              <button className="icon-btn" onClick={closePanel} aria-label="Cerrar"><IconX size={16} /></button>
            </div>

            <div className="slide-panel-body">
              <div className="form-group">
                <label htmlFor="proj-title" className="form-label">
                  Título del proyecto <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="proj-title" type="text" className="form-input"
                  value={form.title} onChange={set('title')}
                  placeholder="Ej: Instalación red PEAD DN200 — Minera Los Andes"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="proj-description" className="form-label">Descripción</label>
                <textarea
                  id="proj-description" className="form-textarea"
                  value={form.description} onChange={set('description')}
                  placeholder="Describe el alcance del trabajo, materiales utilizados, resultados obtenidos..."
                  rows={4} maxLength={600}
                />
                <p className="form-hint">{form.description.length}/600 caracteres</p>
              </div>

              <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
                <div className="form-group">
                  <label htmlFor="proj-client" className="form-label">Cliente</label>
                  <input
                    id="proj-client" type="text" className="form-input"
                    value={form.clientName} onChange={set('clientName')}
                    placeholder="Nombre del cliente (opcional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="proj-year" className="form-label">Año</label>
                  <input
                    id="proj-year" type="number" className="form-input"
                    value={form.year} onChange={set('year')}
                    placeholder={String(currentYear)}
                    min="1990" max={currentYear + 1}
                  />
                </div>
              </div>

              <p className="form-hint">
                Después de guardar, podrás agregar imágenes del proyecto desde la lista.
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
                disabled={saving || !form.title.trim()}
                aria-busy={saving}
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar caso'}
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
              Eliminar caso
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--sp-6)' }}>
              Se eliminarán el caso y todas sus imágenes asociadas. Esta acción no se puede deshacer.
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
          {editingId ? 'Caso actualizado' : 'Caso agregado'}
        </div>
      )}
    </>
  )
}
