import { Request } from 'express';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: number;
  user_id: string;
  email: string;
  name: string;
  birthdate?: string;
  gender?: 'M' | 'F' | 'OTHER';
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  user_id: string;
  email: string;
  password: string;
  name: string;
  birthdate?: string;
  gender?: 'M' | 'F' | 'OTHER';
  phone_number?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Club Types
export type ClubType = 'general' | 'pro' | 'youth' | 'national';

export interface Club {
  id: number;
  name: string;
  club_type: ClubType;
  description?: string;
  location?: string;
  founded_year?: number;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClubData {
  name: string;
  club_type?: ClubType;
  description?: string;
  location?: string;
  founded_year?: number;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
}

// Club Member Types
export type MemberRole = 'admin' | 'player' | 'coach' | 'staff';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'injured';
export type PlayerPosition =
  | 'goalkeeper' | 'defender' | 'midfielder' | 'forward'
  | 'center_back' | 'left_back' | 'right_back' | 'defensive_midfielder'
  | 'central_midfielder' | 'attacking_midfielder' | 'left_winger'
  | 'right_winger' | 'striker' | 'center_forward';

export interface ClubMember {
  id: number;
  club_id: number;
  user_id: number;
  role: MemberRole;
  jersey_number?: number;
  position?: PlayerPosition;
  status: MemberStatus;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

// Match Types
export type MatchType = 'friendly' | 'league' | 'cup' | 'tournament';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type TournamentStage = 'group' | 'round_of_16' | 'quarter' | 'semi' | 'final' | 'regular_season' | 'playoff';

export interface Match {
  id: number;
  home_club_id: number;
  away_club_id: number;
  match_type: MatchType;
  match_date: string;
  venue?: string;
  status: MatchStatus;
  home_score: number;
  away_score: number;
  duration_minutes?: number;
  referee?: string;
  weather_conditions?: string;
  notes?: string;
  created_by: number;
  tournament_id?: number;
  stage?: TournamentStage;
  round?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMatchData {
  home_club_id: number;
  away_club_id: number;
  match_type?: MatchType;
  match_date: string;
  venue?: string;
  duration_minutes?: number;
  referee?: string;
  weather_conditions?: string;
  notes?: string;
  tournament_id?: number;
  stage?: TournamentStage;
  round?: number;
}

// Match Event Types
export type MatchEventType =
  | 'GOAL' | 'ASSIST' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION'
  | 'OFFSIDE' | 'FOUL' | 'CORNER' | 'THROW_IN' | 'FREE_KICK'
  | 'PENALTY' | 'SAVE' | 'MATCH_START' | 'MATCH_END' | 'HALF_TIME';

export type TeamSide = 'home' | 'away';

export interface MatchEvent {
  id: number;
  match_id: number;
  event_type: MatchEventType;
  player_id?: number;
  team_side?: TeamSide;
  minute?: number;
  extra_time_minute?: number;
  position_x?: number;
  position_y?: number;
  description?: string;
  related_player_id?: number;
  sequence_number: number;
  is_video_available: boolean;
  recorded_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMatchEventData {
  event_type: MatchEventType;
  player_id?: number;
  team_side?: TeamSide;
  minute?: number;
  extra_time_minute?: number;
  position_x?: number;
  position_y?: number;
  description?: string;
  related_player_id?: number;
  is_video_available?: boolean;
}

// Tournament Types
export type TournamentType = 'league' | 'tournament';
export type TournamentFormat = 'round_robin' | 'knockout' | 'mixed';
export type TournamentLevel = 'local' | 'national' | 'international';
export type TournamentStatus = 'draft' | 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';

export interface Tournament {
  id: number;
  name: string;
  tournament_type: TournamentType;
  format: TournamentFormat;
  has_group_stage: boolean;
  level: TournamentLevel;
  start_date?: string;
  end_date?: string;
  description?: string;
  max_participants?: number;
  entry_fee?: number;
  prize_description?: string;
  rules?: string;
  is_public: boolean;
  status: TournamentStatus;
  organization_id?: number;
  admin_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTournamentData {
  name: string;
  tournament_type: TournamentType;
  format?: TournamentFormat;
  has_group_stage?: boolean;
  level?: TournamentLevel;
  start_date?: string;
  end_date?: string;
  description?: string;
  max_participants?: number;
  entry_fee?: number;
  prize_description?: string;
  rules?: string;
  is_public?: boolean;
}

// Tournament Participant Types
export type ParticipantType = 'user' | 'club';

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  participant_id: number;
  participant_type: ParticipantType;
  group_assignment?: string;
  seed_number?: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  status: 'active' | 'eliminated' | 'withdrawn';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

// Statistics Types
export interface TeamStatistics {
  club_id: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  win_rate: number;
  points?: number;
}

export interface PlayerStatistics {
  player_id: number;
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
}

// Request Types for Express
export interface AuthenticatedRequest extends Request {
  user?: User;
  correlationId?: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: ValidationError[];
}

// Logger Types
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';