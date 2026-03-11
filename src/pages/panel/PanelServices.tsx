import { useState } from 'react'
import { IconPlus, IconPencil, IconTrash, IconPackage, IconX, IconCheck } from '../../components/Icons'
import { CATEGORIES } from '../../data/mockData'
import { usePanelCompany } from './PanelLayout'

interface Service {
  id: string
  name: string
  category: string
  description: string
  status: 'active' | 'draft'
}

type ServiceForm = Omit<Service, 'id'>

const EMPTY_FORM: ServiceForm = {
  name: '',
  category: '',
  description: '',
  status: 'active',
}

function buildInitialServices(companyServices: string[]): Service[] {
  return companyServices.map((svc, i) => {
    const matchedCat = CATEGORIES.find(c =>
      svc.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
    )
    return {
      id: `svc-${i + 1}`,
      name: svc,
      category: matchedCat?.slug ?? CATEGORIES[0].slug,
      description: '',
      status: 'active' as const,
    }
  })
}

export default function PanelServices() {
  const company = usePanelCompany()

  const [services, setServices] = useState<Service[]>(() =>
    company ? buildInitialServices(company.services) : []
  )

  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setPanelOpen(true)
  }

  const openEdit = (svc: Service) => {
    setForm({ name: svc.name, category: svc.category, description: svc.description, status: svc.status })
    setEditingId(svc.id)
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setEditingId(null)
  }

  const set = (field: keyof ServiceForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.category) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)

    if (editingId) {
      setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...form } : s))
    } else {
      const newId = `svc-${Date.now()}`
      setServices(prev => [...prev, { id: newId, ...form }])
    }

    closePanel()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id))
    setDeleteId(null)
  }

  const toggleStatus = (id: string) => {
    setServices(prev =>
      prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'draft' : 'active' } : s)
    )
  }

  const activeCount = services.filter(s => s.status === 'active').length
  const draftCount = services.filter(s => s.status === 'draft').length

  const getCategoryName = (slug: string) =>
    CATEGORIES.find(c => c.slug === slug)?.name ?? slug

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
                      <th style={{ width: '35%' }}>Nombre del servicio</th>
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
                          <span className="badge badge-gray">{getCategoryName(svc.category)}</span>
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', maxWidth: 220 }}>
                          {svc.description
                            ? <span title={svc.description}>{svc.description.length > 60 ? svc.description.slice(0, 60) + '…' : svc.description}</span>
                            : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin descripción</span>
                          }
                        </td>
                        <td>
                          <button
                            onClick={() => toggleStatus(svc.id)}
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
                              onClick={() => openEdit(svc)}
                              title="Editar servicio"
                              aria-label={`Editar ${svc.name}`}
                            >
                              <IconPencil size={14} />
                            </button>
                            <button
                              className="icon-btn danger"
                              onClick={() => setDeleteId(svc.id)}
                              title="Eliminar servicio"
                              aria-label={`Eliminar ${svc.name}`}
                            >
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
                      <button className="icon-btn" onClick={() => openEdit(svc)} aria-label={`Editar ${svc.name}`}>
                        <IconPencil size={14} />
                      </button>
                      <button className="icon-btn danger" onClick={() => setDeleteId(svc.id)} aria-label={`Eliminar ${svc.name}`}>
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <span className="badge badge-gray">{getCategoryName(svc.category)}</span>
                    <button
                      onClick={() => toggleStatus(svc.id)}
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

      {/* ── Slide panel ─────────────────────── */}
      {panelOpen && (
        <>
          <div className="slide-overlay" onClick={closePanel} aria-hidden="true" />
          <div
            className="slide-panel"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? 'Editar servicio' : 'Agregar servicio'}
          >
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
                  id="svc-name"
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Ej: Termofusión de tuberías PEAD DN110"
                  autoFocus
                />
                <p className="form-hint">Sé específico: incluye el tipo de trabajo y materiales cuando sea posible.</p>
              </div>

              <div className="form-group">
                <label htmlFor="svc-category" className="form-label">
                  Categoría <span className="required" aria-hidden="true">*</span>
                </label>
                <select id="svc-category" className="form-select" value={form.category} onChange={set('category')}>
                  <option value="">Seleccionar categoría...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="svc-description" className="form-label">Descripción</label>
                <textarea
                  id="svc-description"
                  className="form-textarea"
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Describe brevemente el alcance del servicio, materiales usados, condiciones, etc."
                  rows={4}
                  maxLength={400}
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
            </div>

            <div className="slide-panel-footer">
              <button className="btn btn-ghost" onClick={closePanel}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.category}
                aria-busy={saving}
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar servicio'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete confirm ───────────────────── */}
      {deleteId && (
        <>
          <div className="slide-overlay" onClick={() => setDeleteId(null)} aria-hidden="true" />
          <div
            className="panel-delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar eliminación"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--sp-8)',
              width: 380,
              zIndex: 101,
              boxShadow: 'var(--shadow-lg)',
            }}
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
