export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  color: string;
  players: Player[];
}

export interface MatchEventCoordinates {
  x: number;
  y: number;
  zone: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  assistPlayerId?: string | null;
  eventType: string;
  coordinates: MatchEventCoordinates;
  period: number;
  minute: number;
  description?: string;
  createdAt?: string;
  metadata?: {
    violationType?: string;
    warning?: boolean;
    ejection?: boolean;
    homeTeamEvent?: boolean;
    freeKickType?: 'direct' | 'indirect';
    kicker?: string;
    lastTouch?: string;
    attacker?: string;
    defender?: string;
    timeCapture?: string;
  };
}
