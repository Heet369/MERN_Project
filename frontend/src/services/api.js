import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.expired &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const userAPI = {
  getBlogs: (page = 1, limit = 12, search = '') =>
    api.get(`/blogs?page=${page}&limit=${limit}&search=${search}`),
  getBlogById: (id) => api.get(`/blogs/${id}`),
  toggleLike: (blogId, visitorId) =>
    api.post(`/blogs/${blogId}/like`, { visitorId }),
  addComment: (blogId, data) =>
    api.post(`/blogs/${blogId}/comment`, data),
  getComments: (blogId, page = 1) =>
    api.get(`/blogs/${blogId}/comments?page=${page}`),
  trackShare: (blogId) =>
    api.post(`/blogs/${blogId}/share`),
};

export const adminAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),

  getAll: (page = 1, limit = 10) =>
    api.get(`/blogs/admin/my-blogs?page=${page}&limit=${limit}`),
  getOne: (id) => api.get(`/blogs/${id}`),
  create: (formData) =>
    api.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/blogs/${id}`),
  getStats: () => api.get('/blogs/stats/overview'),
};

export const authAPI = adminAPI;
export const blogAPI = {
  getAll: userAPI.getBlogs,
  getOne: userAPI.getBlogById,
  create: adminAPI.create,
  update: adminAPI.update,
  delete: adminAPI.delete,
  getStats: adminAPI.getStats,
};
export const interactionAPI = {
  toggleLike: userAPI.toggleLike,
  addComment: userAPI.addComment,
  getComments: userAPI.getComments,
  trackShare: userAPI.trackShare,
};

export default api;
