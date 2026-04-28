import type {
  CategoryGroup,
  Company,
  CompanyService,
  CompanyCertification,
  CompanyProject,
  ServiceImage,
  DashboardStats,
  AdminApprovalResponse,
  AdminMeResponse,
  AdminRegistration,
  LoginResponse,
  MeResponse,
  QuoteRequestResponse,
  ProviderRegistrationResponse,
} from '../types'

const BASE = '/api'

// ── Generic fetch helpers ──────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    // Expired or invalid token in authenticated calls → force logout
    if (res.status === 401 && options?.headers) {
      const headers = options.headers as Record<string, string>
      if (headers['Authorization']) {
        localStorage.removeItem('panelToken')
        localStorage.removeItem('adminToken')
        window.location.href = '/panel/login'
      }
    }
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? res.statusText)
  }
  const json = await res.json()
  // Most endpoints wrap in {"data": ...}; auth endpoints return flat objects
  return (json.data !== undefined ? json.data : json) as T
}

function get<T>(path: string): Promise<T> {
  return request<T>(path)
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ── Auth token helpers ─────────────────────────────────────────────────────

function getToken(storageKey: 'panelToken' | 'adminToken'): string {
  return localStorage.getItem(storageKey) ?? ''
}

function authHeaders(storageKey: 'panelToken' | 'adminToken'): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken(storageKey)}`,
  }
}

function authGet<T>(path: string, storageKey: 'panelToken' | 'adminToken' = 'panelToken'): Promise<T> {
  return request<T>(path, { headers: authHeaders(storageKey) })
}

function authPost<T>(path: string, body: unknown, storageKey: 'panelToken' | 'adminToken' = 'panelToken'): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: authHeaders(storageKey),
    body: JSON.stringify(body),
  })
}

function authPatch<T>(path: string, body: unknown, storageKey: 'panelToken' | 'adminToken' = 'panelToken'): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    headers: authHeaders(storageKey),
    body: JSON.stringify(body),
  })
}

function authPut<T>(path: string, body: unknown, storageKey: 'panelToken' | 'adminToken' = 'panelToken'): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    headers: authHeaders(storageKey),
    body: JSON.stringify(body),
  })
}

function authDelete<T>(path: string, storageKey: 'panelToken' | 'adminToken' = 'panelToken'): Promise<T> {
  return request<T>(path, { method: 'DELETE', headers: authHeaders(storageKey) })
}

// ── Public endpoints ───────────────────────────────────────────────────────

export const fetchCategoryGroups = (): Promise<CategoryGroup[]> =>
  get('/category-groups')

export const fetchRegions = (): Promise<string[]> =>
  get('/regions')

export const fetchCompanies = (params?: { category?: string; region?: string; featured?: boolean }): Promise<Company[]> => {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.region && params.region !== 'Todas las regiones') qs.set('region', params.region)
  if (params?.featured !== undefined) qs.set('featured', String(params.featured))
  const query = qs.toString()
  return get(`/companies${query ? `?${query}` : ''}`)
}

export const fetchCompanyBySlug = (slug: string): Promise<Company> =>
  get(`/companies/${slug}`)

export const fetchCompanyServices = (slug: string): Promise<CompanyService[]> =>
  get(`/companies/${slug}/services`)

export const submitQuote = (body: {
  requesterName: string
  requesterCompany?: string
  requesterEmail: string
  requesterPhone?: string
  service: string
  description?: string
  location?: string
  targetCompanyId?: string
}): Promise<QuoteRequestResponse> =>
  post('/quotes', body)

export const submitRegistration = (body: {
  companyName: string
  email: string
  phone?: string
  region?: string
  services?: string[]
  description?: string
}): Promise<ProviderRegistrationResponse> =>
  post('/registrations', body)

// ── Auth ───────────────────────────────────────────────────────────────────

export const login = (email: string, password: string): Promise<LoginResponse> =>
  post('/auth/login', { email, password })

export const getMe = (): Promise<MeResponse> =>
  authGet('/auth/me')

export const adminLogin = (email: string, password: string): Promise<LoginResponse> =>
  post('/admin/auth/login', { email, password })

export const getAdminMe = (): Promise<AdminMeResponse> =>
  authGet('/admin/auth/me', 'adminToken')

export const changePassword = (currentPassword: string, newPassword: string): Promise<{ ok: boolean; token: string }> =>
  authPost('/auth/change-password', { currentPassword, newPassword })

export const adminChangePassword = (currentPassword: string, newPassword: string): Promise<{ ok: boolean; token: string }> =>
  authPost('/admin/auth/change-password', { currentPassword, newPassword }, 'adminToken')

// ── Panel (JWT protected) ──────────────────────────────────────────────────

export const fetchDashboardStats = (): Promise<DashboardStats> =>
  authGet('/panel/dashboard/stats')

export const fetchPanelQuotes = (status?: string): Promise<QuoteRequestResponse[]> => {
  const qs = status ? `?status=${status}` : ''
  return authGet(`/panel/quotes${qs}`)
}

export const updateQuoteStatus = (id: string, status: string): Promise<{ ok: boolean }> =>
  authPatch(`/panel/quotes/${id}`, { status })

export const replyToQuote = (id: string, note: string): Promise<QuoteRequestResponse> =>
  authPost(`/panel/quotes/${id}/reply`, { note })

export const closeQuote = (id: string, outcome: string, note?: string): Promise<QuoteRequestResponse> =>
  authPost(`/panel/quotes/${id}/close`, { outcome, note: note ?? '' })

export const fetchPanelServices = (): Promise<CompanyService[]> =>
  authGet('/panel/services')

export const createService = (body: { name: string; category?: string; description?: string }): Promise<CompanyService> =>
  authPost('/panel/services', body)

export const updateService = (id: string, body: { name?: string; category?: string; description?: string; status?: string }): Promise<CompanyService> =>
  authPatch(`/panel/services/${id}`, body)

export const deleteService = (id: string): Promise<{ ok: boolean }> =>
  authDelete(`/panel/services/${id}`)

export const fetchPanelProfile = (): Promise<Company> =>
  authGet('/panel/profile')

export const updatePanelProfile = (body: {
  name?: string
  tagline?: string
  description?: string
  location?: string
  region?: string
  phone?: string
  email?: string
  website?: string
  yearsActive?: number
}): Promise<Company> =>
  authPut('/panel/profile', body)

// ── Panel: media (JWT protected) ──────────────────────────────────────────────

function authUpload<T>(path: string, file: File, storageKey: 'panelToken' | 'adminToken' = 'panelToken'): Promise<T> {
  const form = new FormData()
  form.append('file', file)
  return request<T>(path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken(storageKey)}` },
    body: form,
  })
}

export const uploadCompanyLogo = (file: File): Promise<{ url: string }> =>
  authUpload('/panel/profile/logo', file)

export const uploadCompanyCover = (file: File): Promise<{ url: string }> =>
  authUpload('/panel/profile/cover', file)

export const fetchServiceRegions = (): Promise<{ regions: string[] }> =>
  authGet('/panel/profile/regions')

export const updateServiceRegions = (regions: string[]): Promise<{ regions: string[] }> =>
  authPut('/panel/profile/regions', { regions })

export const fetchServiceImages = (serviceId: string): Promise<ServiceImage[]> =>
  authGet(`/panel/services/${serviceId}/images`)

export const uploadServiceImage = (serviceId: string, file: File): Promise<ServiceImage> =>
  authUpload(`/panel/services/${serviceId}/images`, file)

export const deleteServiceImage = (serviceId: string, imgId: string): Promise<{ ok: boolean }> =>
  authDelete(`/panel/services/${serviceId}/images/${imgId}`)

export const reorderServiceImages = (serviceId: string, orders: { id: string; sortOrder: number }[]): Promise<{ ok: boolean }> =>
  authPatch(`/panel/services/${serviceId}/images/reorder`, { orders })

export const fetchCertifications = (): Promise<CompanyCertification[]> =>
  authGet('/panel/certifications')

export const createCertification = (body: { name: string; issuer?: string; issuedAt?: string; expiresAt?: string }): Promise<CompanyCertification> =>
  authPost('/panel/certifications', body)

export const updateCertification = (id: string, body: { name: string; issuer?: string; issuedAt?: string; expiresAt?: string }): Promise<CompanyCertification> =>
  authPatch(`/panel/certifications/${id}`, body)

export const deleteCertification = (id: string): Promise<{ ok: boolean }> =>
  authDelete(`/panel/certifications/${id}`)

export const uploadCertificationDoc = (certId: string, file: File): Promise<CompanyCertification> =>
  authUpload(`/panel/certifications/${certId}/document`, file)

export const fetchProjects = (): Promise<CompanyProject[]> =>
  authGet('/panel/projects')

export const createProject = (body: { title: string; description?: string; clientName?: string; year?: number }): Promise<CompanyProject> =>
  authPost('/panel/projects', body)

export const updateProject = (id: string, body: { title: string; description?: string; clientName?: string; year?: number }): Promise<CompanyProject> =>
  authPatch(`/panel/projects/${id}`, body)

export const deleteProject = (id: string): Promise<{ ok: boolean }> =>
  authDelete(`/panel/projects/${id}`)

export const uploadProjectImage = (projectId: string, file: File): Promise<{ id: string; url: string }> =>
  authUpload(`/panel/projects/${projectId}/images`, file)

export const deleteProjectImage = (projectId: string, imgId: string): Promise<{ ok: boolean }> =>
  authDelete(`/panel/projects/${projectId}/images/${imgId}`)

// ── Public media ──────────────────────────────────────────────────────────────

export const fetchCompanyCertifications = (slug: string): Promise<CompanyCertification[]> =>
  get(`/companies/${slug}/certifications`)

export const fetchCompanyProjects = (slug: string): Promise<CompanyProject[]> =>
  get(`/companies/${slug}/projects`)

// ── Admin (JWT protected) ──────────────────────────────────────────────────

export const fetchAdminRegistrations = (status?: 'pending' | 'approved' | 'rejected'): Promise<AdminRegistration[]> => {
  const qs = status ? `?status=${status}` : ''
  return authGet(`/admin/registrations${qs}`, 'adminToken')
}

export const approveRegistration = (id: string): Promise<AdminApprovalResponse> =>
  authPost(`/admin/registrations/${id}/approve`, {}, 'adminToken')

export const rejectRegistration = (id: string): Promise<ProviderRegistrationResponse> =>
  authPost(`/admin/registrations/${id}/reject`, {}, 'adminToken')

export const deleteApprovedCompany = (id: string): Promise<{ ok: boolean }> =>
  authDelete(`/admin/registrations/${id}/company`, 'adminToken')
