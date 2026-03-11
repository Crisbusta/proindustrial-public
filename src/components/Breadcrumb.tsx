import { Link } from 'react-router-dom'
import { IconChevronRight } from './Icons'

interface Crumb {
  label: string
  to?: string
}

interface BreadcrumbProps {
  crumbs: Crumb[]
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Navegación de miga de pan">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {i > 0 && (
              <span className="breadcrumb-sep" aria-hidden="true">
                <IconChevronRight size={14} />
              </span>
            )}
            {isLast || !crumb.to ? (
              <span className={isLast ? 'breadcrumb-current' : undefined}>
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.to}>{crumb.label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
