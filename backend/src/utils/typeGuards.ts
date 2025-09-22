import {
  User,
  Club,
  Match,
  MatchEvent,
  Tournament,
  TournamentParticipant,
  ClubMember,
  LogLevel
} from '../types/api';

// Type guard utility functions for runtime type checking

/**
 * Type guard for LogLevel
 */
export function isLogLevel(value: any): value is LogLevel {
  return typeof value === 'string' &&
    ['error', 'warn', 'info', 'debug'].includes(value);
}

/**
 * Type guard for User
 */
export function isUser(obj: any): obj is User {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.user_id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.is_active === 'boolean';
}

/**
 * Type guard for Club
 */
export function isClub(obj: any): obj is Club {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.club_type === 'string' &&
    typeof obj.is_active === 'boolean' &&
    typeof obj.created_by === 'number';
}

/**
 * Type guard for Match
 */
export function isMatch(obj: any): obj is Match {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.home_club_id === 'number' &&
    typeof obj.away_club_id === 'number' &&
    typeof obj.match_type === 'string' &&
    typeof obj.match_date === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.home_score === 'number' &&
    typeof obj.away_score === 'number';
}

/**
 * Type guard for MatchEvent
 */
export function isMatchEvent(obj: any): obj is MatchEvent {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.match_id === 'number' &&
    typeof obj.event_type === 'string' &&
    typeof obj.sequence_number === 'number' &&
    typeof obj.is_video_available === 'boolean' &&
    typeof obj.recorded_by === 'number';
}

/**
 * Type guard for Tournament
 */
export function isTournament(obj: any): obj is Tournament {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.tournament_type === 'string' &&
    typeof obj.format === 'string' &&
    typeof obj.level === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.is_public === 'boolean' &&
    typeof obj.admin_user_id === 'number';
}

/**
 * Type guard for ClubMember
 */
export function isClubMember(obj: any): obj is ClubMember {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.club_id === 'number' &&
    typeof obj.user_id === 'number' &&
    typeof obj.role === 'string' &&
    typeof obj.status === 'string';
}

/**
 * Type guard for email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Type guard for phone number validation
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\-\s]+$/;
  return phoneRegex.test(phone);
}

/**
 * Type guard for jersey number validation
 */
export function isValidJerseyNumber(number: number): boolean {
  return Number.isInteger(number) && number >= 1 && number <= 99;
}

/**
 * Type guard for match score validation
 */
export function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0;
}

/**
 * Type guard for match minute validation
 */
export function isValidMatchMinute(minute: number): boolean {
  return Number.isInteger(minute) && minute >= 0 && minute <= 200;
}

/**
 * Type guard for field position validation (0-100 range)
 */
export function isValidFieldPosition(position: number): boolean {
  return typeof position === 'number' && position >= 0 && position <= 100;
}

/**
 * Utility function to safely parse JSON with type checking
 */
export function safeParse<T>(
  json: string,
  typeGuard: (obj: any) => obj is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    return typeGuard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Type assertion utility for array validation
 */
export function isArrayOf<T>(
  arr: any,
  typeGuard: (item: any) => item is T
): arr is T[] {
  return Array.isArray(arr) && arr.every(typeGuard);
}

/**
 * Utility for checking if value is defined and not null
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Utility for checking if string is not empty
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Utility for checking if value is a positive integer
 */
export function isPositiveInteger(value: any): value is number {
  return Number.isInteger(value) && value > 0;
}

/**
 * Utility for checking if value is a non-negative integer
 */
export function isNonNegativeInteger(value: any): value is number {
  return Number.isInteger(value) && value >= 0;
}