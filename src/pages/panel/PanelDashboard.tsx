import { Link } from 'react-router-dom'
import { IconInbox, IconPackage, IconUser, IconArrowRight, IconShield } from '../../components/Icons'
import { usePanelCompany } from './PanelLayout'

interface QuoteRequest {
  id: string
  from: string
  service: string
  location: string
  date: string
  status: 'new' | 'read' | 'responded'
}

const MOCK_REQUESTS: QuoteRequest[] = [
  { id: 'req-1', from: 'Constructora Norte S.A.', service: 'Termofusión PEAD DN110', location: 'Antofagasta', date: '2026-03-10', status: 'new' },
  { id: 'req-2', from: 'Minera Atacama Ltda.', service: 'Tuberías industriales a presión', location: 'Calama', date: '2026-03-09', status: 'new' },
  { id: 'req-3', from: 'Hidráulica del Norte SpA', service: 'Termofusión PEAD DN63', location: 'Iquique', date: '2026-03-07', status: 'read' },
  { id: 'req-4', from: 'Constructora Sur Ltda.', service: 'Reparación red agua potable', location: 'Temuco', date: '2026-03-04', status: 'responded' },
  { id: 'req-5', from: 'Aguas del Pacífico S.A.', service: 'Termofusión PEAD DN160', location: 'Copiapó', date: '2026-02-28', status: 'responded' },
]

const STATUS_LABELS: Record<QuoteRequest['status'], string> = {
  new: 'Nueva',
  read: 'Vista',
  responded: 'Respondida',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })

export default function PanelDashboard() {
  const company = usePanelCompany()
  const newCount = MOCK_REQUESTS.filter(r => r.status === 'new').length
  const servicesCount = company?.services.length ?? 0
  const profilePct = company ? Math.round(
    ([company.name, company.tagline, company.description, company.email, company.phone, company.location]
      .filter(Boolean).length / 6) * 100
  ) : 0

  const kpis = [
    {
      label: 'Solicitudes nuevas',
      value: newCount,
      icon: IconInbox,
      iconBg: '#EFF6FF',
      iconColor: '#1D4ED8',
      delta: `${MOCK_REQUESTS.length} solicitudes en total`,
      to: '/panel/solicitudes',
    },
    {
      label: 'Servicios publicados',
      value: servicesCount,
      icon: IconPackage,
      iconBg: '#F0FDF4',
      iconColor: '#166534',
      delta: 'Activos en el directorio',
      to: '/panel/servicios',
    },
    {
      label: 'Perfil completado',
      value: `${profilePct}%`,
      icon: IconUser,
      iconBg: profilePct < 80 ? '#FFF7ED' : '#F0FDF4',
      iconColor: profilePct < 80 ? '#C2410C' : '#166534',
      delta: profilePct < 100 ? 'Completa tu perfil para más visibilidad' : 'Perfil al 100%',
      to: '/panel/perfil',
    },
  ]

  return (
    <>
      <div className="panel-topbar">
        <span className="panel-topbar-title">Resumen</span>
        <div className="panel-topbar-right">
          {newCount > 0 && (
            <span className="panel-topbar-badge-mobile" style={{ fontSize: 'var(--text-xs)', background: '#EFF6FF', color: '#1D4ED8', padding: '2px 10px', borderRadius: 20, fontWeight: 'var(--weight-semibold)' }}>
              {newCount} solicitudes sin revisar
            </span>
          )}
        </div>
      </div>

      <div className="panel-content">
        {/* Greeting */}
        <div style={{ marginBottom: 'var(--sp-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
            Buenos días{company ? `, ${company.name.split(' ')[0]}` : ''}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--sp-1)' }}>
            Aquí tienes un resumen de la actividad reciente de tu empresa en ProIndustrial.
          </p>
        </div>

        {/* KPIs */}
        <div className="kpi-grid" style={{ marginBottom: 'var(--sp-8)' }}>
          {kpis.map(kpi => (
            <Link key={kpi.label} to={kpi.to} className="kpi-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div className="kpi-card-top">
                <p className="kpi-label">{kpi.label}</p>
                <div className="kpi-icon" style={{ background: kpi.iconBg, color: kpi.iconColor }}>
                  <kpi.icon size={18} />
                </div>
              </div>
              <p className="kpi-value">{kpi.value}</p>
              <p className="kpi-delta">{kpi.delta}</p>
            </Link>
          ))}
        </div>

        {/* Profile completion alert */}
        {profilePct < 80 && (
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-4) var(--sp-5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-8)', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <span style={{ color: '#C2410C' }}><IconShield size={18} /></span>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: '#7C2D12' }}>Completa tu perfil para mejorar tu visibilidad</p>
                <p style={{ fontSize: 'var(--text-xs)', color: '#9A3412', marginTop: 2 }}>Los perfiles completos reciben 3x más solicitudes.</p>
              </div>
            </div>
            <Link to="/panel/perfil" className="btn btn-sm" style={{ background: '#EA580C', color: '#fff', borderColor: '#EA580C', flexShrink: 0 }}>
              Completar perfil
            </Link>
          </div>
        )}

        {/* Recent requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="panel-section">
            <div className="panel-section-header">
              <h2 className="panel-section-title">Solicitudes recientes</h2>
              <Link to="/panel/solicitudes" className="btn btn-ghost btn-sm">
                Ver todas
                <IconArrowRight size={14} />
              </Link>
            </div>

            <div className="panel-table-desktop">
              <div className="panel-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="panel-table">
                  <thead>
                    <tr>
                      <th>Empresa</th>
                      <th>Servicio solicitado</th>
                      <th className="col-location">Ubicación</th>
                      <th className="col-date">Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_REQUESTS.slice(0, 5).map(req => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-primary)' }}>{req.from}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{req.service}</td>
                        <td className="col-location" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>{req.location}</td>
                        <td className="col-date" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                          {formatDate(req.date)}
                        </td>
                        <td>
                          <span className={`status-badge ${req.status}`}>
                            {STATUS_LABELS[req.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="dashboard-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-5)' }}>
            <Link to="/panel/servicios" className="card card-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-5)', textDecoration: 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-cta-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-cta)', flexShrink: 0 }}>
                <IconPackage size={20} />
              </div>
              <div>
                <p style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>Agregar servicio</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>Publica un nuevo servicio en el directorio</p>
              </div>
            </Link>
            <Link to="/panel/perfil" className="card card-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-5)', textDecoration: 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)', flexShrink: 0 }}>
                <IconUser size={20} />
              </div>
              <div>
                <p style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>Editar perfil</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>Actualiza los datos de tu empresa</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
