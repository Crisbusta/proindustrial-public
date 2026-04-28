import { useState, useEffect, useCallback, useRef } from 'react'
import { IconCheck, IconUser, IconCamera, IconUpload } from '../../components/Icons'
import {
  fetchPanelProfile, updatePanelProfile, fetchRegions,
  uploadCompanyLogo, uploadCompanyCover,
  fetchServiceRegions, updateServiceRegions,
} from '../../api/client'
import type { Company } from '../../types'

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

function computeCompletion(form: ProfileForm, hasLogo: boolean, hasCover: boolean, regionCount: number): number {
  const textFields: (keyof ProfileForm)[] = ['name', 'tagline', 'description', 'location', 'region', 'phone', 'email']
  const filled = textFields.filter(f => Boolean(form[f])).length
  const total = textFields.length + 3 // +logo, +cover, +regions
  const extras = (hasLogo ? 1 : 0) + (hasCover ? 1 : 0) + (regionCount > 0 ? 1 : 0)
  return Math.round(((filled + extras) / total) * 100)
}

export default function PanelProfile() {
  const [form, setForm] = useState<ProfileForm>({
    name: '', tagline: '', description: '', location: '',
    region: '', phone: '', email: '', website: '', yearsActive: '',
  })
  const [company, setCompany] = useState<Company | null>(null)
  const [regions, setRegions] = useState<string[]>([])
  const [serviceRegions, setServiceRegions] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [savingRegions, setSavingRegions] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPanelProfile().then(c => {
      setCompany(c)
      setForm({
        name: c.name,
        tagline: c.tagline ?? '',
        description: c.description ?? '',
        location: c.location ?? '',
        region: c.region ?? '',
        phone: c.phone ?? '',
        email: c.email ?? '',
        website: c.website ?? '',
        yearsActive: c.yearsActive != null ? String(c.yearsActive) : '',
      })
    }).catch(() => {})
    fetchRegions().then(rs => setRegions(rs.filter(r => r !== 'Todas las regiones'))).catch(() => {})
    fetchServiceRegions().then(r => setServiceRegions(r.regions)).catch(() => {})
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

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const { url } = await uploadCompanyLogo(file)
      setCompany(prev => prev ? { ...prev, logoUrl: url } : prev)
    } catch {}
    setUploadingLogo(false)
    e.target.value = ''
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const { url } = await uploadCompanyCover(file)
      setCompany(prev => prev ? { ...prev, coverUrl: url } : prev)
    } catch {}
    setUploadingCover(false)
    e.target.value = ''
  }

  const toggleRegion = async (region: string) => {
    const next = serviceRegions.includes(region)
      ? serviceRegions.filter(r => r !== region)
      : [...serviceRegions, region]
    setServiceRegions(next)
    setSavingRegions(true)
    try {
      await updateServiceRegions(next)
    } catch {}
    setSavingRegions(false)
  }

  const hasLogo = Boolean(company?.logoUrl)
  const hasCover = Boolean(company?.coverUrl)
  const completion = computeCompletion(form, hasLogo, hasCover, serviceRegions.length)
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

        {/* Section — Imagen corporativa */}
        <div className="panel-section">
          <div className="panel-section-header">
            <h2 className="panel-section-title">Imagen corporativa</h2>
          </div>
          <div className="panel-section-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>

            {/* Cover */}
            <div className="form-group">
              <label className="form-label">Imagen de portada</label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleCoverChange}
              />
              <div className="cover-preview-wrap" onClick={() => coverInputRef.current?.click()}>
                {company?.coverUrl
                  ? <img src={company.coverUrl} alt="Portada" />
                  : (
                    <div className="cover-preview-empty">
                      <IconCamera size={28} />
                      <span>Clic para subir imagen de portada</span>
                    </div>
                  )
                }
                <div className="cover-preview-overlay">
                  {uploadingCover
                    ? <div className="upload-spinner" />
                    : <><IconUpload size={16} />{company?.coverUrl ? 'Cambiar portada' : 'Subir portada'}</>
                  }
                </div>
              </div>
              <p className="form-hint">JPG, PNG o WebP · máx. 5 MB · recomendado 1200×400 px.</p>
            </div>

            {/* Logo */}
            <div className="form-group">
              <label className="form-label">Logo de la empresa</label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                <div className="logo-preview-wrap" onClick={() => logoInputRef.current?.click()}>
                  {company?.logoUrl
                    ? <img src={company.logoUrl} alt="Logo" />
                    : <div className="logo-preview-empty"><IconCamera size={20} /></div>
                  }
                  <div className="logo-preview-overlay">
                    {uploadingLogo ? <div className="upload-spinner" /> : <IconUpload size={14} />}
                  </div>
                </div>
                <div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    aria-busy={uploadingLogo}
                  >
                    {uploadingLogo ? 'Subiendo...' : company?.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                  </button>
                  <p className="form-hint" style={{ marginTop: 'var(--sp-2)' }}>JPG, PNG o WebP · máx. 5 MB · cuadrado recomendado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section — Información general */}
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

        {/* Section — Ubicación */}
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
                  Región principal <span className="required" aria-hidden="true">*</span>
                </label>
                <select id="prof-region" className="form-select" value={form.region} onChange={set('region')}>
                  <option value="">Seleccionar región...</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section — Contacto */}
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

        {/* Section — Zonas de cobertura */}
        {regions.length > 0 && (
          <div className="panel-section">
            <div className="panel-section-header">
              <h2 className="panel-section-title">
                Zonas de cobertura
                {savingRegions && <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-normal)', color: 'var(--color-text-muted)', marginLeft: 'var(--sp-3)' }}>Guardando…</span>}
              </h2>
            </div>
            <div className="panel-section-body">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--sp-4)' }}>
                Selecciona las regiones donde tu empresa ofrece servicios. Los compradores pueden filtrar por zona.
              </p>
              <div className="region-chips">
                {regions.map(r => (
                  <button
                    key={r}
                    className={`region-chip${serviceRegions.includes(r) ? ' active' : ''}`}
                    onClick={() => toggleRegion(r)}
                    aria-pressed={serviceRegions.includes(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {serviceRegions.length > 0 && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--sp-3)' }}>
                  {serviceRegions.length} {serviceRegions.length === 1 ? 'región seleccionada' : 'regiones seleccionadas'}
                </p>
              )}
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
