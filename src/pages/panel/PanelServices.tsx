import { useState, useEffect, useRef } from 'react'
import { IconPlus, IconPencil, IconTrash, IconPackage, IconX, IconCheck, IconImage } from '../../components/Icons'
import {
  fetchPanelServices, createService, updateService, deleteService, fetchCategoryGroups,
  fetchServiceImages, uploadServiceImage, deleteServiceImage,
} from '../../api/client'
import type { CompanyService, CategoryGroup, ServiceImage } from '../../types'

type ServiceForm = { name: string; category: string; description: string; status: 'active' | 'draft' }
const EMPTY_FORM: ServiceForm = { name: '', category: '', description: '', status: 'active' }

export default function PanelServices() {
  const [services, setServices] = useState<CompanyService[]>([])
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Gallery state
  const [galleryServiceId, setGalleryServiceId] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<ServiceImage[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const imgInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPanelServices().then(setServices).catch(() => {})
    fetchCategoryGroups().then(setGroups).catch(() => {})
  }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setError(''); setPanelOpen(true) }
  const openEdit = (svc: CompanyService) => {
    setForm({ name: svc.name, category: svc.category ?? '', description: svc.description ?? '', status: svc.status })
    setEditingId(svc.id); setError(''); setPanelOpen(true)
  }
  const closePanel = () => { setPanelOpen(false); setEditingId(null) }

  const set = (field: keyof ServiceForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true); setError('')
    try {
      if (editingId) {
        const updated = await updateService(editingId, { name: form.name, category: form.category || undefined, description: form.description || undefined, status: form.status })
        setServices(prev => prev.map(s => s.id === editingId ? updated : s))
      } else {
        const created = await createService({ name: form.name, category: form.category || undefined, description: form.description || undefined })
        setServices(prev => [...prev, created])
      }
      closePanel(); setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el servicio.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try { await deleteService(id); setServices(prev => prev.filter(s => s.id !== id)) } catch {}
    setDeleteId(null)
  }

  const toggleStatus = async (svc: CompanyService) => {
    const newStatus = svc.status === 'active' ? 'draft' : 'active'
    try {
      const updated = await updateService(svc.id, { status: newStatus })
      setServices(prev => prev.map(s => s.id === svc.id ? updated : s))
    } catch {}
  }

  // ── Gallery ──────────────────────────────────────────────────────────────────

  const openGallery = async (svc: CompanyService) => {
    setGalleryServiceId(svc.id)
    setGalleryLoading(true)
    try {
      const imgs = await fetchServiceImages(svc.id)
      setGalleryImages(imgs)
    } catch {}
    setGalleryLoading(false)
  }

  const closeGallery = () => { setGalleryServiceId(null); setGalleryImages([]) }

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !galleryServiceId) return
    setUploadingImg(true)
    try {
      const img = await uploadServiceImage(galleryServiceId, file)
      setGalleryImages(prev => [...prev, img])
    } catch {}
    setUploadingImg(false)
    e.target.value = ''
  }

  const handleImgDelete = async (imgId: string) => {
    if (!galleryServiceId) return
    try {
      await deleteServiceImage(galleryServiceId, imgId)
      setGalleryImages(prev => prev.filter(i => i.id !== imgId))
    } catch {}
  }

  const allCats = groups.flatMap(g => [
    { slug: g.slug, name: g.name, key: `group-${g.slug}` },
    ...g.subcategories.map(s => ({ slug: s.slug, name: `${g.name} › ${s.name}`, key: `${g.slug}/${s.slug}` })),
  ])

  const getCategoryName = (slug: string | null) => {
    if (!slug) return ''
    return allCats.find(c => c.slug === slug)?.name ?? slug
  }

  const activeCount = services.filter(s => s.status === 'active').length
  const draftCount  = services.filter(s => s.status === 'draft').length
  const galleryService = services.find(s => s.id === galleryServiceId)

  return (
    <>
      <div className="panel-topbar">
        <span className="panel-topbar-title">Mis servicios</span>
        <div className="panel-topbar-right">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {activeCount} activos · {draftCount} borradores
          </span>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <IconPlus size={15} />
            Agregar servicio
          </button>
        </div>
      </div>

      <div className="panel-content">
        {services.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 'var(--sp-20)' }}>
            <div className="empty-state-icon"><IconPackage size={44} /></div>
            <h3>Sin servicios publicados</h3>
            <p>Agrega tus servicios para aparecer en el directorio.</p>
            <div style={{ marginTop: 'var(--sp-6)' }}>
              <button className="btn btn-primary" onClick={openAdd}>
                <IconPlus size={16} />
                Agregar primer servicio
              </button>
            </div>
          </div>
        ) : (
          <div className="panel-section">
            <div className="panel-section-header">
              <h2 className="panel-section-title">
                Servicios publicados
                <span style={{ marginLeft: 'var(--sp-3)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-normal)', color: 'var(--color-text-muted)' }}>
                  {services.length} en total
                </span>
              </h2>
            </div>

            <div className="panel-table-desktop">
              <div className="panel-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="panel-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Nombre del servicio</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(svc => (
                      <tr key={svc.id}>
                        <td>
                          <p style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-primary)', lineHeight: 1.4 }}>
                            {svc.name}
                          </p>
                        </td>
                        <td>
                          {svc.category && <span className="badge badge-gray">{getCategoryName(svc.category)}</span>}
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', maxWidth: 200 }}>
                          {svc.description
                            ? <span title={svc.description}>{svc.description.length > 55 ? svc.description.slice(0, 55) + '…' : svc.description}</span>
                            : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin descripción</span>
                          }
                        </td>
                        <td>
                          <button
                            onClick={() => toggleStatus(svc)}
                            className={`status-badge ${svc.status}`}
                            style={{ border: 'none', cursor: 'pointer', background: svc.status === 'active' ? '#F0FDF4' : 'var(--color-surface-2)' }}
                            title={svc.status === 'active' ? 'Clic para pasar a borrador' : 'Clic para activar'}
                            aria-label={`Estado: ${svc.status === 'active' ? 'Activo' : 'Borrador'}. Clic para cambiar.`}
                          >
                            {svc.status === 'active' ? 'Activo' : 'Borrador'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--sp-2)' }}>
                            <button
                              className="icon-btn"
                              onClick={() => openGallery(svc)}
                              title="Gestionar imágenes"
                              aria-label={`Imágenes de ${svc.name}`}
                            >
                              <IconImage size={14} />
                            </button>
                            <button className="icon-btn" onClick={() => openEdit(svc)} title="Editar servicio" aria-label={`Editar ${svc.name}`}>
                              <IconPencil size={14} />
                            </button>
                            <button className="icon-btn danger" onClick={() => setDeleteId(svc.id)} title="Eliminar servicio" aria-label={`Eliminar ${svc.name}`}>
                              <IconTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile card list */}
            <div className="panel-mobile-list panel-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              {services.map(svc => (
                <div key={svc.id} className="panel-mobile-card">
                  <div className="panel-mobile-card-header">
                    <p style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)', lineHeight: 1.4 }}>
                      {svc.name}
                    </p>
                    <div className="panel-mobile-card-actions">
                      <button className="icon-btn" onClick={() => openGallery(svc)} aria-label={`Imágenes de ${svc.name}`}>
                        <IconImage size={14} />
                      </button>
                      <button className="icon-btn" onClick={() => openEdit(svc)} aria-label={`Editar ${svc.name}`}>
                        <IconPencil size={14} />
                      </button>
                      <button className="icon-btn danger" onClick={() => setDeleteId(svc.id)} aria-label={`Eliminar ${svc.name}`}>
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    {svc.category && <span className="badge badge-gray">{getCategoryName(svc.category)}</span>}
                    <button
                      onClick={() => toggleStatus(svc)}
                      className={`status-badge ${svc.status}`}
                      style={{ border: 'none', cursor: 'pointer', background: svc.status === 'active' ? '#F0FDF4' : 'var(--color-surface-2)' }}
                      aria-label={`Estado: ${svc.status === 'active' ? 'Activo' : 'Borrador'}. Clic para cambiar.`}
                    >
                      {svc.status === 'active' ? 'Activo' : 'Borrador'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Gallery panel ─────────────────────────── */}
      {galleryServiceId && (
        <>
          <div className="slide-overlay" onClick={closeGallery} aria-hidden="true" />
          <div className="slide-panel" role="dialog" aria-modal="true" aria-label="Galería de imágenes">
            <div className="slide-panel-header">
              <div>
                <h2>Galería de imágenes</h2>
                {galleryService && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {galleryService.name}
                  </p>
                )}
              </div>
              <button className="icon-btn" onClick={closeGallery} aria-label="Cerrar galería">
                <IconX size={16} />
              </button>
            </div>

            <div className="slide-panel-body">
              <input
                ref={imgInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleImgUpload}
              />

              {galleryLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-10)' }}>
                  <div className="upload-spinner" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'var(--color-cta)' }} />
                </div>
              ) : (
                <>
                  <div className="img-grid">
                    {galleryImages.map(img => (
                      <div key={img.id} className="img-thumb">
                        <img src={img.url} alt={img.altText ?? ''} />
                        <button
                          className="img-thumb-delete"
                          onClick={() => handleImgDelete(img.id)}
                          aria-label="Eliminar imagen"
                        >
                          <IconX size={10} />
                        </button>
                      </div>
                    ))}

                    {galleryImages.length < 8 && (
                      <button
                        className="img-thumb-add"
                        onClick={() => imgInputRef.current?.click()}
                        disabled={uploadingImg}
                        aria-label="Agregar imagen"
                      >
                        {uploadingImg
                          ? <div className="upload-spinner" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'var(--color-cta)', width: 16, height: 16 }} />
                          : <>
                              <IconPlus size={18} />
                              <span>Agregar</span>
                            </>
                        }
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--sp-4)' }}>
                    {galleryImages.length}/8 imágenes · JPG, PNG o WebP · máx. 5 MB por imagen.
                  </p>

                  {galleryImages.length === 0 && (
                    <div
                      className="upload-zone"
                      style={{ marginTop: 'var(--sp-4)' }}
                      onClick={() => imgInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && imgInputRef.current?.click()}
                    >
                      <IconImage size={28} />
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Subir primera imagen</p>
                      <p style={{ fontSize: 'var(--text-xs)' }}>JPG, PNG o WebP hasta 5 MB</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="slide-panel-footer">
              <button className="btn btn-ghost" onClick={closeGallery}>Cerrar</button>
              {galleryImages.length < 8 && (
                <button
                  className="btn btn-primary"
                  onClick={() => imgInputRef.current?.click()}
                  disabled={uploadingImg}
                  aria-busy={uploadingImg}
                >
                  <IconPlus size={15} />
                  {uploadingImg ? 'Subiendo…' : 'Agregar imagen'}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Edit/Add panel ─────────────────────────── */}
      {panelOpen && (
        <>
          <div className="slide-overlay" onClick={closePanel} aria-hidden="true" />
          <div className="slide-panel" role="dialog" aria-modal="true" aria-label={editingId ? 'Editar servicio' : 'Agregar servicio'}>
            <div className="slide-panel-header">
              <h2>{editingId ? 'Editar servicio' : 'Agregar servicio'}</h2>
              <button className="icon-btn" onClick={closePanel} aria-label="Cerrar panel">
                <IconX size={16} />
              </button>
            </div>

            <div className="slide-panel-body">
              <div className="form-group">
                <label htmlFor="svc-name" className="form-label">
                  Nombre del servicio <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="svc-name" type="text" className="form-input"
                  value={form.name} onChange={set('name')}
                  placeholder="Ej: Termofusión de tuberías PEAD DN110"
                  autoFocus
                />
                <p className="form-hint">Sé específico: incluye el tipo de trabajo y materiales cuando sea posible.</p>
              </div>

              <div className="form-group">
                <label htmlFor="svc-category" className="form-label">Categoría</label>
                <select id="svc-category" className="form-select" value={form.category} onChange={set('category')}>
                  <option value="">Seleccionar categoría...</option>
                  {allCats.map(cat => (
                    <option key={cat.key} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="svc-description" className="form-label">Descripción</label>
                <textarea
                  id="svc-description" className="form-textarea"
                  value={form.description} onChange={set('description')}
                  placeholder="Describe brevemente el alcance del servicio, materiales usados, condiciones, etc."
                  rows={4} maxLength={400}
                />
                <p className="form-hint">{form.description.length}/400 caracteres</p>
              </div>

              <div className="form-group">
                <label htmlFor="svc-status" className="form-label">Estado de publicación</label>
                <select id="svc-status" className="form-select" value={form.status} onChange={set('status')}>
                  <option value="active">Activo — visible en el directorio</option>
                  <option value="draft">Borrador — no visible</option>
                </select>
              </div>

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
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar servicio'}
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
            role="dialog" aria-modal="true" aria-label="Confirmar eliminación"
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-8)', width: 380, zIndex: 101, boxShadow: 'var(--shadow-lg)' }}
          >
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-3)' }}>
              Eliminar servicio
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--sp-6)' }}>
              ¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.
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

      {/* Save toast */}
      {saved && (
        <div className="save-toast" role="status" aria-live="polite">
          <IconCheck size={16} />
          {editingId ? 'Servicio actualizado' : 'Servicio agregado'}
        </div>
      )}
    </>
  )
}
