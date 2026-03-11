import { Link } from 'react-router-dom'
import type { Category } from '../types'
import { CATEGORY_ICONS } from './Icons'

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.icon] ?? CATEGORY_ICONS['building']

  return (
    <Link
      to={`/servicios/${category.slug}`}
      className="category-card"
      aria-label={`Ver empresas de ${category.name}`}
    >
      <div className="category-card-icon" aria-hidden="true">
        <Icon size={22} />
      </div>
      <p className="category-card-name">{category.name}</p>
      <p className="category-card-description">{category.description}</p>
      <p className="category-card-count">
        {category.companyCount} {category.companyCount === 1 ? 'empresa' : 'empresas'}
      </p>
    </Link>
  )
}
