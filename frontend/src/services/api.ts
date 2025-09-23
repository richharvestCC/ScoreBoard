import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  user_id?: string;
}

interface ClubData {
  id?: string;
  name: string;
  description?: string;
  type: 'pro' | 'youth' | 'univ' | 'org';
  location?: string;
  founded_year?: number;
}

interface MemberData {
  role: 'admin' | 'player' | 'coach' | 'staff';
  jersey_number?: number;
  position?: string;
}

interface MatchData {
  id?: string;
  home_club_id: string;
  away_club_id: string;
  tournament_id?: string;
  scheduled_time: string;
  venue?: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
}

interface MatchEvent {
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  minute: number;
  player_id: string;
  description?: string;
}

interface TournamentData {
  id?: string;
  name: string;
  description?: string;
  type: 'league' | 'tournament' | 'cup' | 'mixed';
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  max_participants?: number;
}

interface ParticipantData {
  club_id: string;
  entry_fee_paid?: boolean;
}

// Query Parameters Types
interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  [key: string]: any;
}

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
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
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
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post<ApiResponse<AuthResponse>>(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          if (original.headers) {
            original.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(original);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Use global navigation utility with error handling
        try {
          const { globalNavigateToAuth } = await import('../contexts/NavigationContext');
          globalNavigateToAuth();
        } catch (navError) {
          // Fallback for critical navigation failure
          window.location.href = '/auth';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData: Partial<User> & { password: string }): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/login', credentials),

  logout: (): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.post('/auth/logout'),

  getProfile: (): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.get('/auth/profile'),

  refreshToken: (refreshToken: string): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/refresh-token', { refreshToken }),
};

// Club API calls
export const clubAPI = {
  create: (clubData: ClubData): Promise<AxiosResponse<ApiResponse<ClubData>>> =>
    api.post('/clubs', clubData),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<ClubData>>> =>
    api.get(`/clubs/${id}`),

  getAll: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<ClubData[]>>> =>
    api.get('/clubs', { params }),

  update: (id: string, clubData: Partial<ClubData>): Promise<AxiosResponse<ApiResponse<ClubData>>> =>
    api.put(`/clubs/${id}`, clubData),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete(`/clubs/${id}`),

  join: (id: string, memberData: MemberData): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.post(`/clubs/${id}/join`, memberData),

  leave: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.post(`/clubs/${id}/leave`),

  getMembers: (id: string, params?: QueryParams): Promise<AxiosResponse<ApiResponse<any[]>>> =>
    api.get(`/clubs/${id}/members`, { params }),

  updateMember: (id: string, memberId: string, memberData: Partial<MemberData>): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.put(`/clubs/${id}/members/${memberId}`, memberData),

  removeMember: (id: string, memberId: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete(`/clubs/${id}/members/${memberId}`)
};

// Match API calls
export const matchAPI = {
  create: (matchData: MatchData): Promise<AxiosResponse<ApiResponse<MatchData>>> =>
    api.post('/matches', matchData),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<MatchData>>> =>
    api.get(`/matches/${id}`),

  getAll: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<MatchData[]>>> =>
    api.get('/matches', { params }),

  update: (id: string, matchData: Partial<MatchData>): Promise<AxiosResponse<ApiResponse<MatchData>>> =>
    api.put(`/matches/${id}`, matchData),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete(`/matches/${id}`),

  addEvent: (id: string, eventData: MatchEvent): Promise<AxiosResponse<ApiResponse<MatchEvent>>> =>
    api.post(`/matches/${id}/events`, eventData),

  getEvents: (id: string): Promise<AxiosResponse<ApiResponse<MatchEvent[]>>> =>
    api.get(`/matches/${id}/events`),
};

// Tournament API calls
export const tournamentAPI = {
  create: (tournamentData: TournamentData): Promise<AxiosResponse<ApiResponse<TournamentData>>> =>
    api.post('/tournaments', tournamentData),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<TournamentData>>> =>
    api.get(`/tournaments/${id}`),

  getAll: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<TournamentData[]>>> =>
    api.get('/tournaments', { params }),

  update: (id: string, tournamentData: Partial<TournamentData>): Promise<AxiosResponse<ApiResponse<TournamentData>>> =>
    api.put(`/tournaments/${id}`, tournamentData),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete(`/tournaments/${id}`),

  join: (id: string, participantData: ParticipantData): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.post(`/tournaments/${id}/join`, participantData),

  leave: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.post(`/tournaments/${id}/leave`),

  getParticipants: (id: string, params?: QueryParams): Promise<AxiosResponse<ApiResponse<any[]>>> =>
    api.get(`/tournaments/${id}/participants`, { params }),

  getMatches: (id: string): Promise<AxiosResponse<ApiResponse<MatchData[]>>> =>
    api.get(`/tournaments/${id}/matches`),
};

export default api;