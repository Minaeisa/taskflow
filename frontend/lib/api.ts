import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const workspacesApi = {
  create: (data: { name: string; description?: string }) =>
    api.post('/workspaces', data),
  list: () => api.get('/workspaces'),
  get: (id: string) => api.get(`/workspaces/${id}`),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
};

export const projectsApi = {
  create: (data: { name: string; description?: string; color?: string; workspaceId: string }) =>
    api.post('/projects', data),
  list: (workspaceId: string) => api.get(`/projects?workspaceId=${workspaceId}`),
  get: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: Partial<{ name: string; description: string; color: string }>) =>
    api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  stats: (workspaceId: string) => api.get(`/projects/stats?workspaceId=${workspaceId}`),
};

export const tasksApi = {
  create: (data: {
    title: string; description?: string; status?: string;
    priority?: string; projectId: string; assigneeId?: string;
    dueDate?: string; tags?: string[];
  }) => api.post('/tasks', data),
  list: (projectId: string) => api.get(`/tasks?projectId=${projectId}`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  stats: (projectId: string) => api.get(`/tasks/stats?projectId=${projectId}`),
};

export default api;
