/**
 * Direct API client for test setup/teardown.
 * Bypasses the Vite proxy and calls the backend directly at localhost:8080.
 */
import { API_BASE_URL } from '../fixtures/test-data'

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${path}`, options)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? res.statusText)
  return json.data !== undefined ? json.data : json
}

export async function apiLogin(email: string, password: string): Promise<string> {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return data.token ?? data.data?.token
}

export async function apiGetPanelServices(token: string): Promise<Array<{ id: string; name: string }>> {
  return apiFetch('/panel/services', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function apiDeleteService(token: string, id: string): Promise<void> {
  await apiFetch(`/panel/services/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function apiGetPanelQuotes(token: string): Promise<Array<{ id: string; status: string }>> {
  return apiFetch('/panel/quotes', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function apiUpdateQuoteStatus(token: string, id: string, status: string): Promise<void> {
  await apiFetch(`/panel/quotes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
}

export async function apiGetPanelProfile(token: string): Promise<Record<string, unknown>> {
  return apiFetch('/panel/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function apiUpdateProfile(token: string, body: Record<string, unknown>): Promise<void> {
  await apiFetch('/panel/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}
