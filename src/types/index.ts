export interface Category {
  slug: string
  name: string
  description: string
  companyCount: number
  icon: string // SVG path key
}

export interface SubSubcategory {
  slug: string
  name: string
}

export interface Subcategory {
  slug: string
  name: string
  description: string
  icon: string
  children?: SubSubcategory[]
}

export interface CategoryGroup {
  slug: string
  name: string
  description: string
  icon: string
  subcategories: Subcategory[]
}

export interface Company {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  location: string
  region: string
  categories: string[]   // category slugs
  services: string[]     // free-text service names
  phone: string
  email: string
  website?: string
  yearsActive?: number
  featured: boolean
}

export interface QuoteRequest {
  name: string
  company: string
  email: string
  phone: string
  service: string
  description: string
  location: string
}

export interface ProviderRegistration {
  companyName: string
  email: string
  phone: string
  region: string
  services: string[]
  description: string
}
