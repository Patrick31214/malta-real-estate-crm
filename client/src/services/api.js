const API_BASE = '/api';

// Store tokens in localStorage
const getAccessToken = () => localStorage.getItem('accessToken');
const setTokens = (access, refresh) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Core fetch wrapper
async function request(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    // Try to refresh token
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${getAccessToken()}`
      };
      const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers: retryHeaders });
      return retryRes.json();
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return res.json();
}

async function tryRefreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await res.json();
    if (data.success) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Auth
export const auth = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    clearTokens();
    return request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
  },

  setTokens,
  clearTokens,

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),

  isAuthenticated: () => !!getAccessToken()
};

// Properties
export const properties = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/properties${qs ? '?' + qs : ''}`);
  },
  getOne: (id) => request(`/properties/${id}`),
  create: (data) => request('/properties', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  approve: (id, status) => request(`/properties/${id}/approve`, { method: 'PUT', body: JSON.stringify({ status }) }),
  delete: (id) => request(`/properties/${id}`, { method: 'DELETE' })
};

// Owners
export const owners = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/owners${qs ? '?' + qs : ''}`);
  },
  getOne: (id) => request(`/owners/${id}`),
  create: (data) => request('/owners', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/owners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/owners/${id}`, { method: 'DELETE' })
};

// Inquiries
export const inquiries = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/inquiries${qs ? '?' + qs : ''}`);
  },
  getOne: (id) => request(`/inquiries/${id}`),
  create: (data) => request('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/inquiries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/inquiries/${id}`, { method: 'DELETE' })
};

// Agents
export const agents = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/agents${qs ? '?' + qs : ''}`);
  },
  getOne: (id) => request(`/agents/${id}`),
  create: (data) => request('/agents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/agents/${id}`, { method: 'DELETE' }),
  block: (id, blocked) => request(`/agents/${id}/block`, { method: 'PUT', body: JSON.stringify({ blocked }) })
};

// Activity Logs (admin/manager only)
export const activityLogs = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/activity-logs${qs ? '?' + qs : ''}`);
  }
};

// Public listings (no auth required)
export const listings = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/listings${qs ? '?' + qs : ''}`)
      .then(r => r.json());
  },
  getOne: (id) => fetch(`${API_BASE}/listings/${id}`).then(r => r.json())
};

// Public services (no auth required)
export const servicesPublic = {
  getPublic: (category) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return fetch(`${API_BASE}/services/public${qs}`).then(r => r.json());
  }
};

// CRM services (auth required)
export const services = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/services${qs ? '?' + qs : ''}`);
  },
  getOne: (id) => request(`/services/${id}`),
  create: (data) => request('/services', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/services/${id}`, { method: 'DELETE' }),
};

// File upload
export const upload = {
  files: async (fileList) => {
    const formData = new FormData();
    Array.from(fileList).forEach(f => formData.append('files', f));
    const token = localStorage.getItem('accessToken');
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    return res.json();
  }
};

export default { auth, properties, owners, inquiries, agents, listings, activityLogs, services, upload };
