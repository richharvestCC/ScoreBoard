import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Use navigation event instead of window.location.href
        const navigationEvent = new CustomEvent('forceNavigate', {
          detail: { path: '/auth' }
        });
        window.dispatchEvent(navigationEvent);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
};

// Club API calls
export const clubAPI = {
  create: (clubData) => api.post('/clubs', clubData),
  getById: (id) => api.get(`/clubs/${id}`),
  getAll: (params) => api.get('/clubs', { params }),
  update: (id, clubData) => api.put(`/clubs/${id}`, clubData),
  delete: (id) => api.delete(`/clubs/${id}`),
  join: (id) => api.post(`/clubs/${id}/join`),
  getMembers: (id) => api.get(`/clubs/${id}/members`),
};

// Match API calls
export const matchAPI = {
  create: (matchData) => api.post('/matches', matchData),
  getById: (id) => api.get(`/matches/${id}`),
  getAll: (params) => api.get('/matches', { params }),
  update: (id, matchData) => api.put(`/matches/${id}`, matchData),
  delete: (id) => api.delete(`/matches/${id}`),
  addEvent: (id, eventData) => api.post(`/matches/${id}/events`, eventData),
  getEvents: (id) => api.get(`/matches/${id}/events`),
};

export default api;