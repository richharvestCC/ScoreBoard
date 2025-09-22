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

        // Use global navigation utility instead of window.location.href
        const { globalNavigateToAuth } = await import('../contexts/NavigationContext');
        globalNavigateToAuth();
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
  join: (id, memberData) => api.post(`/clubs/${id}/join`, memberData),
  leave: (id) => api.post(`/clubs/${id}/leave`),
  getMembers: (id, params) => api.get(`/clubs/${id}/members`, { params }),
  updateMember: (id, memberId, memberData) => api.put(`/clubs/${id}/members/${memberId}`, memberData),
  removeMember: (id, memberId) => api.delete(`/clubs/${id}/members/${memberId}`)
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

// Tournament API calls
export const tournamentAPI = {
  create: (tournamentData) => api.post('/tournaments', tournamentData),
  getById: (id) => api.get(`/tournaments/${id}`),
  getAll: (params) => api.get('/tournaments', { params }),
  update: (id, tournamentData) => api.put(`/tournaments/${id}`, tournamentData),
  delete: (id) => api.delete(`/tournaments/${id}`),
  join: (id, participantData) => api.post(`/tournaments/${id}/join`, participantData),
  leave: (id) => api.post(`/tournaments/${id}/leave`),
  getParticipants: (id, params) => api.get(`/tournaments/${id}/participants`, { params }),
  getMatches: (id) => api.get(`/tournaments/${id}/matches`),
};

// Competition API calls
export const competitionAPI = {
  create: (competitionData) => api.post('/competitions', competitionData),
  getById: (id) => api.get(`/competitions/${id}`),
  getAll: (params) => api.get('/competitions', { params }),
  update: (id, competitionData) => api.put(`/competitions/${id}`, competitionData),
  delete: (id) => api.delete(`/competitions/${id}`),
  updateStatus: (id, status) => api.patch(`/competitions/${id}/status`, { status }),
  getTemplates: () => api.get('/competitions/templates'),
  getActive: () => api.get('/competitions/active'),
  getUserCompetitions: (role) => api.get('/competitions/my', { params: { role } }),
  createFromTemplate: (templateId, competitionData) => api.post(`/competitions/from-template/${templateId}`, competitionData),
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  getUserActivity: (id) => api.get(`/admin/users/${id}/activity`),
  getSystemStatus: () => api.get('/admin/system/status'),
};

export default api;