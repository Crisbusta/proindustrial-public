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
  tagline: string | null
  description: string | null
  location: string | null
  region: string | null
  categories: string[]
  services: string[]
  phone: string | null
  email: string | null
  website?: string | null
  yearsActive?: number | null
  featured: boolean
  logoUrl?: string | null
  coverUrl?: string | null
}

export interface ServiceImage {
  id: string
  serviceId: string
  url: string
  altText: string | null
  sortOrder: number
  createdAt: string
}

export interface CompanyService {
  id: string
  companyId: string
  name: string
  category: string | null
  description: string | null
  status: 'active' | 'draft'
  createdAt: string
  images?: ServiceImage[]
}

export interface CompanyCertification {
  id: string
  companyId: string
  name: string
  issuer: string | null
  documentUrl: string | null
  issuedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface ProjectImage {
  id: string
  projectId: string
  url: string
  altText: string | null
  sortOrder: number
}

export interface CompanyProject {
  id: string
  companyId: string
  title: string
  description: string | null
  clientName: string | null
  year: number | null
  coverUrl: string | null
  sortOrder: number
  createdAt: string
  images: ProjectImage[]
}

// Form input types (used by form state)
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

// API response types (returned by backend)
export interface QuoteRequestResponse {
  id: string
  requesterName: string
  requesterCompany: string | null
  requesterEmail: string
  requesterPhone: string | null
  service: string
  description: string | null
  location: string | null
  targetCompanyId: string | null
  status: 'new' | 'read' | 'responded'
  replyNote: string | null
  repliedAt: string | null
  outcome: 'won' | 'negotiating' | 'lost_price' | 'lost_other' | 'no_response' | 'cancelled' | 'no_capacity' | null
  outcomeNote: string | null
  closedAt: string | null
  createdAt: string
}

export interface ProviderRegistrationResponse {
  id: string
  companyName: string
  email: string
  phone: string | null
  region: string | null
  services: string[]
  description: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// (CompanyService is now defined above with images field)

export interface DashboardStats {
  totalQuotes: number
  newQuotes: number
  readQuotes: number
  respondedQuotes: number
  totalServices: number
}

export interface LoginResponse {
  token: string
  userId: string
  email: string
  role: 'provider' | 'admin'
  mustChangePassword: boolean
  company?: Company
}

export interface MeResponse {
  userId: string
  email: string
  role: 'provider' | 'admin'
  mustChangePassword: boolean
  company: Company
}

export interface AdminMeResponse {
  userId: string
  email: string
  role: 'admin'
  mustChangePassword: boolean
}

export interface AdminRegistration extends ProviderRegistrationResponse {}

export interface AdminApprovalResponse {
  registration: ProviderRegistrationResponse
  company: Company
  user: {
    id: string
    email: string
    companyId: string | null
    role: 'provider'
    createdAt: string
  }
  initialPassword: string
  emailStatus?: 'sent' | 'logged' | 'failed'
  emailNote?: string
}
