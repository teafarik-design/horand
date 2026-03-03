import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Companies
export const companiesApi = {
  list: () => api.get('/companies'),
  get: (id: string) => api.get(`/companies/${id}`),
  create: (data: { name: string; type: string }) => api.post('/companies', data),
  update: (id: string, data: { name?: string; type?: string }) => api.patch(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
};

// Partners
export const partnersApi = {
  list: (companyId: string) => api.get(`/companies/${companyId}/partners`),
  create: (companyId: string, data: FormData) => api.post(`/companies/${companyId}/partners`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (companyId: string, id: string, data: FormData) => api.patch(`/companies/${companyId}/partners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (companyId: string, id: string) => api.delete(`/companies/${companyId}/partners/${id}`),
};

// Revenue rules
export const revenueApi = {
  list: (companyId: string) => api.get(`/companies/${companyId}/revenue-rules`),
  create: (companyId: string, data: any) => api.post(`/companies/${companyId}/revenue-rules`, data),
  update: (companyId: string, id: string, data: any) => api.patch(`/companies/${companyId}/revenue-rules/${id}`, data),
  delete: (companyId: string, id: string) => api.delete(`/companies/${companyId}/revenue-rules/${id}`),
};

// Agreements
export const agreementsApi = {
  generate: (companyId: string) => api.post(`/companies/${companyId}/agreements/generate`),
  list: (companyId: string) => api.get(`/companies/${companyId}/agreements`),
  exportPdf: (companyId: string, id: string, signature?: string) => api.post(`/companies/${companyId}/agreements/${id}/export-pdf`, { signature }),
};
