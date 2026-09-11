const TOKEN_KEY = 'hiveledger_token';
const USER_KEY = 'hiveledger_user';

export type User = {
  id: number;
  username: string;
  role: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `请求失败 (${res.status})`);
  }
  return data as T;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<User>('/api/auth/me'),
  dashboard: () =>
    request<{
      hiveTotal: number;
      monthInspections: number;
      quarantineHives: number;
      recentHarvestKg: number;
    }>('/api/dashboard'),
  getApiaries: () => request<any[]>('/api/apiaries'),
  createApiary: (body: unknown) =>
    request('/api/apiaries', { method: 'POST', body: JSON.stringify(body) }),
  updateApiary: (id: number, body: unknown) =>
    request(`/api/apiaries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteApiary: (id: number) =>
    request(`/api/apiaries/${id}`, { method: 'DELETE' }),
  getHives: () => request<any[]>('/api/hives'),
  createHive: (body: unknown) =>
    request('/api/hives', { method: 'POST', body: JSON.stringify(body) }),
  updateHive: (id: number, body: unknown) =>
    request(`/api/hives/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteHive: (id: number) =>
    request(`/api/hives/${id}`, { method: 'DELETE' }),
  getInspections: () => request<any[]>('/api/inspections'),
  createInspection: (body: unknown) =>
    request('/api/inspections', { method: 'POST', body: JSON.stringify(body) }),
  updateInspection: (id: number, body: unknown) =>
    request(`/api/inspections/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteInspection: (id: number) =>
    request(`/api/inspections/${id}`, { method: 'DELETE' }),
  getHarvests: () => request<any[]>('/api/harvests'),
  createHarvest: (body: unknown) =>
    request('/api/harvests', { method: 'POST', body: JSON.stringify(body) }),
  updateHarvest: (id: number, body: unknown) =>
    request(`/api/harvests/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteHarvest: (id: number) =>
    request(`/api/harvests/${id}`, { method: 'DELETE' }),
};

export function saveAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function loadUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function loadToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
