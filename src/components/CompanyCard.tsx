import { Link } from 'react-router-dom'
import type { Company } from '../types'
import { IconMapPin } from './Icons'

interface CompanyCardProps {
  company: Company
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 3)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link
      to={`/empresas/${company.slug}`}
      className="company-card card-link"
      aria-label={`Ver perfil de ${company.name}`}
    >
      <div className="company-card-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>
            <div className="company-avatar" aria-hidden="true">
              {initials(company.name)}
            </div>
            <div>
              <p className="company-card-name">{company.name}</p>
              <p className="company-card-tagline">{company.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="company-meta">
        <span className="company-meta-item">
          <IconMapPin size={13} />
          {company.location}, {company.region}
        </span>
        {company.yearsActive && (
          <span className="company-meta-item">
            {company.yearsActive} años de experiencia
          </span>
        )}
      </div>

      <div className="company-services">
        {company.services.slice(0, 3).map(svc => (
          <span key={svc} className="service-chip">{svc}</span>
        ))}
        {company.services.length > 3 && (
          <span className="service-chip" style={{ opacity: 0.6 }}>
            +{company.services.length - 3} más
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-2)' }}>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            color: 'var(--color-cta)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-1)',
          }}
        >
          Ver perfil completo →
        </span>
      </div>
    </Link>
  )
}
