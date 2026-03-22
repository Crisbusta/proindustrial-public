import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CategoryGroup } from '../types'
import { CATEGORY_ICONS, IconChevronDown } from './Icons'

interface CategoryAccordionProps {
  group: CategoryGroup
}

export default function CategoryAccordion({ group }: CategoryAccordionProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = CATEGORY_ICONS[group.icon] ?? CATEGORY_ICONS['building']

  return (
    <div className={`category-accordion${expanded ? ' category-accordion--open' : ''}`}>
      <button
        className="category-accordion-header"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        aria-controls={`accordion-body-${group.slug}`}
      >
        <div className="category-accordion-icon" aria-hidden="true">
          <Icon size={28} />
        </div>
        <p className="category-accordion-name">{group.name}</p>
        <p className="category-accordion-description">{group.description}</p>
        <div className="category-accordion-footer">
          <span className="category-accordion-cta">
            Ver subcategorías
          </span>
          <IconChevronDown
            size={18}
            className={`category-accordion-chevron${expanded ? ' expanded' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div
          id={`accordion-body-${group.slug}`}
          className="category-accordion-body"
        >
          {group.subcategories.map(sub => {
            const SubIcon = CATEGORY_ICONS[sub.icon] ?? CATEGORY_ICONS['building']
            return (
              <Link
                key={sub.slug}
                to={`/servicios/${group.slug}/${sub.slug}`}
                className="category-accordion-subcategory"
                aria-label={`Ver ${sub.name}`}
              >
                <SubIcon size={15} aria-hidden="true" />
                <span className="category-accordion-subcategory-name">{sub.name}</span>
                {sub.children && (
                  <span className="category-accordion-subcategory-count">
                    {sub.children.length} tipos
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
