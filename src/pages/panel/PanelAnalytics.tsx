import { useState, useEffect } from 'react'
import { IconBarChart, IconEye, IconMail, IconPhone } from '../../components/Icons'
import { fetchAnalytics } from '../../api/client'
import { useToast } from '../../components/Toast'
import type { AnalyticsResult, DailyMetric } from '../../types'

type Range = '7d' | '30d' | '90d'

const RANGE_LABELS: Record<Range, string> = { '7d': '7 días', '30d': '30 días', '90d': '90 días' }

const KPI: { key: keyof AnalyticsResult['totals']; label: string; icon: typeof IconEye; color: string; fmt?: (n: number) => string }[] = [
  { key: 'profileViews',      label: 'Vistas de perfil',   icon: IconEye,      color: '#1D4ED8' },
  { key: 'contactClicks',     label: 'Clics en contacto',  icon: IconPhone,    color: '#7C3AED' },
  { key: 'quoteFormOpens',    label: 'Formulario abierto', icon: IconMail,     color: '#0891B2' },
  { key: 'quoteFormSubmits',  label: 'Cotizaciones env.',  icon: IconMail,     color: '#059669' },
  { key: 'rfqsReceived',      label: 'RFQs recibidas',     icon: IconBarChart, color: '#D97706' },
  { key: 'contactRate',       label: 'Tasa de contacto',   icon: IconBarChart, color: '#DC2626', fmt: (n) => `${n.toFixed(1)}%` },
]

function TrendChart({ data }: { data: DailyMetric[] }) {
  if (data.length === 0) return null
  const maxViews = Math.max(...data.map(d => d.profileViews), 1)
  const maxRfqs  = Math.max(...data.map(d => d.rfqs), 1)
  const W = 600
  const H = 160
  const n = data.length

  const viewPts = data.map((d, i) => {
    const x = n > 1 ? (i / (n - 1)) * W : W / 2
    const y = H - (d.profileViews / maxViews) * (H - 8)
    return `${x},${y}`
  }).join(' ')

  const rfqPts = data.map((d, i) => {
    const x = n > 1 ? (i / (n - 1)) * W : W / 2
    const y = H - (d.rfqs / maxRfqs) * (H - 8)
    return `${x},${y}`
  }).join(' ')

  const fmtLabel = (iso: string) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  const step = Math.max(1, Math.floor(n / 6))

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: '100%', minWidth: 320, maxWidth: 700 }} aria-label="Tendencia de visitas y RFQs">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={0} y1={H * (1 - t)} x2={W} y2={H * (1 - t)} stroke="var(--color-border)" strokeWidth={1} />
        ))}
        {/* Views line */}
        <polyline points={viewPts} fill="none" stroke="#1D4ED8" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* RFQs line */}
        <polyline points={rfqPts} fill="none" stroke="#D97706" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 3" />
        {/* X axis labels */}
        {data.map((d, i) => {
          if (i % step !== 0 && i !== n - 1) return null
          const x = n > 1 ? (i / (n - 1)) * W : W / 2
          return (
            <text key={i} x={x} y={H + 18} textAnchor="middle" fontSize={10} fill="var(--color-text-muted)">
              {fmtLabel(d.date)}
            </text>
          )
        })}
      </svg>
      <div style={{ display: 'flex', gap: 'var(--sp-6)', marginTop: 'var(--sp-2)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 24, height: 2, background: '#1D4ED8', display: 'inline-block', borderRadius: 2 }} />
          Vistas de perfil
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 24, height: 2, background: '#D97706', display: 'inline-block', borderRadius: 2, opacity: 0.7 }} />
          RFQs recibidas
        </span>
      </div>
    </div>
  )
}

export default function PanelAnalytics() {
  const { addToast } = useToast()
  const [range, setRange] = useState<Range>('30d')
  const [data, setData] = useState<AnalyticsResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchAnalytics(range)
      .then(setData)
      .catch(() => addToast('No se pudo cargar las analíticas', 'error'))
      .finally(() => setLoading(false))
  }, [range]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="panel-topbar">
        <span className="panel-topbar-title">Analíticas</span>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          {(['7d', '30d', '90d'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)',
                background: range === r ? 'var(--color-cta)' : 'var(--color-surface)',
                color: range === r ? '#fff' : 'var(--color-text-secondary)',
                border: `1px solid ${range === r ? 'var(--color-cta)' : 'var(--color-border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-content">
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : data ? (
          <>
            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-8)' }}>
              {KPI.map(({ key, label, icon: Icon, color, fmt }) => (
                <div key={key} className="analytics-kpi-card">
                  <div className="analytics-kpi-icon" style={{ background: color + '18', color }}>
                    <Icon size={18} />
                  </div>
                  <p className="analytics-kpi-value" style={{ color }}>
                    {fmt ? fmt(data.totals[key]) : data.totals[key].toLocaleString('es-CL')}
                  </p>
                  <p className="analytics-kpi-label">{label}</p>
                </div>
              ))}
            </div>

            {/* Trend chart */}
            <div className="card" style={{ padding: 'var(--sp-6)', marginBottom: 'var(--sp-8)' }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--sp-5)' }}>
                Tendencia — últimos {data.days} días
              </p>
              <TrendChart data={data.trend} />
            </div>

            {/* Daily table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 'var(--sp-5) var(--sp-6)', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-primary)' }}>
                  Detalle diario
                </p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-surface-2)' }}>
                      {['Fecha', 'Vistas', 'Clics contacto', 'RFQs'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.trend].reverse().map(d => (
                      <tr key={d.date} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '10px 16px', color: 'var(--color-text)' }}>
                          {new Date(d.date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--color-text)', fontWeight: d.profileViews > 0 ? 'var(--weight-semibold)' : undefined }}>{d.profileViews}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--color-text)' }}>{d.contactClicks}</td>
                        <td style={{ padding: '10px 16px', color: d.rfqs > 0 ? '#D97706' : 'var(--color-text-muted)', fontWeight: d.rfqs > 0 ? 'var(--weight-semibold)' : undefined }}>{d.rfqs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: 'var(--sp-12)' }}>
            <div className="empty-state-icon"><IconBarChart size={40} /></div>
            <h3>Sin datos</h3>
            <p>Aún no hay eventos registrados para tu perfil.</p>
          </div>
        )}
      </div>
    </>
  )
}
