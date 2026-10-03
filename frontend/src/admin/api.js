/**
 * Admin API client — thin wrapper around fetch.
 * All requests go to VITE_API_BASE_URL (defaults to /api).
 * The JWT is stored in localStorage as a fallback when cookies are blocked.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken() {
  return localStorage.getItem('adminToken');
}

function setToken(token) {
  if (token) localStorage.setItem('adminToken', token);
  else localStorage.removeItem('adminToken');
}

async function request(method, path, body, options = {}) {
  const token = getToken();
  const headers = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...options,
  });

  // For CSV exports — return the raw response
  if (options.raw) return res;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login: async (email, password) => {
    const data = await request('POST', '/admin/login', { email, password });
    setToken(data.token);
    return data;
  },
  logout: async () => {
    await request('POST', '/admin/logout');
    setToken(null);
  },
  me: () => request('GET', '/admin/me'),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboard = {
  get: (weddingId) => request('GET', `/admin/dashboard?weddingId=${weddingId}`),
};

// ── RSVPs ─────────────────────────────────────────────────────────────────────
async function downloadCsv(path, filename) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const rsvps = {
  list: (weddingId, params = {}) => {
    const q = new URLSearchParams({ weddingId, ...params }).toString();
    return request('GET', `/admin/rsvps?${q}`);
  },
  export: (weddingId) => downloadCsv(`/admin/rsvps/export?weddingId=${weddingId}`, 'rsvps.csv'),
};

// ── Donations ─────────────────────────────────────────────────────────────────
export const donations = {
  list: (weddingId, params = {}) => {
    const q = new URLSearchParams({ weddingId, ...params }).toString();
    return request('GET', `/admin/donations?${q}`);
  },
  export: (weddingId) => downloadCsv(`/admin/donations/export?weddingId=${weddingId}`, 'donations.csv'),
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settings = {
  get: (weddingId) => request('GET', `/admin/settings?weddingId=${weddingId}`),
  update: (weddingId, data) =>
    request('PATCH', `/admin/settings?weddingId=${weddingId}`, data),
};

// ── Gallery ───────────────────────────────────────────────────────────────────
export const gallery = {
  list: (weddingId) => request('GET', `/admin/gallery?weddingId=${weddingId}`),
  upload: (weddingId, file, meta = {}) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('weddingId', weddingId);
    if (meta.alt) fd.append('alt', meta.alt);
    if (meta.caption) fd.append('caption', meta.caption);
    return request('POST', `/admin/gallery/upload?weddingId=${weddingId}`, fd);
  },
  update: (weddingId, imageId, data) =>
    request('PATCH', `/admin/gallery/${imageId}?weddingId=${weddingId}`, data),
  delete: (weddingId, imageId) =>
    request('DELETE', `/admin/gallery/${imageId}?weddingId=${weddingId}`),
  reorder: (weddingId, order) =>
    request('POST', `/admin/gallery/reorder?weddingId=${weddingId}`, { order }),
};
