/**
 * Competition Types for MatchCard Dashboard Components
 * Material Design 3 + React 18 + TypeScript
 */

// Base Types
export type CompetitionType = 'league' | 'tournament' | 'group_tournament';
export type CompetitionStatus = 'draft' | 'registration' | 'active' | 'completed';
export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type MatchType = 'friendly' | 'league' | 'cup' | 'tournament' | 'group';

// Core Entities
export interface Competition {
  id: string;
  title: string;
  type: CompetitionType;
  status: CompetitionStatus;
  teamCount: number;
  groupStageEnabled: boolean;
  teamsPerGroup?: number;
  qualifiersPerGroup?: number;
  adminUserId: string;
  createdAt: Date;
  updatedAt: Date;
  startDate?: Date;
  endDate?: Date;
}

export interface Team {
  id: string;
  name: string;
  seed: number;
  groupId?: string;
  isActive: boolean;
  logoUrl?: string;
  clubId?: string;
}

export interface Match {
  id: string;
  competitionId: string;
  round: number;
  position: number;
  team1?: Team;
  team2?: Team;
  score1?: number;
  score2?: number;
  winner?: Team;
  status: MatchStatus;
  type: MatchType;
  isGroupMatch: boolean;
  groupId?: string;
  nextMatchId?: string;
  matchDate?: Date;
}

export interface Group {
  id: string;
  name: string;
  competitionId: string;
  teams: Team[];
  matches: Match[];
  standings: GroupStanding[];
}

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position: number;
}

// Component Props Types
export interface CompetitionCreationConfig {
  title: string;
  type: CompetitionType;
  teamCount: number;
  teamNames?: string[];
  groupStageEnabled: boolean;
  teamsPerGroup?: number;
  qualifiersPerGroup?: number;
  adminUserId: string;
  isCloneMode?: boolean;
  sourceId?: string;
}

export interface CompetitionDashboardProps {
  competition?: Competition;
  onCompetitionSelect: (competition: Competition) => void;
  onCompetitionCreate: (config: CompetitionCreationConfig) => void;
}

export interface CompetitionBracketProps {
  competition: Competition;
  matches: Match[];
  onMatchUpdate: (matchId: string, winner: Team, score?: string) => void;
  zoomEnabled?: boolean;
  onZoomChange?: (scale: number) => void;
}

export interface GroupStageProps {
  groups: Group[];
  onMatchUpdate: (matchId: string, score1: number, score2: number) => void;
  onStandingsUpdate: (groupId: string) => void;
}

// UI State Types
export interface CompetitionUIState {
  currentCompetition?: Competition;
  selectedTab: 'groups' | 'bracket';
  isCreationModalOpen: boolean;
  isCloneMode: boolean;
  zoomLevel: number;
  viewportDimensions: {
    width: number;
    height: number;
  };
}

export interface BracketDimensions {
  width: number;
  height: number;
  rounds: number;
  matchHeight: number;
  matchWidth: number;
  roundSpacing: number;
  matchSpacing: number;
}

export interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
  isDragging: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface CompetitionListResponse extends ApiResponse {
  data: {
    competitions: Competition[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface CompetitionDetailResponse extends ApiResponse {
  data: {
    competition: Competition;
    teams: Team[];
    matches: Match[];
    groups?: Group[];
  };
}

// Event Types
export interface CompetitionEvent {
  type: 'match_completed' | 'competition_started' | 'round_completed' | 'competition_finished';
  competitionId: string;
  matchId?: string;
  data: any;
  timestamp: Date;
}

// Safety Check Types
export interface SafetyCheckResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  canProceed: boolean;
}

export interface CompetitionValidation {
  titleValid: boolean;
  teamCountValid: boolean;
  groupConfigValid: boolean;
  dateRangeValid: boolean;
  overallValid: boolean;
}

// Responsive Design Types
export type DeviceType = 'desktop' | 'tablet-landscape' | 'tablet-portrait' | 'mobile';
export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface ResponsiveConfig {
  device: DeviceType;
  breakpoint: BreakpointKey;
  isTouchDevice: boolean;
  supportsHover: boolean;
  orientation: 'landscape' | 'portrait';
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface ModalAnimationState {
  phase: 'closed' | 'opening' | 'open' | 'expanding' | 'expanded' | 'closing';
  progress: number;
}

// Utility Types
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CreateCompetitionData = RequiredKeys<
  Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>,
  'title' | 'type' | 'teamCount' | 'adminUserId'
>;

export type UpdateCompetitionData = OptionalKeys<
  Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>,
  'title' | 'type' | 'teamCount'
>;

// Legacy Types (Tournament → Competition) - Deprecated
export type TournamentType = CompetitionType;
export type TournamentStatus = CompetitionStatus;
export interface Tournament extends Competition {}
export interface TournamentCreationConfig extends CompetitionCreationConfig {}
export interface TournamentDashboardProps extends CompetitionDashboardProps {}
export interface TournamentBracketProps extends CompetitionBracketProps {}
export interface TournamentUIState extends CompetitionUIState {}
export interface TournamentListResponse extends CompetitionListResponse {}
export interface TournamentDetailResponse extends CompetitionDetailResponse {}
export interface TournamentEvent extends CompetitionEvent {}
export interface TournamentValidation extends CompetitionValidation {}
export type CreateTournamentData = CreateCompetitionData;
export type UpdateTournamentData = UpdateCompetitionData;