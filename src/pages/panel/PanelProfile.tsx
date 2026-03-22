import { useState, useEffect, useCallback } from 'react'
import { IconCheck, IconUser } from '../../components/Icons'
import { fetchPanelProfile, updatePanelProfile, fetchRegions, fetchCategoryGroups } from '../../api/client'
import type { CategoryGroup } from '../../types'

interface ProfileForm {
  name: string
  tagline: string
  description: string
  location: string
  region: string
  phone: string
  email: string
  website: string
  yearsActive: string
}

function computeCompletion(form: ProfileForm): number {
  const fields: (keyof ProfileForm)[] = ['name', 'tagline', 'description', 'location', 'region', 'phone', 'email']
  const filled = fields.filter(f => Boolean(form[f]))
  return Math.round((filled.length / fields.length) * 100)
}

export default function PanelProfile() {
  const [form, setForm] = useState<ProfileForm>({
    name: '', tagline: '', description: '', location: '',
    region: '', phone: '', email: '', website: '', yearsActive: '',
  })
  const [regions, setRegions] = useState<string[]>([])
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPanelProfile().then(c => {
      setForm({
        name: c.name,
        tagline: c.tagline,
        description: c.description,
        location: c.location,
        region: c.region,
        phone: c.phone,
        email: c.email,
        website: c.website ?? '',
        yearsActive: c.yearsActive != null ? String(c.yearsActive) : '',
      })
    }).catch(() => {})
    fetchRegions().then(rs => setRegions(rs.filter(r => r !== 'Todas las regiones'))).catch(() => {})
    fetchCategoryGroups().then(setGroups).catch(() => {})
  }, [])

  const set = (field: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError('')
    try {
      await updatePanelProfile({
        name: form.name || undefined,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        location: form.location || undefined,
        region: form.region || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        yearsActive: form.yearsActive ? Number(form.yearsActive) : undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }, [form])

  const completion = computeCompletion(form)
  const completionColor = completion < 50 ? '#DC2626' : completion < 80 ? '#D97706' : 'var(--color-success)'

  const allCats = groups.flatMap(g => [
    { slug: g.slug, name: g.name },
    ...g.subcategories.map(s => ({ slug: s.slug, name: s.name })),
  ])

  return (
    <>
      <div className="panel-topbar">
        <span className="panel-topbar-title">Perfil de empresa</span>
        <div className="panel-topbar-right">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Completado: <strong style={{ color: completionColor }}>{completion}%</strong>
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
            aria-busy={saving}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="panel-content" style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

        {/* Completion bar */}
        <div className="card" style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <span style={{ color: completionColor }}><IconUser size={16} /></span>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>
                Completitud del perfil
              </p>
            </div>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: completionColor }}>{completion}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completion}%`, background: completionColor }} />
          </div>
          {completion < 100 && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Completa todos los campos para maximizar tu visibilidad en el directorio.
            </p>
          )}
        </div>

        {/* Section 1 — Información general */}
        <div className="panel-section">
          <div className="panel-section-header">
            <h2 className="panel-section-title">Información general</h2>
          </div>
          <div className="panel-section-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <div className="form-group">
              <label htmlFor="prof-name" className="form-label">
                Nombre de la empresa <span className="required" aria-hidden="true">*</span>
              </label>
              <input id="prof-name" type="text" className="form-input" value={form.name} onChange={set('name')} placeholder="Nombre legal de la empresa" />
            </div>

            <div className="form-group">
              <label htmlFor="prof-tagline" className="form-label">
                Eslogan / Tagline <span className="required" aria-hidden="true">*</span>
              </label>
              <input id="prof-tagline" type="text" className="form-input" value={form.tagline} onChange={set('tagline')} placeholder="Ej: Especialistas en termofusión PEAD desde 1998" maxLength={100} />
              <p className="form-hint">Frase corta que aparece en las tarjetas del directorio. Máx. 100 caracteres.</p>
            </div>

            <div className="form-group">
              <label htmlFor="prof-description" className="form-label">
                Descripción de la empresa <span className="required" aria-hidden="true">*</span>
              </label>
              <textarea id="prof-description" className="form-textarea" value={form.description} onChange={set('description')} placeholder="Describe tu empresa: experiencia, tipos de proyectos, zonas de cobertura..." rows={5} maxLength={600} />
              <p className="form-hint">{form.description.length}/600 caracteres</p>
            </div>

            <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
              <div className="form-group">
                <label htmlFor="prof-years" className="form-label">Años de experiencia</label>
                <input id="prof-years" type="number" className="form-input" value={form.yearsActive} onChange={set('yearsActive')} placeholder="Ej: 15" min="0" max="100" />
              </div>
              <div className="form-group">
                <label htmlFor="prof-website" className="form-label">Sitio web</label>
                <input id="prof-website" type="url" className="form-input" value={form.website} onChange={set('website')} placeholder="https://www.empresa.cl" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 — Ubicación */}
        <div className="panel-section">
          <div className="panel-section-header">
            <h2 className="panel-section-title">Ubicación</h2>
          </div>
          <div className="panel-section-body">
            <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
              <div className="form-group">
                <label htmlFor="prof-location" className="form-label">
                  Ciudad <span className="required" aria-hidden="true">*</span>
                </label>
                <input id="prof-location" type="text" className="form-input" value={form.location} onChange={set('location')} placeholder="Ej: Antofagasta" />
              </div>
              <div className="form-group">
                <label htmlFor="prof-region" className="form-label">
                  Región <span className="required" aria-hidden="true">*</span>
                </label>
                <select id="prof-region" className="form-select" value={form.region} onChange={set('region')}>
                  <option value="">Seleccionar región...</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 — Contacto */}
        <div className="panel-section">
          <div className="panel-section-header">
            <h2 className="panel-section-title">Datos de contacto</h2>
          </div>
          <div className="panel-section-body">
            <div className="grid-2" style={{ gap: 'var(--sp-5)' }}>
              <div className="form-group">
                <label htmlFor="prof-email" className="form-label">
                  Correo de contacto <span className="required" aria-hidden="true">*</span>
                </label>
                <input id="prof-email" type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="contacto@empresa.cl" autoComplete="email" />
                <p className="form-hint">Aquí llegarán las solicitudes de cotización.</p>
              </div>
              <div className="form-group">
                <label htmlFor="prof-phone" className="form-label">
                  Teléfono <span className="required" aria-hidden="true">*</span>
                </label>
                <input id="prof-phone" type="tel" className="form-input" value={form.phone} onChange={set('phone')} placeholder="+56 2 xxxx xxxx" autoComplete="tel" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 — Especialidades (display only, read from API) */}
        {allCats.length > 0 && (
          <div className="panel-section">
            <div className="panel-section-header">
              <h2 className="panel-section-title">Categorías disponibles</h2>
            </div>
            <div className="panel-section-body">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Las categorías en las que aparece tu empresa se gestionan a través de tus servicios publicados.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3) var(--sp-4)', fontSize: 'var(--text-sm)', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* Save footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--sp-2)' }}>
          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving} aria-busy={saving}>
            {saving ? 'Guardando...' : 'Guardar todos los cambios'}
          </button>
        </div>
      </div>

      {/* Save toast */}
      {saved && (
        <div className="save-toast" role="status" aria-live="polite">
          <IconCheck size={16} />
          Cambios guardados correctamente
        </div>
      )}
    </>
  )
}
