import { useState, useCallback } from 'react'
import { IconCheck, IconUser } from '../../components/Icons'
import { CATEGORIES, REGIONS } from '../../data/mockData'
import { usePanelCompany } from './PanelLayout'
import type { Company } from '../../types'

type ProfileForm = Pick<Company, 'name' | 'tagline' | 'description' | 'location' | 'region' | 'phone' | 'email' | 'categories'> & {
  website: string
  yearsActive: string
}

function computeCompletion(form: ProfileForm): number {
  const fields: (keyof ProfileForm)[] = ['name', 'tagline', 'description', 'location', 'region', 'phone', 'email', 'categories']
  const filled = fields.filter(f => {
    const v = form[f]
    return Array.isArray(v) ? v.length > 0 : Boolean(v)
  })
  return Math.round((filled.length / fields.length) * 100)
}

export default function PanelProfile() {
  const company = usePanelCompany()

  const [form, setForm] = useState<ProfileForm>({
    name: company?.name ?? '',
    tagline: company?.tagline ?? '',
    description: company?.description ?? '',
    location: company?.location ?? '',
    region: company?.region ?? '',
    phone: company?.phone ?? '',
    email: company?.email ?? '',
    website: company?.website ?? '',
    yearsActive: String(company?.yearsActive ?? ''),
    categories: company?.categories ?? [],
  })

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (field: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const toggleCategory = (slug: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(slug)
        ? prev.categories.filter(s => s !== slug)
        : [...prev.categories, slug],
    }))
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }, [])

  const completion = computeCompletion(form)
  const completionColor = completion < 50 ? '#DC2626' : completion < 80 ? '#D97706' : 'var(--color-success)'

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
                  {REGIONS.slice(1).map(r => <option key={r} value={r}>{r}</option>)}
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

        {/* Section 4 — Especialidades */}
        <div className="panel-section">
          <div className="panel-section-header">
            <h2 className="panel-section-title">Especialidades</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Seleccionadas: {form.categories.length}
            </p>
          </div>
          <div className="panel-section-body">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-5)', lineHeight: 1.6 }}>
              Selecciona las categorías de servicio que ofrece tu empresa. Aparecerás en los listados de cada categoría seleccionada.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-3)' }}>
              {CATEGORIES.map(cat => {
                const checked = form.categories.includes(cat.slug)
                return (
                  <label
                    key={cat.slug}
                    className={`check-card${checked ? ' checked' : ''}`}
                    onClick={() => toggleCategory(cat.slug)}
                  >
                    <span className="check-card-box">
                      {checked && <IconCheck size={11} />}
                    </span>
                    <span>{cat.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

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
